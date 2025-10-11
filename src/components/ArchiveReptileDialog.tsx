import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Archive } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface ArchiveReptileDialogProps {
  reptileId: string;
  onArchived: () => void;
}

const ArchiveReptileDialog = ({ reptileId, onArchived }: ArchiveReptileDialogProps) => {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const [status, setStatus] = useState<"deceased" | "sold">("deceased");
  const [date, setDate] = useState<Date>();
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!date) {
      toast.error("Veuillez sélectionner une date");
      return;
    }

    try {
      setLoading(true);
      const { error } = await supabase
        .from("reptiles")
        .update({
          status,
          status_date: format(date, "yyyy-MM-dd"),
          archive_notes: notes || null,
        })
        .eq("id", reptileId);

      if (error) throw error;

      toast.success(
        status === "deceased" 
          ? "Le reptile a été marqué comme décédé" 
          : "Le reptile a été marqué comme vendu"
      );
      setOpen(false);
      onArchived();
    } catch (error) {
      console.error("Error archiving reptile:", error);
      toast.error("Erreur lors de l'archivage");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="gap-2">
          <Archive className="w-4 h-4" />
          Archiver
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Archiver le reptile</DialogTitle>
          <DialogDescription>
            Marquez le reptile comme décédé ou vendu. La fiche sera archivée mais conservée pour la traçabilité.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label>Raison de l'archivage</Label>
            <RadioGroup value={status} onValueChange={(v) => setStatus(v as "deceased" | "sold")}>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="deceased" id="deceased" />
                <Label htmlFor="deceased" className="cursor-pointer">Décès</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="sold" id="sold" />
                <Label htmlFor="sold" className="cursor-pointer">Vente</Label>
              </div>
            </RadioGroup>
          </div>

          <div className="space-y-2">
            <Label>Date de l'événement</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !date && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {date ? format(date, "PPP", { locale: fr }) : "Sélectionner une date"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={date}
                  onSelect={setDate}
                  initialFocus
                  locale={fr}
                />
              </PopoverContent>
            </Popover>
          </div>

          <div className="space-y-2">
            <Label>Notes (optionnel)</Label>
            <Textarea
              placeholder="Ex: Vendu à M. Dupont, élevage Python Passion..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Annuler
          </Button>
          <Button onClick={handleSubmit} disabled={loading || !date}>
            {loading ? "Archivage..." : "Archiver"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ArchiveReptileDialog;
