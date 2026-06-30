import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

import arCommon from './locales/ar/common.json';
import enCommon from './locales/en/common.json';

i18n
    .use(LanguageDetector)
    .use(initReactI18next)
    .init({
        resources: {
            ar: { common: arCommon },
            en: { common: enCommon },
        },
        defaultNS: 'common',
        fallbackLng: 'ar',
        interpolation: { escapeValue: false },
        detection: {
            // يحفظ اختيار المستخدم في localStorage تلقائياً
            order: ['localStorage', 'navigator'],
            caches: ['localStorage'],
        },
    });

// نضبط dir و lang على document عند أي تغيير في اللغة
i18n.on('languageChanged', (lng) => {
    document.documentElement.dir = lng === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.lang = lng;
});

// نشغّلها مرة أولى
document.documentElement.dir = i18n.language === 'ar' ? 'rtl' : 'ltr';
document.documentElement.lang = i18n.language;

export default i18n;