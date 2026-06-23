import { useState, useEffect, useRef } from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { superadmin } from "../api/superadmin";

const navItems = [
  { to: "/superadmin/dashboard", icon: "dashboard",        label: "Dashboard" },
  { to: "/superadmin/clinics",   icon: "medical_services", label: "Clinics Management" },
  { to: "/superadmin/reports",   icon: "analytics",        label: "Reports" },
  { to: "/superadmin/settings",  icon: "settings",         label: "Settings" },
];

export default function SuperAdminLayout() {
  const [showLogoutModal, setShowLogoutModal]     = useState(false);
  const [showUserDropdown, setShowUserDropdown]   = useState(false);
  const [showNotifDropdown, setShowNotifDropdown] = useState(false);
  const [adminName, setAdminName]                 = useState("Super Admin");
  const [notifications, setNotifications]         = useState([]);
  const [notifsLoading, setNotifsLoading]         = useState(false);

  const userDropdownRef  = useRef(null);
  const notifDropdownRef = useRef(null);
  const navigate = useNavigate();
  const { logout } = useAuth();

  useEffect(() => {
    superadmin.getProfile()
      .then((res) => {
        const name = res?.data?.fullName || res?.fullName || res?.data?.name || res?.name;
        if (name) setAdminName(name);
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (!showNotifDropdown) return;
    setNotifsLoading(true);
    setNotifications([]);
    setNotifsLoading(false);
  }, [showNotifDropdown]);

  useEffect(() => {
    function handleClick(e) {
      if (userDropdownRef.current && !userDropdownRef.current.contains(e.target))
        setShowUserDropdown(false);
      if (notifDropdownRef.current && !notifDropdownRef.current.contains(e.target))
        setShowNotifDropdown(false);
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  function handleLogout() {
    logout();
    navigate("/login");
  }

  const unreadCount = notifications.filter((n) => !n.isRead).length;
  const initials = adminName
    .split(" ")
    .map((p) => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <div className="flex min-h-screen bg-slate-50 font-manrope">
      {/* ── Sidebar ── */}
      <aside className="bg-white w-[272px] h-screen fixed left-0 top-0 flex flex-col z-50 border-r border-slate-200/80">
        <div className="px-6 pt-8 pb-6 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 to-blue-700 flex items-center justify-center shadow-lg shadow-blue-600/20 shrink-0">
            <span className="material-symbols-outlined text-white text-[22px]">health_and_safety</span>
          </div>
          <div>
            <h1 className="text-lg font-extrabold text-slate-900 tracking-tight leading-tight">SehhaTech</h1>
            <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Super Admin</p>
          </div>
        </div>

        <div className="h-px bg-slate-100 mx-6 mb-4" />

        <nav className="flex-1 px-0 space-y-1 overflow-y-auto">
          {navItems.map(({ to, icon, label }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                `group relative flex items-center gap-3 px-6 py-3 mx-3 rounded-xl text-sm font-medium transition-all duration-200 ${
                  isActive
                    ? "bg-blue-50 text-blue-600 font-semibold"
                    : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"
                }`
              }
            >
              {({ isActive }) => (
                <>
                  {isActive && (
                    <span className="absolute left-0 top-1/2 -translate-y-1/2 h-6 w-1 bg-blue-600 rounded-r-full" />
                  )}
                  <span
                    className={`material-symbols-outlined text-[22px] transition-transform duration-200 ${
                      isActive ? "scale-110" : "group-hover:scale-105"
                    }`}
                  >
                    {icon}
                  </span>
                  <span>{label}</span>
                </>
              )}
            </NavLink>
          ))}
        </nav>

        {/* User Card */}
        <div className="p-4 mt-auto">
          <div className="bg-slate-50 rounded-2xl p-3.5 flex items-center gap-3 border border-slate-100">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-600 to-blue-700 flex items-center justify-center text-white font-bold text-xs shrink-0">
              {initials}
            </div>
            <div className="overflow-hidden flex-1 min-w-0">
              <p className="text-slate-900 font-semibold truncate text-[13px]">{adminName}</p>
              <p className="text-slate-400 text-[11px] truncate">System Controller</p>
            </div>
            <button
              onClick={() => setShowLogoutModal(true)}
              title="Logout"
              className="text-slate-400 hover:text-red-600 transition-colors p-1.5 rounded-lg hover:bg-red-50 shrink-0"
            >
              <span className="material-symbols-outlined text-[19px]">logout</span>
            </button>
          </div>
        </div>
      </aside>

      {/* ── Content area ── */}
      <div className="flex-1 ml-[272px] flex flex-col min-h-screen">

        {/* Top Header */}
        <header className="bg-white/80 backdrop-blur-md h-[68px] w-full sticky top-0 z-40 border-b border-slate-200/70 flex items-center justify-between px-7">
          <div className="flex-1" />
          <div className="flex items-center gap-1.5">

            {/* Notifications */}
            <div className="relative" ref={notifDropdownRef}>
              <button
                onClick={() => {
                  setShowNotifDropdown((v) => !v);
                  setShowUserDropdown(false);
                }}
                className="relative hover:bg-slate-100 rounded-xl p-2.5 text-slate-500 transition-all"
              >
                <span className="material-symbols-outlined text-[22px]">notifications</span>
                {unreadCount > 0 && (
                  <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-red-500 ring-2 ring-white" />
                )}
              </button>

              {showNotifDropdown && (
                <div className="absolute right-0 top-14 w-80 bg-white rounded-2xl shadow-2xl shadow-slate-200/80 border border-slate-100 z-50 overflow-hidden">
                  <div className="px-4 py-3.5 border-b border-slate-100 flex items-center justify-between">
                    <span className="font-semibold text-slate-900 text-sm">Notifications</span>
                    {unreadCount > 0 && (
                      <span className="text-[11px] bg-red-50 text-red-600 font-bold px-2 py-0.5 rounded-full">
                        {unreadCount} new
                      </span>
                    )}
                  </div>
                  <div className="max-h-72 overflow-y-auto divide-y divide-slate-50">
                    {notifsLoading ? (
                      <div className="px-4 py-10 text-center text-slate-400 text-sm">Loading...</div>
                    ) : notifications.length === 0 ? (
                      <div className="px-4 py-10 text-center text-slate-400 text-sm flex flex-col items-center gap-2">
                        <span className="material-symbols-outlined text-3xl text-slate-300">notifications_off</span>
                        No notifications yet
                      </div>
                    ) : notifications.map((n, i) => (
                      <div
                        key={i}
                        className={`px-4 py-3 hover:bg-slate-50 transition-colors ${!n.isRead ? "bg-blue-50/40" : ""}`}
                      >
                        <p className="text-sm text-slate-800 font-medium">{n.title ?? n.message}</p>
                        {n.body && <p className="text-xs text-slate-500 mt-0.5">{n.body}</p>}
                        {n.createdAt && (
                          <p className="text-[10px] text-slate-400 mt-1">
                            {new Date(n.createdAt).toLocaleString()}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="h-7 w-px bg-slate-200 mx-2" />

            {/* Admin Dropdown */}
            <div className="relative" ref={userDropdownRef}>
              <button
                onClick={() => {
                  setShowUserDropdown((v) => !v);
                  setShowNotifDropdown(false);
                }}
                className="flex items-center gap-2.5 hover:bg-slate-100 rounded-xl pl-2 pr-3 py-1.5 transition-all"
              >
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-slate-800 to-slate-900 flex items-center justify-center text-white text-[11px] font-bold">
                  {initials}
                </div>
                <span className="font-semibold text-slate-800 text-[13px] hidden sm:block">{adminName}</span>
                <span className="material-symbols-outlined text-slate-400 text-[18px]">
                  {showUserDropdown ? "expand_less" : "expand_more"}
                </span>
              </button>

              {showUserDropdown && (
                <div className="absolute right-0 top-14 w-56 bg-white rounded-2xl shadow-2xl shadow-slate-200/80 border border-slate-100 z-50 overflow-hidden">
                  <div className="px-4 py-3.5 border-b border-slate-100">
                    <p className="font-semibold text-slate-900 text-sm">{adminName}</p>
                    <p className="text-xs text-slate-400">System Controller</p>
                  </div>
                  <div className="py-1.5">
                    <button
                      onClick={() => { navigate("/superadmin/settings"); setShowUserDropdown(false); }}
                      className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50 transition-colors"
                    >
                      <span className="material-symbols-outlined text-[18px] text-slate-400">manage_accounts</span>
                      Profile Settings
                    </button>
                    <button
                      onClick={() => { setShowLogoutModal(true); setShowUserDropdown(false); }}
                      className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors"
                    >
                      <span className="material-symbols-outlined text-[18px]">logout</span>
                      Logout
                    </button>
                  </div>
                </div>
              )}
            </div>

          </div>
        </header>

        <main className="flex-1 p-7 bg-slate-50">
          <Outlet />
        </main>
      </div>

      {/* Logout Modal */}
      {showLogoutModal && (
        <div className="fixed inset-0 z-[999] flex items-center justify-center bg-slate-900/40 backdrop-blur-sm">
          <div className="bg-white rounded-3xl shadow-2xl p-8 w-[380px] flex flex-col items-center gap-4">
            <div className="p-3.5 bg-red-50 rounded-2xl">
              <span className="material-symbols-outlined text-red-500 text-3xl">logout</span>
            </div>
            <h3 className="text-lg font-bold text-slate-900">Confirm Logout</h3>
            <p className="text-sm text-slate-500 text-center leading-relaxed">
              Are you sure you want to logout from your Super Admin session?
            </p>
            <div className="flex gap-3 w-full mt-2">
              <button
                onClick={() => setShowLogoutModal(false)}
                className="flex-1 border border-slate-200 text-slate-700 font-semibold py-2.5 rounded-xl hover:bg-slate-50 transition-all text-sm"
              >
                Cancel
              </button>
              <button
                onClick={handleLogout}
                className="flex-1 bg-red-500 text-white font-semibold py-2.5 rounded-xl hover:bg-red-600 transition-all text-sm"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
