import { Link } from 'react-router-dom'
import { useTranslation, Trans } from 'react-i18next'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'

export default function Privacy() {
    const { t } = useTranslation()
    const sections = t('privacy.sections', { returnObjects: true })

    return (
        <div className="bg-background min-h-screen flex flex-col text-on-surface page-enter">
            <Navbar />

            <main className="flex-grow w-full max-w-3xl mx-auto px-4 md:px-8 py-16">
                {/* Header */}
                <div className="text-center mb-12 fade-up">
                    <div className="w-16 h-16 bg-primary-container rounded-full flex items-center justify-center mx-auto mb-6 scale-in">
                        <span className="material-symbols-outlined text-on-primary text-[32px]">shield_lock</span>
                    </div>
                    <h1 className="font-bold text-display-lg text-on-surface mb-3">{t('privacy.title')}</h1>
                    <p className="text-body-lg text-on-surface-variant">{t('privacy.lastUpdated')}</p>
                </div>

                <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-6 md:p-10 flex flex-col gap-8 fade-up" style={{ animationDelay: '.1s' }}>
                    {sections.map((s, i) => (
                        <PrivacySection key={i} num={i + 1} title={s.title}>
                            {s.body}
                        </PrivacySection>
                    ))}

                    <PrivacySection num={sections.length + 1} title={t('privacy.contactTitle')}>
                        <Trans i18nKey="privacy.contactBody">
                            text
                            <Link to="/contact" className="text-primary font-medium hover:underline">link</Link>
                        </Trans>
                    </PrivacySection>
                </div>
            </main>

            <Footer />
        </div>
    )
}

function PrivacySection({ num, title, children }) {
    return (
        <div className="flex flex-col gap-2">
            <h2 className="font-semibold text-headline-md text-on-surface flex items-center gap-3">
                <span className="w-8 h-8 rounded-full bg-surface-container flex items-center justify-center text-label-md font-bold text-primary flex-shrink-0">
                    {num}
                </span>
                {title}
            </h2>
            <p className="text-body-md text-on-surface-variant leading-relaxed pl-11">{children}</p>
        </div>
    )
}