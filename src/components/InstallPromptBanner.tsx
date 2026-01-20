import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { X, Download, Smartphone, Share2, Plus } from "lucide-react";
import { useTranslation } from "react-i18next";
import { motion, AnimatePresence } from "framer-motion";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

type DeviceType = "ios" | "android" | "desktop" | "unknown";

const detectDevice = (): DeviceType => {
  const userAgent = navigator.userAgent.toLowerCase();
  
  if (/iphone|ipad|ipod/.test(userAgent)) {
    return "ios";
  }
  if (/android/.test(userAgent)) {
    return "android";
  }
  if (!/mobile/i.test(userAgent)) {
    return "desktop";
  }
  return "unknown";
};

const isStandalone = (): boolean => {
  return (
    window.matchMedia("(display-mode: standalone)").matches ||
    (window.navigator as any).standalone === true ||
    document.referrer.includes("android-app://")
  );
};

const InstallPromptBanner = () => {
  const { t } = useTranslation();
  const [showBanner, setShowBanner] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [deviceType, setDeviceType] = useState<DeviceType>("unknown");
  const [showIosInstructions, setShowIosInstructions] = useState(false);

  useEffect(() => {
    // Don't show if already installed
    if (isStandalone()) {
      return;
    }

    // Check if user dismissed the banner before
    const dismissed = localStorage.getItem("pwa-install-dismissed");
    const dismissedTime = dismissed ? parseInt(dismissed, 10) : 0;
    const oneWeek = 7 * 24 * 60 * 60 * 1000;
    
    // Show again after one week
    if (dismissed && Date.now() - dismissedTime < oneWeek) {
      return;
    }

    const device = detectDevice();
    setDeviceType(device);

    // For iOS, show banner after a short delay
    if (device === "ios") {
      const timer = setTimeout(() => {
        setShowBanner(true);
      }, 3000);
      return () => clearTimeout(timer);
    }

    // For Android/Desktop, listen for the beforeinstallprompt event
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      // Show banner after a short delay
      setTimeout(() => {
        setShowBanner(true);
      }, 2000);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;

    try {
      await deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      
      if (outcome === "accepted") {
        setShowBanner(false);
      }
      setDeferredPrompt(null);
    } catch (error) {
      console.error("Error during PWA install:", error);
    }
  };

  const handleDismiss = () => {
    setShowBanner(false);
    setShowIosInstructions(false);
    localStorage.setItem("pwa-install-dismissed", Date.now().toString());
  };

  const handleIosInstall = () => {
    setShowIosInstructions(true);
  };

  if (!showBanner) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 100, opacity: 0 }}
        transition={{ type: "spring", damping: 25, stiffness: 300 }}
        className="fixed bottom-20 left-4 right-4 z-[100] md:bottom-24 md:left-auto md:right-6 md:max-w-sm"
      >
        <div className="bg-card border border-border shadow-2xl rounded-2xl p-4 relative overflow-hidden">
          {/* Gradient decoration */}
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-primary via-primary/80 to-primary/60" />
          
          {/* Close button */}
          <button
            onClick={handleDismiss}
            className="absolute top-3 right-3 p-1 rounded-full hover:bg-muted transition-colors"
            aria-label={t("common.close")}
          >
            <X className="w-4 h-4 text-muted-foreground" />
          </button>

          {!showIosInstructions ? (
            // Main install prompt
            <div className="flex items-start gap-3 pr-6">
              <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center flex-shrink-0">
                <Smartphone className="w-6 h-6 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-foreground text-sm">
                  {t("installBanner.title")}
                </h3>
                <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">
                  {t("installBanner.description")}
                </p>
                <div className="flex gap-2 mt-3">
                  {deviceType === "ios" ? (
                    <Button 
                      size="sm" 
                      onClick={handleIosInstall}
                      className="gap-1.5 text-xs h-8"
                    >
                      <Share2 className="w-3.5 h-3.5" />
                      {t("installBanner.howToInstall")}
                    </Button>
                  ) : deferredPrompt ? (
                    <Button 
                      size="sm" 
                      onClick={handleInstall}
                      className="gap-1.5 text-xs h-8"
                    >
                      <Download className="w-3.5 h-3.5" />
                      {t("installBanner.install")}
                    </Button>
                  ) : (
                    <Button 
                      size="sm" 
                      variant="secondary"
                      onClick={handleDismiss}
                      className="text-xs h-8"
                    >
                      {t("installBanner.later")}
                    </Button>
                  )}
                  <Button 
                    size="sm" 
                    variant="ghost" 
                    onClick={handleDismiss}
                    className="text-xs h-8"
                  >
                    {t("installBanner.notNow")}
                  </Button>
                </div>
              </div>
            </div>
          ) : (
            // iOS instructions
            <div className="pr-6">
              <h3 className="font-semibold text-foreground text-sm mb-3">
                {t("installBanner.iosTitle")}
              </h3>
              <div className="space-y-2.5">
                <div className="flex items-center gap-2 text-xs">
                  <div className="w-5 h-5 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-[10px] font-bold flex-shrink-0">
                    1
                  </div>
                  <span className="text-foreground">{t("installBanner.iosStep1")}</span>
                  <Share2 className="w-4 h-4 text-primary flex-shrink-0" />
                </div>
                <div className="flex items-center gap-2 text-xs">
                  <div className="w-5 h-5 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-[10px] font-bold flex-shrink-0">
                    2
                  </div>
                  <span className="text-foreground">{t("installBanner.iosStep2")}</span>
                  <Plus className="w-4 h-4 text-primary flex-shrink-0" />
                </div>
                <div className="flex items-center gap-2 text-xs">
                  <div className="w-5 h-5 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-[10px] font-bold flex-shrink-0">
                    3
                  </div>
                  <span className="text-foreground">{t("installBanner.iosStep3")}</span>
                </div>
              </div>
              <Button 
                size="sm" 
                variant="outline" 
                onClick={() => setShowIosInstructions(false)}
                className="mt-3 text-xs h-8"
              >
                {t("common.back")}
              </Button>
            </div>
          )}
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

export default InstallPromptBanner;
