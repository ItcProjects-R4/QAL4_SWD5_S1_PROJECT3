import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'

export default function Footer() {
    const { t } = useTranslation()

    return (
        <footer className="bg-surface-container-lowest border-t border-outline-variant w-full py-6 px-8 flex flex-col md:flex-row justify-between items-center gap-3">
            <div className="flex items-center gap-1">
                <span className="font-bold text-[20px] text-primary">SehhaTech</span>
                <span className="text-label-md text-secondary ml-3">
                    {t('footer.rights')}
                </span>
            </div>
            <nav className="flex flex-wrap justify-center gap-6 text-label-md">
                <Link className="link-underline text-secondary hover:text-primary transition-colors" to="/privacy">
                    {t('footer.privacy')}
                </Link>
                <Link className="link-underline text-secondary hover:text-primary transition-colors" to="/terms">
                    {t('footer.terms')}
                </Link>
                <Link className="link-underline text-secondary hover:text-primary transition-colors" to="/contact">
                    {t('footer.contact')}
                </Link>
            </nav>
        </footer>
    )
}