import { useEffect, useState, useCallback, useRef } from "react";
import { useOutletContext, useNavigate } from "react-router-dom";
import { receptionApi } from "../../api/receptionApi";
import { useToast } from "../../hooks/useToast";
import ReceptionTopbar from "../../components/ReceptionTopbar";
import Toast from "../../components/Toast";

function getInitials(name) {
  if (!name) return "PT";
  return String(name).trim().split(" ").filter(Boolean).slice(0, 2)
    .map((w) => w[0]).join("").toUpperCase();
}

function getStatusClass(status) {
  const s = String(status || "").toLowerCase();
  if (s.includes("checkedin") || s.includes("confirmed")) return "bg-emerald-50 text-emerald-700";
  if (s.includes("scheduled")) return "bg-blue-50 text-blue-600";
  if (s.includes("cancelled")) return "bg-red-50 text-red-600";
  if (s.includes("completed")) return "bg-slate-100 text-slate-500";
  return "bg-amber-50 text-amber-700";
}

function canCheckIn(status) {
  const s = String(status || "").toLowerCase();
  return s.includes("scheduled") || s.includes("confirmed");
}

function StatCard({ icon, iconBg, iconColor, label, value, badge, badgeBg, badgeText, delay = 0 }) {
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setVisible(true), delay);
    return () => clearTimeout(t);
  }, [delay]);

  return (
    <div
      className={`bg-white p-6 rounded-xl border border-slate-200 shadow-sm transition-all duration-500 ${
        visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
      }`}
    >
      <div className="flex items-center justify-between mb-4">
        <div className={`p-2 ${iconBg} ${iconColor} rounded-lg`}>
          <span className="material-symbols-outlined">{icon}</span>
        </div>
        {badge && (
          <span className={`text-xs font-bold ${badgeText} ${badgeBg} px-2 py-1 rounded`}>
            {badge}
          </span>
        )}
      </div>
      <p className="text-slate-500 text-[12px] font-semibold uppercase tracking-wider">{label}</p>
      <h3 className="text-2xl font-semibold text-slate-900 mt-1">{value ?? "—"}</h3>
    </div>
  );
}

