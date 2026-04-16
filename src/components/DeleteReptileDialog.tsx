import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Trash2, AlertTriangle, Clock } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
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
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { differenceInHours } from "date-fns";

interface DeleteReptileDialogProps {
  reptileId: string;
  reptileName: string;
  createdAt: string;
  onDelete?: () => void;
  isAdmin?: boolean;
}

const DELETION_WINDOW_HOURS = 48;

const DeleteReptileDialog = ({
  reptileId,
  reptileName,
  createdAt,
  onDelete,
  isAdmin = false,
}: DeleteReptileDialogProps) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [isDeleting, setIsDeleting] = useState(false);
  const [open, setOpen] = useState(false);

  const createdDate = new Date(createdAt);
  const now = new Date();
  const hoursSinceCreation = differenceInHours(now, createdDate);
  const hoursRemaining = DELETION_WINDOW_HOURS - hoursSinceCreation;
  const canDelete = isAdmin || hoursSinceCreation < DELETION_WINDOW_HOURS;

  const handleDelete = async () => {
    if (!canDelete && !isAdmin) {
      toast.error(t("deleteReptile.expiredError"));
      return;
    }

    setIsDeleting(true);

    try {
      const deletePromises = [
        supabase.from("feedings").delete().eq("reptile_id", reptileId),
        supabase.from("weight_records").delete().eq("reptile_id", reptileId),
        supabase.from("health_records").delete().eq("reptile_id", reptileId),
        supabase.from("reproduction_observations").delete().eq("reptile_id", reptileId),
        supabase.from("reproduction_observations").delete().eq("partner_id", reptileId),
        supabase.from("reptile_photos").delete().eq("reptile_id", reptileId),
        supabase.from("reptile_genealogy").delete().eq("reptile_id", reptileId),
        supabase.from("reptile_genealogy").delete().eq("parent_id", reptileId),
      ];

      await Promise.all(deletePromises);

      const { error } = await supabase
        .from("reptiles")
        .delete()
        .eq("id", reptileId);

      if (error) throw error;

      toast.success(t("deleteReptile.success", { name: reptileName }));
      setOpen(false);

      if (onDelete) {
        onDelete();
      } else {
        navigate("/reptiles");
      }
    } catch (error) {
      console.error("Erreur lors de la suppression:", error);
      toast.error(t("deleteReptile.error"));
    } finally {
      setIsDeleting(false);
    }
  };

  if (!canDelete) {
    return (
      <Button
        variant="ghost"
        size="sm"
        className="gap-2 text-muted-foreground cursor-not-allowed opacity-50"
        disabled
        title={t("deleteReptile.expiredTitle")}
      >
        <Trash2 className="w-4 h-4" />
        {t("deleteReptile.expired")}
      </Button>
    );
  }

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger asChild>
        <Button variant="ghost" size="sm" className="gap-2 text-destructive hover:text-destructive hover:bg-destructive/10">
          <Trash2 className="w-4 h-4" />
          {t("deleteReptile.deleteButton")}
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-destructive" />
            {t("deleteReptile.confirmTitle", { name: reptileName })}
          </AlertDialogTitle>
          <AlertDialogDescription className="space-y-3">
            <p>
              {t("deleteReptile.confirmDescription")}
            </p>
            <ul className="list-disc list-inside text-sm space-y-1 ml-2">
              <li>{t("deleteReptile.feedingHistory")}</li>
              <li>{t("deleteReptile.weightHistory")}</li>
              <li>{t("deleteReptile.healthRecords")}</li>
              <li>{t("deleteReptile.reproductionObs")}</li>
              <li>{t("deleteReptile.photos")}</li>
              <li>{t("deleteReptile.genealogyLinks")}</li>
            </ul>
            {!isAdmin && (
              <div className="flex items-center gap-2 mt-4 p-3 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-md">
                <Clock className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0" />
                <p className="text-sm text-amber-800 dark:text-amber-200">
                  <strong>{t("deleteReptile.timeRemaining", { hours: Math.floor(hoursRemaining) })}</strong>
                </p>
              </div>
            )}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isDeleting}>{t("deleteReptile.cancel")}</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDelete}
            disabled={isDeleting}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {isDeleting ? t("deleteReptile.deleting") : t("deleteReptile.confirmButton")}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default DeleteReptileDialog;
