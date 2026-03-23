/**
 * Base de données des gènes/morphs par espèce avec leur mode d'hérédité.
 * Utilisé par le calculateur génétique de morphs.
 */

export type InheritanceMode = "dominant" | "codominant" | "recessive" | "incomplete_dominant";

export interface MorphGene {
  name: string;
  inheritance: InheritanceMode;
  superForm?: string; // Nom de la forme super/homozygote pour codominant
}

export interface SpeciesGenetics {
  species: string;
  commonName: string;
  category: "snake" | "lizard" | "turtle";
  genes: MorphGene[];
}

export const speciesGenetics: SpeciesGenetics[] = [
  // ========== PYTHON REGIUS (Ball Python) ==========
  {
    species: "Python regius",
    commonName: "Python royal",
    category: "snake",
    genes: [
      // Dominant
      { name: "Spider", inheritance: "dominant" },
      { name: "Pinstripe", inheritance: "dominant" },
      { name: "Woma", inheritance: "dominant" },
      { name: "Spotnose", inheritance: "dominant" },
      { name: "Calico", inheritance: "dominant" },
      { name: "Champagne", inheritance: "dominant" },
      { name: "Cypress", inheritance: "dominant" },
      { name: "Gravel", inheritance: "dominant" },
      // Codominant
      { name: "Pastel", inheritance: "codominant", superForm: "Super Pastel" },
      { name: "Mojave", inheritance: "codominant", superForm: "Blue Eyed Lucy" },
      { name: "Lesser", inheritance: "codominant", superForm: "Blue Eyed Lucy" },
      { name: "Butter", inheritance: "codominant", superForm: "Blue Eyed Lucy" },
      { name: "Fire", inheritance: "codominant", superForm: "Super Fire (Black Eyed Lucy)" },
      { name: "Vanilla", inheritance: "codominant", superForm: "Super Vanilla" },
      { name: "Yellow Belly", inheritance: "codominant", superForm: "Ivory" },
      { name: "Gravel", inheritance: "codominant", superForm: "Super Gravel" },
      { name: "Enchi", inheritance: "codominant", superForm: "Super Enchi" },
      { name: "Cinnamon", inheritance: "codominant", superForm: "Super Cinnamon (8-Ball)" },
      { name: "Black Pastel", inheritance: "codominant", superForm: "Super Black Pastel" },
      { name: "Bamboo", inheritance: "codominant", superForm: "Super Bamboo" },
      { name: "Phantom", inheritance: "codominant", superForm: "Super Phantom" },
      { name: "Mahogany", inheritance: "codominant", superForm: "Super Mahogany" },
      { name: "Russo", inheritance: "codominant", superForm: "Blue Eyed Lucy" },
      { name: "Mystic", inheritance: "codominant", superForm: "Mystic Potion" },
      { name: "Special", inheritance: "codominant", superForm: "Super Special" },
      { name: "Orange Dream", inheritance: "codominant", superForm: "Super OD" },
      { name: "Blade", inheritance: "codominant", superForm: "Super Blade" },
      { name: "Sulfur", inheritance: "codominant", superForm: "Super Sulfur" },
      { name: "Asphalt", inheritance: "codominant", superForm: "Super Asphalt" },
      { name: "Chocolate", inheritance: "codominant", superForm: "Super Chocolate" },
      // Récessif
      { name: "Albino", inheritance: "recessive" },
      { name: "Piebald", inheritance: "recessive" },
      { name: "Clown", inheritance: "recessive" },
      { name: "Axanthic (VPI)", inheritance: "recessive" },
      { name: "Axanthic (TSK)", inheritance: "recessive" },
      { name: "Axanthic (Jolliff)", inheritance: "recessive" },
      { name: "Lavender Albino", inheritance: "recessive" },
      { name: "Ultramel", inheritance: "recessive" },
      { name: "Desert Ghost", inheritance: "recessive" },
      { name: "Genetic Stripe", inheritance: "recessive" },
      { name: "Ghost (Hypo)", inheritance: "recessive" },
      { name: "Pied", inheritance: "recessive" },
      { name: "Sunset", inheritance: "recessive" },
      { name: "Candy", inheritance: "recessive" },
      { name: "Toffee", inheritance: "recessive" },
      { name: "Cryptic", inheritance: "recessive" },
      { name: "Puzzle", inheritance: "recessive" },
      { name: "Tri-Stripe", inheritance: "recessive" },
      { name: "Caramel Albino", inheritance: "recessive" },
      { name: "Orange Ghost", inheritance: "recessive" },
      { name: "Monsoon", inheritance: "recessive" },
    ],
  },

  // ========== BOA CONSTRICTOR ==========
  {
    species: "Boa constrictor",
    commonName: "Boa constricteur",
    category: "snake",
    genes: [
      // Codominant
      { name: "Hypo (Salmon)", inheritance: "codominant", superForm: "Super Salmon" },
      { name: "Jungle", inheritance: "codominant", superForm: "Super Jungle" },
      { name: "Motley", inheritance: "codominant", superForm: "Super Motley" },
      { name: "IMG (Increasing Melanin Gene)", inheritance: "codominant", superForm: "Super IMG" },
      // Récessif
      { name: "Albino (Kahl)", inheritance: "recessive" },
      { name: "Albino (Sharp)", inheritance: "recessive" },
      { name: "Anery (Type I)", inheritance: "recessive" },
      { name: "Anery (Type II)", inheritance: "recessive" },
      { name: "Blood", inheritance: "recessive" },
      { name: "Leopard", inheritance: "recessive" },
      { name: "VPI T+", inheritance: "recessive" },
      // Dominant
      { name: "Het Red", inheritance: "dominant" },
      { name: "Aztec", inheritance: "dominant" },
    ],
  },

  // ========== BOA IMPERATOR ==========
  {
    species: "Boa imperator",
    commonName: "Boa impérator",
    category: "snake",
    genes: [
      { name: "Hypo", inheritance: "codominant", superForm: "Super Hypo" },
      { name: "Jungle", inheritance: "codominant", superForm: "Super Jungle" },
      { name: "Motley", inheritance: "codominant", superForm: "Super Motley" },
      { name: "Albino (Kahl)", inheritance: "recessive" },
      { name: "Albino (Sharp)", inheritance: "recessive" },
      { name: "Anery", inheritance: "recessive" },
      { name: "Leopard", inheritance: "recessive" },
      { name: "Blood", inheritance: "recessive" },
    ],
  },

  // ========== PANTHEROPHIS GUTTATUS (Corn Snake) ==========
  {
    species: "Pantherophis guttatus",
    commonName: "Serpent des blés",
    category: "snake",
    genes: [
      // Récessif
      { name: "Amelanistic (Albino)", inheritance: "recessive" },
      { name: "Anerythristic", inheritance: "recessive" },
      { name: "Charcoal", inheritance: "recessive" },
      { name: "Caramel", inheritance: "recessive" },
      { name: "Diffused (Bloodred)", inheritance: "recessive" },
      { name: "Dilute", inheritance: "recessive" },
      { name: "Hypomelanistic", inheritance: "recessive" },
      { name: "Lavender", inheritance: "recessive" },
      { name: "Motley", inheritance: "recessive" },
      { name: "Stripe", inheritance: "recessive" },
      { name: "Sunkissed", inheritance: "recessive" },
      { name: "Strawberry", inheritance: "recessive" },
      { name: "Kastanie", inheritance: "recessive" },
      { name: "Lava", inheritance: "recessive" },
      { name: "Ultra", inheritance: "recessive" },
      { name: "Palmetto", inheritance: "recessive" },
      // Dominant
      { name: "Tessera", inheritance: "dominant" },
      { name: "Masque", inheritance: "dominant" },
    ],
  },

  // ========== LAMPROPELTIS (King Snake) ==========
  {
    species: "Lampropeltis",
    commonName: "Serpent roi",
    category: "snake",
    genes: [
      { name: "Albino", inheritance: "recessive" },
      { name: "Lavender", inheritance: "recessive" },
      { name: "Anery", inheritance: "recessive" },
      { name: "Hypo", inheritance: "recessive" },
      { name: "Striped", inheritance: "recessive" },
      { name: "Banana", inheritance: "codominant", superForm: "Super Banana" },
    ],
  },

  // ========== MORELIA SPILOTA (Carpet Python) ==========
  {
    species: "Morelia spilota",
    commonName: "Python tapis",
    category: "snake",
    genes: [
      { name: "Albino (Darwin)", inheritance: "recessive" },
      { name: "Axanthic", inheritance: "recessive" },
      { name: "Caramel", inheritance: "codominant", superForm: "Super Caramel" },
      { name: "Jaguar", inheritance: "codominant", superForm: "Super Jaguar" },
      { name: "Zebra", inheritance: "codominant", superForm: "Super Zebra" },
      { name: "Granite", inheritance: "recessive" },
    ],
  },

  // ========== MORELIA VIRIDIS (Green Tree Python) ==========
  {
    species: "Morelia viridis",
    commonName: "Python vert",
    category: "snake",
    genes: [
      { name: "Albino", inheritance: "recessive" },
      { name: "Blue (Axanthic)", inheritance: "recessive" },
      { name: "Mite Phase", inheritance: "codominant", superForm: "Super Mite Phase" },
    ],
  },

  // ========== PYTHON BIVITTATUS (Burmese Python) ==========
  {
    species: "Python bivittatus",
    commonName: "Python molure bivittatus",
    category: "snake",
    genes: [
      { name: "Albino", inheritance: "recessive" },
      { name: "Granite", inheritance: "codominant", superForm: "Super Granite" },
      { name: "Green", inheritance: "recessive" },
      { name: "Labyrinth", inheritance: "codominant", superForm: "Super Labyrinth" },
      { name: "Patternless", inheritance: "recessive" },
      { name: "Caramel", inheritance: "recessive" },
    ],
  },

  // ========== HETERODON NASICUS (Western Hognose) ==========
  {
    species: "Heterodon nasicus",
    commonName: "Serpent à groin",
    category: "snake",
    genes: [
      { name: "Albino", inheritance: "recessive" },
      { name: "Axanthic", inheritance: "recessive" },
      { name: "Anaconda", inheritance: "codominant", superForm: "Super Anaconda" },
      { name: "Toffee Belly", inheritance: "codominant", superForm: "Super Toffee" },
      { name: "Lavender", inheritance: "recessive" },
      { name: "Snow (Axanthic + Albino)", inheritance: "recessive" },
      { name: "Lemon Ghost", inheritance: "recessive" },
      { name: "Caramel", inheritance: "recessive" },
      { name: "Sable", inheritance: "recessive" },
      { name: "Dutch", inheritance: "recessive" },
      { name: "Pink Pastel", inheritance: "recessive" },
    ],
  },

  // ========== EUBLEPHARIS MACULARIUS (Leopard Gecko) ==========
  {
    species: "Eublepharis macularius",
    commonName: "Gecko léopard",
    category: "lizard",
    genes: [
      // Récessif
      { name: "Tremper Albino", inheritance: "recessive" },
      { name: "Bell Albino", inheritance: "recessive" },
      { name: "Rainwater Albino", inheritance: "recessive" },
      { name: "Eclipse", inheritance: "recessive" },
      { name: "Blizzard", inheritance: "recessive" },
      { name: "Patternless (Murphy)", inheritance: "recessive" },
      { name: "RAPTOR", inheritance: "recessive" },
      // Codominant
      { name: "Mack Snow", inheritance: "codominant", superForm: "Super Snow" },
      { name: "TUG Snow", inheritance: "codominant", superForm: "Super TUG Snow" },
      { name: "Giant", inheritance: "codominant", superForm: "Super Giant" },
      // Dominant / Polygenic
      { name: "Tangerine", inheritance: "dominant" },
      { name: "Carrot Tail", inheritance: "dominant" },
      { name: "Bold Stripe", inheritance: "dominant" },
      { name: "Jungle", inheritance: "dominant" },
      { name: "High Yellow", inheritance: "dominant" },
      { name: "Enigma", inheritance: "dominant" },
      { name: "White & Yellow (W&Y)", inheritance: "dominant" },
    ],
  },

  // ========== CORRELOPHUS CILIATUS (Crested Gecko) ==========
  {
    species: "Correlophus ciliatus",
    commonName: "Gecko à crête",
    category: "lizard",
    genes: [
      { name: "Lilly White", inheritance: "codominant", superForm: "Super Lilly White" },
      { name: "Axanthic", inheritance: "recessive" },
      // Polygéniques (traités comme dominant pour simplifier)
      { name: "Dalmatian", inheritance: "dominant" },
      { name: "Harlequin", inheritance: "dominant" },
      { name: "Pinstripe", inheritance: "dominant" },
      { name: "Flame", inheritance: "dominant" },
      { name: "Tiger", inheritance: "dominant" },
      { name: "Phantom", inheritance: "dominant" },
      { name: "Tricolor", inheritance: "dominant" },
    ],
  },

  // ========== POGONA VITTICEPS (Bearded Dragon) ==========
  {
    species: "Pogona vitticeps",
    commonName: "Dragon barbu",
    category: "lizard",
    genes: [
      // Récessif
      { name: "Hypo (Hypomelanistic)", inheritance: "recessive" },
      { name: "Trans (Translucent)", inheritance: "codominant", superForm: "Super Trans" },
      { name: "Witblits", inheritance: "recessive" },
      { name: "Zero", inheritance: "recessive" },
      { name: "Dunner", inheritance: "dominant" },
      { name: "Silkback", inheritance: "codominant", superForm: "Silkback (homozygote)" },
      { name: "Leatherback", inheritance: "codominant", superForm: "Silkback" },
      // Dominant / Polygenic
      { name: "Red", inheritance: "dominant" },
      { name: "Orange", inheritance: "dominant" },
      { name: "Citrus", inheritance: "dominant" },
      { name: "Tiger", inheritance: "dominant" },
    ],
  },

  // ========== CHAMAELEO CALYPTRATUS (Veiled Chameleon) ==========
  {
    species: "Chamaeleo calyptratus",
    commonName: "Caméléon casqué",
    category: "lizard",
    genes: [
      { name: "Translucent", inheritance: "recessive" },
      { name: "Piebald", inheritance: "recessive" },
    ],
  },

  // ========== FURCIFER PARDALIS (Panther Chameleon) ==========
  {
    species: "Furcifer pardalis",
    commonName: "Caméléon panthère",
    category: "lizard",
    genes: [
      // Les locales sont polygéniques
      { name: "Ambilobe", inheritance: "dominant" },
      { name: "Nosy Be", inheritance: "dominant" },
      { name: "Ambanja", inheritance: "dominant" },
      { name: "Tamatave", inheritance: "dominant" },
      { name: "Sambava", inheritance: "dominant" },
      { name: "Diego Suarez", inheritance: "dominant" },
    ],
  },

  // ========== PYTHON RETICULATUS ==========
  {
    species: "Python reticulatus",
    commonName: "Python réticulé",
    category: "snake",
    genes: [
      { name: "Albino (Lavender)", inheritance: "recessive" },
      { name: "Albino (Purple)", inheritance: "recessive" },
      { name: "Albino (White)", inheritance: "recessive" },
      { name: "Anthrax", inheritance: "recessive" },
      { name: "Anery", inheritance: "recessive" },
      { name: "Clark Strain", inheritance: "recessive" },
      { name: "Genetic Stripe", inheritance: "codominant", superForm: "Super Stripe" },
      { name: "Golden Child", inheritance: "codominant", superForm: "Super Golden Child" },
      { name: "Motley", inheritance: "codominant", superForm: "Super Motley" },
      { name: "Phantom", inheritance: "codominant", superForm: "Super Phantom" },
      { name: "Tiger", inheritance: "codominant", superForm: "Super Tiger" },
      { name: "Sunfire", inheritance: "dominant" },
    ],
  },

  // ========== TILIQUA SCINCOIDES (Blue Tongue Skink) ==========
  {
    species: "Tiliqua scincoides",
    commonName: "Scinque à langue bleue",
    category: "lizard",
    genes: [
      { name: "Albino (T-)", inheritance: "recessive" },
      { name: "Axanthic", inheritance: "recessive" },
      { name: "Hyper", inheritance: "codominant", superForm: "Super Hyper" },
    ],
  },

  // ========== VARANUS (Monitor Lizards) ==========
  {
    species: "Varanus acanthurus",
    commonName: "Varan à queue épineuse",
    category: "lizard",
    genes: [
      { name: "Hypo", inheritance: "recessive" },
      { name: "Albino", inheritance: "recessive" },
    ],
  },

  // ========== CROTALUS (Rattlesnakes) ==========
  {
    species: "Crotalus atrox",
    commonName: "Crotale diamantin",
    category: "snake",
    genes: [
      { name: "Albino", inheritance: "recessive" },
      { name: "Axanthic", inheritance: "recessive" },
      { name: "Patternless", inheritance: "recessive" },
    ],
  },

  // ========== TESTUDO HERMANNI ==========
  {
    species: "Testudo hermanni",
    commonName: "Tortue d'Hermann",
    category: "turtle",
    genes: [
      { name: "Albino", inheritance: "recessive" },
      { name: "Leucistic", inheritance: "recessive" },
    ],
  },

  // ========== CENTROCHELYS SULCATA ==========
  {
    species: "Centrochelys sulcata",
    commonName: "Tortue sillonnée",
    category: "turtle",
    genes: [
      { name: "Ivory", inheritance: "recessive" },
      { name: "Albino", inheritance: "recessive" },
    ],
  },
];

/**
 * Recherche les données génétiques d'une espèce par son nom (exact ou partiel).
 */
export function findSpeciesGenetics(speciesName: string): SpeciesGenetics | null {
  const normalized = speciesName.toLowerCase().trim();
  
  // Exact match first
  const exact = speciesGenetics.find(s => s.species.toLowerCase() === normalized);
  if (exact) return exact;
  
  // Partial match
  const partial = speciesGenetics.find(s => 
    normalized.includes(s.species.toLowerCase()) || 
    s.species.toLowerCase().includes(normalized)
  );
  return partial || null;
}

/**
 * Retourne toutes les espèces disponibles dans la base génétique.
 */
export function getAvailableSpecies(): { species: string; commonName: string; category: string }[] {
  return speciesGenetics.map(s => ({
    species: s.species,
    commonName: s.commonName,
    category: s.category,
  }));
}
