import { Link } from "react-router-dom";
import PublicFooter from "../../components/public/PublicFooter";
import PlaceholderImage from "../../components/public/PlaceholderImage";
import ChatbotWidget from "../../components/public/ChatbotWidget";

const openChat = () => window.dispatchEvent(new Event("sehhatech:open-chat"));

export default function Landing() {
    return (
        <div className="landing-page">
            {/* Nav */}
            <nav className="landing-nav">
                <div className="landing-nav__inner">
                    <div className="landing-nav__brand">SehhaTech</div>
                    <div className="landing-nav__links">
                        <a href="#features" className="landing-nav__link">
                            Features
                        </a>
                        <a href="#about" className="landing-nav__link">
                            About
                        </a>
                    </div>
                    <div className="landing-nav__actions">
                        <Link to="/login" className="landing-nav__link">
                            Login
                        </Link>
                        <Link to="/register" className="btn btn--gradient">
                            Register
                        </Link>
                    </div>
                </div>
            </nav>

            <main className="landing-main">
                {/* Hero */}
                <section className="landing-hero">
                    <div className="landing-hero__grid">
                        <div>
                            <span className="landing-badge">
                                Simple Clinic Management
                            </span>
                            <h1 className="landing-hero__title">
                                The Simple Way to Run a Modern Clinic
                            </h1>
                            <p className="landing-hero__subtitle">
                                SehhaTech helps healthcare providers streamline their daily
                                operations, so you can spend less time on screens and more
                                time with your patients.
                            </p>
                            <div className="landing-hero__actions">
                                <Link to="/register" className="btn btn--gradient btn--lg">
                                    Get Started Now
                                </Link>
                                <button onClick={openChat} className="btn btn--ai">
                                    <span className="btn--ai__pulse">
                                        <span className="btn--ai__pulse-ring" />
                                        <span className="btn--ai__pulse-dot" />
                                    </span>
                                    <svg
                                        className="icon"
                                        viewBox="0 0 24 24"
                                        fill="none"
                                        stroke="currentColor"
                                        strokeWidth="2"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                    >
                                        <rect x="3" y="11" width="18" height="10" rx="2" />
                                        <circle cx="12" cy="5" r="2" />
                                        <path d="M12 7v4" />
                                    </svg>
                                    Ask Our AI Assistant
                                </button>
                            </div>
                        </div>
                        <div className="landing-hero__image-wrap">
                            <div className="landing-hero__blob landing-hero__blob--top" />
                            <div className="landing-hero__blob landing-hero__blob--bottom" />
                            <div className="landing-hero__image">
                                <PlaceholderImage
                                    icon="image"
                                    label="Clinical Excellence"
                                    className="landing-hero__placeholder"
                                />
                            </div>
                        </div>
                    </div>
                </section>

                {/* Features */}
                <section className="landing-features" id="features">
                    <div className="landing-section-inner">
                        <div className="landing-section-head">
                            <h2 className="landing-section-title">
                                Essential Tools for Better Care
                            </h2>
                            <div className="landing-section-underline" />
                        </div>
                        <div className="landing-features__grid">
                            <div className="landing-feature-card">
                                <div className="landing-feature-card__icon landing-feature-card__icon--secondary">
                                    <svg
                                        className="icon"
                                        viewBox="0 0 24 24"
                                        fill="none"
                                        stroke="currentColor"
                                        strokeWidth="2"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                    >
                                        <rect x="3" y="4" width="18" height="18" rx="2" />
                                        <line x1="16" y1="2" x2="16" y2="6" />
                                        <line x1="8" y1="2" x2="8" y2="6" />
                                        <line x1="3" y1="10" x2="21" y2="10" />
                                    </svg>
                                </div>
                                <h3>Easy Scheduling</h3>
                                <p>
                                    Book appointments effortlessly with a smart calendar that
                                    helps you manage patient flow and reduce no-shows.
                                </p>
                            </div>
                            <div className="landing-feature-card landing-feature-card--accent">
                                <div className="landing-feature-card__icon landing-feature-card__icon--tertiary">
                                    <svg
                                        className="icon"
                                        viewBox="0 0 24 24"
                                        fill="none"
                                        stroke="currentColor"
                                        strokeWidth="2"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                    >
                                        <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
                                        <path d="M14 2v6h6" />
                                        <line x1="9" y1="13" x2="15" y2="13" />
                                        <line x1="9" y1="17" x2="15" y2="17" />
                                    </svg>
                                </div>
                                <h3>Secure Patient Records</h3>
                                <p>
                                    Access medical histories and clinical notes instantly on a
                                    protected cloud system designed for physician privacy.
                                </p>
                            </div>
                            <div className="landing-feature-card">
                                <div className="landing-feature-card__icon landing-feature-card__icon--primary">
                                    <svg
                                        className="icon"
                                        viewBox="0 0 24 24"
                                        fill="none"
                                        stroke="currentColor"
                                        strokeWidth="2"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                    >
                                        <line x1="12" y1="1" x2="12" y2="23" />
                                        <path d="M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6" />
                                    </svg>
                                </div>
                                <h3>Clear Financial Reports</h3>
                                <p>
                                    Track your clinic's revenue, billing, and insurance claims
                                    with simple, automated reports that save you time.
                                </p>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Platform Showcase */}
                <section className="landing-showcase">
                    <div className="landing-section-inner">
                        <div className="landing-showcase__grid">
                            <div className="landing-showcase__text">
                                <h2 className="landing-section-title">
                                    One Platform. Every Role Covered.
                                </h2>
                                <div className="landing-showcase__steps">
                                    <div className="landing-showcase__step">
                                        <div className="landing-showcase__step-num">1</div>
                                        <div>
                                            <h4>For Doctors</h4>
                                            <p>
                                                Focus on the patient, not the screen. Digital
                                                charting made simple and fast.
                                            </p>
                                        </div>
                                    </div>
                                    <div className="landing-showcase__step">
                                        <div className="landing-showcase__step-num">2</div>
                                        <div>
                                            <h4>For Staff</h4>
                                            <p>
                                                Manage patient check-ins and phone calls with an
                                                organized, intuitive interface.
                                            </p>
                                        </div>
                                    </div>
                                    <div className="landing-showcase__step">
                                        <div className="landing-showcase__step-num">3</div>
                                        <div>
                                            <h4>For Owners</h4>
                                            <p>
                                                Get a bird's-eye view of your business health with
                                                easy-to-read dashboards.
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="landing-showcase__preview">
                                <div className="landing-showcase__card">
                                    <div className="landing-showcase__card-header">
                                        <div className="landing-showcase__dots">
                                            <span className="dot dot--red" />
                                            <span className="dot dot--yellow" />
                                            <span className="dot dot--green" />
                                            <div className="landing-showcase__bar" />
                                        </div>
                                        <div className="landing-showcase__circle" />
                                    </div>
                                    <div className="landing-showcase__panels">
                                        <div className="landing-showcase__panel landing-showcase__panel--wide">
                                            <div className="landing-showcase__panel-line" />
                                            <div className="landing-showcase__panel-block" />
                                        </div>
                                        <div className="landing-showcase__panel">
                                            <div className="landing-showcase__panel-line landing-showcase__panel-line--sm" />
                                            <div className="landing-showcase__panel-rows">
                                                <div className="landing-showcase__row" />
                                                <div className="landing-showcase__row" />
                                                <div className="landing-showcase__row landing-showcase__row--short" />
                                            </div>
                                        </div>
                                    </div>
                                    <div className="landing-showcase__lock">
                                        <svg
                                            className="icon icon-lg"
                                            viewBox="0 0 24 24"
                                            fill="none"
                                            stroke="currentColor"
                                            strokeWidth="2"
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                        >
                                            <rect x="3" y="11" width="18" height="11" rx="2" />
                                            <path d="M7 11V7a5 5 0 0110 0v4" />
                                        </svg>
                                        <p>Protected by SehhaTech Security</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* About */}
                <section className="landing-about" id="about">
                    <div className="landing-section-inner">
                        <div className="landing-about__intro">
                            <div className="landing-about__image-wrap">
                                <PlaceholderImage
                                    icon="image"
                                    label="Modern Clinic Interior"
                                    className="landing-about__image"
                                    aspect="4/3"
                                />
                            </div>
                            <div>
                                <span className="landing-badge landing-badge--tertiary">
                                    Our Vision
                                </span>
                                <h2 className="landing-section-title">
                                    Healthcare, Simplified for Everyone
                                </h2>
                                <p className="landing-about__lead">
                                    SehhaTech was built with a simple goal: to make the digital
                                    side of healthcare as intuitive as possible. We believe
                                    that technology should support the healing process, not get
                                    in its way.
                                </p>
                            </div>
                        </div>

                        <div className="landing-section-head landing-section-head--center">
                            <h2 className="landing-section-title">Why Choose SehhaTech?</h2>
                            <p className="landing-section-lead">
                                We build our tools based on four key principles that keep
                                your clinic running smoothly.
                            </p>
                        </div>
                        <div className="landing-principles">
                            <div className="landing-principle">
                                <div className="landing-principle__icon landing-principle__icon--secondary">
                                    <svg
                                        className="icon"
                                        viewBox="0 0 24 24"
                                        fill="none"
                                        stroke="currentColor"
                                        strokeWidth="2"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                    >
                                        <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z" />
                                    </svg>
                                </div>
                                <h3>Integrity</h3>
                                <p>
                                    We are honest and transparent about how we protect your
                                    data and support your decisions.
                                </p>
                            </div>
                            <div className="landing-principle landing-principle--offset">
                                <div className="landing-principle__icon landing-principle__icon--tertiary">
                                    <svg
                                        className="icon"
                                        viewBox="0 0 24 24"
                                        fill="none"
                                        stroke="currentColor"
                                        strokeWidth="2"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                    >
                                        <path d="M9.5 2A5.5 5.5 0 004 7.5c0 1.86.84 3.5 2 4.5l.5 4h3l.5-4c1.16-1 2-2.64 2-4.5A5.5 5.5 0 009.5 2z" />
                                        <path d="M9 18h3" />
                                    </svg>
                                </div>
                                <h3>Innovation</h3>
                                <p>
                                    We use smart technology to automate boring tasks and
                                    prevent human errors.
                                </p>
                            </div>
                            <div className="landing-principle">
                                <div className="landing-principle__icon landing-principle__icon--primary">
                                    <svg
                                        className="icon"
                                        viewBox="0 0 24 24"
                                        fill="none"
                                        stroke="currentColor"
                                        strokeWidth="2"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                    >
                                        <circle cx="12" cy="12" r="10" />
                                        <circle cx="12" cy="12" r="3" />
                                    </svg>
                                </div>
                                <h3>Ease of Use</h3>
                                <p>
                                    Every screen is designed to be clear and friendly for both
                                    staff and patients.
                                </p>
                            </div>
                            <div className="landing-principle landing-principle--offset">
                                <div className="landing-principle__icon landing-principle__icon--secondary-container">
                                    <svg
                                        className="icon"
                                        viewBox="0 0 24 24"
                                        fill="none"
                                        stroke="currentColor"
                                        strokeWidth="2"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                    >
                                        <path d="M18 10h-1.26A8 8 0 109 20h9a5 5 0 000-10z" />
                                        <path d="M9 13l2 2 4-4" />
                                    </svg>
                                </div>
                                <h3>Reliability</h3>
                                <p>
                                    You can count on SehhaTech to be online and ready whenever
                                    your clinic is open.
                                </p>
                            </div>
                        </div>

                        {/* Story */}
                        <div className="landing-story">
                            <div className="landing-story__text">
                                <h2 className="landing-section-title">
                                    The Story Behind SehhaTech
                                </h2>
                                <p>
                                    SehhaTech started when we noticed doctors were spending
                                    more time clicking buttons than listening to patients. We
                                    saw the frustration caused by complicated systems and
                                    decided to build a better way.
                                </p>
                                <p className="landing-story__quote">
                                    "The clinic shouldn't be a place of administrative stress.
                                    It should be a place where doctors can focus entirely on
                                    helping people heal."
                                </p>
                                <p>
                                    Today, SehhaTech is proud to support hundreds of clinics
                                    around the world, providing a digital workspace that feels
                                    as natural and reliable as your favorite medical tools.
                                </p>
                            </div>
                            <div className="landing-story__image-wrap">
                                <PlaceholderImage
                                    icon="team"
                                    label="SehhaTech Team"
                                    className="landing-story__image"
                                    aspect="1/1"
                                />
                                <div className="landing-story__badge">
                                    <p className="landing-story__badge-num">50+</p>
                                    <p className="landing-story__badge-label">
                                        Active Clinics Trust SehhaTech
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* CTA */}
                <section className="landing-cta">
                    <div className="landing-cta__inner">
                        <div className="landing-cta__box">
                            <div className="landing-cta__blob landing-cta__blob--top" />
                            <div className="landing-cta__blob landing-cta__blob--bottom" />
                            <h2 className="landing-cta__title">
                                Ready to Modernize Your Clinic?
                            </h2>
                            <p className="landing-cta__subtitle">
                                Join 50+ clinical systems that have transformed their patient
                                experience with SehhaTech.
                            </p>
                            <Link to="/register" className="btn btn--cta">
                                Get Started Now
                            </Link>
                        </div>
                    </div>
                </section>
            </main>

            <PublicFooter activePage="landing" />
            <ChatbotWidget />
        </div>
    );
}