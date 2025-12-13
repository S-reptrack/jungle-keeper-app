import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Download, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import promoSlide1 from '@/assets/promo-slide-1.png';
import promoSlide2 from '@/assets/promo-slide-2.png';
import promoSlide3 from '@/assets/promo-slide-3.png';
import promoSlide4 from '@/assets/promo-slide-4.png';
import promoSlide5 from '@/assets/promo-slide-5.png';

const slides = [
  { image: promoSlide1, title: "Dashboard intuitif" },
  { image: promoSlide4, title: "Fonctionnalités complètes" },
  { image: promoSlide3, title: "Pour les éleveurs exigeants" },
  { image: promoSlide5, title: "Suivi santé" },
  { image: promoSlide2, title: "Commencez maintenant" },
];

const PromoSlideshow = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isExporting, setIsExporting] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!isPlaying) return;
    
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 3000);

    return () => clearInterval(interval);
  }, [isPlaying]);

  const exportAsVideo = async () => {
    setIsExporting(true);
    toast.info("Préparation de l'export vidéo...");

    try {
      // Créer un canvas pour dessiner les frames
      const canvas = document.createElement('canvas');
      canvas.width = 1920;
      canvas.height = 1080;
      const ctx = canvas.getContext('2d');
      
      if (!ctx) {
        throw new Error("Impossible de créer le contexte canvas");
      }

      // Charger toutes les images
      const loadedImages = await Promise.all(
        slides.map((slide) => {
          return new Promise<HTMLImageElement>((resolve, reject) => {
            const img = new Image();
            img.crossOrigin = 'anonymous';
            img.onload = () => resolve(img);
            img.onerror = reject;
            img.src = slide.image;
          });
        })
      );

      // Créer un MediaRecorder pour enregistrer le canvas
      const stream = canvas.captureStream(30);
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: 'video/webm;codecs=vp9',
        videoBitsPerSecond: 5000000
      });

      const chunks: Blob[] = [];
      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunks.push(e.data);
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunks, { type: 'video/webm' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'sreptrack-promo.webm';
        a.click();
        URL.revokeObjectURL(url);
        setIsExporting(false);
        toast.success("Vidéo exportée avec succès !");
      };

      mediaRecorder.start();

      // Animer chaque slide pendant 3 secondes
      for (let i = 0; i < slides.length; i++) {
        const img = loadedImages[i];
        const slideDuration = 3000;
        const fps = 30;
        const frames = (slideDuration / 1000) * fps;
        
        for (let frame = 0; frame < frames; frame++) {
          // Fond dégradé
          const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
          gradient.addColorStop(0, '#1a1a2e');
          gradient.addColorStop(1, '#16213e');
          ctx.fillStyle = gradient;
          ctx.fillRect(0, 0, canvas.width, canvas.height);

          // Animation de scale/fade
          const progress = frame / frames;
          const scale = 1 + (progress * 0.02);
          const opacity = progress < 0.1 ? progress * 10 : progress > 0.9 ? (1 - progress) * 10 : 1;
          
          ctx.globalAlpha = Math.min(1, opacity);
          
          // Dessiner l'image centrée avec scale
          const imgRatio = img.width / img.height;
          const canvasRatio = canvas.width / canvas.height;
          let drawWidth, drawHeight, drawX, drawY;
          
          if (imgRatio > canvasRatio) {
            drawHeight = canvas.height * scale;
            drawWidth = drawHeight * imgRatio;
          } else {
            drawWidth = canvas.width * scale;
            drawHeight = drawWidth / imgRatio;
          }
          
          drawX = (canvas.width - drawWidth) / 2;
          drawY = (canvas.height - drawHeight) / 2;
          
          ctx.drawImage(img, drawX, drawY, drawWidth, drawHeight);
          
          // Overlay gradient en bas
          ctx.globalAlpha = 1;
          const overlayGradient = ctx.createLinearGradient(0, canvas.height * 0.6, 0, canvas.height);
          overlayGradient.addColorStop(0, 'rgba(0,0,0,0)');
          overlayGradient.addColorStop(1, 'rgba(0,0,0,0.7)');
          ctx.fillStyle = overlayGradient;
          ctx.fillRect(0, 0, canvas.width, canvas.height);

          // Titre
          ctx.fillStyle = '#ffffff';
          ctx.font = 'bold 48px system-ui, -apple-system, sans-serif';
          ctx.textAlign = 'left';
          ctx.globalAlpha = opacity;
          ctx.fillText(slides[i].title, 60, canvas.height - 60);
          ctx.globalAlpha = 1;

          // Attendre le prochain frame
          await new Promise(resolve => setTimeout(resolve, 1000 / fps));
        }
      }

      mediaRecorder.stop();
    } catch (error) {
      console.error('Erreur export:', error);
      toast.error("Erreur lors de l'export vidéo");
      setIsExporting(false);
    }
  };

  return (
    <div className="space-y-4">
      <div 
        className="relative w-full max-w-4xl mx-auto rounded-2xl overflow-hidden shadow-2xl bg-card/50 backdrop-blur-sm border border-primary/20"
        onMouseEnter={() => setIsPlaying(false)}
        onMouseLeave={() => setIsPlaying(true)}
      >
        {/* Aspect ratio container */}
        <div className="relative aspect-video">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentSlide}
              initial={{ opacity: 0, scale: 1.05 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.5, ease: "easeInOut" }}
              className="absolute inset-0"
            >
              <img
                src={slides[currentSlide].image}
                alt={slides[currentSlide].title}
                className="w-full h-full object-cover"
              />
              {/* Gradient overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-transparent to-transparent" />
            </motion.div>
          </AnimatePresence>

          {/* Title overlay */}
          <motion.div 
            key={`title-${currentSlide}`}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3, delay: 0.2 }}
            className="absolute bottom-6 left-6 right-6"
          >
            <h3 className="text-xl md:text-2xl font-bold text-foreground drop-shadow-lg">
              {slides[currentSlide].title}
            </h3>
          </motion.div>

          {/* Progress dots */}
          <div className="absolute bottom-6 right-6 flex gap-2">
            {slides.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentSlide(index)}
                className={`w-2 h-2 rounded-full transition-all duration-300 ${
                  index === currentSlide 
                    ? 'bg-primary w-6' 
                    : 'bg-foreground/30 hover:bg-foreground/50'
                }`}
              />
            ))}
          </div>

          {/* Play/Pause indicator */}
          <div className="absolute top-4 right-4">
            <div className={`w-3 h-3 rounded-full ${isPlaying ? 'bg-primary animate-pulse' : 'bg-muted-foreground'}`} />
          </div>
        </div>

        {/* Decorative glow */}
        <div className="absolute -inset-1 bg-gradient-to-r from-primary/20 via-primary/10 to-primary/20 rounded-2xl blur-xl -z-10" />
      </div>

      {/* Export button */}
      <div className="flex justify-center">
        <Button 
          onClick={exportAsVideo}
          disabled={isExporting}
          variant="outline"
          className="gap-2"
        >
          {isExporting ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Export en cours...
            </>
          ) : (
            <>
              <Download className="w-4 h-4" />
              Exporter en vidéo (WebM)
            </>
          )}
        </Button>
      </div>
      
      <canvas ref={canvasRef} className="hidden" />
    </div>
  );
};

export default PromoSlideshow;
