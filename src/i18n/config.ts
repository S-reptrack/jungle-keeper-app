import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import fr from './locales/fr.json';
import en from './locales/en.json';
import es from './locales/es.json';
import de from './locales/de.json';
import pt from './locales/pt.json';
import nl from './locales/nl.json';
import pl from './locales/pl.json';
import ja from './locales/ja.json';
import zh from './locales/zh.json';

export const languages = [
  { code: 'fr', name: 'Français', flag: '🇫🇷' },
  { code: 'en', name: 'English', flag: '🇬🇧' },
  { code: 'es', name: 'Español', flag: '🇪🇸' },
  { code: 'de', name: 'Deutsch', flag: '🇩🇪' },
  { code: 'pt', name: 'Português', flag: '🇵🇹' },
  { code: 'nl', name: 'Nederlands', flag: '🇳🇱' },
  { code: 'pl', name: 'Polski', flag: '🇵🇱' },
  { code: 'ja', name: '日本語', flag: '🇯🇵' },
  { code: 'zh', name: '简体中文', flag: '🇨🇳' },
];

import { detectLanguageFromIP } from './detectLanguage';

// Get saved language from localStorage
const savedLanguage = localStorage.getItem('language');

i18n
  .use(initReactI18next)
  .init({
    resources: {
      fr: { translation: fr },
      en: { translation: en },
      es: { translation: es },
      de: { translation: de },
      pt: { translation: pt },
      nl: { translation: nl },
      pl: { translation: pl },
      ja: { translation: ja },
      zh: { translation: zh },
    },
    lng: savedLanguage || 'en',
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false,
    },
  });

// Save language to localStorage whenever it changes
i18n.on('languageChanged', (lng) => {
  localStorage.setItem('language', lng);
});

// Auto-detect language from IP on first visit only
if (!savedLanguage) {
  detectLanguageFromIP().then((lang) => {
    if (lang && lang !== i18n.language) {
      i18n.changeLanguage(lang);
    }
  });
}

export default i18n;
