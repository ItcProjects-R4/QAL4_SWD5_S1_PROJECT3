import { useState, useEffect, useRef, useCallback } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import PublicHeader from "../../components/public/PublicHeader";
import PublicFooter from "../../components/public/PublicFooter";
import ChatbotWidget from "../../components/public/ChatbotWidget";
import axiosInstance from "../../api/axios";

const openChat = () => window.dispatchEvent(new Event("sehhatech:open-chat"));

/* ─── Scroll Reveal ─────────────────────────────────────── */
function useScrollReveal(language) {
    const rootRef = useRef(null);
    useEffect(() => {
        const root = rootRef.current;
        if (!root) return;
        const targets = Array.from(root.querySelectorAll("[data-reveal]"));
        if (!targets.length) return;
        targets.forEach((el) => el.classList.remove("is-visible"));
        const reveal = (el) => el.classList.add("is-visible");
        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) { reveal(entry.target); observer.unobserve(entry.target); }
                });
            },
            { threshold: 0.1, rootMargin: "0px 0px -5% 0px" }
        );
        targets.forEach((el) => observer.observe(el));
        const recheck = () => {
            targets.forEach((el) => {
                if (el.classList.contains("is-visible")) return;
                const rect = el.getBoundingClientRect();
                if (rect.top < window.innerHeight * 0.95 && rect.bottom > 0) { reveal(el); observer.unobserve(el); }
            });
        };
        const initialCheck = requestAnimationFrame(recheck);
        window.addEventListener("resize", recheck);
        return () => { observer.disconnect(); window.removeEventListener("resize", recheck); cancelAnimationFrame(initialCheck); };
    }, [language]);
    return rootRef;
}

/* ─── Magnetic Button ────────────────────────────────────── */
function useMagnetic(strength = 0.3) {
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
        return () => { el.removeEventListener("mousemove", handleMove); el.removeEventListener("mouseleave", handleLeave); };
    }, [strength]);
    return ref;
}

