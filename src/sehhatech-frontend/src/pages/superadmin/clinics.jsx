import { useEffect, useState, useCallback } from "react";
import { useTranslation } from "react-i18next";

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

function StatusBadge({ isActive }) {
  const { t } = useTranslation();
  return (
    <span className={`text-xs font-bold px-2.5 py-1 rounded-full whitespace-nowrap ${
      isActive ? "bg-emerald-50 text-emerald-700" : "bg-amber-50 text-amber-700"
    }`}>
      {isActive
        ? t("superadmin.clinics.table.active")
        : t("superadmin.clinics.table.inactive")}
    </span>
  );
}

function DeleteModal({ clinic, onCancel, onConfirm }) {
  const { t } = useTranslation();
  return (
    <div className="fixed inset-0 z-[999] flex items-center justify-center bg-black/40 p-4">
      <div className="bg-white rounded-2xl shadow-xl p-6 sm:p-8 w-full max-w-[360px] flex flex-col items-center gap-4">
        <div className="p-3 bg-red-50 rounded-full">
          <span className="material-symbols-outlined text-red-500 text-3xl">delete</span>
        </div>
        <h3 className="text-xl font-semibold text-slate-900">
          {t("superadmin.clinics.deleteModal.title")}
        </h3>
        <p className="text-sm text-slate-500 text-center">
          {t("superadmin.clinics.deleteModal.message", { name: "" }).split(clinic?.name ?? "")[0]}
          <span className="font-semibold text-slate-900">{clinic?.name}</span>
          {t("superadmin.clinics.deleteModal.message", { name: "" }).split(clinic?.name ?? "")[1]}
        </p>
        <div className="flex gap-3 w-full mt-2">
          <button onClick={onCancel}
            className="flex-1 border border-slate-200 text-slate-700 font-semibold py-2 rounded-xl hover:bg-slate-50 transition-all">
            {t("superadmin.clinics.deleteModal.cancel")}
          </button>
          <button onClick={onConfirm}
            className="flex-1 bg-red-500 text-white font-semibold py-2 rounded-xl hover:bg-red-600 transition-all">
            {t("superadmin.clinics.deleteModal.confirm")}
          </button>
        </div>
      </div>
    </div>
  );
}

const PAGE_SIZE = 10;

