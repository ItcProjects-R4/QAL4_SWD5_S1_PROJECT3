// ==========================================
//  Settings Page - API Integration
//  Endpoints:
//    GET /api/SuperAdmin/settings/profile
//    PUT /api/SuperAdmin/settings/changepassword
// ==========================================

const API_BASE = 'http://localhost:5099/api';

function getToken() {
    return localStorage.getItem('token') || sessionStorage.getItem('token');
}

// ---- Load Profile ----
async function loadProfile() {
  try {
    const res = await fetch(`${API_BASE}/SuperAdmin/settings/profile`, {
      headers: { 'Authorization': `Bearer ${getToken()}` }
    });

      if (res.status === 401) { window.location.href = '../../index.html'; return; }
    if (!res.ok) throw new Error('Failed to load profile');

    const json = await res.json();
    const user = json.data ?? json;
    renderProfile(user);

  } catch (err) {
    console.error('Profile error:', err);
    showToast('Failed to load profile', 'error');
  }
}

function renderProfile(user) {
  const nameEl  = document.querySelector('[data-profile="name"]');
  const emailEl = document.querySelector('[data-profile="email"]');
  const roleEl  = document.querySelector('[data-profile="role"]');

  if (nameEl)  nameEl.textContent  = user.fullName ?? user.name ?? 'Super Admin';
  if (emailEl) emailEl.textContent = user.email ?? '-';
  if (roleEl)  roleEl.textContent  = user.role   ?? 'Super Administrator';

  // Also update sidebar footer name
  const sidebarName = document.querySelector('[data-sidebar="name"]');
  if (sidebarName) sidebarName.textContent = user.fullName ?? user.name ?? 'Super Admin';
}

// ---- Change Password ----
async function changePassword(oldPassword, newPassword) {
  const btn = document.querySelector('[data-action="change-password"]');
  if (btn) { btn.disabled = true; btn.textContent = 'Updating...'; }

  try {
    const res = await fetch(`${API_BASE}/SuperAdmin/settings/changepassword`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${getToken()}`
      },
      body: JSON.stringify({ oldPassword, newPassword })
    });

    const json = await res.json();

    if (!res.ok) {
      showToast(json.message ?? 'Password update failed', 'error');
      return;
    }

    showToast('Password updated successfully!', 'success');
    clearPasswordFields();

  } catch (err) {
    showToast('An error occurred. Please try again.', 'error');
  } finally {
    if (btn) { btn.disabled = false; btn.textContent = 'Update Password'; }
  }
}

function clearPasswordFields() {
  const oldInput = document.querySelector('[data-input="old-password"]');
  const newInput = document.querySelector('[data-input="new-password"]');
  if (oldInput) oldInput.value = '';
  if (newInput) newInput.value = '';
}

// ---- Setup Password Form ----
function setupPasswordForm() {
  const btn = document.querySelector('[data-action="change-password"]');
  if (!btn) return;

  btn.addEventListener('click', () => {
    const oldInput = document.querySelector('[data-input="old-password"]');
    const newInput = document.querySelector('[data-input="new-password"]');

    const oldPassword = oldInput?.value?.trim();
    const newPassword = newInput?.value?.trim();

    if (!oldPassword) { showToast('Please enter your current password', 'error'); return; }
    if (!newPassword) { showToast('Please enter a new password', 'error'); return; }
    if (newPassword.length < 6) { showToast('New password must be at least 6 characters', 'error'); return; }
    if (oldPassword === newPassword) { showToast('New password must be different from current', 'error'); return; }

    changePassword(oldPassword, newPassword);
  });
}

// ---- Toast ----
function showToast(message, type = 'info') {
  const colors = { error: 'bg-red-600', success: 'bg-emerald-600', info: 'bg-slate-700' };
  const toast = document.createElement('div');
  toast.className = `fixed bottom-6 right-6 z-[999] px-5 py-3 rounded-xl text-white text-sm font-semibold shadow-lg ${colors[type]}`;
  toast.textContent = message;
  document.body.appendChild(toast);
  setTimeout(() => toast.remove(), 3500);
}

// ---- Init ----
document.addEventListener('DOMContentLoaded', () => {
  loadProfile();
  setupPasswordForm();
});
