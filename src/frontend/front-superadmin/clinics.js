// ==========================================
//  Clinics Management Page - API Integration
//  Endpoints:
//    GET    /api/SuperAdmin/tenants
//    GET    /api/SuperAdmin/tenants/{id}
//    PUT    /api/SuperAdmin/tenants/{id}/toggle
//    DELETE /api/SuperAdmin/tenants/{id}
// ==========================================

const API_BASE = 'http://localhost:5099/api';

function getToken() {
    return localStorage.getItem('token') || sessionStorage.getItem('token');
}

// ---- State ----
let allClinics = [];
let currentPage = 1;
const PAGE_SIZE = 10;

// ---- Fetch All Tenants ----
async function loadClinics() {
  try {
    const res = await fetch(`${API_BASE}/SuperAdmin/tenants`, {
      headers: { 'Authorization': `Bearer ${getToken()}` }
    });

      if (res.status === 401) { window.location.href = '../../index.html'; return; }
    if (!res.ok) throw new Error('Failed to fetch clinics');

    allClinics = await res.json();
    renderStats();
    renderTable();

  } catch (err) {
    console.error('Clinics error:', err);
    showToast('Failed to load clinics', 'error');
  }
}

// ---- Render Stats Cards ----
function renderStats() {
  const total  = allClinics.length;
  const active = allClinics.filter(c => c.isActive).length;
  const inactive = total - active;

  const totalEl   = document.querySelector('[data-stat="total"]');
  const activeEl  = document.querySelector('[data-stat="active"]');
  const pendingEl = document.querySelector('[data-stat="pending"]');

  if (totalEl)   totalEl.textContent   = total;
  if (activeEl)  activeEl.textContent  = active;
  if (pendingEl) pendingEl.textContent = inactive;
}

