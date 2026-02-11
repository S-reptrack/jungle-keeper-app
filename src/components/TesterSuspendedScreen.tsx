import { useTranslation } from "react-i18next";
import { Ban, Mail, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/hooks/useAuth";
import { useTesterSuspension } from "@/hooks/useTesterSuspension";

const CONTACT_EMAIL = "contact@s-reptrack.app";

const TesterSuspendedScreen = () => {
  const { t } = useTranslation();
  const { signOut } = useAuth();
  const { suspendedAt, inactivityDays } = useTesterSuspension();

  const suspendedDate = suspendedAt
    ? new Date(suspendedAt).toLocaleDateString("fr-FR")
    : null;

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="max-w-md w-full border-destructive/30">
        <CardHeader className="text-center space-y-3">
          <div className="mx-auto w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center">
            <Ban className="h-8 w-8 text-destructive" />
          </div>
          <CardTitle className="text-xl">
            Compte testeur suspendu
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-center">
          <p className="text-sm text-muted-foreground">
            Votre compte testeur a été suspendu en raison d'une inactivité de plus de{" "}
            <strong>{inactivityDays} jours</strong>.
          </p>

          {suspendedDate && (
            <p className="text-xs text-muted-foreground">
              Suspendu le {suspendedDate}
            </p>
          )}

          <div className="bg-muted/50 rounded-lg p-4 space-y-2">
            <p className="text-sm font-medium">
              Pour réactiver votre accès, contactez l'administrateur :
            </p>
            <Button
              variant="default"
              className="w-full"
              onClick={() => {
                window.location.href = `mailto:${CONTACT_EMAIL}?subject=Réactivation compte testeur S-RepTrack&body=Bonjour, je souhaite réactiver mon compte testeur sur S-RepTrack. Merci.`;
              }}
            >
              <Mail className="h-4 w-4 mr-2" />
              {CONTACT_EMAIL}
            </Button>
          </div>

          <Button
            variant="ghost"
            size="sm"
            className="text-muted-foreground"
            onClick={signOut}
          >
            <LogOut className="h-4 w-4 mr-2" />
            Se déconnecter
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default TesterSuspendedScreen;
