import { Link } from "react-router-dom";
import { useEffect, useRef, useState, useCallback } from "react";
import { useTranslation } from "react-i18next";
import PublicFooter from "../../components/public/PublicFooter";
import ChatbotWidget from "../../components/public/ChatbotWidget";
import heroDashboardImg from "../../assets/images/hero-dashboard.png";
import aboutClinicDoctorImg from "../../assets/images/about-clinic-doctor.png";
import storyMobileAppImg from "../../assets/images/story-mobile-app.png";
import sehhatechIcon from "../../assets/images/sehhatech-icon.png";
import LanguageSwitcher from "../../components/LanguageSwitcher";

const openChat = () => window.dispatchEvent(new Event("sehhatech:open-chat"));

/* ─── Scroll Reveal ─────────────────────────────────────── */
function useScrollReveal() {
    const rootRef = useRef(null);
    useEffect(() => {
        const root = rootRef.current;
        if (!root) return;
        const targets = root.querySelectorAll("[data-reveal]");
        if (!targets.length) return;
        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        entry.target.classList.add("is-visible");
                        observer.unobserve(entry.target);
                    }
                });
            },
            { threshold: 0.12, rootMargin: "0px 0px -6% 0px" }
        );
        targets.forEach((el) => observer.observe(el));
        return () => observer.disconnect();
    }, []);
    return rootRef;
}

/* ─── Count-Up ──────────────────────────────────────────── */
function useCountUp(end, duration = 1600) {
    const ref = useRef(null);
    const [value, setValue] = useState(0);
    useEffect(() => {
        const el = ref.current;
        if (!el) return;
        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (!entry.isIntersecting) return;
                    observer.unobserve(entry.target);
                    const start = performance.now();
                    const step = (now) => {
                        const progress = Math.min((now - start) / duration, 1);
                        const eased = 1 - Math.pow(1 - progress, 4);
                        setValue(Math.round(eased * end));
                        if (progress < 1) requestAnimationFrame(step);
                    };
                    requestAnimationFrame(step);
                });
            },
            { threshold: 0.5 }
        );
        observer.observe(el);
        return () => observer.disconnect();
    }, [end, duration]);
    return [ref, value];
}

/* ─── Mouse Parallax (hero image) ───────────────────────── */
function useMouseParallax(strength = 12) {
    const ref = useRef(null);
    useEffect(() => {
        const el = ref.current;
        if (!el) return;
        const handleMove = (e) => {
            const { innerWidth: w, innerHeight: h } = window;
            const x = (e.clientX / w - 0.5) * strength;
            const y = (e.clientY / h - 0.5) * strength;
            el.style.transform = `translate(${x}px, ${y}px)`;
        };
        window.addEventListener("mousemove", handleMove, { passive: true });
        return () => window.removeEventListener("mousemove", handleMove);
    }, [strength]);
    return ref;
}

/* ─── 3D Card Tilt ───────────────────────────────────────── */
function useTilt(maxAngle = 10) {
    const ref = useRef(null);
    const handleMove = useCallback((e) => {
        const el = ref.current;
        if (!el) return;
        const rect = el.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        const cx = rect.width / 2;
        const cy = rect.height / 2;
        const rotY = ((x - cx) / cx) * maxAngle;
        const rotX = -((y - cy) / cy) * maxAngle;
        el.style.transform = `perspective(800px) rotateX(${rotX}deg) rotateY(${rotY}deg) scale(1.03)`;
        el.style.transition = "transform 0.1s ease";
    }, [maxAngle]);

    const handleLeave = useCallback(() => {
        const el = ref.current;
        if (!el) return;
        el.style.transform = "perspective(800px) rotateX(0deg) rotateY(0deg) scale(1)";
        el.style.transition = "transform 0.5s cubic-bezier(0.34,1.56,0.64,1)";
    }, []);

    return { ref, handleMove, handleLeave };
}

