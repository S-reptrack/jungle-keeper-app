// Map country codes to app language codes
const countryToLanguage: Record<string, string> = {
  // French-speaking
  FR: 'fr', BE: 'fr', CH: 'fr', LU: 'fr', MC: 'fr',
  // French-speaking Africa
  SN: 'fr', CI: 'fr', ML: 'fr', BF: 'fr', NE: 'fr', TD: 'fr', GA: 'fr',
  CM: 'fr', CG: 'fr', CD: 'fr', MG: 'fr', DJ: 'fr', KM: 'fr', TG: 'fr',
  BJ: 'fr', GN: 'fr', RW: 'fr', BI: 'fr', CF: 'fr', MR: 'fr',
  // Spanish-speaking
  ES: 'es', MX: 'es', AR: 'es', CO: 'es', CL: 'es', PE: 'es', VE: 'es',
  EC: 'es', GT: 'es', CU: 'es', BO: 'es', DO: 'es', HN: 'es', PY: 'es',
  SV: 'es', NI: 'es', CR: 'es', PA: 'es', UY: 'es',
  // German-speaking
  DE: 'de', AT: 'de', LI: 'de',
  // Italian
  IT: 'it', SM: 'it',
  // Portuguese
  PT: 'pt', BR: 'pt', AO: 'pt', MZ: 'pt',
  // Dutch
  NL: 'nl', SR: 'nl',
  // Polish
  PL: 'pl',
  // Hindi/Indian languages
  IN: 'hi',
  // Thai
  TH: 'th',
  // Indonesian
  ID: 'id',
  // Russian
  RU: 'ru', BY: 'ru', KZ: 'ru', KG: 'ru',
  // Japanese
  JP: 'ja',
  // Chinese
  CN: 'zh', TW: 'zh', HK: 'zh',
  // English-speaking
  US: 'en', GB: 'en', CA: 'en', AU: 'en', NZ: 'en', IE: 'en',
  ZA: 'en', NG: 'en', GH: 'en', KE: 'en', TZ: 'en', UG: 'en',
  ZW: 'en', ZM: 'en', BW: 'en', NA: 'en', SG: 'en', PH: 'en',
};

export async function detectLanguageFromIP(): Promise<string | null> {
  try {
    const res = await fetch('https://ipapi.co/json/', { signal: AbortSignal.timeout(3000) });
    if (!res.ok) return null;
    const data = await res.json();
    const country = data?.country_code?.toUpperCase();
    if (!country) return null;
    return countryToLanguage[country] || 'en';
  } catch {
    return null;
  }
}
