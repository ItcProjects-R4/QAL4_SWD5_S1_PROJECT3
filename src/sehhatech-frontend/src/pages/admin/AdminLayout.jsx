import { useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import LanguageSwitcher from '../../components/LanguageSwitcher';

export default function AdminLayout() {
    const navigate = useNavigate();
    const { t, i18n } = useTranslation();
    const isRTL = i18n.language === 'ar';
    const [sidebarOpen, setSidebarOpen] = useState(false);

    const storedName = localStorage.getItem('fullName');
    const name = storedName || t('admin.layout.defaultUserName');

    const navItems = [
        { to: '/admin/dashboard', icon: 'dashboard', label: t('admin.layout.navDashboard') },
        { to: '/admin/doctors', icon: 'groups', label: t('admin.layout.navDoctors') },
        { to: '/admin/receptionists', icon: 'support_agent', label: t('admin.layout.navReceptionists') },
        { to: '/admin/settings', icon: 'settings', label: t('admin.layout.navSettings') },
    ];

    function handleLogout() {
        localStorage.clear();
        sessionStorage.clear();
        window.location.href = '/login';
    }

    // Hide sidebar off-screen on mobile, always visible on md+
    const sidebarTranslate = sidebarOpen
        ? 'translate-x-0'
        : isRTL ? 'translate-x-full' : '-translate-x-full';

    return (
        <div className="min-h-screen bg-slate-50 flex">

            {/* ── Mobile backdrop ── */}
            {sidebarOpen && (
                <div
                    className="fixed inset-0 bg-black/40 z-40 md:hidden"
                    onClick={() => setSidebarOpen(false)}
                    aria-hidden="true"
                />
            )}

            {/* ── Sidebar ── */}
            <aside
                className={`
                    fixed top-0 start-0 h-screen w-64
                    bg-white border-e border-slate-100
                    flex flex-col py-6 z-50
                    transition-transform duration-300
                    ${sidebarTranslate} md:translate-x-0
                `}
            >
                {/* Logo */}
                <div className="px-6 mb-6 flex items-center gap-3">
                    <img
                        src="/logo.png"
                        alt="SehhaTech Logo"
                        className="w-10 h-10 object-contain"
                    />
                    <div>
                        <div className="font-extrabold text-[#002045] text-sm leading-tight">SehhaTech</div>
                        <div className="text-[10px] text-slate-400 tracking-wide">{t('admin.layout.adminPanel')}</div>
                    </div>
                </div>

                {/* Nav */}
                <nav className="flex-1 px-3 space-y-1">
                    {navItems.map((item) => (
                        <NavLink
                            key={item.to}
                            to={item.to}
                            onClick={() => setSidebarOpen(false)}
                            className={({ isActive }) =>
                                `flex items-center px-4 py-3 gap-3 rounded-lg text-sm font-medium transition-all ${isActive
                                    ? 'bg-blue-50 text-[#002045] font-semibold'
                                    : 'text-slate-500 hover:bg-slate-100 hover:text-slate-800'
                                }`
                            }
                        >
                            <span className="material-symbols-outlined text-[20px]">{item.icon}</span>
                            {item.label}
                        </NavLink>
                    ))}
                </nav>

                {/* Logout */}
                <div className="px-4 pt-4 border-t border-slate-100">
                    <button
                        onClick={handleLogout}
                        className="w-full flex items-center px-4 py-2 gap-3 text-red-500 text-sm font-semibold hover:bg-red-50 rounded-lg transition-colors"
                    >
                        <span className="material-symbols-outlined text-[20px]">logout</span>
                        {t('admin.layout.logout')}
                    </button>
                </div>
            </aside>

            {/* ── Main area ── */}
            <div className="flex-1 flex flex-col min-h-screen md:ms-64">

                {/* Header */}
                <header className="fixed top-0 start-0 end-0 z-40 h-16 bg-white/80 backdrop-blur border-b border-slate-100 flex items-center justify-between px-4 sm:px-8 md:ms-64">
                    <div className="flex items-center gap-3">

                        {/* Hamburger — mobile only */}
                        <button
                            onClick={() => setSidebarOpen(v => !v)}
                            className="md:hidden p-2 rounded-lg hover:bg-slate-100 transition-colors"
                            aria-label={t('admin.layout.toggleMenu', 'Toggle menu')}
                            aria-expanded={sidebarOpen}
                        >
                            <span className="material-symbols-outlined text-[22px] text-slate-600">
                                {sidebarOpen ? 'close' : 'menu'}
                            </span>
                        </button>

                        <h2 className="text-base sm:text-lg font-bold text-[#002045]">
                            {t('admin.layout.adminPanel')}
                        </h2>
                    </div>

                    <div className="flex items-center gap-2 sm:gap-3">
                        <LanguageSwitcher />
                        <div className="w-8 h-8 rounded-full bg-[#002045] flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                            {name.charAt(0).toUpperCase()}
                        </div>
                        <span className="text-sm font-semibold text-slate-800 hidden sm:block">{name}</span>
                    </div>
                </header>

                {/* Page content */}
                <main className="pt-20 pb-12 px-4 sm:px-6 md:px-8">
                    <Outlet />
                </main>
            </div>
        </div>
    );
}