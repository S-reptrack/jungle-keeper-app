import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Calendar, Save, Edit2, X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface FeedingIntervalCardProps {
  reptileId: string;
  readOnly?: boolean;
}

const FeedingIntervalCard = ({ reptileId, readOnly = false }: FeedingIntervalCardProps) => {
  const [interval, setInterval] = useState<number | null>(null);
  const [editing, setEditing] = useState(false);
  const [tempInterval, setTempInterval] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [lastFeedingDate, setLastFeedingDate] = useState<string | null>(null);

  useEffect(() => {
    fetchData();
  }, [reptileId]);

  const fetchData = async () => {
    try {
      // Fetch reptile's feeding interval
      const { data: reptileData, error: reptileError } = await supabase
        .from("reptiles")
        .select("feeding_interval_days")
        .eq("id", reptileId)
        .single();

      if (reptileError) throw reptileError;
      
      setInterval(reptileData.feeding_interval_days);

      // Fetch last feeding date
      const { data: feedingData, error: feedingError } = await supabase
        .from("feedings")
        .select("feeding_date")
        .eq("reptile_id", reptileId)
        .order("feeding_date", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (feedingError) throw feedingError;
      
      if (feedingData) {
        setLastFeedingDate(feedingData.feeding_date);
      }
    } catch (error) {
      console.error("Error fetching feeding data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    const intervalValue = tempInterval ? parseInt(tempInterval) : null;
    
    if (intervalValue !== null && (intervalValue < 1 || intervalValue > 365)) {
      toast.error("L'intervalle doit être entre 1 et 365 jours");
      return;
    }

    try {
      const { error } = await supabase
        .from("reptiles")
        .update({ feeding_interval_days: intervalValue })
        .eq("id", reptileId);

      if (error) throw error;

      setInterval(intervalValue);
      setEditing(false);
      toast.success("Intervalle de repas mis à jour");
    } catch (error) {
      console.error("Error updating feeding interval:", error);
      toast.error("Erreur lors de la mise à jour");
    }
  };

  const handleEdit = () => {
    setTempInterval(interval?.toString() || "");
    setEditing(true);
  };

  const handleCancel = () => {
    setEditing(false);
    setTempInterval("");
  };

  const calculateNextFeeding = () => {
    if (!lastFeedingDate || !interval) return null;
    
    const lastDate = new Date(lastFeedingDate);
    const nextDate = new Date(lastDate);
    nextDate.setDate(lastDate.getDate() + interval);
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    nextDate.setHours(0, 0, 0, 0);
    
    const diffTime = nextDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    return { nextDate, diffDays };
  };

  const nextFeeding = calculateNextFeeding();

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("fr-FR", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="py-8">
          <p className="text-muted-foreground text-center">Chargement...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-primary/20">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-primary" />
            <CardTitle>Intervalle de repas</CardTitle>
          </div>
          {!readOnly && !editing && (
            <Button variant="outline" size="sm" onClick={handleEdit}>
              <Edit2 className="w-4 h-4 mr-2" />
              Modifier
            </Button>
          )}
        </div>
        <CardDescription>
          Définissez la fréquence d'alimentation pour ce reptile
        </CardDescription>
      </CardHeader>
      <CardContent>
        {editing ? (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="interval">Intervalle en jours</Label>
              <Input
                id="interval"
                type="number"
                min="1"
                max="365"
                placeholder="Ex: 7 pour une fois par semaine"
                value={tempInterval}
                onChange={(e) => setTempInterval(e.target.value)}
              />
              <p className="text-xs text-muted-foreground">
                Laissez vide si vous ne souhaitez pas définir d'intervalle
              </p>
            </div>
            <div className="flex gap-2">
              <Button onClick={handleSave} className="flex-1">
                <Save className="w-4 h-4 mr-2" />
                Enregistrer
              </Button>
              <Button variant="outline" onClick={handleCancel} className="flex-1">
                <X className="w-4 h-4 mr-2" />
                Annuler
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            {interval ? (
              <>
                <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                  <span className="text-sm text-muted-foreground">Fréquence</span>
                  <span className="font-semibold text-lg">
                    Tous les {interval} jour{interval > 1 ? 's' : ''}
                  </span>
                </div>
                {lastFeedingDate && nextFeeding && (
                  <>
                    <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                      <span className="text-sm text-muted-foreground">Dernier repas</span>
                      <span className="font-medium">{formatDate(lastFeedingDate)}</span>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-primary/10 rounded-lg">
                      <span className="text-sm font-medium">Prochain repas prévu</span>
                      <div className="text-right">
                        <div className="font-semibold">{formatDate(nextFeeding.nextDate.toISOString())}</div>
                        <div className="text-xs text-muted-foreground">
                          {nextFeeding.diffDays === 0 && "Aujourd'hui"}
                          {nextFeeding.diffDays === 1 && "Demain"}
                          {nextFeeding.diffDays > 1 && `Dans ${nextFeeding.diffDays} jours`}
                          {nextFeeding.diffDays < 0 && `En retard de ${Math.abs(nextFeeding.diffDays)} jour${Math.abs(nextFeeding.diffDays) > 1 ? 's' : ''}`}
                        </div>
                      </div>
                    </div>
                  </>
                )}
              </>
            ) : (
              <div className="text-center py-4">
                <p className="text-muted-foreground mb-2">Aucun intervalle défini</p>
                {!readOnly && (
                  <Button variant="outline" size="sm" onClick={handleEdit}>
                    Définir un intervalle
                  </Button>
                )}
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default FeedingIntervalCard;
