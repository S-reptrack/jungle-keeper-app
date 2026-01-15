import { useTranslation } from "react-i18next";
import { useSubscription, SUBSCRIPTION_TIERS } from "@/hooks/useSubscription";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Clock, AlertTriangle, Crown, Loader2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

const TesterTrialBanner = () => {
  const { t } = useTranslation();
  const { 
    isTesterPremium, 
    testerTrialEnd, 
    testerTrialExpired, 
    createCheckout,
    loading 
  } = useSubscription();
  const [checkoutLoading, setCheckoutLoading] = useState<string | null>(null);

  // Ne rien afficher si pas testeur ou pas de date limite
  if (!isTesterPremium && !testerTrialExpired) return null;

  const handleSubscribe = async (tier: "monthly" | "yearly") => {
    setCheckoutLoading(tier);
    try {
      await createCheckout(SUBSCRIPTION_TIERS[tier].priceId);
    } catch (error) {
      toast.error("Erreur lors de la création du paiement");
    } finally {
      setCheckoutLoading(null);
    }
  };

  // Calculer les jours restants
  const getDaysRemaining = () => {
    if (!testerTrialEnd) return null;
    const endDate = new Date(testerTrialEnd);
    const today = new Date();
    const diffTime = endDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const daysRemaining = getDaysRemaining();

  // Affichage pour trial expiré
  if (testerTrialExpired) {
    return (
      <Card className="border-destructive bg-destructive/10 mb-6">
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-destructive" />
            <CardTitle className="text-lg text-destructive">
              Période de test terminée
            </CardTitle>
          </div>
          <CardDescription>
            Votre accès testeur a expiré. Souscrivez à un abonnement pour conserver vos données et continuer à utiliser toutes les fonctionnalités.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-3 sm:grid-cols-2">
            <Button 
              onClick={() => handleSubscribe("monthly")}
              disabled={checkoutLoading !== null}
              variant="outline"
              className="w-full"
            >
              {checkoutLoading === "monthly" ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <Crown className="h-4 w-4 mr-2" />
              )}
              Mensuel - {SUBSCRIPTION_TIERS.monthly.price}€/mois
            </Button>
            <Button 
              onClick={() => handleSubscribe("yearly")}
              disabled={checkoutLoading !== null}
              className="w-full"
            >
              {checkoutLoading === "yearly" ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <Crown className="h-4 w-4 mr-2" />
              )}
              Annuel - {SUBSCRIPTION_TIERS.yearly.price}€/an
              <Badge variant="secondary" className="ml-2 text-xs">-33%</Badge>
            </Button>
          </div>
          <p className="text-xs text-muted-foreground text-center">
            Vos données sont conservées. Paiement sécurisé via Stripe.
          </p>
        </CardContent>
      </Card>
    );
  }

  // Affichage pour trial actif avec compte à rebours
  if (isTesterPremium && testerTrialEnd) {
    const isUrgent = daysRemaining !== null && daysRemaining <= 7;
    
    return (
      <Card className={`mb-6 ${isUrgent ? 'border-yellow-500 bg-yellow-500/10' : 'border-primary/30 bg-primary/5'}`}>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Clock className={`h-5 w-5 ${isUrgent ? 'text-yellow-500' : 'text-primary'}`} />
              <CardTitle className="text-lg">
                Accès Testeur Premium
              </CardTitle>
            </div>
            <Badge variant={isUrgent ? "destructive" : "secondary"}>
              {daysRemaining !== null && daysRemaining > 0 
                ? `${daysRemaining} jour${daysRemaining > 1 ? 's' : ''} restant${daysRemaining > 1 ? 's' : ''}`
                : "Expire aujourd'hui"}
            </Badge>
          </div>
          <CardDescription>
            Profitez de toutes les fonctionnalités Premium jusqu'au {new Date(testerTrialEnd).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" })}.
          </CardDescription>
        </CardHeader>
        {isUrgent && (
          <CardContent className="pt-0">
            <p className="text-sm text-muted-foreground mb-3">
              Souscrivez maintenant pour garder vos données après la fin du test :
            </p>
            <div className="grid gap-2 sm:grid-cols-2">
              <Button 
                onClick={() => handleSubscribe("monthly")}
                disabled={checkoutLoading !== null}
                variant="outline"
                size="sm"
              >
                {checkoutLoading === "monthly" && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
                {SUBSCRIPTION_TIERS.monthly.price}€/mois
              </Button>
              <Button 
                onClick={() => handleSubscribe("yearly")}
                disabled={checkoutLoading !== null}
                size="sm"
              >
                {checkoutLoading === "yearly" && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
                {SUBSCRIPTION_TIERS.yearly.price}€/an
                <Badge variant="secondary" className="ml-2 text-xs">-33%</Badge>
              </Button>
            </div>
          </CardContent>
        )}
      </Card>
    );
  }

  return null;
};

export default TesterTrialBanner;