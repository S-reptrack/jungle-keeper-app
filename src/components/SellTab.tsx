import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Camera, FileUp, X, DollarSign } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Camera as CapacitorCamera, CameraResultType, CameraSource } from "@capacitor/camera";
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

interface SellTabProps {
  reptileId: string;
  reptileName: string;
}

const SellTab = ({ reptileId, reptileName }: SellTabProps) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [date, setDate] = useState<Date>();
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);
  const [documentFile, setDocumentFile] = useState<File | null>(null);
  const [documentPreview, setDocumentPreview] = useState<string | null>(null);

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
        const file = new File([blob], `sale-document-${Date.now()}.${photo.format}`, { type: `image/${photo.format}` });
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
        const fileName = `${user.id}/${reptileId}-${Date.now()}.${fileExt}`;
        
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
          <DollarSign className="w-5 h-5" />
          Marquer comme vendu
        </CardTitle>
        <CardDescription>
          Archivez {reptileName} comme vendu. Les informations seront conservées pour la traçabilité.
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
            <PopoverContent className="w-auto p-0">
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
                onClick={() => window.document.getElementById('file-upload-sell')?.click()}
                className="flex-1 gap-2"
              >
                <FileUp className="w-4 h-4" />
                Fichier
              </Button>
              <input
                id="file-upload-sell"
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
            {loading ? "Archivage en cours..." : "Marquer comme vendu et archiver"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default SellTab;
