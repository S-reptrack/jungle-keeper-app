import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Mail, MessageCircle, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import Navigation from "@/components/Navigation";
import sreptrackLogo from "@/assets/sreptrack-logo.png";

const Support = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <div className="max-w-2xl mx-auto px-4 py-8 space-y-8">
        <div className="space-y-2">
          <Button variant="ghost" size="sm" onClick={() => navigate(-1)}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            {t("common.back") || "Retour"}
          </Button>
          <div className="flex items-center gap-3">
            <img src={sreptrackLogo} alt="S-reptrack" className="w-10 h-10 rounded-lg" />
            <div>
              <h1 className="text-2xl font-bold text-foreground">
                {t("support.title") || "Support & Contact"}
              </h1>
              <p className="text-muted-foreground">
                {t("support.subtitle") || "Nous sommes là pour vous aider"}
              </p>
            </div>
          </div>
        </div>

        <Card>
          <CardContent className="pt-6 space-y-6">
            <div className="flex items-start gap-4">
              <Mail className="w-6 h-6 text-primary mt-1 shrink-0" />
              <div className="space-y-2">
                <h2 className="font-semibold text-lg text-foreground">
                  {t("support.emailTitle") || "Contactez-nous par email"}
                </h2>
                <p className="text-muted-foreground text-sm">
                  {t("support.emailDescription") || "Pour toute question, problème technique ou suggestion d'amélioration :"}
                </p>
                <a
                  href="mailto:contact@s-reptrack.app"
                  className="inline-block text-primary font-semibold text-lg hover:underline"
                >
                  contact@s-reptrack.app
                </a>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <Clock className="w-6 h-6 text-primary mt-1 shrink-0" />
              <div className="space-y-1">
                <h2 className="font-semibold text-foreground">
                  {t("support.responseTime") || "Délai de réponse"}
                </h2>
                <p className="text-muted-foreground text-sm">
                  {t("support.responseTimeDescription") || "Nous répondons généralement sous 24 à 48 heures ouvrées."}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <MessageCircle className="w-6 h-6 text-primary mt-1 shrink-0" />
              <div className="space-y-1">
                <h2 className="font-semibold text-foreground">
                  {t("support.faqTitle") || "Questions fréquentes"}
                </h2>
                <ul className="text-muted-foreground text-sm space-y-2">
                  <li>
                    <strong>{t("support.faq1q") || "Comment gérer mon abonnement ?"}</strong>
                    <br />
                    {t("support.faq1a") || "Allez dans Réglages > Abonnement pour gérer ou annuler votre abonnement."}
                  </li>
                  <li>
                    <strong>{t("support.faq2q") || "Comment fonctionne le NFC ?"}</strong>
                    <br />
                    {t("support.faq2a") || "Approchez votre téléphone d'un tag NFC pour identifier rapidement un reptile. Compatible Android uniquement."}
                  </li>
                  <li>
                    <strong>{t("support.faq3q") || "Mes données sont-elles sécurisées ?"}</strong>
                    <br />
                    {t("support.faq3a") || "Oui, toutes vos données sont chiffrées et stockées de manière sécurisée. Consultez notre politique de confidentialité pour plus de détails."}
                  </li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="text-center space-y-3 text-sm text-muted-foreground">
          <div className="flex justify-center gap-3">
            <button onClick={() => navigate("/terms")} className="underline hover:text-foreground">
              {t("subscription.termsLink") || "Conditions d'utilisation (EULA)"}
            </button>
            <span>•</span>
            <button onClick={() => navigate("/privacy")} className="underline hover:text-foreground">
              {t("subscription.privacyLink") || "Politique de confidentialité"}
            </button>
          </div>
          <p>© 2025 S-reptrack — {t("support.allRightsReserved") || "Tous droits réservés"}</p>
        </div>
      </div>
    </div>
  );
};

export default Support;
