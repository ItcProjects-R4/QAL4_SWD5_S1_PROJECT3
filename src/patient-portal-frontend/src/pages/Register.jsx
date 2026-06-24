import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import api from '../api/axios'
import Footer from '../components/Footer'
import TermsModal from '../components/TermsModal'

export default function Register() {
    const navigate = useNavigate()

    const [form, setForm] = useState({ fullName: '', phone: '', password: '', confirm: '' })
    const [errors, setErrors] = useState({})
    const [general, setGeneral] = useState('')
    const [loading, setLoading] = useState(false)
    const [showPw, setShowPw] = useState(false)
    const [agreed, setAgreed] = useState(false)
    const [termsOpen, setTermsOpen] = useState(false)
    const [shakeAgree, setShakeAgree] = useState(false)

    const phoneRe = /^(01[0125][0-9]{8})$/

    const set = (k) => (e) => setForm(p => ({ ...p, [k]: e.target.value }))

    const validateField = (k, val) => {
        if (k === 'fullName' && val.trim().length < 3) return 'Full name must be at least 3 characters'
        if (k === 'phone' && !phoneRe.test(val)) return 'Invalid Egyptian phone number'
        if (k === 'password' && val.length < 8) return 'Password must be at least 8 characters'
        if (k === 'confirm' && val !== form.password) return 'Passwords do not match'
        return null
    }

    const blurField = (k) => () => {
        const msg = validateField(k, form[k])
        setErrors(p => {
            const n = { ...p }
            if (msg) n[k] = msg; else delete n[k]
            return n
        })
    }

    const validate = () => {
        const e = {}
        Object.keys(form).forEach(k => {
            const msg = validateField(k, form[k])
            if (msg) e[k] = msg
        })
        setErrors(e)
        return Object.keys(e).length === 0
    }

    const handleSubmit = async (ev) => {
        ev.preventDefault()
        setGeneral('')

        const formValid = validate()

        // ✅ لازم يوافق على الشروط والأحكام قبل ما يكمل - مفيش استثناء
        if (!agreed) {
            setShakeAgree(true)
            setTimeout(() => setShakeAgree(false), 500)
            if (formValid) setGeneral('Please accept the Terms & Conditions to continue.')
            return
        }

        if (!formValid) return

        setLoading(true)
        try {
            await api.post('/api/portal/auth/register', {
                fullName: form.fullName.trim(),
                phone: form.phone,
                password: form.password,
            })
            sessionStorage.setItem('registerPhone', form.phone)
            navigate('/verify-otp')
        } catch (err) {
            setGeneral(err.response?.data?.message || 'Registration failed. Please try again.')
        } finally {
            setLoading(false)
        }
    }

    const fieldCls = (k) =>
        `w-full pl-10 pr-3 py-3 border rounded-xl bg-surface-container-lowest text-on-surface text-body-md focus:outline-none focus:ring-1 transition-colors ${errors[k]
            ? 'border-error focus:border-error focus:ring-error'
            : 'border-outline-variant focus:border-primary focus:ring-primary'
        }`

    const canSubmit = agreed && !loading

    return (
        <div className="bg-background text-on-surface min-h-screen flex flex-col page-enter">
            {/* Header */}
            <header className="bg-surface/80 backdrop-blur-md border-b border-outline-variant sticky top-0 z-50">
                <div className="flex justify-between items-center w-full px-8 max-w-7xl mx-auto h-16">
                    <Link to="/" className="flex items-center gap-3 hover:scale-105 transition-transform">
                        <span className="material-symbols-outlined text-primary text-[28px] icon-pop" style={{ fontVariationSettings: "'FILL' 1" }}>monitor_heart</span>
                        <span className="font-bold text-headline-md text-primary">SehhaTech</span>
                    </Link>
                    <Link to="/contact" className="p-1 hover:bg-surface-container rounded-full text-on-surface-variant transition-colors" aria-label="Help">
                        <span className="material-symbols-outlined">help</span>
                    </Link>
                </div>
            </header>

            <main className="flex-grow flex items-center justify-center p-4 md:p-8">
                <div className="bg-surface-container-lowest w-full max-w-md border border-outline-variant rounded-xl shadow-[0_4px_12px_rgba(0,0,0,0.05)] p-6 md:p-10 fade-up">
                    <div className="text-center mb-6">
                        <h1 className="font-semibold text-headline-lg-mobile md:text-headline-lg text-on-surface mb-1">Create Account</h1>
                        <p className="text-body-md text-on-surface-variant">Join SehhaTech and take control of your health.</p>
                    </div>

                    <form className="flex flex-col gap-6" onSubmit={handleSubmit} noValidate>
                        {/* Full Name */}
                        <div className="flex flex-col gap-1">
                            <label className="font-medium text-label-md text-on-surface" htmlFor="fullName">
                                Full Name <span className="text-error">*</span>
                            </label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <span className="material-symbols-outlined text-outline">person</span>
                                </div>
                                <input
                                    id="fullName" type="text" value={form.fullName}
                                    onChange={set('fullName')} onBlur={blurField('fullName')}
                                    placeholder="Ahmed Mohamed"
                                    className={fieldCls('fullName')}
                                    autoComplete="name"
                                />
                            </div>
                            {errors.fullName && <p className="text-label-sm text-error fade-in">{errors.fullName}</p>}
                        </div>

                        {/* Phone */}
                        <div className="flex flex-col gap-1">
                            <label className="font-medium text-label-md text-on-surface" htmlFor="phone">
                                Phone Number <span className="text-error">*</span>
                            </label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <span className="material-symbols-outlined text-outline">phone</span>
                                </div>
                                <input
                                    id="phone" type="tel" value={form.phone}
                                    onChange={set('phone')} onBlur={blurField('phone')}
                                    placeholder="01xxxxxxxxx"
                                    className={fieldCls('phone')}
                                    autoComplete="tel"
                                />
                            </div>
                            {errors.phone && <p className="text-label-sm text-error fade-in">{errors.phone}</p>}
                        </div>

                        {/* Password */}
                        <div className="flex flex-col gap-1">
                            <label className="font-medium text-label-md text-on-surface" htmlFor="password">
                                Password <span className="text-error">*</span>
                            </label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <span className="material-symbols-outlined text-outline">lock</span>
                                </div>
                                <input
                                    id="password" type={showPw ? 'text' : 'password'} value={form.password}
                                    onChange={set('password')} onBlur={blurField('password')}
                                    placeholder="Min 8 characters"
                                    className={fieldCls('password') + ' pr-10'}
                                    autoComplete="new-password"
                                />
                                <button
                                    type="button" onClick={() => setShowPw(v => !v)}
                                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-on-surface-variant hover:text-primary"
                                    aria-label={showPw ? 'Hide password' : 'Show password'}
                                >
                                    <span className="material-symbols-outlined">{showPw ? 'visibility_off' : 'visibility'}</span>
                                </button>
                            </div>
                            {errors.password && <p className="text-label-sm text-error fade-in">{errors.password}</p>}
                        </div>

                        {/* Confirm Password */}
                        <div className="flex flex-col gap-1">
                            <label className="font-medium text-label-md text-on-surface" htmlFor="confirm">
                                Confirm Password <span className="text-error">*</span>
                            </label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <span className="material-symbols-outlined text-outline">lock_reset</span>
                                </div>
                                <input
                                    id="confirm" type={showPw ? 'text' : 'password'} value={form.confirm}
                                    onChange={set('confirm')} onBlur={blurField('confirm')}
                                    placeholder="Repeat password"
                                    className={fieldCls('confirm')}
                                    autoComplete="new-password"
                                />
                            </div>
                            {errors.confirm && <p className="text-label-sm text-error fade-in">{errors.confirm}</p>}
                        </div>

                        {/* ✅ Terms & Conditions checkbox - مفروض تسد الطريق على الـ submit */}
                        <div className={`flex flex-col gap-1 ${shakeAgree ? 'shake' : ''}`}>
                            <label
                                htmlFor="agree"
                                className={`flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition-colors ${agreed
                                        ? 'border-primary bg-primary-container/10'
                                        : 'border-outline-variant hover:border-primary/50 hover:bg-surface-container-low'
                                    }`}
                            >
                                <span className="relative flex-shrink-0 mt-0.5">
                                    <input
                                        id="agree" type="checkbox" checked={agreed}
                                        onChange={e => setAgreed(e.target.checked)}
                                        className="peer sr-only"
                                    />
                                    <span
                                        className={`w-5 h-5 rounded-md border flex items-center justify-center transition-all duration-200 ${agreed
                                                ? 'bg-primary border-primary scale-100'
                                                : 'bg-surface-container-lowest border-outline scale-100'
                                            }`}
                                    >
                                        <span
                                            className={`material-symbols-outlined text-[16px] text-on-primary transition-all duration-200 ${agreed ? 'opacity-100 scale-100' : 'opacity-0 scale-50'}`}
                                        >check</span>
                                    </span>
                                </span>
                                <span className="text-body-md text-on-surface-variant leading-snug">
                                    I have read and agree to the{' '}
                                    <button
                                        type="button"
                                        onClick={(e) => { e.preventDefault(); setTermsOpen(true) }}
                                        className="text-primary font-medium hover:underline"
                                    >
                                        Terms &amp; Conditions
                                    </button>
                                    {' '}and{' '}
                                    <Link to="/privacy" className="text-primary font-medium hover:underline" target="_blank" rel="noopener noreferrer">
                                        Privacy Policy
                                    </Link>
                                    <span className="text-error"> *</span>
                                </span>
                            </label>
                            {!agreed && general === '' && (
                                <p className="text-label-sm text-on-surface-variant pl-1">
                                    You must accept the terms to create an account.
                                </p>
                            )}
                        </div>

                        {general && <p className="text-label-sm text-error text-center fade-in">{general}</p>}

                        <button
                            type="submit"
                            disabled={!canSubmit}
                            title={!agreed ? 'Please accept the Terms & Conditions first' : undefined}
                            className="btn-press w-full bg-primary-container hover:bg-primary text-on-primary font-medium text-label-md py-3 rounded-xl transition-colors mt-1 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0 disabled:hover:shadow-none flex items-center justify-center gap-2"
                        >
                            {loading ? (
                                <>
                                    <span className="material-symbols-outlined text-[18px] spinner">progress_activity</span>
                                    Creating account...
                                </>
                            ) : 'Create Account'}
                        </button>
                    </form>

                    <div className="mt-6 text-center">
                        <p className="text-body-md text-on-surface-variant">
                            Already have an account?{' '}
                            <Link className="text-primary hover:underline font-medium" to="/login">Login</Link>
                        </p>
                    </div>
                </div>
            </main>

            <Footer />

            <TermsModal
                open={termsOpen}
                mode="accept"
                onClose={() => setTermsOpen(false)}
                onAccept={() => setAgreed(true)}
            />
        </div>
    )
}
