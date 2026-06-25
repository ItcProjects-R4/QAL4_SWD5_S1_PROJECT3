import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import PublicHeader from "../../components/public/PublicHeader";

export default function NotFound() {
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        const id = requestAnimationFrame(() => setMounted(true));
        return () => cancelAnimationFrame(id);
    }, []);

    return (
        <div className="notfound-page">
            <PublicHeader />

            <main className="notfound-main">
                <div className="notfound-orb notfound-orb--1" aria-hidden="true" />
                <div className="notfound-orb notfound-orb--2" aria-hidden="true" />

                <div
                    className="notfound-content"
                    style={{
                        opacity: mounted ? 1 : 0,
                        transform: mounted ? "translateY(0)" : "translateY(16px)",
                        transition: "opacity 0.6s ease, transform 0.6s ease",
                    }}
                >
                    <div className="notfound-icon-wrap">
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
                            <line x1="12" y1="15" x2="12" y2="17" />
                        </svg>
                    </div>

                    <p className="notfound-code">404</p>
                    <h1 className="notfound-title">This page took a wrong turn</h1>
                    <p className="notfound-text">
                        The page you're looking for doesn't exist, may have moved, or
                        the link might be broken. Let's get you back on track.
                    </p>

                    <div className="notfound-actions">
                        <Link to="/" className="btn btn--gradient">
                            Back to Home
                        </Link>
                        <Link to="/contact" className="btn btn--outline">
                            Contact Support
                        </Link>
                    </div>
                </div>
            </main>
        </div>
    );
}
