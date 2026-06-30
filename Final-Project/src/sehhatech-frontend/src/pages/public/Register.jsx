import { useState, useMemo, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import axiosInstance from "../../api/axios";
import sehhatechIcon from "../../assets/images/sehhatech-icon.png";

const SPECIALIZATIONS = [
    "General Practice",
    "Cardiology",
    "Pediatrics",
    "Dermatology",
    "Other Specialization",
];

const EGYPTIAN_GOVERNORATES = [
    'Cairo', 'Alexandria', 'Giza', 'Qalyubia', 'Sharqia', 'Dakahlia',
    'Gharbia', 'Monufia', 'Beheira', 'Kafr El Sheikh', 'Ismailia',
    'Port Said', 'Suez', 'North Sinai', 'South Sinai', 'Damietta',
    'Faiyum', 'Beni Suef', 'Minya', 'Asyut', 'Sohag', 'Qena',
    'Luxor', 'Aswan', 'Red Sea', 'New Valley', 'Matruh',
];

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
            { threshold: 0.1, rootMargin: "0px 0px -5% 0px" }
        );
        targets.forEach((el) => observer.observe(el));
        return () => observer.disconnect();
    }, []);
    return rootRef;
}

function CheckCircleIcon({ active }) {
    return active ? (
        <svg className="icon icon-sm" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2a10 10 0 1010 10A10 10 0 0012 2zm-1.2 14.6l-4-4 1.4-1.4 2.6 2.6 6-6 1.4 1.4z" />
        </svg>
    ) : (
        <svg className="icon icon-sm" viewBox="0 0 24 24" fill="currentColor">
            <circle cx="12" cy="12" r="9" />
        </svg>
    );
}

function EyeIcon({ visible }) {
    return visible ? (
        <svg className="icon icon-sm" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94" />
            <path d="M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19" />
            <line x1="1" y1="1" x2="23" y2="23" />
            <path d="M14.12 14.12a3 3 0 11-4.24-4.24" />
        </svg>
    ) : (
        <svg className="icon icon-sm" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
            <circle cx="12" cy="12" r="3" />
        </svg>
    );
}

