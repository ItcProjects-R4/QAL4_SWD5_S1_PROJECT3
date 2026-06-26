import { useEffect, useRef } from "react";
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

const CheckIcon = () => (
    <svg className="icon icon-sm policy-check-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><path d="M22 4L12 14.01l-3-3" />
    </svg>
);

const WarnIcon = () => (
    <svg className="icon icon-sm" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" /><path d="M12 9v4" /><path d="M12 17h.01" />
    </svg>
);

export default function Terms() {
    const { t, i18n } = useTranslation();
    const pageRef = useScrollReveal(i18n.language);
    return (
        <div className="policy-page" ref={pageRef}>
            <PublicHeader />
            <main className="policy-main">
                <header className="policy-header" data-reveal="fade-up">
                    <div className="policy-badge">{t("terms.badge")}</div>
                    <h1 className="policy-title">{t("terms.title")}</h1>
                    <p className="policy-subtitle">{t("terms.subtitle")}</p>
                </header>

                <article className="policy-sections">
                    <section className="policy-section" id="introduction" data-reveal="fade-up">
                        <h2 className="policy-section__title"><span className="policy-section__num">01</span> {t("terms.s1Title")}</h2>
                        <div className="policy-section__body">
                            <p>{t("terms.s1p1")}</p>
                            <p>{t("terms.s1p2")}</p>
                        </div>
                    </section>

                    <section className="policy-section" id="account-usage" data-reveal="fade-up">
                        <h2 className="policy-section__title"><span className="policy-section__num">02</span> {t("terms.s2Title")}</h2>
                        <div className="policy-section__body">
                            <p>{t("terms.s2p1")}</p>
                            <div className="policy-quote">{t("terms.s2Quote")}</div>
                            <p>{t("terms.s2p2")}</p>
                        </div>
                    </section>

                    <section className="policy-section" id="subscriptions" data-reveal="fade-up">
                        <h2 className="policy-section__title"><span className="policy-section__num">03</span> {t("terms.s3Title")}</h2>
                        <div className="policy-section__body">
                            <ul className="policy-checklist">
                                <li><CheckIcon /><div><strong>{t("terms.s3li1Title")}</strong> {t("terms.s3li1Body")}</div></li>
                                <li><CheckIcon /><div><strong>{t("terms.s3li2Title")}</strong> {t("terms.s3li2Body")}</div></li>
                                <li><CheckIcon /><div><strong>{t("terms.s3li3Title")}</strong> {t("terms.s3li3Body")}</div></li>
                            </ul>
                            <p className="policy-section__footnote">{t("terms.s3Footer")}</p>
                        </div>
                    </section>

                    <section className="policy-section" id="liability" data-reveal="fade-up">
                        <h2 className="policy-section__title"><span className="policy-section__num">04</span> {t("terms.s4Title")}</h2>
                        <div className="policy-disclaimer">
                            <p className="policy-disclaimer__label"><WarnIcon />{t("terms.s4DisclaimerLabel")}</p>
                            <p className="policy-disclaimer__text">{t("terms.s4DisclaimerText")}</p>
                        </div>
                        <div className="policy-section__body">
                            <p>{t("terms.s4Intro")}</p>
                            <ul className="policy-list">
                                <li>{t("terms.s4li1")}</li>
                                <li>{t("terms.s4li2")}</li>
                                <li>{t("terms.s4li3")}</li>
                                <li>{t("terms.s4li4")}</li>
                            </ul>
                        </div>
                    </section>

                    <section className="policy-section" id="data" data-reveal="fade-up">
                        <h2 className="policy-section__title"><span className="policy-section__num">05</span> {t("terms.s5Title")}</h2>
                        <div className="policy-section__body">
                            <p>{t("terms.s5p1")}</p>
                            <p>{t("terms.s5p2")}</p>
                        </div>
                    </section>
                </article>
            </main>
            <PublicFooter activePage="terms" />
        </div>
    );
}