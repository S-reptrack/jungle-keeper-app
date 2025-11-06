import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface AddHealthRecordDialogProps {
  reptileId: string;
  onRecordAdded: () => void;
}

const COMMON_CONDITIONS = [
  { value: "prolapsus", label: "Prolapsus" },
  { value: "stomatite", label: "Stomatite (Mouth Rot)" },
  { value: "acariens", label: "Acariens (Mites)" },
  { value: "infection_respiratoire", label: "Infection respiratoire" },
  { value: "deshydratation", label: "Déshydratation" },
  { value: "retention_oeufs", label: "Rétention d'œufs" },
  { value: "mbd", label: "Maladie métabolique osseuse (MBD)" },
  { value: "parasites_internes", label: "Parasites internes" },
  { value: "abces", label: "Abcès" },
  { value: "brulures", label: "Brûlures thermiques" },
  { value: "mue_difficile", label: "Mue difficile (Dysecdysis)" },
  { value: "autre", label: "Autre" },
];

const AddHealthRecordDialog = ({ reptileId, onRecordAdded }: AddHealthRecordDialogProps) => {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const [condition, setCondition] = useState("");
  const [diagnosisDate, setDiagnosisDate] = useState(new Date().toISOString().split('T')[0]);
  const [notes, setNotes] = useState("");
  const [treatment, setTreatment] = useState("");
  const [resolved, setResolved] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!condition || !diagnosisDate) {
      toast.error("Veuillez remplir tous les champs requis");
      return;
    }

    try {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        toast.error("Vous devez être connecté");
        return;
      }

      const { error } = await supabase
        .from("health_records")
        .insert({
          reptile_id: reptileId,
          user_id: user.id,
          condition,
          diagnosis_date: diagnosisDate,
          notes: notes || null,
          treatment: treatment || null,
          resolved,
        });

      if (error) throw error;

      toast.success("Problème de santé ajouté avec succès");
      setOpen(false);
      resetForm();
      onRecordAdded();
    } catch (error) {
      console.error("Error adding health record:", error);
      toast.error("Erreur lors de l'ajout du problème de santé");
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setCondition("");
    setDiagnosisDate(new Date().toISOString().split('T')[0]);
    setNotes("");
    setTreatment("");
    setResolved(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="w-4 h-4 mr-2" />
          Ajouter un problème
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Ajouter un problème de santé</DialogTitle>
          <DialogDescription>
            Enregistrez les problèmes de santé de votre reptile
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="condition">Condition *</Label>
            <Select value={condition} onValueChange={setCondition}>
              <SelectTrigger>
                <SelectValue placeholder="Sélectionnez une maladie" />
              </SelectTrigger>
              <SelectContent>
                {COMMON_CONDITIONS.map((cond) => (
                  <SelectItem key={cond.value} value={cond.label}>
                    {cond.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="diagnosisDate">Date de diagnostic *</Label>
            <Input
              id="diagnosisDate"
              type="date"
              value={diagnosisDate}
              onChange={(e) => setDiagnosisDate(e.target.value)}
              max={new Date().toISOString().split('T')[0]}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="treatment">Traitement</Label>
            <Textarea
              id="treatment"
              value={treatment}
              onChange={(e) => setTreatment(e.target.value)}
              placeholder="Décrivez le traitement appliqué..."
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notes complémentaires</Label>
            <Textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Ajoutez des détails supplémentaires..."
              rows={3}
            />
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="resolved"
              checked={resolved}
              onCheckedChange={(checked) => setResolved(checked as boolean)}
            />
            <Label htmlFor="resolved" className="cursor-pointer">
              Problème résolu
            </Label>
          </div>

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Annuler
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Ajout..." : "Ajouter"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AddHealthRecordDialog;
