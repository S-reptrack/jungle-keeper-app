export interface ReptileSpecies {
  id: string;
  scientificName: string;
  commonNameKey: string; // Changed to translation key
  category: 'snake' | 'lizard' | 'turtle';
  morphs?: string[];
  citesAnnex?: 'A' | 'B' | 'C' | 'D';
}

// CITES Annexe A - Espèces les plus menacées (équivalent CITES Annexe I)
// Commerce strictement interdit sauf exceptions
export const citesAnnexASpecies: ReptileSpecies[] = [
  {
    id: 'python-molurus-bivittatus',
    scientificName: 'Python molurus bivittatus',
    commonNameKey: 'species.python-molurus-bivittatus',
    category: 'snake',
    citesAnnex: 'A',
  },
  {
    id: 'boa-constrictor-occidentalis',
    scientificName: 'Boa constrictor occidentalis',
    commonNameKey: 'species.boa-constrictor-occidentalis',
    category: 'snake',
    citesAnnex: 'A',
  },
  {
    id: 'acrantophis',
    scientificName: 'Acrantophis spp.',
    commonNameKey: 'species.acrantophis',
    category: 'snake',
    citesAnnex: 'A',
  },
  {
    id: 'sanzinia-madagascariensis',
    scientificName: 'Sanzinia madagascariensis',
    commonNameKey: 'species.sanzinia-madagascariensis',
    category: 'snake',
    citesAnnex: 'A',
  },
  {
    id: 'epicrates-inornatus',
    scientificName: 'Epicrates inornatus',
    commonNameKey: 'species.epicrates-inornatus',
    category: 'snake',
    citesAnnex: 'A',
  },
  {
    id: 'epicrates-monensis',
    scientificName: 'Epicrates monensis',
    commonNameKey: 'species.epicrates-monensis',
    category: 'snake',
    citesAnnex: 'A',
  },
  {
    id: 'epicrates-subflavus',
    scientificName: 'Epicrates subflavus',
    commonNameKey: 'species.epicrates-subflavus',
    category: 'snake',
    citesAnnex: 'A',
  },
];

