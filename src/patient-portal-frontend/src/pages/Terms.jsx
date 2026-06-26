import { Link } from 'react-router-dom'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'

export default function Terms() {
    return (
        <div className="bg-background min-h-screen flex flex-col text-on-surface page-enter">
            <Navbar />

            <main className="flex-grow w-full max-w-3xl mx-auto px-4 md:px-8 py-16">
                {/* Header */}
                <div className="text-center mb-12 fade-up">
                    <div className="w-16 h-16 bg-primary-container rounded-full flex items-center justify-center mx-auto mb-6 scale-in">
                        <span className="material-symbols-outlined text-on-primary text-[32px]">gavel</span>
                    </div>
                    <h1 className="font-bold text-display-lg text-on-surface mb-3">Terms &amp; Conditions</h1>
                    <p className="text-body-lg text-on-surface-variant">Last updated: June 2026</p>
                </div>

                <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-6 md:p-10 flex flex-col gap-8 fade-up" style={{ animationDelay: '.1s' }}>
                    <TermsSection num="1" title="Acceptance of Terms">
                        By creating an account on SehhaTech, accessing the Patient Portal, or booking an
                        appointment through our platform, you confirm that you have read, understood, and
                        agree to be bound by these Terms &amp; Conditions and our{' '}
                        <Link to="/privacy" className="text-primary font-medium hover:underline">Privacy Policy</Link>.
                        If you do not agree with any part of these terms, please discontinue use of the
                        platform.
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
                        Your personal and health-related information is processed in accordance with our{' '}
                        <Link to="/privacy" className="text-primary font-medium hover:underline">Privacy Policy</Link>.
                        By using SehhaTech you consent to the collection and processing of your phone
                        number, booking history, and related data for the purpose of providing and
                        improving the service, including sending OTP and appointment-reminder SMS
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

                    <TermsSection num="10" title="Termination">
                        We reserve the right to suspend or terminate your account at our discretion if we
                        believe these Terms have been violated, without prior notice, to the extent
                        permitted by applicable law.
                    </TermsSection>

                    <TermsSection num="11" title="Changes to These Terms">
                        We may update these Terms &amp; Conditions from time to time. Material changes will
                        be communicated through the platform. Continued use of SehhaTech after changes take
                        effect constitutes acceptance of the revised terms.
                    </TermsSection>

                    <TermsSection num="12" title="Governing Law">
                        These Terms are governed by and construed in accordance with the laws of the
                        Arab Republic of Egypt, without regard to its conflict-of-law provisions.
                    </TermsSection>

                    <TermsSection num="13" title="Contact">
                        For questions about these Terms &amp; Conditions, please reach out via our{' '}
                        <Link to="/contact" className="text-primary font-medium hover:underline">Contact Support</Link> page.
                    </TermsSection>
                </div>
            </main>

            <Footer />
        </div>
    )
}

function TermsSection({ num, title, children }) {
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
