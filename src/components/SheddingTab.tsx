import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Plus, Trash2, Sparkles } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

interface SheddingRecord {
  id: string;
  shedding_date: string;
  quality: string;
  notes: string | null;
  created_at: string;
}

interface SheddingTabProps {
  reptileId: string;
  readOnly?: boolean;
}

const qualityOptions = [
  { value: "complete", label: "Complète", color: "bg-green-500/20 text-green-700 dark:text-green-400 border-green-500/30" },
  { value: "partial", label: "Partielle", color: "bg-yellow-500/20 text-yellow-700 dark:text-yellow-400 border-yellow-500/30" },
  { value: "problematic", label: "Problématique", color: "bg-red-500/20 text-red-700 dark:text-red-400 border-red-500/30" },
];

const SheddingTab = ({ reptileId, readOnly = false }: SheddingTabProps) => {
  const { t } = useTranslation();
  const [records, setRecords] = useState<SheddingRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [sheddingDate, setSheddingDate] = useState(new Date().toISOString().split("T")[0]);
  const [quality, setQuality] = useState("complete");
  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const fetchRecords = async () => {
    try {
      const { data, error } = await supabase
        .from("shedding_records")
        .select("*")
        .eq("reptile_id", reptileId)
        .order("shedding_date", { ascending: false });

      if (error) throw error;
      setRecords(data || []);
    } catch (error) {
      console.error("Error fetching shedding records:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRecords();
  }, [reptileId]);

  const handleSubmit = async () => {
    if (!sheddingDate) {
      toast.error("Veuillez sélectionner une date");
      return;
    }

    setSubmitting(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error("Vous devez être connecté");
        return;
      }

      const { error } = await supabase
        .from("shedding_records")
        .insert({
          reptile_id: reptileId,
          user_id: user.id,
          shedding_date: sheddingDate,
          quality,
          notes: notes || null,
        });

      if (error) throw error;

      toast.success("Mue enregistrée avec succès");
      setDialogOpen(false);
      setSheddingDate(new Date().toISOString().split("T")[0]);
      setQuality("complete");
      setNotes("");
      fetchRecords();
    } catch (error) {
      console.error("Error adding shedding record:", error);
      toast.error("Erreur lors de l'enregistrement de la mue");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (recordId: string) => {
    const confirmDelete = window.confirm("Supprimer cet enregistrement de mue ?");
    if (!confirmDelete) return;

    try {
      const { error } = await supabase
        .from("shedding_records")
        .delete()
        .eq("id", recordId);

      if (error) throw error;

      toast.success("Enregistrement supprimé");
      fetchRecords();
    } catch (error) {
      console.error("Error deleting shedding record:", error);
      toast.error("Erreur lors de la suppression");
    }
  };

  const getQualityBadge = (qualityValue: string) => {
    const option = qualityOptions.find(o => o.value === qualityValue);
    if (!option) return null;
    return (
      <Badge variant="outline" className={option.color}>
        {option.label}
      </Badge>
    );
  };

  const formatDate = (dateString: string) => {
    const [year, month, day] = dateString.split("-").map(Number);
    return format(new Date(year, month - 1, day), "d MMMM yyyy", { locale: fr });
  };

  // Calculate interval between sheds
  const getInterval = (index: number): string | null => {
    if (index >= records.length - 1) return null;
    const current = new Date(records[index].shedding_date);
    const previous = new Date(records[index + 1].shedding_date);
    const diffDays = Math.floor((current.getTime() - previous.getTime()) / (1000 * 60 * 60 * 24));
    return `${diffDays} jours`;
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="w-5 h-5" />
            Historique des mues
          </CardTitle>
          {!readOnly && (
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
              <DialogTrigger asChild>
                <Button size="sm" className="gap-1">
                  <Plus className="w-4 h-4" />
                  Ajouter une mue
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Enregistrer une mue</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 pt-2">
                  <div>
                    <Label htmlFor="shedding-date">Date de la mue</Label>
                    <Input
                      id="shedding-date"
                      type="date"
                      value={sheddingDate}
                      onChange={(e) => setSheddingDate(e.target.value)}
                      max={new Date().toISOString().split("T")[0]}
                    />
                  </div>
                  <div>
                    <Label htmlFor="quality">Qualité de la mue</Label>
                    <Select value={quality} onValueChange={setQuality}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {qualityOptions.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="notes">Notes (optionnel)</Label>
                    <Textarea
                      id="notes"
                      placeholder="Ex: Mue en un seul morceau, pas de rétention..."
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      rows={3}
                    />
                  </div>
                  <Button
                    onClick={handleSubmit}
                    disabled={submitting}
                    className="w-full"
                  >
                    {submitting ? "Enregistrement..." : "Enregistrer la mue"}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          )}
        </CardHeader>
        <CardContent>
          {records.length === 0 ? (
            <div className="text-center py-8">
              <Sparkles className="w-12 h-12 mx-auto text-muted-foreground/30 mb-3" />
              <p className="text-muted-foreground">Aucune mue enregistrée</p>
              {!readOnly && (
                <p className="text-sm text-muted-foreground mt-1">
                  Cliquez sur "Ajouter une mue" pour commencer le suivi
                </p>
              )}
            </div>
          ) : (
            <div className="space-y-3">
              {records.map((record, index) => {
                const interval = getInterval(index);
                return (
                  <div
                    key={record.id}
                    className="flex items-start justify-between p-3 rounded-lg border border-border bg-card hover:bg-accent/5 transition-colors"
                  >
                    <div className="space-y-1 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-medium text-sm">
                          {formatDate(record.shedding_date)}
                        </span>
                        {getQualityBadge(record.quality)}
                        {interval && (
                          <span className="text-xs text-muted-foreground">
                            (+{interval})
                          </span>
                        )}
                      </div>
                      {record.notes && (
                        <p className="text-sm text-muted-foreground">{record.notes}</p>
                      )}
                    </div>
                    {!readOnly && (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="shrink-0 text-destructive hover:text-destructive"
                        onClick={() => handleDelete(record.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default SheddingTab;