// CITES Annexe B - Espèces non menacées mais surveillées (équivalent CITES Annexe II)
// Commerce autorisé avec permis CITES
export const citesAnnexBSpecies: ReptileSpecies[] = [
  // Serpents (Snakes)
  {
    id: 'python-regius',
    scientificName: 'Python regius',
    commonNameKey: 'species.python-regius',
    category: 'snake',
    citesAnnex: 'B',
    morphs: ['Normal', 'Albino T-', 'Albino T+', 'Candy', 'Lavender Albino', 'Toffee Belly', 'Ultramel', 'Hypo', 'Ghost (Fantôme)', 'Pastel', 'Mojave', 'Banana', 'Clown', 'Piebald', 'Enchi', 'Spider', 'Cinnamon', 'Black Pastel', 'Butter', 'Lesser', 'Pinstripe', 'Fire', 'Champagne', 'Chocolate', 'GHI', 'Orange Dream', 'Pewter', 'Woma', 'Yellowbelly', 'Axanthic', 'Caramel'],
  },
  {
    id: 'python-molurus',
    scientificName: 'Python molurus',
    commonNameKey: 'species.python-molurus',
    category: 'snake',
    citesAnnex: 'B',
  },
  {
    id: 'morelia-spilota',
    scientificName: 'Morelia spilota',
    commonNameKey: 'species.morelia-spilota',
    category: 'snake',
    citesAnnex: 'B',
    morphs: ['Normal', 'Jungle', 'Jaguar', 'Granite', 'Zebra', 'Axanthic', 'Caramel', 'Albino T-', 'Albino T+', 'Hypo', 'Tiger'],
  },
  {
    id: 'morelia-spilota-cheynei',
    scientificName: 'Morelia spilota cheynei',
    commonNameKey: 'species.morelia-spilota-cheynei',
    category: 'snake',
    citesAnnex: 'B',
    morphs: ['Normal', 'Jaguar', 'Zebra', 'Tiger', 'Axanthic', 'Caramel', 'Albino T-'],
  },
  {
    id: 'morelia-spilota-mcdowelli',
    scientificName: 'Morelia spilota mcdowelli',
    commonNameKey: 'species.morelia-spilota-mcdowelli',
    category: 'snake',
    citesAnnex: 'B',
    morphs: ['Normal', 'Jaguar', 'Granite', 'Axanthic', 'Caramel', 'Albino T-', 'Hypo'],
  },
  {
    id: 'morelia-bredli',
    scientificName: 'Morelia bredli',
    commonNameKey: 'species.morelia-bredli',
    category: 'snake',
    citesAnnex: 'B',
    morphs: ['Normal', 'Hypo', 'Axanthic', 'Albino T-', 'Caramel'],
  },
  {
    id: 'morelia-carinata',
    scientificName: 'Morelia carinata',
    commonNameKey: 'species.morelia-carinata',
    category: 'snake',
    citesAnnex: 'B',
  },
  {
    id: 'morelia-amethistina',
    scientificName: 'Morelia amethistina',
    commonNameKey: 'species.morelia-amethistina',
    category: 'snake',
    citesAnnex: 'B',
    morphs: ['Normal', 'Hypo'],
  },
  {
    id: 'morelia-boeleni',
    scientificName: 'Morelia boeleni',
    commonNameKey: 'species.morelia-boeleni',
    category: 'snake',
    citesAnnex: 'B',
  },
  {
    id: 'morelia-oenpelliensis',
    scientificName: 'Morelia oenpelliensis',
    commonNameKey: 'species.morelia-oenpelliensis',
    category: 'snake',
    citesAnnex: 'B',
  },
  {
    id: 'boa-constrictor',
    scientificName: 'Boa constrictor',
    commonNameKey: 'species.boa-constrictor',
    category: 'snake',
    citesAnnex: 'B',
    morphs: ['Normal', 'Fire', 'Super Fire', 'Blood', 'Aztec', 'Leopard', 'Motley', 'Eclipse', 'Jungle', 'Anery (Anerythristic)', 'Albino T-', 'Albino T+', 'Kahl Albino', 'Hypo (Hypomelanistic)', 'Ghost', 'Jungle Boa', 'Caramel', 'Paradigm', 'Snow', 'Snowglow', 'Sunglow', 'Arabesque', 'IMG (Increased Melanism Gene)', 'Pastel', 'VPI (VPI T+)', 'Key West', 'Sharp', 'Axanthic', 'Black Stripe'],
  },
  {
    id: 'boa-imperator',
    scientificName: 'Boa imperator',
    commonNameKey: 'species.boa-imperator',
    category: 'snake',
    citesAnnex: 'B',
    morphs: ['Normal', 'Fire', 'Super Fire', 'Blood', 'Aztec', 'Leopard', 'Motley', 'Eclipse', 'Jungle', 'Anery (Anerythristic)', 'Albino T-', 'Albino T+', 'Kahl Albino', 'Hypo (Hypomelanistic)', 'Ghost', 'Jungle Boa', 'Caramel', 'Paradigm', 'Snow', 'Snowglow', 'Sunglow', 'Salmon', 'Arabesque', 'IMG (Increased Melanism Gene)', 'Pastel', 'VPI (VPI T+)', 'Key West', 'Axanthic', 'Black Stripe'],
  },
  {
    id: 'epicrates-cenchria',
    scientificName: 'Epicrates cenchria',
    commonNameKey: 'species.epicrates-cenchria',
    category: 'snake',
    citesAnnex: 'B',
  },
  {
    id: 'corallus-caninus',
    scientificName: 'Corallus caninus',
    commonNameKey: 'species.corallus-caninus',
    category: 'snake',
    citesAnnex: 'B',
    morphs: ['Normal', 'High Yellow', 'Yellow', 'Red', 'Orange'],
  },
  {
    id: 'corallus-hortulanus',
    scientificName: 'Corallus hortulanus',
    commonNameKey: 'species.corallus-hortulanus',
    category: 'snake',
    citesAnnex: 'B',
    morphs: ['Normal', 'Garden Phase', 'Colored Phase'],
  },
  {
    id: 'corallus-batesii',
    scientificName: 'Corallus batesii',
    commonNameKey: 'species.corallus-batesii',
    category: 'snake',
    citesAnnex: 'B',
  },
  {
    id: 'eunectes-notaeus',
    scientificName: 'Eunectes notaeus',
    commonNameKey: 'species.eunectes-notaeus',
    category: 'snake',
    citesAnnex: 'B',
  },
  {
    id: 'pantherophis-guttatus',
    scientificName: 'Pantherophis guttatus',
    commonNameKey: 'species.pantherophis-guttatus',
    category: 'snake',
    citesAnnex: 'B',
    morphs: ['Normal', 'Amelanistic (Albino)', 'Anerythristic Type A', 'Anerythristic Type B', 'Hypo', 'Ghost', 'Blizzard', 'Charcoal', 'Lavender', 'Butter', 'Caramel', 'Snow', 'Bloodred', 'Okeetee', 'Miami', 'Crimson', 'Palmetto', 'Tessera', 'Sunkissed', 'Diffused'],
  },
  {
    id: 'morelia-viridis',
    scientificName: 'Morelia viridis',
    commonNameKey: 'species.morelia-viridis',
    category: 'snake',
    citesAnnex: 'B',
    morphs: ['Normal', 'High Yellow', 'High Blue', 'Sorong', 'Biak', 'Aru', 'Jayapura', 'Merauke', 'Calico', 'Axanthic', 'Albino T+', 'Piebald'],
  },
  {
    id: 'pituophis-catenifer',
    scientificName: 'Pituophis catenifer',
    commonNameKey: 'species.pituophis-catenifer',
    category: 'snake',
    citesAnnex: 'B',
    morphs: ['Normal', 'Albino T-', 'Albino T+', 'Snow', 'Axanthic', 'Hypo', 'Patternless', 'Piebald'],
  },
  {
    id: 'pituophis-catenifer-sayi',
    scientificName: 'Pituophis catenifer sayi',
    commonNameKey: 'species.pituophis-catenifer-sayi',
    category: 'snake',
    citesAnnex: 'B',
    morphs: ['Normal', 'Albino T-', 'Albino T+', 'Snow', 'Axanthic', 'Hypo', 'Patternless', 'Leucistic', 'White Sided'],
  },
  {
    id: 'pituophis-catenifer-affinis',
    scientificName: 'Pituophis catenifer affinis',
    commonNameKey: 'species.pituophis-catenifer-affinis',
    category: 'snake',
    citesAnnex: 'B',
    morphs: ['Normal', 'Albino T-', 'Albino T+', 'Axanthic', 'Hypo'],
  },
  {
    id: 'pituophis-melanoleucus',
    scientificName: 'Pituophis melanoleucus',
    commonNameKey: 'species.pituophis-melanoleucus',
    category: 'snake',
    citesAnnex: 'B',
    morphs: ['Normal', 'Albino T-', 'Albino T+', 'Axanthic', 'Hypo', 'Patternless', 'Snow'],
  },
  {
    id: 'pituophis-deppei',
    scientificName: 'Pituophis deppei',
    commonNameKey: 'species.pituophis-deppei',
    category: 'snake',
    citesAnnex: 'B',
    morphs: ['Normal', 'Albino T-', 'Hypo'],
  },
  {
    id: 'pituophis-lineaticollis',
    scientificName: 'Pituophis lineaticollis',
    commonNameKey: 'species.pituophis-lineaticollis',
    category: 'snake',
    citesAnnex: 'B',
    morphs: ['Normal', 'Albino T-'],
  },
  {
    id: 'gonyosoma-oxycephalum',
    scientificName: 'Gonyosoma oxycephalum',
    commonNameKey: 'species.gonyosoma-oxycephalum',
    category: 'snake',
    citesAnnex: 'B',
    morphs: ['Normal', 'Albino T-', 'Albino T+', 'Tricolor', 'Axanthic'],
  },
  {
    id: 'candoia-aspera',
    scientificName: 'Candoia aspera',
    commonNameKey: 'species.candoia-aspera',
    category: 'snake',
    citesAnnex: 'B',
    morphs: ['Normal', 'Patternless', 'Striped', 'Hypomelanistic'],
  },
  {
    id: 'lampropeltis-triangulum',
    scientificName: 'Lampropeltis triangulum',
    commonNameKey: 'species.lampropeltis-triangulum',
    category: 'snake',
    citesAnnex: 'B',
  },
];

