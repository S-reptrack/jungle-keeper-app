import { useSubscription } from "@/hooks/useSubscription";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Crown, Lock } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface PremiumFeatureGateProps {
  children: React.ReactNode;
  featureName: string;
  featureDescription?: string;
}

export const PremiumFeatureGate = ({ 
  children, 
  featureName, 
  featureDescription 
}: PremiumFeatureGateProps) => {
  const { subscribed, loading } = useSubscription();
  const { t } = useTranslation();
  const navigate = useNavigate();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[300px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!subscribed) {
    return (
      <Card className="max-w-md mx-auto mt-12">
        <CardHeader className="text-center">
          <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
            <Lock className="w-8 h-8 text-primary" />
          </div>
          <CardTitle className="flex items-center justify-center gap-2">
            <Crown className="w-5 h-5 text-yellow-500" />
            {featureName}
          </CardTitle>
          <CardDescription>
            {featureDescription || t("premium.featureLockedDescription")}
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center space-y-4">
          <p className="text-sm text-muted-foreground">
            {t("premium.upgradeToAccess")}
          </p>
          <Button 
            onClick={() => navigate("/settings?tab=subscription")}
            className="w-full"
          >
            <Crown className="w-4 h-4 mr-2" />
            {t("premium.upgradeToPremium")}
          </Button>
        </CardContent>
      </Card>
    );
  }

  return <>{children}</>;
};