// ---- Render Table ----
function renderTable(filtered = null) {
  const tbody = document.querySelector('[data-table="clinics"] tbody');
  if (!tbody) return;

  const source = filtered ?? allClinics;
  const start  = (currentPage - 1) * PAGE_SIZE;
  const paged  = source.slice(start, start + PAGE_SIZE);

  if (paged.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="5" class="px-6 py-10 text-center text-slate-400 text-sm">No clinics found.</td>
      </tr>`;
    updatePagination(source.length);
    return;
  }

  tbody.innerHTML = paged.map(clinic => {
    const initials = clinic.name.split(' ').map(w => w[0]).join('').substring(0, 2).toUpperCase();
    const statusBadge = clinic.isActive
      ? `<span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-700">
           <span class="w-1.5 h-1.5 rounded-full bg-emerald-600 mr-1.5"></span>Active</span>`
      : `<span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-600">
           <span class="w-1.5 h-1.5 rounded-full bg-slate-400 mr-1.5"></span>Inactive</span>`;

    return `
      <tr class="hover:bg-slate-50 transition-colors group">
        <td class="px-6 py-4">
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center font-bold text-slate-600">${initials}</div>
            <div>
              <div class="font-semibold text-on-surface">${clinic.name}</div>
              <div class="text-xs text-secondary">ID: ${clinic.id}</div>
            </div>
          </div>
        </td>
        <td class="px-6 py-4 text-secondary">${clinic.phone ?? '-'}</td>
        <td class="px-6 py-4 text-secondary">${clinic.email ?? '-'}</td>
        <td class="px-6 py-4">${statusBadge}</td>
        <td class="px-6 py-4 text-right">
          <div class="flex items-center justify-end gap-2">
            <button onclick="viewClinic(${clinic.id})"
              class="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all" title="View Details">
              <span class="material-symbols-outlined text-lg">visibility</span>
            </button>
            <button onclick="toggleClinic(${clinic.id}, this)"
              class="p-2 text-slate-400 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-all"
              title="${clinic.isActive ? 'Deactivate' : 'Activate'}">
              <span class="material-symbols-outlined text-lg">${clinic.isActive ? 'toggle_off' : 'toggle_on'}</span>
            </button>
            <button onclick="deleteClinic(${clinic.id}, '${clinic.name.replace(/'/g, "\\'")}')"
              class="p-2 text-slate-400 hover:text-error hover:bg-red-50 rounded-lg transition-all" title="Delete">
              <span class="material-symbols-outlined text-lg">delete</span>
            </button>
          </div>
        </td>
      </tr>`;
  }).join('');

  updatePagination(source.length);
}

// ---- Pagination ----
function updatePagination(total) {
  const countEl = document.querySelector('[data-pagination="count"]');
  if (countEl) {
    const start = Math.min((currentPage - 1) * PAGE_SIZE + 1, total);
    const end   = Math.min(currentPage * PAGE_SIZE, total);
    countEl.innerHTML = `Showing <span class="font-semibold text-on-surface">${start} - ${end}</span> of <span class="font-semibold text-on-surface">${total}</span> clinics`;
  }
}

// ---- View Clinic Details (Modal) ----
async function viewClinic(id) {
  try {
    const res = await fetch(`${API_BASE}/SuperAdmin/tenants/${id}`, {
      headers: { 'Authorization': `Bearer ${getToken()}` }
    });
    if (!res.ok) throw new Error('Failed to fetch clinic');
    const clinic = await res.json();
    showClinicModal(clinic);
  } catch (err) {
    showToast('Could not load clinic details', 'error');
  }
}

function showClinicModal(clinic) {
  // Remove existing modal if any
  document.getElementById('clinic-modal')?.remove();

  const modal = document.createElement('div');
  modal.id = 'clinic-modal';
  modal.className = 'fixed inset-0 z-[200] flex items-center justify-center';
  modal.innerHTML = `
    <div class="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onclick="document.getElementById('clinic-modal').remove()"></div>
    <div class="relative bg-white w-full max-w-md rounded-xl shadow-2xl p-6 z-10">
      <div class="flex items-center justify-between mb-4">
        <h2 class="font-h2 text-h2 text-on-surface">Clinic Details</h2>
        <button onclick="document.getElementById('clinic-modal').remove()" class="p-2 hover:bg-slate-100 rounded-lg text-slate-400">
          <span class="material-symbols-outlined">close</span>
        </button>
      </div>
      <div class="space-y-3 text-sm">
        <div class="flex justify-between"><span class="text-secondary font-medium">Name</span><span class="font-semibold">${clinic.name}</span></div>
        <div class="flex justify-between"><span class="text-secondary font-medium">Email</span><span>${clinic.email ?? '-'}</span></div>
        <div class="flex justify-between"><span class="text-secondary font-medium">Phone</span><span>${clinic.phone ?? '-'}</span></div>
        <div class="flex justify-between"><span class="text-secondary font-medium">Address</span><span>${clinic.address ?? '-'}</span></div>
        <div class="flex justify-between"><span class="text-secondary font-medium">Status</span>
          <span class="${clinic.isActive ? 'text-emerald-600 font-bold' : 'text-slate-500'}">${clinic.isActive ? 'Active' : 'Inactive'}</span>
        </div>
        <div class="flex justify-between"><span class="text-secondary font-medium">Created</span>
          <span>${new Date(clinic.createdAt).toLocaleDateString()}</span>
        </div>
      </div>
    </div>`;
  document.body.appendChild(modal);
}

// ---- Toggle Clinic Status ----
async function toggleClinic(id, btn) {
  try {
    const res = await fetch(`${API_BASE}/SuperAdmin/tenants/${id}/toggle`, {
      method: 'PUT',
      headers: { 'Authorization': `Bearer ${getToken()}` }
    });
    if (!res.ok) throw new Error('Toggle failed');
    const result = await res.json();
    showToast(`Clinic ${result.isActive ? 'activated' : 'deactivated'} successfully`, 'success');
    await loadClinics(); // Refresh
  } catch (err) {
    showToast('Failed to toggle clinic status', 'error');
  }
}

// ---- Delete Clinic ----
async function deleteClinic(id, name) {
  if (!confirm(`Are you sure you want to delete "${name}"?\nThis will delete all doctors, patients, and appointments.`)) return;

  try {
    const res = await fetch(`${API_BASE}/SuperAdmin/tenants/${id}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${getToken()}` }
    });
    if (!res.ok) throw new Error('Delete failed');
    showToast(`"${name}" deleted successfully`, 'success');
    await loadClinics();
  } catch (err) {
    showToast('Failed to delete clinic', 'error');
  }
}

// ---- Filter / Search ----
function setupFilters() {
  const statusSelect = document.querySelector('[data-filter="status"]');
  const searchInput  = document.querySelector('[data-filter="search"]');
  const clearBtn     = document.querySelector('[data-filter="clear"]');

  function applyFilters() {
    let result = [...allClinics];
    const status = statusSelect?.value;
    const query  = searchInput?.value.toLowerCase().trim();

    if (status === 'Active')   result = result.filter(c => c.isActive);
    if (status === 'Inactive') result = result.filter(c => !c.isActive);
    if (query) result = result.filter(c => c.name.toLowerCase().includes(query) || c.email?.toLowerCase().includes(query));

    currentPage = 1;
    renderTable(result);
  }

  statusSelect?.addEventListener('change', applyFilters);
  searchInput?.addEventListener('input', applyFilters);
  clearBtn?.addEventListener('click', () => {
    if (statusSelect) statusSelect.value = 'All Statuses';
    if (searchInput)  searchInput.value  = '';
    currentPage = 1;
    renderTable();
  });
}

// ---- Toast ----
function showToast(message, type = 'info') {
  const colors = { error: 'bg-red-600', success: 'bg-emerald-600', info: 'bg-slate-700' };
  const toast = document.createElement('div');
  toast.className = `fixed bottom-6 right-6 z-[999] px-5 py-3 rounded-xl text-white text-sm font-semibold shadow-lg ${colors[type]} transition-all`;
  toast.textContent = message;
  document.body.appendChild(toast);
  setTimeout(() => toast.remove(), 3500);
}

// ---- Init ----
document.addEventListener('DOMContentLoaded', () => {
  loadClinics();
  setupFilters();
});
