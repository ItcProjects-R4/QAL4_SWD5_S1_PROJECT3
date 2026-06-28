import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { superadmin } from "../../api/superadmin";

const MONTH_KEYS = [
    "jan", "feb", "mar", "apr", "may", "jun",
    "jul", "aug", "sep", "oct", "nov", "dec",
];

// ── Month/Year Picker ────────────────────────────────────────
function MonthPicker({ month, year, onChange }) {
    const { t } = useTranslation();
    const now = new Date();
    const years = Array.from({ length: 4 }, (_, i) => now.getFullYear() - i);

    return (
        <div className="flex items-center gap-2">
            <select
                value={month}
                onChange={(e) => onChange(Number(e.target.value), year)}
                className="text-sm font-medium text-slate-700 bg-white border border-slate-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-slate-300"
            >
                {MONTH_KEYS.map((key, i) => (
                    <option key={key} value={i + 1}>
                        {t(`superadmin.monthlyReports.months.${key}`)}
                    </option>
                ))}
            </select>
            <select
                value={year}
                onChange={(e) => onChange(month, Number(e.target.value))}
                className="text-sm font-medium text-slate-700 bg-white border border-slate-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-slate-300"
            >
                {years.map((y) => (
                    <option key={y} value={y}>{y}</option>
                ))}
            </select>
        </div>
    );
}

// ── Summary Stat Card ────────────────────────────────────────
function StatCard({ icon, label, value, accent }) {
    return (
        <div className="bg-white p-5 rounded-xl border border-slate-100 shadow-sm flex items-center gap-4">
            <div className={`p-3 rounded-lg ${accent}`}>
                <span className="material-symbols-outlined text-white text-xl">{icon}</span>
            </div>
            <div>
                <div className="text-xl sm:text-2xl font-extrabold text-slate-900">{value}</div>
                <div className="text-xs text-slate-500">{label}</div>
            </div>
        </div>
    );
}

