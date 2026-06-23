import { useState, useEffect } from "react";
import Sidebar from "./Sidebar";
import Header from "./Header";
import { useDoctorProfile } from "../hooks/useDoctorProfile";

export default function Layout({ children }) {
    const { profile } = useDoctorProfile();
    const [sidebarOpen, setSidebarOpen] = useState(true);

    useEffect(() => {
        const mob = window.innerWidth < 768;
        const saved = localStorage.getItem("sidebarOpen");
        setSidebarOpen(mob ? false : saved === null ? true : saved === "true");
    }, []);

    function toggleSidebar() {
        const next = !sidebarOpen;
        setSidebarOpen(next);
        if (window.innerWidth >= 768) {
            localStorage.setItem("sidebarOpen", next);
        }
    }

    const isMobile = typeof window !== "undefined" && window.innerWidth < 768;

    return (
        <div>
            {/* Overlay (mobile) */}
            {sidebarOpen && isMobile && (
                <div
                    onClick={() => setSidebarOpen(false)}
                    className="fixed inset-0 bg-black/40 z-40 md:hidden"
                />
            )}

            {/* Sidebar */}
            <Sidebar
                profile={profile}
                sidebarOpen={sidebarOpen}
            />

            {/* Header */}
            <div
                className="transition-all duration-250"
                style={{
                    marginLeft: sidebarOpen ? "16rem" : "0",
                    left: sidebarOpen ? "16rem" : "0",
                }}
            >
                <Header
                    profile={profile}
                    sidebarOpen={sidebarOpen}
                    isMobile={isMobile}
                    onMenuClick={toggleSidebar}
                />
            </div>

            {/* Main Content */}
            <main
                className={`pt-16 min-h-screen transition-all duration-300 ${sidebarOpen ? "ml-64" : "ml-0"
                    }`}
            >
                <div
                    className="p-4 md:p-10 max-w-[1400px] mx-auto space-y-8"
                >
                    {children}
                </div>
            </main>
        </div>
    );
}