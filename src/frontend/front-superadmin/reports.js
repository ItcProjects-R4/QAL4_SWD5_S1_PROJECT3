// ==========================================
//  Reports Page - API Integration
//  Endpoint: GET /api/SuperAdmin/reports
// ==========================================

const API_BASE = 'http://localhost:5099/api';

function getToken() {
    return localStorage.getItem('token') || sessionStorage.getItem('token');
}

// ---- Fetch Reports ----
async function loadReports() {
  try {
    const res = await fetch(`${API_BASE}/SuperAdmin/reports`, {
      headers: { 'Authorization': `Bearer ${getToken()}` }
    });

      if (res.status === 401) { window.location.href = '../../index.html'; return; }
    if (!res.ok) throw new Error('Failed to load reports');

    const data = await res.json();
    renderGrowthChart(data.clinicsGrowthTrend);
    renderStatusDonut(data.appointmentStatusDistribution);
    renderLeaderboard(data.performanceLeaderboard);

  } catch (err) {
    console.error('Reports error:', err);
    showToast('Failed to load reports data', 'error');
  }
}

// ---- Clinics Growth Trend Chart (SVG Area) ----
function renderGrowthChart(growthData) {
  if (!growthData || growthData.length === 0) return;

  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const sorted = [...growthData].sort((a, b) => a.year !== b.year ? a.year - b.year : a.month - b.month);
  const maxCount = Math.max(...sorted.map(d => d.count), 1);

  // Build SVG path points (viewBox 0 0 800 300, y inverted)
  const svgW = 800, svgH = 300, padX = 20, padY = 30;
  const usableW = svgW - padX * 2;
  const usableH = svgH - padY * 2;

  const points = sorted.map((d, i) => {
    const x = padX + (i / Math.max(sorted.length - 1, 1)) * usableW;
    const y = svgH - padY - (d.count / maxCount) * usableH;
    return { x, y, ...d };
  });

  const pathD = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' ');
  const areaD = pathD + ` L ${points[points.length-1].x.toFixed(1)},${svgH - padY} L ${points[0].x.toFixed(1)},${svgH - padY} Z`;

  const trendLine = document.querySelector('[data-chart="growth-line"]');
  const areaPath  = document.querySelector('[data-chart="growth-area"]');
  if (trendLine) trendLine.setAttribute('d', pathD);
  if (areaPath)  areaPath.setAttribute('d', areaD);

  // X-Axis labels
  const labelsContainer = document.querySelector('[data-chart="growth-labels"]');
  if (labelsContainer) {
    const step = Math.max(1, Math.floor(sorted.length / 5));
    const labelItems = sorted.filter((_, i) => i % step === 0 || i === sorted.length - 1);
    labelsContainer.innerHTML = labelItems.map(d =>
      `<span>${monthNames[d.month - 1]} ${String(d.year).slice(2)}</span>`
    ).join('');
  }
}

// ---- Appointment Status Donut ----
function renderStatusDonut(statusData) {
  if (!statusData || statusData.length === 0) return;

  const total = statusData.reduce((sum, s) => sum + s.count, 0);
  if (total === 0) return;

  // Map statuses (backend may return int or string)
  const getCount = (keys) => {
    const item = statusData.find(s =>
      keys.includes(s.status) ||
      keys.includes(s.status?.toString?.().toLowerCase?.())
    );
    return item ? item.count : 0;
  };

  const activeCount   = getCount([0, 'active', 'confirmed']);
  const inactiveCount = total - activeCount;

  const activePct   = Math.round((activeCount / total) * 100);
  const inactivePct = 100 - activePct;

  // Update donut SVG arcs (r=40, circumference ≈ 251.2)
  const circ = 251.2;
  const activeArc   = document.querySelector('[data-arc="active"]');
  const inactiveArc = document.querySelector('[data-arc="inactive"]');

  if (activeArc) {
    const dash = (activePct / 100) * circ;
    activeArc.setAttribute('stroke-dasharray', `${dash.toFixed(1)} ${(circ - dash).toFixed(1)}`);
  }
  if (inactiveArc) {
    const dash   = (inactivePct / 100) * circ;
    const offset = -(activePct / 100) * circ;
    inactiveArc.setAttribute('stroke-dasharray', `${dash.toFixed(1)} ${(circ - dash).toFixed(1)}`);
    inactiveArc.setAttribute('stroke-dashoffset', offset.toFixed(1));
  }

  // Labels
  const totalEl    = document.querySelector('[data-donut="total"]');
  const activeLbl  = document.querySelector('[data-donut="active-count"]');
  const inactiveLbl= document.querySelector('[data-donut="inactive-count"]');

  if (totalEl)     totalEl.textContent     = total.toLocaleString();
  if (activeLbl)   activeLbl.textContent   = `${activeCount} (${activePct}%)`;
  if (inactiveLbl) inactiveLbl.textContent = `${inactiveCount} (${inactivePct}%)`;
}

// ---- Performance Leaderboard Table ----
function renderLeaderboard(leaderboard) {
  const tbody = document.querySelector('[data-table="leaderboard"] tbody');
  if (!tbody || !leaderboard) return;

  tbody.innerHTML = leaderboard.map((clinic, index) => {
    const initials = clinic.name.split(' ').map(w => w[0]).join('').substring(0, 2).toUpperCase();
    const loadPct  = Math.min(100, Math.round((clinic.patients / Math.max(...leaderboard.map(c => c.patients), 1)) * 100));
    const loadColor = loadPct > 80 ? 'bg-rose-500' : loadPct > 50 ? 'bg-amber-500' : 'bg-emerald-500';
    const isTop = index === 0;

    return `
      <tr class="hover:bg-slate-50/80 transition-colors">
        <td class="px-6 py-4">
          <div class="flex items-center gap-3">
            <div class="w-8 h-8 rounded-lg ${isTop ? 'bg-primary-container text-white' : 'bg-slate-200 text-slate-700'} flex items-center justify-center font-bold text-xs">${initials}</div>
            <span class="font-semibold text-slate-900">${clinic.name}</span>
          </div>
        </td>
        <td class="px-6 py-4 text-slate-600">${clinic.doctors} Doctors</td>
        <td class="px-6 py-4">
          <div class="w-full max-w-[80px] bg-slate-100 h-1.5 rounded-full overflow-hidden">
            <div class="${loadColor} h-full" style="width:${loadPct}%"></div>
          </div>
        </td>
        <td class="px-6 py-4">
          <div class="flex items-center gap-1 text-amber-500">
            <span class="material-symbols-outlined text-[18px]" style="font-variation-settings:'FILL' 1">star</span>
            <span class="font-bold text-slate-900">-</span>
          </div>
        </td>
        <td class="px-6 py-4 text-emerald-600 font-bold">${clinic.patients} patients</td>
        <td class="px-6 py-4">
          ${isTop
            ? `<span class="px-2 py-1 bg-emerald-50 text-emerald-600 text-[10px] font-bold rounded uppercase tracking-wider">Top Performer</span>`
            : `<span class="px-2 py-1 bg-slate-100 text-slate-600 text-[10px] font-bold rounded uppercase tracking-wider">Stable</span>`}
        </td>
      </tr>`;
  }).join('');
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
document.addEventListener('DOMContentLoaded', loadReports);
