/**
 * Types pour la base de données génétique des morphs.
 */

export type InheritanceMode = "dominant" | "codominant" | "recessive" | "incomplete_dominant";

export interface MorphGene {
  name: string;
  inheritance: InheritanceMode;
  superForm?: string;
}

export interface SpeciesGenetics {
  species: string;
  commonName: string;
  category: "snake" | "lizard" | "turtle" | "amphibian";
  genes: MorphGene[];
}