/* ─── 3D Card Tilt ───────────────────────────────────────── */
function useTilt(maxAngle = 8) {
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

function TiltCard({ className, children, maxAngle = 8, style, ...rest }) {
    const { ref, handleMove, handleLeave } = useTilt(maxAngle);
    return (
        <div ref={ref} className={className} style={{ willChange: "transform", ...style }}
            onMouseMove={handleMove} onMouseLeave={handleLeave} {...rest}>
            {children}
        </div>
    );
}

function FaqItem({ item, isOpen, onToggle, index }) {
    return (
        <div className="contact-faq__reveal" data-reveal="fade-up" style={{ "--reveal-delay": `${index * 70}ms` }}>
            <div className={`contact-faq__item${isOpen ? " contact-faq__item--open" : ""}`}>
                <button type="button" className="contact-faq__question" onClick={onToggle} aria-expanded={isOpen}>
                    <span>{item.q}</span>
                    <svg className="icon icon-sm contact-faq__chevron" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="6 9 12 15 18 9" />
                    </svg>
                </button>
                <div className="contact-faq__answer"><p>{item.a}</p></div>
            </div>
        </div>
    );
}

export default function Contact() {
    const { t, i18n } = useTranslation();
    const pageRef = useScrollReveal(i18n.language);
    const emailMagneticRef = useMagnetic(0.3);

    const METHODS = [
        {
            modifier: "primary",
            title: t("contact.methodEmailTitle"),
            value: "sehhatech.team@gmail.com",
            href: "mailto:sehhatech.team@gmail.com",
            icon: (<svg className="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16v16H4z" /><path d="M22 6l-10 7L2 6" /></svg>),
        },
        {
            modifier: "secondary",
            title: t("contact.methodCallTitle"),
            value: "+20 102 331 8978",
            href: "tel:+201023318978",
            icon: (<svg className="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72c.127.96.362 1.903.7 2.81a2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.338 1.85.573 2.81.7A2 2 0 0122 16.92z" /></svg>),
        },
        {
            modifier: "tertiary",
            title: t("contact.methodChatTitle"),
            value: t("contact.methodChatValue"),
            onClick: openChat,
            icon: (<svg className="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="10" rx="2" /><circle cx="12" cy="5" r="2" /><path d="M12 7v4" /></svg>),
        },
        {
            modifier: "primary",
            title: t("contact.methodLocationTitle"),
            value: t("contact.methodLocationValue"),
            icon: (<svg className="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 1118 0z" /><circle cx="12" cy="10" r="3" /></svg>),
        },
    ];

    const FAQS = [
        { q: t("contact.faq1q"), a: t("contact.faq1a") },
        { q: t("contact.faq2q"), a: t("contact.faq2a") },
        { q: t("contact.faq3q"), a: t("contact.faq3a") },
        { q: t("contact.faq4q"), a: t("contact.faq4a") },
    ];

    const [form, setForm] = useState({ name: "", email: "", clinicName: "", subject: "General Inquiry", message: "" });
    const [isLoading, setIsLoading] = useState(false);
    const [submitted, setSubmitted] = useState(false);
    const [toast, setToast] = useState(null);
    const [openFaq, setOpenFaq] = useState(0);
    const [focusedField, setFocusedField] = useState(null);

    const showToast = (message, type = "error") => { setToast({ message, type }); setTimeout(() => setToast(null), 4000); };
    const handleChange = (e) => { const { id, value } = e.target; setForm((prev) => ({ ...prev, [id]: value })); };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!form.name.trim() || !form.email.trim() || !form.message.trim()) { showToast(t("contact.toastRequired")); return; }
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) { showToast(t("contact.toastInvalidEmail")); return; }
        setIsLoading(true);
        try {
            await axiosInstance.post("/api/contact", { name: form.name.trim(), email: form.email.trim(), clinicName: form.clinicName.trim(), subject: form.subject, message: form.message.trim() });
            setSubmitted(true);
        } catch (err) {
            showToast(err.response?.data?.message || t("contact.toastError"));
        } finally { setIsLoading(false); }
    };

    const resetForm = () => { setForm({ name: "", email: "", clinicName: "", subject: "General Inquiry", message: "" }); setSubmitted(false); };

    return (
        <div className="contact-page" ref={pageRef}>
            <PublicHeader />
            {toast && (<div className={`toast toast--${toast.type}`}>{toast.message}</div>)}

            <main className="contact-main-wrap">
                {/* ── Hero ── */}
                <section className="contact-hero">
                    <div className="hero-orb hero-orb--1" aria-hidden="true" />
                    <div className="hero-orb hero-orb--2" aria-hidden="true" />
                    <div className="hero-orb hero-orb--3" aria-hidden="true" />
                    <div className="contact-hero__inner" data-reveal="fade-up">
                        <span className="landing-badge landing-badge--animated">✦ {t("contact.heroBadge")}</span>
                        <h1 className="contact-hero__title">
                            {t("contact.heroTitleStart")}{" "}
                            <span className="landing-hero__title--gradient">{t("contact.heroTitleHighlight")}</span>
                        </h1>
                        <p className="contact-hero__subtitle">{t("contact.heroSubtitle")}</p>
                        <div className="contact-hero__actions">
                            <a href="mailto:sehhatech.team@gmail.com" className="btn btn--gradient btn--lg btn--glow" ref={emailMagneticRef}>
                                {t("contact.heroEmailBtn")}
                                <svg className="btn-arrow" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M5 12h14M12 5l7 7-7 7" /></svg>
                            </a>
                            <button onClick={openChat} className="btn btn--ai" type="button">
                                <span className="btn--ai__pulse"><span className="btn--ai__pulse-ring" /><span className="btn--ai__pulse-dot" /></span>
                                <svg className="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="10" rx="2" /><circle cx="12" cy="5" r="2" /><path d="M12 7v4" /></svg>
                                {t("contact.heroChatBtn")}
                            </button>
                        </div>
                        <div className="hero-stats" data-reveal="fade-up" style={{ "--reveal-delay": "180ms" }}>
                            <div className="hero-stat"><span className="hero-stat__num">&lt;24h</span><span className="hero-stat__label">{t("contact.statReply")}</span></div>
                            <div className="hero-stat__divider" />
                            <div className="hero-stat"><span className="hero-stat__num">7/7</span><span className="hero-stat__label">{t("contact.statDays")}</span></div>
                            <div className="hero-stat__divider" />
                            <div className="hero-stat"><span className="hero-stat__num">EN/AR</span><span className="hero-stat__label">{t("contact.statLangs")}</span></div>
                        </div>
                    </div>
                </section>

                {/* ── Contact Methods ── */}
                <section className="contact-methods">
                    <div className="landing-section-inner">
                        <div className="contact-methods__grid">
                            {METHODS.map((m, i) => {
                                const inner = (<><div className={`contact-method-card__icon contact-method-card__icon--${m.modifier}`}>{m.icon}</div><h3>{m.title}</h3><p>{m.value}</p></>);
                                const commonProps = { key: m.title, className: "contact-method-card", "data-reveal": "fade-up", style: { "--reveal-delay": `${i * 90}ms` }, maxAngle: 7 };
                                if (m.href) return (<TiltCard {...commonProps}><a href={m.href} className="contact-method-card__link">{inner}</a></TiltCard>);
                                if (m.onClick) return (<TiltCard {...commonProps}><button type="button" className="contact-method-card__link" onClick={m.onClick}>{inner}</button></TiltCard>);
                                return (<TiltCard {...commonProps}><div className="contact-method-card__link contact-method-card__link--static">{inner}</div></TiltCard>);
                            })}
                        </div>
                    </div>
                </section>

                {/* ── Form ── */}
                <section className="contact-form-section">
                    <div className="landing-section-inner">
                        <div className="contact-form-grid">
                            <div className="contact-form-intro" data-reveal="fade-right">
                                <span className="landing-badge landing-badge--tertiary">{t("contact.formBadge")}</span>
                                <h2 className="landing-section-title">{t("contact.formTitle")}</h2>
                                <p className="contact-form-intro__text">{t("contact.formIntro")}</p>
                                <ul className="contact-form-intro__list">
                                    <li><svg className="icon icon-sm" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>{t("contact.formPoint1")}</li>
                                    <li><svg className="icon icon-sm" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>{t("contact.formPoint2")}</li>
                                    <li><svg className="icon icon-sm" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>{t("contact.formPoint3")}</li>
                                </ul>
                            </div>
                            <div className="contact-form-card" data-reveal="fade-left">
                                {submitted ? (
                                    <div className="contact-success">
                                        <div className="contact-success__sparkles" aria-hidden="true"><span /><span /><span /><span /><span /><span /></div>
                                        <div className="contact-success__icon">
                                            <svg viewBox="0 0 52 52"><circle className="contact-success__circle" cx="26" cy="26" r="23" fill="none" /><path className="contact-success__check" fill="none" d="M14 27l7 7 17-17" /></svg>
                                        </div>
                                        <h3 className="contact-success__title">{t("contact.successTitle")}</h3>
                                        <p className="contact-success__text">{t("contact.successText")}</p>
                                        <button type="button" className="contact-success__btn" onClick={resetForm}>{t("contact.successBtn")}</button>
                                    </div>
                                ) : (
                                    <form className="contact-form" onSubmit={handleSubmit}>
                                        <div className="contact-form__row contact-form__row--split">
                                            <div className={`contact-field${focusedField === "name" ? " contact-field--focused" : ""}`}>
                                                <label htmlFor="name">{t("contact.fieldName")}</label>
                                                <input id="name" type="text" placeholder={t("contact.fieldNamePlaceholder")} value={form.name} onChange={handleChange} onFocus={() => setFocusedField("name")} onBlur={() => setFocusedField(null)} />
                                            </div>
                                            <div className={`contact-field${focusedField === "email" ? " contact-field--focused" : ""}`}>
                                                <label htmlFor="email">{t("contact.fieldEmail")}</label>
                                                <input id="email" type="email" placeholder={t("contact.fieldEmailPlaceholder")} value={form.email} onChange={handleChange} onFocus={() => setFocusedField("email")} onBlur={() => setFocusedField(null)} />
                                            </div>
                                        </div>
                                        <div className="contact-form__row contact-form__row--split">
                                            <div className={`contact-field${focusedField === "clinicName" ? " contact-field--focused" : ""}`}>
                                                <label htmlFor="clinicName">{t("contact.fieldClinic")} <span style={{ opacity: 0.5 }}>({t("contact.fieldOptional")})</span></label>
                                                <input id="clinicName" type="text" placeholder={t("contact.fieldClinicPlaceholder")} value={form.clinicName} onChange={handleChange} onFocus={() => setFocusedField("clinicName")} onBlur={() => setFocusedField(null)} />
                                            </div>
                                            <div className={`contact-field${focusedField === "subject" ? " contact-field--focused" : ""}`}>
                                                <label htmlFor="subject">{t("contact.fieldSubject")}</label>
                                                <select id="subject" value={form.subject} onChange={handleChange} onFocus={() => setFocusedField("subject")} onBlur={() => setFocusedField(null)}>
                                                    <option>{t("contact.subjectGeneral")}</option>
                                                    <option>{t("contact.subjectPricing")}</option>
                                                    <option>{t("contact.subjectSupport")}</option>
                                                    <option>{t("contact.subjectMigration")}</option>
                                                    <option>{t("contact.subjectPartnership")}</option>
                                                </select>
                                            </div>
                                        </div>
                                        <div className={`contact-field${focusedField === "message" ? " contact-field--focused" : ""}`}>
                                            <label htmlFor="message">{t("contact.fieldMessage")}</label>
                                            <textarea id="message" rows={5} placeholder={t("contact.fieldMessagePlaceholder")} value={form.message} onChange={handleChange} onFocus={() => setFocusedField("message")} onBlur={() => setFocusedField(null)} />
                                        </div>
                                        <button type="submit" className="contact-submit" disabled={isLoading}>
                                            <span>{isLoading ? t("contact.submitLoading") : t("contact.submitBtn")}</span>
                                            {isLoading ? (
                                                <svg className="icon icon-sm contact-spin" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12a9 9 0 11-9-9" /></svg>
                                            ) : (
                                                <svg className="icon icon-sm" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="22" y1="2" x2="11" y2="13" /><path d="M22 2L15 22l-4-9-9-4 20-7z" /></svg>
                                            )}
                                        </button>
                                    </form>
                                )}
                            </div>
                        </div>
                    </div>
                </section>

                {/* ── FAQ ── */}
                <section className="contact-faq">
                    <div className="landing-section-inner">
                        <div className="landing-section-head landing-section-head--center" data-reveal="fade-up">
                            <h2 className="landing-section-title">{t("contact.faqTitle")}</h2>
                            <div className="landing-section-underline" />
                        </div>
                        <div className="contact-faq__list">
                            {FAQS.map((item, i) => (<FaqItem key={i} item={item} index={i} isOpen={openFaq === i} onToggle={() => setOpenFaq(openFaq === i ? -1 : i)} />))}
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
                            <h2 className="landing-cta__title">{t("contact.ctaTitle")}</h2>
                            <p className="landing-cta__subtitle">{t("contact.ctaSubtitle")}</p>
                            <Link to="/register" className="btn btn--cta btn--cta-shine">
                                {t("contact.ctaBtn")}
                                <svg className="btn-arrow" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M5 12h14M12 5l7 7-7 7" /></svg>
                            </Link>
                        </div>
                    </div>
                </section>
            </main>

            <PublicFooter activePage="contact" />
            <ChatbotWidget />
        </div>
    );
}