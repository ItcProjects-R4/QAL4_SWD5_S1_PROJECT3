import { useState, useEffect, useRef } from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useAuth } from "../context/AuthContext";
import { superadmin } from "../api/superadmin";

export default function SuperAdminLayout() {
    const { t, i18n } = useTranslation();
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [showLogoutModal, setShowLogoutModal] = useState(false);
    const [showUserDropdown, setShowUserDropdown] = useState(false);
    const [showNotifDropdown, setShowNotifDropdown] = useState(false);
    const [adminName, setAdminName] = useState("Super Admin");
    const [notifications, setNotifications] = useState([]);
    const [notifsLoading, setNotifsLoading] = useState(false);

    const userDropdownRef = useRef(null);
    const notifDropdownRef = useRef(null);
    const navigate = useNavigate();
    const { logout } = useAuth();

    const navItems = [
        { to: "/superadmin/dashboard", icon: "dashboard", label: t("superadmin.nav.dashboard") },
        { to: "/superadmin/clinics", icon: "medical_services", label: t("superadmin.nav.clinics") },
        { to: "/superadmin/reports", icon: "analytics", label: t("superadmin.nav.reports") },
        { to: "/superadmin/monthly-reports", icon: "calendar_month", label: t("superadmin.nav.monthlyReports") },
        { to: "/superadmin/settings", icon: "settings", label: t("superadmin.nav.settings") },
    ];

    useEffect(() => {
        superadmin.getProfile()
            .then((res) => {
                const name = res?.data?.fullName || res?.fullName || res?.data?.name || res?.name;
                if (name) setAdminName(name);
            })
            .catch(() => { });
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

    function toggleLanguage() {
        const next = i18n.language === "ar" ? "en" : "ar";
        i18n.changeLanguage(next);
    }

    const unreadCount = notifications.filter((n) => !n.isRead).length;
    const initials = adminName
        .split(" ")
        .map((p) => p[0])
        .slice(0, 2)
        .join("")
        .toUpperCase();

    const isRTL = i18n.language === 'ar';
    const sidebarTranslate = sidebarOpen
        ? 'translate-x-0'
        : isRTL ? 'translate-x-full' : '-translate-x-full';

    return (
        <div className="flex min-h-screen bg-slate-50 font-manrope">

            {/* ── Mobile backdrop ── */}
            {sidebarOpen && (
                <div
                    className="fixed inset-0 bg-black/40 z-40 md:hidden"
                    onClick={() => setSidebarOpen(false)}
                    aria-hidden="true"
                />
            )}

            {/* ── Sidebar ── */}
            <aside className={`bg-white w-[272px] h-screen fixed start-0 top-0 flex flex-col z-50 border-e border-slate-200/80 transition-transform duration-300 ${sidebarTranslate} md:translate-x-0`}>

                {/* Logo / Brand */}
                <div className="px-6 pt-8 pb-6 flex items-center gap-3 group">
                    <img
                        src="/logo.png"
                        alt="SehhaTech Logo"
                        className="w-14 h-14 object-contain shrink-0 transition-transform duration-300 group-hover:scale-105"
                    />
                    <div>
                        <h1 className="text-[19px] font-extrabold text-blue-600 tracking-tight leading-tight">
                            SehhaTech
                        </h1>
                        <p className="text-[10.5px] font-bold text-slate-400 uppercase tracking-[0.12em] mt-0.5">
                            {t("superadmin.brand.superAdmin")}
                        </p>
                    </div>
                </div>

                <div className="h-px bg-slate-100 mx-6 mb-4" />

                <nav className="flex-1 px-0 space-y-1 overflow-y-auto">
                    {navItems.map(({ to, icon, label }) => (
                        <NavLink
                            key={to}
                            to={to}
                            onClick={() => setSidebarOpen(false)}
                            className={({ isActive }) =>
                                `group relative flex items-center gap-3 px-6 py-3 mx-3 rounded-xl text-sm font-medium transition-all duration-200 ${isActive
                                    ? "bg-blue-50 text-blue-600 font-semibold"
                                    : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"
                                }`
                            }
                        >
                            {({ isActive }) => (
                                <>
                                    {isActive && (
                                        <span className="absolute start-0 top-1/2 -translate-y-1/2 h-6 w-1 bg-blue-600 rounded-e-full" />
                                    )}
                                    <span
                                        className={`material-symbols-outlined text-[22px] transition-transform duration-200 ${isActive ? "scale-110" : "group-hover:scale-105"
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
                            <p className="text-slate-400 text-[11px] truncate">{t("superadmin.brand.systemController")}</p>
                        </div>
                        <button
                            onClick={() => setShowLogoutModal(true)}
                            title={t("superadmin.actions.logout")}
                            className="text-slate-400 hover:text-red-600 transition-colors p-1.5 rounded-lg hover:bg-red-50 shrink-0"
                        >
                            <span className="material-symbols-outlined text-[19px]">logout</span>
                        </button>
                    </div>
                </div>
            </aside>

            {/* ── Content area ── */}
            <div className="flex-1 md:ms-[272px] flex flex-col min-h-screen">

                {/* Top Header */}
                <header className="bg-white/80 backdrop-blur-md h-[68px] w-full sticky top-0 z-40 border-b border-slate-200/70 flex items-center justify-between px-7">
                    {/* Hamburger — mobile only */}
                    <button
                        onClick={() => setSidebarOpen(v => !v)}
                        className="md:hidden p-2 rounded-xl hover:bg-slate-100 transition-colors me-2"
                        aria-label="Toggle menu"
                        aria-expanded={sidebarOpen}
                    >
                        <span className="material-symbols-outlined text-[22px] text-slate-600">
                            {sidebarOpen ? 'close' : 'menu'}
                        </span>
                    </button>
                    <div className="flex-1" />
                    <div className="flex items-center gap-1.5">

                        {/* Language Switcher */}
                        <button
                            onClick={toggleLanguage}
                            className="flex items-center gap-1.5 hover:bg-slate-100 rounded-xl px-3 py-2.5 text-slate-500 text-sm font-semibold transition-all"
                            title={t("common.switchLanguage")}
                        >
                            <span className="material-symbols-outlined text-[20px]">language</span>
                            {i18n.language === "ar" ? "EN" : "AR"}
                        </button>

                        <div className="h-7 w-px bg-slate-200 mx-1" />

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
                                    <span className="absolute top-2 end-2 w-2 h-2 rounded-full bg-red-500 ring-2 ring-white" />
                                )}
                            </button>

                            {showNotifDropdown && (
                                <div className="absolute end-0 top-14 w-80 bg-white rounded-2xl shadow-2xl shadow-slate-200/80 border border-slate-100 z-50 overflow-hidden">
                                    <div className="px-4 py-3.5 border-b border-slate-100 flex items-center justify-between">
                                        <span className="font-semibold text-slate-900 text-sm">{t("superadmin.notifications.title")}</span>
                                        {unreadCount > 0 && (
                                            <span className="text-[11px] bg-red-50 text-red-600 font-bold px-2 py-0.5 rounded-full">
                                                {t("superadmin.notifications.newCount", { count: unreadCount })}
                                            </span>
                                        )}
                                    </div>
                                    <div className="max-h-72 overflow-y-auto divide-y divide-slate-50">
                                        {notifsLoading ? (
                                            <div className="px-4 py-10 text-center text-slate-400 text-sm">{t("superadmin.notifications.loading")}</div>
                                        ) : notifications.length === 0 ? (
                                            <div className="px-4 py-10 text-center text-slate-400 text-sm flex flex-col items-center gap-2">
                                                <span className="material-symbols-outlined text-3xl text-slate-300">notifications_off</span>
                                                {t("superadmin.notifications.empty")}
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
                                className="flex items-center gap-2.5 hover:bg-slate-100 rounded-xl ps-2 pe-3 py-1.5 transition-all"
                            >
                                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-600 to-blue-700 flex items-center justify-center text-white text-[11px] font-bold">
                                    {initials}
                                </div>
                                <span className="font-semibold text-slate-800 text-[13px] hidden sm:block">{adminName}</span>
                                <span className="material-symbols-outlined text-slate-400 text-[18px]">
                                    {showUserDropdown ? "expand_less" : "expand_more"}
                                </span>
                            </button>

                            {showUserDropdown && (
                                <div className="absolute end-0 top-14 w-56 bg-white rounded-2xl shadow-2xl shadow-slate-200/80 border border-slate-100 z-50 overflow-hidden">
                                    <div className="px-4 py-3.5 border-b border-slate-100">
                                        <p className="font-semibold text-slate-900 text-sm">{adminName}</p>
                                        <p className="text-xs text-slate-400">{t("superadmin.brand.systemController")}</p>
                                    </div>
                                    <div className="py-1.5">
                                        <button
                                            onClick={() => { navigate("/superadmin/settings"); setShowUserDropdown(false); }}
                                            className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50 transition-colors"
                                        >
                                            <span className="material-symbols-outlined text-[18px] text-slate-400">manage_accounts</span>
                                            {t("superadmin.actions.profileSettings")}
                                        </button>
                                        <button
                                            onClick={() => { setShowLogoutModal(true); setShowUserDropdown(false); }}
                                            className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors"
                                        >
                                            <span className="material-symbols-outlined text-[18px]">logout</span>
                                            {t("superadmin.actions.logout")}
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
                        <h3 className="text-lg font-bold text-slate-900">{t("superadmin.logoutModal.title")}</h3>
                        <p className="text-sm text-slate-500 text-center leading-relaxed">
                            {t("superadmin.logoutModal.message")}
                        </p>
                        <div className="flex gap-3 w-full mt-2">
                            <button
                                onClick={() => setShowLogoutModal(false)}
                                className="flex-1 border border-slate-200 text-slate-700 font-semibold py-2.5 rounded-xl hover:bg-slate-50 transition-all text-sm"
                            >
                                {t("superadmin.logoutModal.cancel")}
                            </button>
                            <button
                                onClick={handleLogout}
                                className="flex-1 bg-red-500 text-white font-semibold py-2.5 rounded-xl hover:bg-red-600 transition-all text-sm"
                            >
                                {t("superadmin.logoutModal.confirm")}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}