// CITES Annexe C - Espèces listées par un pays demandeur (équivalent CITES Annexe III)
// Notification requise pour le commerce
export const citesAnnexCSpecies: ReptileSpecies[] = [
  {
    id: 'elaphe-climacophora',
    scientificName: 'Elaphe climacophora',
    commonNameKey: 'species.elaphe-climacophora',
    category: 'snake',
    citesAnnex: 'C',
    morphs: ['Normal', 'Albino T-', 'Blizzard'],
  },
  {
    id: 'nerodia-sipedon',
    scientificName: 'Nerodia sipedon',
    commonNameKey: 'species.nerodia-sipedon',
    category: 'snake',
    citesAnnex: 'C',
  },
  {
    id: 'thamnophis-sirtalis',
    scientificName: 'Thamnophis sirtalis',
    commonNameKey: 'species.thamnophis-sirtalis',
    category: 'snake',
    citesAnnex: 'C',
    morphs: ['Normal', 'Albino T-', 'Erythristic', 'Melanistic', 'Blue', 'Flame'],
  },
  {
    id: 'heterodon-nasicus',
    scientificName: 'Heterodon nasicus',
    commonNameKey: 'species.heterodon-nasicus',
    category: 'snake',
    citesAnnex: 'C',
    morphs: ['Normal', 'Albino T-', 'Anaconda', 'Arctic', 'Axanthic', 'Conda', 'Lavender', 'Snow', 'Toffee', 'Toxic'],
  },
];

