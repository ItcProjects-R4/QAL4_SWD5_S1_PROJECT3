import { useState, useEffect } from "react";
import { Outlet } from "react-router-dom";
import { useTranslation } from "react-i18next";
import ReceptionSidebar from "../../components/ReceptionSidebar";

export default function ReceptionLayout() {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const { i18n } = useTranslation("common");

    const [lang, setLang] = useState(i18n.language);

    useEffect(() => {
        const handler = (lng) => setLang(lng);
        i18n.on("languageChanged", handler);
        return () => i18n.off("languageChanged", handler);
    }, [i18n]);

    const isRtl = lang === "ar";

    return (
        <div className="flex min-h-screen w-full bg-[#f8f9ff]">
            <ReceptionSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

            {isRtl ? (
                <main className="w-full flex-1 min-w-0 lg:mr-[260px]">
                    <Outlet context={{ openSidebar: () => setSidebarOpen(true) }} />
                </main>
            ) : (
                <main className="w-full flex-1 min-w-0 lg:ml-[260px]">
                    <Outlet context={{ openSidebar: () => setSidebarOpen(true) }} />
                </main>
            )}
        </div>
    );
}