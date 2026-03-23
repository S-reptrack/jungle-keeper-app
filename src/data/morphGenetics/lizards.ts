import { SpeciesGenetics } from "./types";

export const lizardGenetics: SpeciesGenetics[] = [
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
      { name: "Cipher", inheritance: "recessive" },
      { name: "BAE", inheritance: "recessive" },
      { name: "Diablo Blanco", inheritance: "recessive" },
      { name: "Lavender", inheritance: "recessive" },
      // Codominant
      { name: "Mack Snow", inheritance: "codominant", superForm: "Super Snow" },
      { name: "TUG Snow", inheritance: "codominant", superForm: "Super TUG Snow" },
      { name: "Giant", inheritance: "codominant", superForm: "Super Giant" },
      { name: "Lemon Frost", inheritance: "codominant", superForm: "Super Lemon Frost" },
      // Dominant / Polygenic
      { name: "Tangerine", inheritance: "dominant" },
      { name: "Carrot Tail", inheritance: "dominant" },
      { name: "Bold Stripe", inheritance: "dominant" },
      { name: "Jungle", inheritance: "dominant" },
      { name: "High Yellow", inheritance: "dominant" },
      { name: "Enigma", inheritance: "dominant" },
      { name: "White & Yellow (W&Y)", inheritance: "dominant" },
      { name: "Black Night", inheritance: "dominant" },
      { name: "Black Pearl", inheritance: "dominant" },
      { name: "Bandit", inheritance: "dominant" },
      { name: "Blood", inheritance: "dominant" },
      { name: "Carrot Head", inheritance: "dominant" },
      { name: "Electric", inheritance: "dominant" },
      { name: "Emerine", inheritance: "dominant" },
      { name: "Halloween", inheritance: "dominant" },
      { name: "Inferno", inheritance: "dominant" },
      { name: "Reverse Stripe", inheritance: "dominant" },
      { name: "Red Stripe", inheritance: "dominant" },
      { name: "Snake Eyes", inheritance: "dominant" },
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
      // Polygéniques
      { name: "Dalmatian", inheritance: "dominant" },
      { name: "Harlequin", inheritance: "dominant" },
      { name: "Pinstripe", inheritance: "dominant" },
      { name: "Flame", inheritance: "dominant" },
      { name: "Tiger", inheritance: "dominant" },
      { name: "Phantom", inheritance: "dominant" },
      { name: "Tricolor", inheritance: "dominant" },
      { name: "Extreme Harlequin", inheritance: "dominant" },
      { name: "Cream", inheritance: "dominant" },
      { name: "Red", inheritance: "dominant" },
      { name: "Dark", inheritance: "dominant" },
      { name: "Bi-Color", inheritance: "dominant" },
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
      { name: "Paradox", inheritance: "recessive" },
      { name: "Wero", inheritance: "recessive" },
      // Dominant / Polygenic
      { name: "Red", inheritance: "dominant" },
      { name: "Orange", inheritance: "dominant" },
      { name: "Citrus", inheritance: "dominant" },
      { name: "Tiger", inheritance: "dominant" },
      { name: "German Giant", inheritance: "dominant" },
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
      { name: "Sunburst", inheritance: "dominant" },
    ],
  },

  // ========== FURCIFER PARDALIS (Panther Chameleon) ==========
  {
    species: "Furcifer pardalis",
    commonName: "Caméléon panthère",
    category: "lizard",
    genes: [
      // Localités
      { name: "Ambilobe", inheritance: "dominant" },
      { name: "Nosy Be", inheritance: "dominant" },
      { name: "Ambanja", inheritance: "dominant" },
      { name: "Tamatave", inheritance: "dominant" },
      { name: "Sambava", inheritance: "dominant" },
      { name: "Diego Suarez", inheritance: "dominant" },
      { name: "Nosy Faly", inheritance: "dominant" },
      { name: "Nosy Mitsio", inheritance: "dominant" },
      { name: "Ankify", inheritance: "dominant" },
      { name: "Ankaramy", inheritance: "dominant" },
      { name: "Cap Est", inheritance: "dominant" },
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
      { name: "Caramel", inheritance: "recessive" },
    ],
  },

  // ========== VARANUS ACANTHURUS (Monitor) ==========
  {
    species: "Varanus acanthurus",
    commonName: "Varan à queue épineuse",
    category: "lizard",
    genes: [
      { name: "Hypo", inheritance: "recessive" },
      { name: "Albino", inheritance: "recessive" },
      { name: "Red", inheritance: "dominant" },
      { name: "Yellow", inheritance: "dominant" },
    ],
  },

  // ========== RHACODACTYLUS LEACHIANUS (Giant Gecko) ==========
  {
    species: "Rhacodactylus leachianus",
    commonName: "Gecko géant de Nouvelle-Calédonie",
    category: "lizard",
    genes: [
      { name: "Phantom", inheritance: "dominant" },
      { name: "Dark", inheritance: "dominant" },
      { name: "Striped", inheritance: "dominant" },
      { name: "Pink", inheritance: "dominant" },
      { name: "White Collar", inheritance: "dominant" },
      // Localités
      { name: "GT (Grande Terre)", inheritance: "dominant" },
      { name: "Pine Island", inheritance: "dominant" },
      { name: "Bayonnaise", inheritance: "dominant" },
      { name: "Nuu Ami", inheritance: "dominant" },
      { name: "Nuu Ana", inheritance: "dominant" },
    ],
  },

  // ========== MNIAROGEKKO CHAHOUA (Chahoua Gecko) ==========
  {
    species: "Mniarogekko chahoua",
    commonName: "Gecko chahoua",
    category: "lizard",
    genes: [
      { name: "Mainland", inheritance: "dominant" },
      { name: "Pine Island", inheritance: "dominant" },
      { name: "Red", inheritance: "dominant" },
      { name: "Pink", inheritance: "dominant" },
      { name: "Yellow", inheritance: "dominant" },
    ],
  },
];
