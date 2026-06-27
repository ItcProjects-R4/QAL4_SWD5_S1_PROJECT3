import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import api from '../api/axios'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'

const DAYS_AHEAD = 14

function toDateKey(d) {
    const y = d.getFullYear()
    const m = String(d.getMonth() + 1).padStart(2, '0')
    const day = String(d.getDate()).padStart(2, '0')
    return `${y}-${m}-${day}`
}

export default function BookAppointment() {
    const navigate = useNavigate()
    const { t, i18n } = useTranslation()

    const clinicId = sessionStorage.getItem('selectedClinicId')
    const clinicName = sessionStorage.getItem('selectedClinicName') || 'Clinic'

    const [doctors, setDoctors] = useState([])
    const [doctorId, setDoctorId] = useState('')
    const [selectedDate, setSelectedDate] = useState(toDateKey(new Date()))
    const [slots, setSlots] = useState([])
    const [slotTime, setSlotTime] = useState('')
    const [loadingDoctors, setLoadingDoctors] = useState(false)
    const [loadingSlots, setLoadingSlots] = useState(false)
    const [booking, setBooking] = useState(false)
    const [success, setSuccess] = useState(false)
    const [error, setError] = useState('')

    useEffect(() => {
        if (!clinicId) navigate('/clinics')
    }, [clinicId, navigate])

    useEffect(() => {
        if (!clinicId) return
        setLoadingDoctors(true)
        api.get(`/api/portal/clinics/${clinicId}/doctors`)
            .then(r => setDoctors(Array.isArray(r.data) ? r.data : []))
            .catch(() => setError(t('bookAppointment.errorDoctors')))
            .finally(() => setLoadingDoctors(false))
    }, [clinicId]) // eslint-disable-line

    useEffect(() => {
        if (!doctorId || !selectedDate) { setSlots([]); setSlotTime(''); return }
        setLoadingSlots(true)
        setError('')
        api.get(`/api/portal/doctors/${doctorId}/slots`, {
            params: { tenantId: clinicId, date: selectedDate }
        })
            .then(r => setSlots(Array.isArray(r.data) ? r.data : []))
            .catch(() => setError(t('bookAppointment.errorSlots')))
            .finally(() => setLoadingSlots(false))
    }, [doctorId, selectedDate, clinicId]) // eslint-disable-line

    const locale = i18n.language === 'ar' ? 'ar-EG' : 'en-US'

    const dayOptions = Array.from({ length: DAYS_AHEAD }, (_, i) => {
        const d = new Date()
        d.setDate(d.getDate() + i)
        return {
            key: toDateKey(d),
            label: d.toLocaleDateString(locale, { weekday: 'short', month: 'short', day: 'numeric' }),
            isToday: i === 0,
        }
    })

    const handleBook = async () => {
        if (!slotTime || !doctorId) return
        setBooking(true); setError('')
        try {
            await api.post('/api/portal/bookings', {
                doctorId: Number(doctorId),
                tenantId: Number(clinicId),
                slotDate: selectedDate,
                slotTime: slotTime,
                notes: null,
                idempotencyKey: crypto.randomUUID(),
            })
            setSuccess(true)
        } catch (err) {
            setError(err.response?.data?.message || t('bookAppointment.errorBook'))
        } finally {
            setBooking(false)
        }
    }

    if (success) return (
        <div className="bg-background min-h-screen flex flex-col text-on-surface page-enter">
            <Navbar />
            <main className="flex-grow flex items-center justify-center px-4 md:px-8 py-16">
                <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-10 md:p-16 text-center max-w-md w-full fade-up">
                    <div className="w-16 h-16 bg-success-container rounded-full flex items-center justify-center mx-auto mb-6 relative">
                        <span className="absolute inset-0 rounded-full bg-success ring-expand" />
                        <span className="material-symbols-outlined text-success text-[32px] check-pop">check_circle</span>
                    </div>
                    <h2 className="font-semibold text-headline-md text-on-surface mb-1">{t('bookAppointment.successTitle')}</h2>
                    <p className="text-body-md text-on-surface-variant mb-10">{t('bookAppointment.successMsg')}</p>
                    <div className="flex flex-col sm:flex-row gap-3 justify-center">
                        <button onClick={() => navigate('/my-bookings')}
                            className="btn-press bg-primary text-on-primary font-medium text-label-md px-6 py-3 rounded-lg hover:bg-primary-container transition-colors">
                            {t('bookAppointment.viewBookings')}
                        </button>
                        <button onClick={() => navigate('/clinics')}
                            className="btn-press bg-surface-container text-on-surface font-medium text-label-md px-6 py-3 rounded-lg hover:bg-surface-container-high transition-colors">
                            {t('bookAppointment.backToClinics')}
                        </button>
                    </div>
                </div>
            </main>
            <Footer />
        </div>
    )

    return (
        <div className="bg-background min-h-screen flex flex-col text-on-surface page-enter">
            <Navbar />

            <main className="flex-grow w-full max-w-2xl mx-auto px-4 md:px-8 py-16">
                <button onClick={() => navigate('/clinics')} className="link-underline flex items-center gap-1 text-on-surface-variant hover:text-primary transition-colors text-label-md font-medium mb-10">
                    <span className="material-symbols-outlined text-[20px]">arrow_back</span>
                    {t('bookAppointment.backToClinics')}
                </button>

                <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-6 md:p-10 fade-up">
                    <div className="flex items-center gap-3 mb-10 pb-6 border-b border-outline-variant">
                        <div className="w-12 h-12 bg-surface-container rounded-xl flex items-center justify-center text-primary">
                            <span className="material-symbols-outlined text-[24px]">local_hospital</span>
                        </div>
                        <div>
                            <h1 className="font-semibold text-headline-md text-on-surface">{clinicName}</h1>
                            <p className="text-label-md text-on-surface-variant">{t('bookAppointment.bookSubtitle')}</p>
                        </div>
                    </div>

                    {loadingDoctors ? (
                        <div className="text-center py-10 fade-in">
                            <span className="material-symbols-outlined text-primary text-[48px] block mb-3 spinner">progress_activity</span>
                            <p className="text-body-md text-on-surface-variant">{t('bookAppointment.loadingDoctors')}</p>
                        </div>
                    ) : (
                        <div className="flex flex-col gap-6">
                            {/* Doctor select */}
                            <div className="flex flex-col gap-1">
                                <label className="font-medium text-label-md text-on-surface">
                                    {t('bookAppointment.selectDoctorLabel')} <span className="text-error">*</span>
                                </label>
                                <div className="relative">
                                    <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline">stethoscope</span>
                                    <select value={doctorId} onChange={e => { setDoctorId(e.target.value); setSlotTime('') }}
                                        className="w-full bg-surface-container-lowest border border-outline-variant rounded-xl pl-10 pr-10 py-3 text-body-md text-on-surface focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors appearance-none">
                                        <option value="">{t('bookAppointment.chooseDoctorPlaceholder')}</option>
                                        {doctors.map(d => (
                                            <option key={d.id} value={d.id}>
                                                {d.fullName || d.name}{d.specialization ? ` — ${d.specialization}` : ''}
                                            </option>
                                        ))}
                                    </select>
                                    <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-outline pointer-events-none">expand_more</span>
                                </div>
                            </div>

                            {/* Date picker */}
                            {doctorId && (
                                <div className="flex flex-col gap-1 fade-up">
                                    <label className="font-medium text-label-md text-on-surface">
                                        {t('bookAppointment.selectDateLabel')} <span className="text-error">*</span>
                                    </label>
                                    <div className="flex gap-2 overflow-x-auto pb-2 -mx-1 px-1">
                                        {dayOptions.map((day, i) => (
                                            <button
                                                key={day.key}
                                                onClick={() => { setSelectedDate(day.key); setSlotTime('') }}
                                                className={`btn-press flex-shrink-0 px-4 py-2 rounded-xl border text-center transition-all whitespace-nowrap ${selectedDate === day.key
                                                    ? 'border-primary bg-primary-container text-on-primary scale-105'
                                                    : 'border-outline-variant bg-surface-container-lowest text-on-surface hover:border-primary hover:bg-surface-container-low'
                                                    }`}
                                                style={{ animationDelay: `${i * 0.02}s` }}
                                            >
                                                <span className="text-label-md font-medium">{day.label}</span>
                                                {day.isToday && <span className="block text-label-sm opacity-80">{t('bookAppointment.today')}</span>}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Slot select */}
                            {doctorId && selectedDate && (
                                <div className="flex flex-col gap-1 fade-up">
                                    <label className="font-medium text-label-md text-on-surface">
                                        {t('bookAppointment.selectTimeLabel')} <span className="text-error">*</span>
                                    </label>

                                    {loadingSlots ? (
                                        <div className="border border-outline-variant rounded-xl p-6 text-center fade-in">
                                            <span className="material-symbols-outlined text-primary text-[32px] block mb-1 spinner">progress_activity</span>
                                            <p className="text-body-md text-on-surface-variant">{t('bookAppointment.loadingSlots')}</p>
                                        </div>
                                    ) : slots.length === 0 ? (
                                        <div className="border border-outline-variant rounded-xl p-6 text-center fade-in">
                                            <span className="material-symbols-outlined text-outline text-[32px] block mb-1">event_busy</span>
                                            <p className="text-body-md text-on-surface-variant">{t('bookAppointment.noSlots')}</p>
                                        </div>
                                    ) : (
                                        <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
                                            {slots.map((s, i) => {
                                                const timeStr = typeof s.time === 'string' ? s.time : `${s.time}`
                                                const displayTime = timeStr.substring(0, 5)
                                                const disabled = s.isAvailable === false
                                                return (
                                                    <button
                                                        key={`${timeStr}-${i}`}
                                                        onClick={() => !disabled && setSlotTime(timeStr)}
                                                        disabled={disabled}
                                                        className={`btn-press p-3 rounded-xl border text-center transition-all scale-in ${disabled
                                                            ? 'border-outline-variant bg-surface-container text-outline cursor-not-allowed opacity-50'
                                                            : slotTime === timeStr
                                                                ? 'border-primary bg-primary-container text-on-primary scale-105'
                                                                : 'border-outline-variant bg-surface-container-lowest text-on-surface hover:border-primary hover:bg-surface-container-low'
                                                            }`}
                                                        style={{ animationDelay: `${i * 0.03}s` }}
                                                    >
                                                        <p className="font-medium text-label-md">{displayTime}</p>
                                                    </button>
                                                )
                                            })}
                                        </div>
                                    )}
                                </div>
                            )}

                            {error && <p className="text-label-sm text-error fade-in">{error}</p>}

                            <button
                                onClick={handleBook}
                                disabled={!slotTime || booking}
                                className="btn-press w-full bg-primary text-on-primary font-medium text-label-md py-3 rounded-xl hover:bg-primary-container transition-colors disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0 mt-3 flex items-center justify-center gap-2"
                            >
                                {booking ? (
                                    <>
                                        <span className="material-symbols-outlined text-[18px] spinner">progress_activity</span>
                                        {t('bookAppointment.booking')}
                                    </>
                                ) : t('bookAppointment.confirmBtn')}
                            </button>
                        </div>
                    )}
                </div>
            </main>

            <Footer />
        </div>
    )
}