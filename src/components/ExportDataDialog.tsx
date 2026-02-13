import { useState } from "react";
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
import { Button } from "@/components/ui/button";
import { Download, Crown } from "lucide-react";
import { useTranslation } from "react-i18next";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useSubscription } from "@/hooks/useSubscription";
import { useNavigate } from "react-router-dom";

const ExportDataDialog = () => {
  const { t } = useTranslation();
  const { subscribed } = useSubscription();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  if (!subscribed) {
    return (
      <Button
        variant="outline"
        className="w-full"
        onClick={() => navigate("/settings?tab=subscription")}
      >
        <Crown className="w-4 h-4 mr-2 text-amber-500" />
        {t("gdpr.exportData")} — Premium
      </Button>
    );
  }

  const handleExport = async () => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Non authentifié");

      // Récupérer toutes les données de l'utilisateur
      const [reptiles, feedings, healthRecords, weightRecords, reproductionObs, profile] = await Promise.all([
        supabase.from("reptiles").select("*").eq("user_id", user.id),
        supabase.from("feedings").select("*").eq("user_id", user.id),
        supabase.from("health_records").select("*").eq("user_id", user.id),
        supabase.from("weight_records").select("*").eq("user_id", user.id),
        supabase.from("reproduction_observations").select("*").eq("user_id", user.id),
        supabase.from("profiles").select("*").eq("user_id", user.id).single(),
      ]);

      const exportData = {
        exportDate: new Date().toISOString(),
        profile: profile.data,
        reptiles: reptiles.data,
        feedings: feedings.data,
        healthRecords: healthRecords.data,
        weightRecords: weightRecords.data,
        reproductionObservations: reproductionObs.data,
      };

      // Créer et télécharger le fichier JSON
      const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `s-reptrack-export-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      toast.success(t("gdpr.exportSuccess"));
    } catch (error) {
      console.error("Export error:", error);
      toast.error(t("gdpr.exportError"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button variant="outline" className="w-full">
          <Download className="w-4 h-4 mr-2" />
          {t("gdpr.exportData")}
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{t("gdpr.exportDataTitle")}</AlertDialogTitle>
          <AlertDialogDescription>
            {t("gdpr.exportDataDescription")}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>{t("common.cancel")}</AlertDialogCancel>
          <AlertDialogAction onClick={handleExport} disabled={loading}>
            {loading ? t("common.loading") : t("gdpr.confirmExport")}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default ExportDataDialog;
