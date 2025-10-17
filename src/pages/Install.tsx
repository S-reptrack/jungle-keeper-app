import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import Navigation from "@/components/Navigation";

const Install = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [canInstall, setCanInstall] = useState(false);

  useEffect(() => {
    document.title = "Installer l'application S-reptrack";

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
          <h1 className="text-3xl font-bold tracking-tight">Installer l'application S-reptrack</h1>
          <p className="text-muted-foreground mt-2">
            Ajoutez S-reptrack à l'écran d'accueil pour une expérience plein écran et un accès hors ligne.
          </p>
        </header>

        <section className="space-y-6">
          <article className="p-4 rounded-lg border">
            <h2 className="text-xl font-semibold">Android (Chrome)</h2>
            <p className="mt-2">Utilisez le menu ⋮ puis « Ajouter à l'écran d'accueil ».</p>
            <div className="mt-4">
              <Button onClick={handleInstall} disabled={!canInstall}>
                {canInstall ? "Installer maintenant" : "Bouton activé quand l'installation est possible"}
              </Button>
            </div>
          </article>

          <article className="p-4 rounded-lg border">
            <h2 className="text-xl font-semibold">iPhone (Safari)</h2>
            <p className="mt-2">
              Appuyez sur le bouton « Partager » puis « Sur l'écran d'accueil ». Le bouton ci-dessus n'est pas disponible sur iOS.
            </p>
          </article>
        </section>
      </main>
    </div>
  );
};

export default Install;
