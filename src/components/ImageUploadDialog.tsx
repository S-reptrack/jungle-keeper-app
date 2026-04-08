import { useState, useCallback } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Upload, Camera as CameraIcon, Trash2 } from "lucide-react";
import { Capacitor } from "@capacitor/core";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface ImageUploadDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  reptileId: string;
  reptileName: string;
  onUploadSuccess: (url: string) => void;
  currentImageUrl?: string | null;
  onDeletePhoto?: () => void;
}

const ImageUploadDialog = ({ 
  open, 
  onOpenChange, 
  reptileId, 
  reptileName, 
  onUploadSuccess,
  currentImageUrl,
  onDeletePhoto
}: ImageUploadDialogProps) => {
  const [uploading, setUploading] = useState(false);

  const uploadFile = useCallback(async (file: File) => {
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
  }, [reptileId, onUploadSuccess, onOpenChange]);

  const handleTakePhoto = useCallback(async () => {
    try {
      if (Capacitor.isNativePlatform()) {
        // Dynamically import Camera to avoid crashes if plugin is not available
        let CameraModule: any;
        try {
          CameraModule = await import("@capacitor/camera");
        } catch (importErr) {
          console.error("Camera plugin not available:", importErr);
          // Fallback to file input with capture
          const input = document.getElementById('camera-upload') as HTMLInputElement;
          if (input) input.click();
          return;
        }

        const { Camera, CameraResultType, CameraSource } = CameraModule;

        try {
          // Check permissions first to avoid crash
          const permStatus = await Camera.checkPermissions().catch(() => ({ camera: 'prompt' }));
          
          if (permStatus.camera === 'denied') {
            toast.error("Accès à la caméra refusé. Veuillez l'activer dans les réglages.");
            return;
          }

          if (permStatus.camera === 'prompt' || permStatus.camera === 'prompt-with-rationale') {
            const requested = await Camera.requestPermissions({ permissions: ['camera'] }).catch(() => ({ camera: 'denied' }));
            if (requested.camera === 'denied') {
              toast.error("Accès à la caméra refusé.");
              return;
            }
          }

          const photo = await Camera.getPhoto({
            source: CameraSource.Camera,
            resultType: CameraResultType.Uri,
            quality: 80,
            correctOrientation: true,
            saveToGallery: false,
          });

          if (!photo.webPath) throw new Error('Impossible de capturer la photo');
          const blob = await fetch(photo.webPath).then((r: Response) => r.blob());
          const file = new File([blob], `${reptileId}-${Date.now()}.jpg`, { type: blob.type || 'image/jpeg' });
          return uploadFile(file);
        } catch (cameraErr: any) {
          // User cancelled or camera error - don't crash
          if (cameraErr?.message?.includes('cancelled') || cameraErr?.message?.includes('User cancelled')) {
            return; // Silent cancel
          }
          console.error('Camera getPhoto error:', cameraErr);
          toast.error("Impossible d'accéder à la caméra. Essayez 'Choisir depuis l'appareil'.");
          return;
        }
      }

      // Fallback to file input with capture on web
      const input = document.getElementById('camera-upload') as HTMLInputElement;
      if (input) input.click();
    } catch (e: any) {
      console.error('Camera error:', e);
      toast.error("Accès à la caméra indisponible");
    }
  }, [reptileId, uploadFile]);

  const handleFileSelect = useCallback(async (event: React.ChangeEvent<HTMLInputElement>) => {
    try {
      const file = event.target.files?.[0];
      if (!file) return;

      // Reset input value so the same file can be re-selected
      event.target.value = '';

      const validTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/webp'];
      if (!validTypes.includes(file.type)) {
        toast.error("Format d'image non supporté. Utilisez PNG, JPEG, JPG ou WEBP");
        return;
      }

      if (file.size > 5242880) {
        toast.error("L'image est trop grande. Maximum 5MB");
        return;
      }

      await uploadFile(file);
    } catch (error: any) {
      console.error('File select error:', error);
      toast.error("Erreur lors de la sélection du fichier");
    }
  }, [uploadFile]);

  const handleChooseFile = useCallback(() => {
    try {
      const input = document.getElementById('file-upload') as HTMLInputElement;
      if (input) input.click();
    } catch (e) {
      console.error('File picker error:', e);
      toast.error("Impossible d'ouvrir le sélecteur de fichiers");
    }
  }, []);

  const handleDeleteClick = useCallback(() => {
    if (onDeletePhoto) {
      onDeletePhoto();
      onOpenChange(false);
    }
  }, [onDeletePhoto, onOpenChange]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Photo - {reptileName}</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col gap-4 py-4">
          <p className="text-sm text-muted-foreground">
            Gérez la photo de votre reptile
          </p>
          
          <div className="flex flex-col gap-3">
            <Button
              type="button"
              variant="outline"
              className="w-full min-h-[44px]"
              style={{ touchAction: 'manipulation' }}
              disabled={uploading}
              onClick={handleChooseFile}
            >
              <Upload className="mr-2 h-4 w-4" />
              {uploading ? "Upload en cours..." : "Choisir depuis l'appareil"}
            </Button>
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
              className="w-full min-h-[44px]"
              style={{ touchAction: 'manipulation' }}
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

            {currentImageUrl && onDeletePhoto && (
              <Button
                type="button"
                variant="destructive"
                className="w-full min-h-[44px]"
                style={{ touchAction: 'manipulation' }}
                disabled={uploading}
                onClick={handleDeleteClick}
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Supprimer la photo
              </Button>
            )}
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
