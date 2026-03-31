/**
 * Utility to link CITES species data with the genetics calculator morph database.
 * Prioritizes genetics calculator data for morph names to ensure consistency.
 */

import { getAllSpecies } from "@/data/citesSpecies";
import { speciesGenetics, findSpeciesGenetics } from "@/data/morphGenetics";

/**
 * Get morph/gene names for a CITES species ID, using the genetics calculator data.
 * Falls back to citesSpecies morphs if no genetics match is found.
 */
export function getMorphsForSpecies(speciesId: string): string[] {
  const citesSpecies = getAllSpecies().find(s => s.id === speciesId);
  if (!citesSpecies) return [];

  // Try to find matching genetics data by scientific name
  const geneticsData = findSpeciesGenetics(citesSpecies.scientificName);
  
  if (geneticsData && geneticsData.genes.length > 0) {
    // Return gene names from genetics calculator, sorted alphabetically
    return geneticsData.genes.map(g => g.name).sort((a, b) => a.localeCompare(b));
  }

  // Fallback to citesSpecies morphs if no genetics data available
  return citesSpecies.morphs?.slice().sort((a, b) => a.localeCompare(b)) || [];
}

/**
 * Check if a species has genetics calculator data available.
 */
export function hasGeneticsData(speciesId: string): boolean {
  const citesSpecies = getAllSpecies().find(s => s.id === speciesId);
  if (!citesSpecies) return false;
  
  const geneticsData = findSpeciesGenetics(citesSpecies.scientificName);
  return !!geneticsData && geneticsData.genes.length > 0;
}
