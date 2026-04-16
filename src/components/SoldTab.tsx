import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Camera, FileUp, X, CheckCircle, Send, UserCheck, UserX } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Camera as CapacitorCamera, CameraResultType, CameraSource } from "@capacitor/camera";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { fr, enUS, de, es, it, pt, nl, pl, ru, ja, zhCN, hi, th, id as idLocale } from "date-fns/locale";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";

const localeMap: Record<string, any> = { fr, en: enUS, de, es, it, pt, nl, pl, ru, ja, zh: zhCN, hi, th, id: idLocale };

interface SoldTabProps {
  reptileId: string;
  reptileName: string;
}

const SoldTab = ({ reptileId, reptileName }: SoldTabProps) => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const dateLocale = localeMap[i18n.language] || enUS;
  const [date, setDate] = useState<Date>();
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);
  const [documentFile, setDocumentFile] = useState<File | null>(null);
  const [documentPreview, setDocumentPreview] = useState<string | null>(null);
  
  // Transfer dialog state
  const [showTransferDialog, setShowTransferDialog] = useState(false);
  const [buyerEmail, setBuyerEmail] = useState("");
  const [checkingBuyer, setCheckingBuyer] = useState(false);
  const [buyerExists, setBuyerExists] = useState<boolean | null>(null);
  const [transferMessage, setTransferMessage] = useState("");
  const [sendingTransfer, setSendingTransfer] = useState(false);

  const handleTakePhoto = async () => {
    try {
      const photo = await CapacitorCamera.getPhoto({
        quality: 90,
        allowEditing: false,
        resultType: CameraResultType.Base64,
        source: CameraSource.Camera,
      });

      if (photo.base64String) {
        const blob = await fetch(`data:image/${photo.format};base64,${photo.base64String}`).then(r => r.blob());
        const file = new File([blob], `sold-document-${Date.now()}.${photo.format}`, { type: `image/${photo.format}` });
        setDocumentFile(file);
        setDocumentPreview(`data:image/${photo.format};base64,${photo.base64String}`);
      }
    } catch (error) {
      console.error("Error taking photo:", error);
      toast.error(t("soldTab.photoError"));
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.type === "application/pdf" || file.type.startsWith("image/")) {
        setDocumentFile(file);
        if (file.type.startsWith("image/")) {
          const reader = new FileReader();
          reader.onload = (e) => setDocumentPreview(e.target?.result as string);
          reader.readAsDataURL(file);
        } else {
          setDocumentPreview("pdf");
        }
      } else {
        toast.error(t("soldTab.unsupportedFormat"));
      }
    }
  };

  const handleRemoveDocument = () => {
    setDocumentFile(null);
    setDocumentPreview(null);
  };

  const checkBuyerExists = async (email: string) => {
    if (!email.trim() || !email.includes("@")) {
      setBuyerExists(null);
      return;
    }

    setCheckingBuyer(true);
    try {
      // Use the secure database function to check if email exists
      const { data, error } = await supabase.rpc('check_email_exists', {
        check_email: email.trim()
      });

      if (error) {
        console.error("Error checking buyer:", error);
        setBuyerExists(null);
      } else {
        setBuyerExists(data === true);
      }
    } catch (error) {
      console.error("Error checking buyer:", error);
      setBuyerExists(null);
    } finally {
      setCheckingBuyer(false);
    }
  };

  const handleEmailChange = (email: string) => {
    setBuyerEmail(email);
    setBuyerExists(null);
  };

  const handleEmailBlur = () => {
    if (buyerEmail.trim()) {
      checkBuyerExists(buyerEmail);
    }
  };

  const handleSubmit = async () => {
    if (!date) {
      toast.error(t("soldTab.dateRequired"));
      return;
    }

    try {
      setLoading(true);
      let documentUrl = null;

      // Upload document if present
      if (documentFile) {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error("User not authenticated");

        const fileExt = documentFile.name.split('.').pop();
        const fileName = `${user.id}/${reptileId}-sold-${Date.now()}.${fileExt}`;
        
        const { error: uploadError } = await supabase.storage
          .from("sale-documents")
          .upload(fileName, documentFile);

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage
          .from("sale-documents")
          .getPublicUrl(fileName);
        
        documentUrl = publicUrl;
      }

      const { error } = await supabase
        .from("reptiles")
        .update({
          status: "sold",
          status_date: format(date, "yyyy-MM-dd"),
          archive_notes: notes || null,
          sale_document_url: documentUrl,
        })
        .eq("id", reptileId);

      if (error) throw error;

      toast.success(t("soldTab.success", { name: reptileName }));
      setShowTransferDialog(true);
    } catch (error) {
      console.error("Error archiving reptile:", error);
      toast.error(t("soldTab.error"));
    } finally {
      setLoading(false);
    }
  };

  const handleSendTransfer = async () => {
    if (!buyerEmail.trim()) {
      toast.error(t("soldTab.buyerRequired"));
      return;
    }

    if (!buyerExists) {
      toast.error(t("soldTab.buyerMustHaveApp"));
      return;
    }

    setSendingTransfer(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      // Get buyer's user_id - use the secure function result
      // If buyer exists (verified by check_email_exists), we can proceed
      // The to_user_id will be resolved by the recipient when they accept
      const { data: buyerProfile } = await supabase
        .from("profiles")
        .select("user_id")
        .eq("email", buyerEmail.trim())
        .maybeSingle();

      // Even if we can't read the profile due to RLS, we know the user exists
      // because check_email_exists returned true
      const recipientUserId = buyerProfile?.user_id || null;

      // Create transfer request
      const { error } = await supabase
        .from("animal_transfers")
        .insert({
          reptile_id: reptileId,
          from_user_id: user.id,
          to_user_email: buyerEmail.trim(),
          to_user_id: recipientUserId,
          message: transferMessage.trim() || t("soldTab.defaultTransferMessage", { name: reptileName }),
        });

      if (error) throw error;

      toast.success(t("soldTab.transferSuccess"));
      setShowTransferDialog(false);
      navigate("/reptiles");
    } catch (error: any) {
      console.error("Transfer error:", error);
      toast.error(error.message || t("soldTab.transferError"));
    } finally {
      setSendingTransfer(false);
    }
  };

  const handleSkipTransfer = () => {
    setShowTransferDialog(false);
    navigate("/reptiles");
  };

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle className="w-5 h-5" />
            {t("soldTab.title")}
          </CardTitle>
          <CardDescription>
            {t("soldTab.description", { name: reptileName })}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>{t("soldTab.saleDate")}</Label>
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
                  {date ? format(date, "PPP", { locale: dateLocale }) : t("soldTab.selectDate")}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0 z-[100]">
                <Calendar
                  mode="single"
                  selected={date}
                  onSelect={setDate}
                  disabled={(date) => date > new Date()}
                  initialFocus
                  locale={dateLocale}
                  className="pointer-events-auto"
                />
              </PopoverContent>
            </Popover>
          </div>

          <div className="space-y-2">
            <Label>{t("soldTab.notes")}</Label>
            <Textarea
              placeholder={t("soldTab.notesPlaceholder")}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={4}
            />
          </div>

          <div className="space-y-2">
            <Label>{t("soldTab.saleDocument")}</Label>
            {!documentFile ? (
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleTakePhoto}
                  className="flex-1 gap-2"
                >
                  <Camera className="w-4 h-4" />
                  {t("soldTab.takePhoto")}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => window.document.getElementById('file-upload-sold')?.click()}
                  className="flex-1 gap-2"
                >
                  <FileUp className="w-4 h-4" />
                  {t("soldTab.file")}
                </Button>
                <input
                  id="file-upload-sold"
                  type="file"
                  accept="application/pdf,image/*"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </div>
            ) : (
              <div className="relative border rounded-lg p-4">
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={handleRemoveDocument}
                  className="absolute top-2 right-2 h-6 w-6"
                >
                  <X className="w-4 h-4" />
                </Button>
                {documentPreview === "pdf" ? (
                  <div className="flex items-center gap-2">
                    <FileUp className="w-8 h-8 text-muted-foreground" />
                    <span className="text-sm">{documentFile.name}</span>
                  </div>
                ) : (
                  <img 
                    src={documentPreview!} 
                    alt="Document preview" 
                    className="w-full h-32 object-contain"
                  />
                )}
              </div>
            )}
          </div>

          <div className="pt-4">
            <Button 
              onClick={handleSubmit} 
              disabled={loading || !date}
              className="w-full"
            >
              {loading ? t("soldTab.archiving") : t("soldTab.submit")}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Transfer Dialog */}
      <Dialog open={showTransferDialog} onOpenChange={setShowTransferDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Send className="w-5 h-5" />
              {t("soldTab.transferTitle")}
            </DialogTitle>
            <DialogDescription>
              {t("soldTab.transferDescription", { name: reptileName })}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="buyer-email">{t("soldTab.buyerEmail")}</Label>
              <div className="relative">
                <Input
                  id="buyer-email"
                  type="email"
                  placeholder={t("soldTab.buyerEmailPlaceholder")}
                  value={buyerEmail}
                  onChange={(e) => handleEmailChange(e.target.value)}
                  onBlur={handleEmailBlur}
                />
                {checkingBuyer && (
                  <div className="absolute right-3 top-1/2 -translate-y-1/2">
                    <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                  </div>
                )}
                {!checkingBuyer && buyerExists !== null && (
                  <div className="absolute right-3 top-1/2 -translate-y-1/2">
                    {buyerExists ? (
                      <UserCheck className="w-5 h-5 text-green-500" />
                    ) : (
                      <UserX className="w-5 h-5 text-red-500" />
                    )}
                  </div>
                )}
              </div>
              {buyerExists === true && (
                <Badge variant="outline" className="text-green-600 border-green-600">
                  <UserCheck className="w-3 h-3 mr-1" />
                  {t("soldTab.buyerFound")}
                </Badge>
              )}
              {buyerExists === false && (
                <Badge variant="outline" className="text-red-600 border-red-600">
                  <UserX className="w-3 h-3 mr-1" />
                  {t("soldTab.buyerNotFound")}
                </Badge>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="transfer-message">{t("soldTab.transferMessage")}</Label>
              <Textarea
                id="transfer-message"
                placeholder={t("soldTab.transferMessagePlaceholder")}
                value={transferMessage}
                onChange={(e) => setTransferMessage(e.target.value)}
                rows={2}
              />
            </div>
          </div>

          <DialogFooter className="flex-col sm:flex-row gap-2">
            <Button variant="outline" onClick={handleSkipTransfer} className="w-full sm:w-auto">
              {t("soldTab.skipTransfer")}
            </Button>
            <Button 
              onClick={handleSendTransfer} 
              disabled={sendingTransfer || !buyerExists}
              className="w-full sm:w-auto"
            >
              <Send className="w-4 h-4 mr-2" />
              {sendingTransfer ? t("soldTab.sending") : t("soldTab.sendCard")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default SoldTab;
