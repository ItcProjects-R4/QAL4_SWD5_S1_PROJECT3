import { useEffect } from 'react'
import { useTranslation } from 'react-i18next'

// Modal reuses the same terms.sections.* keys as the full Terms page.
// Unlike the Terms page, links here render as plain text (no <Link> — this is a modal,
// not a route), and section 12 ("Governing Law") is intentionally omitted to keep the
// modal shorter than the full page.
const MODAL_SECTION_NUMS = [1, 2, 3, 4, 5, 6, 7, 8, 9, 11, 13]

export default function TermsModal({ open, onClose, onAccept, mode = 'view' }) {
    const { t } = useTranslation()
    const allSections = t('terms.sections', { returnObjects: true })

    /* lock body scroll while open + close on Escape */
    useEffect(() => {
        if (!open) return
        const onKey = (e) => { if (e.key === 'Escape') onClose() }
        document.addEventListener('keydown', onKey)
        const prevOverflow = document.body.style.overflow
        document.body.style.overflow = 'hidden'
        return () => {
            document.removeEventListener('keydown', onKey)
            document.body.style.overflow = prevOverflow
        }
    }, [open, onClose])

    if (!open) return null

    return (
        <div
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 overlay-fade"
            style={{ backgroundColor: 'rgba(13,28,46,0.55)', backdropFilter: 'blur(4px)' }}
            onMouseDown={(e) => { if (e.target === e.currentTarget) onClose() }}
        >
            <div
                className="bg-surface-container-lowest border border-outline-variant rounded-xl w-full max-w-2xl max-h-[85vh] flex flex-col modal-pop shadow-[0_24px_48px_-12px_rgba(0,0,0,0.25)]"
                role="dialog" aria-modal="true" aria-labelledby="terms-modal-title"
            >
                {/* Header */}
                <div className="flex items-center justify-between gap-3 px-6 md:px-8 py-5 border-b border-outline-variant">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-primary-container flex items-center justify-center text-on-primary flex-shrink-0">
                            <span className="material-symbols-outlined text-[20px]">gavel</span>
                        </div>
                        <h2 id="terms-modal-title" className="font-semibold text-headline-md text-on-surface">
                            {t('terms.title')}
                        </h2>
                    </div>
                    <button
                        onClick={onClose}
                        aria-label={t('termsModal.close')}
                        className="w-9 h-9 flex items-center justify-center rounded-full text-on-surface-variant hover:bg-surface-container hover:text-error transition-colors"
                    >
                        <span className="material-symbols-outlined">close</span>
                    </button>
                </div>

                {/* Scrollable body */}
                <div className="flex-grow overflow-y-auto px-6 md:px-8 py-6 flex flex-col gap-6 text-on-surface-variant">
                    <p className="text-label-sm text-outline">{t('terms.lastUpdated')}</p>

                    {MODAL_SECTION_NUMS.map((num, i) => {
                        const s = allSections[num - 1]
                        return (
                            <TermsSection key={num} num={i + 1} title={s.title}>
                                {s.body}
                            </TermsSection>
                        )
                    })}
                </div>

                {/* Footer actions */}
                <div className="flex flex-col sm:flex-row gap-3 px-6 md:px-8 py-5 border-t border-outline-variant">
                    {mode === 'accept' ? (
                        <>
                            <button
                                onClick={onClose}
                                className="btn-press flex-1 bg-surface-container text-on-surface font-medium text-label-md py-3 rounded-xl hover:bg-surface-container-high transition-colors"
                            >
                                {t('termsModal.cancel')}
                            </button>
                            <button
                                onClick={() => { onAccept?.(); onClose() }}
                                className="btn-press flex-1 bg-primary text-on-primary font-medium text-label-md py-3 rounded-xl hover:bg-primary-container transition-colors flex items-center justify-center gap-2"
                            >
                                <span className="material-symbols-outlined text-[18px]">check</span>
                                {t('termsModal.agree')}
                            </button>
                        </>
                    ) : (
                        <button
                            onClick={onClose}
                            className="btn-press w-full bg-primary text-on-primary font-medium text-label-md py-3 rounded-xl hover:bg-primary-container transition-colors"
                        >
                            {t('termsModal.closeBtn')}
                        </button>
                    )}
                </div>
            </div>
        </div>
    )
}

function TermsSection({ num, title, children }) {
    return (
        <div className="flex flex-col gap-2">
            <h3 className="font-semibold text-body-lg text-on-surface flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-surface-container flex items-center justify-center text-label-sm font-bold text-primary flex-shrink-0">
                    {num}
                </span>
                {title}
            </h3>
            <p className="text-body-md leading-relaxed pl-8">{children}</p>
        </div>
    )
}