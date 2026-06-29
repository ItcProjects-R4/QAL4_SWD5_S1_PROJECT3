import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import Footer from '../components/Footer'
import HeartbeatLine from '../components/HeartbeatLine'
import { useScrollReveal } from '../hooks/useScrollReveal'
import { useTilt } from '../hooks/useTilt'
import logo from '../assets/logo.jpeg'

// Non-translatable static data (icons & tags only)
const FEATURE_META = [
    { icon: 'local_hospital', tag: '01' },
    { icon: 'calendar_month', tag: '02' },
    { icon: 'event_available', tag: '03' },
]

const STEP_META = [
    { n: '1', icon: 'person_add' },
    { n: '2', icon: 'search' },
    { n: '3', icon: 'favorite' },
]

function SplitWords({ text, className = '', delayStart = 0, stagger = 0.09 }) {
    const words = text.split(' ')
    return (
        <>
            {words.map((w, i) => (
                <span key={i} className={`lp-word ${className}`}>
                    <span style={{ animationDelay: `${delayStart + i * stagger}s` }}>{w}</span>
                    {i < words.length - 1 ? '\u00A0' : ''}
                </span>
            ))}
        </>
    )
}

function RevealStep({ s, index }) {
    const ref = useScrollReveal()
    return (
        <div ref={ref} className="lp-reveal flex gap-6 md:gap-8 relative" style={{ transitionDelay: `${index * 0.15}s` }}>
            <div className="relative flex-shrink-0">
                <div className="w-12 md:w-14 h-12 md:h-14 bg-primary text-on-primary rounded-full flex items-center justify-center font-bold text-headline-md relative z-10 shadow-[0_8px_20px_rgba(0,92,155,0.25)]">
                    {s.n}
                </div>
            </div>
            <div className="pt-1 md:pt-2">
                <div className="flex items-center gap-2 mb-1">
                    <span className="material-symbols-outlined text-primary text-[20px]">{s.icon}</span>
                    <h3 className="font-semibold text-headline-md text-on-surface">{s.title}</h3>
                </div>
                <p className="text-body-md text-on-surface-variant leading-relaxed max-w-md">{s.desc}</p>
            </div>
        </div>
    )
}

function FeatureCard({ f, index }) {
    const revealRef = useScrollReveal()
    const { ref: tiltRef, onMouseMove, onMouseLeave } = useTilt(6)

    return (
        <div
            ref={(el) => { revealRef.current = el; tiltRef.current = el }}
            onMouseMove={onMouseMove}
            onMouseLeave={onMouseLeave}
            className="lp-tilt lp-reveal-scale bg-surface-container-lowest border border-outline-variant rounded-2xl p-7 relative overflow-hidden group"
            style={{ transitionDelay: `${index * 0.1}s` }}
        >
            <span className="lp-serif absolute -top-2 -right-1 text-[64px] font-light text-primary/[0.06] select-none leading-none">
                {f.tag}
            </span>
            <div className="w-14 h-14 bg-primary-container rounded-2xl flex items-center justify-center mb-6 relative z-10 transition-transform duration-300 group-hover:scale-110 group-hover:-rotate-6">
                <span className="material-symbols-outlined text-on-primary text-[28px]">{f.icon}</span>
            </div>
            <h3 className="font-semibold text-headline-md text-on-surface mb-2 relative z-10">{f.title}</h3>
            <p className="text-body-md text-on-surface-variant relative z-10 leading-relaxed">{f.desc}</p>
        </div>
    )
}

