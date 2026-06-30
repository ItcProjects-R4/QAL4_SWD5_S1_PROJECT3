import { useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";
import PublicFooter from "../../components/public/PublicFooter";
import { Link } from "react-router-dom";

function useScrollReveal(language) {
    const rootRef = useRef(null);
    useEffect(() => {
        const root = rootRef.current;
        if (!root) return;
        const targets = root.querySelectorAll("[data-reveal]");
        if (!targets.length) return;
        targets.forEach((el) => el.classList.remove("is-visible"));
        const observer = new IntersectionObserver(
            (entries) => { entries.forEach((entry) => { if (entry.isIntersecting) { entry.target.classList.add("is-visible"); observer.unobserve(entry.target); } }); },
            { threshold: 0.08, rootMargin: "0px 0px -5% 0px" }
        );
        targets.forEach((el) => observer.observe(el));
        return () => observer.disconnect();
    }, [language]);
    return rootRef;
}

export default function Status() {
    const { t, i18n } = useTranslation();
    const pageRef = useScrollReveal(i18n.language);

    const services = [
        { name: "SehhaTech API", desc: t("status.service1Desc") },
        { name: "SQL Server Database", desc: t("status.service2Desc") },
        { name: "Cloudinary Image Storage", desc: t("status.service3Desc") },
        { name: "Paymob Payment Gateway", desc: t("status.service4Desc") },
        { name: "JWT Authentication", desc: t("status.service5Desc") },
        { name: t("status.service6Name"), desc: t("status.service6Desc") },
    ];

    return (
        <div className="status-page" ref={pageRef}>
            <main className="status-main">
                <nav className="status-back">
                    <Link to="/" className="status-back__link">
                        <svg className="icon icon-sm" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M19 12H5" /><path d="M12 19l-7-7 7-7" />
                        </svg>
                        {t("status.backLink")}
                    </Link>
                </nav>

                <header className="status-header" data-reveal="fade-up">
                    <div className="status-indicator">
                        <span className="status-indicator__dot" />
                        <span className="status-indicator__label">{t("status.allOperational")}</span>
                    </div>
                    <h1 className="status-title">{t("status.title")}</h1>
                    <p className="status-subtitle">{t("status.subtitle")}</p>
                </header>

                <section className="status-summary" data-reveal="fade-up">
                    <div>
                        <div className="status-summary__value">99.9%</div>
                        <div className="status-summary__label">{t("status.uptimeLabel")}</div>
                    </div>
                    <div>
                        <div className="status-summary__value">.NET 10</div>
                        <div className="status-summary__label">{t("status.runtimeLabel")}</div>
                    </div>
                </section>

                <section className="status-services">
                    <h2 className="status-section-title">{t("status.servicesTitle")}</h2>
                    {services.map((service, i) => (
                        <div className="status-service-row" key={service.name} data-reveal="fade-up" style={{ "--reveal-delay": `${i * 70}ms` }}>
                            <div className="status-service-row__info">
                                <span className="status-service-row__name">{service.name}</span>
                                <p className="status-service-row__desc">{service.desc}</p>
                            </div>
                            <span className="status-service-row__badge">{t("status.operational")}</span>
                        </div>
                    ))}
                </section>

                <section className="status-incidents" data-reveal="fade-up">
                    <h2 className="status-section-title">{t("status.incidentsTitle")}</h2>
                    <article className="status-incident">
                        <time className="status-incident__date">2026</time>
                        <p className="status-incident__text">{t("status.noIncidents")}</p>
                    </article>
                </section>
            </main>
            <PublicFooter activePage="status" />
        </div>
    );
}