export interface ReptileSpecies {
  id: string;
  scientificName: string;
  commonName: string;
  category: 'snake' | 'lizard' | 'turtle';
}

export const citesAnnexIISpecies: ReptileSpecies[] = [
  // Serpents (Snakes)
  {
    id: 'python-regius',
    scientificName: 'Python regius',
    commonName: 'Python royal / Ball Python',
    category: 'snake',
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
  },
  {
    id: 'boa-constrictor',
    scientificName: 'Boa constrictor',
    commonName: 'Boa constricteur / Boa Constrictor',
    category: 'snake',
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
