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
  Star
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import ThemeToggle from "@/components/ThemeToggle";
import LanguageSelector from "@/components/LanguageSelector";

const Landing = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const features = [
    {
      icon: QrCode,
      title: "QR Codes",
      description: "Générez et imprimez des QR codes pour identifier rapidement chaque animal de votre collection.",
    },
    {
      icon: Nfc,
      title: "Scanner NFC",
      description: "Scannez les tags NFC pour accéder instantanément aux fiches de vos reptiles.",
    },
    {
      icon: Calendar,
      title: "Suivi Nourrissage",
      description: "Planifiez et suivez les repas de chaque animal avec des rappels automatiques.",
    },
    {
      icon: Heart,
      title: "Santé & Vétérinaire",
      description: "Enregistrez les visites vétérinaires, traitements et problèmes de santé.",
    },
    {
      icon: TrendingUp,
      title: "Reproduction",
      description: "Suivez les accouplements, pontes et éclosions avec des notifications d'alerte.",
    },
    {
      icon: Shield,
      title: "Conformité CITES",
      description: "Base de données complète des espèces avec annexes CITES intégrées.",
    },
  ];

  const installSteps = [
    {
      step: 1,
      title: "Ouvrez l'application",
      description: "Accédez à S-reptrack depuis votre navigateur mobile",
      icon: Globe,
    },
    {
      step: 2,
      title: "Menu du navigateur",
      description: "Appuyez sur le menu (⋮ sur Android, Partager sur iPhone)",
      icon: Smartphone,
    },
    {
      step: 3,
      title: "Ajouter à l'écran d'accueil",
      description: "Sélectionnez 'Ajouter à l'écran d'accueil' ou 'Installer l'application'",
      icon: Download,
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-lg border-b border-border">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-2xl">🦎</span>
            <span className="font-bold text-xl text-foreground">S-reptrack</span>
          </div>
          <div className="flex items-center gap-2">
            <LanguageSelector />
            <ThemeToggle />
            <Button onClick={() => navigate("/auth")} size="sm">
              Connexion
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
                Application professionnelle d'élevage
              </Badge>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-foreground leading-tight">
                Gérez votre élevage de{" "}
                <span className="text-primary">reptiles</span>{" "}
                comme un pro
              </h1>
              <p className="text-lg md:text-xl text-muted-foreground max-w-xl mx-auto lg:mx-0">
                S-reptrack est l'application tout-en-un pour les éleveurs passionnés. 
                Suivi des nourrissages, reproduction, santé, et bien plus encore.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                <Button size="lg" onClick={() => navigate("/")} className="text-lg px-8">
                  Commencer gratuitement
                  <ChevronRight className="w-5 h-5 ml-2" />
                </Button>
                <Button size="lg" variant="outline" onClick={() => document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' })}>
                  Découvrir les fonctionnalités
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
                        <span className="text-xl">🦎</span>
                        <span className="font-bold text-foreground">S-reptrack</span>
                      </div>
                      
                      {/* Stats Cards */}
                      <div className="grid grid-cols-2 gap-2">
                        <div className="bg-primary/10 rounded-lg p-3 text-center">
                          <p className="text-2xl font-bold text-primary">12</p>
                          <p className="text-xs text-muted-foreground">Reptiles</p>
                        </div>
                        <div className="bg-orange-500/10 rounded-lg p-3 text-center">
                          <p className="text-2xl font-bold text-orange-500">3</p>
                          <p className="text-xs text-muted-foreground">À nourrir</p>
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
                              <p className="text-xs text-muted-foreground">Nourri il y a {i + 2} jours</p>
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
              Tout ce dont vous avez besoin
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Des fonctionnalités puissantes pour gérer votre élevage efficacement, 
              accessibles depuis n'importe quel appareil.
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
                Conçu pour les éleveurs exigeants
              </h2>
              <div className="space-y-4">
                {[
                  "Suivi de poids avec graphiques d'évolution",
                  "Gestion des morphs et lignées génétiques",
                  "Export de données conforme RGPD",
                  "Mode sombre pour le confort visuel",
                  "Disponible en 8 langues",
                  "Transfert d'animaux entre éleveurs",
                  "Impression de fiches et QR codes",
                ].map((item, index) => (
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
                <p className="text-sm text-muted-foreground mb-2">Abonnement Premium</p>
                <div className="flex items-baseline justify-center gap-1">
                  <span className="text-5xl font-bold text-foreground">4,99€</span>
                  <span className="text-muted-foreground">/mois</span>
                </div>
                <p className="text-sm text-muted-foreground mt-2">ou 39,99€/an (2 mois offerts)</p>
              </div>
              <Button size="lg" className="w-full" onClick={() => navigate("/auth")}>
                Essayer gratuitement
              </Button>
              <p className="text-xs text-center text-muted-foreground">
                Paiement sécurisé par Stripe. Annulez à tout moment.
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
              Installation en 3 étapes
            </h2>
            <p className="text-lg text-muted-foreground">
              Installez S-reptrack sur votre mobile en quelques secondes, sans passer par un store.
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
              Installer maintenant
              <Download className="w-5 h-5 ml-2" />
            </Button>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Prêt à gérer votre élevage ?
          </h2>
          <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
            Rejoignez les éleveurs qui font confiance à S-reptrack pour gérer leur collection de reptiles.
          </p>
          <Button size="lg" onClick={() => navigate("/auth")} className="text-lg px-10 py-6">
            Créer mon compte gratuitement
            <ChevronRight className="w-5 h-5 ml-2" />
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-8 px-4">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="text-xl">🦎</span>
            <span className="font-semibold text-foreground">S-reptrack</span>
          </div>
          <div className="flex items-center gap-6 text-sm text-muted-foreground">
            <button onClick={() => navigate("/privacy")} className="hover:text-foreground transition-colors">
              Politique de confidentialité
            </button>
            <span>© 2024 S-reptrack</span>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
