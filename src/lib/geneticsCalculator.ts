/**
 * Calculateur génétique de morphs pour reptiles.
 * Supporte : dominant, codominant, récessif, hétérozygote, possible hétérozygote.
 */

import { InheritanceMode, MorphGene } from "@/data/morphGenetics";

/**
 * Statut allélique d'un parent pour un gène donné.
 */
export type AlleleStatus = 
  | "visual"        // Homozygote dominant ou hétérozygote (exprimé visuellement)
  | "het"           // Hétérozygote confirmé (porteur, non visuel pour récessif)
  | "possible_het"  // Possible hétérozygote (66% ou 50% de chance)
  | "super"         // Homozygote (super form pour codominant)
  | "none";         // Ne possède pas le gène

export interface ParentGene {
  gene: MorphGene;
  status: AlleleStatus;
  possibleHetPercentage?: number; // 50 ou 66, par défaut 66
}

export interface OffspringResult {
  genotype: string;
  percentage: number;
  description: string;
  genes: { geneName: string; status: string }[];
}

/**
 * Calcule les résultats d'un croisement pour un seul gène.
 */
function calculateSingleGene(
  gene: MorphGene,
  parent1Status: AlleleStatus,
  parent2Status: AlleleStatus,
  p1PossHetPct: number = 66,
  p2PossHetPct: number = 66
): OffspringResult[] {
  const { inheritance, name, superForm } = gene;

  if (inheritance === "recessive") {
    return calculateRecessive(name, parent1Status, parent2Status, p1PossHetPct, p2PossHetPct);
  }
  if (inheritance === "codominant") {
    return calculateCodominant(name, superForm || `Super ${name}`, parent1Status, parent2Status);
  }
  if (inheritance === "dominant") {
    return calculateDominant(name, parent1Status, parent2Status);
  }
  return [{ genotype: "Normal", percentage: 100, description: "Normal", genes: [] }];
}

/**
 * Calcul pour gène récessif.
 * Prend en charge : visual (homozygote), het, possible_het, none
 */
function calculateRecessive(
  name: string,
  p1: AlleleStatus,
  p2: AlleleStatus,
  p1PossHetPct: number,
  p2PossHetPct: number
): OffspringResult[] {
  // Convertir les status en probabilités d'avoir l'allèle récessif
  const p1Probs = getAlleleProbs(p1, p1PossHetPct);
  const p2Probs = getAlleleProbs(p2, p2PossHetPct);

  // Probabilités des 3 résultats possibles: visual, het, normal
  // P(visual) = P(p1 donne r) * P(p2 donne r)
  // Chaque parent peut donner: allèle récessif (r) ou normal (R)
  
  const results: OffspringResult[] = [];
  
  // p1 genotype probs: [P(RR), P(Rr), P(rr)]
  const p1Geno = getGenotypeProbs(p1, p1PossHetPct);
  const p2Geno = getGenotypeProbs(p2, p2PossHetPct);

  // Accumuler les probabilités pour chaque résultat offspring
  let pVisual = 0;
  let pHet = 0;
  let pNormal = 0;
  let pPossHet66 = 0;

  // Pour chaque combinaison de génotypes parentaux
  const parentCombos = [
    // [p1 genotype, p2 genotype, probability]
    ...getParentCrosses(p1Geno, p2Geno)
  ];

  for (const [g1, g2, prob] of parentCombos) {
    // Cross two genotypes
    const cross = crossGenotypes(g1 as string, g2 as string);
    pVisual += cross.rr * prob;
    pHet += cross.Rr * prob;
    pNormal += cross.RR * prob;
  }

  const total = pVisual + pHet + pNormal;
  
  if (pVisual > 0.001) {
    results.push({
      genotype: name,
      percentage: round(pVisual / total * 100),
      description: `${name} (visuel)`,
      genes: [{ geneName: name, status: "visual" }],
    });
  }
  if (pHet > 0.001) {
    // Determine if het is 100% or possible het
    const hetTotal = pHet + pNormal;
    if (pNormal < 0.001) {
      results.push({
        genotype: `Het ${name}`,
        percentage: round(pHet / total * 100),
        description: `100% Het ${name}`,
        genes: [{ geneName: name, status: "het" }],
      });
    } else {
      // Some are het, some are normal -> "possible het"
      const possHetPct = round(pHet / hetTotal * 100);
      results.push({
        genotype: `Poss. Het ${name} (${possHetPct}%)`,
        percentage: round((pHet + pNormal) / total * 100),
        description: `${possHetPct}% Possible Het ${name}`,
        genes: [{ geneName: name, status: "possible_het" }],
      });
    }
  } else if (pNormal > 0.001 && pHet <= 0.001) {
    results.push({
      genotype: "Normal",
      percentage: round(pNormal / total * 100),
      description: "Normal (pas de gène)",
      genes: [{ geneName: name, status: "none" }],
    });
  }

  return results;
}

