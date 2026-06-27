import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import sehhatechIcon from "../../assets/images/sehhatech-icon.png";

export default function PublicFooter({ activePage }) {
    const { t } = useTranslation();

    const links = [
        { to: "/privacy", label: t("publicFooter.privacy"), key: "privacy" },
        { to: "/terms", label: t("publicFooter.terms"), key: "terms" },
        { to: "/security", label: t("publicFooter.security"), key: "security" },
        { to: "/status", label: t("publicFooter.status"), key: "status" },
        { to: "/contact", label: t("publicFooter.contact"), key: "contact" },
    ];

    return (
        <footer className="public-footer">
            <div className="public-footer__inner">
                <div className="public-footer__brand">
                    <div className="public-footer__logo">
                        <img
                            src={sehhatechIcon}
                            alt="SehhaTech"
                            className="public-footer__logo-icon"
                        />
                        SehhaTech
                    </div>
                    <p className="public-footer__copy">
                        {t("publicFooter.copy")}
                    </p>
                </div>
                <div className="public-footer__links">
                    {links.map((link) => (
                        <Link
                            key={link.key}
                            to={link.to}
                            className={
                                activePage === link.key
                                    ? "public-footer__link public-footer__link--active"
                                    : "public-footer__link"
                            }
                        >
                            {link.label}
                        </Link>
                    ))}
                </div>
            </div>
        </footer>
    );
}