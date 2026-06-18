import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

// ── helpers ──────────────────────────────────────────────────────────────────
const API = import.meta.env.VITE_API_URL ?? "";
const token = () => localStorage.getItem("token") || sessionStorage.getItem("token");

async function apiFetch(path) {
  const res = await fetch(`${API}${path}`, {
    headers: { Authorization: `Bearer ${token()}` },
  });
  if (!res.ok) throw new Error(`${res.status}`);
  return res.json();
}

// ── KPI Card ─────────────────────────────────────────────────────────────────
function KpiCard({ icon, iconBg, iconColor, badge, badgeBg, badgeText, label, value }) {
  return (
    <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <div className={`p-2 ${iconBg} ${iconColor} rounded-lg`}>
          <span className="material-symbols-outlined">{icon}</span>
        </div>
        <span className={`text-xs font-bold ${badgeText} ${badgeBg} px-2 py-1 rounded`}>
          {badge}
        </span>
      </div>
      <p className="text-slate-500 text-[12px] font-semibold uppercase tracking-wider">{label}</p>
      <h3 className="text-2xl font-semibold text-slate-900 mt-1">{value ?? "—"}</h3>
    </div>
  );
}

// ── Donut Chart (SVG) ─────────────────────────────────────────────────────────
function AppointmentDonut({ confirmed = 0, pending = 0, cancelled = 0 }) {
  const total = confirmed + pending + cancelled;
  const circ = 100; // 2π×15.915 ≈ 100 (unit circle)

  const pct = (n) => (total ? (n / total) * 100 : 0);
  const confirmed_pct = pct(confirmed);
  const pending_pct   = pct(pending);
  const cancelled_pct = pct(cancelled);

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
      <h3 className="text-xl font-semibold text-slate-900 mb-6">Appointment Status</h3>
      <div className="flex flex-col items-center">
        <div className="relative w-48 h-48 mb-6">
          <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
            <circle className="stroke-slate-100" cx="18" cy="18" fill="none" r="15.915" strokeWidth="3" />
            <circle cx="18" cy="18" fill="none" r="15.915" stroke="#EF4444"
              strokeDasharray={`${cancelled_pct} ${circ - cancelled_pct}`}
              strokeDashoffset="0" strokeWidth="4" />
            <circle cx="18" cy="18" fill="none" r="15.915" stroke="#F59E0B"
              strokeDasharray={`${pending_pct} ${circ - pending_pct}`}
              strokeDashoffset={-cancelled_pct} strokeWidth="4" />
            <circle cx="18" cy="18" fill="none" r="15.915" stroke="#10B981"
              strokeDasharray={`${confirmed_pct} ${circ - confirmed_pct}`}
              strokeDashoffset={-(cancelled_pct + pending_pct)} strokeWidth="4" />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-2xl font-bold text-slate-900">{total || "—"}</span>
            <span className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">Total</span>
          </div>
        </div>
        <div className="w-full space-y-3">
          {[
            { color: "bg-[#10B981]", label: "Confirmed",  value: confirmed },
            { color: "bg-[#F59E0B]", label: "Pending",    value: pending },
            { color: "bg-[#EF4444]", label: "Cancelled",  value: cancelled },
          ].map(({ color, label, value }) => (
            <div key={label} className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className={`w-3 h-3 rounded-full ${color}`} />
                <span className="text-sm font-medium text-slate-600">{label}</span>
              </div>
              <span className="text-sm font-bold text-slate-900">{value}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── Growth Chart (simple bars) ────────────────────────────────────────────────
const MONTHS = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

function GrowthChart({ data = [] }) {
  const max = Math.max(...data.map((d) => d.count ?? 0), 1);
  return (
    <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
      <div className="mb-6">
        <h3 className="text-xl font-semibold text-slate-900">Clinics Growth</h3>
        <p className="text-sm text-slate-500">Monthly onboarding trends</p>
      </div>
      <div className="h-48 flex items-end gap-2 px-2">
        {data.map((d, i) => {
          const pct = Math.max((d.count / max) * 100, 4);
          const isLast = i === data.length - 1;
          return (
            <div key={i} className="flex-1 flex flex-col items-center gap-1">
              <div
                className={`w-full rounded-t-lg transition-all ${isLast ? "bg-slate-800" : "bg-blue-100 hover:bg-blue-200"}`}
                style={{ height: `${pct}%` }}
              />
            </div>
          );
        })}
      </div>
      <div className="flex justify-between mt-3 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
        {data.map((d, i) => (
          <span key={i}>{MONTHS[d.month - 1] ?? `M${d.month}`}</span>
        ))}
      </div>
    </div>
  );
}

// ── Recent Clinics Table ──────────────────────────────────────────────────────
function RecentClinicsTable({ clinics = [], loading }) {
  return (
    <div className="mt-8 bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
      <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
        <h3 className="text-xl font-semibold text-slate-900">Recent Clinics</h3>
        <Link to="/superadmin/clinics" className="text-sm text-slate-600 font-semibold hover:underline">
          View All
        </Link>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200">
              {["Name", "Email", "Specialty", "Onboarding", "Status"].map((h) => (
                <th key={h} className={`px-6 py-3 text-[12px] font-semibold text-slate-500 uppercase tracking-wider ${h === "Status" ? "text-right" : ""}`}>
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {loading ? (
              <tr><td colSpan={5} className="px-6 py-10 text-center text-slate-400 text-sm">Loading...</td></tr>
            ) : clinics.length === 0 ? (
              <tr><td colSpan={5} className="px-6 py-10 text-center text-slate-400 text-sm">No clinics found.</td></tr>
            ) : clinics.map((c, i) => (
              <tr key={i} className="hover:bg-slate-50/50 transition-colors">
                <td className="px-6 py-4 font-medium text-slate-900 text-sm">{c.name}</td>
                <td className="px-6 py-4 text-slate-500 text-sm">{c.email}</td>
                <td className="px-6 py-4 text-slate-500 text-sm">{c.specialty ?? "—"}</td>
                <td className="px-6 py-4 text-slate-500 text-sm">
                  {c.created_at ? new Date(c.created_at).toLocaleDateString() : "—"}
                </td>
                <td className="px-6 py-4 text-right">
                  <span className={`text-xs font-bold px-2 py-1 rounded-full ${
                    c.status === "active"
                      ? "bg-emerald-50 text-emerald-700"
                      : "bg-slate-100 text-slate-500"
                  }`}>
                    {c.status ?? "—"}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────
export default function SuperAdminDashboard() {
  const [kpi, setKpi]           = useState({});
  const [appointments, setAppt] = useState({});
  const [growth, setGrowth]     = useState([]);
  const [clinics, setClinics]   = useState([]);
  const [loading, setLoading]   = useState(true);

  useEffect(() => {
    async function load() {
      try {
        // Adjust endpoint paths to match your actual backend
        const [stats, apptData, growthData, recentClinics] = await Promise.allSettled([
          apiFetch("/api/superadmin/stats"),
          apiFetch("/api/superadmin/appointments/summary"),
          apiFetch("/api/superadmin/clinics/growth"),
          apiFetch("/api/superadmin/clinics?limit=5"),
        ]);

        if (stats.status === "fulfilled")        setKpi(stats.value);
        if (apptData.status === "fulfilled")     setAppt(apptData.value);
        if (growthData.status === "fulfilled")   setGrowth(growthData.value?.data ?? growthData.value ?? []);
        if (recentClinics.status === "fulfilled") setClinics(recentClinics.value?.data ?? recentClinics.value ?? []);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  return (
    <div>
      {/* Page Header */}
      <div className="flex items-end justify-between mb-8">
        <div>
          <h2 className="text-[30px] font-bold leading-[38px] tracking-tight text-slate-900">
            Executive Overview
          </h2>
          <p className="text-sm text-slate-500 mt-1">Real-time operational status across the clinic network.</p>
        </div>
        <button className="bg-white border border-slate-200 px-4 py-2 rounded-xl text-sm font-semibold flex items-center gap-2 hover:bg-slate-50 shadow-sm transition-all">
          <span className="material-symbols-outlined text-lg">calendar_today</span> Last 30 Days
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <KpiCard icon="domain"      iconBg="bg-blue-50"   iconColor="text-blue-600"   badge="+12%"   badgeBg="bg-emerald-50"  badgeText="text-emerald-600" label="Total Clinics"        value={kpi.total_clinics} />
        <KpiCard icon="check_circle" iconBg="bg-emerald-50" iconColor="text-emerald-600" badge="Active" badgeBg="bg-emerald-50"  badgeText="text-emerald-600" label="Active Clinics"       value={kpi.active_clinics} />
        <KpiCard icon="group"       iconBg="bg-purple-50" iconColor="text-purple-600" badge="+24 new" badgeBg="bg-blue-50"   badgeText="text-blue-600"   label="Total Doctors"        value={kpi.total_doctors} />
        <KpiCard icon="event_note"  iconBg="bg-orange-50" iconColor="text-orange-600" badge="Today"  badgeBg="bg-orange-50" badgeText="text-orange-600" label="Appointments Today"   value={kpi.today_appointments} />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <GrowthChart data={growth} />
        <AppointmentDonut
          confirmed={appointments.confirmed ?? 0}
          pending={appointments.pending ?? 0}
          cancelled={appointments.cancelled ?? 0}
        />
      </div>

      {/* Recent Clinics */}
      <RecentClinicsTable clinics={clinics} loading={loading} />
    </div>
  );
}
