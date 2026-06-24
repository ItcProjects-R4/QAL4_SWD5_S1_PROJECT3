import { useState, useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import api from '../api/axios'

export default function Navbar() {
    const location = useLocation()
    const [mobileOpen, setMobileOpen] = useState(false)
    const [loggingOut, setLoggingOut] = useState(false)
    const name = localStorage.getItem('patientName')
    const token = localStorage.getItem('accessToken')

    /* close mobile menu whenever route changes */
    useEffect(() => { setMobileOpen(false) }, [location.pathname])

    /* lock scroll while mobile menu open */
    useEffect(() => {
        document.body.style.overflow = mobileOpen ? 'hidden' : ''
        return () => { document.body.style.overflow = '' }
    }, [mobileOpen])

    const handleLogout = async () => {
        if (loggingOut) return
        setLoggingOut(true)

        // ✅ نبعت /api/portal/auth/logout عشان الباك إند يلغي (Revoke) الـ refresh token المخزن في الـ DB
        // من غير الخطوة دي، الـ refresh token فاضل صالح فعلياً حتى بعد ما المستخدم "يعمل logout"
        // محلياً - وده ثغرة أمنية لو حد قدر يوصل للتوكن القديم بعدين
        const refreshToken = localStorage.getItem('refreshToken')
        try {
            if (refreshToken) {
                await api.post('/api/portal/auth/logout', { refreshToken })
            }
        } catch {
            // مش مشكلة لو الـ request فشل (مثلاً مفيش انترنت) - برضو لازم نمسح الجلسة محلياً
            // عشان المستخدم مايفضلش عالق وهو ضاغط "Logout" وهي مش بتعمل حاجة
        } finally {
            localStorage.clear()
            window.location.href = '/'
        }
    }

    const navLinks = [
        { to: '/clinics', label: 'Find Clinic', icon: 'local_hospital' },
        { to: '/my-bookings', label: 'My Bookings', icon: 'event_available' },
    ]

    const isActive = (to) => location.pathname === to


    return (
        <header className="bg-surface-container-lowest border-b border-outline-variant sticky top-0 z-50">
            <div className="flex justify-between items-center px-4 md:px-8 max-w-7xl mx-auto h-16">

                {/* Logo */}
                <Link to="/" className="flex items-center gap-3 hover:scale-105 transition-transform">
                    <span
                        className="material-symbols-outlined text-primary text-[28px]"
                        style={{ fontVariationSettings: "'FILL' 1" }}
                    >
                        monitor_heart
                    </span>
                    <span className="font-bold text-headline-md text-primary">SehhaTech</span>
                </Link>

                {/* Nav links – hidden on mobile */}
                <nav className="hidden md:flex items-center gap-6">
                    {navLinks.map(link => (
                        <Link
                            key={link.to}
                            to={link.to}
                            className={`relative text-body-md transition-colors ${isActive(link.to) ? 'text-primary font-medium' : 'text-on-surface-variant hover:text-primary'}`}
                        >
                            {link.label}
                            {isActive(link.to) && (
                                <span className="absolute -bottom-[21px] left-0 right-0 h-[2px] bg-primary rounded-full" />
                            )}
                        </Link>
                    ))}
                </nav>

                {/* Auth area + mobile toggle */}
                <div className="flex items-center gap-2 md:gap-3">
                    {token && name ? (
                        <>
                            <span className="text-label-md font-medium text-on-surface-variant hidden md:block">
                                Hi, {name.split(' ')[0]}
                            </span>
                            <button
                                onClick={handleLogout}
                                disabled={loggingOut}
                                className="btn-press hidden md:inline-flex bg-error text-on-error text-label-md font-medium px-3 py-1.5 rounded-lg hover:opacity-90 transition-opacity items-center gap-1 disabled:opacity-60 disabled:cursor-not-allowed"
                            >
                                <span className={`material-symbols-outlined text-[16px] ${loggingOut ? 'spinner' : ''}`}>
                                    {loggingOut ? 'progress_activity' : 'logout'}
                                </span>
                                Logout
                            </button>
                        </>
                    ) : (
                        <Link
                            to="/login"
                            className="btn-press hidden md:inline-flex bg-primary-container text-on-primary text-label-md font-medium px-3 py-1.5 rounded-lg hover:bg-primary transition-colors"
                        >
                            Sign In
                        </Link>
                    )}

                    {/* Mobile hamburger */}
                    <button
                        onClick={() => setMobileOpen(v => !v)}
                        className="md:hidden p-2 rounded-lg text-on-surface hover:bg-surface-container transition-colors relative w-10 h-10 flex items-center justify-center"
                        aria-label="Toggle menu"
                        aria-expanded={mobileOpen}
                    >
                        <span className="relative w-6 h-5 flex flex-col justify-between">
                            <span className={`block h-[2px] w-full bg-current rounded transition-all duration-300 ${mobileOpen ? 'rotate-45 translate-y-[9px]' : ''}`} />
                            <span className={`block h-[2px] w-full bg-current rounded transition-all duration-300 ${mobileOpen ? 'opacity-0' : 'opacity-100'}`} />
                            <span className={`block h-[2px] w-full bg-current rounded transition-all duration-300 ${mobileOpen ? '-rotate-45 -translate-y-[9px]' : ''}`} />
                        </span>
                    </button>
                </div>
            </div>

            {/* Mobile menu panel */}
            {mobileOpen && (
                <div className="md:hidden border-t border-outline-variant bg-surface-container-lowest menu-slide">
                    <nav className="flex flex-col px-4 py-3">
                        {navLinks.map(link => (
                            <Link
                                key={link.to}
                                to={link.to}
                                className={`flex items-center gap-3 px-3 py-3 rounded-xl text-body-md transition-colors ${isActive(link.to) ? 'bg-primary-container/15 text-primary font-medium' : 'text-on-surface-variant hover:bg-surface-container'}`}
                            >
                                <span className="material-symbols-outlined text-[20px]">{link.icon}</span>
                                {link.label}
                            </Link>
                        ))}

                        <div className="border-t border-outline-variant my-2" />

                        {token && name ? (
                            <>
                                <div className="flex items-center gap-3 px-3 py-3 text-body-md text-on-surface-variant">
                                    <span className="material-symbols-outlined text-[20px] text-primary">account_circle</span>
                                    Hi, {name.split(' ')[0]}
                                </div>
                                <button
                                    onClick={handleLogout}
                                    disabled={loggingOut}
                                    className="flex items-center gap-3 px-3 py-3 rounded-xl text-body-md text-error hover:bg-error-container transition-colors text-left disabled:opacity-60 disabled:cursor-not-allowed"
                                >
                                    <span className={`material-symbols-outlined text-[20px] ${loggingOut ? 'spinner' : ''}`}>
                                        {loggingOut ? 'progress_activity' : 'logout'}
                                    </span>
                                    Logout
                                </button>
                            </>
                        ) : (
                            <Link
                                to="/login"
                                className="flex items-center gap-3 px-3 py-3 rounded-xl text-body-md font-medium text-primary hover:bg-primary-container/15 transition-colors"
                            >
                                <span className="material-symbols-outlined text-[20px]">login</span>
                                Sign In
                            </Link>
                        )}
                    </nav>
                </div>
            )}
        </header>
    )
}
