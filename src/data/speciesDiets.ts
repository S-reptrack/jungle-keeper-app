/**
 * Mapping des régimes alimentaires par espèce.
 * Chaque espèce est associée aux types d'aliments qui font partie de son régime naturel.
 * Le matching se fait par pattern (début du nom scientifique normalisé).
 */

export type FoodType = 
  | "rat" | "mouse" | "rabbit" 
  | "insect" | "vegetable" | "fruit" | "pellet"
  | "fish" | "crustacean" | "wholePrey";

export interface DietProfile {
  patterns: string[]; // Patterns to match against species name (lowercased, normalized)
  allowedFoods: FoodType[];
  label: string; // For debugging/documentation
}

/**
 * Diet profiles grouped by feeding strategy.
 * Order matters: first match wins.
 */
export const dietProfiles: DietProfile[] = [
  // ========== SERPENTS ==========
  // Grands constricteurs (pythons, boas) - rongeurs + lapins
  {
    label: "Grands constricteurs",
    patterns: [
      "python molurus", "python bivittatus", "python reticulatus", "python sebae",
      "python natalensis", "boa constrictor", "eunectes", "morelia amethistina",
      "morelia oenpelliensis", "simalia"
    ],
    allowedFoods: ["rat", "mouse", "rabbit"],
  },
  // Pythons et boas moyens - rongeurs uniquement
  {
    label: "Serpents constricteurs moyens",
    patterns: [
      "python regius", "python brongersmai", "python curtus", "python breitensteini",
      "morelia spilota", "morelia viridis", "morelia cheynei",
      "boa imperator", "boa constrictor occidentalis",
      "acrantophis", "sanzinia", "epicrates", "corallus",
      "antaresia", "aspidites", "liasis", "bothrochilus",
      "candoia", "lichanura", "eryx", "gongylophis", "calabaria",
      "chilabothrus", "python timoriensis",
    ],
    allowedFoods: ["rat", "mouse", "rabbit"],
  },
  // Serpents colubridés et petits serpents
  {
    label: "Colubridés et petits serpents",
    patterns: [
      "pantherophis", "lampropeltis", "elaphe", "pituophis",
      "heterodon", "drymarchon", "boiga", "coelognathus",
      "orthriophis", "zamenis", "rhinechis", "coronella",
      "natrix", "thamnophis",
    ],
    allowedFoods: ["rat", "mouse"],
  },
  // Vipères et serpents venimeux
  {
    label: "Vipères et venimeux",
    patterns: [
      "vipera", "bitis", "cerastes", "daboia", "echis",
      "crotalus", "agkistrodon", "bothrops", "lachesis",
      "naja", "dendroaspis", "ophiophagus", "micrurus",
      "atheris", "trimeresurus",
    ],
    allowedFoods: ["rat", "mouse"],
  },

  // ========== LÉZARDS ==========
  // Varans - carnivores (rongeurs + insectes + œufs)
  {
    label: "Varans",
    patterns: ["varanus"],
    allowedFoods: ["rat", "mouse", "insect", "wholePrey"],
  },
  // Tégus - omnivores
  {
    label: "Tégus",
    patterns: ["salvator", "tupinambis"],
    allowedFoods: ["rat", "mouse", "insect", "vegetable", "fruit", "wholePrey"],
  },
  // Pogona (dragons barbus) - omnivores (insectes + végétaux)
  {
    label: "Pogona",
    patterns: ["pogona"],
    allowedFoods: ["insect", "vegetable", "fruit", "pellet"],
  },
  // Tiliqua (scinques à langue bleue) - omnivores
  {
    label: "Tiliqua",
    patterns: ["tiliqua"],
    allowedFoods: ["insect", "vegetable", "fruit", "pellet"],
  },
  // Geckos - insectivores
  {
    label: "Geckos",
    patterns: [
      "eublepharis", "correlophus", "rhacodactylus", "gekko",
      "phelsuma", "paroedura", "hemitheconyx", "nephrurus",
      "underwoodisaurus", "lygodactylus", "uroplatus",
    ],
    allowedFoods: ["insect", "fruit"],
  },
  // Caméléons - insectivores
  {
    label: "Caméléons",
    patterns: ["chamaeleo", "furcifer", "trioceros", "brookesia", "calumma", "kinyongia"],
    allowedFoods: ["insect"],
  },
  // Iguanes - herbivores
  {
    label: "Iguanes",
    patterns: [
      "iguana", "cyclura", "brachylophus", "ctenosaura",
      "sauromalus", "dipsosaurus",
    ],
    allowedFoods: ["vegetable", "fruit", "pellet"],
  },
  // Hélodermes - carnivores
  {
    label: "Hélodermes",
    patterns: ["heloderma"],
    allowedFoods: ["rat", "mouse", "insect", "wholePrey"],
  },
  // Agames (hors Pogona)
  {
    label: "Agames",
    patterns: ["agama", "intellagama", "physignathus", "hydrosaurus"],
    allowedFoods: ["insect", "vegetable", "fruit"],
  },
  // Scinques divers
  {
    label: "Scinques",
    patterns: ["egernia", "corucia"],
    allowedFoods: ["insect", "vegetable", "fruit", "pellet"],
  },

  // ========== TORTUES ==========
  // Tortues aquatiques carnivores (Macrochelys, Chelydra)
  {
    label: "Tortues alligator et serpentines",
    patterns: ["macrochelys", "chelydra"],
    allowedFoods: ["fish", "crustacean", "wholePrey", "mouse"],
  },
  // Tortues aquatiques omnivores
  {
    label: "Tortues aquatiques omnivores",
    patterns: [
      "trachemys", "pseudemys", "graptemys", "chrysemys",
      "mauremys", "cuora", "geoemyda", "rhinoclemmys",
      "emys", "clemmys", "glyptemys", "sternotherus",
      "kinosternon", "pelusios", "pelomedusa",
      "pelodiscus", "apalone", "trionyx",
    ],
    allowedFoods: ["fish", "crustacean", "insect", "vegetable", "pellet"],
  },
  // Tortues de terre herbivores (Testudo, Geochelone, etc.)
  {
    label: "Tortues terrestres herbivores",
    patterns: [
      "testudo", "geochelone", "astrochelys", "pyxis",
      "centrochelys", "stigmochelys", "aldabrachelys",
      "gopherus", "manouria", "indotestudo",
      "chelonoidis", "kinixys", "homopus", "chersina",
    ],
    allowedFoods: ["vegetable", "fruit", "pellet"],
  },
  // Tortues Mata mata
  {
    label: "Mata mata",
    patterns: ["chelus"],
    allowedFoods: ["fish", "wholePrey"],
  },
];

/**
 * Normalise un nom d'espèce pour le matching (lowercase, remplace tirets/underscores par espaces).
 */
function normalizeSpecies(species: string): string {
  return species.toLowerCase().replace(/[-_]/g, " ").trim();
}

/**
 * Retourne les types d'aliments autorisés pour une espèce donnée.
 * Si aucun profil ne correspond, retourne tous les types (fallback).
 */
export function getAllowedFoodTypes(species: string): FoodType[] {
  const normalized = normalizeSpecies(species);
  
  for (const profile of dietProfiles) {
    for (const pattern of profile.patterns) {
      if (normalized.includes(pattern)) {
        return profile.allowedFoods;
      }
    }
  }
  
  // Fallback: tous les types si espèce non reconnue
  return ["rat", "mouse", "rabbit", "insect", "vegetable", "fruit", "pellet", "fish", "crustacean", "wholePrey"];
}