export default function Clinics() {
  const { t } = useTranslation();
  const [allClinics, setAllClinics] = useState([]);
  const [stats, setStats]           = useState({ total: 0, active: 0, inactive: 0 });
  const [loading, setLoading]       = useState(true);
  const [search, setSearch]         = useState("");
  const [statusFilter, setStatus]   = useState("All");
  const [page, setPage]             = useState(1);
  const [deleteTarget, setDeleteTarget] = useState(null);

  const fetchClinics = useCallback(async () => {
    setLoading(true);
    try {
      const data = await apiFetch("/api/SuperAdmin/tenants");
      const list = data?.data ?? data ?? [];
      setAllClinics(list);
      const active   = list.filter((c) => c.isActive === true).length;
      const inactive = list.length - active;
      setStats({ total: list.length, active, inactive });
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchClinics(); }, [fetchClinics]);

  const filtered = allClinics.filter((c) => {
    const matchSearch =
      !search ||
      c.name?.toLowerCase().includes(search.toLowerCase()) ||
      c.email?.toLowerCase().includes(search.toLowerCase());
    const matchStatus =
      statusFilter === "All" ||
      (statusFilter === "Active" && c.isActive === true) ||
      (statusFilter === "Inactive" && c.isActive === false);
    return matchSearch && matchStatus;
  });

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const paginated  = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  async function handleDelete() {
    if (!deleteTarget) return;
    try {
      await apiFetch(`/api/SuperAdmin/tenants/${deleteTarget.id}`, { method: "DELETE" });
      setDeleteTarget(null);
      fetchClinics();
    } catch (e) {
      console.error(e);
    }
  }

  async function toggleStatus(clinic) {
    try {
      await apiFetch(`/api/SuperAdmin/tenants/${clinic.id}/toggle`, { method: "PUT" });
      fetchClinics();
    } catch (e) {
      console.error(e);
    }
  }

  const statsConfig = [
    { icon: "apartment",       bg: "bg-blue-50",    iconColor: "text-blue-600",   label: t("superadmin.clinics.stats.total"),    value: stats.total },
    { icon: "check_circle",    bg: "bg-emerald-50", iconColor: "text-emerald-600", label: t("superadmin.clinics.stats.active"),   value: stats.active },
    { icon: "pending_actions", bg: "bg-amber-50",   iconColor: "text-amber-600",  label: t("superadmin.clinics.stats.inactive"), value: stats.inactive },
  ];

  const from = filtered.length === 0 ? 0 : (page - 1) * PAGE_SIZE + 1;
  const to   = Math.min(page * PAGE_SIZE, filtered.length);

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl sm:text-[30px] font-bold leading-tight sm:leading-[38px] tracking-tight text-slate-900">
            {t("superadmin.clinics.title")}
          </h1>
          <p className="text-slate-500 mt-1 text-sm">{t("superadmin.clinics.subtitle")}</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 gap-4 mb-8 md:grid-cols-3">
        {statsConfig.map(({ icon, bg, iconColor, label, value }) => (
          <div key={label} className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center gap-4">
            <div className={`w-12 h-12 ${bg} flex items-center justify-center rounded-lg shrink-0`}>
              <span className={`material-symbols-outlined ${iconColor}`}>{icon}</span>
            </div>
            <div>
              <p className="text-sm text-slate-500 font-medium">{label}</p>
              <p className="text-xl font-semibold text-slate-900">{value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Filter Bar */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 mb-6 flex flex-col sm:flex-row sm:flex-wrap items-stretch sm:items-center gap-4">
        <div className="flex items-center gap-2 text-sm font-semibold text-slate-700 whitespace-nowrap">
          <span className="material-symbols-outlined text-slate-400">filter_list</span>
          {t("superadmin.clinics.filter.label")}
        </div>
        <input
          type="text"
          placeholder={t("superadmin.clinics.filter.searchPlaceholder")}
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          className="bg-slate-50 border border-slate-200 rounded-lg text-sm px-3 py-2 outline-none focus:ring-2 focus:ring-slate-300 w-full sm:w-auto sm:min-w-[200px]"
        />
        <select
          value={statusFilter}
          onChange={(e) => { setStatus(e.target.value); setPage(1); }}
          className="bg-slate-50 border border-slate-200 rounded-lg text-sm px-3 py-2 outline-none focus:ring-2 focus:ring-slate-300 w-full sm:w-auto sm:min-w-[140px]"
        >
          <option value="All">{t("superadmin.clinics.filter.allStatuses")}</option>
          <option value="Active">{t("superadmin.clinics.filter.active")}</option>
          <option value="Inactive">{t("superadmin.clinics.filter.inactive")}</option>
        </select>
        <button
          onClick={() => { setSearch(""); setStatus("All"); setPage(1); }}
          className="sm:ml-auto text-sm font-medium text-slate-500 hover:text-slate-900 transition-colors text-left sm:text-right"
        >
          {t("superadmin.clinics.filter.clear")}
        </button>
      </div>

      {/* Table */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                {[
                  { key: "colName",    cls: "" },
                  { key: "colPhone",   cls: "hidden sm:table-cell" },
                  { key: "colEmail",   cls: "hidden sm:table-cell" },
                  { key: "colStatus",  cls: "" },
                  { key: "colActions", cls: "text-right" },
                ].map(({ key, cls }) => (
                  <th key={key} className={`px-4 sm:px-6 py-4 text-sm font-semibold text-slate-600 ${cls}`}>
                    {t(`superadmin.clinics.table.${key}`)}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr><td colSpan={5} className="px-6 py-10 text-center text-slate-400 text-sm">
                  {t("superadmin.clinics.table.loading")}
                </td></tr>
              ) : paginated.length === 0 ? (
                <tr><td colSpan={5} className="px-6 py-10 text-center text-slate-400 text-sm">
                  {t("superadmin.clinics.table.empty")}
                </td></tr>
              ) : paginated.map((c) => (
                <tr key={c.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-4 sm:px-6 py-4">
                    <p className="font-semibold text-slate-900 text-sm">{c.name}</p>
                  </td>
                  <td className="px-4 sm:px-6 py-4 text-slate-500 text-sm hidden sm:table-cell">{c.phone ?? "—"}</td>
                  <td className="px-4 sm:px-6 py-4 text-slate-500 text-sm hidden sm:table-cell">{c.email ?? "—"}</td>
                  <td className="px-4 sm:px-6 py-4"><StatusBadge isActive={c.isActive} /></td>
                  <td className="px-4 sm:px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => toggleStatus(c)}
                        title={c.isActive
                          ? t("superadmin.clinics.table.deactivate")
                          : t("superadmin.clinics.table.activate")}
                        className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-500 transition-colors"
                      >
                        <span className="material-symbols-outlined text-sm">
                          {c.isActive ? "pause_circle" : "play_circle"}
                        </span>
                      </button>
                      <button
                        onClick={() => setDeleteTarget(c)}
                        title={t("superadmin.clinics.table.delete")}
                        className="p-1.5 rounded-lg hover:bg-red-50 text-red-400 transition-colors"
                      >
                        <span className="material-symbols-outlined text-sm">delete</span>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="px-4 sm:px-6 py-4 border-t border-slate-200 flex flex-col sm:flex-row items-center sm:justify-between gap-3">
          <p className="text-sm text-slate-500 text-center sm:text-left">
            {t("superadmin.clinics.pagination.showing", { from, to, total: filtered.length })}
          </p>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="p-2 border border-slate-200 rounded-lg hover:bg-slate-50 disabled:opacity-40 transition-colors"
            >
              <span className="material-symbols-outlined text-sm">chevron_left</span>
            </button>
            <span className="text-sm text-slate-600 font-medium">{page} / {totalPages || 1}</span>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page >= totalPages}
              className="p-2 border border-slate-200 rounded-lg hover:bg-slate-50 disabled:opacity-40 transition-colors"
            >
              <span className="material-symbols-outlined text-sm">chevron_right</span>
            </button>
          </div>
        </div>
      </div>

      {deleteTarget && (
        <DeleteModal
          clinic={deleteTarget}
          onCancel={() => setDeleteTarget(null)}
          onConfirm={handleDelete}
        />
      )}
    </div>
  );
}