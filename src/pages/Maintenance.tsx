import { useTranslation } from "react-i18next";
import sreptrackLogo from "@/assets/sreptrack-logo.png";
import LanguageSelector from "@/components/LanguageSelector";

const Maintenance = () => {
  const { t } = useTranslation();

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 flex flex-col items-center justify-center p-6">
      {/* Language Selector */}
      <div className="absolute top-4 right-4">
        <LanguageSelector />
      </div>

      {/* Logo */}
      <div className="mb-8">
        <img 
          src={sreptrackLogo} 
          alt="S-reptrack" 
          className="w-32 h-32 rounded-2xl shadow-2xl shadow-primary/20"
        />
      </div>

      {/* Title */}
      <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4 text-center">
        S-reptrack
      </h1>

      {/* Maintenance Message */}
      <div className="text-center max-w-md">
        <p className="text-2xl md:text-3xl text-primary font-semibold mb-4">
          {t("maintenance.title", "Maintenance en cours")}
        </p>
        <p className="text-muted-foreground text-lg">
          {t("maintenance.description", "Notre application est en cours de maintenance. Nous serons de retour très bientôt !")}
        </p>
      </div>

      {/* Decorative elements - gear animation */}
      <div className="mt-12 flex items-center gap-4">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
        <span className="text-muted-foreground text-sm">
          {t("maintenance.working", "Travaux en cours...")}
        </span>
      </div>

      {/* Footer */}
      <p className="absolute bottom-6 text-muted-foreground text-sm">
        © 2025 S-reptrack
      </p>
    </div>
  );
};

export default Maintenance;
