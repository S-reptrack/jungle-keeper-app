import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useSubscription } from "@/hooks/useSubscription";
import { Camera, Plus, Trash2, Calendar, Crown, Lock } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
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
  const { t } = useTranslation();
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
  const [selectedPhoto, setSelectedPhoto] = useState<Photo | null>(null);

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
      setSelectedPhoto(null);
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
              <div>
                <Label>{t("photoHistory.selectImage")}</Label>
                <Input 
                  type="file" 
                  accept="image/*"
                  onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                />
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
          {photos.map(photo => (
            <PhotoCard 
              key={photo.id} 
              photo={photo} 
              onSelect={() => setSelectedPhoto(photo)}
            />
          ))}
        </div>
      )}

      {/* Photo detail dialog */}
      <Dialog open={!!selectedPhoto} onOpenChange={() => setSelectedPhoto(null)}>
        <DialogContent className="max-w-2xl">
          {selectedPhoto && (
            <>
              <PhotoDetail photo={selectedPhoto} />
              <div className="flex justify-end gap-2">
                <Button 
                  variant="destructive" 
                  onClick={() => handleDelete(selectedPhoto)}
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  {t("common.delete")}
                </Button>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

// Separate component to handle signed URL
const PhotoCard = ({ photo, onSelect }: { photo: Photo; onSelect: () => void }) => {
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
      className="overflow-hidden cursor-pointer hover:shadow-lg transition-shadow"
      onClick={onSelect}
    >
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
          {format(new Date(photo.taken_at), "d MMM yyyy", { locale: fr })}
        </div>
        {photo.caption && (
          <p className="text-sm line-clamp-1 mt-1">{photo.caption}</p>
        )}
      </CardContent>
    </Card>
  );
};

const PhotoDetail = ({ photo }: { photo: Photo }) => {
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
    <div className="space-y-4">
      <div className="aspect-video relative rounded-lg overflow-hidden bg-muted">
        {imageUrl ? (
          <img 
            src={imageUrl} 
            alt={photo.caption || "Photo"} 
            className="w-full h-full object-contain"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Camera className="w-12 h-12 text-muted-foreground" />
          </div>
        )}
      </div>
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Calendar className="w-4 h-4" />
        {format(new Date(photo.taken_at), "d MMMM yyyy", { locale: fr })}
      </div>
      {photo.caption && (
        <p className="text-sm">{photo.caption}</p>
      )}
    </div>
  );
};
