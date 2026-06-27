import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import en from './locales/en/translation.json'
import ar from './locales/ar/translation.json'

const savedLang = localStorage.getItem('pp_lang') || 'en'

// Set initial dir/lang before React mounts
document.documentElement.lang = savedLang
document.documentElement.dir = savedLang === 'ar' ? 'rtl' : 'ltr'

i18n
    .use(initReactI18next)
    .init({
        resources: {
            en: { translation: en },
            ar: { translation: ar },
        },
        lng: savedLang,
        fallbackLng: 'en',
        interpolation: { escapeValue: false },
    })

i18n.on('languageChanged', (lng) => {
    localStorage.setItem('pp_lang', lng)
    document.documentElement.lang = lng
    document.documentElement.dir = lng === 'ar' ? 'rtl' : 'ltr'
})

export default i18n