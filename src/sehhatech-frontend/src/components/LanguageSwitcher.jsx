import { useTranslation } from "react-i18next";

/**
 * زرار تبديل اللغة — استخدمه في Header أو أي مكان تاني
 * className prop اختياري عشان تتحكم في الشكل من بره
 */
export default function LanguageSwitcher({ className = "" }) {
    const { i18n } = useTranslation();
    const isAr = i18n.language === "ar";

    const toggle = () => {
        i18n.changeLanguage(isAr ? "en" : "ar");
    };

    return (
        <button
            onClick={toggle}
            title={isAr ? "Switch to English" : "التبديل للعربية"}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold border border-slate-200 hover:bg-slate-100 transition-colors duration-200 ${className}`}
        >
            <span className="material-symbols-outlined text-[16px]">translate</span>
            {isAr ? "EN" : "عربي"}
        </button>
    );
}