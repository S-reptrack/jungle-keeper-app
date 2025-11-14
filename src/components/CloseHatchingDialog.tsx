import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Check } from "lucide-react";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

interface CloseHatchingDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  observationId: string;
  reptileName: string;
  expectedHatchDate: string;
  onSuccess: () => void;
}

export function CloseHatchingDialog({
  open,
  onOpenChange,
  observationId,
  reptileName,
  expectedHatchDate,
  onSuccess,
}: CloseHatchingDialogProps) {
  const [reproductionType, setReproductionType] = useState<"oviparous" | "viviparous">("oviparous");
  const [hatchedEggs, setHatchedEggs] = useState<number>(0);
  const [unhatchedEggs, setUnhatchedEggs] = useState<number>(0);
  const [liveborns, setLiveborns] = useState<number>(0);
  const [stillbornJuveniles, setStillbornJuveniles] = useState<number>(0);
  const [notes, setNotes] = useState("");
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
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
    } catch (error: any) {
      console.error("Error closing reproduction:", error);
      toast.error("Erreur lors de la clôture");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
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
                  Ovipare (ponte d'œufs - pythons, lézards, etc.)
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="viviparous" id="viviparous" />
                <Label htmlFor="viviparous" className="font-normal cursor-pointer">
                  Vivipare (mise bas - boas, vipères, etc.)
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
                  onChange={(e) => setHatchedEggs(parseInt(e.target.value) || 0)}
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
                  onChange={(e) => setLiveborns(parseInt(e.target.value) || 0)}
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
