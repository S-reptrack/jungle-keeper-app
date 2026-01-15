import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { LogIn } from "lucide-react";
import sreptrackLogo from "@/assets/sreptrack-logo.png";
import LanguageSelector from "@/components/LanguageSelector";
import { Button } from "@/components/ui/button";

const ComingSoon = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 flex flex-col items-center justify-center p-6">
      {/* Language Selector & Login Button */}
      <div className="absolute top-4 right-4 flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => navigate("/auth")}
          className="flex items-center gap-2"
        >
          <LogIn className="h-4 w-4" />
          {t("auth.login", "Connexion")}
        </Button>
        <LanguageSelector />
      </div>

      {/* Logo */}
      <div className="mb-8 animate-pulse">
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

      {/* Coming Soon Message */}
      <div className="text-center max-w-md">
        <p className="text-2xl md:text-3xl text-primary font-semibold mb-4">
          {t("comingSoon.title", "Bientôt disponible")}
        </p>
        <p className="text-muted-foreground text-lg">
          {t("comingSoon.description", "Notre application de gestion d'élevage de reptiles arrive très bientôt. Restez connectés !")}
        </p>
      </div>

      {/* Decorative elements */}
      <div className="mt-12 flex items-center gap-2">
        <div className="w-3 h-3 rounded-full bg-primary animate-bounce" style={{ animationDelay: "0ms" }} />
        <div className="w-3 h-3 rounded-full bg-primary animate-bounce" style={{ animationDelay: "150ms" }} />
        <div className="w-3 h-3 rounded-full bg-primary animate-bounce" style={{ animationDelay: "300ms" }} />
      </div>

      {/* Footer */}
      <p className="absolute bottom-6 text-muted-foreground text-sm">
        © 2025 S-reptrack
      </p>
    </div>
  );
};

export default ComingSoon;
