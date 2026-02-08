import { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { 
  QrCode, 
  Nfc, 
  Calendar, 
  Heart, 
  TrendingUp, 
  Shield, 
  ChevronRight,
  Check,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import ThemeToggle from "@/components/ThemeToggle";
import LanguageSelector from "@/components/LanguageSelector";
import sreptrackLogo from "@/assets/sreptrack-logo.png";
import { useAuth } from "@/hooks/useAuth";
import { useUserRole } from "@/hooks/useUserRole";

const Landing = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const { isAdmin, loading: roleLoading } = useUserRole();

  useEffect(() => {
    if (!authLoading && !roleLoading && user && isAdmin) {
      navigate("/admin", { replace: true });
    }
  }, [user, isAdmin, authLoading, roleLoading, navigate]);

  const features = [
    { icon: QrCode, title: t("landing.featureQrTitle"), description: t("landing.featureQrDescription") },
    { icon: Nfc, title: t("landing.featureNfcTitle"), description: t("landing.featureNfcDescription") },
    { icon: Calendar, title: t("landing.featureFeedingTitle"), description: t("landing.featureFeedingDescription") },
    { icon: Heart, title: t("landing.featureHealthTitle"), description: t("landing.featureHealthDescription") },
    { icon: TrendingUp, title: t("landing.featureReproTitle"), description: t("landing.featureReproDescription") },
    { icon: Shield, title: t("landing.featureCitesTitle"), description: t("landing.featureCitesDescription") },
  ];

  const extras = [
    t("landing.featureWeight"),
    t("landing.featureMorphs"),
    t("landing.featureExport"),
    t("landing.featureDarkMode"),
    t("landing.featureLanguages"),
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-lg border-b border-border pt-[env(safe-area-inset-top)]">
        <div className="max-w-5xl mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <img src={sreptrackLogo} alt="S-reptrack" className="w-7 h-7 rounded-lg" />
            <span className="font-bold text-lg text-foreground">S-reptrack</span>
          </div>
          <div className="flex items-center gap-2">
            <LanguageSelector />
            <ThemeToggle />
            <Button onClick={() => navigate("/auth")} size="sm">
              {t("landing.login")}
            </Button>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="pt-28 pb-16 px-4 text-center" style={{ paddingTop: 'calc(7rem + env(safe-area-inset-top))' }}>
        <div className="max-w-2xl mx-auto space-y-6">
          <div className="w-16 h-16 mx-auto bg-primary/10 rounded-2xl flex items-center justify-center">
            <img src={sreptrackLogo} alt="S-reptrack" className="w-10 h-10 rounded-xl" />
          </div>
          <h1 className="text-3xl md:text-5xl font-bold text-foreground leading-tight">
            {t("landing.heroTitle")}{" "}
            <span className="text-primary">{t("landing.heroTitleHighlight")}</span>{" "}
            {t("landing.heroTitleEnd")}
          </h1>
          <p className="text-lg text-muted-foreground max-w-lg mx-auto">
            {t("landing.heroDescription")}
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button size="lg" onClick={() => navigate("/auth")} className="text-base px-8">
              {t("landing.startFree")}
              <ChevronRight className="w-5 h-5 ml-1" />
            </Button>
            <Button size="lg" variant="outline" onClick={() => document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' })}>
              {t("landing.discoverFeatures")}
            </Button>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-16 px-4 bg-muted/30">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-2xl md:text-3xl font-bold text-foreground text-center mb-10">
            {t("landing.featuresTitle")}
          </h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {features.map((feature, i) => (
              <Card key={i} className="border-0 shadow-md bg-card">
                <CardContent className="p-5">
                  <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center mb-3">
                    <feature.icon className="w-5 h-5 text-primary" />
                  </div>
                  <h3 className="font-semibold text-foreground mb-1">{feature.title}</h3>
                  <p className="text-sm text-muted-foreground">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Extras + Pricing */}
      <section className="py-16 px-4">
        <div className="max-w-4xl mx-auto grid md:grid-cols-2 gap-10 items-center">
          <div className="space-y-4">
            <h2 className="text-2xl md:text-3xl font-bold text-foreground">
              {t("landing.forBreedersTitle")}
            </h2>
            <ul className="space-y-3">
              {extras.map((item, i) => (
                <li key={i} className="flex items-center gap-2 text-foreground">
                  <Check className="w-4 h-4 text-primary flex-shrink-0" />
                  <span className="text-sm">{item}</span>
                </li>
              ))}
            </ul>
          </div>
          <div className="bg-gradient-to-br from-primary/15 to-primary/5 rounded-2xl p-8 text-center space-y-4">
            <p className="text-sm text-muted-foreground">{t("landing.premiumSubscription")}</p>
            <div className="flex items-baseline justify-center gap-1">
              <span className="text-4xl font-bold text-foreground">4,99€</span>
              <span className="text-muted-foreground">{t("landing.perMonth")}</span>
            </div>
            <p className="text-sm text-muted-foreground">{t("landing.yearlyOffer")}</p>
            <Button size="lg" className="w-full" onClick={() => navigate("/auth")}>
              {t("landing.tryFree")}
            </Button>
            <p className="text-xs text-muted-foreground">{t("landing.securePayment")}</p>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 px-4 bg-muted/30">
        <div className="max-w-2xl mx-auto text-center space-y-4">
          <h2 className="text-2xl md:text-3xl font-bold text-foreground">
            {t("landing.ctaTitle")}
          </h2>
          <p className="text-muted-foreground">
            {t("landing.ctaDescription")}
          </p>
          <Button size="lg" onClick={() => navigate("/auth")} className="text-base px-10">
            {t("landing.ctaButton")}
            <ChevronRight className="w-5 h-5 ml-1" />
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-6 px-4">
        <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <img src={sreptrackLogo} alt="S-reptrack" className="w-5 h-5 rounded" />
            <span className="font-semibold text-sm text-foreground">S-reptrack</span>
          </div>
          <div className="flex items-center gap-4 text-xs text-muted-foreground">
            <button onClick={() => navigate("/privacy")} className="hover:text-foreground transition-colors">
              {t("landing.privacyPolicy")}
            </button>
            <button onClick={() => navigate("/terms")} className="hover:text-foreground transition-colors">
              {t("landing.termsOfService")}
            </button>
            <button onClick={() => navigate("/legal")} className="hover:text-foreground transition-colors">
              {t("landing.legalNotice")}
            </button>
            <span>© 2025 S-reptrack</span>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
