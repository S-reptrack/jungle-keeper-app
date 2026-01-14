import { useTranslation } from "react-i18next";
import { LogOut, LogIn } from "lucide-react";
import { useNavigate } from "react-router-dom";
import sreptrackLogo from "@/assets/sreptrack-logo.png";
import LanguageSelector from "@/components/LanguageSelector";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";

const Maintenance = () => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    toast.success(t("settings.signOutSuccess", "Déconnexion réussie"));
    window.location.reload();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 flex flex-col items-center justify-center p-6">
      {/* Language Selector & Logout */}
      <div className="absolute top-4 right-4 pt-[env(safe-area-inset-top)] flex items-center gap-2">
        <LanguageSelector />
        {user && (
          <Button
            variant="outline"
            size="sm"
            onClick={handleLogout}
            className="gap-2"
          >
          <LogOut className="h-4 w-4" />
            {t("settings.signOut", "Déconnexion")}
          </Button>
        )}
        {!user && (
          <Button
            variant="default"
            size="sm"
            onClick={() => navigate("/auth")}
            className="gap-2"
          >
            <LogIn className="h-4 w-4" />
            {t("auth.login", "Connexion")}
          </Button>
        )}
      </div>

      {/* Current user info */}
      {user && (
        <div className="absolute top-16 right-4 text-xs text-muted-foreground">
          {t("maintenance.loggedAs", "Connecté en tant que")}: {user.email}
        </div>
      )}

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
