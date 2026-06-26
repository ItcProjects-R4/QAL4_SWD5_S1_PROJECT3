import { useState, useEffect } from "react";
import Sidebar from "./Sidebar";
import Header from "./Header";
import { useDoctorProfile } from "../hooks/useDoctorProfile";

export default function Layout({ children }) {
    const { profile } = useDoctorProfile();
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [isMobile, setIsMobile] = useState(false);

    useEffect(() => {
        function handleResize() {
            const mob = window.innerWidth < 768;
            setIsMobile(mob);
            if (mob) {
                setSidebarOpen(false);
            } else {
                const saved = localStorage.getItem("sidebarOpen");
                setSidebarOpen(saved === null ? true : saved === "true");
            }
        }
        handleResize();
        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    }, []);

    function toggleSidebar() {
        const next = !sidebarOpen;
        setSidebarOpen(next);
        if (!isMobile) {
            localStorage.setItem("sidebarOpen", next);
        }
    }

    return (
        <div className="min-h-screen bg-slate-50">
            {/* Overlay (mobile only) */}
            {sidebarOpen && isMobile && (
                <div
                    onClick={() => setSidebarOpen(false)}
                    className="fixed inset-0 bg-black/40 z-40 md:hidden"
                />
            )}

            {/* Sidebar */}
            <Sidebar profile={profile} sidebarOpen={sidebarOpen} />

            {/* Header */}
            <Header
                profile={profile}
                sidebarOpen={sidebarOpen && !isMobile}
                isMobile={isMobile}
                onMenuClick={toggleSidebar}
            />

            {/* Main Content */}
            <main
                className="pt-16 min-h-screen transition-all duration-300"
                style={{ marginLeft: sidebarOpen && !isMobile ? "16rem" : "0" }}
            >
                <div className="p-4 sm:p-6 md:p-8 lg:p-10 max-w-[1400px] mx-auto space-y-6">
                    {children}
                </div>
            </main>
        </div>
    );
}