import { SpeciesGenetics } from "./types";

/**
 * Base génétique des lézards - corrigée selon MorphMarket / Morphpedia.
 *
 * Convention :
 *  - "codominant" couvre aussi les incomplete dominants (super létal possible).
 *  - "dominant" = dominant pur sans super distinct.
 *  - "recessive" = expression visuelle uniquement à l'état homozygote.
 */
export const lizardGenetics: SpeciesGenetics[] = [
  // ========== EUBLEPHARIS MACULARIUS (Leopard Gecko) ==========
  {
    species: "Eublepharis macularius",
    commonName: "Gecko léopard",
    category: "lizard",
    genes: [
      { name: "Abyssinian", inheritance: "dominant" },
      { name: "Afghan Tangerine", inheritance: "dominant" },
      { name: "Albino (Bell)", inheritance: "recessive" },
      { name: "Albino (Rainwater)", inheritance: "recessive" },
      { name: "Albino (Tremper)", inheritance: "recessive" },
      { name: "Atomic", inheritance: "dominant" },
      { name: "BAE", inheritance: "recessive" },
      { name: "Baldy", inheritance: "dominant" },
      { name: "Bandit", inheritance: "dominant" },
      { name: "Black Night", inheritance: "dominant" },
      { name: "Black Pearl", inheritance: "dominant" },
      { name: "Blizzard", inheritance: "recessive" },
      { name: "Blood", inheritance: "dominant" },
      { name: "Blood Emerine", inheritance: "dominant" },
      { name: "Bold", inheritance: "dominant" },
      { name: "Bold Stripe", inheritance: "dominant" },
      { name: "Carrot Head", inheritance: "dominant" },
      { name: "Carrot Tail", inheritance: "dominant" },
      { name: "Cipher", inheritance: "recessive" },
      { name: "Clown", inheritance: "dominant" },
      { name: "Eclipse", inheritance: "recessive" },
      { name: "Electric", inheritance: "dominant" },
      { name: "Emerine", inheritance: "dominant" },
      { name: "Enigma", inheritance: "dominant" },
      { name: "Extreme Bold", inheritance: "dominant" },
      { name: "Firebold", inheritance: "dominant" },
      { name: "G Project", inheritance: "dominant" },
      { name: "Ggg", inheritance: "dominant" },
      { name: "Ghost", inheritance: "dominant" },
      { name: "Giant", inheritance: "codominant", superForm: "Super Giant" },
      { name: "Glow Madness", inheritance: "dominant" },
      { name: "Halloween", inheritance: "dominant" },
      { name: "High Yellow", inheritance: "dominant" },
      { name: "Hyper Xanthic", inheritance: "dominant" },
      { name: "Hypo", inheritance: "dominant" },
      { name: "Inferno", inheritance: "dominant" },
      { name: "Jungle", inheritance: "dominant" },
      { name: "Lavender", inheritance: "dominant" },
      { name: "Lemon Frost", inheritance: "codominant", superForm: "Super Lemon Frost" },
      { name: "Marble Eye", inheritance: "recessive" },
      { name: "Murphy Patternless", inheritance: "recessive" },
      { name: "NDBE", inheritance: "recessive" },
      { name: "Nieves Tangerine", inheritance: "dominant" },
      { name: "Pacific Green", inheritance: "dominant" },
      { name: "Pastel", inheritance: "dominant" },
      { name: "Patternless Stripe", inheritance: "dominant" },
      { name: "Purple Head", inheritance: "dominant" },
      { name: "Rainbow Stripe", inheritance: "dominant" },
      { name: "Red Stripe", inheritance: "dominant" },
      { name: "Reverse Stripe", inheritance: "dominant" },
      { name: "Snake Eyes", inheritance: "dominant" },
      { name: "Snow (Gem)", inheritance: "dominant" },
      { name: "Snow (LBS)", inheritance: "dominant" },
      { name: "Snow (Mack)", inheritance: "codominant", superForm: "Super Snow" },
      { name: "Snow (Tug)", inheritance: "dominant" },
      { name: "Super Hypo", inheritance: "dominant" },
      { name: "Tangerine", inheritance: "dominant" },
      { name: "Tangerine Tornado", inheritance: "dominant" },
      { name: "Tango Crush", inheritance: "dominant" },
      { name: "White & Yellow", inheritance: "dominant" },
    ],
  },

  // ========== CORRELOPHUS CILIATUS (Crested Gecko) ==========
  {
    species: "Correlophus ciliatus",
    commonName: "Gecko à crête",
    category: "lizard",
    genes: [
      // Lilly White : incomplete dominant — super létal
      { name: "Lilly White", inheritance: "codominant" },
      { name: "Axanthic", inheritance: "recessive" },
      // Polygéniques (traits sélectionnés, traités comme dominants)
      { name: "Dalmatian", inheritance: "dominant" },
      { name: "Harlequin", inheritance: "dominant" },
      { name: "Extreme Harlequin", inheritance: "dominant" },
      { name: "Pinstripe", inheritance: "dominant" },
      { name: "Flame", inheritance: "dominant" },
      { name: "Tiger", inheritance: "dominant" },
      { name: "Brindle", inheritance: "dominant" },
      { name: "Phantom", inheritance: "dominant" },
      { name: "Tricolor", inheritance: "dominant" },
      { name: "Bi-Color", inheritance: "dominant" },
      { name: "Cream", inheritance: "dominant" },
      { name: "Red", inheritance: "dominant" },
      { name: "Dark", inheritance: "dominant" },
    ],
  },

  // ========== POGONA VITTICEPS (Bearded Dragon) ==========
  {
    species: "Pogona vitticeps",
    commonName: "Dragon barbu",
    category: "lizard",
    genes: [
      // ----- Récessif -----
      { name: "Hypo (Hypomelanistic)", inheritance: "recessive" },
      { name: "Witblits", inheritance: "recessive" },
      { name: "Zero", inheritance: "recessive" },
      { name: "Wero", inheritance: "recessive" },
      { name: "Paradox", inheritance: "recessive" },
      // ----- Co-dominant / Incomplete dominant -----
      // Leatherback hétéro = écailles réduites ; Super = Silkback (sans écailles, fragile)
      { name: "Leatherback", inheritance: "codominant", superForm: "Silkback" },
      // Translucent : incomplete dominant
      { name: "Translucent", inheritance: "codominant", superForm: "Super Translucent" },
      // Dunner : co-dominant (motif modifié)
      { name: "Dunner", inheritance: "codominant" },
      // ----- Dominant / Polygénique -----
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
      // Localités (pas de morphs génétiques simples)
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
      { name: "Caramel", inheritance: "recessive" },
      { name: "Hyper", inheritance: "codominant", superForm: "Super Hyper" },
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
      // Localités
      { name: "Mainland", inheritance: "dominant" },
      { name: "Pine Island", inheritance: "dominant" },
      // Couleurs polygéniques
      { name: "Red", inheritance: "dominant" },
      { name: "Pink", inheritance: "dominant" },
      { name: "Yellow", inheritance: "dominant" },
    ],
  },
];