export default function Register() {
    const navigate = useNavigate();
    const pageRef = useScrollReveal();
    const { t } = useTranslation();

    const STRENGTH_CONFIG = [
        { width: "0%", color: "", text: t("register.strengthNone") },
        { width: "25%", color: "var(--color-error)", text: t("register.strengthWeak") },
        { width: "50%", color: "#f59e0b", text: t("register.strengthFair") },
        { width: "75%", color: "var(--color-secondary)", text: t("register.strengthGood") },
        { width: "100%", color: "var(--color-primary)", text: t("register.strengthStrong") },
    ];

    const [form, setForm] = useState({
        clinicName: "",
        specialization: SPECIALIZATIONS[0],
        governorate: EGYPTIAN_GOVERNORATES[0],
        clinicAddress: "",
        clinicPhone: "",
        fullName: "",
        email: "",
        password: "",
        confirmPassword: "",
    });

    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [toast, setToast] = useState(null);
    const [agreedToTerms, setAgreedToTerms] = useState(false);

    const handleChange = (e) => {
        const { id, value } = e.target;
        setForm((prev) => ({ ...prev, [id]: value }));
    };

    const strength = useMemo(() => {
        const val = form.password;
        const checks = {
            length: val.length >= 8,
            number: /\d/.test(val),
            upper: /[A-Z]/.test(val),
            symbol: /[^a-zA-Z0-9]/.test(val),
        };
        const score = Object.values(checks).filter(Boolean).length;
        return { checks, ...STRENGTH_CONFIG[score] };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [form.password, t]);

    const isFormReady = useMemo(() => {
        const requiredFilled = [
            "clinicName", "clinicAddress", "clinicPhone",
            "fullName", "email", "password", "confirmPassword",
        ].every((key) => form[key].trim().length > 0);
        return (
            requiredFilled &&
            form.password === form.confirmPassword &&
            strength.checks.length &&
            agreedToTerms
        );
    }, [form, strength, agreedToTerms]);

    const showToast = (message, type = "success") => {
        setToast({ message, type });
        setTimeout(() => setToast(null), 4000);
    };

    const validate = () => {
        const required = ["clinicName", "clinicAddress", "clinicPhone", "fullName", "email", "password", "confirmPassword"];
        for (const key of required) {
            if (!form[key].trim()) {
                showToast(t("register.toastRequired"), "error");
                return false;
            }
        }
        if (form.password !== form.confirmPassword) {
            showToast(t("register.toastPasswordMismatch"), "error");
            return false;
        }
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
            showToast(t("register.toastInvalidEmail"), "error");
            return false;
        }
        if (!agreedToTerms) {
            showToast(t("register.toastTerms"), "error");
            return false;
        }
        return true;
    };

    const handleRegister = async () => {
        if (!validate()) return;
        setIsLoading(true);
        try {
            const res = await axiosInstance.post("/api/auth/register", {
                clinicName: form.clinicName.trim(),
                specialization: form.specialization,
                address: `${form.clinicAddress.trim()}, ${form.governorate}`,
                phone: form.clinicPhone.trim(),
                fullName: form.fullName.trim(),
                email: form.email.trim(),
                password: form.password,
            });

            const data = res.data;
            sessionStorage.setItem("tenantId", data.tenantId);
            sessionStorage.setItem("token", data.token);
            showToast(t("register.toastSuccess"), "success");
            setTimeout(() => navigate("/payment"), 1500);
        } catch (err) {
            const message = err.response?.data?.message || t("register.toastError");
            showToast(message, "error");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="register-page" ref={pageRef}>
            {toast && (
                <div className={`toast toast--${toast.type}`}>{toast.message}</div>
            )}

            <header className="register-header">
                <div className="register-header__inner">
                    <div className="register-header__left">
                        <button onClick={() => navigate(-1)} className="register-back">
                            <svg className="icon icon-sm" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M19 12H5" />
                                <path d="M12 19l-7-7 7-7" />
                            </svg>
                            <span>{t("register.back")}</span>
                        </button>
                        <div className="register-brand">
                            <img src={sehhatechIcon} alt="SehhaTech" className="register-brand__icon" />
                            SehhaTech
                        </div>
                    </div>
                </div>
            </header>

            <main className="register-main">
                <div className="register-container">
                    {/* Step Indicator */}
                    <div className="register-steps" data-reveal="fade-up">
                        <div className="register-steps__circle register-steps__circle--active">1</div>
                        <div className="register-steps__bar">
                            <div className="register-steps__bar-fill" style={{ width: isFormReady ? "100%" : "0%" }} />
                        </div>
                        <div className={isFormReady ? "register-steps__circle register-steps__circle--done" : "register-steps__circle"}>
                            2
                        </div>
                    </div>

                    <h1 className="register-title">{t("register.title")}</h1>
                    <p className="register-subtitle">{t("register.subtitle")}</p>

                    <div className="register-card">
                        <form className="register-form" onSubmit={(e) => e.preventDefault()}>

                            {/* Clinic Information */}
                            <section className="register-section" data-reveal="fade-up">
                                <div className="register-section__header">
                                    <svg className="icon icon-sm register-section__icon" viewBox="0 0 24 24" fill="currentColor">
                                        <path d="M19 3H5a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2V5a2 2 0 00-2-2zm-7 3a3 3 0 110 6 3 3 0 010-6zm6 12H6v-.5c0-2 4-3.1 6-3.1s6 1.1 6 3.1V18z" />
                                    </svg>
                                    <h2 className="register-section__title">{t("register.clinicSection")}</h2>
                                </div>
                                <div className="register-grid">
                                    <div className="register-field">
                                        <label htmlFor="clinicName">{t("register.clinicName")}</label>
                                        <input
                                            id="clinicName"
                                            type="text"
                                            placeholder={t("register.clinicNamePlaceholder")}
                                            value={form.clinicName}
                                            onChange={handleChange}
                                        />
                                    </div>
                                    <div className="register-field">
                                        <label htmlFor="specialization">{t("register.specialization")}</label>
                                        <select id="specialization" value={form.specialization} onChange={handleChange}>
                                            {SPECIALIZATIONS.map((spec) => (
                                                <option key={spec} value={spec}>{spec}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div className="register-field register-field--full">
                                        <label htmlFor="clinicAddress">{t("register.clinicAddress")}</label>
                                        <input
                                            id="clinicAddress"
                                            type="text"
                                            placeholder={t("register.clinicAddressPlaceholder")}
                                            value={form.clinicAddress}
                                            onChange={handleChange}
                                        />
                                    </div>
                                    <div className="register-field register-field--full">
                                        <label htmlFor="governorate">{t("register.governorate")}</label>
                                        <select id="governorate" value={form.governorate} onChange={handleChange}>
                                            {EGYPTIAN_GOVERNORATES.map((gov) => (
                                                <option key={gov} value={gov}>{gov}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div className="register-field register-field--full">
                                        <label htmlFor="clinicPhone">{t("register.clinicPhone")}</label>
                                        <input
                                            id="clinicPhone"
                                            type="tel"
                                            placeholder={t("register.clinicPhonePlaceholder")}
                                            value={form.clinicPhone}
                                            onChange={handleChange}
                                        />
                                    </div>
                                </div>
                            </section>

                            {/* Administrator Account */}
                            <section className="register-section register-section--bordered" data-reveal="fade-up" style={{ "--reveal-delay": "120ms" }}>
                                <div className="register-section__header">
                                    <svg className="icon icon-sm register-section__icon" viewBox="0 0 24 24" fill="currentColor">
                                        <path d="M12 12a5 5 0 10-5-5 5 5 0 005 5zm0 2c-4 0-8 2-8 5v2h11.09A6 6 0 0114 16a6 6 0 016-2.45c-1.06-1.07-4.18-3.55-8-3.55zm9 1v2h-2v2h-2v-2h-2v-2h2V13h2v2z" />
                                    </svg>
                                    <h2 className="register-section__title">{t("register.adminSection")}</h2>
                                </div>
                                <div className="register-grid">
                                    <div className="register-field register-field--full">
                                        <label htmlFor="fullName">{t("register.fullName")}</label>
                                        <input
                                            id="fullName"
                                            type="text"
                                            placeholder={t("register.fullNamePlaceholder")}
                                            value={form.fullName}
                                            onChange={handleChange}
                                        />
                                    </div>
                                    <div className="register-field register-field--full">
                                        <label htmlFor="email">{t("register.email")}</label>
                                        <input
                                            id="email"
                                            type="email"
                                            placeholder={t("register.emailPlaceholder")}
                                            value={form.email}
                                            onChange={handleChange}
                                        />
                                    </div>

                                    {/* Password */}
                                    <div className="register-field">
                                        <label htmlFor="password">{t("register.password")}</label>
                                        <div className="register-input-wrap">
                                            <input
                                                id="password"
                                                type={showPassword ? "text" : "password"}
                                                placeholder="••••••••"
                                                value={form.password}
                                                onChange={handleChange}
                                            />
                                            <button
                                                type="button"
                                                className="register-input-icon"
                                                onClick={() => setShowPassword((v) => !v)}
                                                aria-label="Toggle password visibility"
                                            >
                                                <EyeIcon visible={showPassword} />
                                            </button>
                                        </div>
                                    </div>

                                    {/* Confirm Password */}
                                    <div className="register-field">
                                        <label htmlFor="confirmPassword">{t("register.confirmPassword")}</label>
                                        <div className="register-input-wrap">
                                            <input
                                                id="confirmPassword"
                                                type={showConfirmPassword ? "text" : "password"}
                                                placeholder="••••••••"
                                                value={form.confirmPassword}
                                                onChange={handleChange}
                                            />
                                            <button
                                                type="button"
                                                className="register-input-icon"
                                                onClick={() => setShowConfirmPassword((v) => !v)}
                                                aria-label="Toggle confirm password visibility"
                                            >
                                                <EyeIcon visible={showConfirmPassword} />
                                            </button>
                                        </div>
                                    </div>

                                    {/* Strength Indicator */}
                                    <div className="register-strength register-field--full">
                                        <div className="register-strength__head">
                                            <span>{t("register.strengthLabel")}</span>
                                            <span style={{ color: strength.color || undefined }}>{strength.text}</span>
                                        </div>
                                        <div className="register-strength__track">
                                            <div
                                                className="register-strength__fill"
                                                style={{ width: strength.width, background: strength.color || "transparent" }}
                                            />
                                        </div>
                                        <ul className="register-requirements">
                                            {[
                                                { check: strength.checks.length, label: t("register.req8Chars") },
                                                { check: strength.checks.symbol, label: t("register.reqSymbol") },
                                                { check: strength.checks.number, label: t("register.reqNumber") },
                                                { check: strength.checks.upper, label: t("register.reqUpper") },
                                            ].map(({ check, label }) => (
                                                <li
                                                    key={label}
                                                    className={check ? "register-requirements__item register-requirements__item--active" : "register-requirements__item"}
                                                >
                                                    <CheckCircleIcon active={check} />
                                                    {label}
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                </div>
                            </section>

                            {/* Terms Agreement */}
                            <div className="register-terms">
                                <input
                                    type="checkbox"
                                    id="agreedToTerms"
                                    checked={agreedToTerms}
                                    onChange={(e) => setAgreedToTerms(e.target.checked)}
                                    className="register-terms__checkbox"
                                />
                                <label htmlFor="agreedToTerms" className="register-terms__label">
                                    {t("register.agreeStart")}{" "}
                                    <Link to="/terms" target="_blank" className="register-terms__link">
                                        {t("register.termsLink")}
                                    </Link>{" "}
                                    {t("register.agreeAnd")}{" "}
                                    <Link to="/privacy" target="_blank" className="register-terms__link">
                                        {t("register.privacyLink")}
                                    </Link>
                                    .
                                </label>
                            </div>

                            {/* Submit */}
                            <div className="register-submit" data-reveal="fade-up" style={{ "--reveal-delay": "220ms" }}>
                                <button
                                    type="button"
                                    className="register-submit__btn"
                                    disabled={isLoading || !isFormReady}
                                    onClick={handleRegister}
                                >
                                    <span>{isLoading ? t("register.loading") : t("register.submit")}</span>
                                    {isLoading ? (
                                        <svg className="icon icon-sm register-spin" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                            <path d="M21 12a9 9 0 11-9-9" />
                                        </svg>
                                    ) : (
                                        <svg className="icon icon-sm" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                            <line x1="5" y1="12" x2="19" y2="12" />
                                            <path d="M12 5l7 7-7 7" />
                                        </svg>
                                    )}
                                </button>
                                <p className="register-signin">
                                    {t("register.alreadyHave")}{" "}
                                    <Link to="/login" className="register-signin__link">
                                        {t("register.signIn")}
                                    </Link>
                                </p>
                            </div>
                        </form>
                    </div>

                    {/* Trust Badges */}
                    <div className="register-trust" data-reveal="fade-up" style={{ "--reveal-delay": "150ms" }}>
                        <div className="register-trust__item">
                            <svg className="icon icon-sm" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4z" />
                            </svg>
                            <span>{t("register.hipaa")}</span>
                        </div>
                        <div className="register-trust__item">
                            <svg className="icon icon-sm" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M12 1a5 5 0 00-5 5v3H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2v-9a2 2 0 00-2-2h-2V6a5 5 0 00-5-5zm-3 8V6a3 3 0 116 0v3z" />
                            </svg>
                            <span>{t("register.ssl")}</span>
                        </div>
                        <div className="register-trust__item">
                            <svg className="icon icon-sm" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M12 2a10 10 0 1010 10A10 10 0 0012 2zm-1.2 14.6l-4-4 1.4-1.4 2.6 2.6 6-6 1.4 1.4z" />
                            </svg>
                            <span>{t("register.gdpr")}</span>
                        </div>
                    </div>
                </div>
            </main>

            <footer className="register-footer">
                <div className="register-footer__inner">
                    <p className="register-footer__copy">{t("register.footer")}</p>
                    <div className="register-footer__links">
                        <Link to="/security">{t("register.security")}</Link>
                        <Link to="/privacy">{t("register.privacy")}</Link>
                        <Link to="/terms">{t("register.terms")}</Link>
                    </div>
                </div>
            </footer>
        </div>
    );
}