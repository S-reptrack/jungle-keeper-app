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
import { fr } from "date-fns/locale";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";

interface SoldTabProps {
  reptileId: string;
  reptileName: string;
}

const SoldTab = ({ reptileId, reptileName }: SoldTabProps) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
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
      toast.error("Erreur lors de la prise de photo");
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
        toast.error("Format non supporté. Veuillez utiliser un PDF ou une image.");
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
      const { data } = await supabase
        .from("profiles")
        .select("user_id")
        .eq("email", email.trim())
        .maybeSingle();

      setBuyerExists(!!data);
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
      toast.error("Veuillez sélectionner une date");
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

      toast.success(`${reptileName} a été marqué comme vendu et archivé`);
      
      // Show transfer dialog
      setShowTransferDialog(true);
    } catch (error) {
      console.error("Error archiving reptile:", error);
      toast.error("Erreur lors de l'archivage");
    } finally {
      setLoading(false);
    }
  };

  const handleSendTransfer = async () => {
    if (!buyerEmail.trim()) {
      toast.error("Veuillez entrer l'email de l'acheteur");
      return;
    }

    if (!buyerExists) {
      toast.error("L'acheteur doit posséder l'application pour recevoir la fiche");
      return;
    }

    setSendingTransfer(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      // Get buyer's user_id
      const { data: buyerProfile } = await supabase
        .from("profiles")
        .select("user_id")
        .eq("email", buyerEmail.trim())
        .single();

      if (!buyerProfile) {
        toast.error("Impossible de trouver l'acheteur");
        return;
      }

      // Create transfer request
      const { error } = await supabase
        .from("animal_transfers")
        .insert({
          reptile_id: reptileId,
          from_user_id: user.id,
          to_user_email: buyerEmail.trim(),
          to_user_id: buyerProfile.user_id,
          message: transferMessage.trim() || `Fiche de ${reptileName} suite à la vente`,
        });

      if (error) throw error;

      toast.success("La fiche a été envoyée à l'acheteur");
      setShowTransferDialog(false);
      navigate("/reptiles");
    } catch (error: any) {
      console.error("Transfer error:", error);
      toast.error(error.message || "Erreur lors de l'envoi");
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
            Marquer comme vendu
          </CardTitle>
          <CardDescription>
            Enregistrez la vente de {reptileName}. L'animal sera archivé avec son historique complet.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Date de vente *</Label>
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
              <PopoverContent className="w-auto p-0 z-[100]">
                <Calendar
                  mode="single"
                  selected={date}
                  onSelect={setDate}
                  disabled={(date) => date > new Date()}
                  initialFocus
                  locale={fr}
                  className="pointer-events-auto"
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
              rows={4}
            />
          </div>

          <div className="space-y-2">
            <Label>Document de vente (optionnel)</Label>
            {!documentFile ? (
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleTakePhoto}
                  className="flex-1 gap-2"
                >
                  <Camera className="w-4 h-4" />
                  Prendre une photo
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => window.document.getElementById('file-upload-sold')?.click()}
                  className="flex-1 gap-2"
                >
                  <FileUp className="w-4 h-4" />
                  Fichier
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
              {loading ? "Archivage en cours..." : "Confirmer la vente et archiver"}
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
              Envoyer la fiche à l'acheteur ?
            </DialogTitle>
            <DialogDescription>
              Voulez-vous transférer la fiche de {reptileName} au nouveau propriétaire ? 
              L'acheteur doit posséder l'application pour recevoir la fiche avec tout l'historique.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="buyer-email">Email de l'acheteur</Label>
              <div className="relative">
                <Input
                  id="buyer-email"
                  type="email"
                  placeholder="acheteur@example.com"
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
                  Utilisateur trouvé - peut recevoir la fiche
                </Badge>
              )}
              {buyerExists === false && (
                <Badge variant="outline" className="text-red-600 border-red-600">
                  <UserX className="w-3 h-3 mr-1" />
                  Utilisateur non trouvé - ne possède pas l'application
                </Badge>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="transfer-message">Message (optionnel)</Label>
              <Textarea
                id="transfer-message"
                placeholder="Message pour l'acheteur..."
                value={transferMessage}
                onChange={(e) => setTransferMessage(e.target.value)}
                rows={2}
              />
            </div>
          </div>

          <DialogFooter className="flex-col sm:flex-row gap-2">
            <Button variant="outline" onClick={handleSkipTransfer} className="w-full sm:w-auto">
              Non, terminer sans envoyer
            </Button>
            <Button 
              onClick={handleSendTransfer} 
              disabled={sendingTransfer || !buyerExists}
              className="w-full sm:w-auto"
            >
              <Send className="w-4 h-4 mr-2" />
              {sendingTransfer ? "Envoi en cours..." : "Envoyer la fiche"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default SoldTab;