export default function ReceptionDashboard() {
  const navigate = useNavigate();
  const { openSidebar } = useOutletContext();
  const { toast, showToast } = useToast();

  const [queue, setQueue] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [newRows, setNewRows] = useState(new Set());
  const prevQueueIds = useRef(new Set());

  const loadDashboard = useCallback(async (silent = false) => {
    if (!silent) setLoading(true);
    setError(false);
    try {
      const data = await receptionApi.getDashboard();
      const newQueue = data.queue?.data || [];

      // detect new arrivals
      const currentIds = new Set(newQueue.map(i => i.appointmentId));
      const added = new Set([...currentIds].filter(id => !prevQueueIds.current.has(id)));
      if (added.size > 0) {
        setNewRows(added);
        setTimeout(() => setNewRows(new Set()), 3000);
      }
      prevQueueIds.current = currentIds;

      setQueue(newQueue);
      setDoctors(data.availableDoctors?.data || []);
      setLastUpdated(new Date());
    } catch (err) {
      console.error(err);
      setError(true);
      if (!silent) showToast(err.message || "Failed to load dashboard.", "error");
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  // initial load only — no auto-refresh
  useEffect(() => {
    loadDashboard();
  }, [loadDashboard]);

  async function checkInPatient(appointmentId) {
    if (!appointmentId) return;
    try {
      const result = await receptionApi.checkInAppointment(appointmentId);
      showToast(result?.message || "Patient checked in successfully");
      await loadDashboard(true);
    } catch (err) {
      showToast(err.message || "Failed to check-in patient.", "error");
    }
  }

  const filteredQueue = search
    ? queue.filter((item) => {
        const patient = item.patient || {};
        const value = search.trim().toLowerCase();
        return (
          String(patient.fullName || "").toLowerCase().includes(value) ||
          String(patient.phone || "").toLowerCase().includes(value) ||
          String(patient.id || "").toLowerCase().includes(value)
        );
      })
    : queue;

  const checkedInCount = queue.filter(i => String(i.status || "").toLowerCase().includes("checkedin")).length;
  const scheduledCount = queue.filter(i => String(i.status || "").toLowerCase().includes("scheduled")).length;
  const activeDoctors = doctors.filter(d => d.isActive === true).length;

  return (
    <>
      <ReceptionTopbar title="Reception Desk" onMenuClick={openSidebar}>
        <div className="relative w-full lg:max-w-md">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-lg">
            search
          </span>
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-lg bg-slate-50 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600"
            placeholder="Search in today's queue..."
          />
        </div>

        {/* Manual refresh only */}
        <button
          onClick={() => loadDashboard()}
          className="p-2 text-slate-500 hover:bg-slate-100 rounded-full transition-colors"
          title="Refresh dashboard"
        >
          <span className="material-symbols-outlined">refresh</span>
        </button>
      </ReceptionTopbar>

      <div className="p-4 lg:p-8 max-w-[1440px] mx-auto space-y-8">

        {/* Page Header */}
        <div className="flex items-end justify-between">
          <div>
            <h2 className="text-[30px] font-bold leading-[38px] tracking-tight text-slate-900">
              Reception Desk
            </h2>
            <p className="text-sm text-slate-500 mt-1">Manage today's patient queue and check-ins.</p>
          </div>
          {lastUpdated && (
            <div className="flex items-center gap-2 text-xs text-slate-400">
              <span className="relative flex h-2 w-2">
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
              </span>
              Updated {lastUpdated.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
            </div>
          )}
        </div>

        {/* Action Cards */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 lg:gap-6">
          {/* Add New Patient */}
          <div
            onClick={() => navigate("/reception/patients")}
            className="group relative overflow-hidden bg-blue-600 p-5 sm:p-8 rounded-xl flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6 cursor-pointer shadow-lg shadow-blue-600/10 hover:shadow-xl transition-shadow"
          >
            <div className="relative z-10">
              <h3 className="text-2xl font-semibold text-white mb-2">Add New Patient</h3>
              <p className="text-blue-100 text-sm opacity-90">Register a new visitor to the clinic</p>

              <button className="mt-6 px-4 py-2 bg-white text-blue-600 rounded-lg font-semibold inline-flex items-center gap-2 hover:bg-blue-50 transition-colors">
                Get Started
                <span className="material-symbols-outlined text-lg">arrow_forward</span>
              </button>
            </div>

            <div className="bg-white/10 p-6 rounded-full self-start sm:self-auto">
              <span className="material-symbols-outlined text-[56px] sm:text-[64px] text-white/40">
                person_add
              </span>
            </div>
          </div>

          {/* Book Appointment */}
          <div
            onClick={() => navigate("/reception/patients")}
            className="group bg-white p-5 sm:p-8 rounded-xl border border-slate-200 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6 cursor-pointer shadow-sm hover:shadow-md hover:border-slate-300 transition-all"
          >
            <div>
              <h3 className="text-2xl font-semibold text-slate-900 mb-2">Book Appointment</h3>
              <p className="text-slate-500 text-sm">Schedule a time slot for a patient</p>

              <button className="mt-6 px-4 py-2 border border-slate-200 text-slate-700 rounded-lg font-semibold inline-flex items-center gap-2 hover:bg-slate-50 transition-colors">
                Open Calendar
                <span className="material-symbols-outlined text-lg">calendar_today</span>
              </button>
            </div>

            <div className="bg-slate-50 p-6 rounded-full self-start sm:self-auto">
              <span className="material-symbols-outlined text-[56px] sm:text-[64px] text-slate-300">
                event_note
              </span>
            </div>
          </div>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard delay={0}
            icon="groups" iconBg="bg-blue-50" iconColor="text-blue-600"
            label="Today's Queue" value={loading ? null : queue.length}
            badge="Today" badgeBg="bg-blue-50" badgeText="text-blue-600"
          />
          <StatCard delay={80}
            icon="how_to_reg" iconBg="bg-emerald-50" iconColor="text-emerald-600"
            label="Checked In" value={loading ? null : checkedInCount}
            badge={loading ? "..." : `${queue.length ? Math.round((checkedInCount / queue.length) * 100) : 0}%`}
            badgeBg="bg-emerald-50" badgeText="text-emerald-600"
          />
          <StatCard delay={160}
            icon="schedule" iconBg="bg-amber-50" iconColor="text-amber-600"
            label="Scheduled" value={loading ? null : scheduledCount}
            badge="Pending" badgeBg="bg-amber-50" badgeText="text-amber-600"
          />
          <StatCard delay={240}
            icon="stethoscope" iconBg="bg-purple-50" iconColor="text-purple-600"
            label="Active Doctors" value={loading ? null : activeDoctors}
            badge={`${doctors.length} Total`}
            badgeBg="bg-purple-50" badgeText="text-purple-600"
          />
        </div>

        {/* Patient Queue */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h3 className="text-xl font-semibold text-slate-900">Patient Queue</h3>
              <p className="text-sm text-slate-500">Manage waiting patients and check-ins</p>
            </div>
            <button
              onClick={() => loadDashboard()}
              className="bg-white border border-slate-200 px-4 py-2 rounded-xl text-sm font-semibold flex items-center gap-2 hover:bg-slate-50 shadow-sm transition-all"
            >
              <span className="material-symbols-outlined text-lg text-slate-500">refresh</span>
              Refresh Queue
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[760px] text-left">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200">
                  {["Patient Name", "Purpose", "Status", "Waiting Time", "Actions"].map((h) => (
                    <th key={h} className={`px-6 py-3 text-[12px] font-semibold text-slate-500 uppercase tracking-wider ${h === "Actions" ? "text-right" : ""}`}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {loading && (
                  <tr>
                    <td colSpan={5} className="px-6 py-10 text-center text-slate-400 text-sm">
                      Loading patient queue...
                    </td>
                  </tr>
                )}
                {!loading && error && (
                  <tr>
                    <td colSpan={5} className="px-6 py-10 text-center text-red-500 text-sm">
                      Failed to load patient queue.
                    </td>
                  </tr>
                )}
                {!loading && !error && filteredQueue.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-6 py-10 text-center text-slate-400 text-sm">
                      No patients in today's queue.
                    </td>
                  </tr>
                )}
                {!loading && !error && filteredQueue.map((item) => {
                  const patient = item.patient || {};
                  const doctor = item.doctor || {};
                  const status = item.status || "Scheduled";
                  const isNew = newRows.has(item.appointmentId);
                  const waitingText =
                    status === "CheckedIn"
                      ? `${item.waitingMinutes ?? 0} min`
                      : item.appointmentTime || "--";

                  return (
                    <tr
                      key={item.appointmentId}
                      className={`transition-all duration-500 ${
                        isNew
                          ? "bg-emerald-50/60 animate-pulse"
                          : "hover:bg-slate-50/50"
                      }`}
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-blue-600 font-bold text-sm">
                            {getInitials(patient.fullName)}
                          </div>
                          <div>
                            <div className="text-sm font-medium text-slate-900">
                              {patient.fullName || "Unknown Patient"}
                              {isNew && <span className="ml-2 text-[10px] bg-emerald-100 text-emerald-600 font-bold px-1.5 py-0.5 rounded-full">NEW</span>}
                            </div>
                            <div className="text-xs text-slate-400">
                              ID #{patient.id || "--"} · {patient.phone || "--"}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-slate-900">{item.notes || "Visit"}</div>
                        <div className="text-xs text-slate-500">{doctor.specialization || "Not assigned"}</div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`text-xs font-bold px-2 py-1 rounded-full ${getStatusClass(status)}`}>
                          {status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-500">{waitingText}</td>
                      <td className="px-6 py-4 text-right">
                        {canCheckIn(status) ? (
                          <button
                            onClick={() => checkInPatient(item.appointmentId)}
                            className="text-blue-600 text-xs font-semibold px-3 py-1.5 rounded-lg border border-blue-200 hover:bg-blue-600 hover:text-white hover:border-blue-600 transition-all"
                          >
                            Check-in
                          </button>
                        ) : (
                          <button disabled className="text-slate-400 text-xs font-semibold px-3 py-1.5 rounded-lg border border-slate-200 cursor-not-allowed">
                            Checked
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div className="px-6 py-3 bg-slate-50 border-t border-slate-100 text-center">
            <span className="text-sm font-semibold text-slate-500">
              {loading ? "Loading..." : `${queue.length} patients in today's queue`}
            </span>
          </div>
        </div>

        {/* Doctor Availability */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
          <div className="mb-6">
            <h3 className="text-xl font-semibold text-slate-900">Doctor Availability</h3>
            <p className="text-sm text-slate-500">Currently active doctors on shift</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
            {loading && (
              <div className="col-span-full text-center text-slate-400 text-sm py-8">Loading doctors...</div>
            )}
            {!loading && doctors.length === 0 && (
              <div className="col-span-full text-center text-slate-400 text-sm py-8">No available doctors right now.</div>
            )}
            {!loading && doctors.map((doctor, idx) => {
              const name = doctor.user?.fullName || "Doctor";
              const isActive = doctor.isActive === true;

              return (
                <div
                  key={doctor.id}
                  className="flex items-center p-4 rounded-lg border border-slate-200 hover:border-slate-300 hover:shadow-sm hover:-translate-y-0.5 transition-all duration-200"
                  style={{ animationDelay: `${idx * 60}ms` }}
                >
                  <div className="relative">
                    <div className="w-11 h-11 rounded-full bg-slate-100 flex items-center justify-center font-bold text-slate-600 text-sm">
                      {getInitials(name)}
                    </div>
                    {isActive ? (
                      <span className="absolute bottom-0 right-0 flex h-3 w-3">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                        <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500 border-2 border-white" />
                      </span>
                    ) : (
                      <span className="absolute bottom-0 right-0 w-3 h-3 border-2 border-white rounded-full bg-slate-300" />
                    )}
                  </div>
                  <div className="ml-3">
                    <p className="text-sm font-semibold text-slate-900">{name}</p>
                    <p className={`text-xs font-medium ${isActive ? "text-emerald-600" : "text-slate-400"}`}>
                      {isActive ? `Active · ${doctor.specialization || "General"}` : "Not available"}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

      </div>

      <Toast message={toast.message} type={toast.type} show={toast.show} />
    </>
  );
}