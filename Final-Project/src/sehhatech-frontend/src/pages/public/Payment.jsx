import { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import axiosInstance from "../../api/axios";
import sehhatechIcon from "../../assets/images/sehhatech-icon.png";

function useScrollReveal(language) {
    const rootRef = useRef(null);
    useEffect(() => {
        const root = rootRef.current;
        if (!root) return;
        const targets = root.querySelectorAll("[data-reveal]");
        if (!targets.length) return;
        targets.forEach((el) => el.classList.remove("is-visible"));
        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) { entry.target.classList.add("is-visible"); observer.unobserve(entry.target); }
                });
            },
            { threshold: 0.1, rootMargin: "0px 0px -5% 0px" }
        );
        targets.forEach((el) => observer.observe(el));
        return () => observer.disconnect();
    }, [language]);
    return rootRef;
}

export default function Payment() {
    const { t, i18n } = useTranslation();
    const navigate = useNavigate();
    const pageRef = useScrollReveal(i18n.language);
    const [isLoading, setIsLoading] = useState(false);
    const [toast, setToast] = useState(null);
    const [iframeUrl, setIframeUrl] = useState("");
    const [isModalOpen, setIsModalOpen] = useState(false);

    const tenantId = sessionStorage.getItem("tenantId");
    const token = sessionStorage.getItem("token");

    useEffect(() => { if (!tenantId || !token) navigate("/register"); }, [tenantId, token, navigate]);

    useEffect(() => {
        if (!isModalOpen) return;
        const onMessage = (e) => {
            if (e.data && (e.data.type === "PAYMOB_SUCCESS" || e.data.success === true)) {
                closePaymob();
                sessionStorage.removeItem("tenantId");
                sessionStorage.removeItem("token");
                showToast(t("payment.toastSuccess"), "success");
                setTimeout(() => navigate("/login"), 2000);
            }
        };
        window.addEventListener("message", onMessage);
        return () => window.removeEventListener("message", onMessage);
    }, [isModalOpen, navigate, t]);

    const showToast = (message, type = "success") => { setToast({ message, type }); setTimeout(() => setToast(null), 4000); };
    const closePaymob = () => { setIsModalOpen(false); setIframeUrl(""); };

    const handlePayment = async () => {
        setIsLoading(true);
        try {
            const res = await axiosInstance.post(`/api/subscription/initiate/${tenantId}`, {}, { headers: { Authorization: `Bearer ${token}` } });
            setIframeUrl(res.data.iframeUrl);
            setIsModalOpen(true);
        } catch (err) {
            showToast(err.response?.data?.message || t("payment.toastError"), "error");
        } finally { setIsLoading(false); }
    };

    return (
        <div className="payment-page" ref={pageRef}>
            {toast && (<div className={`toast toast--${toast.type}`}>{toast.message}</div>)}

            {isModalOpen && (
                <div className="paymob-modal">
                    <div className="paymob-modal__inner">
                        <button className="paymob-modal__close" onClick={closePaymob} aria-label="Close payment window">✕</button>
                        <iframe className="paymob-modal__iframe" src={iframeUrl} title="Paymob Payment" />
                        <button className="paymob-modal__done-btn" onClick={() => { closePaymob(); sessionStorage.removeItem("tenantId"); sessionStorage.removeItem("token"); navigate("/login"); }}>
                            {t("payment.modalDoneBtn")}
                        </button>
                    </div>
                </div>
            )}

            <header className="payment-header">
                <div className="payment-header__inner">
                    <div className="payment-header__left">
                        <button onClick={() => navigate(-1)} className="register-back">
                            <svg className="icon icon-sm" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 12H5" /><path d="M12 19l-7-7 7-7" /></svg>
                            <span>{t("payment.back")}</span>
                        </button>
                        <div className="register-brand">
                            <img src={sehhatechIcon} alt="SehhaTech" className="register-brand__icon" />
                            SehhaTech
                        </div>
                    </div>
                </div>
            </header>

            <main className="payment-main">
                <div className="payment-steps" data-reveal="fade-up">
                    <div className="register-steps">
                        <div className="register-steps__circle register-steps__circle--done">
                            <svg className="icon icon-sm" viewBox="0 0 24 24" fill="currentColor"><path d="M9 16.2l-3.5-3.5L4 14.2 9 19.2 20 8.2l-1.5-1.5z" /></svg>
                        </div>
                        <div className="register-steps__bar"><div className="register-steps__bar-fill register-steps__bar-fill--full" /></div>
                        <div className="register-steps__circle register-steps__circle--active">2</div>
                    </div>
                    <p className="register-subtitle">{t("payment.stepSubtitle")}</p>
                </div>

                <div className="payment-plan-wrap">
                    <div className="payment-plan" data-reveal="fade-up" style={{ "--reveal-delay": "100ms" }}>
                        <div className="payment-plan__badge">{t("payment.planBadge")}</div>
                        <div className="payment-plan__info">
                            <h3>{t("payment.planName")}</h3>
                            <p>{t("payment.planDesc")}</p>
                            <div className="payment-plan__price">
                                <span className="payment-plan__amount">500</span>
                                <span className="payment-plan__period">{t("payment.planPeriod")}</span>
                            </div>
                        </div>
                        <ul className="payment-plan__features">
                            <li><svg className="icon icon-sm" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg><span>{t("payment.feature1")}</span></li>
                            <li><svg className="icon icon-sm" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg><span>{t("payment.feature2")}</span></li>
                            <li><svg className="icon icon-sm" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg><span>{t("payment.feature3")}</span></li>
                            <li><svg className="icon icon-sm" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg><span>{t("payment.feature4")}</span></li>
                        </ul>
                        <button className="payment-plan__btn" onClick={handlePayment} disabled={isLoading}>
                            <span>{isLoading ? t("payment.btnLoading") : t("payment.btn")}</span>
                            {isLoading ? (
                                <svg className="icon icon-sm register-spin" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12a9 9 0 11-9-9" /></svg>
                            ) : (
                                <svg className="icon icon-sm" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="1" y="4" width="22" height="16" rx="2" /><line x1="1" y1="10" x2="23" y2="10" /></svg>
                            )}
                        </button>
                    </div>
                </div>

                <section className="payment-trust-section">
                    <div className="payment-trust-grid">
                        <div className="payment-trust-card" data-reveal="fade-up">
                            <div className="payment-trust-card__icon payment-trust-card__icon--primary">
                                <svg className="icon icon-lg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" /><path d="M7 11V7a5 5 0 0110 0v4" /></svg>
                            </div>
                            <div><h4>{t("payment.trust1Title")}</h4><p>{t("payment.trust1Desc")}</p></div>
                        </div>
                        <div className="payment-trust-card" data-reveal="fade-up" style={{ "--reveal-delay": "90ms" }}>
                            <div className="payment-trust-card__icon payment-trust-card__icon--secondary">
                                <svg className="icon icon-lg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M23 4v6h-6" /><path d="M1 20v-6h6" /><path d="M3.51 9a9 9 0 0114.85-3.36L23 10" /><path d="M20.49 15a9 9 0 01-14.85 3.36L1 14" /></svg>
                            </div>
                            <div><h4>{t("payment.trust2Title")}</h4><p>{t("payment.trust2Desc")}</p></div>
                        </div>
                        <div className="payment-trust-card" data-reveal="fade-up" style={{ "--reveal-delay": "180ms" }}>
                            <div className="payment-trust-card__icon payment-trust-card__icon--green">
                                <svg className="icon icon-lg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4z" /><path d="M9 12l2 2 4-4" /></svg>
                            </div>
                            <div><h4>{t("payment.trust3Title")}</h4><p>{t("payment.trust3Desc")}</p></div>
                        </div>
                    </div>
                </section>
            </main>

            <footer className="register-footer">
                <div className="register-footer__inner">
                    <p className="register-footer__copy">© 2026 SehhaTech Medical Systems</p>
                    <div className="register-footer__links">
                        <Link to="/security">{t("payment.footerSecurity")}</Link>
                        <Link to="/privacy">{t("payment.footerPrivacy")}</Link>
                        <Link to="/terms">{t("payment.footerTerms")}</Link>
                    </div>
                </div>
            </footer>
        </div>
    );
}