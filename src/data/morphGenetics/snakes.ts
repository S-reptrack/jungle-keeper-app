import { SpeciesGenetics } from "./types";

/**
 * Base génétique des serpents - corrigée selon MorphMarket / Morphpedia.
 *
 * Convention :
 *  - "codominant" = co-dominant OU incomplete dominant (mécanique identique :
 *    hétérozygote = forme visuelle, homozygote = "Super" / forme létale).
 *  - "dominant" = dominant pur (pas de super forme distincte).
 *  - "recessive" = ne s'exprime visuellement qu'à l'état homozygote.
 *  - "superForm" présent uniquement quand l'homozygote est viable et nommé.
 */
export const snakeGenetics: SpeciesGenetics[] = [
  // ========== PYTHON REGIUS (Ball Python) ==========
  {
    species: "Python regius",
    commonName: "Python royal",
    category: "snake",
    genes: [
      // ----- Co-dominant / Incomplete dominant -----
      { name: "Pastel", inheritance: "codominant", superForm: "Super Pastel" },
      { name: "Mojave", inheritance: "codominant", superForm: "Blue Eyed Lucy" },
      { name: "Lesser", inheritance: "codominant", superForm: "Blue Eyed Lucy" },
      { name: "Butter", inheritance: "codominant", superForm: "Blue Eyed Lucy" },
      { name: "Phantom", inheritance: "codominant", superForm: "Blue Eyed Lucy" },
      { name: "Russo", inheritance: "codominant", superForm: "Blue Eyed Lucy" },
      { name: "Special", inheritance: "codominant", superForm: "Blue Eyed Lucy" },
      { name: "Het Red Axanthic", inheritance: "codominant", superForm: "Red Axanthic" },
      { name: "Fire", inheritance: "codominant", superForm: "Black Eyed Lucy" },
      { name: "Vanilla", inheritance: "codominant", superForm: "Super Vanilla" },
      { name: "Yellow Belly", inheritance: "codominant", superForm: "Ivory" },
      { name: "Gravel", inheritance: "codominant", superForm: "Highway" },
      { name: "Asphalt", inheritance: "codominant", superForm: "Highway" },
      { name: "Enchi", inheritance: "codominant", superForm: "Super Enchi" },
      { name: "Cinnamon", inheritance: "codominant", superForm: "Super Cinnamon" },
      { name: "Black Pastel", inheritance: "codominant", superForm: "Super Black Pastel" },
      { name: "Mahogany", inheritance: "codominant", superForm: "Super Mahogany" },
      { name: "Mystic", inheritance: "codominant", superForm: "Mystic Potion" },
      { name: "Orange Dream", inheritance: "codominant", superForm: "Super Orange Dream" },
      { name: "Chocolate", inheritance: "codominant", superForm: "Super Chocolate" },
      { name: "Banana", inheritance: "codominant", superForm: "Super Banana" },
      { name: "Coral Glow", inheritance: "codominant", superForm: "Super Coral Glow" },
      { name: "GHI", inheritance: "codominant", superForm: "Super GHI" },
      { name: "Black Head", inheritance: "codominant", superForm: "Super Black Head" },
      { name: "Sulfur", inheritance: "codominant", superForm: "Super Sulfur" },
      { name: "Lemonback", inheritance: "codominant", superForm: "Super Lemonback" },
      { name: "Bamboo", inheritance: "codominant", superForm: "Super Bamboo" },
      { name: "Specter", inheritance: "codominant", superForm: "Super Specter" },
      { name: "Confusion", inheritance: "codominant", superForm: "Super Confusion" },
      { name: "Mocha", inheritance: "codominant", superForm: "Super Mocha" },
      { name: "Sauce", inheritance: "codominant", superForm: "Super Sauce" },
      { name: "Spark", inheritance: "codominant", superForm: "Super Spark" },
      { name: "Stranger", inheritance: "codominant", superForm: "Super Stranger" },
      { name: "Bongo", inheritance: "codominant", superForm: "Super Bongo" },
      { name: "Bambino", inheritance: "codominant", superForm: "Super Bambino" },
      { name: "Blade", inheritance: "codominant", superForm: "Super Blade" },
      { name: "Scaleless Head", inheritance: "codominant", superForm: "Scaleless" },
      // Spider, Champagne, Pinstripe, Woma, etc. — incomplete dominant à super létal
      // (super non viable). On les marque codominant sans superForm.
      { name: "Spider", inheritance: "codominant" },
      { name: "Champagne", inheritance: "codominant" },
      { name: "Hidden Gene Woma", inheritance: "codominant" },
      { name: "Sable", inheritance: "codominant" },
      { name: "Powerball", inheritance: "codominant" },
      { name: "Freeway", inheritance: "codominant" },
      // Dominant pur (pas de super distinct)
      { name: "Pinstripe", inheritance: "dominant" },
      { name: "Woma", inheritance: "dominant" },
      { name: "Spotnose", inheritance: "dominant" },
      { name: "Calico", inheritance: "dominant" },
      { name: "Cypress", inheritance: "dominant" },
      { name: "Leopard", inheritance: "dominant" },
      { name: "Acid", inheritance: "dominant" },
      { name: "Disco", inheritance: "dominant" },
      { name: "Fader", inheritance: "dominant" },
      { name: "Jigsaw", inheritance: "dominant" },
      // ----- Récessif -----
      { name: "Albino", inheritance: "recessive" },
      { name: "Piebald", inheritance: "recessive" },
      { name: "Clown", inheritance: "recessive" },
      { name: "Axanthic (VPI)", inheritance: "recessive" },
      { name: "Axanthic (TSK)", inheritance: "recessive" },
      { name: "Axanthic (Jolliff)", inheritance: "recessive" },
      { name: "Axanthic (GCR)", inheritance: "recessive" },
      { name: "Axanthic (MJ)", inheritance: "recessive" },
      { name: "Lavender Albino", inheritance: "recessive" },
      { name: "Caramel Albino", inheritance: "recessive" },
      { name: "Ultramel", inheritance: "recessive" },
      { name: "Desert Ghost", inheritance: "recessive" },
      { name: "Genetic Stripe", inheritance: "recessive" },
      { name: "Ghost (Hypo)", inheritance: "recessive" },
      { name: "Sunset", inheritance: "recessive" },
      { name: "Candy", inheritance: "recessive" },
      { name: "Toffee", inheritance: "recessive" },
      { name: "Cryptic", inheritance: "recessive" },
      { name: "Puzzle", inheritance: "recessive" },
      { name: "Tri-Stripe", inheritance: "recessive" },
      { name: "Orange Ghost", inheritance: "recessive" },
      { name: "Monsoon", inheritance: "recessive" },
      { name: "Genetic Black Back", inheritance: "recessive" },
    ],
  },

  // ========== BOA CONSTRICTOR (vrai Boa constrictor - principalement localités) ==========
  {
    species: "Boa constrictor",
    commonName: "Boa constricteur",
    category: "snake",
    genes: [
      // Récessifs prouvés chez le vrai Boa constrictor
      { name: "Albino (Argentine)", inheritance: "recessive" },
      { name: "Albino (BWC)", inheritance: "recessive" },
      { name: "Anery (Type I)", inheritance: "recessive" },
      { name: "Anery (Type II)", inheritance: "recessive" },
      // Localités (polygéniques, traitées comme dominant)
      { name: "Suriname", inheritance: "dominant" },
      { name: "Argentine", inheritance: "dominant" },
      { name: "Guyana", inheritance: "dominant" },
      { name: "Brésil (Amarali)", inheritance: "dominant" },
      { name: "Pérou (Longicauda)", inheritance: "dominant" },
      { name: "Colombie", inheritance: "dominant" },
      { name: "Trinidad", inheritance: "dominant" },
      { name: "Venezuela", inheritance: "dominant" },
    ],
  },

  // ========== BOA IMPERATOR (la majorité des morphs captifs) ==========
  {
    species: "Boa imperator",
    commonName: "Boa impérator",
    category: "snake",
    genes: [
      // ----- Co-dominant / Incomplete dominant -----
      { name: "Hypo", inheritance: "codominant", superForm: "Super Hypo" },
      { name: "Salmon", inheritance: "codominant", superForm: "Super Salmon" },
      { name: "Motley", inheritance: "codominant", superForm: "Super Motley" },
      { name: "IMG (Increasing Melanin Gene)", inheritance: "codominant", superForm: "Super IMG" },
      { name: "Fire", inheritance: "codominant", superForm: "Leucistic (Super Fire)" },
      { name: "Labyrinth", inheritance: "codominant", superForm: "Super Labyrinth" },
      { name: "Key West", inheritance: "codominant", superForm: "Super Key West" },
      { name: "Aztec", inheritance: "codominant", superForm: "Super Aztec" },
      { name: "Onyx", inheritance: "codominant", superForm: "Super Onyx" },
      { name: "Harlequin", inheritance: "codominant", superForm: "Super Harlequin" },
      // Jaguar : incomplete dominant — super létal (non viable)
      { name: "Jaguar", inheritance: "codominant" },
      // ----- Récessif -----
      { name: "Albino (Kahl)", inheritance: "recessive" },
      { name: "Albino (Sharp)", inheritance: "recessive" },
      { name: "Albino (VPI)", inheritance: "recessive" },
      { name: "Albino (Prodigy)", inheritance: "recessive" },
      { name: "Anery (Type I)", inheritance: "recessive" },
      { name: "Anery (Type II)", inheritance: "recessive" },
      { name: "Anery (Carbon)", inheritance: "recessive" },
      { name: "Anery (RDR Black Eye)", inheritance: "recessive" },
      { name: "Blood", inheritance: "recessive" },
      { name: "VPI T+", inheritance: "recessive" },
      { name: "Coral Albino", inheritance: "recessive" },
      { name: "Eclipse", inheritance: "recessive" },
      { name: "Paradigm", inheritance: "recessive" },
      { name: "PK Stripe", inheritance: "recessive" },
      { name: "Square Tail", inheritance: "recessive" },
      { name: "Sterling", inheritance: "recessive" },
      // ----- Dominant pur -----
      { name: "Leopard", inheritance: "dominant" },
      { name: "Black Stripe", inheritance: "dominant" },
      { name: "Het Red", inheritance: "dominant" },
      { name: "Arabesque", inheritance: "dominant" },
      { name: "Inca", inheritance: "dominant" },
      { name: "Indy", inheritance: "dominant" },
      // ----- Localités -----
      { name: "Hog Island", inheritance: "dominant" },
      { name: "Corn Island", inheritance: "dominant" },
      { name: "Crawl Cay", inheritance: "dominant" },
      { name: "Sonora (Mexico)", inheritance: "dominant" },
      { name: "Nicaragua", inheritance: "dominant" },
      { name: "Honduras", inheritance: "dominant" },
      { name: "Costa Rica", inheritance: "dominant" },
      { name: "Belize", inheritance: "dominant" },
      { name: "Tarahumara", inheritance: "dominant" },
    ],
  },

  // ========== PANTHEROPHIS GUTTATUS (Corn Snake) ==========
  {
    species: "Pantherophis guttatus",
    commonName: "Serpent des blés",
    category: "snake",
    genes: [
      // ----- Récessif -----
      { name: "Amelanistic (Albino)", inheritance: "recessive" },
      { name: "Anerythristic", inheritance: "recessive" },
      { name: "Charcoal", inheritance: "recessive" },
      { name: "Caramel", inheritance: "recessive" },
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
      { name: "Cinder", inheritance: "recessive" },
      { name: "Buf", inheritance: "recessive" },
      { name: "Scaleless", inheritance: "recessive" },
      // ----- Co-dominant / Incomplete dominant -----
      { name: "Diffused (Bloodred)", inheritance: "codominant", superForm: "Bloodred (homozygote)" },
      { name: "Tessera", inheritance: "codominant" },
      { name: "Palmetto", inheritance: "codominant", superForm: "Super Palmetto" },
      // ----- Dominant pur -----
      { name: "Masque", inheritance: "dominant" },
      { name: "Toffee", inheritance: "dominant" },
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
      { name: "Axanthic", inheritance: "recessive" },
      { name: "Patternless", inheritance: "recessive" },
      { name: "Snow", inheritance: "recessive" },
      { name: "Ghost", inheritance: "recessive" },
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
      { name: "Granite", inheritance: "recessive" },
      { name: "Hypo", inheritance: "recessive" },
      { name: "Caramel", inheritance: "codominant", superForm: "Super Caramel" },
      // Jaguar : incomplete dominant — super létal
      { name: "Jaguar", inheritance: "codominant" },
      // Zebra : incomplete dominant — super létal
      { name: "Zebra", inheritance: "codominant" },
      { name: "Tiger", inheritance: "codominant", superForm: "Super Tiger" },
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
      // Localités
      { name: "Aru", inheritance: "dominant" },
      { name: "Arfak", inheritance: "dominant" },
      { name: "Biak", inheritance: "dominant" },
      { name: "Cyclops", inheritance: "dominant" },
      { name: "Jayapura", inheritance: "dominant" },
      { name: "Kofiau", inheritance: "dominant" },
      { name: "Lereh", inheritance: "dominant" },
      { name: "Manokwari", inheritance: "dominant" },
      { name: "Numfor", inheritance: "dominant" },
      { name: "Padaido", inheritance: "dominant" },
      { name: "Sorong", inheritance: "dominant" },
      { name: "Wamena", inheritance: "dominant" },
      { name: "Merauke", inheritance: "dominant" },
    ],
  },

  // ========== PYTHON BIVITTATUS (Burmese Python) ==========
  {
    species: "Python bivittatus",
    commonName: "Python molure bivittatus",
    category: "snake",
    genes: [
      { name: "Albino", inheritance: "recessive" },
      { name: "Green", inheritance: "recessive" },
      { name: "Patternless", inheritance: "recessive" },
      { name: "Caramel", inheritance: "recessive" },
      { name: "Hypo", inheritance: "recessive" },
      { name: "Axanthic", inheritance: "recessive" },
      { name: "Granite", inheritance: "codominant", superForm: "Super Granite" },
      { name: "Labyrinth", inheritance: "codominant", superForm: "Super Labyrinth" },
    ],
  },

  // ========== HETERODON NASICUS (Western Hognose) ==========
  {
    species: "Heterodon nasicus",
    commonName: "Serpent à groin",
    category: "snake",
    genes: [
      // ----- Récessif -----
      { name: "Albino", inheritance: "recessive" },
      { name: "Axanthic", inheritance: "recessive" },
      { name: "Snow (Axanthic + Albino)", inheritance: "recessive" },
      { name: "Lavender", inheritance: "recessive" },
      { name: "Lemon Ghost", inheritance: "recessive" },
      { name: "Caramel", inheritance: "recessive" },
      { name: "Sable", inheritance: "recessive" },
      { name: "Dutch Hypo", inheritance: "recessive" },
      { name: "Pink Pastel", inheritance: "recessive" },
      { name: "Pistachio", inheritance: "recessive" },
      // ----- Co-dominant / Incomplete dominant -----
      // Anaconda : super létal
      { name: "Anaconda", inheritance: "codominant" },
      // Arctic : super viable = Super Arctic
      { name: "Arctic", inheritance: "codominant", superForm: "Super Arctic" },
      { name: "Toffee Belly", inheritance: "codominant", superForm: "Super Toffee" },
      { name: "Shadow", inheritance: "codominant", superForm: "Super Shadow" },
      { name: "Yeti", inheritance: "codominant", superForm: "Super Yeti" },
    ],
  },

  // ========== PITUOPHIS (Bullsnakes / Gopher snakes / Pine snakes) ==========
  {
    species: "Pituophis",
    commonName: "Pituophis",
    category: "snake",
    genes: [
      { name: "Albino", inheritance: "recessive" },
      { name: "Anery", inheritance: "recessive" },
      { name: "Axanthic", inheritance: "recessive" },
      { name: "Hypo", inheritance: "recessive" },
      { name: "Leucistic", inheritance: "recessive" },
      { name: "Melanistic", inheritance: "recessive" },
      { name: "Patternless", inheritance: "recessive" },
      { name: "Snow", inheritance: "recessive" },
      { name: "Striped", inheritance: "recessive" },
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
      { name: "Clark Strain Albino", inheritance: "recessive" },
      { name: "Mochino", inheritance: "recessive" },
      { name: "Genetic Stripe", inheritance: "codominant", superForm: "Super Stripe" },
      { name: "Golden Child", inheritance: "codominant", superForm: "Super Golden Child" },
      { name: "Motley", inheritance: "codominant", superForm: "Super Motley" },
      { name: "Phantom", inheritance: "codominant", superForm: "Super Phantom" },
      { name: "Tiger", inheritance: "codominant", superForm: "Super Tiger" },
      { name: "Platinum", inheritance: "codominant", superForm: "Super Platinum" },
      { name: "Sunfire", inheritance: "dominant" },
    ],
  },

  // ========== CROTALUS ATROX (Rattlesnake) ==========
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

  // ========== EPICRATES CENCHRIA (Rainbow Boa) ==========
  {
    species: "Epicrates cenchria",
    commonName: "Boa arc-en-ciel",
    category: "snake",
    genes: [
      { name: "Anery", inheritance: "recessive" },
      { name: "Albino", inheritance: "recessive" },
      { name: "Ghost", inheritance: "recessive" },
      { name: "Seib Line", inheritance: "recessive" },
      { name: "Pied", inheritance: "recessive" },
      { name: "Hypo", inheritance: "codominant", superForm: "Super Hypo" },
    ],
  },

  // ========== PYTHON BRONGERSMAI (Blood Python) ==========
  {
    species: "Python brongersmai",
    commonName: "Python sanguin",
    category: "snake",
    genes: [
      { name: "Albino (T-)", inheritance: "recessive" },
      { name: "Albino (T+)", inheritance: "recessive" },
      { name: "Axanthic", inheritance: "recessive" },
      { name: "Genetic Stripe", inheritance: "recessive" },
      { name: "Ivory", inheritance: "codominant", superForm: "Super Ivory" },
      { name: "Matrix", inheritance: "codominant", superForm: "Super Matrix" },
      { name: "Golden Eye", inheritance: "codominant", superForm: "Super Golden Eye" },
    ],
  },

  // ========== ASPIDITES RAMSAYI (Woma Python) ==========
  {
    species: "Aspidites ramsayi",
    commonName: "Python woma",
    category: "snake",
    genes: [
      { name: "Albino", inheritance: "recessive" },
      { name: "Ghost", inheritance: "recessive" },
      { name: "Blonde", inheritance: "codominant", superForm: "Super Blonde" },
    ],
  },
];
