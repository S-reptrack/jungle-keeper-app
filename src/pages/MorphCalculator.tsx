import { useState, useMemo } from "react";
import { useSignedImageUrl } from "@/lib/storageUtils";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import Navigation from "@/components/Navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, Dna, Plus, X, Baby, FlaskConical, Info, Search } from "lucide-react";
import { RotateCcw } from "lucide-react";
import { speciesGenetics, MorphGene, findSpeciesGenetics } from "@/data/morphGenetics";
import { AlleleStatus, ParentGene, calculateMultiGeneCross, OffspringResult } from "@/lib/geneticsCalculator";
import { getAllSpecies } from "@/data/citesSpecies";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useQuery } from "@tanstack/react-query";

interface ParentConfig {
  genes: ParentGene[];
  reptileId?: string;
  reptileName?: string;
  reptileSex?: string | null;
  reptileSpecies?: string;
}

const createEmptyParent = (): ParentConfig => ({ genes: [] });

const resolveReptileGenetics = (speciesIdOrName: string) => {
  const citesEntry = getAllSpecies().find((species) => species.id === speciesIdOrName);
  const speciesName = citesEntry?.scientificName || speciesIdOrName;

  return findSpeciesGenetics(speciesName);
};

const getOppositeSex = (sex?: string | null) => {
  if (sex === "male") return "female";
  if (sex === "female") return "male";
  return null;
const ReptilePickerItem = ({ reptile, onPick }: { reptile: any; onPick: (r: any) => void }) => {
  const { signedUrl, loading } = useSignedImageUrl(reptile.image_url);
  return (
    <button
      onClick={() => onPick(reptile)}
      className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-muted/50 transition-colors text-left"
    >
      {reptile.image_url ? (
        loading ? (
          <div className="w-14 h-14 rounded-xl bg-muted animate-pulse flex-shrink-0" />
        ) : signedUrl ? (
          <img src={signedUrl} alt={reptile.name} className="w-14 h-14 rounded-xl object-cover flex-shrink-0" />
        ) : (
          <div className="w-14 h-14 rounded-xl bg-muted flex items-center justify-center flex-shrink-0">
            <Dna className="w-5 h-5 text-muted-foreground" />
          </div>
        )
      ) : (
        <div className="w-14 h-14 rounded-xl bg-muted flex items-center justify-center flex-shrink-0">
          <Dna className="w-5 h-5 text-muted-foreground" />
        </div>
      )}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium truncate">{reptile.name}</p>
        <p className="text-xs text-muted-foreground truncate">{reptile.species}</p>
        {reptile.morphs && reptile.morphs.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-1">
            {reptile.morphs.slice(0, 4).map((m: string) => (
              <Badge key={m} variant="secondary" className="text-[9px] px-1.5 py-0">{m}</Badge>
            ))}
            {reptile.morphs.length > 4 && (
              <Badge variant="secondary" className="text-[9px] px-1.5 py-0">+{reptile.morphs.length - 4}</Badge>
            )}
          </div>
        )}
      </div>
      {reptile.sex && (
        <span className="text-lg flex-shrink-0">{reptile.sex === "male" ? "♂" : reptile.sex === "female" ? "♀" : "?"}</span>
      )}
    </button>
  );
};


  const { t } = useTranslation();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [selectedSpecies, setSelectedSpecies] = useState<string>("");
  const [parent1, setParent1] = useState<ParentConfig>({ genes: [] });
  const [parent2, setParent2] = useState<ParentConfig>({ genes: [] });
  const [results, setResults] = useState<OffspringResult[] | null>(null);
  const [pickingParent, setPickingParent] = useState<1 | 2 | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  // Fetch user's reptiles
  const { data: reptiles } = useQuery({
    queryKey: ["reptiles-for-calculator", user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      const { data } = await supabase
        .from("reptiles")
        .select("id, name, species, morphs, sex, image_url")
        .eq("user_id", user.id)
        .eq("status", "active")
        .order("name");
      return data || [];
    },
    enabled: !!user?.id,
  });

  const speciesData = useMemo(() => {
    return speciesGenetics.find(s => s.species === selectedSpecies);
  }, [selectedSpecies]);

  const availableGenes = useMemo(() => {
    return speciesData?.genes || [];
  }, [speciesData]);

  const reptileOptions = useMemo(() => {
    return (reptiles || []).map((reptile) => {
      const genetics = resolveReptileGenetics(reptile.species);

      return {
        ...reptile,
        genetics,
        geneticsSpecies: genetics?.species ?? null,
      };
    });
  }, [reptiles]);

  const syncAfterParentChange = (nextParent1: ParentConfig, nextParent2: ParentConfig) => {
    setParent1(nextParent1);
    setParent2(nextParent2);

    const nextSpecies = nextParent1.reptileSpecies ||
      nextParent2.reptileSpecies ||
      (nextParent1.genes.length > 0 || nextParent2.genes.length > 0 ? selectedSpecies : "");

    setSelectedSpecies(nextSpecies);
    setResults(null);
  };

  const resetAll = () => {
    setSelectedSpecies("");
    setParent1(createEmptyParent());
    setParent2(createEmptyParent());
    setResults(null);
  };

  const handleSpeciesChange = (species: string) => {
    setSelectedSpecies(species);
    setParent1(createEmptyParent());
    setParent2(createEmptyParent());
    setResults(null);
  };

  const clearParent = (parentNum: 1 | 2) => {
    const nextParent1 = parentNum === 1 ? createEmptyParent() : parent1;
    const nextParent2 = parentNum === 2 ? createEmptyParent() : parent2;

    syncAfterParentChange(nextParent1, nextParent2);
  };

  const handlePickReptile = (reptile: { id: string; name: string; species: string; morphs: string[] | null; sex: string | null }) => {
    if (!pickingParent) return;

    const genetics = resolveReptileGenetics(reptile.species);
    if (!genetics) return;
    
    // If species differs from current, update it
    if (genetics && genetics.species !== selectedSpecies) {
      setSelectedSpecies(genetics.species);
      // Reset the other parent if species changed
      if (pickingParent === 1) setParent2(createEmptyParent());
      else setParent1(createEmptyParent());
      setResults(null);
    }

    // Build parent genes from reptile morphs
    const parentGenes: ParentGene[] = [];
    if (reptile.morphs && genetics) {
      for (const morphName of reptile.morphs) {
        const gene = genetics.genes.find(g => g.name.toLowerCase() === morphName.toLowerCase());
        if (gene) {
          const defaultStatus: AlleleStatus = gene.inheritance === "codominant" ? "visual" : 
                                              gene.inheritance === "recessive" ? "visual" : "visual";
          parentGenes.push({ gene, status: defaultStatus, possibleHetPercentage: 66 });
        }
      }
    }

    const setter = pickingParent === 1 ? setParent1 : setParent2;
    setter({
      genes: parentGenes,
      reptileId: reptile.id,
      reptileName: reptile.name,
      reptileSex: reptile.sex,
      reptileSpecies: genetics.species,
    });
    setPickingParent(null);
    setSearchQuery("");
  };

  const addGeneToParent = (parentNum: 1 | 2, gene: MorphGene) => {
    const setter = parentNum === 1 ? setParent1 : setParent2;
    const parent = parentNum === 1 ? parent1 : parent2;
    
    if (parent.genes.find(g => g.gene.name === gene.name)) return;
    
    const defaultStatus: AlleleStatus = gene.inheritance === "codominant" ? "visual" : 
                                         gene.inheritance === "recessive" ? "het" : "visual";
    
    setter(prev => ({
      ...prev,
      genes: [...prev.genes, { gene, status: defaultStatus, possibleHetPercentage: 66 }]
    }));
  };

  const updateGeneStatus = (parentNum: 1 | 2, geneName: string, status: AlleleStatus) => {
    const setter = parentNum === 1 ? setParent1 : setParent2;
    setter(prev => ({
      ...prev,
      genes: prev.genes.map(g => g.gene.name === geneName ? { ...g, status } : g)
    }));
  };

  const updatePossHetPct = (parentNum: 1 | 2, geneName: string, pct: number) => {
    const setter = parentNum === 1 ? setParent1 : setParent2;
    setter(prev => ({
      ...prev,
      genes: prev.genes.map(g => g.gene.name === geneName ? { ...g, possibleHetPercentage: pct } : g)
    }));
  };

  const removeGene = (parentNum: 1 | 2, geneName: string) => {
    const updatedParent = {
      ...(parentNum === 1 ? parent1 : parent2),
      genes: (parentNum === 1 ? parent1 : parent2).genes.filter(g => g.gene.name !== geneName)
    };

    const nextParent1 = parentNum === 1 ? updatedParent : parent1;
    const nextParent2 = parentNum === 2 ? updatedParent : parent2;

    syncAfterParentChange(nextParent1, nextParent2);
  };

  const calculate = () => {
    const offspringResults = calculateMultiGeneCross(parent1.genes, parent2.genes);
    setResults(offspringResults);
  };

  const getStatusOptions = (gene: MorphGene): { value: AlleleStatus; label: string }[] => {
    switch (gene.inheritance) {
      case "recessive":
        return [
          { value: "visual", label: `${gene.name} (visuel)` },
          { value: "het", label: `Het ${gene.name} (100%)` },
          { value: "possible_het", label: `Poss. Het ${gene.name}` },
          { value: "none", label: "Aucun" },
        ];
      case "codominant":
        return [
          { value: "super", label: gene.superForm || `Super ${gene.name}` },
          { value: "visual", label: `${gene.name} (visuel)` },
          { value: "possible_het", label: `Poss. Het ${gene.name}` },
          { value: "none", label: "Aucun" },
        ];
      case "dominant":
        return [
          { value: "visual", label: `${gene.name} (visuel)` },
          { value: "possible_het", label: `Poss. ${gene.name}` },
          { value: "none", label: "Aucun" },
        ];
      default:
        return [
          { value: "visual", label: gene.name },
          { value: "none", label: "Aucun" },
        ];
    }
  };

  const getInheritanceBadge = (inheritance: string) => {
    switch (inheritance) {
      case "recessive": return <Badge variant="outline" className="text-[10px] border-orange-500/50 text-orange-500">Récessif</Badge>;
      case "codominant": return <Badge variant="outline" className="text-[10px] border-blue-500/50 text-blue-500">Codominant</Badge>;
      case "dominant": return <Badge variant="outline" className="text-[10px] border-green-500/50 text-green-500">Dominant</Badge>;
      default: return null;
    }
  };

  const getResultColor = (result: OffspringResult) => {
    if (result.percentage >= 25) return "bg-primary/20 border-primary/40 text-primary";
    if (result.percentage >= 12) return "bg-blue-500/20 border-blue-500/40 text-blue-500";
    if (result.percentage >= 6) return "bg-amber-500/20 border-amber-500/40 text-amber-500";
    return "bg-muted border-border text-muted-foreground";
  };

  const groupedSpecies = useMemo(() => {
    const groups: Record<string, typeof speciesGenetics> = {};
    speciesGenetics.forEach(s => {
      const cat = s.category === "snake" ? "🐍 Serpents" : 
                  s.category === "lizard" ? "🦎 Lézards" : "🐢 Tortues";
      if (!groups[cat]) groups[cat] = [];
      groups[cat].push(s);
    });
    return groups;
  }, []);

  const filteredReptiles = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    const oppositeParent = pickingParent === 1 ? parent2 : parent1;
    const requiredSpecies = oppositeParent.reptileSpecies || selectedSpecies || null;
    const requiredSex = getOppositeSex(oppositeParent.reptileSex) || (pickingParent === 1 ? "male" : "female");

    return reptileOptions.filter((reptile) => {
      const matchesSearch = !q ||
        reptile.name.toLowerCase().includes(q) ||
        reptile.species.toLowerCase().includes(q) ||
        (reptile.morphs || []).some((morph) => morph.toLowerCase().includes(q));

      if (!matchesSearch || !reptile.genetics || !reptile.geneticsSpecies) return false;
      if (requiredSpecies && reptile.geneticsSpecies !== requiredSpecies) return false;
      if (requiredSex && reptile.sex !== requiredSex) return false;
      if (oppositeParent.reptileId && reptile.id === oppositeParent.reptileId) return false;

      return true;
    });
  }, [reptileOptions, searchQuery, pickingParent, parent1, parent2, selectedSpecies]);

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <main className="max-w-4xl mx-auto px-4 py-6 md:mt-16" style={{ paddingBottom: 'calc(6rem + env(safe-area-inset-bottom))' }}>
        {/* Header */}
        <div className="mb-6">
          <Button variant="ghost" size="sm" onClick={() => navigate(-1)} className="mb-3 -ml-2">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Retour
          </Button>
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2.5 rounded-xl bg-gradient-to-br from-purple-500/20 to-pink-500/20 border border-purple-500/30">
              <Dna className="w-6 h-6 text-purple-400" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-foreground">Calculateur Génétique</h1>
              <p className="text-sm text-muted-foreground">Prédiction des morphs pour vos reproductions</p>
            </div>
          </div>
          {(selectedSpecies || parent1.genes.length > 0 || parent2.genes.length > 0 || results) && (
            <Button variant="outline" size="sm" onClick={resetAll} className="gap-2 mt-2">
              <RotateCcw className="w-4 h-4" />
              Réinitialiser
            </Button>
          )}
        </div>

        {/* Species Selection */}
        <Card className="mb-6 border-border/50">
          <CardContent className="pt-6">
            <label className="text-sm font-medium text-foreground mb-2 block">Espèce</label>
            <Select value={selectedSpecies} onValueChange={handleSpeciesChange}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Sélectionner une espèce..." />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(groupedSpecies).map(([category, species]) => (
                  <div key={category}>
                    <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground">{category}</div>
                    {species.map(s => (
                      <SelectItem key={s.species} value={s.species}>
                        {s.species} — {s.commonName}
                      </SelectItem>
                    ))}
                  </div>
                ))}
              </SelectContent>
            </Select>
          </CardContent>
        </Card>

        {speciesData && (
          <>
            <div className="flex items-center gap-2 mb-4 p-3 rounded-lg bg-muted/50 border border-border/50">
              <Info className="w-4 h-4 text-muted-foreground flex-shrink-0" />
              <p className="text-xs text-muted-foreground">
                {speciesData.genes.length} gènes disponibles pour {speciesData.commonName} — 
                Ajoutez les morphs de chaque parent pour calculer les probabilités
              </p>
            </div>

            {/* Parents Side by Side */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <ParentCard
                title="♂ Parent 1"
                parent={parent1}
                parentNum={1}
                availableGenes={availableGenes}
                onAddGene={(gene) => addGeneToParent(1, gene)}
                onUpdateStatus={(name, status) => updateGeneStatus(1, name, status)}
                onUpdatePossHetPct={(name, pct) => updatePossHetPct(1, name, pct)}
                onRemoveGene={(name) => removeGene(1, name)}
                getStatusOptions={getStatusOptions}
                getInheritanceBadge={getInheritanceBadge}
                onPickReptile={() => setPickingParent(1)}
                onClearParent={() => clearParent(1)}
                hasReptiles={!!reptiles && reptiles.length > 0}
              />
              <ParentCard
                title="♀ Parent 2"
                parent={parent2}
                parentNum={2}
                availableGenes={availableGenes}
                onAddGene={(gene) => addGeneToParent(2, gene)}
                onUpdateStatus={(name, status) => updateGeneStatus(2, name, status)}
                onUpdatePossHetPct={(name, pct) => updatePossHetPct(2, name, pct)}
                onRemoveGene={(name) => removeGene(2, name)}
                getStatusOptions={getStatusOptions}
                getInheritanceBadge={getInheritanceBadge}
                onPickReptile={() => setPickingParent(2)}
                onClearParent={() => clearParent(2)}
                hasReptiles={!!reptiles && reptiles.length > 0}
              />
            </div>

            {/* Calculate Button */}
            <Button 
              onClick={calculate}
              className="w-full mb-6 h-12 text-base font-semibold bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
              disabled={parent1.genes.length === 0 && parent2.genes.length === 0}
            >
              <FlaskConical className="w-5 h-5 mr-2" />
              Calculer les probabilités
            </Button>

            {/* Results */}
            {results && (
              <Card className="border-purple-500/30 bg-card/80">
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Baby className="w-5 h-5 text-purple-400" />
                    Résultats — Descendance possible
                  </CardTitle>
                  <p className="text-xs text-muted-foreground">
                    Probabilités calculées selon les lois de Mendel
                  </p>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {results.map((result, i) => (
                      <div key={i} className={`flex items-center justify-between p-3 rounded-lg border ${getResultColor(result)}`}>
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-sm truncate">{result.genotype}</p>
                          <p className="text-xs opacity-75">{result.description}</p>
                        </div>
                        <div className="flex items-center gap-2 flex-shrink-0 ml-3">
                          <div className="text-right">
                            <p className="text-lg font-bold">{result.percentage}%</p>
                          </div>
                          <div className="w-16 h-2 bg-background/50 rounded-full overflow-hidden">
                            <div 
                              className="h-full rounded-full bg-current opacity-60" 
                              style={{ width: `${Math.min(result.percentage, 100)}%` }} 
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="mt-4 pt-4 border-t border-border/50">
                    <p className="text-xs font-medium text-muted-foreground mb-2">Légende :</p>
                    <div className="flex flex-wrap gap-2 text-[10px] text-muted-foreground">
                      <span>🟢 Visuel = animal exprime le morph</span>
                      <span>🔵 Het = porteur confirmé</span>
                      <span>🟡 Poss. Het = porteur possible</span>
                      <span>⚪ Normal = type sauvage</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </>
        )}

        {!selectedSpecies && (
          <div className="space-y-4">
            <Card className="border-dashed border-2 border-border/50">
              <CardContent className="py-16 text-center">
                <Dna className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
                <p className="text-muted-foreground font-medium">Sélectionnez une espèce pour commencer</p>
                <p className="text-sm text-muted-foreground/60 mt-1">
                  {speciesGenetics.length} espèces disponibles avec leurs morphs
                </p>
                {reptiles && reptiles.length > 0 && (
                  <div className="mt-6">
                    <p className="text-sm text-muted-foreground mb-3">— ou —</p>
                    <Button 
                      variant="outline" 
                      onClick={() => setPickingParent(1)}
                      className="gap-2"
                    >
                      <Search className="w-4 h-4" />
                      Choisir depuis mes reptiles
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}
      </main>

      {/* Reptile Picker Dialog */}
      <Dialog open={pickingParent !== null} onOpenChange={(open) => { if (!open) { setPickingParent(null); setSearchQuery(""); } }}>
        <DialogContent className="max-w-md max-h-[80vh] flex flex-col">
          <DialogHeader>
            <DialogTitle>Choisir un reptile — Parent {pickingParent}</DialogTitle>
          </DialogHeader>
          <div className="relative mb-3">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Rechercher par nom, espèce, morph..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>
          <div className="overflow-y-auto flex-1 space-y-1">
            {filteredReptiles.length === 0 && (
              <p className="text-sm text-muted-foreground text-center py-8">
                Aucun reptile compatible trouvé pour cette espèce et ce sexe
              </p>
            )}
            {filteredReptiles.map((reptile) => {
              return (
                <ReptilePickerItem key={reptile.id} reptile={reptile} onPick={handlePickReptile} />
              );
            })}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

// === Parent Card Component ===
interface ParentCardProps {
  title: string;
  parent: ParentConfig;
  parentNum: 1 | 2;
  availableGenes: MorphGene[];
  onAddGene: (gene: MorphGene) => void;
  onUpdateStatus: (name: string, status: AlleleStatus) => void;
  onUpdatePossHetPct: (name: string, pct: number) => void;
  onRemoveGene: (name: string) => void;
  getStatusOptions: (gene: MorphGene) => { value: AlleleStatus; label: string }[];
  getInheritanceBadge: (inheritance: string) => React.ReactNode;
  onPickReptile: () => void;
  onClearParent: () => void;
  hasReptiles: boolean;
}

const ParentCard = ({
  title, parent, parentNum, availableGenes,
  onAddGene, onUpdateStatus, onUpdatePossHetPct, onRemoveGene,
  getStatusOptions, getInheritanceBadge, onPickReptile, onClearParent, hasReptiles
}: ParentCardProps) => {
  const unusedGenes = availableGenes.filter(
    g => !parent.genes.find(pg => pg.gene.name === g.name)
  );
  const hasParentData = Boolean(parent.reptileId) || parent.genes.length > 0;

  return (
    <Card className="border-border/50">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base flex items-center gap-2">
            {title}
            <Badge variant="secondary" className="text-[10px]">
              {parent.genes.length} gène{parent.genes.length > 1 ? 's' : ''}
            </Badge>
          </CardTitle>
          <div className="flex items-center gap-1">
            {hasParentData && (
              <Button variant="ghost" size="icon" onClick={onClearParent} className="h-7 w-7 text-muted-foreground hover:text-foreground">
                <X className="w-3.5 h-3.5" />
              </Button>
            )}
            {hasReptiles && (
              <Button variant="ghost" size="sm" onClick={onPickReptile} className="text-xs h-7 gap-1 text-primary">
                <Search className="w-3 h-3" />
                Mes reptiles
              </Button>
            )}
          </div>
        </div>
        {parent.reptileName && (
          <div className="flex items-center gap-1.5 mt-1">
            <Badge variant="outline" className="text-[10px] gap-1 border-primary/30 text-primary">
              🦎 {parent.reptileName}
            </Badge>
          </div>
        )}
      </CardHeader>
      <CardContent className="space-y-3">
        {/* Selected genes */}
        {parent.genes.map(pg => (
          <div key={pg.gene.name} className="p-2.5 rounded-lg bg-muted/50 border border-border/50 space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium">{pg.gene.name}</span>
                {getInheritanceBadge(pg.gene.inheritance)}
              </div>
              <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => onRemoveGene(pg.gene.name)}>
                <X className="w-3 h-3" />
              </Button>
            </div>
            <Select value={pg.status} onValueChange={(v) => onUpdateStatus(pg.gene.name, v as AlleleStatus)}>
              <SelectTrigger className="h-8 text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {getStatusOptions(pg.gene).map(opt => (
                  <SelectItem key={opt.value} value={opt.value} className="text-xs">
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {pg.status === "possible_het" && (
              <div className="flex items-center gap-2">
                <span className="text-[10px] text-muted-foreground">Probabilité :</span>
                <Select 
                  value={String(pg.possibleHetPercentage || 66)} 
                  onValueChange={(v) => onUpdatePossHetPct(pg.gene.name, Number(v))}
                >
                  <SelectTrigger className="h-7 text-xs w-24">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="50" className="text-xs">50%</SelectItem>
                    <SelectItem value="66" className="text-xs">66%</SelectItem>
                    <SelectItem value="100" className="text-xs">100%</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>
        ))}

        {/* Add gene */}
        {unusedGenes.length > 0 && (
          <Select onValueChange={(name) => {
            const gene = availableGenes.find(g => g.name === name);
            if (gene) onAddGene(gene);
          }}>
            <SelectTrigger className="h-9 text-xs border-dashed">
              <div className="flex items-center gap-1.5 text-muted-foreground">
                <Plus className="w-3 h-3" />
                Ajouter un gène
              </div>
            </SelectTrigger>
            <SelectContent>
              {unusedGenes.map(g => (
                <SelectItem key={g.name} value={g.name} className="text-xs">
                  <div className="flex items-center gap-2">
                    {g.name}
                    <span className="text-[10px] text-muted-foreground">
                      ({g.inheritance === "recessive" ? "réc." : g.inheritance === "codominant" ? "codom." : "dom."})
                    </span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}

        {parent.genes.length === 0 && unusedGenes.length > 0 && (
          <p className="text-xs text-muted-foreground text-center py-2">
            Ajoutez les morphs de ce parent
          </p>
        )}
      </CardContent>
    </Card>
  );
};

export default MorphCalculator;
