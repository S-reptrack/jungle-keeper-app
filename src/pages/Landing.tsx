import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { 
  Smartphone, 
  QrCode, 
  Nfc, 
  Calendar, 
  Heart, 
  TrendingUp, 
  Shield, 
  Globe, 
  Download,
  ChevronRight,
  Check,
  Star,
  Zap
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import ThemeToggle from "@/components/ThemeToggle";
import LanguageSelector from "@/components/LanguageSelector";
import sreptrackLogo from "@/assets/sreptrack-logo.png";
import { QRCodeSVG } from "qrcode.react";

const Landing = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  
  // Production URL for QR code
  const productionUrl = "https://s-reptrack.app";

  const features = [
    {
      icon: QrCode,
      title: t("landing.featureQrTitle"),
      description: t("landing.featureQrDescription"),
    },
    {
      icon: Nfc,
      title: t("landing.featureNfcTitle"),
      description: t("landing.featureNfcDescription"),
    },
    {
      icon: Calendar,
      title: t("landing.featureFeedingTitle"),
      description: t("landing.featureFeedingDescription"),
    },
    {
      icon: Heart,
      title: t("landing.featureHealthTitle"),
      description: t("landing.featureHealthDescription"),
    },
    {
      icon: TrendingUp,
      title: t("landing.featureReproTitle"),
      description: t("landing.featureReproDescription"),
    },
    {
      icon: Shield,
      title: t("landing.featureCitesTitle"),
      description: t("landing.featureCitesDescription"),
    },
  ];

  const installSteps = [
    {
      step: 1,
      title: t("landing.installStep1Title"),
      description: t("landing.installStep1Description"),
      icon: Globe,
    },
    {
      step: 2,
      title: t("landing.installStep2Title"),
      description: t("landing.installStep2Description"),
      icon: Smartphone,
    },
    {
      step: 3,
      title: t("landing.installStep3Title"),
      description: t("landing.installStep3Description"),
      icon: Download,
    },
  ];

  const additionalFeatures = [
    t("landing.featureWeight"),
    t("landing.featureMorphs"),
    t("landing.featureExport"),
    t("landing.featureDarkMode"),
    t("landing.featureLanguages"),
    t("landing.featureTransfer"),
    t("landing.featurePrint"),
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-lg border-b border-border">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <img src={sreptrackLogo} alt="S-reptrack" className="w-8 h-8 rounded-lg" />
            <span className="font-bold text-xl text-foreground">S-reptrack</span>
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

      {/* Hero Section */}
      <section className="pt-24 pb-16 px-4 md:pt-32 md:pb-24">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Text Content */}
            <div className="space-y-6 text-center lg:text-left">
              <Badge variant="secondary" className="text-sm">
                <Star className="w-3 h-3 mr-1" />
                {t("landing.badge")}
              </Badge>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-foreground leading-tight">
                {t("landing.heroTitle")}{" "}
                <span className="text-primary">{t("landing.heroTitleHighlight")}</span>{" "}
                {t("landing.heroTitleEnd")}
              </h1>
              <p className="text-lg md:text-xl text-muted-foreground max-w-xl mx-auto lg:mx-0">
                {t("landing.heroDescription")}
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                <Button size="lg" onClick={() => navigate("/")} className="text-lg px-8">
                  {t("landing.startFree")}
                  <ChevronRight className="w-5 h-5 ml-2" />
                </Button>
                <Button size="lg" variant="outline" onClick={() => document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' })}>
                  {t("landing.discoverFeatures")}
                </Button>
              </div>
            </div>

            {/* Phone Mockup */}
            <div className="relative flex justify-center lg:justify-end">
              <div className="relative">
                {/* Phone Frame */}
                <div className="relative w-[280px] md:w-[320px] h-[580px] md:h-[660px] bg-foreground rounded-[3rem] p-3 shadow-2xl">
                  {/* Screen */}
                  <div className="w-full h-full bg-background rounded-[2.5rem] overflow-hidden relative">
                    {/* Status Bar */}
                    <div className="h-8 bg-primary/10 flex items-center justify-between px-6">
                      <span className="text-xs text-muted-foreground">9:41</span>
                      <div className="flex gap-1">
                        <div className="w-4 h-2 bg-muted-foreground/50 rounded-sm"></div>
                        <div className="w-4 h-2 bg-muted-foreground/50 rounded-sm"></div>
                        <div className="w-6 h-3 bg-primary rounded-sm"></div>
                      </div>
                    </div>
                    
                    {/* App Content Preview */}
                    <div className="p-4 space-y-4">
                      {/* App Header */}
                      <div className="flex items-center gap-2 mb-4">
                        <img src={sreptrackLogo} alt="S-reptrack" className="w-6 h-6 rounded" />
                        <span className="font-bold text-foreground">S-reptrack</span>
                      </div>
                      
                      {/* Stats Cards */}
                      <div className="grid grid-cols-2 gap-2">
                        <div className="bg-primary/10 rounded-lg p-3 text-center">
                          <p className="text-2xl font-bold text-primary">12</p>
                          <p className="text-xs text-muted-foreground">{t("landing.reptiles")}</p>
                        </div>
                        <div className="bg-orange-500/10 rounded-lg p-3 text-center">
                          <p className="text-2xl font-bold text-orange-500">3</p>
                          <p className="text-xs text-muted-foreground">{t("landing.toFeed")}</p>
                        </div>
                      </div>
                      
                      {/* Reptile Cards */}
                      <div className="space-y-2">
                        {["Python Royal", "Boa Constrictor", "Gecko Léopard"].map((name, i) => (
                          <div key={i} className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                            <div className="w-10 h-10 bg-primary/20 rounded-full flex items-center justify-center">
                              🐍
                            </div>
                            <div className="flex-1">
                              <p className="font-medium text-sm text-foreground">{name}</p>
                              <p className="text-xs text-muted-foreground">{t("landing.fedAgo", { days: i + 2 })}</p>
                            </div>
                            <ChevronRight className="w-4 h-4 text-muted-foreground" />
                          </div>
                        ))}
                      </div>
                    </div>
                    
                    {/* Bottom Navigation */}
                    <div className="absolute bottom-0 left-0 right-0 h-16 bg-muted/80 backdrop-blur flex items-center justify-around px-4">
                      {["🏠", "🦎", "📊", "⚙️"].map((icon, i) => (
                        <div key={i} className={`w-10 h-10 rounded-full flex items-center justify-center ${i === 0 ? 'bg-primary/20' : ''}`}>
                          <span className="text-lg">{icon}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
                
                {/* Decorative Elements */}
                <div className="absolute -top-4 -right-4 w-20 h-20 bg-primary/20 rounded-full blur-xl"></div>
                <div className="absolute -bottom-4 -left-4 w-32 h-32 bg-primary/10 rounded-full blur-2xl"></div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-16 px-4 bg-muted/30">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              {t("landing.featuresTitle")}
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              {t("landing.featuresDescription")}
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, index) => (
              <Card key={index} className="border-0 shadow-lg hover:shadow-xl transition-shadow bg-card">
                <CardContent className="p-6">
                  <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mb-4">
                    <feature.icon className="w-6 h-6 text-primary" />
                  </div>
                  <h3 className="text-xl font-semibold text-foreground mb-2">{feature.title}</h3>
                  <p className="text-muted-foreground">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Additional Features */}
      <section className="py-16 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <h2 className="text-3xl md:text-4xl font-bold text-foreground">
                {t("landing.forBreedersTitle")}
              </h2>
              <div className="space-y-4">
                {additionalFeatures.map((item, index) => (
                  <div key={index} className="flex items-center gap-3">
                    <div className="w-6 h-6 bg-primary/20 rounded-full flex items-center justify-center flex-shrink-0">
                      <Check className="w-4 h-4 text-primary" />
                    </div>
                    <span className="text-foreground">{item}</span>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="bg-gradient-to-br from-primary/20 to-primary/5 rounded-3xl p-8 space-y-6">
              <div className="text-center">
                <p className="text-sm text-muted-foreground mb-2">{t("landing.premiumSubscription")}</p>
                <div className="flex items-baseline justify-center gap-1">
                  <span className="text-5xl font-bold text-foreground">4,99€</span>
                  <span className="text-muted-foreground">{t("landing.perMonth")}</span>
                </div>
                <p className="text-sm text-muted-foreground mt-2">{t("landing.yearlyOffer")}</p>
              </div>
              <Button size="lg" className="w-full" onClick={() => navigate("/auth")}>
                {t("landing.tryFree")}
              </Button>
              <p className="text-xs text-center text-muted-foreground">
                {t("landing.securePayment")}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Installation Guide */}
      <section className="py-16 px-4 bg-muted/30">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              {t("landing.installTitle")}
            </h2>
            <p className="text-lg text-muted-foreground">
              {t("landing.installDescription")}
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-6">
            {installSteps.map((step) => (
              <div key={step.step} className="relative">
                <div className="bg-card rounded-2xl p-6 text-center shadow-lg h-full">
                  <div className="w-12 h-12 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-xl font-bold mx-auto mb-4">
                    {step.step}
                  </div>
                  <div className="w-14 h-14 bg-primary/10 rounded-xl flex items-center justify-center mx-auto mb-4">
                    <step.icon className="w-7 h-7 text-primary" />
                  </div>
                  <h3 className="text-lg font-semibold text-foreground mb-2">{step.title}</h3>
                  <p className="text-sm text-muted-foreground">{step.description}</p>
                </div>
                {step.step < 3 && (
                  <div className="hidden md:block absolute top-1/2 -right-3 transform -translate-y-1/2">
                    <ChevronRight className="w-6 h-6 text-muted-foreground" />
                  </div>
                )}
              </div>
            ))}
          </div>
          
          <div className="mt-8 text-center">
            <Button size="lg" onClick={() => navigate("/auth")} className="text-lg px-8">
              {t("landing.installNow")}
              <Download className="w-5 h-5 ml-2" />
            </Button>
          </div>
        </div>
      </section>

      {/* Quick Signup QR Code Section */}
      <section className="py-16 px-4 bg-muted/30">
        <div className="max-w-4xl mx-auto">
          <div className="bg-card rounded-3xl p-8 md:p-12 shadow-xl border border-border">
            <div className="grid md:grid-cols-2 gap-8 items-center">
              <div className="space-y-4 text-center md:text-left">
                <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full text-sm font-medium">
                  <Zap className="w-4 h-4" />
                  {t("landing.quickSignupBadge")}
                </div>
                <h2 className="text-2xl md:text-3xl font-bold text-foreground">
                  {t("landing.quickSignupTitle")}
                </h2>
                <p className="text-muted-foreground">
                  {t("landing.quickSignupDescription")}
                </p>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-primary" />
                    {t("landing.quickSignupStep1")}
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-primary" />
                    {t("landing.quickSignupStep2")}
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-primary" />
                    {t("landing.quickSignupStep3")}
                  </li>
                </ul>
              </div>
              <div className="flex justify-center">
                <div className="bg-white p-6 rounded-2xl shadow-lg">
                  <QRCodeSVG 
                    value={`${productionUrl}/auth`}
                    size={180}
                    level="H"
                    includeMargin={false}
                    bgColor="#ffffff"
                    fgColor="#000000"
                  />
                  <p className="text-center text-xs text-muted-foreground mt-3 font-medium">
                    {t("landing.scanToSignup")}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            {t("landing.ctaTitle")}
          </h2>
          <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
            {t("landing.ctaDescription")}
          </p>
          <Button size="lg" onClick={() => navigate("/auth")} className="text-lg px-10 py-6">
            {t("landing.ctaButton")}
            <ChevronRight className="w-5 h-5 ml-2" />
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-8 px-4">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <img src={sreptrackLogo} alt="S-reptrack" className="w-6 h-6 rounded" />
            <span className="font-semibold text-foreground">S-reptrack</span>
          </div>
          <div className="flex items-center gap-6 text-sm text-muted-foreground">
            <button onClick={() => navigate("/privacy")} className="hover:text-foreground transition-colors">
              {t("landing.privacyPolicy")}
            </button>
            <span>© 2024 S-reptrack</span>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
