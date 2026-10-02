// Permit labels per country (indicative — breeders can override with custom labels).
export type CountryPermits = { name: string; p1: string; p2: string };

export const COUNTRY_PERMITS: Record<string, CountryPermits> = {
  // Sources: C. env. L.413-2/3 + Arrêté du 8 oct. 2018
  FR: { name: "🇫🇷 France", p1: "N° certificat de capacité (CDC)", p2: "N° autorisation d'ouverture d'établissement (AOE)" },
  // Wallonie: AGW 10/12/2020 (reptiles, liste positive) — Flandre/Bruxelles: régimes régionaux
  BE: { name: "🇧🇪 Belgique", p1: "N° d'agrément régional (élevage/détention reptiles)", p2: "N° d'entreprise (BCE/KBO)" },
  // TSchV art. 89 (autorisation) + art. 85/197 (compétences)
  CH: { name: "🇨🇭 Suisse", p1: "Autorisation cantonale de détention (OPAn art. 89)", p2: "Attestation de compétences (SKN/FBA)" },
  // TierSchG §11 + BArtSchV §7
  DE: { name: "🇩🇪 Deutschland", p1: "Erlaubnis nach § 11 TierSchG", p2: "Bestandsanzeige nach § 7 BArtSchV" },
  // TSchG §25 (Meldung) + §31 (Bewilligung gewerbliche Zucht)
  AT: { name: "🇦🇹 Österreich", p1: "Meldung Wildtierhaltung (§ 25 TSchG)", p2: "Bewilligung nach § 31 TSchG" },
  // Núcleo zoológico (autonómico) + Ley 7/2023
  ES: { name: "🇪🇸 España", p1: "N° registro núcleo zoológico", p2: "N° Registro de Protección Animal (Ley 7/2023)" },
  // L. 150/1992 + DM 8/1/2002
  IT: { name: "🇮🇹 Italia", p1: "Registro di detenzione CITES (DM 8/1/2002)", p2: "Autorizzazione Prefettura (L. 150/1992, specie pericolose)" },
  // Wet dieren; positieflijst reptielen nog in ontwikkeling
  NL: { name: "🇳🇱 Nederland", p1: "KvK-nummer", p2: "Vakbekwaamheidsbewijs (Besluit houders van dieren)" },
  // Ustawa o ochronie przyrody art. 64 + ustawa o gatunkach obcych
  PL: { name: "🇵🇱 Polska", p1: "Rejestracja okazów CITES (art. 64 UOP)", p2: "Zezwolenie GDOŚ (gatunki obce)" },
  // DL 121/2017 + Registo Nacional CITES (ICNF)
  PT: { name: "🇵🇹 Portugal", p1: "N° Registo Nacional CITES (ICNF)", p2: "Licença de detenção (DL 121/2017)" },
  // SI 2018/486 + Dangerous Wild Animals Act 1976
  GB: { name: "🇬🇧 United Kingdom", p1: "Animal Activities Licence (SI 2018/486)", p2: "Dangerous Wild Animal Licence (DWA 1976)" },
  // State law (ex. Florida FWC); no USDA licence for reptiles
  US: { name: "🇺🇸 United States", p1: "State captive wildlife permit (state & no.)", p2: "USFWS / CITES permit no." },
  // 52-ФЗ «О животном мире», ст. 24 (Росприроднадзор)
  RU: { name: "🇷🇺 Россия", p1: "Разрешение на содержание и разведение (Росприроднадзор)", p2: "Разрешение на оборот (52-ФЗ)" },
  // 野生动物保护法 (2022)
  CN: { name: "🇨🇳 中国", p1: "人工繁育许可证", p2: "经营利用许可证" },
  // 動物愛護管理法
  JP: { name: "🇯🇵 日本", p1: "第一種動物取扱業登録番号", p2: "特定動物飼養・保管許可番号" },
  // Permen LHK 15/2023 & 18/2024
  ID: { name: "🇮🇩 Indonesia", p1: "Izin Penangkaran (BKSDA)", p2: "Perizinan Berusaha Peredaran TSL" },
  // WPA 1972 + Living Animal Species Rules 2024 (PARIVESH)
  IN: { name: "🇮🇳 India", p1: "PARIVESH registration no. (LAS Rules 2024)", p2: "Certificate of ownership / licence (WPA 1972)" },
  // พ.ร.บ. สงวนและคุ้มครองสัตว์ป่า พ.ศ. 2562
  TH: { name: "🇹🇭 ประเทศไทย", p1: "ใบอนุญาตเพาะพันธุ์สัตว์ป่าคุ้มครอง (สป.ม.28)", p2: "ใบอนุญาตครอบครอง (สป.ม.18)" },
  OTHER: { name: "🌍 Autre pays", p1: "Autorisation 1", p2: "Autorisation 2" },
};

export const permitLabels = (country?: string | null, l1?: string | null, l2?: string | null) => {
  const c = COUNTRY_PERMITS[country || "FR"] || COUNTRY_PERMITS.FR;
  return { p1: l1?.trim() || c.p1, p2: l2?.trim() || c.p2 };
};
