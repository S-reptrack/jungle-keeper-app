import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import { AlertCircle, CheckCircle2, Shield } from "lucide-react";
import { validatePassword, validatePasswordComplete, type PasswordValidationResult } from "@/lib/passwordValidation";

export const AuthForm = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [passwordValidation, setPasswordValidation] = useState<PasswordValidationResult | null>(null);
  const [checkingBreach, setCheckingBreach] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();
  const { t } = useTranslation();

  // Validation en temps réel du mot de passe
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
        toast({
          title: "Mot de passe non valide",
          description: validation.errors[0],
          variant: "destructive"
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
        toast({
          title: "Connexion réussie",
          description: "Bienvenue !",
        });
        navigate("/");
      } else {
        const { error } = await supabase.auth.signUp({
          email,
          password,
        });
        if (error) throw error;
        toast({
          title: "Inscription réussie",
          description: "Vous pouvez maintenant vous connecter.",
        });
        navigate("/");
      }
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>{isLogin ? "Connexion" : "Inscription"}</CardTitle>
          <CardDescription>
            {isLogin
              ? "Connectez-vous à votre compte"
              : "Créez un nouveau compte"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleAuth} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
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
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={isLogin ? 6 : 12}
                placeholder={isLogin ? "••••••••" : "Minimum 12 caractères"}
              />
              
              {/* Indicateur de force du mot de passe */}
              {!isLogin && password && passwordValidation && (
                <div className="space-y-2 mt-2">
                  <div className="flex items-center gap-2 text-sm">
                    <Shield className="h-4 w-4" />
                    <span>Force: </span>
                    <span className={`font-semibold ${
                      passwordValidation.strength === 'weak' ? 'text-red-500' :
                      passwordValidation.strength === 'medium' ? 'text-yellow-500' : 'text-green-500'
                    }`}>
                      {passwordValidation.strength === 'weak' ? 'Faible' :
                       passwordValidation.strength === 'medium' ? 'Moyen' : 'Fort'}
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
              {loading || checkingBreach
                ? "Chargement..."
                : isLogin
                ? "Se connecter"
                : "S'inscrire"}
            </Button>
            <Button
              type="button"
              variant="ghost"
              className="w-full"
              onClick={() => setIsLogin(!isLogin)}
            >
              {isLogin
                ? "Pas de compte ? S'inscrire"
                : "Déjà un compte ? Se connecter"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};
