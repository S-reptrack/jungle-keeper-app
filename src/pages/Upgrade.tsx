import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Browser } from "@capacitor/browser";
import {
  BarChart3,
  BookOpen,
  Check,
  Crown,
  Dna,
  ExternalLink,
  HeartPulse,
  Images,
  Loader2,
  RotateCcw,
} from "lucide-react";
import { toast } from "sonner";
import Navigation from "@/components/Navigation";
import { SEO } from "@/components/SEO";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useAuth } from "@/hooks/useAuth";
import { useReptileCount } from "@/hooks/useReptileCount";
import { useSubscription } from "@/hooks/useSubscription";
import { SUBSCRIPTION_TIERS, formatPrice } from "@/lib/pricing";
import { getPaymentProvider, isNativeIOS } from "@/lib/platformUtils";

const HIT_AREA = { minHeight: "44px", touchAction: "manipulation" as const };

const Upgrade = () => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { user } = useAuth();
  const {
    subscribed,
    subscriptionEnd,
    loading,
    welcomeTrialEnd,
    createCheckout,
    openCustomerPortal,
    restorePurchases,
    getCurrentTier,
  } = useSubscription();
  const { count, FREE_TIER_LIMIT } = useReptileCount();

  const isApple = getPaymentProvider() === "apple";
  const [checkoutLoading, setCheckoutLoading] = useState<string | null>(null);
  const [portalLoading, setPortalLoading] = useState(false);
  const [restoreLoading, setRestoreLoading] = useState(false);
  const currentTier = getCurrentTier();

  // Les liens légaux s'ouvrent dans le navigateur système sur iOS natif (refus Apple sinon).
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

  useEffect(() => {
    const status = searchParams.get("subscription");
    if (status === "success") {
      toast.success(t("subscription.successMessage"));
      setSearchParams({});
    } else if (status === "cancelled") {
      toast.info(t("subscription.cancelledMessage"));
      setSearchParams({});
    }
  }, [searchParams, setSearchParams, t]);

  const handleSubscribe = async (tier: "monthly" | "yearly") => {
    setCheckoutLoading(tier);
    try {
      await createCheckout(SUBSCRIPTION_TIERS[tier].priceId);
    } catch (error) {
      const message = error instanceof Error ? error.message : "";
      console.error("[Upgrade] Checkout error:", message);
      if (isApple && message.includes("not available")) {
        toast.error(t("subscription.iapNotAvailable") || message);
      } else if (isApple && message.includes("not found")) {
        toast.error(t("subscription.productNotFound") || message);
      } else {
        toast.error(`${t("subscription.checkoutError")}${message ? `: ${message}` : ""}`);
      }
    } finally {
      setCheckoutLoading(null);
    }
  };

  const handleManage = async () => {
    try {
      setPortalLoading(true);
      await openCustomerPortal();
    } catch {
      toast.error(t("subscription.portalError"));
    } finally {
      setPortalLoading(false);
    }
  };

  const formatDate = (value: string) =>
    new Date(value).toLocaleDateString(i18n.language, {
      day: "numeric",
      month: "long",
      year: "numeric",
    });

  const features = [
    { icon: Crown, label: t("subscription.feature1") },
    { icon: BookOpen, label: t("upgrade.featureRegister") },
    { icon: Dna, label: t("upgrade.featureGenetics") },
    { icon: HeartPulse, label: t("upgrade.featureHealth") },
    { icon: Images, label: t("upgrade.featurePdf") },
    { icon: BarChart3, label: t("upgrade.featureAnalytics") },
  ];

  const legalLinks = (
    <div className="flex flex-wrap items-center justify-center gap-1 pt-2">
      <button
        type="button"
        onClick={() => openLegalLink("/terms")}
        className="inline-flex items-center justify-center rounded-md px-3 py-3 text-sm font-medium text-primary underline underline-offset-4 hover:text-primary/80 cursor-pointer bg-transparent border-0"
        style={{ ...HIT_AREA, minWidth: "44px" }}
      >
        {t("subscription.termsLink")}
      </button>
      <span className="text-muted-foreground">•</span>
      <button
        type="button"
        onClick={() => openLegalLink("/privacy")}
        className="inline-flex items-center justify-center rounded-md px-3 py-3 text-sm font-medium text-primary underline underline-offset-4 hover:text-primary/80 cursor-pointer bg-transparent border-0"
        style={{ ...HIT_AREA, minWidth: "44px" }}
      >
        {t("subscription.privacyLink")}
      </button>
    </div>
  );

  return (
    <div className="min-h-screen bg-background pb-28 md:pb-12">
      <SEO
        title={t("upgrade.title")}
        description={t("upgrade.subtitle")}
        canonical="/upgrade"
      />
      <Navigation />

      <div className="max-w-3xl mx-auto px-4 pt-20 md:pt-24">
        <button
          type="button"
          onClick={() => navigate(user ? "/dashboard" : "/")}
          className="mb-4 inline-flex items-center gap-2 rounded-md px-2 py-2 text-sm text-muted-foreground hover:text-foreground cursor-pointer bg-transparent border-0"
          style={HIT_AREA}
        >
          ← {t("upgrade.backToApp")}
        </button>

        <header className="rounded-2xl bg-gradient-jungle text-primary-foreground shadow-elevated p-6 md:p-8">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary-foreground/15">
              <Crown className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold leading-tight">{t("upgrade.title")}</h1>
              <p className="text-sm md:text-base opacity-90 mt-1">{t("upgrade.subtitle")}</p>
            </div>
          </div>
        </header>

        {loading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : !user ? (
          <Card className="mt-6">
            <CardContent className="space-y-4 py-8 text-center">
              <h2 className="text-lg font-semibold text-foreground">{t("upgrade.signInTitle")}</h2>
              <p className="text-sm text-muted-foreground">{t("upgrade.signInText")}</p>
              <Button style={HIT_AREA} onClick={() => navigate("/auth")}>
                {t("upgrade.signInButton")}
              </Button>
            </CardContent>
          </Card>
        ) : (
          <>
            <Card className="mt-6">
              <CardContent className="py-6">
                <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                  {t("upgrade.featuresTitle")}
                </h2>
                <ul className="mt-4 grid gap-3 sm:grid-cols-2">
                  {features.map(({ icon: Icon, label }) => (
                    <li key={label} className="flex items-center gap-3 text-sm text-foreground">
                      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10">
                        <Icon className="h-4 w-4 text-primary" />
                      </span>
                      {label}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            {subscribed ? (
              <Card className="mt-6 border-primary/30 bg-primary/5">
                <CardContent className="space-y-4 py-6">
                  <div className="flex items-center gap-3">
                    <Crown className="h-8 w-8 shrink-0 text-primary" />
                    <div>
                      <p className="font-semibold text-foreground">{t("subscription.premiumActive")}</p>
                      <p className="text-sm text-muted-foreground">
                        {currentTier === "yearly"
                          ? t("subscription.yearlyPlan")
                          : currentTier === "monthly"
                            ? t("subscription.monthlyPlan")
                            : t("subscription.activeDescription")}
                      </p>
                      {welcomeTrialEnd && (
                        <p className="text-xs text-muted-foreground mt-1">
                          {t("upgrade.trialEndsOn", { date: formatDate(welcomeTrialEnd) })}
                        </p>
                      )}
                      {!welcomeTrialEnd && subscriptionEnd && (
                        <p className="text-xs text-muted-foreground mt-1">
                          {t("subscription.renewsOn")} {formatDate(subscriptionEnd)}
                        </p>
                      )}
                    </div>
                  </div>
                  <Button variant="outline" className="w-full" style={HIT_AREA} onClick={handleManage} disabled={portalLoading}>
                    {portalLoading ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      <ExternalLink className="mr-2 h-4 w-4" />
                    )}
                    {t("subscription.manageSubscription")}
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <>
                <div className="mt-6 grid gap-4 md:grid-cols-2">
                  <Card className="relative">
                    <CardContent className="space-y-4 py-6">
                      <h3 className="flex items-center gap-2 text-lg font-semibold text-foreground">
                        <Crown className="h-5 w-5 text-muted-foreground" />
                        {t("subscription.monthlyTitle")}
                      </h3>
                      <p className="text-3xl font-bold text-primary">
                        {formatPrice(SUBSCRIPTION_TIERS.monthly.price, i18n.language)} €
                        <span className="text-sm font-normal text-muted-foreground">
                          /{t("subscription.perMonth")}
                        </span>
                      </p>
                      <Button className="w-full" style={HIT_AREA} onClick={() => handleSubscribe("monthly")} disabled={checkoutLoading !== null}>
                        {checkoutLoading === "monthly" && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        {t("subscription.subscribe")}
                      </Button>
                    </CardContent>
                  </Card>

                  <Card className="relative border-accent bg-accent/10 shadow-soft">
                    <Badge className="absolute -top-2 right-4 bg-accent text-accent-foreground">
                      {t("subscription.bestValue")}
                    </Badge>
                    <CardContent className="space-y-4 py-6">
                      <h3 className="flex items-center gap-2 text-lg font-semibold text-foreground">
                        <Crown className="h-5 w-5 text-accent-foreground" />
                        {t("subscription.yearlyTitle")}
                      </h3>
                      <p className="text-3xl font-bold text-primary">
                        {formatPrice(SUBSCRIPTION_TIERS.yearly.price, i18n.language)} €
                        <span className="text-sm font-normal text-muted-foreground">
                          /{t("subscription.perYear")}
                        </span>
                      </p>
                      <p className="text-sm font-medium text-accent-foreground">{t("subscription.yearlySavings")}</p>
                      <Button className="w-full" style={HIT_AREA} onClick={() => handleSubscribe("yearly")} disabled={checkoutLoading !== null}>
                        {checkoutLoading === "yearly" && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        {t("subscription.subscribe")}
                      </Button>
                    </CardContent>
                  </Card>
                </div>

                <Card className="mt-4">
                  <CardContent className="flex flex-wrap items-center justify-between gap-3 py-4">
                    <div className="flex items-center gap-2 text-sm">
                      <Check className="h-4 w-4 text-primary" />
                      <span className="font-medium text-foreground">{t("subscription.freeTitle")}</span>
                      <span className="text-muted-foreground">
                        — {t("subscription.freeFeature1")}
                      </span>
                    </div>
                    <span className="text-sm text-muted-foreground">
                      {count}/{FREE_TIER_LIMIT}
                    </span>
                  </CardContent>
                </Card>

                <div className="mt-6 space-y-2 text-xs text-muted-foreground">
                  <Separator />
                  <p>• {t("subscription.autoRenewDisclosure")}</p>
                  {isApple ? (
                    <>
                      <p>• {t("subscription.appleChargeNote")}</p>
                      <p>• {t("subscription.appleRenewNote")}</p>
                      <p>• {t("subscription.appleCancelNote")}</p>
                      <p>• {t("subscription.appleTrialNote")}</p>
                    </>
                  ) : (
                    <p>• {t("subscription.securePayment")}</p>
                  )}
                  {!isApple && <p>• {t("subscription.nfcNote")}</p>}
                </div>

                {isApple && (
                  <Button
                    variant="ghost"
                    className="mt-4 w-full text-sm"
                    style={HIT_AREA}
                    disabled={restoreLoading}
                    onClick={async () => {
                      setRestoreLoading(true);
                      try {
                        const restored = await restorePurchases();
                        if (restored) {
                          toast.success(t("subscription.restoreSuccess"));
                        } else {
                          toast.info(t("subscription.restoreNone") || "");
                        }
                      } catch {
                        toast.error(t("subscription.restoreError") || "");
                      } finally {
                        setRestoreLoading(false);
                      }
                    }}
                  >
                    {restoreLoading ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      <RotateCcw className="mr-2 h-4 w-4" />
                    )}
                    {t("subscription.restorePurchases")}
                  </Button>
                )}
              </>
            )}

            {legalLinks}
          </>
        )}
      </div>
    </div>
  );
};

export default Upgrade;
