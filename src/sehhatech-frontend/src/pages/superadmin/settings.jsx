import { useEffect, useState } from "react";
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

// ── Toggle Switch ─────────────────────────────────────────────
function Toggle({ checked, onChange, activeColor = "bg-emerald-500" }) {
  return (
    <label className="relative inline-flex items-center cursor-pointer shrink-0">
      <input type="checkbox" className="sr-only peer" checked={checked} onChange={onChange} />
      <div
        className={`w-11 h-6 rounded-full transition-colors duration-200
          after:content-[''] after:absolute after:top-[2px] after:left-[2px]
          after:bg-white after:border after:border-gray-300 after:rounded-full
          after:h-5 after:w-5 after:transition-all
          ${checked ? (activeColor === "bg-red-500" ? "bg-red-500" : "bg-emerald-500") : "bg-slate-200"}
          ${checked ? "after:translate-x-full" : ""}`}
      />
    </label>
  );
}

// ── Page ─────────────────────────────────────────────────────
export default function Settings() {
  const { t } = useTranslation();

  const [profile, setProfile] = useState({ name: "—", role: "—", email: "—" });
  const [passwords, setPasswords] = useState({ old: "", new: "" });
  const [pwMsg, setPwMsg] = useState(null);
  const [toggles, setToggles] = useState({
    maintenance: false,
    notifications: true,
    auditLogging: true,
  });

  useEffect(() => {
    const name  = localStorage.getItem("fullName");
    const email = localStorage.getItem("email");
    const role  = localStorage.getItem("role");
    setProfile({
      name:  name  ?? t("superadmin.settings.profile.roleValue"),
      role:  role  ?? t("superadmin.settings.profile.roleValue"),
      email: email ?? "—",
    });
  }, [t]);

  async function handleChangePassword() {
    if (!passwords.old || !passwords.new) {
      setPwMsg({ type: "error", text: t("superadmin.settings.security.errorEmpty") });
      return;
    }
    try {
      await apiFetch("/api/SuperAdmin/change-password", {
        method: "POST",
        body: JSON.stringify({ oldPassword: passwords.old, newPassword: passwords.new }),
      });
      setPwMsg({ type: "success", text: t("superadmin.settings.security.successMsg") });
      setPasswords({ old: "", new: "" });
    } catch {
      setPwMsg({ type: "error", text: t("superadmin.settings.security.errorMsg") });
    }
    setTimeout(() => setPwMsg(null), 4000);
  }

  const systemToggles = [
    {
      key: "maintenance",
      icon: "engineering",
      iconBg: "bg-red-50",
      iconColor: "text-red-500",
      activeColor: "bg-red-500",
    },
    {
      key: "notifications",
      icon: "notifications_active",
      iconBg: "bg-blue-50",
      iconColor: "text-blue-600",
      activeColor: "bg-emerald-500",
    },
    {
      key: "auditLogging",
      icon: "list_alt",
      iconBg: "bg-amber-50",
      iconColor: "text-amber-600",
      activeColor: "bg-emerald-500",
    },
  ];

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-8">
        <h2 className="text-2xl sm:text-[30px] font-bold leading-tight sm:leading-[38px] tracking-tight text-slate-900">
          {t("superadmin.settings.title")}
        </h2>
        <p className="text-slate-500 text-sm mt-1">
          {t("superadmin.settings.subtitle")}
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left column */}
        <div className="lg:col-span-4 space-y-6">

          {/* Profile Card */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow duration-200">
            <div className="flex flex-col items-center text-center">
              <div className="w-24 h-24 rounded-full bg-gradient-to-br from-sky-500 to-blue-700 flex items-center justify-center text-white font-bold text-2xl mb-4 shadow-lg shadow-blue-600/20">
                SA
              </div>
              <h3 className="text-xl font-bold text-slate-900 tracking-tight">{profile.name}</h3>
              <p className="text-[12px] font-semibold text-slate-500 uppercase tracking-wider mb-4">
                {profile.role}
              </p>
              <div className="w-full space-y-3 text-left">
                <div>
                  <label className="text-[12px] font-semibold text-slate-400 uppercase tracking-wider block mb-1">
                    {t("superadmin.settings.profile.emailLabel")}
                  </label>
                  <p className="text-sm text-slate-900 break-all">{profile.email}</p>
                </div>
                <div>
                  <label className="text-[12px] font-semibold text-slate-400 uppercase tracking-wider block mb-1">
                    {t("superadmin.settings.profile.roleLabel")}
                  </label>
                  <p className="text-sm text-slate-900">
                    {t("superadmin.settings.profile.roleValue")}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Change Password */}
          <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
            <h3 className="text-xl font-semibold text-slate-900 mb-4">
              {t("superadmin.settings.security.title")}
            </h3>
            <div className="space-y-4">
              <div>
                <label className="text-[12px] font-semibold text-slate-500 uppercase tracking-wider block mb-1.5">
                  {t("superadmin.settings.security.currentPassword")}
                </label>
                <div className="relative">
                  <input
                    type={showOld ? "text" : "password"}
                    placeholder="••••••••"
                    value={passwords.old}
                    onChange={(e) => setPasswords((p) => ({ ...p, old: e.target.value }))}
                    className="w-full bg-white border border-slate-200 rounded-lg py-2 px-3 pr-10 focus:ring-2 focus:ring-slate-300 outline-none transition-all text-sm"
                  />
                  <button
                    type="button"
                    onClick={() => setShowOld((v) => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                    tabIndex={-1}
                  >
                    <span className="material-symbols-outlined text-[18px]">
                      {showOld ? "visibility_off" : "visibility"}
                    </span>
                  </button>
                </div>
              </div>
              <div>
                <label className="text-[12px] font-semibold text-slate-500 uppercase tracking-wider block mb-1.5">
                  {t("superadmin.settings.security.newPassword")}
                </label>
                <input
                  type="password"
                  placeholder={t("superadmin.settings.security.newPasswordPlaceholder")}
                  value={passwords.new}
                  onChange={(e) => setPasswords((p) => ({ ...p, new: e.target.value }))}
                  className="w-full bg-white border border-slate-200 rounded-lg py-2 px-3 focus:ring-2 focus:ring-slate-300 outline-none transition-all text-sm"
                />
              </div>
              {pwMsg && (
                <p className={`text-sm font-medium ${pwMsg.type === "success" ? "text-emerald-600" : "text-red-500"}`}>
                  {pwMsg.text}
                </p>
              )}
              <button
                onClick={handleChangePassword}
                className="w-full bg-blue-600 text-white font-semibold py-2.5 rounded-xl hover:bg-blue-700 transition-all shadow-sm shadow-blue-600/20 text-sm"
              >
                {t("superadmin.settings.security.updateButton")}
              </button>
            </div>
          </div>
        </div>

        {/* Right column */}
        <div className="lg:col-span-8 space-y-6">

          {/* System Toggles */}
          <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-200">
            <div className="p-6 border-b border-slate-200 bg-slate-50/50">
              <h3 className="text-xl sm:text-2xl font-semibold text-slate-900">
                {t("superadmin.settings.toggles.title")}
              </h3>
            </div>
            <div className="divide-y divide-slate-100">
              {systemToggles.map(({ key, icon, iconBg, iconColor, activeColor }) => (
                <div
                  key={key}
                  className="p-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 hover:bg-slate-50/50 transition-colors"
                >
                  <div className="flex gap-4">
                    <div className={`w-10 h-10 rounded-xl ${iconBg} flex items-center justify-center shrink-0`}>
                      <span className={`material-symbols-outlined ${iconColor}`}>{icon}</span>
                    </div>
                    <div>
                      <p className="font-semibold text-slate-900 text-sm">
                        {t(`superadmin.settings.toggles.${key}.title`)}
                      </p>
                      <p className="text-slate-500 text-sm mt-0.5">
                        {t(`superadmin.settings.toggles.${key}.desc`)}
                      </p>
                    </div>
                  </div>
                  <Toggle
                    checked={toggles[key]}
                    onChange={() => setToggles((prev) => ({ ...prev, [key]: !prev[key] }))}
                    activeColor={activeColor}
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Danger Zone */}
          <div className="bg-red-50/30 border border-red-200/60 rounded-2xl p-6">
            <div className="flex items-start gap-4">
              <div className="bg-red-100 p-2 rounded-xl shrink-0">
                <span className="material-symbols-outlined text-red-500">warning</span>
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-red-600 mb-1">
                  {t("superadmin.settings.danger.title")}
                </h3>
                <p className="text-sm text-slate-500 mb-4">
                  {t("superadmin.settings.danger.subtitle")}
                </p>
                <div className="flex flex-wrap gap-3">
                  <button className="w-full sm:w-auto bg-white border border-red-200 text-red-500 px-4 py-2 rounded-lg hover:bg-red-50 transition-all text-sm font-semibold">
                    {t("superadmin.settings.danger.flushCache")}
                  </button>
                  <button className="w-full sm:w-auto bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition-all text-sm font-semibold">
                    {t("superadmin.settings.danger.factoryReset")}
                  </button>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}