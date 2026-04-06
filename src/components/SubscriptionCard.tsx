import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { supabase } from "@/integrations/supabase/client";
import { CreditCard, Check, Crown, Loader2, ExternalLink, User, RotateCcw } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { useSubscription, SUBSCRIPTION_TIERS } from "@/hooks/useSubscription";
import { useReptileCount } from "@/hooks/useReptileCount";
import { useSearchParams, useNavigate } from "react-router-dom";
import { getPaymentProvider, isNativeIOS } from "@/lib/platformUtils";
import { Browser } from "@capacitor/browser";

const SubscriptionCard = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const {
    subscribed,
    subscriptionEnd,
    loading,
    createCheckout,
    openCustomerPortal,
    restorePurchases,
    getCurrentTier,
    checkSubscription,
  } = useSubscription();

  const { count, FREE_TIER_LIMIT } = useReptileCount();
  const isApple = getPaymentProvider() === "apple";

  const [checkoutLoading, setCheckoutLoading] = useState<string | null>(null);
  const [portalLoading, setPortalLoading] = useState(false);
  const [restoreLoading, setRestoreLoading] = useState(false);

  const currentTier = getCurrentTier();

  // Helper pour ouvrir les liens légaux - Capacitor Browser sur iOS natif
  const openLegalLink = async (path: string) => {
    if (isNativeIOS()) {
      try {
        await Browser.open({ url: `https://s-reptrack.app${path}` });
      } catch {
        window.open(`https://s-reptrack.app${path}`, "_blank", "noopener,noreferrer");
      }
    } else {
      navigate(path);
    }
  };

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
      const errorMessage = error instanceof Error ? error.message : "";
      console.error("[Subscribe] Error:", errorMessage);
      if (isApple && errorMessage.includes("not available")) {
        toast.error(t("subscription.iapNotAvailable") || "Les achats intégrés ne sont pas disponibles. Veuillez redémarrer l'app.");
      } else if (isApple && errorMessage.includes("not found")) {
        toast.error(t("subscription.productNotFound") || "Produit non trouvé. Veuillez réessayer plus tard.");
      } else {
        toast.error(t("subscription.checkoutError") || "Erreur lors de la création du paiement");
      }
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
            : t("subscription.inactiveDescription") || "Gérez jusqu'à 5 reptiles gratuitement. Passez à Premium pour un nombre illimité."}
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
            {/* Liens EULA & Privacy - conformité Apple 3.1.2(c) */}
            <div className="flex items-center justify-center gap-3 text-sm pb-2">
              <button
                type="button"
                onClick={() => openLegalLink("/terms")}
                className="underline text-primary hover:text-primary/80 py-2 px-2 min-h-[44px] inline-flex items-center cursor-pointer bg-transparent border-0"
                style={{ touchAction: "manipulation" }}
              >
                {t("subscription.termsLink") || "Conditions d'utilisation (EULA)"}
              </button>
              <span className="text-muted-foreground">•</span>
              <button
                type="button"
                onClick={() => openLegalLink("/privacy")}
                className="underline text-primary hover:text-primary/80 py-2 px-2 min-h-[44px] inline-flex items-center cursor-pointer bg-transparent border-0"
                style={{ touchAction: "manipulation" }}
              >
                {t("subscription.privacyLink") || "Politique de confidentialité"}
              </button>
            </div>
            <div className="grid gap-4 md:grid-cols-3">
              {/* Free Plan */}
              <div className="relative p-4 border-2 border-primary rounded-lg bg-primary/5">
                <Badge className="absolute -top-2 right-4 bg-primary">
                  {t("subscription.currentPlanBadge") || "Votre plan"}
                </Badge>
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <User className="w-5 h-5 text-primary" />
                    <h3 className="font-semibold text-lg">
                      {t("subscription.freeTitle") || "Gratuit"}
                    </h3>
                  </div>
                  <p className="text-2xl font-bold text-primary">
                    0€
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {count}/{FREE_TIER_LIMIT} reptiles
                  </p>

                  <ul className="space-y-2 text-sm">
                    <li className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-primary" />
                      {t("subscription.freeFeature1") || "Jusqu'à 5 reptiles"}
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-primary" />
                      {t("subscription.freeFeature2") || "Suivi reproduction"}
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-primary" />
                      {t("subscription.freeFeature3") || "Scanner NFC"}
                    </li>
                  </ul>
                </div>
              </div>

              {/* Monthly Plan */}
              <div className="relative p-4 border rounded-lg hover:border-primary transition-colors">
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Crown className="w-5 h-5 text-muted-foreground" />
                    <h3 className="font-semibold text-lg">
                      {t("subscription.monthlyTitle") || "Mensuel"}
                    </h3>
                  </div>
                  <p className="text-2xl font-bold text-primary">
                    {SUBSCRIPTION_TIERS.monthly.price}€
                    <span className="text-sm font-normal text-muted-foreground">/mois</span>
                  </p>

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
              <div className="relative p-4 border rounded-lg hover:border-primary transition-colors">
                <Badge className="absolute -top-2 right-4 bg-amber-500">
                  {t("subscription.bestValue") || "Meilleur prix"}
                </Badge>
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Crown className="w-5 h-5 text-amber-500" />
                    <h3 className="font-semibold text-lg">
                      {t("subscription.yearlyTitle") || "Annuel"}
                    </h3>
                  </div>
                  <p className="text-2xl font-bold text-primary">
                    {SUBSCRIPTION_TIERS.yearly.price}€
                    <span className="text-sm font-normal text-muted-foreground">/an</span>
                  </p>
                  <p className="text-xs text-amber-600 font-medium">
                    {t("subscription.yearlySavings") || "Économisez 2 mois !"}
                  </p>

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

            {/* Bouton Restaurer les achats (requis par Apple) */}
            {isApple && (
              <Button
                variant="ghost"
                className="w-full text-sm"
                onClick={async () => {
                  setRestoreLoading(true);
                  try {
                    const restored = await restorePurchases();
                    if (restored) {
                      toast.success(t("subscription.restoreSuccess") || "Achats restaurés avec succès");
                    } else {
                      toast.info(t("subscription.restoreNone") || "Aucun achat à restaurer");
                    }
                  } catch {
                    toast.error(t("subscription.restoreError") || "Erreur lors de la restauration");
                  } finally {
                    setRestoreLoading(false);
                  }
                }}
                disabled={restoreLoading}
              >
                {restoreLoading ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <RotateCcw className="w-4 h-4 mr-2" />
                )}
                {t("subscription.restorePurchases") || "Restaurer mes achats"}
              </Button>
            )}

            <div className="text-xs text-center text-muted-foreground space-y-2 mt-4">
              <Separator />
              <p className="font-semibold text-foreground pt-2 text-sm">
                {t("subscription.subscriptionDetails") || "Détails de l'abonnement"}
              </p>
              <div className="space-y-1.5 text-left px-2">
                <p>
                  <strong>S-reptrack Premium — {t("subscription.monthlyTitle") || "Mensuel"}</strong> : {SUBSCRIPTION_TIERS.monthly.price}€/{t("subscription.perMonth") || "mois"}
                </p>
                <p>
                  <strong>S-reptrack Premium — {t("subscription.yearlyTitle") || "Annuel"}</strong> : {SUBSCRIPTION_TIERS.yearly.price}€/{t("subscription.perYear") || "an"}
                </p>
              </div>
              <div className="text-left px-2 space-y-1.5 pt-1">
                <p>• {t("subscription.autoRenewDisclosure") || "L'abonnement se renouvelle automatiquement à la fin de chaque période sauf annulation au moins 24h avant la fin de la période en cours."}</p>
                {isApple && (
                  <>
                    <p>• {t("subscription.appleChargeNote") || "Le paiement sera débité sur votre compte iTunes lors de la confirmation de l'achat."}</p>
                    <p>• {t("subscription.appleRenewNote") || "Le compte sera débité pour le renouvellement dans les 24 heures précédant la fin de la période en cours, au même tarif."}</p>
                    <p>• {t("subscription.appleCancelNote") || "Vous pouvez gérer et annuler vos abonnements dans les Réglages de votre compte App Store après l'achat."}</p>
                    <p>• {t("subscription.appleTrialNote") || "Toute portion inutilisée d'une période d'essai gratuite, le cas échéant, sera perdue lors de l'achat d'un abonnement."}</p>
                  </>
                )}
                {!isApple && (
                  <p>• {t("subscription.securePayment") || "Paiement sécurisé via Stripe. Annulez à tout moment."}</p>
                )}
              </div>
              {!isApple && (
                <p className="text-left px-2">
                  ⚠️ {t("subscription.nfcNote") || "NFC non compatible avec iOS/Apple. Utilisez les QR codes sur iPhone."}
                </p>
              )}
              <Separator className="my-2" />
              <div className="flex justify-center gap-4 pt-2">
                <button
                  type="button"
                  onClick={() => openLegalLink("/terms")}
                  className="text-sm underline text-primary hover:text-primary/80 py-3 px-3 min-h-[44px] min-w-[44px] inline-flex items-center justify-center cursor-pointer bg-transparent border-0"
                  style={{ touchAction: "manipulation", WebkitTapHighlightColor: "transparent", WebkitUserSelect: "none" }}
                >
                  {t("subscription.termsLink") || "Conditions d'utilisation (EULA)"}
                </button>
                <span className="text-muted-foreground self-center">•</span>
                <button
                  type="button"
                  onClick={() => openLegalLink("/privacy")}
                  className="text-sm underline text-primary hover:text-primary/80 py-3 px-3 min-h-[44px] min-w-[44px] inline-flex items-center justify-center cursor-pointer bg-transparent border-0"
                  style={{ touchAction: "manipulation", WebkitTapHighlightColor: "transparent", WebkitUserSelect: "none" }}
                >
                  {t("subscription.privacyLink") || "Politique de confidentialité"}
                </button>
              </div>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default SubscriptionCard;
