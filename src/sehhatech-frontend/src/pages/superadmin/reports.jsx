import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { superadmin } from "../../api/superadmin";

// ── Status Badge ─────────────────────────────────────────────
function StatusBadge({ status }) {
  const { t } = useTranslation();
  const s = status?.toLowerCase();

  const styles = {
    active: "bg-emerald-50 text-emerald-700",
    inactive: "bg-rose-50 text-rose-600",
    paused: "bg-amber-50 text-amber-700",
    pending: "bg-blue-50 text-blue-600",
  };

  return (
    <span
      className={`text-xs font-bold px-2.5 py-1 rounded-full whitespace-nowrap ${
        styles[s] || "bg-slate-100 text-slate-500"
      }`}
    >
      {s ? t(`superadmin.reports.status.${s}`) : status || "—"}
    </span>
  );
}

// ── Leaderboard Table ─────────────────────────────────────────
function Leaderboard({ rows = [], loading }) {
  const { t } = useTranslation();

  const columns = [
    { key: "colName",         hideOnMobile: false },
    { key: "colDoctors",      hideOnMobile: true  },
    { key: "colLoad",         hideOnMobile: false },
    { key: "colSatisfaction", hideOnMobile: false },
    { key: "colPatients",     hideOnMobile: true  },
    { key: "colStatus",       hideOnMobile: false },
  ];

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
      <div className="px-6 py-4 border-b border-slate-100">
        <h3 className="text-lg sm:text-xl font-semibold text-slate-900">
          {t("superadmin.reports.leaderboard.title")}
        </h3>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead className="bg-slate-50/50">
            <tr>
              {columns.map(({ key, hideOnMobile }) => (
                <th
                  key={key}
                  className={`px-4 sm:px-6 py-4 text-[12px] font-semibold text-slate-500 uppercase tracking-wider whitespace-nowrap ${
                    hideOnMobile ? "hidden md:table-cell" : ""
                  }`}
                >
                  {t(`superadmin.reports.leaderboard.${key}`)}
                </th>
              ))}
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-100">
            {loading ? (
              <tr>
                <td colSpan={6} className="px-6 py-10 text-center text-slate-400 text-sm">
                  {t("superadmin.reports.leaderboard.loading")}
                </td>
              </tr>
            ) : rows.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-6 py-10 text-center text-slate-400 text-sm">
                  {t("superadmin.reports.leaderboard.empty")}
                </td>
              </tr>
            ) : (
              rows.map((r, i) => (
                <tr key={i} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-4 sm:px-6 py-4 font-medium text-slate-900 text-sm">
                    {r.name}
                  </td>
                  <td className="px-4 sm:px-6 py-4 text-slate-500 text-sm hidden md:table-cell">
                    {r.doctors ?? "—"}
                  </td>
                  <td className="px-4 sm:px-6 py-4 text-sm">
                    <div className="flex items-center gap-2">
                      <div className="flex-1 bg-slate-100 rounded-full h-1.5 max-w-[60px] sm:max-w-[80px]">
                        <div
                          className="bg-slate-800 h-1.5 rounded-full"
                          style={{ width: `${Math.min(r.load ?? 0, 100)}%` }}
                        />
                      </div>
                      <span className="text-slate-500 text-xs whitespace-nowrap">
                        {r.load ?? "—"}%
                      </span>
                    </div>
                  </td>
                  <td className="px-4 sm:px-6 py-4 text-sm">
                    <div className="flex items-center gap-1 text-amber-500">
                      <span
                        className="material-symbols-outlined text-sm"
                        style={{ fontVariationSettings: "'FILL' 1" }}
                      >
                        star
                      </span>
                      <span className="text-slate-700 font-medium">
                        {r.satisfaction ?? "—"}
                      </span>
                    </div>
                  </td>
                  <td className="px-4 sm:px-6 py-4 text-slate-500 text-sm hidden md:table-cell">
                    {r.patients ?? "—"}
                  </td>
                  <td className="px-4 sm:px-6 py-4">
                    <StatusBadge status={r.status} />
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ── Growth Line Chart ─────────────────────────────────────────
function GrowthLineChart({ data = [] }) {
  const { t } = useTranslation();
  if (data.length < 2) return null;

  const MONTH_KEYS = [
    "jan","feb","mar","apr","may","jun",
    "jul","aug","sep","oct","nov","dec",
  ];

  const counts = data.map((d) => d.count ?? 0);
  const max = Math.max(...counts, 1);
  const W = 800, H = 280, PAD = 20;

  const points = data.map((d, i) => {
    const x = PAD + (i / (data.length - 1)) * (W - PAD * 2);
    const y = H - PAD - ((d.count ?? 0) / max) * (H - PAD * 2);
    return [x, y];
  });

  const linePath = points.map(([x, y], i) => `${i === 0 ? "M" : "L"} ${x} ${y}`).join(" ");
  const areaPath = `${linePath} L ${points[points.length - 1][0]} ${H} L ${points[0][0]} ${H} Z`;

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
      <div className="mb-6">
        <h3 className="text-lg sm:text-xl font-semibold text-slate-900">
          {t("superadmin.reports.growth.title")}
        </h3>
        <p className="text-sm text-slate-500">
          {t("superadmin.reports.growth.subtitle")}
        </p>
      </div>

      <div className="relative h-[220px] sm:h-[300px] w-full">
        <svg className="w-full h-full" preserveAspectRatio="none" viewBox={`0 0 ${W} ${H}`}>
          <defs>
            <linearGradient id="areaGrad" x1="0" x2="0" y1="0" y2="1">
              <stop offset="0%" stopColor="#131b2e" stopOpacity="0.15" />
              <stop offset="100%" stopColor="#131b2e" stopOpacity="0" />
            </linearGradient>
          </defs>
          {[50, 150, 250].map((y) => (
            <line key={y} className="stroke-slate-200" strokeDasharray="4" x1="0" x2={W} y1={y} y2={y} />
          ))}
          <path fill="url(#areaGrad)" d={areaPath} />
          <path fill="none" stroke="#131b2e" strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d={linePath} />
          {points.map(([x, y], i) => (
            <circle key={i} cx={x} cy={y} r="4" fill="#131b2e" />
          ))}
        </svg>
      </div>

      <div className="flex justify-between mt-4 text-[8px] sm:text-[10px] text-slate-400 font-bold uppercase tracking-tighter overflow-hidden">
        {data.map((d, i) => (
          <span key={i} className="truncate">
            {t(`superadmin.reports.months.${MONTH_KEYS[(d.month ?? i + 1) - 1]}`)}
          </span>
        ))}
      </div>
    </div>
  );
}

// ── Status Donut ─────────────────────────────────────────────
function StatusDonut({ active = 0, inactive = 0 }) {
  const { t } = useTranslation();
  const total = active + inactive;
  const circ = 251.2;
  const activeDash = total ? (active / total) * circ : 0;
  const inactiveDash = total ? (inactive / total) * circ : 0;

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 w-full max-w-sm">
      <h3 className="text-lg sm:text-xl font-semibold text-slate-900 mb-1">
        {t("superadmin.reports.donut.title")}
      </h3>
      <p className="text-sm text-slate-500 mb-8">
        {t("superadmin.reports.donut.subtitle")}
      </p>

      <div className="flex flex-col items-center">
        <div className="relative w-40 h-40 sm:w-48 sm:h-48 flex items-center justify-center">
          <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
            <circle cx="50" cy="50" r="40" fill="transparent" stroke="#F1F5F9" strokeWidth="12" />
            <circle cx="50" cy="50" r="40" fill="transparent" stroke="#10b981"
              strokeDasharray={`${activeDash} ${circ - activeDash}`}
              strokeLinecap="round" strokeWidth="12" />
            <circle cx="50" cy="50" r="40" fill="transparent" stroke="#f43f5e"
              strokeDasharray={`${inactiveDash} ${circ - inactiveDash}`}
              strokeDashoffset={-activeDash}
              strokeLinecap="round" strokeWidth="12" />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-2xl font-bold text-slate-900">{total || "—"}</span>
            <span className="text-[10px] text-slate-400 uppercase font-bold">
              {t("superadmin.reports.donut.total")}
            </span>
          </div>
        </div>

        <div className="w-full mt-8 space-y-3">
          {[
            { color: "bg-emerald-500", labelKey: "active",   value: active   },
            { color: "bg-rose-500",    labelKey: "inactive", value: inactive },
          ].map(({ color, labelKey, value }) => (
            <div key={labelKey} className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className={`w-3 h-3 rounded-full ${color} shrink-0`} />
                <span className="text-sm font-medium text-slate-700">
                  {t(`superadmin.reports.donut.${labelKey}`)}
                </span>
              </div>
              <span className="text-sm font-bold text-slate-900">{value}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── Page ─────────────────────────────────────────────
export default function Reports() {
  const { t } = useTranslation();
  const [leaderboard, setLeaderboard] = useState([]);
  const [growth, setGrowth]           = useState([]);
  const [donut, setDonut]             = useState({ active: 0, inactive: 0 });
  const [loading, setLoading]         = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const [lb, stats] = await Promise.allSettled([
          superadmin.getReports(),
          superadmin.getDashboard(),
        ]);
        if (lb.status === "fulfilled") {
          const v = lb.value;
          setLeaderboard(v?.performanceLeaderboard ?? []);
          setGrowth(v?.clinicsGrowthTrend ?? []);
        }
        if (stats.status === "fulfilled") {
          const d = stats.value;
          setDonut({
            active:   d.activeClinics ?? 0,
            inactive: (d.totalClinics ?? 0) - (d.activeClinics ?? 0),
          });
        }
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl sm:text-[30px] font-bold text-slate-900">
          {t("superadmin.reports.title")}
        </h1>
        <p className="text-slate-500 mt-1 text-sm">
          {t("superadmin.reports.subtitle")}
        </p>
      </div>

      <Leaderboard rows={leaderboard} loading={loading} />
      <GrowthLineChart data={growth} />
      <StatusDonut active={donut.active} inactive={donut.inactive} />
    </div>
  );
}