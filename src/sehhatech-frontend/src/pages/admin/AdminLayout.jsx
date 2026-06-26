import { useState, useEffect } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';



const navItems = [
    { to: '/admin/dashboard', icon: 'dashboard', label: 'Dashboard' },
    { to: '/admin/doctors', icon: 'groups', label: 'Doctors' },
    { to: '/admin/receptionists', icon: 'support_agent', label: 'Receptionists' },
    { to: '/admin/settings', icon: 'settings', label: 'Settings' },
];

export default function AdminLayout() {
    const navigate = useNavigate();
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const name = localStorage.getItem('userName') || 'Admin';
    const clinicName = localStorage.getItem('clinicName') || 'SehhaTech';

    useEffect(() => {
        const handleResize = () => {
            setSidebarOpen(window.innerWidth >= 768);
        };
        handleResize();
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    function handleLogout() {
        localStorage.clear();
        sessionStorage.clear();
        window.location.href = '/login';
    }

    return (
        <div className="min-h-screen bg-slate-50 flex">
            {/* Mobile overlay */}
            {sidebarOpen && (
                <div
                    className="fixed inset-0 bg-black/40 z-40 md:hidden"
                    onClick={() => setSidebarOpen(false)}
                />
            )}

            {/* Sidebar */}
            <aside
                className={`fixed left-0 top-0 h-screen bg-white border-r border-slate-100 flex flex-col py-6 z-50 transition-all duration-300
                    w-64 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}`}
            >
                {/* Logo */}
                <div className="px-6 mb-6 flex items-center gap-3">
                    <img
                        src="/logo.png"
                        alt="SehhaTech Logo"
                        className="w-10 h-10 object-contain"
                    />
                    <div>
                        <div className="font-extrabold text-[#002045] text-sm leading-tight">{clinicName}</div>
                        <div className="text-[10px] text-slate-400 tracking-wide">Admin Panel</div>
                    </div>
                </div>

                {/* Nav */}
                <nav className="flex-1 px-3 space-y-1">
                    {navItems.map((item) => (
                        <NavLink
                            key={item.to}
                            to={item.to}
                            onClick={() => { if (window.innerWidth < 768) setSidebarOpen(false); }}
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
                        Logout
                    </button>
                </div>
            </aside>

            {/* Main */}
            <div className={`flex-1 flex flex-col min-h-screen transition-all duration-300 ${sidebarOpen ? 'md:ml-64' : 'ml-0'}`}>
                {/* Header */}
                <header className={`fixed top-0 right-0 z-40 h-16 bg-white/80 backdrop-blur border-b border-slate-100 flex items-center justify-between px-4 sm:px-8 transition-all duration-300 ${sidebarOpen ? 'left-0 md:left-64' : 'left-0'}`}>
                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => setSidebarOpen(!sidebarOpen)}
                            className="p-2 rounded-lg hover:bg-slate-100 transition-colors text-slate-600"
                        >
                            <span className="material-symbols-outlined text-[22px]">menu</span>
                        </button>
                        <h2 className="text-base sm:text-lg font-bold text-[#002045]">Admin Panel</h2>
                    </div>
                    <div className="flex items-center gap-2 sm:gap-3">
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