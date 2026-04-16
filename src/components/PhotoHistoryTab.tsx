import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Card, CardContent } from "@/components/ui/card";
import { PhotoLightbox } from "@/components/PhotoLightbox";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useSubscription } from "@/hooks/useSubscription";
import { Camera, Plus, Trash2, Calendar, Crown, Lock } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";
import { fr, enUS, de, es, it, pt, nl, pl, ru, ja, zhCN, hi, th, id as idLocale } from "date-fns/locale";

const localeMap: Record<string, any> = { fr, en: enUS, de, es, it, pt, nl, pl, ru, ja, zh: zhCN, hi, th, id: idLocale };
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useNavigate } from "react-router-dom";

interface Photo {
  id: string;
  image_url: string;
  caption: string | null;
  taken_at: string;
  created_at: string;
}

interface PhotoHistoryTabProps {
  reptileId: string;
}

export const PhotoHistoryTab = ({ reptileId }: PhotoHistoryTabProps) => {
  const { t, i18n } = useTranslation();
  const { user } = useAuth();
  const { subscribed, loading: subLoading } = useSubscription();
  const navigate = useNavigate();
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [caption, setCaption] = useState("");
  const [takenAt, setTakenAt] = useState(new Date().toISOString().split('T')[0]);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [selectedPhotoIndex, setSelectedPhotoIndex] = useState<number | null>(null);

  useEffect(() => {
    if (user && subscribed) {
      fetchPhotos();
    } else {
      setLoading(false);
    }
  }, [user, reptileId, subscribed]);

  const fetchPhotos = async () => {
    try {
      const { data, error } = await supabase
        .from("reptile_photos")
        .select("*")
        .eq("reptile_id", reptileId)
        .eq("user_id", user!.id)
        .order("taken_at", { ascending: false });

      if (error) throw error;
      setPhotos(data || []);
    } catch (error) {
      console.error("Error fetching photos:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      toast.error(t("photoHistory.selectFile"));
      return;
    }

    setUploading(true);
    try {
      // Upload to storage
      const fileExt = selectedFile.name.split('.').pop();
      const fileName = `${reptileId}/${Date.now()}.${fileExt}`;
      
      const { error: uploadError } = await supabase.storage
        .from("reptile-images")
        .upload(fileName, selectedFile);

      if (uploadError) throw uploadError;

      // Get signed URL
      const { data: urlData } = await supabase.storage
        .from("reptile-images")
        .createSignedUrl(fileName, 60 * 60 * 24 * 365); // 1 year

      if (!urlData?.signedUrl) throw new Error("Failed to get signed URL");

      // Save to database
      const { error: dbError } = await supabase.from("reptile_photos").insert({
        reptile_id: reptileId,
        user_id: user!.id,
        image_url: fileName,
        caption: caption.trim() || null,
        taken_at: takenAt
      });

      if (dbError) throw dbError;

      toast.success(t("photoHistory.photoAdded"));
      setDialogOpen(false);
      setSelectedFile(null);
      setCaption("");
      setTakenAt(new Date().toISOString().split('T')[0]);
      fetchPhotos();
    } catch (error) {
      console.error("Upload error:", error);
      toast.error(t("common.error"));
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (photo: Photo) => {
    try {
      // Delete from storage
      await supabase.storage
        .from("reptile-images")
        .remove([photo.image_url]);

      // Delete from database
      const { error } = await supabase
        .from("reptile_photos")
        .delete()
        .eq("id", photo.id);

      if (error) throw error;
      
      toast.success(t("photoHistory.photoDeleted"));
      setSelectedPhotoIndex(null);
      fetchPhotos();
    } catch (error) {
      toast.error(t("common.error"));
    }
  };

  const getSignedUrl = async (path: string) => {
    const { data } = await supabase.storage
      .from("reptile-images")
      .createSignedUrl(path, 60 * 60);
    return data?.signedUrl;
  };

  if (subLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!subscribed) {
    return (
      <Card className="max-w-md mx-auto">
        <CardContent className="text-center py-12 space-y-4">
          <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
            <Lock className="w-8 h-8 text-primary" />
          </div>
          <h3 className="text-lg font-semibold flex items-center justify-center gap-2">
            <Crown className="w-5 h-5 text-yellow-500" />
            {t("photoHistory.title")}
          </h3>
          <p className="text-sm text-muted-foreground">
            {t("photoHistory.premiumDescription")}
          </p>
          <Button onClick={() => navigate("/settings?tab=subscription")}>
            <Crown className="w-4 h-4 mr-2" />
            {t("premium.upgradeToPremium")}
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <Camera className="w-5 h-5" />
          {t("photoHistory.title")}
        </h3>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button size="sm">
              <Plus className="w-4 h-4 mr-2" />
              {t("photoHistory.addPhoto")}
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{t("photoHistory.addPhoto")}</DialogTitle>
              <DialogDescription>
                {t("photoHistory.addPhotoDescription")}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>{t("photoHistory.selectImage")}</Label>
                <div className="flex gap-2">
                  <div className="flex-1">
                    <Input 
                      type="file" 
                      accept="image/*"
                      onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                      className="cursor-pointer"
                    />
                  </div>
                  <Button 
                    type="button" 
                    variant="outline"
                    onClick={() => {
                      const input = document.createElement('input');
                      input.type = 'file';
                      input.accept = 'image/*';
                      input.capture = 'environment';
                      input.onchange = (e) => {
                        const file = (e.target as HTMLInputElement).files?.[0];
                        if (file) setSelectedFile(file);
                      };
                      input.click();
                    }}
                    title="Prendre une photo"
                  >
                    <Camera className="w-4 h-4" />
                  </Button>
                </div>
                {selectedFile && (
                  <p className="text-xs text-muted-foreground">
                    📷 {selectedFile.name}
                  </p>
                )}
              </div>
              <div>
                <Label>{t("photoHistory.date")}</Label>
                <Input 
                  type="date" 
                  value={takenAt}
                  onChange={(e) => setTakenAt(e.target.value)}
                />
              </div>
              <div>
                <Label>{t("photoHistory.caption")}</Label>
                <Input 
                  value={caption}
                  onChange={(e) => setCaption(e.target.value)}
                  placeholder={t("photoHistory.captionPlaceholder")}
                />
              </div>
              <Button 
                onClick={handleUpload} 
                className="w-full"
                disabled={uploading || !selectedFile}
              >
                {uploading ? t("common.uploading") : t("photoHistory.upload")}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      ) : photos.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <Camera className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">{t("photoHistory.noPhotos")}</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {photos.map((photo, index) => (
              <PhotoCard 
                key={photo.id} 
                photo={photo} 
                onSelect={() => setSelectedPhotoIndex(index)}
                onDelete={() => handleDelete(photo)}
              />
            ))}
          </div>
        )}

        {/* Photo lightbox */}
        <PhotoLightbox
          photos={photos}
          initialIndex={selectedPhotoIndex ?? 0}
          open={selectedPhotoIndex !== null}
          onClose={() => setSelectedPhotoIndex(null)}
          onDelete={(photo) => handleDelete(photo)}
        />
    </div>
  );
};

