import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { ChevronLeft, ChevronRight, X, Trash2, Calendar } from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { Button } from "@/components/ui/button";
import { useTranslation } from "react-i18next";

interface Photo {
  id: string;
  image_url: string;
  caption: string | null;
  taken_at: string;
  created_at: string;
}

interface PhotoLightboxProps {
  photos: Photo[];
  initialIndex: number;
  open: boolean;
  onClose: () => void;
  onDelete?: (photo: Photo) => void;
}

export const PhotoLightbox = ({ photos, initialIndex, open, onClose, onDelete }: PhotoLightboxProps) => {
  const { t } = useTranslation();
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [imageUrl, setImageUrl] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchDelta, setTouchDelta] = useState(0);

  const currentPhoto = photos[currentIndex];

  useEffect(() => {
    setCurrentIndex(initialIndex);
  }, [initialIndex]);

  useEffect(() => {
    if (!currentPhoto || !open) return;
    setLoading(true);
    const loadUrl = async () => {
      const { data } = await supabase.storage
        .from("reptile-images")
        .createSignedUrl(currentPhoto.image_url, 60 * 60);
      if (data?.signedUrl) setImageUrl(data.signedUrl);
      setLoading(false);
    };
    loadUrl();
  }, [currentPhoto, open]);

  const goNext = useCallback(() => {
    if (currentIndex < photos.length - 1) setCurrentIndex(i => i + 1);
  }, [currentIndex, photos.length]);

  const goPrev = useCallback(() => {
    if (currentIndex > 0) setCurrentIndex(i => i - 1);
  }, [currentIndex]);

  // Keyboard navigation
  useEffect(() => {
    if (!open) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") goNext();
      else if (e.key === "ArrowLeft") goPrev();
      else if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [open, goNext, goPrev, onClose]);

  // Touch/swipe handling
  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStart(e.touches[0].clientX);
    setTouchDelta(0);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (touchStart === null) return;
    setTouchDelta(e.touches[0].clientX - touchStart);
  };

  const handleTouchEnd = () => {
    if (Math.abs(touchDelta) > 60) {
      if (touchDelta < 0) goNext();
      else goPrev();
    }
    setTouchStart(null);
    setTouchDelta(0);
  };

  if (!open || !currentPhoto) return null;

  return (
    <div
      className="fixed inset-0 z-[100] bg-black flex flex-col"
      onClick={onClose}
    >
      {/* Header */}
      <div className="flex items-center justify-between p-4 text-white shrink-0" onClick={e => e.stopPropagation()}>
        <div className="flex items-center gap-2 text-sm text-white/70">
          <Calendar className="w-4 h-4" />
          {format(new Date(currentPhoto.taken_at), "d MMMM yyyy", { locale: fr })}
          <span className="ml-2">{currentIndex + 1} / {photos.length}</span>
        </div>
        <div className="flex items-center gap-2">
          {onDelete && (
            <Button
              variant="ghost"
              size="icon"
              className="text-white hover:bg-white/20 hover:text-red-400"
              onClick={() => onDelete(currentPhoto)}
            >
              <Trash2 className="w-5 h-5" />
            </Button>
          )}
          <Button
            variant="ghost"
            size="icon"
            className="text-white hover:bg-white/20"
            onClick={onClose}
          >
            <X className="w-6 h-6" />
          </Button>
        </div>
      </div>

      {/* Image area */}
      <div
        className="flex-1 flex items-center justify-center relative overflow-hidden min-h-0"
        onClick={e => e.stopPropagation()}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {/* Previous button */}
        {currentIndex > 0 && (
          <button
            className="absolute left-2 md:left-4 z-10 p-2 rounded-full bg-black/50 text-white hover:bg-black/70 transition-colors"
            onClick={goPrev}
          >
            <ChevronLeft className="w-6 h-6 md:w-8 md:h-8" />
          </button>
        )}

        {/* Image */}
        <div
          className="w-full h-full flex items-center justify-center transition-transform duration-200 ease-out"
          style={{ transform: `translateX(${touchDelta}px)` }}
        >
          {loading ? (
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-white"></div>
          ) : (
            <img
              src={imageUrl}
              alt={currentPhoto.caption || "Photo"}
              className="max-w-[95vw] max-h-[80vh] w-auto h-auto object-contain select-none"
              draggable={false}
            />
          )}
        </div>

        {/* Next button */}
        {currentIndex < photos.length - 1 && (
          <button
            className="absolute right-2 md:right-4 z-10 p-2 rounded-full bg-black/50 text-white hover:bg-black/70 transition-colors"
            onClick={goNext}
          >
            <ChevronRight className="w-6 h-6 md:w-8 md:h-8" />
          </button>
        )}
      </div>

      {/* Caption */}
      {currentPhoto.caption && (
        <div className="p-4 text-center text-white/80 text-sm shrink-0" onClick={e => e.stopPropagation()}>
          {currentPhoto.caption}
        </div>
      )}
    </div>
  );
};
