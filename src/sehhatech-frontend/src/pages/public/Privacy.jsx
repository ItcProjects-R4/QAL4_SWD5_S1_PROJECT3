import { Link } from "react-router-dom";
import PublicHeader from "../../components/public/PublicHeader";
import PublicFooter from "../../components/public/PublicFooter";

export default function Privacy() {
    return (
        <div className="policy-page">
            <PublicHeader />

            <main className="policy-main">
                <header className="policy-header policy-header--bordered">
                    <div className="policy-badge policy-badge--accent">
                        Legal Documentation
                    </div>
                    <h1 className="policy-title">Privacy Policy</h1>
                    <div className="policy-meta">
                        <span className="policy-meta__label">Last Updated:</span>
                        <span>2026</span>
                    </div>
                </header>

                <div className="policy-sections">
                    <article id="introduction">
                        <h2 className="policy-section__title">
                            <span className="policy-section__bullet" />
                            Introduction
                        </h2>
                        <div className="policy-section__body">
                            <p className="policy-section__lead">
                                At SehhaTech, we take the privacy of clinic and patient data
                                seriously. This Privacy Policy explains what data we collect,
                                how we use it, and how we protect it within the SehhaTech
                                platform.
                            </p>
                            <p>
                                By using SehhaTech, you agree to the data practices described
                                in this policy.
                            </p>
                        </div>
                    </article>

                    <article id="data-collection">
                        <h2 className="policy-section__title">
                            <span className="policy-section__bullet" />
                            Data We Collect
                        </h2>
                        <div className="policy-section__body">
                            <p>
                                We collect the following types of information when you
                                register and use SehhaTech:
                            </p>
                            <div className="policy-cards">
                                <div className="policy-card">
                                    <h3>Clinic Information</h3>
                                    <p>
                                        Clinic name, address, phone number, specialization, and
                                        the admin's full name and email — collected during
                                        registration.
                                    </p>
                                </div>
                                <div className="policy-card">
                                    <h3>User Accounts</h3>
                                    <p>
                                        Name, email, and hashed password for each user
                                        (ClinicAdmin, Doctor, Receptionist). Passwords are never
                                        stored in plain text.
                                    </p>
                                </div>
                                <div className="policy-card">
                                    <h3>Patient &amp; Appointment Data</h3>
                                    <p>
                                        Patient records, appointment details, and any uploaded
                                        images — entered by authorized clinic staff only.
                                    </p>
                                </div>
                                <div className="policy-card">
                                    <h3>Subscription &amp; Payment</h3>
                                    <p>
                                        We store only the subscription status and Paymob order
                                        ID. No card or payment details are ever stored on
                                        SehhaTech servers.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </article>

                    <article id="usage">
                        <h2 className="policy-section__title">
                            <span className="policy-section__bullet" />
                            How We Use Your Data
                        </h2>
                        <div className="policy-section__body">
                            <p>
                                SehhaTech uses collected data solely to operate and improve
                                the platform. Specifically:
                            </p>
                            <ul className="policy-list policy-list--bullet">
                                <li>
                                    To authenticate users and enforce role-based access
                                    control.
                                </li>
                                <li>
                                    To isolate each clinic's data within its own secure
                                    environment.
                                </li>
                                <li>
                                    To manage subscription status and grant or restrict
                                    platform access.
                                </li>
                                <li>To store and serve clinic and patient images via Cloudinary.</li>
                                <li>To process payments securely through Paymob.</li>
                            </ul>
                            <p>
                                We do not use your data for advertising, analytics resale, or
                                any purpose unrelated to operating the platform.
                            </p>
                        </div>
                    </article>

                    <article id="third-party">
                        <h2 className="policy-section__title">
                            <span className="policy-section__bullet" />
                            Third-Party Services
                        </h2>
                        <p className="policy-section__intro">
                            SehhaTech integrates with the following trusted third-party
                            services to operate the platform:
                        </p>
                        <div className="policy-table-wrap">
                            <table className="policy-table">
                                <thead>
                                    <tr>
                                        <th>Service</th>
                                        <th>Data Shared</th>
                                        <th>Purpose</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr>
                                        <td className="policy-table__primary">Paymob</td>
                                        <td>Order amount, clinic billing info</td>
                                        <td className="policy-table__italic">
                                            Payment processing
                                        </td>
                                    </tr>
                                    <tr>
                                        <td className="policy-table__primary">Cloudinary</td>
                                        <td>Uploaded image files</td>
                                        <td className="policy-table__italic">
                                            Secure image storage &amp; delivery
                                        </td>
                                    </tr>
                                    <tr>
                                        <td className="policy-table__primary">SQL Server</td>
                                        <td>All platform data</td>
                                        <td className="policy-table__italic">
                                            Primary database (local/hosted)
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </article>

                    <article className="policy-highlight-box">
                        <h2 className="policy-highlight-box__title">
                            Data Isolation &amp; Security
                        </h2>
                        <p>
                            Every clinic's data is completely isolated from all other
                            clinics through SehhaTech's Multi-Tenant architecture. A
                            dedicated middleware layer verifies each user's clinic identity
                            on every request — no clinic can ever access another clinic's
                            data.
                        </p>
                        <p>
                            All passwords are hashed with BCrypt before storage. JWT tokens
                            are used for session management and expire after 7 days. For
                            more details, see our{" "}
                            <Link to="/security" className="policy-link">
                                Security page
                            </Link>
                            .
                        </p>
                    </article>
                </div>
            </main>

            <PublicFooter activePage="privacy" />
        </div>
    );
}