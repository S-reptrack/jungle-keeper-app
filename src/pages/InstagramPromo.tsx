import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Download, Instagram, ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import storyBg from "@/assets/instagram-story-bg-v2.jpg";
import sreptrackLogo from "@/assets/sreptrack-logo.png";

const APP_URL = "https://s-reptrack.app";

const InstagramPromo = () => {
  const navigate = useNavigate();
  const [downloading, setDownloading] = useState(false);

  const handleDownload = async () => {
    setDownloading(true);
    try {
      const canvas = document.createElement("canvas");
      canvas.width = 1080;
      canvas.height = 1920;
      const ctx = canvas.getContext("2d")!;

      // Load background
      const bgImg = new Image();
      bgImg.crossOrigin = "anonymous";
      await new Promise<void>((resolve, reject) => {
        bgImg.onload = () => resolve();
        bgImg.onerror = reject;
        bgImg.src = storyBg;
      });
      ctx.drawImage(bgImg, 0, 0, 1080, 1920);

      // Dark overlay for readability
      ctx.fillStyle = "rgba(0,0,0,0.35)";
      ctx.fillRect(0, 0, 1080, 1920);

      // Top gradient
      const topGrad = ctx.createLinearGradient(0, 0, 0, 400);
      topGrad.addColorStop(0, "rgba(0,0,0,0.7)");
      topGrad.addColorStop(1, "rgba(0,0,0,0)");
      ctx.fillStyle = topGrad;
      ctx.fillRect(0, 0, 1080, 400);

      // Bottom gradient
      const botGrad = ctx.createLinearGradient(0, 1300, 0, 1920);
      botGrad.addColorStop(0, "rgba(0,0,0,0)");
      botGrad.addColorStop(1, "rgba(0,0,0,0.85)");
      ctx.fillStyle = botGrad;
      ctx.fillRect(0, 1300, 1080, 620);

      // Load and draw logo centered
      const logoImg = new Image();
      logoImg.crossOrigin = "anonymous";
      await new Promise<void>((resolve, reject) => {
        logoImg.onload = () => resolve();
        logoImg.onerror = reject;
        logoImg.src = sreptrackLogo;
      });
      const logoSize = 320;
      const logoX = (1080 - logoSize) / 2;
      const logoY = 580;
      ctx.drawImage(logoImg, logoX, logoY, logoSize, logoSize);

      // App name under logo
      ctx.textAlign = "center";
      ctx.fillStyle = "#4ade80";
      ctx.font = "bold 72px -apple-system, BlinkMacSystemFont, sans-serif";
      ctx.fillText("S-RepTrack", 540, logoY + logoSize + 70);

      // Tagline
      ctx.fillStyle = "rgba(255,255,255,0.8)";
      ctx.font = "32px -apple-system, BlinkMacSystemFont, sans-serif";
      ctx.fillText("Gestion de reptiles professionnelle", 540, logoY + logoSize + 120);

      // GRATUIT badge
      ctx.fillStyle = "#4ade80";
      const badgeW = 340;
      const badgeH = 70;
      const badgeX = (1080 - badgeW) / 2;
      const badgeY = 1420;
      ctx.beginPath();
      ctx.roundRect(badgeX, badgeY, badgeW, badgeH, 16);
      ctx.fill();
      ctx.fillStyle = "#000000";
      ctx.font = "bold 42px -apple-system, BlinkMacSystemFont, sans-serif";
      ctx.fillText("100% GRATUIT", 540, 1468);

      // Features
      const features = [
        "📊 Suivi poids & croissance",
        "🍽️ Gestion des nourrissages",
        "🐍 Suivi des mues",
        "🏥 Carnet de santé",
        "🥚 Reproduction & généalogie",
      ];
      ctx.font = "30px -apple-system, BlinkMacSystemFont, sans-serif";
      let y = 1540;
      features.forEach((feat) => {
        ctx.fillStyle = "rgba(255,255,255,0.9)";
        ctx.fillText(feat, 540, y);
        y += 46;
      });

      // URL CTA
      ctx.fillStyle = "#4ade80";
      ctx.font = "bold 34px -apple-system, BlinkMacSystemFont, sans-serif";
      ctx.fillText("🔗 s-reptrack.app", 540, y + 40);

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
              {/* Dark overlay */}
              <div className="absolute inset-0 bg-black/35" />
              {/* Top gradient */}
              <div className="absolute top-0 left-0 right-0 h-[25%] bg-gradient-to-b from-black/70 to-transparent" />
              {/* Bottom gradient */}
              <div className="absolute bottom-0 left-0 right-0 h-[40%] bg-gradient-to-t from-black/85 to-transparent" />

              {/* Logo centered */}
              <div className="absolute inset-0 flex flex-col items-center justify-center -mt-10">
                <img
                  src={sreptrackLogo}
                  alt="S-RepTrack Logo"
                  className="w-28 h-28 md:w-36 md:h-36 drop-shadow-2xl"
                />
                <h2 className="text-3xl font-bold text-green-400 mt-4 drop-shadow-lg">S-RepTrack</h2>
                <p className="text-white/80 text-sm mt-1">Gestion de reptiles professionnelle</p>
              </div>

              {/* Bottom content */}
              <div className="absolute bottom-4 left-4 right-4 text-center space-y-3">
                <div className="inline-block bg-green-400 text-black font-bold text-base px-6 py-2 rounded-xl">
                  100% GRATUIT
                </div>
                <div className="space-y-1 text-white/90 text-xs">
                  <p>📊 Suivi poids & croissance</p>
                  <p>🍽️ Gestion des nourrissages</p>
                  <p>🐍 Suivi des mues</p>
                  <p>🏥 Carnet de santé</p>
                  <p>🥚 Reproduction & généalogie</p>
                </div>
                <a
                  href={APP_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-block text-green-400 font-bold text-sm mt-2 underline underline-offset-4"
                >
                  🔗 s-reptrack.app
                </a>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Actions */}
        <Button
          onClick={handleDownload}
          disabled={downloading}
          className="w-full bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700"
        >
          <Download className="w-4 h-4 mr-2" />
          {downloading ? "Génération..." : "Télécharger (1080x1920)"}
        </Button>

        <p className="text-xs text-muted-foreground text-center">
          📱 Image optimisée pour les Stories et Reels Instagram
        </p>
      </div>
    </div>
  );
};

export default InstagramPromo;
