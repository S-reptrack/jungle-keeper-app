import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import Navigation from "@/components/Navigation";
import { useTranslation } from "react-i18next";
import { 
  Smartphone, 
  Apple, 
  Chrome, 
  Share2, 
  Plus, 
  Check, 
  AlertTriangle,
  ChevronDown,
  Download
} from "lucide-react";

type DeviceType = "ios" | "android" | "unknown";

const detectDevice = (): DeviceType => {
  const userAgent = navigator.userAgent.toLowerCase();
  
  if (/iphone|ipad|ipod/.test(userAgent)) {
    return "ios";
  }
  if (/android/.test(userAgent)) {
    return "android";
  }
  return "unknown";
};

const Install = () => {
  const { t } = useTranslation();
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [canInstall, setCanInstall] = useState(false);
  const [detectedDevice, setDetectedDevice] = useState<DeviceType>("unknown");
  const [showOtherDevice, setShowOtherDevice] = useState(false);

  useEffect(() => {
    document.title = `${t("install.title")} - ${t("common.appName")}`;
    
    // Detect device on mount
    setDetectedDevice(detectDevice());

    const handler = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setCanInstall(true);
    };

    window.addEventListener("beforeinstallprompt", handler);
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, [t]);

  const handleInstall = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    await deferredPrompt.userChoice;
    setDeferredPrompt(null);
    setCanInstall(false);
  };

  const AndroidInstructions = () => (
    <Card className="border-2 border-primary/20">
      <CardHeader className="pb-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center">
            <Smartphone className="w-6 h-6 text-primary" />
          </div>
          <div>
            <CardTitle className="text-xl">{t("install.android.title")}</CardTitle>
            <p className="text-sm text-muted-foreground">{t("install.android.subtitle")}</p>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <Badge variant="secondary" className="gap-2">
          <Chrome className="w-4 h-4" />
          {t("install.android.requirement")}
        </Badge>

        <div className="space-y-3">
          <div className="flex gap-3 items-start">
            <div className="w-7 h-7 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0">
              1
            </div>
            <p className="text-foreground pt-0.5">{t("install.android.step1")}</p>
          </div>
          <div className="flex gap-3 items-start">
            <div className="w-7 h-7 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0">
              2
            </div>
            <p className="text-foreground pt-0.5">{t("install.android.step2")}</p>
          </div>
          <div className="flex gap-3 items-start">
            <div className="w-7 h-7 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0">
              3
            </div>
            <p className="text-foreground pt-0.5">{t("install.android.step3")}</p>
          </div>
          <div className="flex gap-3 items-start">
            <div className="w-7 h-7 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0">
              4
            </div>
            <p className="text-foreground pt-0.5">{t("install.android.step4")}</p>
          </div>
        </div>

        <div className="flex items-center gap-2 text-primary bg-primary/10 p-3 rounded-lg">
          <Check className="w-5 h-5 flex-shrink-0" />
          <p className="text-sm font-medium">{t("install.android.done")}</p>
        </div>

        <div className="pt-2 space-y-2">
          <Button onClick={handleInstall} disabled={!canInstall} className="w-full" size="lg">
            <Download className="w-5 h-5 mr-2" />
            {canInstall ? t("install.android.installNow") : t("install.android.installNotReady")}
          </Button>
          {!canInstall && (
            <p className="text-xs text-muted-foreground text-center">
              {t("install.android.tip")}
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );

  const IosInstructions = () => (
    <Card className="border-2 border-primary/20">
      <CardHeader className="pb-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center">
            <Apple className="w-6 h-6 text-primary" />
          </div>
          <div>
            <CardTitle className="text-xl">{t("install.ios.title")}</CardTitle>
            <p className="text-sm text-muted-foreground">{t("install.ios.subtitle")}</p>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <Badge variant="secondary" className="gap-2">
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2C6.477 2 2 6.477 2 12c0 5.523 4.477 10 10 10s10-4.477 10-10c0-5.523-4.477-10-10-10zm0 18c-4.418 0-8-3.582-8-8s3.582-8 8-8 8 3.582 8 8-3.582 8-8 8z"/>
            <circle cx="12" cy="12" r="6"/>
          </svg>
          {t("install.ios.requirement")}
        </Badge>

        <Alert variant="destructive" className="border-orange-500/50 bg-orange-500/10">
          <AlertTriangle className="h-4 w-4 text-orange-500" />
          <AlertDescription className="text-orange-600 dark:text-orange-400">
            {t("install.ios.warning")}
          </AlertDescription>
        </Alert>

        <div className="space-y-3">
          <div className="flex gap-3 items-start">
            <div className="w-7 h-7 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0">
              1
            </div>
            <p className="text-foreground pt-0.5">{t("install.ios.step1")}</p>
          </div>
          <div className="flex gap-3 items-start">
            <div className="w-7 h-7 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0">
              2
            </div>
            <div className="flex items-center gap-2 pt-0.5">
              <p className="text-foreground">{t("install.ios.step2")}</p>
              <Share2 className="w-5 h-5 text-primary" />
            </div>
          </div>
          <div className="flex gap-3 items-start">
            <div className="w-7 h-7 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0">
              3
            </div>
            <div className="flex items-center gap-2 pt-0.5">
              <p className="text-foreground">{t("install.ios.step3")}</p>
              <ChevronDown className="w-5 h-5 text-muted-foreground" />
            </div>
          </div>
          <div className="flex gap-3 items-start">
            <div className="w-7 h-7 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0">
              4
            </div>
            <div className="flex items-center gap-2 pt-0.5">
              <p className="text-foreground">{t("install.ios.step4")}</p>
              <Plus className="w-5 h-5 text-primary" />
            </div>
          </div>
          <div className="flex gap-3 items-start">
            <div className="w-7 h-7 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0">
              5
            </div>
            <p className="text-foreground pt-0.5">{t("install.ios.step5")}</p>
          </div>
        </div>

        <div className="flex items-center gap-2 text-primary bg-primary/10 p-3 rounded-lg">
          <Check className="w-5 h-5 flex-shrink-0" />
          <p className="text-sm font-medium">{t("install.ios.done")}</p>
        </div>

        <Alert className="border-blue-500/50 bg-blue-500/10">
          <AlertTriangle className="h-4 w-4 text-blue-500" />
          <AlertDescription className="text-blue-600 dark:text-blue-400 text-sm">
            {t("install.ios.important")}
          </AlertDescription>
        </Alert>
      </CardContent>
    </Card>
  );

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <main className="max-w-2xl mx-auto px-4 py-8 pb-24">
        <header className="mb-8 text-center">
          <h1 className="text-3xl font-bold tracking-tight text-foreground">{t("install.title")}</h1>
          <p className="text-muted-foreground mt-2">
            {t("install.description")}
          </p>
        </header>

        <div className="space-y-6">
          {/* Show detected device instructions first */}
          {detectedDevice === "ios" && <IosInstructions />}
          {detectedDevice === "android" && <AndroidInstructions />}
          
          {/* For unknown devices, show both */}
          {detectedDevice === "unknown" && (
            <>
              <IosInstructions />
              <AndroidInstructions />
            </>
          )}

          {/* Toggle for other device */}
          {detectedDevice !== "unknown" && (
            <div className="text-center">
              <Button 
                variant="ghost" 
                onClick={() => setShowOtherDevice(!showOtherDevice)}
                className="text-muted-foreground"
              >
                {t("install.otherDevice")}
                <ChevronDown className={`w-4 h-4 ml-2 transition-transform ${showOtherDevice ? 'rotate-180' : ''}`} />
              </Button>
              
              {showOtherDevice && (
                <div className="mt-4">
                  {detectedDevice === "ios" ? <AndroidInstructions /> : <IosInstructions />}
                </div>
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default Install;
