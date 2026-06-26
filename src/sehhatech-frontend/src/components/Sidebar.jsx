import { NavLink } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useTranslation } from "react-i18next";

export default function Sidebar({ profile, sidebarOpen }) {
    const { logout } = useAuth();
    const { t } = useTranslation();

    function handleLogout() {
        logout();
        window.location.href = "/login";
    }

    const links = [
        { to: "/doctor/dashboard", icon: "dashboard", label: t("sidebar.dashboard") },
        { to: "/doctor/schedule", icon: "calendar_today", label: t("sidebar.schedule") },
        { to: "/doctor/patients", icon: "folder_shared", label: t("sidebar.patients") },
        { to: "/doctor/profile", icon: "manage_accounts", label: t("sidebar.profile") },
    ];

    return (
        <aside
            id="sidebar"
            className={`
                fixed left-0 top-0 h-full w-[272px]
                bg-white border-r border-slate-200/80
                flex flex-col py-6
                z-[60] shadow-xl
                transition-transform duration-300
                font-manrope
                ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}
            `}
        >
            {/* Brand */}
            <div className="mb-8 px-4 flex items-center gap-3">
                <div className="w-10 h-10 flex-shrink-0">
                    <img
                        src="/logo.png"
                        alt="SehhaTech Logo"
                        className="w-full h-full object-contain"
                    />
                </div>

                <div>
                    <h2 className="text-lg font-extrabold tracking-tight text-slate-900 leading-tight">
                        SehhaTech
                    </h2>

                    <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                        {t("sidebar.doctorPortal")}
                    </p>
                </div>
            </div>

            {/* Nav */}
            <nav className="flex-1 px-0 space-y-1">
                {links.map((link) => (
                    <NavLink
                        key={link.to}
                        to={link.to}
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
                                    <span className="absolute left-0 top-1/2 -translate-y-1/2 h-6 w-1 bg-blue-600 rounded-r-full" />
                                )}

                                <span
                                    className={`material-symbols-outlined text-[22px] transition-transform duration-200 ${isActive
                                            ? "scale-110"
                                            : "group-hover:scale-105"
                                        }`}
                                >
                                    {link.icon}
                                </span>

                                <span>{link.label}</span>
                            </>
                        )}
                    </NavLink>
                ))}
            </nav>

            {/* Logout */}
            <div className="px-3 mt-4 pt-4 border-t border-slate-100">
                <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-3 px-6 py-3 rounded-xl text-slate-500 hover:bg-red-50 hover:text-red-600 text-sm font-medium transition-colors duration-200"
                >
                    <span className="material-symbols-outlined text-[22px]">
                        logout
                    </span>
                    <span>{t("sidebar.logout")}</span>
                </button>
            </div>
        </aside>
    );
}