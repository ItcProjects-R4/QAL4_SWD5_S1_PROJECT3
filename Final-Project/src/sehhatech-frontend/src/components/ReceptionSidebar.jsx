import { useState, useEffect } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useTranslation } from "react-i18next";
import logo from "../assets/images/sehhatech-logo.jpeg";

const navItems = [
    { to: "/reception/dashboard", icon: "dashboard", labelKey: "reception.sidebar.dashboard" },
    { to: "/reception/patients", icon: "group", labelKey: "reception.sidebar.patients" },
    { to: "/reception/appointments", icon: "calendar_month", labelKey: "reception.sidebar.appointments" },
    { to: "/reception/payments", icon: "payments", labelKey: "reception.sidebar.payments" },
];

function SidebarInner({ isRtl, onClose, handleLogout, linkClass, t }) {
    return (
        <>
            <div className="px-6 mb-8 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-xl bg-white border border-slate-200 flex items-center justify-center overflow-hidden shadow-sm">
                        <img src={logo} alt="SehhaTech Logo" className="w-full h-full object-cover" />
                    </div>
                    <div>
                        <h2 className="text-lg font-extrabold tracking-tight text-slate-900 font-manrope leading-tight">
                            SehhaTech
                        </h2>
                        <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                            {t("reception.sidebar.receptionPortal")}
                        </p>
                    </div>
                </div>
                <button onClick={onClose} className="p-2 rounded-lg hover:bg-slate-100 text-slate-500 lg:hidden transition-colors">
                    <span className="material-symbols-outlined">close</span>
                </button>
            </div>

            <nav className="flex-1 px-0 space-y-1">
                {navItems.map((item) => (
                    <NavLink key={item.to} to={item.to} className={linkClass} onClick={onClose}>
                        {({ isActive }) => (
                            <>
                                {isActive && isRtl && (
                                    <span className="absolute right-0 top-1/2 -translate-y-1/2 h-6 w-1 bg-blue-600 rounded-l-full" />
                                )}
                                {isActive && !isRtl && (
                                    <span className="absolute left-0 top-1/2 -translate-y-1/2 h-6 w-1 bg-blue-600 rounded-r-full" />
                                )}
                                <span className={`material-symbols-outlined text-[22px] transition-transform duration-200 ${isActive ? "scale-110" : "group-hover:scale-105"}`}>
                                    {item.icon}
                                </span>
                                <span>{t(item.labelKey)}</span>
                            </>
                        )}
                    </NavLink>
                ))}
            </nav>

            <div className="px-3 mt-4 pt-4 border-t border-slate-100">
                <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-3 px-6 py-3 rounded-xl text-slate-500 hover:bg-red-50 hover:text-red-600 text-sm font-manrope font-medium transition-colors duration-200"
                >
                    <span className="material-symbols-outlined text-[22px]">logout</span>
                    <span>{t("reception.sidebar.logout")}</span>
                </button>
            </div>
        </>
    );
}

export default function ReceptionSidebar({ isOpen, onClose }) {
    const { logout } = useAuth();
    const navigate = useNavigate();
    const { t, i18n } = useTranslation("common");

    // state منفصل عشان يضمن re-render لما اللغة تتغير
    const [lang, setLang] = useState(i18n.language);

    useEffect(() => {
        const handler = (lng) => setLang(lng);
        i18n.on("languageChanged", handler);
        return () => i18n.off("languageChanged", handler);
    }, [i18n]);

    const isRtl = lang === "ar";

    function handleLogout() {
        logout();
        navigate("/login");
    }

    const linkClass = ({ isActive }) =>
        `group relative flex items-center gap-3 px-6 py-3 mx-3 rounded-xl text-sm font-manrope transition-all duration-200 ${isActive
            ? "bg-blue-50 text-blue-600 font-semibold"
            : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"
        }`;

    const innerProps = { isRtl, onClose, handleLogout, linkClass, t };

    return (
        <>
            {isOpen && (
                <div
                    className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[60] lg:hidden transition-opacity"
                    onClick={onClose}
                />
            )}

            {/* عربي → يمين */}
            {isRtl && (
                <aside className={`fixed top-0 right-0 h-screen w-[260px] bg-white border-l border-slate-200/80 flex flex-col py-6 z-[70] transition-transform duration-300 ease-out lg:translate-x-0 lg:flex ${isOpen ? "translate-x-0" : "translate-x-full"}`}>
                    <SidebarInner {...innerProps} />
                </aside>
            )}

            {/* إنجليزي → شمال */}
            {!isRtl && (
                <aside className={`fixed top-0 left-0 h-screen w-[260px] bg-white border-r border-slate-200/80 flex flex-col py-6 z-[70] transition-transform duration-300 ease-out lg:translate-x-0 lg:flex ${isOpen ? "translate-x-0" : "-translate-x-full"}`}>
                    <SidebarInner {...innerProps} />
                </aside>
            )}
        </>
    );
}