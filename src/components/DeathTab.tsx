import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

interface DeathTabProps {
  reptileId: string;
  reptileName: string;
}

const DeathTab = ({ reptileId, reptileName }: DeathTabProps) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
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
          status: "deceased",
          status_date: format(date, "yyyy-MM-dd"),
          archive_notes: notes || null,
        })
        .eq("id", reptileId);

      if (error) throw error;

      toast.success(`${reptileName} a été marqué comme décédé et archivé`);
      navigate("/reptiles");
    } catch (error) {
      console.error("Error archiving reptile:", error);
      toast.error("Erreur lors de l'archivage");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Heart className="w-5 h-5" />
          Marquer comme décédé
        </CardTitle>
        <CardDescription>
          Archivez {reptileName} comme décédé. Les informations seront conservées pour la traçabilité.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label>Date de décès *</Label>
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
            placeholder="Ex: Cause du décès, circonstances..."
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={4}
          />
        </div>

        <div className="pt-4">
          <Button 
            onClick={handleSubmit} 
            disabled={loading || !date}
            className="w-full"
            variant="destructive"
          >
            {loading ? "Archivage en cours..." : "Marquer comme décédé et archiver"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default DeathTab;
