import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Download, Instagram, ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import storyBg from "@/assets/instagram-story-bg-v2.jpg";
import sreptrackLogo from "@/assets/sreptrack-logo.png";

const APP_URL = "https://s-reptrack.app";

type LangKey = "fr" | "en" | "de" | "es" | "nl";

const LANGUAGES: Record<LangKey, {
  flag: string;
  label: string;
  tagline: string;
  badge: string;
  features: string[];
  availableIn: string;
}> = {
  fr: {
    flag: "🇫🇷",
    label: "Français",
    tagline: "Gestion de reptiles professionnelle",
    badge: "100% GRATUIT",
    features: [
      "📊 Suivi poids & croissance",
      "🍽️ Gestion des nourrissages",
      "🐍 Suivi des mues",
      "🏥 Carnet de santé",
      "🥚 Reproduction & généalogie",
    ],
    availableIn: "🌍 Disponible en 16 langues",
  },
  en: {
    flag: "🇬🇧",
    label: "English",
    tagline: "Professional reptile management",
    badge: "100% FREE",
    features: [
      "📊 Weight & growth tracking",
      "🍽️ Feeding management",
      "🐍 Shedding tracker",
      "🏥 Health records",
      "🥚 Breeding & genealogy",
    ],
    availableIn: "🌍 Available in 16 languages",
  },
  de: {
    flag: "🇩🇪",
    label: "Deutsch",
    tagline: "Professionelle Reptilienverwaltung",
    badge: "100% KOSTENLOS",
    features: [
      "📊 Gewichts- & Wachstumsverfolgung",
      "🍽️ Fütterungsverwaltung",
      "🐍 Häutungstracker",
      "🏥 Gesundheitsakten",
      "🥚 Zucht & Genealogie",
    ],
    availableIn: "🌍 Verfügbar in 16 Sprachen",
  },
  es: {
    flag: "🇪🇸",
    label: "Español",
    tagline: "Gestión profesional de reptiles",
    badge: "100% GRATIS",
    features: [
      "📊 Seguimiento de peso y crecimiento",
      "🍽️ Gestión de alimentación",
      "🐍 Seguimiento de mudas",
      "🏥 Historial de salud",
      "🥚 Reproducción y genealogía",
    ],
    availableIn: "🌍 Disponible en 16 idiomas",
  },
  nl: {
    flag: "🇳🇱",
    label: "Nederlands",
    tagline: "Professioneel reptielenbeheer",
    badge: "100% GRATIS",
    features: [
      "📊 Gewicht & groei bijhouden",
      "🍽️ Voedingsbeheer",
      "🐍 Vervellingstracker",
      "🏥 Gezondheidsgegevens",
      "🥚 Kweek & stamboom",
    ],
    availableIn: "🌍 Beschikbaar in 16 talen",
  },
};

const LANG_KEYS: LangKey[] = ["fr", "en", "de", "es", "nl"];

