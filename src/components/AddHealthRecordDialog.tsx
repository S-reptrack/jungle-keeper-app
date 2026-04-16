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

const CONDITION_KEYS = [
  "prolapsus", "stomatite", "acariens", "infection_respiratoire",
  "deshydratation", "retention_oeufs", "mbd", "parasites_internes",
  "abces", "brulures", "mue_difficile", "regurgitation", "autre",
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
      toast.error(t("addHealth.fillRequired"));
      return;
    }

    try {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        toast.error(t("addHealth.loginRequired"));
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

      toast.success(t("addHealth.success"));
      setOpen(false);
      resetForm();
      onRecordAdded();
    } catch (error) {
      console.error("Error adding health record:", error);
      toast.error(t("addHealth.error"));
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
          {t("addHealth.addButton")}
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{t("addHealth.title")}</DialogTitle>
          <DialogDescription>{t("addHealth.description")}</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="condition">{t("addHealth.condition")}</Label>
            <Select value={condition} onValueChange={setCondition}>
              <SelectTrigger>
                <SelectValue placeholder={t("addHealth.selectCondition")} />
              </SelectTrigger>
              <SelectContent>
                {CONDITION_KEYS.map((key) => (
                  <SelectItem key={key} value={t(`conditions.${key}`)}>
                    {t(`conditions.${key}`)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="diagnosisDate">{t("addHealth.diagnosisDate")}</Label>
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
            <Label htmlFor="treatment">{t("addHealth.treatment")}</Label>
            <Textarea
              id="treatment"
              value={treatment}
              onChange={(e) => setTreatment(e.target.value)}
              placeholder={t("addHealth.treatmentPlaceholder")}
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">{t("addHealth.additionalNotes")}</Label>
            <Textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder={t("addHealth.additionalNotesPlaceholder")}
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
              {t("addHealth.resolved")}
            </Label>
          </div>

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              {t("addHealth.cancel")}
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? t("addHealth.adding") : t("addHealth.add")}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AddHealthRecordDialog;
