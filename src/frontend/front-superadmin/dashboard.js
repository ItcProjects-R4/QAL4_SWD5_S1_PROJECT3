// ==========================================
//  Dashboard Page - API Integration
//  Endpoint: GET /api/SuperAdmin/dashboard
// ==========================================

const API_BASE = 'http://localhost:5099/api'; // غير الـ URL ده لو الـ backend على port تاني

// ---- Token Helper ----
function getToken() {
    return localStorage.getItem('token') || sessionStorage.getItem('token');
}

// ---- Fetch Dashboard Data ----
async function loadDashboard() {
  try {
    const res = await fetch(`${API_BASE}/SuperAdmin/dashboard`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${getToken()}`
      }
    });

    if (res.status === 401) {
        window.location.href = '../../login.html';
        return;
    }

    if (!res.ok) throw new Error('Failed to load dashboard');

    const data = await res.json();
    renderKPIs(data);
    renderRecentClinics(data.recentClinics);
    renderGrowthChart(data.clinicsGrowthChart);
    renderStatusChart(data.appointmentStatusDistribution);

  } catch (err) {
    console.error('Dashboard error:', err);
    showToast('Failed to load dashboard data', 'error');
  }
}

// ---- Render KPI Cards ----
function renderKPIs(data) {
  // Total Clinics
  const totalClinicsEl = document.querySelector('[data-kpi="total-clinics"]');
  if (totalClinicsEl) totalClinicsEl.textContent = data.totalClinics ?? '-';

  // Active Clinics
  const activeClinicsEl = document.querySelector('[data-kpi="active-clinics"]');
  if (activeClinicsEl) activeClinicsEl.textContent = data.activeClinics ?? '-';

  // Total Doctors
  const totalDoctorsEl = document.querySelector('[data-kpi="total-doctors"]');
  if (totalDoctorsEl) totalDoctorsEl.textContent = data.totalDoctors ?? '-';

  // Today Appointments
  const todayAppointmentsEl = document.querySelector('[data-kpi="today-appointments"]');
  if (todayAppointmentsEl) todayAppointmentsEl.textContent = data.todayAppointments ?? '-';
}

// ---- Render Recent Clinics Table ----
function renderRecentClinics(clinics) {
  const tbody = document.querySelector('[data-table="recent-clinics"] tbody');
  if (!tbody || !clinics) return;

  tbody.innerHTML = clinics.map(clinic => {
    const initials = clinic.name.split(' ').map(w => w[0]).join('').substring(0, 2).toUpperCase();
    const statusClass = clinic.isActive
      ? 'bg-emerald-50 text-emerald-600 border-emerald-100'
      : 'bg-error-container text-error border-error/20';
    const statusText = clinic.isActive ? 'Active' : 'Inactive';
    const date = new Date(clinic.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

    return `
      <tr class="hover:bg-slate-50 transition-colors">
        <td class="px-6 py-4">
          <div class="flex items-center gap-3">
            <div class="w-8 h-8 rounded bg-slate-100 flex items-center justify-center font-bold text-slate-500 text-xs">${initials}</div>
            <span class="font-medium text-slate-900">${clinic.name}</span>
          </div>
        </td>
        <td class="px-6 py-4 text-slate-600 font-body-md text-body-md">${clinic.email ?? '-'}</td>
        <td class="px-6 py-4 text-slate-600 font-body-md text-body-md">-</td>
        <td class="px-6 py-4 text-slate-600 font-body-md text-body-md">${date}</td>
        <td class="px-6 py-4 text-right">
          <span class="px-3 py-1 rounded-full text-xs font-bold border ${statusClass}">${statusText}</span>
        </td>
      </tr>`;
  }).join('');
}

// ---- Render Growth Chart (Bar + SVG Line) ----
function renderGrowthChart(growthData) {
  if (!growthData || growthData.length === 0) return;

  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const sorted = [...growthData].sort((a, b) => a.year !== b.year ? a.year - b.year : a.month - b.month);
  const last9 = sorted.slice(-9);
  const maxCount = Math.max(...last9.map(d => d.count), 1);

  // Update bar heights
  const bars = document.querySelectorAll('[data-chart="growth"] .chart-bar');
  bars.forEach((bar, i) => {
    if (last9[i]) {
      const pct = Math.round((last9[i].count / maxCount) * 95);
      bar.style.height = `${pct}%`;
      bar.title = `${monthNames[last9[i].month - 1]} ${last9[i].year}: ${last9[i].count}`;
    }
  });

  // Update x-axis labels
  const labels = document.querySelectorAll('[data-chart="growth"] .chart-label');
  labels.forEach((label, i) => {
    if (last9[i]) label.textContent = monthNames[last9[i].month - 1];
  });
}

// ---- Render Appointment Status Donut ----
function renderStatusChart(statusData) {
  if (!statusData || statusData.length === 0) return;

  const total = statusData.reduce((sum, s) => sum + s.count, 0);
  if (total === 0) return;

  const confirmed = statusData.find(s => s.status === 0 || s.status?.toLowerCase?.() === 'confirmed');
  const pending   = statusData.find(s => s.status === 1 || s.status?.toLowerCase?.() === 'pending');
  const cancelled = statusData.find(s => s.status === 2 || s.status?.toLowerCase?.() === 'cancelled');

  const pctOf = (item) => item ? Math.round((item.count / total) * 100) : 0;
  const confirmedPct = pctOf(confirmed);
  const pendingPct   = pctOf(pending);
  const cancelledPct = pctOf(cancelled);

  // Update percentages in legend
  const legendConfirmed = document.querySelector('[data-status="confirmed"]');
  const legendPending   = document.querySelector('[data-status="pending"]');
  const legendCancelled = document.querySelector('[data-status="cancelled"]');

  if (legendConfirmed) legendConfirmed.textContent = `${confirmedPct}%`;
  if (legendPending)   legendPending.textContent   = `${pendingPct}%`;
  if (legendCancelled) legendCancelled.textContent = `${cancelledPct}%`;

  // Update center total
  const centerEl = document.querySelector('[data-status="total"]');
  if (centerEl) centerEl.textContent = `${total}`;

  // Update SVG donut arcs
  const circumference = 100; // stroke-dasharray base is 100
  const confirmedCircle = document.querySelector('[data-arc="confirmed"]');
  const pendingCircle   = document.querySelector('[data-arc="pending"]');
  const cancelledCircle = document.querySelector('[data-arc="cancelled"]');

  if (confirmedCircle) {
    confirmedCircle.setAttribute('stroke-dasharray', `${confirmedPct} ${100 - confirmedPct}`);
    confirmedCircle.setAttribute('stroke-dashoffset', '0');
  }
  if (pendingCircle) {
    pendingCircle.setAttribute('stroke-dasharray', `${pendingPct} ${100 - pendingPct}`);
    pendingCircle.setAttribute('stroke-dashoffset', `-${confirmedPct}`);
  }
  if (cancelledCircle) {
    cancelledCircle.setAttribute('stroke-dasharray', `${cancelledPct} ${100 - cancelledPct}`);
    cancelledCircle.setAttribute('stroke-dashoffset', `-${confirmedPct + pendingPct}`);
  }
}

// ---- Toast Notification ----
function showToast(message, type = 'info') {
  const toast = document.createElement('div');
  const colors = { error: 'bg-red-600', success: 'bg-emerald-600', info: 'bg-slate-700' };
  toast.className = `fixed bottom-6 right-6 z-[999] px-5 py-3 rounded-xl text-white text-sm font-semibold shadow-lg ${colors[type] ?? colors.info} transition-all`;
  toast.textContent = message;
  document.body.appendChild(toast);
  setTimeout(() => toast.remove(), 3500);
}

// ---- Init ----
document.addEventListener('DOMContentLoaded', loadDashboard);





