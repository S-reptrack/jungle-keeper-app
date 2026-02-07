/**
 * Maps species to their reproduction type:
 * - "oviparous": egg-laying (Ponte)
 * - "viviparous": live birth (Mise bas)
 * - "ovoviviparous": live birth (Mise bas)
 * 
 * Default: oviparous (most reptiles lay eggs)
 */

// Species that give live birth (viviparous or ovoviviparous)
const VIVIPAROUS_SPECIES: string[] = [
  // Boas
  "Boa constrictor",
  "Boa imperator",
  "Boa constrictor imperator",
  "Acrantophis dumerili",
  "Acrantophis madagascariensis",
  "Candoia carinata",
  "Candoia aspera",
  "Candoia bibroni",
  "Corallus caninus",
  "Corallus hortulanus",
  "Corallus batesii",
  "Corallus grenadensis",
  "Epicrates cenchria",
  "Epicrates maurus",
  "Eunectes murinus",
  "Eunectes notaeus",
  "Sanzinia madagascariensis",
  "Chilabothrus angulifer",
  "Chilabothrus striatus",
  "Lichanura trivirgata",
  "Charina bottae",
  "Eryx colubrinus",
  "Eryx conicus",
  "Eryx jaculus",
  "Eryx johnii",
  "Eryx miliaris",
  "Gongylophis colubrinus",
  // Vipères / Viperidae
  "Vipera berus",
  "Vipera aspis",
  "Vipera ammodytes",
  "Crotalus atrox",
  "Crotalus horridus",
  "Bothrops atrox",
  "Bothrops asper",
  "Bitis gabonica",
  "Bitis arietans",
  "Agkistrodon contortrix",
  "Agkistrodon piscivorus",
  // Anacondas
  "Eunectes murinus",
  "Eunectes notaeus",
  // Lézards vivipares
  "Zootoca vivipara",
  "Tiliqua scincoides",
  "Tiliqua rugosa",
  "Tiliqua nigrolutea",
  "Corucia zebrata",
  "Tribolonotus gracilis",
  // Caméléons vivipares
  "Trioceros jacksonii",
  "Trioceros johnstoni",
  "Trioceros hoehnelii",
  "Trioceros deremensis",
  "Trioceros melleri",
  "Trioceros quadricornis",
  "Bradypodion pumilum",
  "Bradypodion damaranum",
];

// Patterns to match viviparous species by partial name (case-insensitive)
const VIVIPAROUS_PATTERNS: string[] = [
  "boa ",
  "boa constrictor",
  "boa imperator",
  "eunectes",
  "anaconda",
  "corallus",
  "epicrates",
  "sanzinia",
  "acrantophis",
  "candoia",
  "chilabothrus",
  "lichanura",
  "charina",
  "eryx",
  "gongylophis",
  "vipera",
  "crotalus",
  "bothrops",
  "bitis",
  "agkistrodon",
  "trioceros",
  "bradypodion",
  "tiliqua",
  "corucia",
  "tribolonotus",
  "zootoca",
];

export type ReproductionType = "oviparous" | "viviparous";

/**
 * Determines if a species is viviparous/ovoviviparous (live birth) or oviparous (egg-laying).
 * Returns "viviparous" for live-bearing species, "oviparous" for egg-layers.
 */
export function getReproductionType(species: string): ReproductionType {
  const speciesLower = species.toLowerCase().trim();

  // Check exact match first
  if (VIVIPAROUS_SPECIES.some(s => s.toLowerCase() === speciesLower)) {
    return "viviparous";
  }

  // Check pattern match
  if (VIVIPAROUS_PATTERNS.some(pattern => speciesLower.includes(pattern.toLowerCase()))) {
    return "viviparous";
  }

  // Default: oviparous (most reptiles lay eggs)
  return "oviparous";
}
