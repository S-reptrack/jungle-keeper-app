import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Download, Instagram, ArrowLeft, Share2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import storyBg from "@/assets/instagram-story-bg.jpg";
import sreptrackLogo from "@/assets/sreptrack-logo.png";

const InstagramPromo = () => {
  const navigate = useNavigate();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [downloading, setDownloading] = useState(false);

  const handleDownload = async () => {
    setDownloading(true);
    try {
      const canvas = document.createElement("canvas");
      canvas.width = 1080;
      canvas.height = 1920;
      const ctx = canvas.getContext("2d")!;

      // Load background image
      const bgImg = new Image();
      bgImg.crossOrigin = "anonymous";
      await new Promise<void>((resolve, reject) => {
        bgImg.onload = () => resolve();
        bgImg.onerror = reject;
        bgImg.src = storyBg;
      });
      ctx.drawImage(bgImg, 0, 0, 1080, 1920);

      // Dark overlay gradient (top and bottom)
      const topGrad = ctx.createLinearGradient(0, 0, 0, 500);
      topGrad.addColorStop(0, "rgba(0,0,0,0.85)");
      topGrad.addColorStop(1, "rgba(0,0,0,0)");
      ctx.fillStyle = topGrad;
      ctx.fillRect(0, 0, 1080, 500);

      const botGrad = ctx.createLinearGradient(0, 1400, 0, 1920);
      botGrad.addColorStop(0, "rgba(0,0,0,0)");
      botGrad.addColorStop(1, "rgba(0,0,0,0.9)");
      ctx.fillStyle = botGrad;
      ctx.fillRect(0, 1400, 1080, 520);

      // Logo area - emoji + text
      ctx.textAlign = "center";
      ctx.fillStyle = "#4ade80";
      ctx.font = "bold 52px -apple-system, BlinkMacSystemFont, sans-serif";
      ctx.fillText("🦎 S-RepTrack", 540, 120);

      // Subtitle
      ctx.fillStyle = "rgba(255,255,255,0.7)";
      ctx.font = "28px -apple-system, BlinkMacSystemFont, sans-serif";
      ctx.fillText("Gestion de reptiles", 540, 170);

      // Main headline - "GRATUIT" badge
      ctx.fillStyle = "#4ade80";
      const badgeWidth = 300;
      const badgeHeight = 65;
      const badgeX = 540 - badgeWidth / 2;
      const badgeY = 1520;
      ctx.beginPath();
      ctx.roundRect(badgeX, badgeY, badgeWidth, badgeHeight, 16);
      ctx.fill();

      ctx.fillStyle = "#000000";
      ctx.font = "bold 40px -apple-system, BlinkMacSystemFont, sans-serif";
      ctx.fillText("100% GRATUIT", 540, 1565);

      // Feature list
      ctx.fillStyle = "#ffffff";
      ctx.font = "bold 36px -apple-system, BlinkMacSystemFont, sans-serif";
      ctx.textAlign = "center";
      
      const features = [
        "📊 Suivi poids & croissance",
        "🍽️ Gestion des nourrissages",
        "🐍 Suivi des mues",
        "🏥 Carnet de santé",
        "🥚 Reproduction & généalogie",
      ];
      
      let y = 1630;
      ctx.font = "28px -apple-system, BlinkMacSystemFont, sans-serif";
      features.forEach((feat) => {
        ctx.fillStyle = "rgba(255,255,255,0.9)";
        ctx.fillText(feat, 540, y);
        y += 42;
      });

      // CTA
      ctx.fillStyle = "#ffffff";
      ctx.font = "bold 30px -apple-system, BlinkMacSystemFont, sans-serif";
      ctx.fillText("🔗 jungle-keeper-app.lovable.app", 540, y + 30);

      // Download
      const link = document.createElement("a");
      link.download = "sreptrack-instagram-story.png";
      link.href = canvas.toDataURL("image/png");
      link.click();
    } catch (error) {
      console.error("Download failed:", error);
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-lg mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-xl font-bold flex items-center gap-2">
              <Instagram className="w-5 h-5 text-pink-500" />
              Promo Instagram
            </h1>
            <p className="text-sm text-muted-foreground">Story / Reel vertical (9:16)</p>
          </div>
        </div>

        {/* Preview */}
        <Card className="overflow-hidden">
          <CardContent className="p-0">
            <div className="relative aspect-[9/16] max-h-[70vh] overflow-hidden rounded-lg">
              <img
                src={storyBg}
                alt="Instagram Story Background"
                className="w-full h-full object-cover"
              />
              {/* Top overlay */}
              <div className="absolute inset-0 bg-gradient-to-b from-black/85 via-transparent to-transparent" style={{ height: "30%" }} />
              {/* Bottom overlay */}
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 via-black/60 to-transparent" style={{ height: "45%" }} />

              {/* Logo */}
              <div className="absolute top-6 left-0 right-0 text-center">
                <p className="text-2xl font-bold text-green-400">🦎 S-RepTrack</p>
                <p className="text-xs text-white/70 mt-1">Gestion de reptiles</p>
              </div>

              {/* Content */}
              <div className="absolute bottom-4 left-4 right-4 text-center space-y-3">
                <div className="inline-block bg-green-400 text-black font-bold text-lg px-6 py-2 rounded-xl">
                  100% GRATUIT
                </div>
                <div className="space-y-1 text-white/90 text-sm">
                  <p>📊 Suivi poids & croissance</p>
                  <p>🍽️ Gestion des nourrissages</p>
                  <p>🐍 Suivi des mues</p>
                  <p>🏥 Carnet de santé</p>
                  <p>🥚 Reproduction & généalogie</p>
                </div>
                <p className="text-white font-semibold text-xs mt-2">
                  🔗 jungle-keeper-app.lovable.app
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="flex gap-3">
          <Button onClick={handleDownload} disabled={downloading} className="flex-1 bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700">
            <Download className="w-4 h-4 mr-2" />
            {downloading ? "Génération..." : "Télécharger (1080x1920)"}
          </Button>
        </div>

        <p className="text-xs text-muted-foreground text-center">
          📱 Image optimisée pour les Stories et Reels Instagram
        </p>
      </div>
    </div>
  );
};

export default InstagramPromo;