/* ─── Magnetic Button ────────────────────────────────────── */
function useMagnetic(strength = 0.35) {
    const ref = useRef(null);
    useEffect(() => {
        const el = ref.current;
        if (!el) return;
        const handleMove = (e) => {
            const rect = el.getBoundingClientRect();
            const x = e.clientX - (rect.left + rect.width / 2);
            const y = e.clientY - (rect.top + rect.height / 2);
            el.style.transform = `translate(${x * strength}px, ${y * strength}px)`;
            el.style.transition = "transform 0.15s ease";
        };
        const handleLeave = () => {
            el.style.transform = "translate(0, 0)";
            el.style.transition = "transform 0.5s cubic-bezier(0.34,1.56,0.64,1)";
        };
        el.addEventListener("mousemove", handleMove);
        el.addEventListener("mouseleave", handleLeave);
        return () => {
            el.removeEventListener("mousemove", handleMove);
            el.removeEventListener("mouseleave", handleLeave);
        };
    }, [strength]);
    return ref;
}

/* ─── Typewriter ─────────────────────────────────────────── */
function useTypewriter(text, speed = 38, startDelay = 600) {
    const [displayed, setDisplayed] = useState("");
    const [done, setDone] = useState(false);
    useEffect(() => {
        let i = 0;
        let timer;
        setDisplayed("");
        setDone(false);
        const start = setTimeout(() => {
            timer = setInterval(() => {
                setDisplayed(text.slice(0, ++i));
                if (i >= text.length) {
                    clearInterval(timer);
                    setDone(true);
                }
            }, speed);
        }, startDelay);
        return () => {
            clearTimeout(start);
            clearInterval(timer);
        };
    }, [text, speed, startDelay]);
    return { displayed, done };
}

/* ─── Tilt Card wrapper component ────────────────────────── */
function TiltCard({ className, children, maxAngle = 8, style, ...rest }) {
    const { ref, handleMove, handleLeave } = useTilt(maxAngle);
    return (
        <div
            ref={ref}
            className={className}
            style={{ willChange: "transform", ...style }}
            onMouseMove={handleMove}
            onMouseLeave={handleLeave}
            {...rest}
        >
            {children}
        </div>
    );
}