export default function Landing() {
    const [mobileOpen, setMobileOpen] = useState(false)
    const { t, i18n } = useTranslation()

    const featuresHeadingReveal = useScrollReveal()
    const ctaReveal = useScrollReveal()
    const howItWorksReveal = useScrollReveal()

    // Merge translated text with static icon/tag data
    const featureItems = t('features.items', { returnObjects: true })
    const FEATURES = FEATURE_META.map((meta, i) => ({ ...meta, ...featureItems[i] }))

    const stepItems = t('howItWorks.steps', { returnObjects: true })
    const STEPS = STEP_META.map((meta, i) => ({ ...meta, ...stepItems[i] }))

    const TRUST_ITEMS = t('trust.items', { returnObjects: true })

    const isAr = i18n.language === 'ar'

    return (
        <div className="min-h-screen flex flex-col text-on-surface page-enter overflow-x-hidden">
            {/* ============ HEADER ============ */}
            <header className="bg-surface/80 backdrop-blur-md border-b border-outline-variant sticky top-0 z-50">
                <div className="flex justify-between items-center w-full px-4 md:px-8 max-w-7xl mx-auto h-16">
                    <Link to="/" className="flex items-center gap-3 hover:scale-105 transition-transform">
                        <img src={logo} alt="SehhaTech Logo" className="h-9 w-9 object-contain icon-pop" />
                        <span className="font-bold text-headline-md text-primary">SehhaTech</span>
                    </Link>

                    <div className="hidden md:flex items-center gap-3">
                        {/* Language switcher */}
                        <button
                            onClick={() => i18n.changeLanguage(isAr ? 'en' : 'ar')}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-outline-variant text-on-surface-variant hover:border-primary hover:text-primary hover:bg-primary/5 transition-all text-label-sm font-medium"
                            aria-label="Switch language"
                        >
                            <span className="material-symbols-outlined text-[16px]" style={{ fontVariationSettings: "'FILL' 0" }}>
                                language
                            </span>
                            {isAr ? 'English' : 'العربية'}
                        </button>
                        <Link to="/login" className="link-underline font-medium text-label-md text-primary">
                            {t('nav.login')}
                        </Link>
                        <Link
                            to="/register"
                            className="btn-press bg-primary-container text-on-primary font-medium text-label-md px-6 py-3 rounded-xl hover:bg-primary transition-colors"
                        >
                            {t('nav.getStarted')}
                        </Link>
                    </div>

                    <button
                        onClick={() => setMobileOpen(v => !v)}
                        className="md:hidden p-2 rounded-lg text-on-surface hover:bg-surface-container transition-colors w-10 h-10 flex items-center justify-center"
                        aria-label={t('nav.toggleMenu')}
                        aria-expanded={mobileOpen}
                    >
                        <span className="relative w-6 h-5 flex flex-col justify-between">
                            <span className={`block h-[2px] w-full bg-current rounded transition-all duration-300 ${mobileOpen ? 'rotate-45 translate-y-[9px]' : ''}`} />
                            <span className={`block h-[2px] w-full bg-current rounded transition-all duration-300 ${mobileOpen ? 'opacity-0' : 'opacity-100'}`} />
                            <span className={`block h-[2px] w-full bg-current rounded transition-all duration-300 ${mobileOpen ? '-rotate-45 -translate-y-[9px]' : ''}`} />
                        </span>
                    </button>
                </div>

                {mobileOpen && (
                    <div className="md:hidden border-t border-outline-variant bg-surface menu-slide">
                        <div className="flex flex-col px-4 py-3 gap-1">
                            {/* Language switcher — mobile */}
                            <button
                                onClick={() => { i18n.changeLanguage(isAr ? 'en' : 'ar'); setMobileOpen(false) }}
                                className="px-3 py-3 rounded-xl text-body-md font-medium text-on-surface-variant hover:bg-surface-container transition-colors text-start"
                            >
                                {isAr ? 'English' : 'العربية'}
                            </button>
                            <Link
                                to="/login"
                                className="px-3 py-3 rounded-xl text-body-md font-medium text-primary hover:bg-primary-container/15 transition-colors"
                            >
                                {t('nav.login')}
                            </Link>
                            <Link
                                to="/register"
                                className="px-3 py-3 rounded-xl text-body-md font-medium bg-primary-container text-on-primary text-center hover:bg-primary transition-colors"
                            >
                                {t('nav.getStarted')}
                            </Link>
                        </div>
                    </div>
                )}
            </header>

            {/* ============ HERO ============ */}
            <section className="relative flex-grow flex items-center justify-center pt-20 pb-28 px-4 md:px-8 overflow-hidden" style={{ background: 'radial-gradient(120% 100% at 50% 0%, #eef4ff 0%, #f8f9ff 45%, #ffffff 100%)' }}>
                {/* layered ambient blobs */}
                <div aria-hidden="true" className="absolute -top-32 -left-24 w-[420px] h-[420px] rounded-full lp-blob" style={{ background: 'radial-gradient(circle, rgba(46,117,182,0.16) 0%, rgba(46,117,182,0) 70%)' }} />
                <div aria-hidden="true" className="absolute top-1/3 -right-32 w-[480px] h-[480px] rounded-full lp-blob-slow" style={{ background: 'radial-gradient(circle, rgba(255,91,77,0.10) 0%, rgba(255,91,77,0) 70%)' }} />
                <div aria-hidden="true" className="absolute bottom-0 left-1/4 w-[360px] h-[360px] rounded-full lp-blob" style={{ background: 'radial-gradient(circle, rgba(159,201,184,0.18) 0%, rgba(159,201,184,0) 70%)', animationDelay: '4s' }} />
                <div className="lp-grain" aria-hidden="true" />

                <div className="relative z-10 max-w-5xl mx-auto w-full">
                    {/* eyebrow chip */}
                    <div className="flex justify-center mb-8">
                        <div className="lp-bob inline-flex items-center gap-2 bg-surface-container-lowest border border-outline-variant px-4 py-1.5 rounded-full shadow-[0_4px_14px_rgba(0,0,0,0.04)] fade-up" style={{ animationDelay: '.1s' }}>
                            <span className="relative flex h-2 w-2">
                                <span className="absolute inline-flex h-full w-full rounded-full bg-primary opacity-60 pulse-ring" />
                                <span className="relative inline-flex rounded-full h-2 w-2 bg-primary" />
                            </span>
                            <span className="font-semibold text-label-sm text-primary tracking-wide">{t('hero.badge')}</span>
                        </div>
                    </div>

                    {/* headline with word-by-word reveal + serif display type */}
                    <h1 className="lp-serif text-center font-medium mb-6" style={{ fontSize: 'clamp(40px, 7vw, 80px)', lineHeight: 1.04, letterSpacing: '-0.02em' }}>
                        <SplitWords text={t('hero.headline1')} delayStart={0.15} />
                        <br />
                        <span className="text-primary italic">
                            <SplitWords text={t('hero.headline2')} delayStart={0.45} />
                        </span>
                    </h1>

                    {/* heartbeat signature line */}
                    <div className="relative w-full max-w-2xl mx-auto h-12 my-2 fade-in" style={{ animationDelay: '.9s' }}>
                        <HeartbeatLine className="w-full h-full" color="#FF5B4D" />
                    </div>

                    <p className="text-body-lg text-on-surface-variant mb-10 fade-up max-w-xl mx-auto text-center" style={{ animationDelay: '1.1s' }}>
                        {t('hero.subtitle')}
                    </p>

                    <div className="flex flex-col sm:flex-row gap-4 justify-center fade-up" style={{ animationDelay: '1.25s' }}>
                        <Link
                            to="/register"
                            className="lp-cta-glow btn-press bg-primary text-on-primary font-medium text-label-md px-10 py-4 rounded-full hover:bg-primary-container transition-all flex items-center justify-center gap-2"
                        >
                            <span className="material-symbols-outlined text-[20px]">person_add</span>
                            {t('hero.ctaPrimary')}
                        </Link>
                        <Link
                            to="/clinics"
                            className="btn-press bg-surface-container-lowest border border-outline-variant text-on-surface font-medium text-label-md px-10 py-4 rounded-full hover:border-primary hover:text-primary transition-all flex items-center justify-center gap-2"
                        >
                            <span className="material-symbols-outlined text-[20px]">search</span>
                            {t('hero.ctaSecondary')}
                        </Link>
                    </div>

                    {/* floating stat chips */}
                    <div className="hidden lg:block">
                        <div className="lp-bob absolute -left-4 top-16 bg-surface-container-lowest border border-outline-variant rounded-2xl px-5 py-3 shadow-[0_8px_24px_rgba(0,0,0,0.06)] fade-up" style={{ animationDelay: '1.5s' }}>
                            <p className="lp-serif text-headline-lg text-primary leading-none">2 min</p>
                            <p className="text-label-sm text-on-surface-variant mt-1">{t('hero.statBookingLabel')}</p>
                        </div>
                        <div className="lp-bob-delay absolute -right-2 top-40 bg-surface-container-lowest border border-outline-variant rounded-2xl px-5 py-3 shadow-[0_8px_24px_rgba(0,0,0,0.06)] fade-up" style={{ animationDelay: '1.65s' }}>
                            <p className="lp-serif text-headline-lg text-primary leading-none">24/7</p>
                            <p className="text-label-sm text-on-surface-variant mt-1">{t('hero.statAvailabilityLabel')}</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* ============ TRUST MARQUEE ============ */}
            <div className="lp-marquee-wrap relative bg-surface-container-lowest border-y border-outline-variant py-5 overflow-hidden">
                <div className="absolute left-0 top-0 bottom-0 w-16 z-10 bg-gradient-to-r from-surface-container-lowest to-transparent pointer-events-none" />
                <div className="absolute right-0 top-0 bottom-0 w-16 z-10 bg-gradient-to-l from-surface-container-lowest to-transparent pointer-events-none" />
                <div className="lp-marquee-track flex gap-10 whitespace-nowrap w-max">
                    {[...TRUST_ITEMS, ...TRUST_ITEMS].map((item, i) => (
                        <span key={i} className="flex items-center gap-2 text-label-md font-medium text-on-surface-variant">
                            <span className="w-1.5 h-1.5 rounded-full bg-primary/40" />
                            {item}
                        </span>
                    ))}
                </div>
            </div>

            {/* ============ FEATURES ============ */}
            <section className="py-24 px-4 md:px-8 bg-surface-container-lowest relative">
                <div className="max-w-5xl mx-auto">
                    <div className="text-center mb-14 lp-reveal" ref={featuresHeadingReveal}>
                        <span className="text-label-sm font-semibold text-primary tracking-[0.15em] uppercase">
                            {t('features.eyebrow')}
                        </span>
                        <h2 className="lp-serif font-medium text-on-surface mt-2" style={{ fontSize: 'clamp(28px, 4vw, 44px)' }}>
                            {t('features.heading')}
                        </h2>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {FEATURES.map((f, i) => (
                            <FeatureCard key={f.tag} f={f} index={i} />
                        ))}
                    </div>
                </div>
            </section>

            {/* ============ HOW IT WORKS — vertical pulse timeline ============ */}
            <section className="py-24 px-4 md:px-8 relative overflow-hidden">
                <div aria-hidden="true" className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full opacity-50" style={{ background: 'radial-gradient(circle, rgba(46,117,182,0.05) 0%, rgba(46,117,182,0) 70%)' }} />

                <div className="max-w-3xl mx-auto relative z-10">
                    <div ref={howItWorksReveal} className="text-center mb-16 lp-reveal">
                        <span className="text-label-sm font-semibold text-primary tracking-[0.15em] uppercase">
                            {t('howItWorks.eyebrow')}
                        </span>
                        <h2 className="lp-serif font-medium text-on-surface mt-2" style={{ fontSize: 'clamp(28px, 4vw, 44px)' }}>
                            {t('howItWorks.heading')}
                        </h2>
                    </div>

                    <div className="relative">
                        {/* vertical timeline track */}
                        <div className="absolute start-6 md:start-7 top-2 bottom-2 w-[2px] bg-outline-variant overflow-hidden">
                            <div className="lp-timeline-fill w-full bg-primary origin-top" />
                        </div>

                        <div className="flex flex-col gap-12">
                            {STEPS.map((s, i) => (
                                <RevealStep key={s.n} s={s} index={i} />
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            {/* ============ CTA ============ */}
            <section className="py-28 px-4 md:px-8 relative overflow-hidden" style={{ background: 'linear-gradient(135deg, #003e6b 0%, #005c9b 55%, #2e75b6 100%)' }}>
                <div aria-hidden="true" className="absolute inset-0 opacity-[0.07]">
                    <HeartbeatLine className="w-full h-full" color="#ffffff" glow={false} />
                </div>
                <div className="lp-grain" aria-hidden="true" />

                <div ref={ctaReveal} className="lp-reveal max-w-2xl mx-auto text-center relative z-10">
                    <h2 className="lp-serif font-medium text-white mb-3" style={{ fontSize: 'clamp(28px, 5vw, 48px)' }}>
                        {t('cta.heading')}
                    </h2>
                    <p className="text-body-lg text-white/70 mb-10 max-w-md mx-auto">
                        {t('cta.subtitle')}
                    </p>
                    <Link
                        to="/register"
                        className="btn-press inline-flex items-center gap-2 bg-white text-primary font-medium text-label-md px-10 py-4 rounded-full hover:bg-surface-container-low transition-all shadow-[0_12px_32px_rgba(0,0,0,0.25)]"
                    >
                        <span className="material-symbols-outlined text-[20px]">person_add</span>
                        {t('cta.button')}
                    </Link>
                </div>
            </section>

            <Footer />
        </div>
    )
}
