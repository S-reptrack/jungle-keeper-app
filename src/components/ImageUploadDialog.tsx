import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Upload, Camera } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface ImageUploadDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  reptileId: string;
  reptileName: string;
  onUploadSuccess: (url: string) => void;
}

const ImageUploadDialog = ({ open, onOpenChange, reptileId, reptileName, onUploadSuccess }: ImageUploadDialogProps) => {
  const [uploading, setUploading] = useState(false);

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    const validTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/webp', 'image/heic'];
    if (!validTypes.includes(file.type)) {
      toast.error("Format d'image non supporté. Utilisez PNG, JPEG, JPG, WEBP ou HEIC");
      return;
    }

    // Validate file size (5MB)
    if (file.size > 5242880) {
      toast.error("L'image est trop grande. Maximum 5MB");
      return;
    }

    setUploading(true);

    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${reptileId}-${Date.now()}.${fileExt}`;
      const filePath = `${fileName}`;

      // Upload to Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from('reptile-images')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('reptile-images')
        .getPublicUrl(filePath);

      // Update reptile record
      const { error: updateError } = await supabase
        .from('reptiles')
        .update({ image_url: publicUrl })
        .eq('id', reptileId);

      if (updateError) throw updateError;

      toast.success("Image uploadée avec succès");
      onUploadSuccess(publicUrl);
      onOpenChange(false);
    } catch (error) {
      console.error('Error uploading image:', error);
      toast.error("Erreur lors de l'upload de l'image");
    } finally {
      setUploading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Ajouter une photo - {reptileName}</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col gap-4 py-4">
          <p className="text-sm text-muted-foreground">
            Ajoutez une photo de votre reptile depuis votre appareil
          </p>
          
          <div className="flex flex-col gap-3">
            <label htmlFor="file-upload" className="cursor-pointer">
              <Button
                type="button"
                variant="outline"
                className="w-full"
                disabled={uploading}
                onClick={() => document.getElementById('file-upload')?.click()}
              >
                <Upload className="mr-2 h-4 w-4" />
                {uploading ? "Upload en cours..." : "Choisir depuis l'appareil"}
              </Button>
            </label>
            <input
              id="file-upload"
              type="file"
              accept="image/png,image/jpeg,image/jpg,image/webp,image/heic"
              onChange={handleFileSelect}
              className="hidden"
            />

            <label htmlFor="camera-upload" className="cursor-pointer">
              <Button
                type="button"
                variant="outline"
                className="w-full"
                disabled={uploading}
                onClick={() => document.getElementById('camera-upload')?.click()}
              >
                <Camera className="mr-2 h-4 w-4" />
                Prendre une photo
              </Button>
            </label>
            <input
              id="camera-upload"
              type="file"
              accept="image/*"
              capture="environment"
              onChange={handleFileSelect}
              className="hidden"
            />
          </div>

          <p className="text-xs text-muted-foreground">
            Formats acceptés: PNG, JPEG, JPG, WEBP, HEIC (max 5MB)
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ImageUploadDialog;
