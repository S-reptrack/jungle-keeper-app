import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Send } from "lucide-react";

interface TransferAnimalDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  reptileId: string;
  reptileName: string;
}

export const TransferAnimalDialog = ({
  open,
  onOpenChange,
  reptileId,
  reptileName,
}: TransferAnimalDialogProps) => {
  const { t } = useTranslation();
  const [toEmail, setToEmail] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleTransfer = async () => {
    if (!toEmail.trim()) {
      toast.error(t("transfer.emailRequired"));
      return;
    }

    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      // Check if recipient exists
      const { data: recipientProfile } = await supabase
        .from("profiles")
        .select("user_id")
        .eq("email", toEmail.trim())
        .single();

      // Create transfer request
      const { error } = await supabase
        .from("animal_transfers")
        .insert({
          reptile_id: reptileId,
          from_user_id: user.id,
          to_user_email: toEmail.trim(),
          to_user_id: recipientProfile?.user_id || null,
          message: message.trim() || null,
        });

      if (error) throw error;

      toast.success(t("transfer.requestSent"));
      onOpenChange(false);
      setToEmail("");
      setMessage("");
    } catch (error: any) {
      console.error("Transfer error:", error);
      toast.error(error.message || t("transfer.error"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t("transfer.title")}</DialogTitle>
          <DialogDescription>
            {t("transfer.description", { name: reptileName })}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="email">{t("transfer.recipientEmail")}</Label>
            <Input
              id="email"
              type="email"
              placeholder="utilisateur@example.com"
              value={toEmail}
              onChange={(e) => setToEmail(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="message">{t("transfer.message")}</Label>
            <Textarea
              id="message"
              placeholder={t("transfer.messagePlaceholder")}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={3}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            {t("common.cancel")}
          </Button>
          <Button onClick={handleTransfer} disabled={loading}>
            <Send className="h-4 w-4 mr-2" />
            {loading ? t("common.loading") : t("transfer.send")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