function getAlleleProbs(status: AlleleStatus, possHetPct: number): { R: number; r: number } {
  switch (status) {
    case "visual": return { R: 0, r: 1 };       // rr -> only gives r
    case "super": return { R: 0, r: 1 };         // rr for recessive
    case "het": return { R: 0.5, r: 0.5 };       // Rr
    case "possible_het": {
      const hetChance = possHetPct / 100;
      return { R: 1 - hetChance * 0.5, r: hetChance * 0.5 };
    }
    case "none": return { R: 1, r: 0 };          // RR
    default: return { R: 1, r: 0 };
  }
}

function getGenotypeProbs(status: AlleleStatus, possHetPct: number): [string, number][] {
  switch (status) {
    case "visual":
    case "super":
      return [["rr", 1]];
    case "het":
      return [["Rr", 1]];
    case "possible_het": {
      const hetChance = possHetPct / 100;
      return [["Rr", hetChance], ["RR", 1 - hetChance]];
    }
    case "none":
      return [["RR", 1]];
    default:
      return [["RR", 1]];
  }
}

function getParentCrosses(
  p1Genos: [string, number][],
  p2Genos: [string, number][]
): [string, string, number][] {
  const crosses: [string, string, number][] = [];
  for (const [g1, prob1] of p1Genos) {
    for (const [g2, prob2] of p2Genos) {
      crosses.push([g1, g2, prob1 * prob2]);
    }
  }
  return crosses;
}

function crossGenotypes(g1: string, g2: string): { RR: number; Rr: number; rr: number } {
  // Count alleles
  const p1r = (g1.match(/r/g) || []).length;
  const p1R = 2 - p1r;
  const p2r = (g2.match(/r/g) || []).length;
  const p2R = 2 - p2r;

  // Punnett square
  const p1Alleles = Array(p1R).fill("R").concat(Array(p1r).fill("r"));
  const p2Alleles = Array(p2R).fill("R").concat(Array(p2r).fill("r"));

  let RR = 0, Rr = 0, rr = 0;
  for (const a1 of p1Alleles) {
    for (const a2 of p2Alleles) {
      if (a1 === "R" && a2 === "R") RR++;
      else if (a1 === "r" && a2 === "r") rr++;
      else Rr++;
    }
  }
  const total = p1Alleles.length * p2Alleles.length;
  return { RR: RR / total, Rr: Rr / total, rr: rr / total };
}

/**
 * Calcul pour gène codominant.
 */
function calculateCodominant(
  name: string,
  superName: string,
  p1: AlleleStatus,
  p2: AlleleStatus,
  p1PossHetPct: number = 66,
  p2PossHetPct: number = 66
): OffspringResult[] {
  const p1Data = getCodominantAlleles(p1, p1PossHetPct);
  const p2Data = getCodominantAlleles(p2, p2PossHetPct);

  let pSuper = 0, pVisual = 0, pNormal = 0;

  for (let i = 0; i < p1Data.alleles.length; i++) {
    for (let j = 0; j < p2Data.alleles.length; j++) {
      const prob = p1Data.probs[i] * p2Data.probs[j];
      const a1 = p1Data.alleles[i];
      const a2 = p2Data.alleles[j];
      for (const al1 of a1) {
        for (const al2 of a2) {
          const cellProb = prob / (a1.length * a2.length);
          if (al1 === "A" && al2 === "A") pSuper += cellProb;
          else if (al1 === "a" && al2 === "a") pNormal += cellProb;
          else pVisual += cellProb;
        }
      }
    }
  }

  const total = pSuper + pVisual + pNormal;
  const results: OffspringResult[] = [];
  if (pSuper > 0.001) {
    results.push({
      genotype: superName,
      percentage: round(pSuper / total * 100),
      description: `${superName} (homozygote)`,
      genes: [{ geneName: name, status: "super" }],
    });
  }
  if (pVisual > 0.001) {
    results.push({
      genotype: name,
      percentage: round(pVisual / total * 100),
      description: `${name} (visuel)`,
      genes: [{ geneName: name, status: "visual" }],
    });
  }
  if (pNormal > 0.001) {
    results.push({
      genotype: "Normal",
      percentage: round(pNormal / total * 100),
      description: "Normal (type sauvage)",
      genes: [{ geneName: name, status: "none" }],
    });
  }
  return results;
}

