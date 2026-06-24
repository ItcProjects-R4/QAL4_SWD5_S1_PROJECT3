import { Link } from 'react-router-dom'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'

export default function Privacy() {
    return (
        <div className="bg-background min-h-screen flex flex-col text-on-surface page-enter">
            <Navbar />

            <main className="flex-grow w-full max-w-3xl mx-auto px-4 md:px-8 py-16">
                {/* Header */}
                <div className="text-center mb-12 fade-up">
                    <div className="w-16 h-16 bg-primary-container rounded-full flex items-center justify-center mx-auto mb-6 scale-in">
                        <span className="material-symbols-outlined text-on-primary text-[32px]">shield_lock</span>
                    </div>
                    <h1 className="font-bold text-display-lg text-on-surface mb-3">Privacy Policy</h1>
                    <p className="text-body-lg text-on-surface-variant">Last updated: June 2026</p>
                </div>

                <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-6 md:p-10 flex flex-col gap-8 fade-up" style={{ animationDelay: '.1s' }}>
                    <PrivacySection num="1" title="Introduction">
                        SehhaTech ("we," "our," or "us") respects your privacy and is committed to
                        protecting your personal data. This Privacy Policy explains what information we
                        collect through the Patient Portal, how we use it, and the choices you have
                        regarding your data.
                    </PrivacySection>

                    <PrivacySection num="2" title="Information We Collect">
                        We collect the information you provide directly, such as your full name, phone
                        number, and password during registration. We also collect information generated
                        through your use of the platform, including appointment bookings, selected clinics
                        and doctors, booking history, and OTP verification records. We may collect basic
                        technical data such as device type and IP address for security and fraud
                        prevention.
                    </PrivacySection>

                    <PrivacySection num="3" title="How We Use Your Information">
                        We use your information to: create and manage your account; verify your identity
                        via SMS one-time passcodes; process and confirm appointment bookings with partner
                        clinics; send booking confirmations, reminders, and account-related notifications;
                        improve and secure our platform; and comply with legal obligations.
                    </PrivacySection>

                    <PrivacySection num="4" title="SMS & OTP Communications">
                        Your phone number is used to send one-time passcodes (OTP) for registration,
                        login verification, and password reset, as well as appointment confirmations and
                        reminders. These messages are sent via our SMS provider and are necessary for the
                        functioning of the service; they are not used for marketing without your separate
                        consent.
                    </PrivacySection>

                    <PrivacySection num="5" title="Sharing With Partner Clinics">
                        When you book an appointment, your name, phone number, and booking details are
                        shared with the relevant partner clinic and doctor solely for the purpose of
                        managing that appointment. Partner clinics are responsible for safeguarding any
                        information shared with them in accordance with applicable healthcare data
                        regulations.
                    </PrivacySection>

                    <PrivacySection num="6" title="Data Storage & Security">
                        We implement reasonable technical and organizational measures — including
                        encrypted password storage, token-based authentication, and access controls — to
                        protect your data against unauthorized access, alteration, or disclosure. However,
                        no method of transmission or storage is completely secure, and we cannot guarantee
                        absolute security.
                    </PrivacySection>

                    <PrivacySection num="7" title="Data Retention">
                        We retain your account and booking information for as long as your account remains
                        active, and for a reasonable period afterward as required for legal, accounting, or
                        legitimate business purposes. You may request deletion of your account as described
                        below.
                    </PrivacySection>

                    <PrivacySection num="8" title="Your Rights">
                        You may access, update, or request correction of your personal information at any
                        time through your account, or by contacting our support team. You may also request
                        deletion of your account, subject to any legal retention requirements for booking
                        and medical-appointment records.
                    </PrivacySection>

                    <PrivacySection num="9" title="Cookies & Local Storage">
                        The Patient Portal uses browser local storage to keep you signed in between visits
                        (storing your session tokens) and session storage to temporarily hold information
                        during multi-step flows such as registration and booking. These are technical
                        mechanisms required for the application to function and are not used for
                        third-party advertising tracking.
                    </PrivacySection>

                    <PrivacySection num="10" title="Children's Privacy">
                        SehhaTech is not intended for use by children under 16 without the involvement of a
                        parent or legal guardian. We do not knowingly collect personal information from
                        children without appropriate consent.
                    </PrivacySection>

                    <PrivacySection num="11" title="Changes to This Policy">
                        We may update this Privacy Policy periodically to reflect changes in our practices
                        or for legal reasons. We will notify users of material changes through the
                        platform. Your continued use of SehhaTech after such changes constitutes acceptance
                        of the updated policy.
                    </PrivacySection>

                    <PrivacySection num="12" title="Contact Us">
                        If you have questions or concerns about this Privacy Policy or how your data is
                        handled, please reach out via our{' '}
                        <Link to="/contact" className="text-primary font-medium hover:underline">Contact Support</Link> page.
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
