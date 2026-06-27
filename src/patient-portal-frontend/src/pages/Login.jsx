import { useState, useEffect, useRef } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import api from '../api/axios'
import Footer from '../components/Footer'

export default function Login() {
    const navigate = useNavigate()
    const canvasRef = useRef(null)
    const { t, i18n } = useTranslation()
    const isAr = i18n.language === 'ar'

    const [phone, setPhone] = useState('')
    const [password, setPassword] = useState('')
    const [showPw, setShowPw] = useState(false)
    const [errors, setErrors] = useState({})
    const [general, setGeneral] = useState('')
    const [loading, setLoading] = useState(false)
    const [shakeForm, setShakeForm] = useState(false)

    /* ── animated background (canvas crosses) ── */
    useEffect(() => {
        const canvas = canvasRef.current
        if (!canvas) return
        const ctx = canvas.getContext('2d')
        let w, h, crosses = [], mouse = { x: -1000, y: -1000 }
        let animId

        const resize = () => {
            w = canvas.width = window.innerWidth
            h = canvas.height = window.innerHeight
            init()
        }
        const onMouse = (e) => { mouse.x = e.clientX; mouse.y = e.clientY }

        class Cross {
            constructor() {
                this.x = Math.random() * w
                this.y = Math.random() * h
                this.size = Math.random() * 15 + 5
                this.baseAlpha = Math.random() * 0.1 + 0.02
                this.alpha = this.baseAlpha
                this.vx = (Math.random() - 0.5) * 0.5
                this.vy = (Math.random() - 0.5) * 0.5
            }
            draw() {
                ctx.save()
                ctx.translate(this.x, this.y)
                ctx.globalAlpha = this.alpha
                ctx.fillStyle = '#005c9b'
                const t = this.size * 0.3, l = this.size
                ctx.fillRect(-l / 2, -t / 2, l, t)
                ctx.fillRect(-t / 2, -l / 2, t, l)
                ctx.restore()
            }
            update() {
                this.x += this.vx; this.y += this.vy
                if (this.x < -this.size) this.x = w + this.size
                if (this.x > w + this.size) this.x = -this.size
                if (this.y < -this.size) this.y = h + this.size
                if (this.y > h + this.size) this.y = -this.size
                const dx = mouse.x - this.x, dy = mouse.y - this.y
                const dist = Math.sqrt(dx * dx + dy * dy), ir = 150
                if (dist < ir) {
                    const f = (ir - dist) / ir
                    this.x -= dx * f * 0.05; this.y -= dy * f * 0.05
                    this.alpha = Math.min(this.baseAlpha + f * 0.2, 0.4)
                } else {
                    this.alpha += (this.baseAlpha - this.alpha) * 0.05
                }
                this.draw()
            }
        }

        const init = () => {
            crosses = []
            const n = Math.floor(w * h / 15000)
            for (let i = 0; i < n; i++) crosses.push(new Cross())
        }
        const animate = () => {
            ctx.clearRect(0, 0, w, h)
            crosses.forEach(c => c.update())
            animId = requestAnimationFrame(animate)
        }

        window.addEventListener('resize', resize)
        window.addEventListener('mousemove', onMouse)
        resize(); animate()

        return () => {
            window.removeEventListener('resize', resize)
            window.removeEventListener('mousemove', onMouse)
            cancelAnimationFrame(animId)
        }
    }, [])

    /* ── validation ── */
    const phoneRe = /^(01[0125][0-9]{8})$/
    const validate = () => {
        const e = {}
        if (!phoneRe.test(phone)) e.phone = t('validation.phoneInvalid')
        if (password.length < 8) e.password = t('validation.passwordMin')
        setErrors(e)
        return Object.keys(e).length === 0
    }

    /* ── submit ── */
    const handleSubmit = async (e) => {
        e.preventDefault()
        setGeneral('')
        if (!validate()) {
            setShakeForm(true)
            setTimeout(() => setShakeForm(false), 500)
            return
        }
        setLoading(true)
        try {
            const res = await api.post('/api/portal/auth/login', { phone, password })
            const { accessToken, refreshToken, fullName, phone: p } = res.data.data
            localStorage.setItem('accessToken', accessToken)
            localStorage.setItem('refreshToken', refreshToken)
            localStorage.setItem('patientName', fullName)
            localStorage.setItem('patientPhone', p)
            navigate('/clinics')
        } catch (err) {
            const msg = err.response?.data?.message || t('login.errorFallback')
            setGeneral(msg)
            setShakeForm(true)
            setTimeout(() => setShakeForm(false), 500)

            if (msg.toLowerCase().includes('not verified')) {
                try {
                    await api.post('/api/portal/auth/resend-otp', { phone, purpose: 0 })
                } catch {
                    // ignore — verify page has its own resend
                }
                sessionStorage.setItem('registerPhone', phone)
                navigate('/verify-otp')
            }
        } finally {
            setLoading(false)
        }
    }

    // RTL-aware: use logical padding (ps/pe) for input icons
    const fieldCls = (key) =>
        `w-full ps-10 pe-3 py-3 border rounded-xl bg-surface-container-lowest text-on-surface text-body-md focus:outline-none focus:ring-1 transition-colors ${errors[key]
            ? 'border-error focus:border-error focus:ring-error'
            : 'border-outline-variant focus:border-primary focus:ring-primary'
        }`

    return (
        <div className="bg-background text-on-surface min-h-screen flex flex-col relative overflow-hidden page-enter">
            <canvas ref={canvasRef} className="fixed inset-0 w-full h-full pointer-events-none z-0" style={{ backgroundColor: '#f8f9ff' }} />

            {/* Header */}
            <header className="bg-surface/80 backdrop-blur-md border-b border-outline-variant sticky top-0 z-50">
                <div className="flex justify-between items-center w-full px-8 max-w-7xl mx-auto h-16">
                    <Link to="/" className="flex items-center gap-3 hover:scale-105 transition-transform">
                        <span className="material-symbols-outlined text-primary text-[28px] icon-pop" style={{ fontVariationSettings: "'FILL' 1" }}>monitor_heart</span>
                        <span className="font-bold text-headline-md text-primary">SehhaTech</span>
                    </Link>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => i18n.changeLanguage(isAr ? 'en' : 'ar')}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-outline-variant text-on-surface-variant hover:border-primary hover:text-primary hover:bg-primary/5 transition-all text-label-sm font-medium"
                            aria-label="Switch language"
                        >
                            <span className="material-symbols-outlined text-[16px]" style={{ fontVariationSettings: "'FILL' 0" }}>language</span>
                            {isAr ? 'English' : 'العربية'}
                        </button>
                        <Link to="/contact" className="p-1 hover:bg-surface-container rounded-full text-on-surface-variant transition-colors" aria-label={t('nav.help')}>
                            <span className="material-symbols-outlined">help</span>
                        </Link>
                    </div>
                </div>
            </header>

            {/* Card */}
            <main className="flex-grow flex items-center justify-center p-4 md:p-8 relative z-10">
                <div className={`bg-surface-container-lowest w-full max-w-md border border-outline-variant rounded-xl shadow-[0_4px_12px_rgba(0,0,0,0.05)] p-6 md:p-10 fade-up ${shakeForm ? 'shake' : ''}`}>
                    <div className="text-center mb-6">
                        <h1 className="font-semibold text-headline-lg-mobile md:text-headline-lg text-on-surface mb-1">{t('login.title')}</h1>
                        <p className="text-body-md text-on-surface-variant">{t('login.subtitle')}</p>
                    </div>

                    <form className="flex flex-col gap-6" onSubmit={handleSubmit} noValidate>
                        {/* Phone */}
                        <div className="flex flex-col gap-1">
                            <label className="font-medium text-label-md text-on-surface" htmlFor="phone">
                                {t('login.phoneLabel')} <span className="text-error">*</span>
                            </label>
                            <div className="relative">
                                <div className="absolute inset-y-0 start-0 ps-3 flex items-center pointer-events-none">
                                    <span className="material-symbols-outlined text-outline">phone</span>
                                </div>
                                <input
                                    id="phone" type="tel" value={phone}
                                    onChange={e => setPhone(e.target.value)}
                                    onBlur={() => {
                                        if (!phoneRe.test(phone)) setErrors(p => ({ ...p, phone: t('validation.phoneInvalid') }))
                                        else setErrors(p => { const n = { ...p }; delete n.phone; return n })
                                    }}
                                    placeholder="01xxxxxxxxx"
                                    autoComplete="tel"
                                    className={fieldCls('phone')}
                                />
                            </div>
                            {errors.phone && <p className="text-label-sm text-error fade-in">{errors.phone}</p>}
                        </div>

                        {/* Password */}
                        <div className="flex flex-col gap-1">
                            <label className="font-medium text-label-md text-on-surface" htmlFor="password">
                                {t('login.passwordLabel')} <span className="text-error">*</span>
                            </label>
                            <div className="relative">
                                <div className="absolute inset-y-0 start-0 ps-3 flex items-center pointer-events-none">
                                    <span className="material-symbols-outlined text-outline">lock</span>
                                </div>
                                <input
                                    id="password" type={showPw ? 'text' : 'password'} value={password}
                                    onChange={e => setPassword(e.target.value)}
                                    onBlur={() => {
                                        if (password.length < 8) setErrors(p => ({ ...p, password: t('validation.passwordMin') }))
                                        else setErrors(p => { const n = { ...p }; delete n.password; return n })
                                    }}
                                    placeholder="••••••••"
                                    autoComplete="current-password"
                                    className={fieldCls('password') + ' pe-10'}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPw(v => !v)}
                                    className="absolute inset-y-0 end-0 pe-3 flex items-center text-on-surface-variant hover:text-primary"
                                    aria-label={showPw ? t('login.hidePassword') : t('login.showPassword')}
                                >
                                    <span className="material-symbols-outlined">{showPw ? 'visibility_off' : 'visibility'}</span>
                                </button>
                            </div>
                            {errors.password && <p className="text-label-sm text-error fade-in">{errors.password}</p>}
                            <div className="flex justify-end mt-1">
                                <Link className="text-label-sm text-primary hover:text-primary-container transition-colors hover:underline" to="/forgot-password">
                                    {t('login.forgotPassword')}
                                </Link>
                            </div>
                        </div>

                        {general && <p className="text-label-sm text-error text-center fade-in">{general}</p>}

                        <button
                            type="submit"
                            disabled={loading}
                            className="btn-press w-full bg-primary-container hover:bg-primary text-on-primary font-medium text-label-md py-3 rounded-xl transition-colors active:opacity-80 mt-3 disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                        >
                            {loading ? (
                                <>
                                    <span className="material-symbols-outlined text-[18px] spinner">progress_activity</span>
                                    {t('login.submitting')}
                                </>
                            ) : t('login.submitBtn')}
                        </button>
                    </form>

                    <div className="mt-6 text-center">
                        <p className="text-body-md text-on-surface-variant">
                            {t('login.noAccount')}{' '}
                            <Link className="text-primary hover:underline font-medium" to="/register">{t('login.registerLink')}</Link>
                        </p>
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    )
}