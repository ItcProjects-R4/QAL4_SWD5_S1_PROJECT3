import { useEffect } from 'react'

export default function TermsModal({ open, onClose, onAccept, mode = 'view' }) {
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
                            Terms &amp; Conditions
                        </h2>
                    </div>
                    <button
                        onClick={onClose}
                        aria-label="Close"
                        className="w-9 h-9 flex items-center justify-center rounded-full text-on-surface-variant hover:bg-surface-container hover:text-error transition-colors"
                    >
                        <span className="material-symbols-outlined">close</span>
                    </button>
                </div>

                {/* Scrollable body */}
                <div className="flex-grow overflow-y-auto px-6 md:px-8 py-6 flex flex-col gap-6 text-on-surface-variant">
                    <p className="text-label-sm text-outline">Last updated: June 2026</p>

                    <TermsSection num="1" title="Acceptance of Terms">
                        By creating an account on SehhaTech, accessing the Patient Portal, or booking an
                        appointment through our platform, you confirm that you have read, understood, and
                        agree to be bound by these Terms &amp; Conditions and our Privacy Policy. If you do
                        not agree with any part of these terms, please discontinue use of the platform.
                    </TermsSection>

                    <TermsSection num="2" title="Eligibility">
                        You must be at least 16 years old to register an independent patient account.
                        Accounts created on behalf of a minor or dependent must be managed by a parent or
                        legal guardian who accepts full responsibility for the accuracy of the information
                        provided and for all bookings made under that account.
                    </TermsSection>

                    <TermsSection num="3" title="Account Registration & Security">
                        You agree to provide accurate, current, and complete information during
                        registration, including a valid Egyptian phone number used for identity
                        verification via OTP. You are responsible for maintaining the confidentiality of
                        your password and for all activity that occurs under your account. Notify us
                        immediately of any unauthorized use of your credentials.
                    </TermsSection>

                    <TermsSection num="4" title="Appointment Bookings">
                        SehhaTech acts as a booking intermediary connecting patients with partner clinics
                        and doctors. Confirmed bookings are subject to the availability and policies of the
                        individual clinic. We reserve the right to cancel or reschedule appointments due to
                        doctor unavailability, clinic closure, or technical issues, and will make reasonable
                        efforts to notify you in advance via SMS or in-app notification.
                    </TermsSection>

                    <TermsSection num="5" title="Cancellations & No-Shows">
                        You may cancel an upcoming appointment from the "My Bookings" page. Repeated
                        no-shows or late cancellations may result in restrictions on future bookings at the
                        discretion of the partner clinic. SehhaTech is not responsible for any fees charged
                        directly by a clinic for missed appointments.
                    </TermsSection>

                    <TermsSection num="6" title="Medical Disclaimer">
                        SehhaTech is a scheduling and practice-management platform. It does not provide
                        medical advice, diagnosis, or treatment, and is not a substitute for professional
                        medical care. Always consult a qualified healthcare provider regarding any medical
                        condition. In case of a medical emergency, contact local emergency services
                        immediately rather than using this platform.
                    </TermsSection>

                    <TermsSection num="7" title="Data & Privacy">
                        Your personal and health-related information is processed in accordance with our
                        Privacy Policy. By using SehhaTech you consent to the collection and processing of
                        your phone number, booking history, and related data for the purpose of providing
                        and improving the service, including sending OTP and appointment-reminder SMS
                        messages.
                    </TermsSection>

                    <TermsSection num="8" title="Acceptable Use">
                        You agree not to misuse the platform, including but not limited to: creating
                        fraudulent bookings, impersonating another person, attempting to access another
                        user's account, or interfering with the normal operation of the service. We reserve
                        the right to suspend or terminate accounts that violate these terms.
                    </TermsSection>

                    <TermsSection num="9" title="Limitation of Liability">
                        To the fullest extent permitted by law, SehhaTech and its affiliates shall not be
                        liable for any indirect, incidental, or consequential damages arising from your use
                        of the platform, including but not limited to missed appointments, clinic-side
                        errors, or service interruptions.
                    </TermsSection>

                    <TermsSection num="10" title="Changes to These Terms">
                        We may update these Terms &amp; Conditions from time to time. Material changes will
                        be communicated through the platform. Continued use of SehhaTech after changes take
                        effect constitutes acceptance of the revised terms.
                    </TermsSection>

                    <TermsSection num="11" title="Contact">
                        For questions about these Terms &amp; Conditions, please reach out via our Contact
                        Support page.
                    </TermsSection>
                </div>

                {/* Footer actions */}
                <div className="flex flex-col sm:flex-row gap-3 px-6 md:px-8 py-5 border-t border-outline-variant">
                    {mode === 'accept' ? (
                        <>
                            <button
                                onClick={onClose}
                                className="btn-press flex-1 bg-surface-container text-on-surface font-medium text-label-md py-3 rounded-xl hover:bg-surface-container-high transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={() => { onAccept?.(); onClose() }}
                                className="btn-press flex-1 bg-primary text-on-primary font-medium text-label-md py-3 rounded-xl hover:bg-primary-container transition-colors flex items-center justify-center gap-2"
                            >
                                <span className="material-symbols-outlined text-[18px]">check</span>
                                I Agree
                            </button>
                        </>
                    ) : (
                        <button
                            onClick={onClose}
                            className="btn-press w-full bg-primary text-on-primary font-medium text-label-md py-3 rounded-xl hover:bg-primary-container transition-colors"
                        >
                            Close
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