/* ─── Main Component ─────────────────────────────────────── */
export default function Landing() {
    const { t } = useTranslation();
    const pageRef = useScrollReveal();
    const [badgeRef, badgeCount] = useCountUp(50);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const parallaxRef = useMouseParallax(14);
    const magneticRef = useMagnetic(0.3);
    const { displayed: heroText, done: heroDone } = useTypewriter(
        t("landing.heroTitle"),
        30,
        700
    );

    // ─── Data arrays (inside component so t() works) ───────
    const FEATURES = [
        {
            modifier: "secondary", title: t("landing.feature1Title"), accent: false,
            text: t("landing.feature1Text"),
            icon: (
                <svg className="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="4" width="18" height="18" rx="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" />
                </svg>
            ),
        },
        {
            modifier: "tertiary", title: t("landing.feature2Title"), accent: true,
            text: t("landing.feature2Text"),
            icon: (
                <svg className="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" /><path d="M14 2v6h6" /><line x1="9" y1="13" x2="15" y2="13" /><line x1="9" y1="17" x2="15" y2="17" />
                </svg>
            ),
        },
        {
            modifier: "primary", title: t("landing.feature3Title"), accent: false,
            text: t("landing.feature3Text"),
            icon: (
                <svg className="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="12" y1="1" x2="12" y2="23" /><path d="M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6" />
                </svg>
            ),
        },
    ];

    const PRINCIPLES = [
        {
            modifier: "secondary", offset: false,
            title: t("landing.principle1Title"), text: t("landing.principle1Text"),
            icon: (<svg className="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z" /></svg>),
        },
        {
            modifier: "tertiary", offset: true,
            title: t("landing.principle2Title"), text: t("landing.principle2Text"),
            icon: (<svg className="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9.5 2A5.5 5.5 0 004 7.5c0 1.86.84 3.5 2 4.5l.5 4h3l.5-4c1.16-1 2-2.64 2-4.5A5.5 5.5 0 009.5 2z" /><path d="M9 18h3" /></svg>),
        },
        {
            modifier: "primary", offset: false,
            title: t("landing.principle3Title"), text: t("landing.principle3Text"),
            icon: (<svg className="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><circle cx="12" cy="12" r="3" /></svg>),
        },
        {
            modifier: "secondary-container", offset: true,
            title: t("landing.principle4Title"), text: t("landing.principle4Text"),
            icon: (<svg className="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 10h-1.26A8 8 0 109 20h9a5 5 0 000-10z" /><path d="M9 13l2 2 4-4" /></svg>),
        },
    ];

    const ROLES = [
        { num: 1, role: t("landing.role1Title"), desc: t("landing.role1Desc") },
        { num: 2, role: t("landing.role2Title"), desc: t("landing.role2Desc") },
        { num: 3, role: t("landing.role3Title"), desc: t("landing.role3Desc") },
    ];

    return (
        <div className="landing-page" ref={pageRef}>

            {/* ── Nav ── */}
            <nav className="landing-nav">
                <div className="landing-nav__inner">
                    <div className="landing-nav__brand">
                        <img src={sehhatechIcon} alt="SehhaTech" className="landing-nav__brand-icon" />
                        SehhaTech
                    </div>
                    <div className="landing-nav__links">
                        <a href="#features" className="landing-nav__link">{t("landing.navFeatures")}</a>
                        <a href="#about" className="landing-nav__link">{t("landing.navAbout")}</a>
                    </div>
                    <div className="landing-nav__actions">
                        <Link to="/login" className="landing-nav__link landing-nav__link--desktop-only">
                            {t("landing.navLogin")}
                        </Link>
                        <Link to="/register" className="btn btn--gradient">
                            {t("landing.navRegister")}
                        </Link>
                        <LanguageSwitcher />

                        <button
                            type="button"
                            className={`landing-nav__burger${mobileMenuOpen ? " landing-nav__burger--open" : ""}`}
                            aria-label={mobileMenuOpen ? t("landing.closeMenu") : t("landing.openMenu")}
                            aria-expanded={mobileMenuOpen}
                            onClick={() => setMobileMenuOpen((v) => !v)}
                        >
                            <span /><span /><span />
                        </button>
                    </div>
                </div>
                <div className={`landing-nav__mobile-panel${mobileMenuOpen ? " landing-nav__mobile-panel--open" : ""}`}>
                    <a href="#features" className="landing-nav__mobile-link" onClick={() => setMobileMenuOpen(false)}>{t("landing.navFeatures")}</a>
                    <a href="#about" className="landing-nav__mobile-link" onClick={() => setMobileMenuOpen(false)}>{t("landing.navAbout")}</a>
                    <Link to="/login" className="landing-nav__mobile-link" onClick={() => setMobileMenuOpen(false)}>{t("landing.navLogin")}</Link>
                    <Link to="/register" className="btn btn--gradient" onClick={() => setMobileMenuOpen(false)}>{t("landing.navRegister")}</Link>
                </div>
            </nav>

            <main className="landing-main">

                {/* ── Hero ── */}
                <section className="landing-hero">
                    <div className="hero-orb hero-orb--1" aria-hidden="true" />
                    <div className="hero-orb hero-orb--2" aria-hidden="true" />
                    <div className="hero-orb hero-orb--3" aria-hidden="true" />

                    <div className="landing-hero__grid">
                        <div className="landing-hero__copy" data-reveal="fade-right">
                            <span className="landing-badge landing-badge--animated">
                                {t("landing.heroBadge")}
                            </span>
                            <h1 className="landing-hero__title landing-hero__title--gradient">
                                {heroText}
                                {!heroDone && <span className="hero-cursor" aria-hidden="true">|</span>}
                            </h1>
                            <p className="landing-hero__subtitle">
                                {t("landing.heroSubtitle")}
                            </p>
                            <div className="landing-hero__actions">
                                <Link to="/register" className="btn btn--gradient btn--lg btn--glow" ref={magneticRef}>
                                    {t("landing.heroGetStarted")}
                                    <svg className="btn-arrow" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                                        <path d="M5 12h14M12 5l7 7-7 7" />
                                    </svg>
                                </Link>
                                <button onClick={openChat} className="btn btn--ai">
                                    <span className="btn--ai__pulse">
                                        <span className="btn--ai__pulse-ring" />
                                        <span className="btn--ai__pulse-dot" />
                                    </span>
                                    <svg className="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <rect x="3" y="11" width="18" height="10" rx="2" />
                                        <circle cx="12" cy="5" r="2" />
                                        <path d="M12 7v4" />
                                    </svg>
                                    {t("landing.heroAsk")}
                                </button>
                            </div>

                            {/* Live stats strip */}
                            <div className="hero-stats" data-reveal="fade-up" style={{ "--reveal-delay": "300ms" }}>
                                <div className="hero-stat">
                                    <span className="hero-stat__num">50+</span>
                                    <span className="hero-stat__label">{t("landing.statClinics")}</span>
                                </div>
                                <div className="hero-stat__divider" />
                                <div className="hero-stat">
                                    <span className="hero-stat__num">99.9%</span>
                                    <span className="hero-stat__label">{t("landing.statUptime")}</span>
                                </div>
                                <div className="hero-stat__divider" />
                                <div className="hero-stat">
                                    <span className="hero-stat__num">4</span>
                                    <span className="hero-stat__label">{t("landing.statRoles")}</span>
                                </div>
                            </div>
                        </div>

                        <div className="landing-hero__image-wrap" data-reveal="fade-left">
                            <div className="landing-hero__blob landing-hero__blob--top" />
                            <div className="landing-hero__blob landing-hero__blob--bottom" />
                            <div className="landing-hero__image" ref={parallaxRef}>
                                <div className="hero-img-glow" aria-hidden="true" />
                                <img
                                    src={heroDashboardImg}
                                    alt="SehhaTech clinic dashboard showing appointments, patients, and reports"
                                    className="landing-hero__placeholder"
                                />
                                <div className="hero-float-badge hero-float-badge--appointments">
                                    <span className="hero-float-badge__dot" />
                                    {t("landing.floatAppt")}
                                </div>
                                <div className="hero-float-badge hero-float-badge--patients">
                                    <span className="hero-float-badge__dot hero-float-badge__dot--green" />
                                    {t("landing.floatPatients")}
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* ── Features ── */}
                <section className="landing-features" id="features">
                    <div className="landing-section-inner">
                        <div className="landing-section-head" data-reveal="fade-up">
                            <h2 className="landing-section-title">{t("landing.featuresTitle")}</h2>
                            <div className="landing-section-underline" />
                        </div>
                        <div className="landing-features__grid">
                            {FEATURES.map((f, i) => (
                                <TiltCard
                                    key={f.title}
                                    className={`landing-feature-card${f.accent ? " landing-feature-card--accent" : ""}`}
                                    data-reveal="fade-up"
                                    style={{ "--reveal-delay": `${i * 120}ms` }}
                                    maxAngle={6}
                                >
                                    <div className={`landing-feature-card__icon landing-feature-card__icon--${f.modifier}`}>
                                        {f.icon}
                                    </div>
                                    <h3>{f.title}</h3>
                                    <p>{f.text}</p>
                                </TiltCard>
                            ))}
                        </div>
                    </div>
                </section>

                {/* ── Platform Showcase ── */}
                <section className="landing-showcase">
                    <div className="landing-section-inner">
                        <div className="landing-showcase__grid">
                            <div className="landing-showcase__text" data-reveal="fade-right">
                                <h2 className="landing-section-title">{t("landing.showcaseTitle")}</h2>
                                <div className="landing-showcase__steps">
                                    {ROLES.map(({ num, role, desc }) => (
                                        <div key={num} className="landing-showcase__step">
                                            <div className="landing-showcase__step-num">{num}</div>
                                            <div>
                                                <h4>{role}</h4>
                                                <p>{desc}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                            <div className="landing-showcase__preview" data-reveal="fade-left">
                                <TiltCard className="landing-showcase__card" maxAngle={5}>
                                    <div className="landing-showcase__card-header">
                                        <div className="landing-showcase__dots">
                                            <span className="dot dot--red" />
                                            <span className="dot dot--yellow" />
                                            <span className="dot dot--green" />
                                            <div className="landing-showcase__bar" />
                                        </div>
                                        <div className="landing-showcase__circle" />
                                    </div>
                                    <div className="landing-showcase__panels">
                                        <div className="landing-showcase__panel landing-showcase__panel--wide">
                                            <div className="landing-showcase__panel-line" />
                                            <div className="landing-showcase__panel-block" />
                                        </div>
                                        <div className="landing-showcase__panel">
                                            <div className="landing-showcase__panel-line landing-showcase__panel-line--sm" />
                                            <div className="landing-showcase__panel-rows">
                                                <div className="landing-showcase__row" />
                                                <div className="landing-showcase__row" />
                                                <div className="landing-showcase__row landing-showcase__row--short" />
                                            </div>
                                        </div>
                                    </div>
                                    <div className="landing-showcase__lock">
                                        <svg className="icon icon-lg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                            <rect x="3" y="11" width="18" height="11" rx="2" />
                                            <path d="M7 11V7a5 5 0 0110 0v4" />
                                        </svg>
                                        <p>{t("landing.showcaseSecurity")}</p>
                                    </div>
                                </TiltCard>
                            </div>
                        </div>
                    </div>
                </section>

                {/* ── About ── */}
                <section className="landing-about" id="about">
                    <div className="landing-section-inner">
                        <div className="landing-about__intro">
                            <div className="landing-about__image-wrap" data-reveal="fade-right">
                                <img
                                    src={aboutClinicDoctorImg}
                                    alt="Doctor reviewing patient information on a tablet in a modern clinic"
                                    className="landing-about__image"
                                />
                            </div>
                            <div data-reveal="fade-left">
                                <span className="landing-badge landing-badge--tertiary">{t("landing.aboutBadge")}</span>
                                <h2 className="landing-section-title">{t("landing.aboutTitle")}</h2>
                                <p className="landing-about__lead">{t("landing.aboutLead")}</p>
                            </div>
                        </div>

                        <div className="landing-section-head landing-section-head--center" data-reveal="fade-up">
                            <h2 className="landing-section-title">{t("landing.whyTitle")}</h2>
                            <p className="landing-section-lead">{t("landing.whyLead")}</p>
                        </div>

                        <div className="landing-principles">
                            {PRINCIPLES.map((p, i) => (
                                <TiltCard
                                    key={p.title}
                                    className={`landing-principle${p.offset ? " landing-principle--offset" : ""}`}
                                    data-reveal="fade-up"
                                    style={{ "--reveal-delay": `${i * 90}ms` }}
                                    maxAngle={7}
                                >
                                    <div className={`landing-principle__icon landing-principle__icon--${p.modifier}`}>
                                        {p.icon}
                                    </div>
                                    <h3>{p.title}</h3>
                                    <p>{p.text}</p>
                                </TiltCard>
                            ))}
                        </div>

                        {/* Story */}
                        <div className="landing-story">
                            <div className="landing-story__text" data-reveal="fade-right">
                                <h2 className="landing-section-title">{t("landing.storyTitle")}</h2>
                                <p>{t("landing.storyP1")}</p>
                                <p className="landing-story__quote">{t("landing.storyQuote")}</p>
                                <p>{t("landing.storyP2")}</p>
                            </div>
                            <div className="landing-story__image-wrap" data-reveal="fade-left">
                                <img
                                    src={storyMobileAppImg}
                                    alt="SehhaTech mobile app showing the clinic dashboard on a phone"
                                    className="landing-story__image"
                                />
                                <div className="landing-story__badge" ref={badgeRef}>
                                    <p className="landing-story__badge-num">{badgeCount}+</p>
                                    <p className="landing-story__badge-label">{t("landing.badgeLabel")}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* ── CTA ── */}
                <section className="landing-cta">
                    <div className="landing-cta__inner">
                        <div className="landing-cta__box" data-reveal="fade-up">
                            <div className="landing-cta__blob landing-cta__blob--top" />
                            <div className="landing-cta__blob landing-cta__blob--bottom" />
                            <div className="cta-orb cta-orb--1" aria-hidden="true" />
                            <div className="cta-orb cta-orb--2" aria-hidden="true" />
                            <h2 className="landing-cta__title">{t("landing.ctaTitle")}</h2>
                            <p className="landing-cta__subtitle">{t("landing.ctaSubtitle")}</p>
                            <Link to="/register" className="btn btn--cta btn--cta-shine">
                                {t("landing.ctaButton")}
                                <svg className="btn-arrow" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                                    <path d="M5 12h14M12 5l7 7-7 7" />
                                </svg>
                            </Link>
                        </div>
                    </div>
                </section>

            </main>

            <PublicFooter activePage="landing" />
            <ChatbotWidget />
        </div>
    );
}