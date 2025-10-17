import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import Navigation from "@/components/Navigation";
import { useTranslation } from "react-i18next";

const Install = () => {
  const { t } = useTranslation();
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [canInstall, setCanInstall] = useState(false);

  useEffect(() => {
    document.title = `${t("install.title")} - ${t("common.appName")}`;

    const handler = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setCanInstall(true);
    };

    // Android / Chrome only
    window.addEventListener("beforeinstallprompt", handler);
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    await deferredPrompt.userChoice;
    setDeferredPrompt(null);
    setCanInstall(false);
  };

  return (
    <div className="min-h-screen">
      <Navigation />
      <main className="max-w-2xl mx-auto px-4 py-8">
        <header className="mb-6">
          <h1 className="text-3xl font-bold tracking-tight">{t("install.title")}</h1>
          <p className="text-muted-foreground mt-2">
            {t("install.description")}
          </p>
        </header>

        <section className="space-y-6">
          <article className="p-4 rounded-lg border">
            <h2 className="text-xl font-semibold">{t("install.android.title")}</h2>
            <p className="mt-2">{t("install.android.instruction")}</p>
            <div className="mt-4">
              <Button onClick={handleInstall} disabled={!canInstall}>
                {canInstall ? t("install.android.installNow") : t("install.android.installNotReady")}
              </Button>
            </div>
          </article>

          <article className="p-4 rounded-lg border">
            <h2 className="text-xl font-semibold">{t("install.ios.title")}</h2>
            <p className="mt-2">
              {t("install.ios.instruction")}
            </p>
          </article>
        </section>
      </main>
    </div>
  );
};

export default Install;