function getCodominantAlleles(status: AlleleStatus, possHetPct: number = 100): { alleles: string[][]; probs: number[] } {
  switch (status) {
    case "super": return { alleles: [["A", "A"]], probs: [1] };
    case "visual": return { alleles: [["A", "a"]], probs: [1] };
    case "possible_het": {
      const hetChance = possHetPct / 100;
      return { alleles: [["A", "a"], ["a", "a"]], probs: [hetChance, 1 - hetChance] };
    }
    case "none": return { alleles: [["a", "a"]], probs: [1] };
    default: return { alleles: [["a", "a"]], probs: [1] };
  }
}

/**
 * Calcul pour gène dominant.
 */
function calculateDominant(
  name: string,
  p1: AlleleStatus,
  p2: AlleleStatus
): OffspringResult[] {
  // Dominant: visual = Dd or DD, none = dd
  const p1Alleles = getDominantAlleles(p1);
  const p2Alleles = getDominantAlleles(p2);

  let pVisual = 0, pNormal = 0;
  for (const a1 of p1Alleles) {
    for (const a2 of p2Alleles) {
      if (a1 === "D" || a2 === "D") pVisual++;
      else pNormal++;
    }
  }
  const total = p1Alleles.length * p2Alleles.length;

  const results: OffspringResult[] = [];
  if (pVisual > 0) {
    results.push({
      genotype: name,
      percentage: round(pVisual / total * 100),
      description: `${name} (dominant)`,
      genes: [{ geneName: name, status: "visual" }],
    });
  }
  if (pNormal > 0) {
    results.push({
      genotype: "Normal",
      percentage: round(pNormal / total * 100),
      description: "Normal",
      genes: [{ geneName: name, status: "none" }],
    });
  }
  return results;
}

function getDominantAlleles(status: AlleleStatus): string[] {
  switch (status) {
    case "visual": return ["D", "d"]; // heterozygous by default
    case "super": return ["D", "D"];  // homozygous dominant
    case "none": return ["d", "d"];
    default: return ["d", "d"];
  }
}

/**
 * Combine les résultats de plusieurs gènes indépendants (locus différents).
 * Chaque gène est calculé indépendamment, puis les combos sont multipliées.
 */
export function calculateMultiGeneCross(
  parent1Genes: ParentGene[],
  parent2Genes: ParentGene[]
): OffspringResult[] {
  // Collecter tous les gènes uniques
  const allGeneNames = new Set<string>();
  parent1Genes.forEach(g => allGeneNames.add(g.gene.name));
  parent2Genes.forEach(g => allGeneNames.add(g.gene.name));

  // Calculer chaque gène indépendamment
  const perGeneResults: OffspringResult[][] = [];

  for (const geneName of allGeneNames) {
    const p1 = parent1Genes.find(g => g.gene.name === geneName);
    const p2 = parent2Genes.find(g => g.gene.name === geneName);

    const gene = p1?.gene || p2?.gene;
    if (!gene) continue;

    const p1Status = p1?.status || "none";
    const p2Status = p2?.status || "none";

    // Skip if both parents don't have the gene
    if (p1Status === "none" && p2Status === "none") continue;

    const results = calculateSingleGene(
      gene,
      p1Status,
      p2Status,
      p1?.possibleHetPercentage ?? 66,
      p2?.possibleHetPercentage ?? 66
    );
    perGeneResults.push(results);
  }

  if (perGeneResults.length === 0) {
    return [{ genotype: "Normal", percentage: 100, description: "Normal (aucun gène sélectionné)", genes: [] }];
  }

  // Combiner les résultats par produit cartésien
  let combined = perGeneResults[0];
  for (let i = 1; i < perGeneResults.length; i++) {
    combined = combineResults(combined, perGeneResults[i]);
  }

  // Filtrer les résultats avec < 0.1%
  return combined
    .filter(r => r.percentage >= 0.1)
    .sort((a, b) => b.percentage - a.percentage);
}

function combineResults(results1: OffspringResult[], results2: OffspringResult[]): OffspringResult[] {
  const combined: OffspringResult[] = [];
  
  for (const r1 of results1) {
    for (const r2 of results2) {
      const percentage = round(r1.percentage * r2.percentage / 100);
      if (percentage < 0.1) continue;

      const allGenes = [...r1.genes, ...r2.genes];
      const geneNames = allGenes
        .filter(g => g.status !== "none")
        .map(g => {
          if (g.status === "visual") return g.geneName;
          if (g.status === "super") return `Super ${g.geneName}`;
          if (g.status === "het") return `Het ${g.geneName}`;
          if (g.status === "possible_het") return `Poss. Het ${g.geneName}`;
          return "";
        })
        .filter(Boolean);

      const genotype = geneNames.length > 0 ? geneNames.join(" + ") : "Normal";

      combined.push({
        genotype,
        percentage,
        description: genotype,
        genes: allGenes,
      });
    }
  }

  return combined;
}

function round(n: number): number {
  return Math.round(n * 100) / 100;
}
