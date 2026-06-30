import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { superadmin } from "../../api/superadmin";

const API = import.meta.env.VITE_API_URL ?? "";
const token = () => localStorage.getItem("token") || sessionStorage.getItem("token");

async function apiFetch(path, options = {}) {
    const res = await fetch(`${API}${path}`, {
        headers: { Authorization: `Bearer ${token()}`, "Content-Type": "application/json" },
        ...options,
    });
    if (!res.ok) throw new Error(`${res.status}`);
    return res.json();
}

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
        <span className={`text-xs font-bold px-2.5 py-1 rounded-full whitespace-nowrap ${styles[s] || "bg-slate-100 text-slate-500"}`}>
            {s ? t(`superadmin.reports.status.${s}`) : status || "—"}
        </span>
    );
}

// ── Churn Risk Badge ──────────────────────────────────────────
function ChurnBadge({ level }) {
    const { t } = useTranslation();
    const styles = {
        Critical: "bg-red-100 text-red-700 border border-red-200",
        High: "bg-orange-100 text-orange-700 border border-orange-200",
        Medium: "bg-amber-100 text-amber-700 border border-amber-200",
        Low: "bg-emerald-50 text-emerald-700 border border-emerald-200",
    };
    const icons = {
        Critical: "crisis_alert",
        High: "warning",
        Medium: "info",
        Low: "check_circle",
    };
    return (
        <span className={`inline-flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-full whitespace-nowrap ${styles[level] || "bg-slate-100 text-slate-500"}`}>
            <span className="material-symbols-outlined text-[13px]" style={{ fontVariationSettings: "'FILL' 1" }}>
                {icons[level] || "help"}
            </span>
            {level ? t(`superadmin.reports.churn.riskLevel.${level}`) : "—"}
        </span>
    );
}

// ── Churn Score Ring ──────────────────────────────────────────
function ScoreRing({ score = 0, size = 48 }) {
    const r = 18;
    const circ = 2 * Math.PI * r;
    const dash = (score / 100) * circ;

    const color =
        score >= 70 ? "#ef4444"
            : score >= 45 ? "#f97316"
                : score >= 20 ? "#f59e0b"
                    : "#10b981";

    return (
        <div className="relative flex items-center justify-center shrink-0" style={{ width: size, height: size }}>
            <svg width={size} height={size} viewBox="0 0 44 44" className="-rotate-90">
                <circle cx="22" cy="22" r={r} fill="none" stroke="#f1f5f9" strokeWidth="4" />
                <circle
                    cx="22" cy="22" r={r} fill="none"
                    stroke={color} strokeWidth="4"
                    strokeDasharray={`${dash} ${circ - dash}`}
                    strokeLinecap="round"
                />
            </svg>
            <span className="absolute text-[11px] font-bold text-slate-700">{score}</span>
        </div>
    );
}

