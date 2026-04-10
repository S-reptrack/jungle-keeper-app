import { useTranslation } from "react-i18next";
import { Moon, Sun, Globe, LogOut, User, Shield, Send, ArrowLeft, MessageSquare } from "lucide-react";
import { useTheme } from "next-themes";
import Navigation from "@/components/Navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useUserRole } from "@/hooks/useUserRole";
import { useNavigate, Link } from "react-router-dom";
import { toast } from "sonner";
import { languages } from "@/i18n/config";
import { isNativeIOS } from "@/lib/platformUtils";
import { useState, useEffect } from "react";
import ExportDataDialog from "@/components/ExportDataDialog";
import DeleteAccountDialog from "@/components/DeleteAccountDialog";
import SubscriptionCard from "@/components/SubscriptionCard";
import TesterFeedbackForm from "@/components/TesterFeedbackForm";

const Settings = () => {
  const { t, i18n } = useTranslation();
  const { theme, setTheme } = useTheme();
  const { user } = useAuth();
  const { isTester } = useUserRole();
  const navigate = useNavigate();
  
  const [weightUnit, setWeightUnit] = useState(localStorage.getItem('weightUnit') || 'grams');
  const [feedingReminders, setFeedingReminders] = useState(localStorage.getItem('feedingReminders') === 'true');

  useEffect(() => {
    localStorage.setItem('weightUnit', weightUnit);
  }, [weightUnit]);

  useEffect(() => {
    localStorage.setItem('feedingReminders', feedingReminders.toString());
  }, [feedingReminders]);

  const handleSignOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      navigate("/");
      toast.success(t("settings.signOutSuccess"));
    } catch (error) {
      console.error("Error signing out:", error);
      toast.error(t("settings.signOutError"));
    }
  };

  const handleLanguageChange = (languageCode: string) => {
    i18n.changeLanguage(languageCode);
    toast.success(t("settings.languageChanged"));
  };

  return (
    <div className="min-h-screen bg-background pb-24 md:pb-8">
      <Navigation />
      
      <main className="max-w-4xl mx-auto px-4 py-8 md:pt-24">
        <div className="mb-8">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate("/")}
            className="mb-4 -ml-2"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Retour
          </Button>
          <h1 className="text-3xl font-bold text-foreground mb-2">
            {t("common.settings")}
          </h1>
          <p className="text-muted-foreground">
            {t("settings.description")}
          </p>
        </div>

        <div className="space-y-6">
          {/* Formulaire de feedback pour les testeurs */}
          {isTester && <TesterFeedbackForm />}
          
          {/* Abonnement Premium */}
          <SubscriptionCard />

          {/* Apparence */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sun className="w-5 h-5" />
                {t("settings.appearance")}
              </CardTitle>
              <CardDescription>{t("settings.appearanceDescription")}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>{t("settings.theme")}</Label>
                <RadioGroup value={theme} onValueChange={setTheme}>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="light" id="light" />
                    <Label htmlFor="light" className="font-normal cursor-pointer">
                      <div className="flex items-center gap-2">
                        <Sun className="w-4 h-4" />
                        {t("settings.lightTheme")}
                      </div>
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="dark" id="dark" />
                    <Label htmlFor="dark" className="font-normal cursor-pointer">
                      <div className="flex items-center gap-2">
                        <Moon className="w-4 h-4" />
                        {t("settings.darkTheme")}
                      </div>
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="system" id="system" />
                    <Label htmlFor="system" className="font-normal cursor-pointer">
                      {t("settings.systemTheme")}
                    </Label>
                  </div>
                </RadioGroup>
              </div>
            </CardContent>
          </Card>

          {/* Langue */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe className="w-5 h-5" />
                {t("settings.language")}
              </CardTitle>
              <CardDescription>{t("settings.languageDescription")}</CardDescription>
            </CardHeader>
            <CardContent>
              <RadioGroup value={i18n.language} onValueChange={handleLanguageChange}>
                {languages.map((lang) => (
                  <div key={lang.code} className="flex items-center space-x-2">
                    <RadioGroupItem value={lang.code} id={lang.code} />
                    <Label htmlFor={lang.code} className="font-normal cursor-pointer">
                      <span className="mr-2">{lang.flag}</span>
                      {lang.name}
                    </Label>
                  </div>
                ))}
              </RadioGroup>
            </CardContent>
          </Card>

          {/* Préférences */}
          <Card>
            <CardHeader>
              <CardTitle>{t("settings.preferences")}</CardTitle>
              <CardDescription>{t("settings.preferencesDescription")}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label>{t("settings.weightUnit")}</Label>
                <RadioGroup value={weightUnit} onValueChange={setWeightUnit}>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="grams" id="grams" />
                    <Label htmlFor="grams" className="font-normal cursor-pointer">
                      {t("settings.grams")}
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="ounces" id="ounces" />
                    <Label htmlFor="ounces" className="font-normal cursor-pointer">
                      {t("settings.ounces")}
                    </Label>
                  </div>
                </RadioGroup>
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="feeding-reminders">{t("settings.feedingReminders")}</Label>
                  <p className="text-sm text-muted-foreground">
                    {t("settings.feedingRemindersDescription")}
                  </p>
                </div>
                <Switch
                  id="feeding-reminders"
                  checked={feedingReminders}
                  onCheckedChange={setFeedingReminders}
                />
              </div>
            </CardContent>
          </Card>


          {/* Compte */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="w-5 h-5" />
                {t("settings.account")}
              </CardTitle>
              <CardDescription>{t("settings.accountDescription")}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>{t("settings.email")}</Label>
                <p className="text-sm text-muted-foreground">{user?.email}</p>
              </div>

              <Separator />

              <Button
                variant="outline"
                className="w-full"
                onClick={handleSignOut}
              >
                <LogOut className="w-4 h-4 mr-2" />
                {t("settings.signOut")}
              </Button>
            </CardContent>
          </Card>

          {/* Confidentialité et données RGPD */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="w-5 h-5" />
                {t("gdpr.dataPrivacy")}
              </CardTitle>
              <CardDescription>{t("gdpr.dataPrivacyDescription")}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Link to="/privacy">
                  <Button variant="outline" className="w-full">
                    {t("gdpr.viewPrivacyPolicy")}
                  </Button>
                </Link>
              </div>

              <div className="space-y-2">
                <Link to="/terms">
                  <Button variant="outline" className="w-full">
                    {t("settings.viewTerms") || "Conditions Générales d'Utilisation"}
                  </Button>
                </Link>
              </div>

              <Separator />

              <div className="space-y-2">
                <ExportDataDialog />
              </div>

              <Separator />

              <div className="space-y-2">
                <DeleteAccountDialog />
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default Settings;
