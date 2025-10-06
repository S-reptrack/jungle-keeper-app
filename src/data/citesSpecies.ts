export interface ReptileSpecies {
  id: string;
  scientificName: string;
  commonName: string;
  category: 'snake' | 'lizard' | 'turtle';
  morphs?: string[];
}

export const citesAnnexIISpecies: ReptileSpecies[] = [
  // Serpents (Snakes)
  {
    id: 'python-regius',
    scientificName: 'Python regius',
    commonName: 'Python royal / Ball Python',
    category: 'snake',
    morphs: ['Normal', 'Albino', 'Hypo', 'Ghost (Fantôme)', 'Pastel', 'Mojave', 'Banana', 'Clown', 'Piebald', 'Enchi', 'Spider', 'Cinnamon', 'Black Pastel', 'Butter', 'Lesser', 'Pinstripe', 'Fire', 'Champagne', 'Chocolate', 'GHI', 'Orange Dream', 'Pewter', 'Woma', 'Yellowbelly'],
  },
  {
    id: 'python-molurus',
    scientificName: 'Python molurus',
    commonName: 'Python molure / Burmese Python',
    category: 'snake',
  },
  {
    id: 'morelia-spilota',
    scientificName: 'Morelia spilota',
    commonName: 'Python tapis / Carpet Python',
    category: 'snake',
    morphs: ['Normal', 'Jungle', 'Jaguar', 'Granite', 'Zebra', 'Axanthic', 'Caramel', 'Albino', 'Hypo', 'Tiger'],
  },
  {
    id: 'boa-constrictor',
    scientificName: 'Boa constrictor',
    commonName: 'Boa constricteur / Boa Constrictor',
    category: 'snake',
    morphs: ['Normal', 'Albino', 'Hypo', 'Ghost', 'Anery', 'Sunglow', 'Pastel', 'Jungle', 'Motley', 'IMG (Increased Melanin Gene)', 'Leopard', 'Blood', 'Sharp'],
  },
  {
    id: 'boa-imperator',
    scientificName: 'Boa imperator',
    commonName: 'Boa imperator / Common Boa',
    category: 'snake',
    morphs: ['Normal', 'Albino', 'Hypo', 'Motley', 'Jungle', 'Sunglow', 'Snow', 'Salmon', 'IMG', 'Pastel', 'Leopard'],
  },
  {
    id: 'epicrates-cenchria',
    scientificName: 'Epicrates cenchria',
    commonName: 'Boa arc-en-ciel / Rainbow Boa',
    category: 'snake',
  },
  {
    id: 'eunectes-notaeus',
    scientificName: 'Eunectes notaeus',
    commonName: 'Anaconda jaune / Yellow Anaconda',
    category: 'snake',
  },
  {
    id: 'pantherophis-guttatus',
    scientificName: 'Pantherophis guttatus',
    commonName: 'Serpent des blés / Corn Snake',
    category: 'snake',
    morphs: ['Normal', 'Amelanistic (Albino)', 'Anerythristic', 'Hypo', 'Ghost', 'Blizzard', 'Charcoal', 'Lavender', 'Butter', 'Caramel', 'Snow', 'Bloodred', 'Okeetee', 'Miami', 'Crimson', 'Palmetto', 'Tessera'],
  },
  {
    id: 'morelia-viridis',
    scientificName: 'Morelia viridis',
    commonName: 'Python vert / Green Tree Python',
    category: 'snake',
    morphs: ['Normal', 'High Yellow', 'High Blue', 'Sorong', 'Biak', 'Aru', 'Jayapura', 'Merauke', 'Calico', 'Axanthic'],
  },
  {
    id: 'pituophis-catenifer',
    scientificName: 'Pituophis catenifer',
    commonName: 'Couleuvre à nez mince / Gopher Snake',
    category: 'snake',
    morphs: ['Normal', 'Albino', 'Snow', 'Axanthic', 'Hypo', 'Patternless', 'Piebald'],
  },
  {
    id: 'gonyosoma-oxycephalum',
    scientificName: 'Gonyosoma oxycephalum',
    commonName: 'Couleuvre à queue rouge / Red-tailed Racer',
    category: 'snake',
    morphs: ['Normal', 'Albino', 'Tricolor'],
  },
  {
    id: 'candoia-aspera',
    scientificName: 'Candoia aspera',
    commonName: 'Boa de Nouvelle-Guinée / Viper Boa (Bongersmai)',
    category: 'snake',
    morphs: ['Normal', 'Patternless', 'Striped', 'Hypomelanistic'],
  },
  {
    id: 'lampropeltis-triangulum',
    scientificName: 'Lampropeltis triangulum',
    commonName: 'Serpent-roi écarlate / Milk Snake',
    category: 'snake',
  },

  // Lézards (Lizards)
  {
    id: 'pogona-vitticeps',
    scientificName: 'Pogona vitticeps',
    commonName: 'Dragon barbu / Bearded Dragon',
    category: 'lizard',
  },
  {
    id: 'varanus-exanthematicus',
    scientificName: 'Varanus exanthematicus',
    commonName: 'Varan des savanes / Savannah Monitor',
    category: 'lizard',
  },
  {
    id: 'varanus-niloticus',
    scientificName: 'Varanus niloticus',
    commonName: 'Varan du Nil / Nile Monitor',
    category: 'lizard',
  },
  {
    id: 'tiliqua-scincoides',
    scientificName: 'Tiliqua scincoides',
    commonName: 'Scinque à langue bleue / Blue-tongued Skink',
    category: 'lizard',
  },
  {
    id: 'physignathus-cocincinus',
    scientificName: 'Physignathus cocincinus',
    commonName: 'Dragon d\'eau chinois / Chinese Water Dragon',
    category: 'lizard',
  },
  {
    id: 'iguana-iguana',
    scientificName: 'Iguana iguana',
    commonName: 'Iguane vert / Green Iguana',
    category: 'lizard',
  },
  {
    id: 'uromastyx-aegyptia',
    scientificName: 'Uromastyx aegyptia',
    commonName: 'Fouette-queue égyptien / Egyptian Uromastyx',
    category: 'lizard',
  },
  {
    id: 'chamaeleo-calyptratus',
    scientificName: 'Chamaeleo calyptratus',
    commonName: 'Caméléon casqué du Yémen / Veiled Chameleon',
    category: 'lizard',
  },

  // Tortues (Turtles)
  {
    id: 'testudo-hermanni',
    scientificName: 'Testudo hermanni',
    commonName: 'Tortue d\'Hermann / Hermann\'s Tortoise',
    category: 'turtle',
  },
  {
    id: 'testudo-graeca',
    scientificName: 'Testudo graeca',
    commonName: 'Tortue grecque / Greek Tortoise',
    category: 'turtle',
  },
  {
    id: 'testudo-marginata',
    scientificName: 'Testudo marginata',
    commonName: 'Tortue bordée / Marginated Tortoise',
    category: 'turtle',
  },
  {
    id: 'geochelone-sulcata',
    scientificName: 'Centrochelys sulcata',
    commonName: 'Tortue sillonnée / Sulcata Tortoise',
    category: 'turtle',
  },
  {
    id: 'trachemys-scripta',
    scientificName: 'Trachemys scripta',
    commonName: 'Tortue de Floride / Red-eared Slider',
    category: 'turtle',
  },
  {
    id: 'chelonoidis-carbonarius',
    scientificName: 'Chelonoidis carbonarius',
    commonName: 'Tortue charbonnière / Red-footed Tortoise',
    category: 'turtle',
  },
  {
    id: 'stigmochelys-pardalis',
    scientificName: 'Stigmochelys pardalis',
    commonName: 'Tortue léopard / Leopard Tortoise',
    category: 'turtle',
  },
  {
    id: 'malacochersus-tornieri',
    scientificName: 'Malacochersus tornieri',
    commonName: 'Tortue crêpe / Pancake Tortoise',
    category: 'turtle',
  },
];

export const getSpeciesByCategory = (category: 'snake' | 'lizard' | 'turtle') => {
  return citesAnnexIISpecies.filter(species => species.category === category);
};
