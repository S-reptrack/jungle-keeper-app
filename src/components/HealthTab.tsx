import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Trash2, AlertCircle, CheckCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import AddHealthRecordDialog from "./AddHealthRecordDialog";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface HealthRecord {
  id: string;
  condition: string;
  diagnosis_date: string;
  notes: string | null;
  treatment: string | null;
  resolved: boolean;
  created_at: string;
}

interface HealthTabProps {
  reptileId: string;
}

const HealthTab = ({ reptileId }: HealthTabProps) => {
  const { t } = useTranslation();
  const [records, setRecords] = useState<HealthRecord[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchHealthRecords = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("health_records")
        .select("*")
        .eq("reptile_id", reptileId)
        .order("diagnosis_date", { ascending: false });

      if (error) throw error;
      setRecords(data || []);
    } catch (error) {
      console.error("Error fetching health records:", error);
      toast.error("Erreur lors du chargement des données de santé");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHealthRecords();
  }, [reptileId]);

  const handleDelete = async (id: string) => {
    try {
      const { error } = await supabase
        .from("health_records")
        .delete()
        .eq("id", id);

      if (error) throw error;

      toast.success("Enregistrement supprimé");
      fetchHealthRecords();
    } catch (error) {
      console.error("Error deleting health record:", error);
      toast.error("Erreur lors de la suppression");
    }
  };

  const formatDate = (dateString: string) => {
    const [year, month, day] = dateString.split('-').map(Number);
    return new Date(year, month - 1, day).toLocaleDateString('fr-FR');
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="py-8">
          <p className="text-center text-muted-foreground">Chargement...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
        <CardTitle>Historique de santé</CardTitle>
        <AddHealthRecordDialog reptileId={reptileId} onRecordAdded={fetchHealthRecords} />
      </CardHeader>
      <CardContent>
        {records.length === 0 ? (
          <p className="text-muted-foreground text-center py-8">
            Aucun problème de santé enregistré
          </p>
        ) : (
          <ScrollArea className="h-[500px] pr-4">
            <div className="space-y-4">
              {records.map((record) => (
                <Card key={record.id} className="border">
                  <CardContent className="pt-6">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-2">
                        {record.resolved ? (
                          <CheckCircle className="w-5 h-5 text-green-500" />
                        ) : (
                          <AlertCircle className="w-5 h-5 text-amber-500" />
                        )}
                        <h3 className="font-semibold text-lg">{record.condition}</h3>
                      </div>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Confirmer la suppression</AlertDialogTitle>
                            <AlertDialogDescription>
                              Cette action est irréversible. L'enregistrement sera définitivement supprimé.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Annuler</AlertDialogCancel>
                            <AlertDialogAction onClick={() => handleDelete(record.id)}>
                              Supprimer
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-sm">
                        <span className="text-muted-foreground">Date de diagnostic:</span>
                        <span className="font-medium">{formatDate(record.diagnosis_date)}</span>
                        <Badge variant={record.resolved ? "default" : "secondary"}>
                          {record.resolved ? "Résolu" : "En cours"}
                        </Badge>
                      </div>

                      {record.treatment && (
                        <div className="mt-3">
                          <p className="text-sm font-medium text-muted-foreground mb-1">Traitement:</p>
                          <p className="text-sm bg-muted p-2 rounded">{record.treatment}</p>
                        </div>
                      )}

                      {record.notes && (
                        <div className="mt-3">
                          <p className="text-sm font-medium text-muted-foreground mb-1">Notes:</p>
                          <p className="text-sm bg-muted p-2 rounded">{record.notes}</p>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </ScrollArea>
        )}
      </CardContent>
    </Card>
  );
};

export default HealthTab;
