/**
 * Base de données des gènes/morphs par espèce avec leur mode d'hérédité.
 * Utilisé par le calculateur génétique de morphs.
 * 
 * Données enrichies depuis MorphMarket (morphmarket.com/morphpedia)
 */

export type { InheritanceMode, MorphGene, SpeciesGenetics } from "./morphGenetics/types";
export { snakeGenetics } from "./morphGenetics/snakes";
export { lizardGenetics } from "./morphGenetics/lizards";
export { turtleGenetics } from "./morphGenetics/turtles";

import { SpeciesGenetics } from "./morphGenetics/types";
import { snakeGenetics } from "./morphGenetics/snakes";
import { lizardGenetics } from "./morphGenetics/lizards";
import { turtleGenetics } from "./morphGenetics/turtles";

// Trie les gènes/morphs par ordre alphabétique dans chaque espèce
function sortGenes(species: SpeciesGenetics[]): SpeciesGenetics[] {
  return species.map(s => ({
    ...s,
    genes: [...s.genes].sort((a, b) => a.name.localeCompare(b.name)),
  }));
}

export const speciesGenetics: SpeciesGenetics[] = sortGenes([
  ...snakeGenetics,
  ...lizardGenetics,
  ...turtleGenetics,
]);

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
