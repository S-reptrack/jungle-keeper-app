import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { CreditCard, Check, Crown, Loader2, ExternalLink } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { useSubscription, SUBSCRIPTION_TIERS } from "@/hooks/useSubscription";
import { useSearchParams } from "react-router-dom";

const SubscriptionCard = () => {
  const { t } = useTranslation();
  const [searchParams, setSearchParams] = useSearchParams();
  const {
    subscribed,
    subscriptionEnd,
    loading,
    createCheckout,
    openCustomerPortal,
    getCurrentTier,
    checkSubscription,
  } = useSubscription();

  const [checkoutLoading, setCheckoutLoading] = useState<string | null>(null);
  const [portalLoading, setPortalLoading] = useState(false);

  const currentTier = getCurrentTier();

  // Handle subscription success/cancel URL params
  useEffect(() => {
    const subscriptionStatus = searchParams.get("subscription");
    if (subscriptionStatus === "success") {
      toast.success(t("subscription.successMessage") || "Abonnement activé avec succès !");
      checkSubscription();
      setSearchParams({});
    } else if (subscriptionStatus === "cancelled") {
      toast.info(t("subscription.cancelledMessage") || "Paiement annulé");
      setSearchParams({});
    }
  }, [searchParams, setSearchParams, checkSubscription, t]);

  const handleSubscribe = async (tier: "monthly" | "yearly") => {
    try {
      setCheckoutLoading(tier);
      await createCheckout(SUBSCRIPTION_TIERS[tier].priceId);
    } catch (error) {
      toast.error(t("subscription.checkoutError") || "Erreur lors de la création du paiement");
    } finally {
      setCheckoutLoading(null);
    }
  };

  const handleManageSubscription = async () => {
    try {
      setPortalLoading(true);
      await openCustomerPortal();
    } catch (error) {
      toast.error(t("subscription.portalError") || "Erreur lors de l'ouverture du portail");
    } finally {
      setPortalLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("fr-FR", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="w-5 h-5" />
            {t("subscription.title") || "Abonnement"}
          </CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-center py-8">
          <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CreditCard className="w-5 h-5" />
          {t("subscription.title") || "Abonnement"}
        </CardTitle>
        <CardDescription>
          {subscribed
            ? t("subscription.activeDescription") || "Gérez votre abonnement S-reptrack Premium"
            : t("subscription.inactiveDescription") || "Passez à Premium pour accéder à toutes les fonctionnalités"}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {subscribed ? (
          <>
            <div className="flex items-center gap-3 p-4 bg-primary/10 rounded-lg border border-primary/20">
              <Crown className="w-8 h-8 text-primary" />
              <div>
                <p className="font-semibold text-foreground">
                  {t("subscription.premiumActive") || "Premium Actif"}
                </p>
                <p className="text-sm text-muted-foreground">
                  {currentTier === "yearly"
                    ? t("subscription.yearlyPlan") || "Abonnement Annuel"
                    : t("subscription.monthlyPlan") || "Abonnement Mensuel"}
                </p>
                {subscriptionEnd && (
                  <p className="text-xs text-muted-foreground mt-1">
                    {t("subscription.renewsOn") || "Renouvellement le"} {formatDate(subscriptionEnd)}
                  </p>
                )}
              </div>
            </div>

            <Button
              variant="outline"
              className="w-full"
              onClick={handleManageSubscription}
              disabled={portalLoading}
            >
              {portalLoading ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <ExternalLink className="w-4 h-4 mr-2" />
              )}
              {t("subscription.manageSubscription") || "Gérer mon abonnement"}
            </Button>
          </>
        ) : (
          <>
            <div className="grid gap-4 md:grid-cols-2">
              {/* Monthly Plan */}
              <div className="relative p-4 border rounded-lg hover:border-primary transition-colors">
                <div className="space-y-3">
                  <div>
                    <h3 className="font-semibold text-lg">
                      {t("subscription.monthlyTitle") || "Mensuel"}
                    </h3>
                    <p className="text-2xl font-bold text-primary">
                      {SUBSCRIPTION_TIERS.monthly.price}€
                      <span className="text-sm font-normal text-muted-foreground">/mois</span>
                    </p>
                  </div>

                  <ul className="space-y-2 text-sm">
                    <li className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-primary" />
                      {t("subscription.feature1") || "Reptiles illimités"}
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-primary" />
                      {t("subscription.feature2") || "Suivi reproduction"}
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-primary" />
                      {t("subscription.feature3") || "Scanner NFC & QR"}
                    </li>
                  </ul>

                  <Button
                    className="w-full"
                    onClick={() => handleSubscribe("monthly")}
                    disabled={checkoutLoading !== null}
                  >
                    {checkoutLoading === "monthly" ? (
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    ) : null}
                    {t("subscription.subscribe") || "S'abonner"}
                  </Button>
                </div>
              </div>

              {/* Yearly Plan */}
              <div className="relative p-4 border-2 border-primary rounded-lg">
                <Badge className="absolute -top-2 right-4 bg-primary">
                  {t("subscription.bestValue") || "Meilleur rapport"}
                </Badge>
                <div className="space-y-3">
                  <div>
                    <h3 className="font-semibold text-lg">
                      {t("subscription.yearlyTitle") || "Annuel"}
                    </h3>
                    <p className="text-2xl font-bold text-primary">
                      {SUBSCRIPTION_TIERS.yearly.price}€
                      <span className="text-sm font-normal text-muted-foreground">/an</span>
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {t("subscription.yearlySavings") || "Économisez 2 mois !"}
                    </p>
                  </div>

                  <ul className="space-y-2 text-sm">
                    <li className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-primary" />
                      {t("subscription.feature1") || "Reptiles illimités"}
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-primary" />
                      {t("subscription.feature2") || "Suivi reproduction"}
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-primary" />
                      {t("subscription.feature3") || "Scanner NFC & QR"}
                    </li>
                  </ul>

                  <Button
                    className="w-full"
                    onClick={() => handleSubscribe("yearly")}
                    disabled={checkoutLoading !== null}
                  >
                    {checkoutLoading === "yearly" ? (
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    ) : null}
                    {t("subscription.subscribe") || "S'abonner"}
                  </Button>
                </div>
              </div>
            </div>

            <Separator />

            <p className="text-xs text-center text-muted-foreground">
              {t("subscription.securePayment") || "Paiement sécurisé par Stripe. Annulez à tout moment."}
            </p>
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default SubscriptionCard;
