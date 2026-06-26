import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import api from '../api/axios'
import Footer from '../components/Footer'

export default function ForgotPassword() {
    const navigate = useNavigate()
    const [phone, setPhone] = useState('')
    const [error, setError] = useState('')
    const [loading, setLoading] = useState(false)

    const phoneRe = /^(01[0125][0-9]{8})$/

    const handleSubmit = async (e) => {
        e.preventDefault()
        setError('')
        if (!phoneRe.test(phone)) {
            setError('Invalid Egyptian phone number')
            return
        }
        setLoading(true)
        try {
            // ✅ الـ endpoint الصحيح من الباك إند الحقيقي هو resetpassword/request
            // (مش resend-otp - ده endpoint منفصل تماماً مخصوص بس لـ OTP الـ registration)
            // وده بيبعت الـ OTP لوحده، مفيش حاجة تانية لازم تتبعت
            await api.post('/api/portal/auth/resetpassword/request', { phone })
            sessionStorage.setItem('resetPhone', phone)
            navigate('/reset-password')
        } catch (err) {
            setError(err.response?.data?.message || 'Could not send reset code. Please check the number and try again.')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="bg-background text-on-surface min-h-screen flex flex-col page-enter">
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
                <div className="bg-surface-container-lowest border border-outline-variant rounded-xl shadow-[0_4px_12px_rgba(0,0,0,0.05)] p-6 md:p-10 w-full max-w-md fade-up">
                    <div className="text-center mb-6">
                        <div className="w-14 h-14 bg-primary-container rounded-full flex items-center justify-center mx-auto mb-4 scale-in">
                            <span className="material-symbols-outlined text-on-primary text-[28px]">lock_reset</span>
                        </div>
                        <h1 className="font-semibold text-headline-lg-mobile md:text-headline-lg text-on-surface mb-1">Forgot Password?</h1>
                        <p className="text-body-md text-on-surface-variant">
                            Enter your registered phone number and we'll send you a verification code to reset your password.
                        </p>
                    </div>

                    <form className="flex flex-col gap-6" onSubmit={handleSubmit} noValidate>
                        <div className="flex flex-col gap-1">
                            <label className="font-medium text-label-md text-on-surface" htmlFor="phone">
                                Phone Number <span className="text-error">*</span>
                            </label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <span className="material-symbols-outlined text-outline">phone</span>
                                </div>
                                <input
                                    id="phone" type="tel" value={phone}
                                    onChange={e => setPhone(e.target.value)}
                                    placeholder="01xxxxxxxxx"
                                    autoComplete="tel"
                                    className={`w-full pl-10 pr-3 py-3 border rounded-xl bg-surface-container-lowest text-on-surface text-body-md focus:outline-none focus:ring-1 transition-colors ${error
                                            ? 'border-error focus:border-error focus:ring-error'
                                            : 'border-outline-variant focus:border-primary focus:ring-primary'
                                        }`}
                                />
                            </div>
                            {error && <p className="text-label-sm text-error fade-in">{error}</p>}
                        </div>

                        <button
                            type="submit" disabled={loading}
                            className="btn-press w-full bg-primary-container hover:bg-primary text-on-primary font-medium text-label-md py-3 rounded-xl transition-colors disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                        >
                            {loading ? (
                                <>
                                    <span className="material-symbols-outlined text-[18px] spinner">progress_activity</span>
                                    Sending code...
                                </>
                            ) : 'Send Reset Code'}
                        </button>
                    </form>

                    <div className="mt-6 text-center">
                        <Link to="/login" className="text-primary hover:underline font-medium text-body-md inline-flex items-center gap-1">
                            <span className="material-symbols-outlined text-[18px]">arrow_back</span>
                            Back to Login
                        </Link>
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    )
}
