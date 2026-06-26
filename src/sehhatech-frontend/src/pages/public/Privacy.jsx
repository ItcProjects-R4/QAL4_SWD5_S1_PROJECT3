import { useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import PublicHeader from "../../components/public/PublicHeader";
import PublicFooter from "../../components/public/PublicFooter";

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

export default function Privacy() {
    const { t, i18n } = useTranslation();
    const pageRef = useScrollReveal(i18n.language);
    return (
        <div className="policy-page" ref={pageRef}>
            <PublicHeader />
            <main className="policy-main">
                <header className="policy-header policy-header--bordered" data-reveal="fade-up">
                    <div className="policy-badge policy-badge--accent">{t("privacy.badge")}</div>
                    <h1 className="policy-title">{t("privacy.title")}</h1>
                    <div className="policy-meta">
                        <span className="policy-meta__label">{t("privacy.lastUpdatedLabel")}</span>
                        <span>2026</span>
                    </div>
                </header>

                <div className="policy-sections">
                    <article id="introduction" data-reveal="fade-up">
                        <h2 className="policy-section__title"><span className="policy-section__bullet" />{t("privacy.s1Title")}</h2>
                        <div className="policy-section__body">
                            <p className="policy-section__lead">{t("privacy.s1Lead")}</p>
                            <p>{t("privacy.s1Body")}</p>
                        </div>
                    </article>

                    <article id="data-collection" data-reveal="fade-up">
                        <h2 className="policy-section__title"><span className="policy-section__bullet" />{t("privacy.s2Title")}</h2>
                        <div className="policy-section__body">
                            <p>{t("privacy.s2Intro")}</p>
                            <div className="policy-cards">
                                <div className="policy-card"><h3>{t("privacy.card1Title")}</h3><p>{t("privacy.card1Body")}</p></div>
                                <div className="policy-card"><h3>{t("privacy.card2Title")}</h3><p>{t("privacy.card2Body")}</p></div>
                                <div className="policy-card"><h3>{t("privacy.card3Title")}</h3><p>{t("privacy.card3Body")}</p></div>
                                <div className="policy-card"><h3>{t("privacy.card4Title")}</h3><p>{t("privacy.card4Body")}</p></div>
                            </div>
                        </div>
                    </article>

                    <article id="usage" data-reveal="fade-up">
                        <h2 className="policy-section__title"><span className="policy-section__bullet" />{t("privacy.s3Title")}</h2>
                        <div className="policy-section__body">
                            <p>{t("privacy.s3Intro")}</p>
                            <ul className="policy-list policy-list--bullet">
                                <li>{t("privacy.s3li1")}</li>
                                <li>{t("privacy.s3li2")}</li>
                                <li>{t("privacy.s3li3")}</li>
                                <li>{t("privacy.s3li4")}</li>
                                <li>{t("privacy.s3li5")}</li>
                            </ul>
                            <p>{t("privacy.s3Footer")}</p>
                        </div>
                    </article>

                    <article id="third-party" data-reveal="fade-up">
                        <h2 className="policy-section__title"><span className="policy-section__bullet" />{t("privacy.s4Title")}</h2>
                        <p className="policy-section__intro">{t("privacy.s4Intro")}</p>
                        <div className="policy-table-wrap">
                            <table className="policy-table">
                                <thead>
                                    <tr><th>{t("privacy.tableService")}</th><th>{t("privacy.tableData")}</th><th>{t("privacy.tablePurpose")}</th></tr>
                                </thead>
                                <tbody>
                                    <tr><td className="policy-table__primary">Paymob</td><td>{t("privacy.row1Data")}</td><td className="policy-table__italic">{t("privacy.row1Purpose")}</td></tr>
                                    <tr><td className="policy-table__primary">Cloudinary</td><td>{t("privacy.row2Data")}</td><td className="policy-table__italic">{t("privacy.row2Purpose")}</td></tr>
                                    <tr><td className="policy-table__primary">SQL Server</td><td>{t("privacy.row3Data")}</td><td className="policy-table__italic">{t("privacy.row3Purpose")}</td></tr>
                                </tbody>
                            </table>
                        </div>
                    </article>

                    <article className="policy-highlight-box" data-reveal="fade-up">
                        <h2 className="policy-highlight-box__title">{t("privacy.s5Title")}</h2>
                        <p>{t("privacy.s5p1")}</p>
                        <p>{t("privacy.s5p2")} <Link to="/security" className="policy-link">{t("privacy.s5Link")}</Link>.</p>
                    </article>
                </div>
            </main>
            <PublicFooter activePage="privacy" />
        </div>
    );
}