// CITES Annexe D - Espèces non CITES mais sous surveillance
// Déclaration requise pour les importations
export const citesAnnexDSpecies: ReptileSpecies[] = [
  {
    id: 'lampropeltis-getula',
    scientificName: 'Lampropeltis getula',
    commonNameKey: 'species.lampropeltis-getula',
    category: 'snake',
    citesAnnex: 'D',
    morphs: ['Normal', 'Albino T-', 'Albino T+', 'Banana', 'Striped', 'Aberrant', 'Lavender', 'High White', 'Chocolate'],
  },
  {
    id: 'elaphe-obsoleta',
    scientificName: 'Pantherophis obsoletus',
    commonNameKey: 'species.elaphe-obsoleta',
    category: 'snake',
    citesAnnex: 'D',
    morphs: ['Normal', 'Leucistic', 'Albino T-', 'Hypomelanistic'],
  },
  {
    id: 'lampropeltis-californiae',
    scientificName: 'Lampropeltis californiae',
    commonNameKey: 'species.lampropeltis-californiae',
    category: 'snake',
    citesAnnex: 'D',
  },
  {
    id: 'thamnopis-proximus',
    scientificName: 'Thamnophis proximus',
    commonNameKey: 'species.thamnopis-proximus',
    category: 'snake',
    citesAnnex: 'D',
    morphs: ['Normal', 'Albino T-', 'Anerythristic', 'Flame'],
  },
  {
    id: 'lampropeltis-alterna',
    scientificName: 'Lampropeltis alterna',
    commonNameKey: 'species.lampropeltis-alterna',
    category: 'snake',
    citesAnnex: 'D',
    morphs: ['Normal', 'Albino T-', 'Blair\'s', 'Alterna'],
  },
];

export const getAllSpecies = () => {
  return [...citesAnnexASpecies, ...citesAnnexBSpecies, ...citesAnnexCSpecies, ...citesAnnexDSpecies];
};

export const getSpeciesByCategory = (category: 'snake' | 'lizard' | 'turtle') => {
  return getAllSpecies().filter(species => species.category === category);
};

export const getSpeciesByAnnex = (annex: 'A' | 'B' | 'C' | 'D') => {
  const allSpecies = getAllSpecies();
  return allSpecies.filter(s => s.citesAnnex === annex && s.category === 'snake');
};
