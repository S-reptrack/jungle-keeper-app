import { SpeciesGenetics } from "./types";

export const turtleGenetics: SpeciesGenetics[] = [
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
      { name: "Leucistic", inheritance: "recessive" },
    ],
  },

  // ========== TRACHEMYS SCRIPTA (Red Eared Slider) ==========
  {
    species: "Trachemys scripta",
    commonName: "Tortue de Floride",
    category: "turtle",
    genes: [
      { name: "Albino", inheritance: "recessive" },
      { name: "Leucistic", inheritance: "recessive" },
      { name: "Pastel", inheritance: "codominant", superForm: "Super Pastel" },
      { name: "Caramel", inheritance: "recessive" },
    ],
  },
];