const InstagramPromo = () => {
  const navigate = useNavigate();
  const [downloading, setDownloading] = useState(false);
  const [selectedLang, setSelectedLang] = useState<LangKey>("fr");

  const lang = LANGUAGES[selectedLang];

  const handleDownload = async () => {
    setDownloading(true);
    try {
      const canvas = document.createElement("canvas");
      canvas.width = 1080;
      canvas.height = 1350;
      const ctx = canvas.getContext("2d")!;

      // Load background
      const bgImg = new Image();
      bgImg.crossOrigin = "anonymous";
      await new Promise<void>((resolve, reject) => {
        bgImg.onload = () => resolve();
        bgImg.onerror = reject;
        bgImg.src = storyBg;
      });
      ctx.drawImage(bgImg, 0, 0, 1080, 1350);

      // Dark overlay
      ctx.fillStyle = "rgba(0,0,0,0.35)";
      ctx.fillRect(0, 0, 1080, 1350);

      // Top gradient
      const topGrad = ctx.createLinearGradient(0, 0, 0, 300);
      topGrad.addColorStop(0, "rgba(0,0,0,0.7)");
      topGrad.addColorStop(1, "rgba(0,0,0,0)");
      ctx.fillStyle = topGrad;
      ctx.fillRect(0, 0, 1080, 300);

      // Bottom gradient
      const botGrad = ctx.createLinearGradient(0, 850, 0, 1350);
      botGrad.addColorStop(0, "rgba(0,0,0,0)");
      botGrad.addColorStop(1, "rgba(0,0,0,0.85)");
      ctx.fillStyle = botGrad;
      ctx.fillRect(0, 850, 1080, 500);

      // Load and draw logo
      const logoImg = new Image();
      logoImg.crossOrigin = "anonymous";
      await new Promise<void>((resolve, reject) => {
        logoImg.onload = () => resolve();
        logoImg.onerror = reject;
        logoImg.src = sreptrackLogo;
      });
      const logoSize = 260;
      const logoX = (1080 - logoSize) / 2;
      const logoY = 260;
      ctx.drawImage(logoImg, logoX, logoY, logoSize, logoSize);

      // App name
      ctx.textAlign = "center";
      ctx.fillStyle = "#4ade80";
      ctx.font = "bold 68px -apple-system, BlinkMacSystemFont, sans-serif";
      ctx.fillText("S-RepTrack", 540, logoY + logoSize + 65);

      // Tagline
      ctx.fillStyle = "rgba(255,255,255,0.8)";
      ctx.font = "30px -apple-system, BlinkMacSystemFont, sans-serif";
      ctx.fillText(lang.tagline, 540, logoY + logoSize + 110);

      // Badge
      ctx.fillStyle = "#4ade80";
      const badgeText = lang.badge;
      ctx.font = "bold 38px -apple-system, BlinkMacSystemFont, sans-serif";
      const badgeMetrics = ctx.measureText(badgeText);
      const badgeW = badgeMetrics.width + 60;
      const badgeH = 60;
      const badgeX = (1080 - badgeW) / 2;
      const badgeY = 880;
      ctx.beginPath();
      ctx.roundRect(badgeX, badgeY, badgeW, badgeH, 16);
      ctx.fill();
      ctx.fillStyle = "#000000";
      ctx.fillText(badgeText, 540, 922);

      // Features
      ctx.font = "26px -apple-system, BlinkMacSystemFont, sans-serif";
      let y = 1000;
      lang.features.forEach((feat) => {
        ctx.fillStyle = "rgba(255,255,255,0.9)";
        ctx.fillText(feat, 540, y);
        y += 40;
      });

      // Available in 16 languages
      ctx.fillStyle = "#4ade80";
      ctx.font = "bold 26px -apple-system, BlinkMacSystemFont, sans-serif";
      ctx.fillText(lang.availableIn, 540, y + 15);

      // URL CTA
      ctx.fillStyle = "#4ade80";
      ctx.font = "bold 30px -apple-system, BlinkMacSystemFont, sans-serif";
      ctx.fillText("🔗 s-reptrack.app", 540, y + 60);

      // Download
      const link = document.createElement("a");
      link.download = `sreptrack-instagram-${selectedLang}.png`;
      link.href = canvas.toDataURL("image/png");
      link.click();
    } catch (error) {
      console.error("Download failed:", error);
    } finally {
      setDownloading(false);
    }
  };

  const handleDownloadAll = async () => {
    for (const lk of LANG_KEYS) {
      setSelectedLang(lk);
      await new Promise((r) => setTimeout(r, 300));
    }
    // Download each one
    setDownloading(true);
    for (const lk of LANG_KEYS) {
      const l = LANGUAGES[lk];
      try {
        const canvas = document.createElement("canvas");
        canvas.width = 1080;
        canvas.height = 1350;
        const ctx = canvas.getContext("2d")!;

        const bgImg = new Image();
        bgImg.crossOrigin = "anonymous";
        await new Promise<void>((resolve, reject) => {
          bgImg.onload = () => resolve();
          bgImg.onerror = reject;
          bgImg.src = storyBg;
        });
        ctx.drawImage(bgImg, 0, 0, 1080, 1350);
        ctx.fillStyle = "rgba(0,0,0,0.35)";
        ctx.fillRect(0, 0, 1080, 1350);
        const topGrad = ctx.createLinearGradient(0, 0, 0, 300);
        topGrad.addColorStop(0, "rgba(0,0,0,0.7)");
        topGrad.addColorStop(1, "rgba(0,0,0,0)");
        ctx.fillStyle = topGrad;
        ctx.fillRect(0, 0, 1080, 300);
        const botGrad = ctx.createLinearGradient(0, 850, 0, 1350);
        botGrad.addColorStop(0, "rgba(0,0,0,0)");
        botGrad.addColorStop(1, "rgba(0,0,0,0.85)");
        ctx.fillStyle = botGrad;
        ctx.fillRect(0, 850, 1080, 500);

        const logoImg = new Image();
        logoImg.crossOrigin = "anonymous";
        await new Promise<void>((resolve, reject) => {
          logoImg.onload = () => resolve();
          logoImg.onerror = reject;
          logoImg.src = sreptrackLogo;
        });
        const logoSize = 260;
        ctx.drawImage(logoImg, (1080 - logoSize) / 2, 260, logoSize, logoSize);

        ctx.textAlign = "center";
        ctx.fillStyle = "#4ade80";
        ctx.font = "bold 68px -apple-system, BlinkMacSystemFont, sans-serif";
        ctx.fillText("S-RepTrack", 540, 260 + logoSize + 65);
        ctx.fillStyle = "rgba(255,255,255,0.8)";
        ctx.font = "30px -apple-system, BlinkMacSystemFont, sans-serif";
        ctx.fillText(l.tagline, 540, 260 + logoSize + 110);

        ctx.fillStyle = "#4ade80";
        ctx.font = "bold 38px -apple-system, BlinkMacSystemFont, sans-serif";
        const bm = ctx.measureText(l.badge);
        const bW = bm.width + 60;
        ctx.beginPath();
        ctx.roundRect((1080 - bW) / 2, 880, bW, 60, 16);
        ctx.fill();
        ctx.fillStyle = "#000000";
        ctx.fillText(l.badge, 540, 922);

        ctx.font = "26px -apple-system, BlinkMacSystemFont, sans-serif";
        let y = 1000;
        l.features.forEach((feat) => {
          ctx.fillStyle = "rgba(255,255,255,0.9)";
          ctx.fillText(feat, 540, y);
          y += 40;
        });
        ctx.fillStyle = "#4ade80";
        ctx.font = "bold 26px -apple-system, BlinkMacSystemFont, sans-serif";
        ctx.fillText(l.availableIn, 540, y + 15);
        ctx.font = "bold 30px -apple-system, BlinkMacSystemFont, sans-serif";
        ctx.fillText("🔗 s-reptrack.app", 540, y + 60);

        const link = document.createElement("a");
        link.download = `sreptrack-instagram-${lk}.png`;
        link.href = canvas.toDataURL("image/png");
        link.click();
        await new Promise((r) => setTimeout(r, 500));
      } catch (e) {
        console.error(`Failed for ${lk}:`, e);
      }
    }
    setSelectedLang("fr");
    setDownloading(false);
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
            <p className="text-sm text-muted-foreground">Post Instagram (4:5) — Multilingue</p>
          </div>
        </div>

        {/* Language selector */}
        <div className="flex gap-2 flex-wrap">
          {LANG_KEYS.map((lk) => (
            <Button
              key={lk}
              variant={selectedLang === lk ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedLang(lk)}
              className={selectedLang === lk ? "bg-green-600 hover:bg-green-700" : ""}
            >
              {LANGUAGES[lk].flag} {LANGUAGES[lk].label}
            </Button>
          ))}
        </div>

        {/* Preview */}
        <Card className="overflow-hidden">
          <CardContent className="p-0">
            <div className="relative aspect-[4/5] max-h-[70vh] overflow-hidden rounded-lg">
              <img
                src={storyBg}
                alt="Background"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-black/35" />
              <div className="absolute top-0 left-0 right-0 h-[25%] bg-gradient-to-b from-black/70 to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 h-[40%] bg-gradient-to-t from-black/85 to-transparent" />

              {/* Logo centered */}
              <div className="absolute inset-0 flex flex-col items-center justify-center -mt-16">
                <img
                  src={sreptrackLogo}
                  alt="S-RepTrack Logo"
                  className="w-24 h-24 md:w-32 md:h-32 drop-shadow-2xl"
                />
                <h2 className="text-2xl md:text-3xl font-bold text-green-400 mt-3 drop-shadow-lg">S-RepTrack</h2>
                <p className="text-white/80 text-xs md:text-sm mt-1">{lang.tagline}</p>
              </div>

              {/* Bottom content */}
              <div className="absolute bottom-3 left-3 right-3 text-center space-y-2">
                <div className="inline-block bg-green-400 text-black font-bold text-sm px-5 py-1.5 rounded-xl">
                  {lang.badge}
                </div>
                <div className="space-y-0.5 text-white/90 text-[10px] md:text-xs">
                  {lang.features.map((f, i) => (
                    <p key={i}>{f}</p>
                  ))}
                </div>
                <p className="text-green-400 font-bold text-[10px] md:text-xs">{lang.availableIn}</p>
                <a
                  href={APP_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-block text-green-400 font-bold text-xs mt-1 underline underline-offset-4"
                >
                  🔗 s-reptrack.app
                </a>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="space-y-3">
          <Button
            onClick={handleDownload}
            disabled={downloading}
            className="w-full bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700"
          >
            <Download className="w-4 h-4 mr-2" />
            {downloading ? "Génération..." : `Télécharger ${lang.flag} (1080x1350)`}
          </Button>

          <Button
            onClick={handleDownloadAll}
            disabled={downloading}
            variant="outline"
            className="w-full"
          >
            <Download className="w-4 h-4 mr-2" />
            {downloading ? "Génération en cours..." : "Télécharger les 5 langues"}
          </Button>
        </div>

        <p className="text-xs text-muted-foreground text-center">
          📱 Image optimisée pour les posts Instagram (format 4:5) — Mention "16 langues" incluse
        </p>
      </div>
    </div>
  );
};

export default InstagramPromo;
