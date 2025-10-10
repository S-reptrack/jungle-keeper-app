import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { AlertCircle, CheckCircle2, Shield } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import jungleHero from "@/assets/jungle-hero.jpg";
import { validatePassword, validatePasswordComplete, type PasswordValidationResult } from "@/lib/passwordValidation";

const Auth = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [passwordValidation, setPasswordValidation] = useState<PasswordValidationResult | null>(null);
  const [checkingBreach, setCheckingBreach] = useState(false);

  useEffect(() => {
    // Check if user is already logged in
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        navigate("/");
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (session) {
        navigate("/");
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  // Validation en temps réel du mot de passe (seulement pour l'inscription)
  useEffect(() => {
    if (!isLogin && password) {
      const validation = validatePassword(password);
      setPasswordValidation(validation);
    } else {
      setPasswordValidation(null);
    }
  }, [password, isLogin]);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation complète pour l'inscription
    if (!isLogin) {
      setCheckingBreach(true);
      const validation = await validatePasswordComplete(password);
      setCheckingBreach(false);

      if (!validation.isValid) {
        toast.error("Mot de passe non valide", {
          description: validation.errors[0]
        });
        return;
      }
    }

    setLoading(true);

    try {
      if (isLogin) {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
        toast.success("Connexion réussie!");
      } else {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/`,
          },
        });
        if (error) throw error;
        toast.success("Inscription réussie! Vous pouvez maintenant vous connecter.");
      }
    } catch (error: any) {
      toast.error(error.message || "Une erreur est survenue");
    } finally {
      setLoading(false);
    }
  };

  const getStrengthColor = (strength: 'weak' | 'medium' | 'strong') => {
    switch (strength) {
      case 'weak': return 'text-red-500';
      case 'medium': return 'text-yellow-500';
      case 'strong': return 'text-green-500';
    }
  };

  const getStrengthLabel = (strength: 'weak' | 'medium' | 'strong') => {
    switch (strength) {
      case 'weak': return 'Faible';
      case 'medium': return 'Moyen';
      case 'strong': return 'Fort';
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Hero Section */}
      <div className="relative h-64 overflow-hidden">
        <img 
          src={jungleHero} 
          alt="Jungle amazonienne"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/50 to-transparent" />
        <div className="absolute bottom-8 left-4 right-4 md:left-8">
          <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-2">
            {t("common.appName")}
          </h1>
        </div>
      </div>

      {/* Auth Form */}
      <div className="flex-1 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>{isLogin ? "Connexion" : "Inscription"}</CardTitle>
            <CardDescription>
              {isLogin 
                ? "Connectez-vous pour accéder à vos reptiles" 
                : "Créez un compte pour commencer"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleAuth} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="votre@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Mot de passe</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder={isLogin ? "••••••••" : "Minimum 12 caractères"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={isLogin ? 6 : 12}
                />
                
                {/* Indicateur de force du mot de passe */}
                {!isLogin && password && passwordValidation && (
                  <div className="space-y-2 mt-2">
                    <div className="flex items-center gap-2 text-sm">
                      <Shield className="h-4 w-4" />
                      <span>Force: </span>
                      <span className={`font-semibold ${getStrengthColor(passwordValidation.strength)}`}>
                        {getStrengthLabel(passwordValidation.strength)}
                      </span>
                    </div>
                    
                    {/* Messages d'erreur de validation */}
                    {passwordValidation.errors.length > 0 && (
                      <Alert variant="destructive" className="py-2">
                        <AlertCircle className="h-4 w-4" />
                        <AlertDescription className="text-xs">
                          <ul className="list-disc list-inside space-y-1">
                            {passwordValidation.errors.map((error, idx) => (
                              <li key={idx}>{error}</li>
                            ))}
                          </ul>
                        </AlertDescription>
                      </Alert>
                    )}
                    
                    {/* Confirmation de mot de passe valide */}
                    {passwordValidation.isValid && (
                      <Alert className="py-2 border-green-500 bg-green-50 dark:bg-green-950">
                        <CheckCircle2 className="h-4 w-4 text-green-600" />
                        <AlertDescription className="text-xs text-green-700 dark:text-green-400">
                          Mot de passe sécurisé ✓
                        </AlertDescription>
                      </Alert>
                    )}
                  </div>
                )}
              </div>

              {/* Avertissement de vérification */}
              {!isLogin && checkingBreach && (
                <Alert>
                  <Shield className="h-4 w-4" />
                  <AlertDescription className="text-xs">
                    Vérification de la sécurité du mot de passe...
                  </AlertDescription>
                </Alert>
              )}

              <Button 
                type="submit" 
                className="w-full" 
                disabled={loading || checkingBreach || (!isLogin && passwordValidation && !passwordValidation.isValid)}
              >
                {loading || checkingBreach ? "Chargement..." : (isLogin ? "Se connecter" : "S'inscrire")}
              </Button>
            </form>
            <div className="mt-4 text-center space-y-2">
              <button
                type="button"
                onClick={() => setIsLogin(!isLogin)}
                className="text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                {isLogin 
                  ? "Pas encore de compte ? S'inscrire" 
                  : "Déjà un compte ? Se connecter"}
              </button>
              <div>
                <a 
                  href="/privacy" 
                  className="text-xs text-muted-foreground hover:text-foreground transition-colors underline"
                >
                  Politique de confidentialité
                </a>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Auth;
