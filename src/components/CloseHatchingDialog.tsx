import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Check } from "lucide-react";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useAuth } from "@/hooks/useAuth";

interface JuvenileEntry {
  name: string;
  sex: string;
}

interface CloseHatchingDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  observationId: string;
  reptileName: string;
  expectedHatchDate: string;
  motherId: string;
  fatherId: string;
  species: string;
  category: string;
  onSuccess: () => void;
}

export function CloseHatchingDialog({
  open,
  onOpenChange,
  observationId,
  reptileName,
  expectedHatchDate,
  motherId,
  fatherId,
  species,
  category,
  onSuccess,
}: CloseHatchingDialogProps) {
  const { user } = useAuth();
  const [reproductionType, setReproductionType] = useState<"oviparous" | "viviparous">("oviparous");
  const [hatchedEggs, setHatchedEggs] = useState<number>(0);
  const [unhatchedEggs, setUnhatchedEggs] = useState<number>(0);
  const [liveborns, setLiveborns] = useState<number>(0);
  const [stillbornJuveniles, setStillbornJuveniles] = useState<number>(0);
  const [notes, setNotes] = useState("");
  const [saving, setSaving] = useState(false);
  const [createJuveniles, setCreateJuveniles] = useState(false);
  const [juveniles, setJuveniles] = useState<JuvenileEntry[]>([]);

  const liveCount = reproductionType === "oviparous" ? hatchedEggs : liveborns;

  const handleLiveCountChange = (count: number) => {
    if (reproductionType === "oviparous") {
      setHatchedEggs(count);
    } else {
      setLiveborns(count);
    }
    // Update juveniles array to match count
    setJuveniles(prev => {
      if (count > prev.length) {
        return [...prev, ...Array(count - prev.length).fill(null).map((_, i) => ({
          name: `Juvénile ${prev.length + i + 1}`,
          sex: "unknown",
        }))];
      }
      return prev.slice(0, count);
    });
  };

  const updateJuvenile = (index: number, field: keyof JuvenileEntry, value: string) => {
    setJuveniles(prev => prev.map((j, i) => i === index ? { ...j, [field]: value } : j));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setSaving(true);

    try {
      // 1. Close the reproduction observation
      const updateData: any = reproductionType === "oviparous"
        ? {
            closed: true,
            closed_at: new Date().toISOString().split('T')[0],
            hatched_eggs: hatchedEggs,
            unhatched_eggs: unhatchedEggs,
            stillborn_juveniles: stillbornJuveniles,
            outcome_notes: notes || null,
          }
        : {
            closed: true,
            closed_at: new Date().toISOString().split('T')[0],
            hatched_eggs: liveborns,
            unhatched_eggs: 0,
            stillborn_juveniles: stillbornJuveniles,
            outcome_notes: notes || null,
          };

      const { error } = await supabase
        .from("reproduction_observations")
        .update(updateData)
        .eq("id", observationId);

      if (error) throw error;

      // 2. Create juvenile records if requested
      if (createJuveniles && liveCount > 0) {
        const birthDate = new Date().toISOString().split('T')[0];

        for (const juvenile of juveniles) {
          // Create reptile record
          const { data: newReptile, error: reptileError } = await supabase
            .from("reptiles")
            .insert({
              user_id: user.id,
              name: juvenile.name,
              species: species,
              category: category,
              sex: juvenile.sex === "unknown" ? null : juvenile.sex,
              birth_date: birthDate,
              status: "active",
            })
            .select("id")
            .single();

          if (reptileError) {
            console.error("Error creating juvenile:", reptileError);
            continue;
          }

          // Create genealogy links
          if (newReptile) {
            const genealogyEntries = [];
            if (motherId) {
              genealogyEntries.push({
                reptile_id: newReptile.id,
                parent_id: motherId,
                parent_type: "mother",
                user_id: user.id,
              });
            }
            if (fatherId) {
              genealogyEntries.push({
                reptile_id: newReptile.id,
                parent_id: fatherId,
                parent_type: "father",
                user_id: user.id,
              });
            }
            if (genealogyEntries.length > 0) {
              await supabase.from("reptile_genealogy").insert(genealogyEntries);
            }
          }
        }

        toast.success(`${liveCount} fiche(s) juvénile(s) créée(s) avec liens de parenté`);
      }

      const successMessage = reproductionType === "oviparous"
        ? "Éclosion clôturée avec succès"
        : "Mise bas clôturée avec succès";
      toast.success(successMessage);
      onOpenChange(false);
      onSuccess();

      // Reset form
      setReproductionType("oviparous");
      setHatchedEggs(0);
      setUnhatchedEggs(0);
      setLiveborns(0);
      setStillbornJuveniles(0);
      setNotes("");
      setCreateJuveniles(false);
      setJuveniles([]);
    } catch (error: any) {
      console.error("Error closing reproduction:", error);
      toast.error("Erreur lors de la clôture");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Check className="h-5 w-5 text-green-600" />
            Clôturer la reproduction - {reptileName}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="text-sm text-muted-foreground">
            Date prévue : {new Date(expectedHatchDate).toLocaleDateString("fr-FR")}
          </div>

          <div className="space-y-3">
            <Label>Type de reproduction</Label>
            <RadioGroup value={reproductionType} onValueChange={(value: any) => setReproductionType(value)}>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="oviparous" id="oviparous" />
                <Label htmlFor="oviparous" className="font-normal cursor-pointer">
                  Ovipare (ponte d'œufs)
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="viviparous" id="viviparous" />
                <Label htmlFor="viviparous" className="font-normal cursor-pointer">
                  Vivipare (mise bas)
                </Label>
              </div>
            </RadioGroup>
          </div>

          {reproductionType === "oviparous" ? (
            <>
              <div className="space-y-2">
                <Label htmlFor="hatched">Œufs éclos (juvéniles vivants)</Label>
                <Input
                  id="hatched"
                  type="number"
                  min="0"
                  value={hatchedEggs}
                  onChange={(e) => handleLiveCountChange(parseInt(e.target.value) || 0)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="unhatched">Œufs non éclos</Label>
                <Input
                  id="unhatched"
                  type="number"
                  min="0"
                  value={unhatchedEggs}
                  onChange={(e) => setUnhatchedEggs(parseInt(e.target.value) || 0)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="stillborn">Juvéniles mort-nés (éclos mais morts)</Label>
                <Input
                  id="stillborn"
                  type="number"
                  min="0"
                  value={stillbornJuveniles}
                  onChange={(e) => setStillbornJuveniles(parseInt(e.target.value) || 0)}
                />
              </div>
            </>
          ) : (
            <>
              <div className="space-y-2">
                <Label htmlFor="liveborns">Juvéniles nés vivants</Label>
                <Input
                  id="liveborns"
                  type="number"
                  min="0"
                  value={liveborns}
                  onChange={(e) => handleLiveCountChange(parseInt(e.target.value) || 0)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="stillborn-viv">Juvéniles mort-nés</Label>
                <Input
                  id="stillborn-viv"
                  type="number"
                  min="0"
                  value={stillbornJuveniles}
                  onChange={(e) => setStillbornJuveniles(parseInt(e.target.value) || 0)}
                />
              </div>
            </>
          )}

          {/* Option to auto-create juvenile records */}
          {liveCount > 0 && (
            <div className="border rounded-lg p-4 space-y-3 bg-muted/30">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="create-juveniles"
                  checked={createJuveniles}
                  onCheckedChange={(checked) => setCreateJuveniles(checked === true)}
                />
                <Label htmlFor="create-juveniles" className="font-medium cursor-pointer">
                  Créer automatiquement {liveCount} fiche{liveCount > 1 ? "s" : ""} juvénile{liveCount > 1 ? "s" : ""}
                </Label>
              </div>
              <p className="text-xs text-muted-foreground">
                Les fiches seront pré-remplies avec l'espèce ({species}), la date de naissance et les liens de parenté.
              </p>

              {createJuveniles && juveniles.length > 0 && (
                <div className="space-y-2 mt-2">
                  {juveniles.map((juvenile, index) => (
                    <div key={index} className="flex gap-2 items-center">
                      <Input
                        value={juvenile.name}
                        onChange={(e) => updateJuvenile(index, "name", e.target.value)}
                        placeholder={`Nom juvénile ${index + 1}`}
                        className="flex-1"
                      />
                      <select
                        value={juvenile.sex}
                        onChange={(e) => updateJuvenile(index, "sex", e.target.value)}
                        className="h-10 px-3 rounded-md border border-input bg-background text-sm"
                      >
                        <option value="unknown">Sexe ?</option>
                        <option value="male">♂ Mâle</option>
                        <option value="female">♀ Femelle</option>
                      </select>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="notes">Notes complémentaires (facultatif)</Label>
            <Textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Observations, problèmes rencontrés, durée de la mise bas, etc."
              rows={3}
            />
          </div>

          <div className="flex gap-2 justify-end pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={saving}
            >
              Annuler
            </Button>
            <Button type="submit" disabled={saving}>
              {saving ? "Enregistrement..." : "Clôturer"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
