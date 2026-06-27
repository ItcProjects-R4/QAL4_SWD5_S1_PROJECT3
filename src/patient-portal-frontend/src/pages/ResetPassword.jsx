import { useState, useEffect, useRef } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import api from '../api/axios'
import Footer from '../components/Footer'

const TIMER_SECONDS = 120

export default function ResetPassword() {
    const navigate = useNavigate()
    const { t } = useTranslation()
    const phone = sessionStorage.getItem('resetPhone') || ''

    const [digits, setDigits] = useState(['', '', '', '', '', ''])
    const [newPw, setNewPw] = useState('')
    const [confirmPw, setConfirmPw] = useState('')
    const [showPw, setShowPw] = useState(false)
    const [errors, setErrors] = useState({})
    const [timeLeft, setTimeLeft] = useState(TIMER_SECONDS)
    const [canResend, setCanResend] = useState(false)
    const [msg, setMsg] = useState(null)
    const [loading, setLoading] = useState(false)
    const [success, setSuccess] = useState(false)
    const inputRefs = useRef([])

    useEffect(() => {
        if (!phone) navigate('/forgot-password')
    }, [phone, navigate])

    useEffect(() => {
        if (timeLeft <= 0) { setCanResend(true); return }
        const id = setTimeout(() => setTimeLeft(s => s - 1), 1000)
        return () => clearTimeout(id)
    }, [timeLeft])

    const fmt = (s) => `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`
    const code = digits.join('')
    const codeComplete = digits.every(d => d !== '')

    const handleInput = (i, val) => {
        const v = val.replace(/\D/g, '').slice(-1)
        const next = [...digits]
        next[i] = v
        setDigits(next)
        if (v && i < 5) inputRefs.current[i + 1]?.focus()
    }
    const handleKeyDown = (i, e) => {
        if (e.key === 'Backspace' && !digits[i] && i > 0) inputRefs.current[i - 1]?.focus()
    }
    const handlePaste = (e) => {
        const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6)
        if (pasted.length === 6) {
            setDigits(pasted.split(''))
            inputRefs.current[5]?.focus()
        }
        e.preventDefault()
    }

    const validate = () => {
        const e = {}
        if (!codeComplete) e.code = t('resetPassword.errorCode')
        if (newPw.length < 8) e.newPw = t('resetPassword.errorPwMin')
        if (confirmPw !== newPw) e.confirmPw = t('resetPassword.errorPwMatch')
        setErrors(e)
        return Object.keys(e).length === 0
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        setMsg(null)
        if (!validate()) return
        setLoading(true)
        try {
            await api.post('/api/portal/auth/resetpassword/confirm', {
                phone, code, newPassword: newPw,
            })
            sessionStorage.removeItem('resetPhone')
            setSuccess(true)
        } catch (err) {
            setMsg({ text: err.response?.data?.message || t('resetPassword.errorFallback'), type: 'error' })
        } finally {
            setLoading(false)
        }
    }

    const resend = async () => {
        if (!canResend) return
        try {
            await api.post('/api/portal/auth/resetpassword/request', { phone })
            setMsg({ text: t('resetPassword.resendSuccess'), type: 'success' })
            setTimeLeft(TIMER_SECONDS)
            setCanResend(false)
            setDigits(['', '', '', '', '', ''])
            inputRefs.current[0]?.focus()
        } catch {
            setMsg({ text: t('resetPassword.resendError'), type: 'error' })
        }
    }

    const fieldCls = (k) =>
        `w-full pl-10 pr-10 py-3 border rounded-xl bg-surface-container-lowest text-on-surface text-body-md focus:outline-none focus:ring-1 transition-colors ${errors[k]
            ? 'border-error focus:border-error focus:ring-error'
            : 'border-outline-variant focus:border-primary focus:ring-primary'
        }`

    if (success) return (
        <div className="bg-background min-h-screen flex flex-col text-on-surface page-enter">
            <main className="flex-grow flex items-center justify-center px-4 py-16">
                <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-10 md:p-16 text-center max-w-md w-full fade-up relative">
                    <div className="w-16 h-16 bg-success-container rounded-full flex items-center justify-center mx-auto mb-6 relative">
                        <span className="absolute inset-0 rounded-full bg-success ring-expand" />
                        <span className="material-symbols-outlined text-success text-[32px] check-pop">check_circle</span>
                    </div>
                    <h2 className="font-semibold text-headline-md text-on-surface mb-1">{t('resetPassword.successTitle')}</h2>
                    <p className="text-body-md text-on-surface-variant mb-10">{t('resetPassword.successMsg')}</p>
                    <Link to="/login" className="btn-press inline-flex items-center justify-center gap-2 bg-primary text-on-primary font-medium text-label-md px-8 py-3 rounded-xl hover:bg-primary-container transition-colors">
                        {t('resetPassword.goToLogin')}
                    </Link>
                </div>
            </main>
            <Footer />
        </div>
    )

    return (
        <div className="bg-surface min-h-screen flex flex-col text-on-surface page-enter">
            <header className="bg-surface/80 backdrop-blur-md border-b border-outline-variant sticky top-0 z-50">
                <div className="flex justify-between items-center w-full px-8 max-w-7xl mx-auto h-16">
                    <Link to="/" className="flex items-center gap-3 hover:scale-105 transition-transform">
                        <span className="material-symbols-outlined text-primary text-[28px]" style={{ fontVariationSettings: "'FILL' 1" }}>monitor_heart</span>
                        <span className="font-bold text-headline-md text-primary">SehhaTech</span>
                    </Link>
                    <Link to="/contact" className="p-1 hover:bg-surface-container rounded-full text-on-surface-variant transition-colors" aria-label={t('nav.help')}>
                        <span className="material-symbols-outlined">help</span>
                    </Link>
                </div>
            </header>

            <main className="flex-grow flex items-center justify-center p-4 md:p-8">
                <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-6 md:p-10 w-full max-w-md mx-auto fade-up">
                    <div className="text-center mb-6">
                        <span className="material-symbols-outlined text-primary mb-3 block mx-auto text-[48px]">dialpad</span>
                        <h1 className="font-semibold text-headline-md text-on-surface mb-1">{t('resetPassword.title')}</h1>
                        <p className="text-body-md text-on-surface-variant">
                            {t('resetPassword.subtitle')} <strong className="text-on-surface">{phone}</strong> {t('resetPassword.subtitleAnd')}
                        </p>
                    </div>

                    <form className="flex flex-col gap-6" onSubmit={handleSubmit} noValidate>
                        {/* OTP inputs */}
                        <div>
                            <div className="flex justify-center gap-1 md:gap-3 mb-3" onPaste={handlePaste}>
                                {digits.map((d, i) => (
                                    <input
                                        key={i}
                                        ref={el => inputRefs.current[i] = el}
                                        type="text" inputMode="numeric" maxLength={1} value={d}
                                        onChange={e => handleInput(i, e.target.value)}
                                        onKeyDown={e => handleKeyDown(i, e)}
                                        className={`w-11 h-12 md:w-12 md:h-14 text-center font-semibold text-headline-md border rounded-lg focus:ring-1 outline-none transition-colors bg-surface-container-lowest ${errors.code ? 'border-error focus:border-error focus:ring-error' : 'border-outline-variant focus:border-primary focus:ring-primary'}`}
                                    />
                                ))}
                            </div>
                            {errors.code && <p className="text-label-sm text-error text-center fade-in">{errors.code}</p>}

                            <div className="flex flex-col items-center gap-2 mt-3">
                                {!canResend && (
                                    <p className="text-label-md text-on-surface-variant">
                                        {t('resetPassword.resendIn')} <span className="font-bold text-primary">{fmt(timeLeft)}</span>
                                    </p>
                                )}
                                <button
                                    type="button" onClick={resend} disabled={!canResend}
                                    className={`text-label-md transition-opacity ${canResend ? 'text-primary cursor-pointer hover:underline' : 'text-secondary cursor-not-allowed opacity-50'}`}
                                >
                                    {t('resetPassword.resendBtn')}
                                </button>
                            </div>
                        </div>

                        {/* New password */}
                        <div className="flex flex-col gap-1">
                            <label className="font-medium text-label-md text-on-surface" htmlFor="newPw">
                                {t('resetPassword.newPwLabel')} <span className="text-error">*</span>
                            </label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <span className="material-symbols-outlined text-outline">lock</span>
                                </div>
                                <input
                                    id="newPw" type={showPw ? 'text' : 'password'} value={newPw}
                                    onChange={e => setNewPw(e.target.value)}
                                    placeholder={t('resetPassword.newPwPlaceholder')}
                                    autoComplete="new-password"
                                    className={fieldCls('newPw')}
                                />
                                <button
                                    type="button" onClick={() => setShowPw(v => !v)}
                                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-on-surface-variant hover:text-primary"
                                    aria-label={showPw ? t('resetPassword.hidePassword') : t('resetPassword.showPassword')}
                                >
                                    <span className="material-symbols-outlined">{showPw ? 'visibility_off' : 'visibility'}</span>
                                </button>
                            </div>
                            {errors.newPw && <p className="text-label-sm text-error fade-in">{errors.newPw}</p>}
                        </div>

                        {/* Confirm password */}
                        <div className="flex flex-col gap-1">
                            <label className="font-medium text-label-md text-on-surface" htmlFor="confirmPw">
                                {t('resetPassword.confirmPwLabel')} <span className="text-error">*</span>
                            </label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <span className="material-symbols-outlined text-outline">lock_reset</span>
                                </div>
                                <input
                                    id="confirmPw" type={showPw ? 'text' : 'password'} value={confirmPw}
                                    onChange={e => setConfirmPw(e.target.value)}
                                    placeholder={t('resetPassword.confirmPwPlaceholder')}
                                    autoComplete="new-password"
                                    className={fieldCls('confirmPw').replace('pr-10', 'pr-3')}
                                />
                            </div>
                            {errors.confirmPw && <p className="text-label-sm text-error fade-in">{errors.confirmPw}</p>}
                        </div>

                        {msg && (
                            <p className={`text-label-sm text-center fade-in ${msg.type === 'error' ? 'text-error' : 'text-success'}`}>
                                {msg.text}
                            </p>
                        )}

                        <button
                            type="submit" disabled={loading}
                            className="btn-press w-full bg-primary-container hover:bg-primary text-on-primary font-medium text-label-md py-3 rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                        >
                            {loading ? (
                                <>
                                    <span className="material-symbols-outlined text-[18px] spinner">progress_activity</span>
                                    {t('resetPassword.submitting')}
                                </>
                            ) : t('resetPassword.submitBtn')}
                        </button>
                    </form>

                    <div className="mt-6 text-center">
                        <Link to="/login" className="text-primary hover:underline font-medium text-body-md inline-flex items-center gap-1">
                            <span className="material-symbols-outlined text-[18px]">arrow_back</span>
                            {t('resetPassword.backToLogin')}
                        </Link>
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    )
}