import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import api from '../api/axios'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'

const STATUS_COLORS = {
    Confirmed: 'bg-surface-container-high text-primary',
    Pending: 'bg-[#fff8e6] text-[#b45309] border border-[#fef08a]',
    Cancelled: 'bg-error-container text-error',
    NoShow: 'bg-surface-container text-on-surface-variant',
}

export default function MyBookings() {
    const navigate = useNavigate()
    const [tab, setTab] = useState('upcoming')
    const [bookings, setBookings] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')

    /* guard: must be logged in */
    useEffect(() => {
        if (!localStorage.getItem('accessToken')) navigate('/login')
    }, [navigate])

    const load = async () => {
        setLoading(true); setError('')
        try {
            const res = await api.get('/api/portal/bookings')
            const all = Array.isArray(res.data) ? res.data : []
            const now = new Date()
            const filtered = all.filter(b => {
                const d = new Date(b.slotDate)
                return tab === 'upcoming'
                    ? d >= now && b.status !== 'Cancelled'
                    : d < now || b.status === 'Cancelled'
            })
            setBookings(filtered)
        } catch {
            setError('Failed to load bookings. Please make sure the server is running.')
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => { load() }, [tab]) // eslint-disable-line

    const cancel = async (id) => {
        if (!window.confirm('Are you sure you want to cancel this appointment?')) return
        try {
            await api.put(`/api/portal/bookings/${id}/cancel`)
            load()
        } catch (err) {
            alert(err.response?.data?.message || 'Cannot cancel this appointment.')
        }
    }

    return (
        <div className="bg-background min-h-screen flex flex-col text-on-background relative">
            {/* dot pattern */}
            <div className="fixed inset-0 pointer-events-none z-0">
                <div className="absolute inset-0" style={{ backgroundImage: 'radial-gradient(circle at center,#9ecaff 1px,transparent 1px)', backgroundSize: '32px 32px', opacity: 0.4 }} />
                <div className="absolute inset-0 bg-gradient-to-b from-transparent via-background/50 to-background" />
            </div>

            <Navbar />

            <main className="flex-grow relative z-10 w-full max-w-screen-xl mx-auto px-4 md:px-8 py-16">
                {/* Title */}
                <div className="mb-10 fade-up" style={{ animationDelay: '.1s' }}>
                    <h1 className="font-bold text-display-lg text-on-surface mb-1">My Bookings</h1>
                    <p className="text-body-lg text-on-surface-variant">Manage and track your medical appointments.</p>
                </div>

                {/* Tabs */}
                <div className="border-b border-outline-variant mb-gutter flex gap-6 fade-up" style={{ animationDelay: '.2s' }}>
                    {['upcoming', 'past'].map(t => (
                        <button key={t} onClick={() => setTab(t)}
                            className={`pb-base capitalize font-medium text-label-md transition-colors border-b-2 ${tab === t
                                    ? 'text-primary border-primary'
                                    : 'text-on-surface-variant border-transparent hover:text-primary'
                                }`}>
                            {t}
                        </button>
                    ))}
                </div>

                {/* Content */}
                {loading ? (
                    <div className="text-center py-16">
                        <span className="material-symbols-outlined text-outline text-[64px] block mb-3">hourglass_empty</span>
                        <p className="text-body-lg text-on-surface-variant">Loading your bookings...</p>
                    </div>
                ) : error ? (
                    <p className="text-error text-body-md text-center py-16">{error}</p>
                ) : bookings.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-16 text-center">
                        <span className="material-symbols-outlined text-[64px] text-outline mb-6">calendar_add_on</span>
                        <h3 className="font-semibold text-headline-md text-on-surface mb-1">No {tab} bookings</h3>
                        <p className="text-body-md text-on-surface-variant mb-6">Ready for your next check-up?</p>
                        <Link to="/clinics"
                            className="bg-primary text-on-primary font-medium text-label-md px-6 py-3 rounded-lg hover:bg-primary-container transition-colors inline-flex items-center gap-2">
                            <span className="material-symbols-outlined text-[18px]">search</span>Find a Clinic
                        </Link>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {bookings.map((b, i) => {
                            const d = new Date(b.slotDate)
                            const dateStr = d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })
                            const timeStr = b.slotTime ? b.slotTime.substring(0, 5) : ''
                            const isUpcoming = tab === 'upcoming' && b.status !== 'Cancelled'
                            return (
                                <div key={b.id} className="bg-surface-container-lowest border border-outline-variant rounded-xl p-6 flex flex-col justify-between fade-up"
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
                                            <span className={`inline-flex items-center px-2 py-1 rounded-lg font-semibold text-label-sm ${STATUS_COLORS[b.status] || 'bg-surface-container text-on-surface-variant'}`}>
                                                {b.status}
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-2 text-on-surface-variant text-body-md mb-6 bg-surface p-3 rounded-xl border border-outline-variant">
                                            <span className="material-symbols-outlined text-primary">calendar_month</span>
                                            <span>{dateStr}{timeStr ? ` • ${timeStr}` : ''}</span>
                                        </div>
                                    </div>
                                    {isUpcoming && (
                                        <div className="flex justify-end border-t border-outline-variant pt-sm mt-auto">
                                            <button onClick={() => cancel(b.id)}
                                                className="border border-outline text-on-surface-variant font-medium text-label-md px-3 py-2 rounded-lg hover:bg-surface-container hover:text-error transition-colors">
                                                Cancel Appointment
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
        </div>
    )
}