// ── Churn Detail Modal ────────────────────────────────────────
function ChurnDetailModal({ clinicId, clinicName, onClose }) {
    const { t } = useTranslation();
    const [detail, setDetail] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);

    useEffect(() => {
        apiFetch(`/api/superadmin/tenants/${clinicId}/churn-risk`)
            .then(setDetail)
            .catch(() => setError(true))
            .finally(() => setLoading(false));
    }, [clinicId]);

    const factorIcons = {
        NoRecentAppointments: "event_busy",
        DecliningAppointmentVolume: "trending_down",
        InactiveStaffLogin: "person_off",
        SubscriptionExpiringSoon: "alarm",
        NoStaffGrowth: "group_off",
    };

    return (
        <div className="fixed inset-0 z-[999] flex items-center justify-center bg-black/40 p-4" onClick={onClose}>
            <div
                className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto overflow-x-hidden"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="flex items-start justify-between gap-3 p-4 sm:p-6 border-b border-slate-100">
                    <div className="min-w-0">
                        <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-1">
                            {t("superadmin.reports.churn.modal.eyebrow")}
                        </p>
                        <h3 className="text-lg sm:text-xl font-bold text-slate-900 truncate">{clinicName}</h3>
                    </div>
                    <button onClick={onClose} className="p-2 rounded-xl hover:bg-slate-100 text-slate-400 transition-colors shrink-0">
                        <span className="material-symbols-outlined text-xl">close</span>
                    </button>
                </div>

                {/* Body */}
                <div className="p-4 sm:p-6">
                    {loading ? (
                        <div className="flex flex-col items-center justify-center py-12 gap-3">
                            <div className="w-8 h-8 border-2 border-slate-200 border-t-slate-700 rounded-full animate-spin" />
                            <p className="text-sm text-slate-400">{t("superadmin.reports.churn.modal.loading")}</p>
                        </div>
                    ) : error ? (
                        <div className="flex flex-col items-center justify-center py-12 gap-2 text-center">
                            <span className="material-symbols-outlined text-3xl text-red-300">error</span>
                            <p className="text-sm text-slate-400">{t("superadmin.reports.churn.modal.error")}</p>
                        </div>
                    ) : (
                        <>
                            {/* Score + Risk Level */}
                            <div className="flex items-center gap-4 sm:gap-5 mb-6 p-4 bg-slate-50 rounded-xl border border-slate-100">
                                <ScoreRing score={detail.score} size={64} />
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                                        <ChurnBadge level={detail.riskLevel} />
                                        <span className="text-xs text-slate-400 font-medium">
                                            {t("superadmin.reports.churn.modal.riskLevelLabel")}
                                        </span>
                                    </div>
                                    {/* recommendation يترجم محلياً حسب riskLevel، مش النص الخام من الـ backend */}
                                    <p className="text-sm text-slate-600 leading-snug break-words">
                                        {t(`superadmin.reports.churn.recommendation.${detail.riskLevel}`)}
                                    </p>
                                </div>
                            </div>

                            {/* Factors */}
                            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">
                                {t("superadmin.reports.churn.modal.factorsLabel")}
                            </p>
                            <div className="space-y-3">
                                {(detail.factors ?? []).map((f) => (
                                    <div
                                        key={f.factorName}
                                        className={`rounded-xl p-4 border transition-colors ${f.isTriggered
                                            ? "bg-red-50 border-red-100"
                                            : "bg-slate-50 border-slate-100"
                                            }`}
                                    >
                                        <div className="flex items-center gap-2 sm:gap-3 mb-2 flex-wrap">
                                            <span
                                                className={`material-symbols-outlined text-[20px] shrink-0 ${f.isTriggered ? "text-red-500" : "text-slate-300"}`}
                                                style={{ fontVariationSettings: "'FILL' 1" }}
                                            >
                                                {factorIcons[f.factorName] || "circle"}
                                            </span>
                                            {/* description يترجم محلياً حسب factorName، مش النص الخام من الـ backend */}
                                            <p className={`text-sm font-semibold flex-1 min-w-0 break-words ${f.isTriggered ? "text-red-700" : "text-slate-500"}`}>
                                                {t(`superadmin.reports.churn.factors.${f.factorName}`)}
                                            </p>
                                            <span className={`text-xs font-bold px-2 py-0.5 rounded-full shrink-0 ${f.isTriggered ? "bg-red-100 text-red-600" : "bg-slate-100 text-slate-400"
                                                }`}>
                                                {f.pointsContributed}/{f.maxPoints}
                                            </span>
                                        </div>
                                        {/* Progress bar */}
                                        <div className="h-1.5 bg-slate-200 rounded-full overflow-hidden">
                                            <div
                                                className={`h-full rounded-full transition-all ${f.isTriggered ? "bg-red-400" : "bg-slate-300"}`}
                                                style={{ width: `${f.maxPoints > 0 ? (f.pointsContributed / f.maxPoints) * 100 : 0}%` }}
                                            />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}

// ── Churn Risk Table ──────────────────────────────────────────
function ChurnRiskTable({ rows = [], loading }) {
    const { t } = useTranslation();
    const [selected, setSelected] = useState(null);

    const riskOrder = { Critical: 0, High: 1, Medium: 2, Low: 3 };
    const sorted = [...rows].sort(
        (a, b) => (riskOrder[a.churnRiskLevel] ?? 4) - (riskOrder[b.churnRiskLevel] ?? 4)
    );

    const summary = {
        Critical: rows.filter((r) => r.churnRiskLevel === "Critical").length,
        High: rows.filter((r) => r.churnRiskLevel === "High").length,
        Medium: rows.filter((r) => r.churnRiskLevel === "Medium").length,
        Low: rows.filter((r) => r.churnRiskLevel === "Low").length,
    };

    return (
        <>
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden w-full">
                {/* Title */}
                <div className="px-4 sm:px-6 py-5 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="min-w-0">
                        <h3 className="text-lg sm:text-xl font-semibold text-slate-900 flex items-center gap-2">
                            <span className="material-symbols-outlined text-[22px] text-red-500 shrink-0" style={{ fontVariationSettings: "'FILL' 1" }}>
                                crisis_alert
                            </span>
                            <span className="truncate">{t("superadmin.reports.churn.tableTitle")}</span>
                        </h3>
                        <p className="text-sm text-slate-400 mt-0.5">{t("superadmin.reports.churn.tableSubtitle")}</p>
                    </div>
                    {/* Summary pills */}
                    <div className="flex items-center gap-2 flex-wrap">
                        {Object.entries(summary).map(([level, count]) => (
                            count > 0 && (
                                <span key={level} className="text-xs font-bold px-2.5 py-1 rounded-full bg-slate-50 border border-slate-200 text-slate-600 whitespace-nowrap">
                                    {count} {t(`superadmin.reports.churn.riskLevel.${level}`)}
                                </span>
                            )
                        ))}
                    </div>
                </div>

                <div className="overflow-x-auto w-full">
                    <table className="w-full min-w-[640px] text-left">
                        <thead className="bg-slate-50/50">
                            <tr>
                                <th className="px-4 sm:px-6 py-3.5 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">{t("superadmin.reports.churn.colClinic")}</th>
                                <th className="px-4 sm:px-6 py-3.5 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">{t("superadmin.reports.churn.colScore")}</th>
                                <th className="px-4 sm:px-6 py-3.5 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">{t("superadmin.reports.churn.colRisk")}</th>
                                <th className="px-4 sm:px-6 py-3.5 text-[11px] font-semibold text-slate-400 uppercase tracking-wider text-right">{t("superadmin.reports.churn.colDetails")}</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {loading ? (
                                <tr>
                                    <td colSpan={4} className="px-6 py-10 text-center text-slate-400 text-sm">
                                        {t("superadmin.reports.churn.analyzing")}
                                    </td>
                                </tr>
                            ) : sorted.length === 0 ? (
                                <tr>
                                    <td colSpan={4} className="px-6 py-10 text-center text-slate-400 text-sm">
                                        {t("superadmin.reports.churn.noData")}
                                    </td>
                                </tr>
                            ) : (
                                sorted.map((r, i) => (
                                    <tr
                                        key={i}
                                        className={`transition-colors ${r.churnRiskLevel === "Critical" ? "bg-red-50/30 hover:bg-red-50/50"
                                            : r.churnRiskLevel === "High" ? "bg-orange-50/20 hover:bg-orange-50/40"
                                                : "hover:bg-slate-50/50"
                                            }`}
                                    >
                                        <td className="px-4 sm:px-6 py-4 font-medium text-slate-900 text-sm whitespace-nowrap">{r.name}</td>
                                        <td className="px-4 sm:px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <ScoreRing score={r.churnScore ?? 0} size={40} />
                                                <div className="h-1.5 flex-1 max-w-[80px] bg-slate-100 rounded-full hidden sm:block">
                                                    <div
                                                        className={`h-full rounded-full ${(r.churnScore ?? 0) >= 70 ? "bg-red-400"
                                                            : (r.churnScore ?? 0) >= 45 ? "bg-orange-400"
                                                                : (r.churnScore ?? 0) >= 20 ? "bg-amber-400"
                                                                    : "bg-emerald-400"
                                                            }`}
                                                        style={{ width: `${r.churnScore ?? 0}%` }}
                                                    />
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-4 sm:px-6 py-4">
                                            <ChurnBadge level={r.churnRiskLevel} />
                                        </td>
                                        <td className="px-4 sm:px-6 py-4 text-right">
                                            <button
                                                onClick={() => setSelected(r)}
                                                className="inline-flex items-center gap-1 text-xs font-semibold text-blue-600 hover:text-blue-700 hover:bg-blue-50 px-3 py-1.5 rounded-lg transition-colors whitespace-nowrap"
                                            >
                                                <span className="material-symbols-outlined text-[14px]">open_in_new</span>
                                                {t("superadmin.reports.churn.viewAnalysis")}
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {selected && (
                <ChurnDetailModal
                    clinicId={selected.id}
                    clinicName={selected.name}
                    onClose={() => setSelected(null)}
                />
            )}
        </>
    );
}

// ── Leaderboard Table ─────────────────────────────────────────
function Leaderboard({ rows = [], loading }) {
    const { t } = useTranslation();

    const columns = [
        { key: "colName", hideOnMobile: false },
        { key: "colDoctors", hideOnMobile: true },
        { key: "colLoad", hideOnMobile: false },
        { key: "colSatisfaction", hideOnMobile: false },
        { key: "colPatients", hideOnMobile: true },
        { key: "colStatus", hideOnMobile: false },
    ];

    return (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden w-full">
            <div className="px-4 sm:px-6 py-4 border-b border-slate-100">
                <h3 className="text-lg sm:text-xl font-semibold text-slate-900">
                    {t("superadmin.reports.leaderboard.title")}
                </h3>
            </div>

            <div className="overflow-x-auto w-full">
                <table className="w-full min-w-[640px] text-left">
                    <thead className="bg-slate-50/50">
                        <tr>
                            {columns.map(({ key, hideOnMobile }) => (
                                <th
                                    key={key}
                                    className={`px-4 sm:px-6 py-4 text-[12px] font-semibold text-slate-500 uppercase tracking-wider whitespace-nowrap ${hideOnMobile ? "hidden md:table-cell" : ""
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
                                    <td className="px-4 sm:px-6 py-4 font-medium text-slate-900 text-sm whitespace-nowrap">{r.name}</td>
                                    <td className="px-4 sm:px-6 py-4 text-slate-500 text-sm hidden md:table-cell">{r.doctors ?? "—"}</td>
                                    <td className="px-4 sm:px-6 py-4 text-sm">
                                        <div className="flex items-center gap-2">
                                            <div className="flex-1 bg-slate-100 rounded-full h-1.5 max-w-[60px] sm:max-w-[80px]">
                                                <div className="bg-slate-800 h-1.5 rounded-full" style={{ width: `${Math.min(r.load ?? 0, 100)}%` }} />
                                            </div>
                                            <span className="text-slate-500 text-xs whitespace-nowrap">{r.load ?? "—"}%</span>
                                        </div>
                                    </td>
                                    <td className="px-4 sm:px-6 py-4 text-sm">
                                        <div className="flex items-center gap-1 text-amber-500">
                                            <span className="material-symbols-outlined text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                                            <span className="text-slate-700 font-medium">{r.satisfaction ?? "—"}</span>
                                        </div>
                                    </td>
                                    <td className="px-4 sm:px-6 py-4 text-slate-500 text-sm hidden md:table-cell">{r.patients ?? "—"}</td>
                                    <td className="px-4 sm:px-6 py-4"><StatusBadge status={r.status} /></td>
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

    const MONTH_KEYS = ["jan", "feb", "mar", "apr", "may", "jun", "jul", "aug", "sep", "oct", "nov", "dec"];
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
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4 sm:p-6 w-full overflow-hidden">
            <div className="mb-6">
                <h3 className="text-lg sm:text-xl font-semibold text-slate-900">{t("superadmin.reports.growth.title")}</h3>
                <p className="text-sm text-slate-500">{t("superadmin.reports.growth.subtitle")}</p>
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
                    {points.map(([x, y], i) => <circle key={i} cx={x} cy={y} r="4" fill="#131b2e" />)}
                </svg>
            </div>
            <div className="flex justify-between mt-4 text-[8px] sm:text-[10px] text-slate-400 font-bold uppercase tracking-tighter overflow-hidden w-full">
                {data.map((d, i) => (
                    <span key={i} className="truncate px-0.5">
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
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4 sm:p-6 w-full max-w-sm">
            <h3 className="text-lg sm:text-xl font-semibold text-slate-900 mb-1">{t("superadmin.reports.donut.title")}</h3>
            <p className="text-sm text-slate-500 mb-8">{t("superadmin.reports.donut.subtitle")}</p>
            <div className="flex flex-col items-center">
                <div className="relative w-40 h-40 sm:w-48 sm:h-48 flex items-center justify-center">
                    <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                        <circle cx="50" cy="50" r="40" fill="transparent" stroke="#F1F5F9" strokeWidth="12" />
                        <circle cx="50" cy="50" r="40" fill="transparent" stroke="#10b981"
                            strokeDasharray={`${activeDash} ${circ - activeDash}`} strokeLinecap="round" strokeWidth="12" />
                        <circle cx="50" cy="50" r="40" fill="transparent" stroke="#f43f5e"
                            strokeDasharray={`${inactiveDash} ${circ - inactiveDash}`}
                            strokeDashoffset={-activeDash} strokeLinecap="round" strokeWidth="12" />
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <span className="text-2xl font-bold text-slate-900">{total || "—"}</span>
                        <span className="text-[10px] text-slate-400 uppercase font-bold">{t("superadmin.reports.donut.total")}</span>
                    </div>
                </div>
                <div className="w-full mt-8 space-y-3">
                    {[
                        { color: "bg-emerald-500", labelKey: "active", value: active },
                        { color: "bg-rose-500", labelKey: "inactive", value: inactive },
                    ].map(({ color, labelKey, value }) => (
                        <div key={labelKey} className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <div className={`w-3 h-3 rounded-full ${color} shrink-0`} />
                                <span className="text-sm font-medium text-slate-700">{t(`superadmin.reports.donut.${labelKey}`)}</span>
                            </div>
                            <span className="text-sm font-bold text-slate-900">{value}</span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

// ── Page ─────────────────────────────────────────────────────
export default function Reports() {
    const { t } = useTranslation();
    const [leaderboard, setLeaderboard] = useState([]);
    const [growth, setGrowth] = useState([]);
    const [donut, setDonut] = useState({ active: 0, inactive: 0 });
    const [churnRows, setChurnRows] = useState([]);
    const [loading, setLoading] = useState(true);
    const [churnLoading, setChurnLoading] = useState(true);

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
                        active: d.activeClinics ?? 0,
                        inactive: (d.totalClinics ?? 0) - (d.activeClinics ?? 0),
                    });
                }
            } finally {
                setLoading(false);
            }
        }
        load();
    }, []);

    // جلب بيانات Churn من endpoint المنفصل
    useEffect(() => {
        apiFetch("/api/superadmin/tenants")
            .then((data) => {
                const list = data?.data ?? data ?? [];
                // نفلتر العيادات اللي عندها churnScore
                const withChurn = list.filter((c) => c.churnScore != null);
                setChurnRows(withChurn);
            })
            .catch(() => { })
            .finally(() => setChurnLoading(false));
    }, []);

    return (
        <div className="w-full max-w-7xl mx-auto space-y-6 sm:space-y-8 px-4 sm:px-6 lg:px-8 overflow-x-hidden">
            <div>
                <h1 className="text-2xl sm:text-[30px] font-bold text-slate-900">
                    {t("superadmin.reports.title")}
                </h1>
                <p className="text-slate-500 mt-1 text-sm">
                    {t("superadmin.reports.subtitle")}
                </p>
            </div>

            {/* ── Churn Risk Monitor (الجديد) ── */}
            <ChurnRiskTable rows={churnRows} loading={churnLoading} />

            {/* ── باقي الأقسام الموجودة ── */}
            <Leaderboard rows={leaderboard} loading={loading} />
            <GrowthLineChart data={growth} />
            <StatusDonut active={donut.active} inactive={donut.inactive} />
        </div>
    );
}
