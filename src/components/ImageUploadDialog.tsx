import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Upload, Camera as CameraIcon } from "lucide-react";
import { Camera, CameraResultType, CameraSource } from "@capacitor/camera";
import { Capacitor } from "@capacitor/core";
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

  const uploadFile = async (file: File) => {
    setUploading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error("Vous devez être connecté pour uploader une image");

      const formData = new FormData();
      formData.append('file', file);
      formData.append('reptileId', reptileId);

      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/upload-image`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${session.access_token}`,
            'apikey': import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
          },
          body: formData,
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `Erreur HTTP: ${response.status}`);
      }

      const data = await response.json();
      if (!data.success || !data.path) throw new Error("Erreur lors du téléchargement de l'image");

      toast.success("Image uploadée avec succès");
      onUploadSuccess(data.path);
      onOpenChange(false);
    } catch (error: any) {
      console.error('Error uploading image:', error);
      toast.error(error.message || "Erreur lors de l'upload de l'image");
    } finally {
      setUploading(false);
    }
  };

  const handleTakePhoto = async () => {
    try {
      // Prefer native camera when available
      if (Capacitor.isNativePlatform()) {
        const photo = await Camera.getPhoto({
          source: CameraSource.Camera,
          resultType: CameraResultType.Uri,
          quality: 80,
          correctOrientation: true,
          saveToGallery: false,
        });
        if (!photo.webPath) throw new Error('Impossible de capturer la photo');
        const blob = await fetch(photo.webPath).then(r => r.blob());
        const file = new File([blob], `${reptileId}-${Date.now()}.jpg`, { type: blob.type || 'image/jpeg' });
        return uploadFile(file);
      }

      // Fallback to input capture on web
      document.getElementById('camera-upload')?.dispatchEvent(new MouseEvent('click'));
    } catch (e: any) {
      console.error('Camera error:', e);
      toast.error("Accès à la caméra refusé ou indisponible");
    }
  };
  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Client-side validation for immediate feedback
    const validTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      toast.error("Format d'image non supporté. Utilisez PNG, JPEG, JPG ou WEBP");
      return;
    }

    // Validate file size (5MB)
    if (file.size > 5242880) {
      toast.error("L'image est trop grande. Maximum 5MB");
      return;
    }

    setUploading(true);

    try {
      // Récupérer la session pour l'authentification
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        throw new Error("Vous devez être connecté pour uploader une image");
      }

      // Créer un FormData pour l'upload via edge function
      const formData = new FormData();
      formData.append('file', file);
      formData.append('reptileId', reptileId);

      // Utiliser fetch directement pour mieux contrôler les headers sur Android
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/upload-image`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${session.access_token}`,
            'apikey': import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
          },
          body: formData,
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `Erreur HTTP: ${response.status}`);
      }

      const data = await response.json();

      if (!data.success || !data.path) {
        throw new Error("Erreur lors du téléchargement de l'image");
      }

      toast.success("Image uploadée avec succès");
      onUploadSuccess(data.path);
      onOpenChange(false);
    } catch (error: any) {
      console.error('Error uploading image:', error);
      toast.error(error.message || "Erreur lors de l'upload de l'image");
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
              accept="image/png,image/jpeg,image/jpg,image/webp"
              onChange={handleFileSelect}
              className="hidden"
            />

            <Button
              type="button"
              variant="outline"
              className="w-full"
              disabled={uploading}
              onClick={handleTakePhoto}
            >
              <CameraIcon className="mr-2 h-4 w-4" />
              Prendre une photo
            </Button>
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
            Formats acceptés: PNG, JPEG, JPG, WEBP (max 5MB)
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ImageUploadDialog;
