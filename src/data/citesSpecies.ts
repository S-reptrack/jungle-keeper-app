export interface ReptileSpecies {
  id: string;
  scientificName: string;
  commonName: string;
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
    commonName: 'Python birman / Burmese Python',
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
    commonName: 'Python royal / Ball Python',
    category: 'snake',
    citesAnnex: 'B',
    morphs: ['Normal', 'Albino T-', 'Albino T+', 'Candy', 'Lavender Albino', 'Toffee Belly', 'Ultramel', 'Hypo', 'Ghost (Fantôme)', 'Pastel', 'Mojave', 'Banana', 'Clown', 'Piebald', 'Enchi', 'Spider', 'Cinnamon', 'Black Pastel', 'Butter', 'Lesser', 'Pinstripe', 'Fire', 'Champagne', 'Chocolate', 'GHI', 'Orange Dream', 'Pewter', 'Woma', 'Yellowbelly', 'Axanthic', 'Caramel'],
  },
  {
    id: 'python-molurus',
    scientificName: 'Python molurus',
    commonName: 'Python molure / Burmese Python',
    category: 'snake',
    citesAnnex: 'B',
  },
  {
    id: 'morelia-spilota',
    scientificName: 'Morelia spilota',
    commonName: 'Python tapis / Carpet Python',
    category: 'snake',
    citesAnnex: 'B',
    morphs: ['Normal', 'Jungle', 'Jaguar', 'Granite', 'Zebra', 'Axanthic', 'Caramel', 'Albino T-', 'Albino T+', 'Hypo', 'Tiger'],
  },
  {
    id: 'boa-constrictor',
    scientificName: 'Boa constrictor',
    commonName: 'Boa constricteur / Boa Constrictor',
    category: 'snake',
    citesAnnex: 'B',
    morphs: ['Normal', 'Fire', 'Super Fire', 'Blood', 'Aztec', 'Leopard', 'Motley', 'Eclipse', 'Jungle', 'Anery (Anerythristic)', 'Albino T-', 'Albino T+', 'Kahl Albino', 'Hypo (Hypomelanistic)', 'Ghost', 'Jungle Boa', 'Caramel', 'Paradigm', 'Snow', 'Snowglow', 'Sunglow', 'Arabesque', 'IMG (Increased Melanism Gene)', 'Pastel', 'VPI (VPI T+)', 'Key West', 'Sharp', 'Axanthic', 'Black Stripe'],
  },
  {
    id: 'boa-imperator',
    scientificName: 'Boa imperator',
    commonName: 'Boa imperator / Common Boa',
    category: 'snake',
    citesAnnex: 'B',
    morphs: ['Normal', 'Fire', 'Super Fire', 'Blood', 'Aztec', 'Leopard', 'Motley', 'Eclipse', 'Jungle', 'Anery (Anerythristic)', 'Albino T-', 'Albino T+', 'Kahl Albino', 'Hypo (Hypomelanistic)', 'Ghost', 'Jungle Boa', 'Caramel', 'Paradigm', 'Snow', 'Snowglow', 'Sunglow', 'Salmon', 'Arabesque', 'IMG (Increased Melanism Gene)', 'Pastel', 'VPI (VPI T+)', 'Key West', 'Axanthic', 'Black Stripe'],
  },
  {
    id: 'epicrates-cenchria',
    scientificName: 'Epicrates cenchria',
    commonName: 'Boa arc-en-ciel / Rainbow Boa',
    category: 'snake',
    citesAnnex: 'B',
  },
  {
    id: 'eunectes-notaeus',
    scientificName: 'Eunectes notaeus',
    commonName: 'Anaconda jaune / Yellow Anaconda',
    category: 'snake',
    citesAnnex: 'B',
  },
  {
    id: 'pantherophis-guttatus',
    scientificName: 'Pantherophis guttatus',
    commonName: 'Serpent des blés / Corn Snake',
    category: 'snake',
    citesAnnex: 'B',
    morphs: ['Normal', 'Amelanistic (Albino)', 'Anerythristic Type A', 'Anerythristic Type B', 'Hypo', 'Ghost', 'Blizzard', 'Charcoal', 'Lavender', 'Butter', 'Caramel', 'Snow', 'Bloodred', 'Okeetee', 'Miami', 'Crimson', 'Palmetto', 'Tessera', 'Sunkissed', 'Diffused'],
  },
  {
    id: 'morelia-viridis',
    scientificName: 'Morelia viridis',
    commonName: 'Python vert / Green Tree Python',
    category: 'snake',
    citesAnnex: 'B',
    morphs: ['Normal', 'High Yellow', 'High Blue', 'Sorong', 'Biak', 'Aru', 'Jayapura', 'Merauke', 'Calico', 'Axanthic', 'Albino T+', 'Piebald'],
  },
  {
    id: 'pituophis-catenifer',
    scientificName: 'Pituophis catenifer',
    commonName: 'Couleuvre à nez mince / Gopher Snake',
    category: 'snake',
    citesAnnex: 'B',
    morphs: ['Normal', 'Albino T-', 'Albino T+', 'Snow', 'Axanthic', 'Hypo', 'Patternless', 'Piebald'],
  },
  {
    id: 'gonyosoma-oxycephalum',
    scientificName: 'Gonyosoma oxycephalum',
    commonName: 'Couleuvre à queue rouge / Red-tailed Racer',
    category: 'snake',
    citesAnnex: 'B',
    morphs: ['Normal', 'Albino T-', 'Albino T+', 'Tricolor', 'Axanthic'],
  },
  {
    id: 'candoia-aspera',
    scientificName: 'Candoia aspera',
    commonName: 'Boa de Nouvelle-Guinée / Viper Boa (Bongersmai)',
    category: 'snake',
    citesAnnex: 'B',
    morphs: ['Normal', 'Patternless', 'Striped', 'Hypomelanistic'],
  },
  {
    id: 'lampropeltis-triangulum',
    scientificName: 'Lampropeltis triangulum',
    commonName: 'Serpent-roi écarlate / Milk Snake',
    category: 'snake',
    citesAnnex: 'B',
  },
];

// CITES Annexe C - Espèces listées par un pays demandeur (équivalent CITES Annexe III)
// Notification requise pour le commerce
export const citesAnnexCSpecies: ReptileSpecies[] = [
  // À compléter selon les besoins
];

// CITES Annexe D - Espèces non CITES mais sous surveillance
// Déclaration requise pour les importations
export const citesAnnexDSpecies: ReptileSpecies[] = [
  // À compléter selon les besoins
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