// Separate component to handle signed URL
const PhotoCard = ({ photo, onSelect, onDelete }: { photo: Photo; onSelect: () => void; onDelete: () => void }) => {
  const { i18n } = useTranslation();
  const [imageUrl, setImageUrl] = useState<string>("");

  useEffect(() => {
    const loadUrl = async () => {
      const { data } = await supabase.storage
        .from("reptile-images")
        .createSignedUrl(photo.image_url, 60 * 60);
      if (data?.signedUrl) setImageUrl(data.signedUrl);
    };
    loadUrl();
  }, [photo.image_url]);

  return (
    <Card 
      className="overflow-hidden cursor-pointer hover:shadow-lg transition-shadow relative group"
      onClick={onSelect}
    >
      {/* Delete button - visible on mobile, hover on desktop */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          onDelete();
        }}
        className="absolute top-2 right-2 z-10 p-2 bg-destructive text-destructive-foreground rounded-full shadow-lg opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity"
        aria-label="Supprimer la photo"
      >
        <Trash2 className="w-4 h-4" />
      </button>
      <div className="aspect-square relative">
        {imageUrl ? (
          <img 
            src={imageUrl} 
            alt={photo.caption || "Photo"} 
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full bg-muted flex items-center justify-center">
            <Camera className="w-8 h-8 text-muted-foreground" />
          </div>
        )}
      </div>
      <CardContent className="p-2">
        <div className="flex items-center gap-1 text-xs text-muted-foreground">
          <Calendar className="w-3 h-3" />
          {format(new Date(photo.taken_at), "d MMM yyyy", { locale: localeMap[i18n.language] || enUS })}
        </div>
        {photo.caption && (
          <p className="text-sm line-clamp-1 mt-1">{photo.caption}</p>
        )}
      </CardContent>
    </Card>
  );
};

