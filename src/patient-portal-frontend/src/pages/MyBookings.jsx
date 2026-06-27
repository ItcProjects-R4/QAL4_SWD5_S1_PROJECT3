import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import api from '../api/axios'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'

const STATUS_COLORS = {
    Confirmed: 'bg-surface-container-high text-primary',
    Pending: 'bg-warning-container text-warning border border-[#fef08a]',
    Cancelled: 'bg-error-container text-error',
    NoShow: 'bg-surface-container text-on-surface-variant',
}

const STATUS_ICONS = {
    Confirmed: 'check_circle',
    Pending: 'hourglass_top',
    Cancelled: 'cancel',
    NoShow: 'event_busy',
}

function combineDateTime(slotDate, slotTime) {
    const datePart = slotDate.split('T')[0]
    const timePart = slotTime ? slotTime.substring(0, 8) : '00:00:00'
    return new Date(`${datePart}T${timePart}`)
}

export default function MyBookings() {
    const navigate = useNavigate()
    const { t, i18n } = useTranslation()
    const [tab, setTab] = useState('upcoming')
    const [bookings, setBookings] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')
    const [cancelTarget, setCancelTarget] = useState(null)
    const [cancelling, setCancelling] = useState(false)
    const [toast, setToast] = useState(null)

    useEffect(() => {
        if (!localStorage.getItem('accessToken')) navigate('/login')
    }, [navigate])

    useEffect(() => {
        if (!toast) return
        const timer = setTimeout(() => setToast(null), 3500)
        return () => clearTimeout(timer)
    }, [toast])

    const load = async () => {
        setLoading(true); setError('')
        try {
            const res = await api.get('/api/portal/bookings')
            const all = Array.isArray(res.data) ? res.data : []
            const now = new Date()
            const filtered = all.filter(b => {
                const dt = combineDateTime(b.slotDate, b.slotTime)
                return tab === 'upcoming'
                    ? dt >= now && b.status !== 'Cancelled'
                    : dt < now || b.status === 'Cancelled'
            })
            filtered.sort((a, b2) => {
                const da = combineDateTime(a.slotDate, a.slotTime)
                const db = combineDateTime(b2.slotDate, b2.slotTime)
                return tab === 'upcoming' ? da - db : db - da
            })
            setBookings(filtered)
        } catch {
            setError(t('myBookings.errorLoad'))
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => { load() }, [tab]) // eslint-disable-line

    const confirmCancel = async () => {
        if (!cancelTarget) return
        setCancelling(true)
        try {
            await api.put(`/api/portal/bookings/${cancelTarget.id}/cancel`)
            setCancelTarget(null)
            setToast({ text: t('myBookings.toastCancelSuccess'), type: 'success' })
            load()
        } catch (err) {
            setToast({ text: err.response?.data?.message || t('myBookings.toastCancelError'), type: 'error' })
        } finally {
            setCancelling(false)
        }
    }

    const locale = i18n.language === 'ar' ? 'ar-EG' : 'en-US'

    const tabs = [
        { key: 'upcoming', label: t('myBookings.tabUpcoming') },
        { key: 'past', label: t('myBookings.tabPast') },
    ]

    const statusLabel = (status) => {
        const map = {
            Confirmed: t('myBookings.statusConfirmed'),
            Pending: t('myBookings.statusPending'),
            Cancelled: t('myBookings.statusCancelled'),
            NoShow: t('myBookings.statusNoShow'),
        }
        return map[status] || status
    }

    return (
        <div className="bg-background min-h-screen flex flex-col text-on-background relative page-enter">
            <div className="fixed inset-0 pointer-events-none z-0">
                <div className="absolute inset-0" style={{ backgroundImage: 'radial-gradient(circle at center,#9ecaff 1px,transparent 1px)', backgroundSize: '32px 32px', opacity: 0.4 }} />
                <div className="absolute inset-0 bg-gradient-to-b from-transparent via-background/50 to-background" />
            </div>

            <Navbar />

            <main className="flex-grow relative z-10 w-full max-w-screen-xl mx-auto px-4 md:px-8 py-16">
                <div className="mb-10 fade-up" style={{ animationDelay: '.1s' }}>
                    <h1 className="font-bold text-display-lg text-on-surface mb-1">{t('myBookings.title')}</h1>
                    <p className="text-body-lg text-on-surface-variant">{t('myBookings.subtitle')}</p>
                </div>

                <div className="border-b border-outline-variant mb-6 flex gap-6 fade-up" style={{ animationDelay: '.2s' }}>
                    {tabs.map(({ key, label }) => (
                        <button key={key} onClick={() => setTab(key)}
                            className={`relative pb-3 font-medium text-label-md transition-colors ${tab === key ? 'text-primary' : 'text-on-surface-variant hover:text-primary'}`}>
                            {label}
                            <span className={`absolute left-0 right-0 -bottom-px h-[2px] bg-primary rounded-full transition-transform duration-300 origin-left ${tab === key ? 'scale-x-100' : 'scale-x-0'}`} />
                        </button>
                    ))}
                </div>

                {loading ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {Array.from({ length: 4 }).map((_, i) => (
                            <div key={i} className="bg-surface-container-lowest border border-outline-variant rounded-xl p-6">
                                <div className="flex justify-between items-start mb-3">
                                    <div className="flex-1">
                                        <div className="h-6 w-2/3 rounded skeleton mb-2" />
                                        <div className="h-4 w-1/2 rounded skeleton" />
                                    </div>
                                    <div className="h-6 w-20 rounded-lg skeleton" />
                                </div>
                                <div className="h-12 w-full rounded-xl skeleton" />
                            </div>
                        ))}
                    </div>
                ) : error ? (
                    <p className="text-error text-body-md text-center py-16 fade-in">{error}</p>
                ) : bookings.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-16 text-center fade-up">
                        <span className="material-symbols-outlined text-[64px] text-outline mb-6">calendar_add_on</span>
                        <h3 className="font-semibold text-headline-md text-on-surface mb-1">
                            {t('myBookings.emptyTitle', { tab: tab === 'upcoming' ? t('myBookings.tabUpcoming') : t('myBookings.tabPast') })}
                        </h3>
                        <p className="text-body-md text-on-surface-variant mb-6">{t('myBookings.emptySubtitle')}</p>
                        <Link to="/clinics"
                            className="btn-press bg-primary text-on-primary font-medium text-label-md px-6 py-3 rounded-lg hover:bg-primary-container transition-colors inline-flex items-center gap-2">
                            <span className="material-symbols-outlined text-[18px]">search</span>
                            {t('myBookings.findClinic')}
                        </Link>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {bookings.map((b, i) => {
                            const d = combineDateTime(b.slotDate, b.slotTime)
                            const dateStr = d.toLocaleDateString(locale, { weekday: 'short', month: 'short', day: 'numeric' })
                            const timeStr = d.toLocaleTimeString(locale, { hour: '2-digit', minute: '2-digit' })
                            const isUpcoming = tab === 'upcoming' && b.status !== 'Cancelled'
                            return (
                                <div key={b.id} className="card-hover bg-surface-container-lowest border border-outline-variant rounded-xl p-6 flex flex-col justify-between fade-up"
                                    style={{ animationDelay: `${0.3 + i * 0.1}s` }}>
                                    <div>
                                        <div className="flex justify-between items-start mb-3">
                                            <div>
                                                <h3 className="font-semibold text-headline-md text-on-surface mb-1">{b.clinicName || 'Clinic'}</h3>
                                                <p className="text-body-md text-on-surface-variant flex items-center gap-1">
                                                    <span className="material-symbols-outlined text-[18px]">stethoscope</span>
                                                    {b.doctorName || 'Doctor'}
                                                </p>
                                            </div>
                                            <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-lg font-semibold text-label-sm ${STATUS_COLORS[b.status] || 'bg-surface-container text-on-surface-variant'}`}>
                                                <span className="material-symbols-outlined text-[14px]">{STATUS_ICONS[b.status] || 'info'}</span>
                                                {statusLabel(b.status)}
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-2 text-on-surface-variant text-body-md mb-6 bg-surface p-3 rounded-xl border border-outline-variant">
                                            <span className="material-symbols-outlined text-primary">calendar_month</span>
                                            <span>{dateStr} • {timeStr}</span>
                                        </div>
                                    </div>
                                    {isUpcoming && (
                                        <div className="flex justify-end border-t border-outline-variant pt-3 mt-auto">
                                            <button onClick={() => setCancelTarget(b)}
                                                className="btn-press border border-outline text-on-surface-variant font-medium text-label-md px-3 py-2 rounded-lg hover:bg-error-container hover:text-error hover:border-error transition-colors flex items-center gap-1">
                                                <span className="material-symbols-outlined text-[16px]">event_busy</span>
                                                {t('myBookings.cancelBtn')}
                                            </button>
                                        </div>
                                    )}
                                </div>
                            )
                        })}
                    </div>
                )}
            </main>

            <Footer />

            {cancelTarget && (
                <div
                    className="fixed inset-0 z-[100] flex items-center justify-center p-4 overlay-fade"
                    style={{ backgroundColor: 'rgba(13,28,46,0.55)', backdropFilter: 'blur(4px)' }}
                    onMouseDown={(e) => { if (e.target === e.currentTarget && !cancelling) setCancelTarget(null) }}
                >
                    <div className="bg-surface-container-lowest border border-outline-variant rounded-xl w-full max-w-sm p-6 md:p-8 modal-pop shadow-[0_24px_48px_-12px_rgba(0,0,0,0.25)]">
                        <div className="w-14 h-14 bg-error-container rounded-full flex items-center justify-center mx-auto mb-5">
                            <span className="material-symbols-outlined text-error text-[28px]">event_busy</span>
                        </div>
                        <h3 className="font-semibold text-headline-md text-on-surface text-center mb-2">{t('myBookings.cancelTitle')}</h3>
                        <p className="text-body-md text-on-surface-variant text-center mb-2">
                            {t('myBookings.cancelMsg')}
                        </p>
                        <p className="text-body-md font-medium text-on-surface text-center mb-6">
                            {cancelTarget.doctorName || 'this doctor'} {t('myBookings.cancelMsgAt')} {cancelTarget.clinicName || 'this clinic'}?
                        </p>
                        <div className="flex gap-3">
                            <button
                                onClick={() => setCancelTarget(null)}
                                disabled={cancelling}
                                className="btn-press flex-1 bg-surface-container text-on-surface font-medium text-label-md py-3 rounded-xl hover:bg-surface-container-high transition-colors disabled:opacity-60"
                            >
                                {t('myBookings.keepBtn')}
                            </button>
                            <button
                                onClick={confirmCancel}
                                disabled={cancelling}
                                className="btn-press flex-1 bg-error text-on-error font-medium text-label-md py-3 rounded-xl hover:opacity-90 transition-opacity disabled:opacity-60 flex items-center justify-center gap-2"
                            >
                                {cancelling
                                    ? <span className="material-symbols-outlined text-[18px] spinner">progress_activity</span>
                                    : t('myBookings.confirmCancelBtn')
                                }
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {toast && (
                <div className="fixed bottom-6 left-1/2 z-[110] toast-in">
                    <div className={`flex items-center gap-2 px-5 py-3 rounded-xl shadow-[0_8px_24px_rgba(0,0,0,0.15)] text-label-md font-medium ${toast.type === 'success' ? 'bg-success text-white' : 'bg-error text-on-error'}`}>
                        <span className="material-symbols-outlined text-[20px]">
                            {toast.type === 'success' ? 'check_circle' : 'error'}
                        </span>
                        {toast.text}
                    </div>
                </div>
            )}
        </div>
    )
}