// ── Clinics Table ────────────────────────────────────────────
function ClinicsTable({ rows = [], loading }) {
    const { t } = useTranslation();

    const columns = [
        "colClinic", "colAppointments", "colCompleted",
        "colCancelled", "colNoShow", "colRevenue", "colPending", "colNewPatients",
    ];

    return (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100">
                <h3 className="text-lg sm:text-xl font-semibold text-slate-900">
                    {t("superadmin.monthlyReports.table.title")}
                </h3>
            </div>
            <div className="overflow-x-auto">
                <table className="w-full text-left">
                    <thead className="bg-slate-50/50">
                        <tr>
                            {columns.map((key) => (
                                <th key={key} className="px-4 sm:px-6 py-4 text-[12px] font-semibold text-slate-500 uppercase tracking-wider whitespace-nowrap">
                                    {t(`superadmin.monthlyReports.table.${key}`)}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {loading ? (
                            <tr><td colSpan={columns.length} className="px-6 py-10 text-center text-slate-400 text-sm">
                                {t("superadmin.monthlyReports.table.loading")}
                            </td></tr>
                        ) : rows.length === 0 ? (
                            <tr><td colSpan={columns.length} className="px-6 py-10 text-center text-slate-400 text-sm">
                                {t("superadmin.monthlyReports.table.empty")}
                            </td></tr>
                        ) : (
                            rows.map((r) => (
                                <tr key={r.tenantId} className="hover:bg-slate-50/50 transition-colors">
                                    <td className="px-4 sm:px-6 py-4 font-medium text-slate-900 text-sm whitespace-nowrap">{r.tenantName}</td>
                                    <td className="px-4 sm:px-6 py-4 text-slate-600 text-sm">{r.totalAppointments}</td>
                                    <td className="px-4 sm:px-6 py-4 text-emerald-600 text-sm font-medium">{r.completedAppointments}</td>
                                    <td className="px-4 sm:px-6 py-4 text-rose-500 text-sm">{r.cancelledAppointments}</td>
                                    <td className="px-4 sm:px-6 py-4 text-amber-600 text-sm">{r.noShowAppointments}</td>
                                    <td className="px-4 sm:px-6 py-4 text-slate-900 font-semibold text-sm whitespace-nowrap">
                                        {Number(r.totalRevenue).toLocaleString()} {t("superadmin.monthlyReports.currency")}
                                    </td>
                                    <td className="px-4 sm:px-6 py-4 text-slate-500 text-sm whitespace-nowrap">
                                        {Number(r.pendingRevenue).toLocaleString()} {t("superadmin.monthlyReports.currency")}
                                    </td>
                                    <td className="px-4 sm:px-6 py-4 text-slate-600 text-sm">{r.newPatients}</td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

// ── Revenue Trend Chart (history across months) ─────────────
function RevenueTrendChart({ data = [] }) {
    const { t } = useTranslation();
    if (data.length < 2) return null;

    const W = 800, H = 260, PAD = 24;
    const values = data.map((d) => d.totalRevenue ?? 0);
    const max = Math.max(...values, 1);

    const points = data.map((d, i) => {
        const x = PAD + (i / (data.length - 1)) * (W - PAD * 2);
        const y = H - PAD - ((d.totalRevenue ?? 0) / max) * (H - PAD * 2);
        return [x, y];
    });

    const linePath = points.map(([x, y], i) => `${i === 0 ? "M" : "L"} ${x} ${y}`).join(" ");
    const areaPath = `${linePath} L ${points[points.length - 1][0]} ${H} L ${points[0][0]} ${H} Z`;

    return (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
            <div className="mb-6">
                <h3 className="text-lg sm:text-xl font-semibold text-slate-900">
                    {t("superadmin.monthlyReports.trend.title")}
                </h3>
                <p className="text-sm text-slate-500">{t("superadmin.monthlyReports.trend.subtitle")}</p>
            </div>
            <div className="relative h-[220px] sm:h-[280px] w-full">
                <svg className="w-full h-full" preserveAspectRatio="none" viewBox={`0 0 ${W} ${H}`}>
                    <defs>
                        <linearGradient id="revenueGrad" x1="0" x2="0" y1="0" y2="1">
                            <stop offset="0%" stopColor="#131b2e" stopOpacity="0.15" />
                            <stop offset="100%" stopColor="#131b2e" stopOpacity="0" />
                        </linearGradient>
                    </defs>
                    {[50, 130, 210].map((y) => (
                        <line key={y} className="stroke-slate-200" strokeDasharray="4" x1="0" x2={W} y1={y} y2={y} />
                    ))}
                    <path fill="url(#revenueGrad)" d={areaPath} />
                    <path fill="none" stroke="#131b2e" strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d={linePath} />
                    {points.map(([x, y], i) => (
                        <circle key={i} cx={x} cy={y} r="4" fill="#131b2e" />
                    ))}
                </svg>
            </div>
            <div className="flex justify-between mt-4 text-[8px] sm:text-[10px] text-slate-400 font-bold uppercase tracking-tighter overflow-hidden">
                {data.map((d, i) => (
                    <span key={i} className="truncate">
                        {t(`superadmin.monthlyReports.months.${MONTH_KEYS[(d.month ?? i + 1) - 1]}`)}
                    </span>
                ))}
            </div>
        </div>
    );
}

// ── Page ─────────────────────────────────────────────────────
export default function MonthlyReports() {
    const { t } = useTranslation();
    const now = new Date();
    const [month, setMonth] = useState(now.getMonth() + 1);
    const [year, setYear] = useState(now.getFullYear());
    const [report, setReport] = useState(null);
    const [history, setHistory] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let active = true;
        async function load() {
            setLoading(true);
            try {
                const [reportRes, historyRes] = await Promise.allSettled([
                    superadmin.getMonthlyReports(month, year),
                    superadmin.getMonthlyReportsHistory(null, 12),
                ]);
                if (!active) return;
                if (reportRes.status === "fulfilled") setReport(reportRes.value);
                if (historyRes.status === "fulfilled") setHistory(historyRes.value ?? []);
            } finally {
                if (active) setLoading(false);
            }
        }
        load();
        return () => { active = false; };
    }, [month, year]);

    const summary = report?.summary ?? {};
    const clinics = report?.clinics ?? [];

    const stats = useMemo(() => [
        { icon: "payments", label: t("superadmin.monthlyReports.statRevenue"), value: `${Number(summary.totalRevenue ?? 0).toLocaleString()} ${t("superadmin.monthlyReports.currency")}`, accent: "bg-[#131b2e]" },
        { icon: "event_available", label: t("superadmin.monthlyReports.statAppointments"), value: summary.totalAppointments ?? 0, accent: "bg-emerald-600" },
        { icon: "person_add", label: t("superadmin.monthlyReports.statNewPatients"), value: summary.totalNewPatients ?? 0, accent: "bg-blue-600" },
        { icon: "storefront", label: t("superadmin.monthlyReports.statClinicsReported"), value: summary.clinicsReported ?? 0, accent: "bg-amber-600" },
    ], [summary, t]);

    return (
        <div className="max-w-7xl mx-auto space-y-8">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl sm:text-[30px] font-bold text-slate-900">
                        {t("superadmin.monthlyReports.title")}
                    </h1>
                    <p className="text-slate-500 mt-1 text-sm">
                        {t("superadmin.monthlyReports.subtitle")}
                    </p>
                </div>
                <MonthPicker month={month} year={year} onChange={(m, y) => { setMonth(m); setYear(y); }} />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {stats.map((s) => <StatCard key={s.label} {...s} />)}
            </div>

            <RevenueTrendChart data={history} />
            <ClinicsTable rows={clinics} loading={loading} />
        </div>
    );
}