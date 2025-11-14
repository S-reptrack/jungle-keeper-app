import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Check } from "lucide-react";

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
  const [hatchedEggs, setHatchedEggs] = useState<number>(0);
  const [unhatchedEggs, setUnhatchedEggs] = useState<number>(0);
  const [stillbornJuveniles, setStillbornJuveniles] = useState<number>(0);
  const [notes, setNotes] = useState("");
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const { error } = await supabase
        .from("reproduction_observations")
        .update({
          closed: true,
          closed_at: new Date().toISOString().split('T')[0],
          hatched_eggs: hatchedEggs,
          unhatched_eggs: unhatchedEggs,
          stillborn_juveniles: stillbornJuveniles,
          outcome_notes: notes || null,
        })
        .eq("id", observationId);

      if (error) throw error;

      toast.success("Éclosion clôturée avec succès");
      onOpenChange(false);
      onSuccess();
      
      // Reset form
      setHatchedEggs(0);
      setUnhatchedEggs(0);
      setStillbornJuveniles(0);
      setNotes("");
    } catch (error: any) {
      console.error("Error closing hatching:", error);
      toast.error("Erreur lors de la clôture de l'éclosion");
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
            Clôturer l'éclosion - {reptileName}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="text-sm text-muted-foreground">
            Date prévue : {new Date(expectedHatchDate).toLocaleDateString("fr-FR")}
          </div>

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
            <Label htmlFor="stillborn">Juvéniles mort-nés</Label>
            <Input
              id="stillborn"
              type="number"
              min="0"
              value={stillbornJuveniles}
              onChange={(e) => setStillbornJuveniles(parseInt(e.target.value) || 0)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notes complémentaires (facultatif)</Label>
            <Textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Observations, problèmes rencontrés, etc."
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
              {saving ? "Enregistrement..." : "Clôturer l'éclosion"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
