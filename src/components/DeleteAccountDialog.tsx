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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Trash2 } from "lucide-react";
import { useTranslation } from "react-i18next";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

const CONFIRM_KEYWORDS = ["SUPPRIMER", "DELETE"];

const DeleteAccountDialog = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [confirmText, setConfirmText] = useState("");

  const isConfirmed = CONFIRM_KEYWORDS.includes(confirmText.trim().toUpperCase());

  const handleDelete = async () => {
    if (!isConfirmed) {
      toast.error(t("gdpr.deleteConfirmError"));
      return;
    }

    setLoading(true);
    try {
      const { data: sessionData } = await supabase.auth.getSession();
      const accessToken = sessionData.session?.access_token;

      if (!accessToken) {
        throw new Error("Not authenticated");
      }

      const { data, error } = await supabase.functions.invoke("delete-account", {
        headers: { Authorization: `Bearer ${accessToken}` },
      });

      if (error) throw error;

      if (!data?.success) {
        throw new Error("Deletion failed");
      }

      // Sign out locally
      await supabase.auth.signOut();

      toast.success(t("gdpr.deleteSuccess"));
      navigate("/");
    } catch (error) {
      console.error("Delete error:", error);
      toast.error(t("gdpr.deleteError"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button variant="destructive" className="w-full">
          <Trash2 className="w-4 h-4 mr-2" />
          {t("gdpr.deleteAccount")}
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle className="text-destructive">
            {t("gdpr.deleteAccountTitle")}
          </AlertDialogTitle>
          <AlertDialogDescription className="space-y-4">
            <p>{t("gdpr.deleteAccountWarning")}</p>
            <div className="space-y-2">
              <Label htmlFor="confirm">{t("gdpr.deleteAccountConfirm")}</Label>
              <Input
                id="confirm"
                placeholder="SUPPRIMER / DELETE"
                value={confirmText}
                onChange={(e) => setConfirmText(e.target.value)}
                className="font-mono"
              />
            </div>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>{t("common.cancel")}</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDelete}
            disabled={loading || !isConfirmed}
            className="bg-destructive hover:bg-destructive/90"
          >
            {loading ? t("common.loading") : t("gdpr.confirmDelete")}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default DeleteAccountDialog;
