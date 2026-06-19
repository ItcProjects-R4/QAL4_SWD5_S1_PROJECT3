import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../api/axios'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'

export default function BookAppointment() {
    const navigate = useNavigate()

    const clinicId = sessionStorage.getItem('selectedClinicId')
    const clinicName = sessionStorage.getItem('selectedClinicName') || 'Clinic'

    const [doctors, setDoctors] = useState([])
    const [slots, setSlots] = useState([])
    const [doctorId, setDoctorId] = useState('')
    const [slotId, setSlotId] = useState('')
    const [loading, setLoading] = useState(false)
    const [booking, setBooking] = useState(false)
    const [success, setSuccess] = useState(false)
    const [error, setError] = useState('')

    /* redirect if no clinic selected */
    useEffect(() => {
        if (!clinicId) navigate('/clinics')
    }, [clinicId, navigate])

    /* load doctors */
    useEffect(() => {
        if (!clinicId) return
        setLoading(true)
        api.get(`/api/portal/clinics/${clinicId}/doctors`)
            .then(r => setDoctors(Array.isArray(r.data) ? r.data : []))
            .catch(() => setError('Failed to load doctors.'))
            .finally(() => setLoading(false))
    }, [clinicId])

    /* load slots when doctor changes */
    useEffect(() => {
        if (!doctorId) { setSlots([]); setSlotId(''); return }
        api.get(`/api/portal/doctors/${doctorId}/slots`)
            .then(r => setSlots(Array.isArray(r.data) ? r.data : []))
            .catch(() => setError('Failed to load slots.'))
    }, [doctorId])

    const handleBook = async () => {
        if (!slotId) return
        setBooking(true); setError('')
        try {
            await api.post('/api/portal/bookings', { slotId: Number(slotId) })
            setSuccess(true)
        } catch (err) {
            setError(err.response?.data?.message || 'Booking failed. Please try again.')
        } finally {
            setBooking(false)
        }
    }

    if (success) return (
        <div className="bg-background min-h-screen flex flex-col text-on-surface">
            <Navbar />
            <main className="flex-grow flex items-center justify-center px-4 md:px-8 py-16">
                <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-16 text-center max-w-md w-full fade-up">
                    <div className="w-16 h-16 bg-[#e6f4ea] rounded-full flex items-center justify-center mx-auto mb-6">
                        <span className="material-symbols-outlined text-[#137333] text-[32px]">check_circle</span>
                    </div>
                    <h2 className="font-semibold text-headline-md text-on-surface mb-1">Booking Confirmed!</h2>
                    <p className="text-body-md text-on-surface-variant mb-10">Your appointment has been booked successfully.</p>
                    <div className="flex flex-col sm:flex-row gap-3 justify-center">
                        <button onClick={() => navigate('/my-bookings')}
                            className="bg-primary text-on-primary font-medium text-label-md px-6 py-3 rounded-lg hover:bg-primary-container transition-colors">
                            View My Bookings
                        </button>
                        <button onClick={() => navigate('/clinics')}
                            className="bg-surface-container text-on-surface font-medium text-label-md px-6 py-3 rounded-lg hover:bg-surface-container-high transition-colors">
                            Back to Clinics
                        </button>
                    </div>
                </div>
            </main>
            <Footer />
        </div>
    )

    return (
        <div className="bg-background min-h-screen flex flex-col text-on-surface">
            <Navbar />

            <main className="flex-grow w-full max-w-2xl mx-auto px-4 md:px-8 py-16">
                {/* Back */}
                <button onClick={() => navigate('/clinics')} className="flex items-center gap-1 text-on-surface-variant hover:text-primary transition-colors text-label-md font-medium mb-10">
                    <span className="material-symbols-outlined text-[20px]">arrow_back</span>Back to Clinics
                </button>

                <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-6 md:p-10 fade-up">
                    {/* Clinic header */}
                    <div className="flex items-center gap-3 mb-10 pb-md border-b border-outline-variant">
                        <div className="w-12 h-12 bg-surface-container rounded-xl flex items-center justify-center text-primary">
                            <span className="material-symbols-outlined text-[24px]">local_hospital</span>
                        </div>
                        <div>
                            <h1 className="font-semibold text-headline-md text-on-surface">{clinicName}</h1>
                            <p className="text-label-md text-on-surface-variant">Book an appointment</p>
                        </div>
                    </div>

                    {loading ? (
                        <div className="text-center py-10">
                            <span className="material-symbols-outlined text-outline text-[48px] block mb-3">hourglass_empty</span>
                            <p className="text-body-md text-on-surface-variant">Loading doctors...</p>
                        </div>
                    ) : (
                        <div className="flex flex-col gap-6">
                            {/* Doctor select */}
                            <div className="flex flex-col gap-1">
                                <label className="font-medium text-label-md text-on-surface">Select Doctor <span className="text-error">*</span></label>
                                <div className="relative">
                                    <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline">stethoscope</span>
                                    <select value={doctorId} onChange={e => setDoctorId(e.target.value)}
                                        className="w-full bg-surface-container-lowest border border-outline-variant rounded-xl pl-10 pr-10 py-3 text-body-md text-on-surface focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors appearance-none">
                                        <option value="">Choose a doctor...</option>
                                        {doctors.map(d => (
                                            <option key={d.id} value={d.id}>{d.fullName || d.name}{d.specialty ? ` — ${d.specialty}` : ''}</option>
                                        ))}
                                    </select>
                                    <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-outline pointer-events-none">expand_more</span>
                                </div>
                            </div>

                            {/* Slot select */}
                            {doctorId && (
                                <div className="flex flex-col gap-1">
                                    <label className="font-medium text-label-md text-on-surface">Select Time Slot <span className="text-error">*</span></label>
                                    {slots.length === 0 ? (
                                        <div className="border border-outline-variant rounded-xl p-6 text-center">
                                            <span className="material-symbols-outlined text-outline text-[32px] block mb-1">event_busy</span>
                                            <p className="text-body-md text-on-surface-variant">No available slots for this doctor.</p>
                                        </div>
                                    ) : (
                                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                                            {slots.map(s => {
                                                const date = new Date(s.date)
                                                const dateStr = date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })
                                                const timeStr = s.time ? s.time.substring(0, 5) : ''
                                                return (
                                                    <button key={s.id} onClick={() => setSlotId(s.id)}
                                                        className={`p-3 rounded-xl border text-center transition-all ${slotId === s.id
                                                                ? 'border-primary bg-primary-container text-on-primary'
                                                                : 'border-outline-variant bg-surface-container-lowest text-on-surface hover:border-primary hover:bg-surface-container-low'
                                                            }`}>
                                                        <p className="font-medium text-label-md">{dateStr}</p>
                                                        {timeStr && <p className="text-label-sm text-on-surface-variant mt-1">{timeStr}</p>}
                                                    </button>
                                                )
                                            })}
                                        </div>
                                    )}
                                </div>
                            )}

                            {error && <p className="text-label-sm text-error">{error}</p>}

                            <button
                                onClick={handleBook}
                                disabled={!slotId || booking}
                                className="w-full bg-primary text-on-primary font-medium text-label-md py-3 rounded-xl hover:bg-primary-container transition-colors disabled:opacity-50 disabled:cursor-not-allowed mt-3"
                            >
                                {booking ? 'Booking...' : 'Confirm Appointment'}
                            </button>
                        </div>
                    )}
                </div>
            </main>

            <Footer />
        </div>
    )
}