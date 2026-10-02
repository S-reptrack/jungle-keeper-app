// Permit labels per country (indicative — breeders can override with custom labels).
export type CountryPermits = { name: string; p1: string; p2: string };

export const COUNTRY_PERMITS: Record<string, CountryPermits> = {
  FR: { name: "🇫🇷 France", p1: "N° certificat de capacité (CDC)", p2: "N° autorisation d'ouverture (AOE)" },
  BE: { name: "🇧🇪 Belgique", p1: "N° d'agrément (HK)", p2: "N° d'entreprise (BCE)" },
  CH: { name: "🇨🇭 Suisse", p1: "Autorisation cantonale de détention", p2: "Attestation de compétences" },
  DE: { name: "🇩🇪 Deutschland", p1: "Sachkundenachweis", p2: "Erlaubnis nach § 11 TierSchG" },
  AT: { name: "🇦🇹 Österreich", p1: "Meldung / Bewilligung (TSchG)", p2: "Sachkundenachweis" },
  ES: { name: "🇪🇸 España", p1: "N° registro núcleo zoológico", p2: "Autorización autonómica" },
  IT: { name: "🇮🇹 Italia", p1: "Autorizzazione alla detenzione", p2: "Codice registro allevamento" },
  NL: { name: "🇳🇱 Nederland", p1: "KvK-nummer", p2: "Vakbekwaamheidsbewijs" },
  PL: { name: "🇵🇱 Polska", p1: "Zezwolenie (RDOŚ / GDOŚ)", p2: "Wpis do rejestru starosty" },
  PT: { name: "🇵🇹 Portugal", p1: "Licença / registo ICNF", p2: "Autorização de detenção" },
  GB: { name: "🇬🇧 United Kingdom", p1: "Animal Activities Licence", p2: "Dangerous Wild Animal Licence" },
  US: { name: "🇺🇸 United States", p1: "State permit / license", p2: "USDA license" },
  RU: { name: "🇷🇺 Россия", p1: "Разрешение на содержание", p2: "Регистрационный номер" },
  CN: { name: "🇨🇳 中国", p1: "驯养繁殖许可证", p2: "经营利用许可证" },
  JP: { name: "🇯🇵 日本", p1: "特定動物飼養許可", p2: "第一種動物取扱業登録" },
  ID: { name: "🇮🇩 Indonesia", p1: "Izin penangkaran (BKSDA)", p2: "Nomor registrasi" },
  IN: { name: "🇮🇳 India", p1: "Wildlife permit / ownership certificate", p2: "Registration number" },
  TH: { name: "🇹🇭 ประเทศไทย", p1: "ใบอนุญาตเพาะพันธุ์", p2: "เลขทะเบียน" },
  OTHER: { name: "🌍 Autre pays", p1: "Autorisation 1", p2: "Autorisation 2" },
};

export const permitLabels = (country?: string | null, l1?: string | null, l2?: string | null) => {
  const c = COUNTRY_PERMITS[country || "FR"] || COUNTRY_PERMITS.FR;
  return { p1: l1?.trim() || c.p1, p2: l2?.trim() || c.p2 };
};
