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

const ShieldIcon = () => (
    <svg className="icon icon-sm policy-feature-list__icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    </svg>
);

export default function Security() {
    const { t, i18n } = useTranslation();
    const pageRef = useScrollReveal(i18n.language);
    return (
        <div className="policy-page" ref={pageRef}>
            <PublicHeader />
            <main className="policy-main">
                <article className="policy-article">
                    <div className="policy-article__intro" data-reveal="fade-up">
                        <div className="policy-badge policy-badge--label">{t("security.badge")}</div>
                        <h1 className="policy-title">{t("security.title")}</h1>
                        <p className="policy-subtitle policy-subtitle--italic">{t("security.subtitle")}</p>
                    </div>

                    <hr className="policy-divider" />

                    <h2 className="policy-h2">{t("security.s1Title")}</h2>
                    <p className="policy-p">{t("security.s1p1")}</p>
                    <h3 className="policy-h3">{t("security.s1SubTitle")}</h3>
                    <p className="policy-p">{t("security.s1p2")}</p>
                    <div className="policy-info-box" data-reveal="fade-up">
                        <h4>{t("security.s1BoxTitle")}</h4>
                        <ul className="policy-list policy-list--bullet">
                            <li>{t("security.s1li1")}</li>
                            <li>{t("security.s1li2")}</li>
                            <li>{t("security.s1li3")}</li>
                            <li>{t("security.s1li4")}</li>
                        </ul>
                    </div>

                    <h2 className="policy-h2">{t("security.s2Title")}</h2>
                    <p className="policy-p">{t("security.s2p1")}</p>
                    <h3 className="policy-h3">{t("security.s2SubTitle")}</h3>
                    <p className="policy-p">{t("security.s2p2")}</p>

                    <h2 className="policy-h2">{t("security.s3Title")}</h2>
                    <p className="policy-p">{t("security.s3p1")}</p>
                    <ul className="policy-feature-list" data-reveal="fade-up">
                        <li><ShieldIcon /><div><strong>{t("security.s3li1Title")}:</strong> {t("security.s3li1Body")}</div></li>
                        <li><ShieldIcon /><div><strong>{t("security.s3li2Title")}:</strong> {t("security.s3li2Body")}</div></li>
                        <li><ShieldIcon /><div><strong>{t("security.s3li3Title")}:</strong> {t("security.s3li3Body")}</div></li>
                    </ul>

                    <h2 className="policy-h2">{t("security.s4Title")}</h2>
                    <p className="policy-p">{t("security.s4p1")}</p>
                    <div className="policy-stat-grid" data-reveal="fade-up">
                        <div className="policy-stat policy-stat--dark">
                            <div className="policy-stat__value">0</div>
                            <div className="policy-stat__label">{t("security.stat1Label")}</div>
                        </div>
                        <div className="policy-stat">
                            <div className="policy-stat__value">PCI</div>
                            <div className="policy-stat__label">{t("security.stat2Label")}</div>
                        </div>
                    </div>

                    <h2 className="policy-h2">{t("security.s5Title")}</h2>
                    <p className="policy-p">{t("security.s5p1")}</p>
                    <div className="policy-info-box" data-reveal="fade-up">
                        <h4>{t("security.s5BoxTitle")}</h4>
                        <ul className="policy-list policy-list--bullet">
                            <li>{t("security.s5li1")}</li>
                            <li>{t("security.s5li2")}</li>
                            <li>{t("security.s5li3")}</li>
                            <li>{t("security.s5li4")}</li>
                        </ul>
                    </div>

                    <footer className="policy-article__footer" data-reveal="fade-up">
                        <p>{t("security.footerText")}</p>
                        <div className="policy-article__footer-actions">
                            <Link to="/" className="btn btn--primary">{t("security.footerBtnHome")}</Link>
                            <Link to="/contact" className="btn btn--outline">{t("security.footerBtnContact")}</Link>
                            <Link to="/register" className="btn btn--outline">{t("security.footerBtnRegister")}</Link>
                        </div>
                    </footer>
                </article>
            </main>
            <PublicFooter activePage="security" />
        </div>
    );
}