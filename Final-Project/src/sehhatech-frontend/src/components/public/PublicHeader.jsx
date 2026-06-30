import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import sehhatechIcon from "../../assets/images/sehhatech-icon.png";

export default function PublicHeader() {
    const { t } = useTranslation();

    return (
        <header className="public-header">
            <nav className="public-header__inner">
                <Link to="/" className="public-header__back">
                    <svg
                        className="icon icon-sm public-header__back-icon"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                    >
                        <path d="M19 12H5" />
                        <path d="M12 19l-7-7 7-7" />
                    </svg>
                    {t("publicHeader.backToHome")}
                </Link>
                <Link to="/" className="public-header__brand">
                    <img
                        src={sehhatechIcon}
                        alt="SehhaTech"
                        className="public-header__brand-icon"
                    />
                    SehhaTech
                </Link>
            </nav>
        </header>
    );
}