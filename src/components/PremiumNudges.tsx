import { useNavigate } from "react-router-dom";
import { Crown, Gift } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useSubscription } from "@/hooks/useSubscription";
import { useReptileCount } from "@/hooks/useReptileCount";

/** Bandeau d'essai offert + rappel quand on approche de la limite gratuite. */
const PremiumNudges = () => {
  const navigate = useNavigate();
  const { welcomeTrialEnd, subscribed, loading } = useSubscription();
  const { count, FREE_TIER_LIMIT, loading: countLoading } = useReptileCount();
  if (loading || countLoading) return null;

  if (welcomeTrialEnd) {
    const days = Math.max(1, Math.ceil((new Date(welcomeTrialEnd).getTime() - Date.now()) / 86400000));
    return (
      <Card className="mb-6 border-primary/30 bg-primary/5">
        <CardContent className="flex flex-col sm:flex-row sm:items-center gap-3 py-4">
          <Gift className="h-6 w-6 text-primary shrink-0" />
          <p className="flex-1 text-sm">
            <strong>Premium offert pendant 7 jours</strong> : il vous reste {days} jour{days > 1 ? "s" : ""} pour tout essayer (registre, génétique, fiches PDF, reptiles illimités…). Aucune carte demandée.
          </p>
          <Button size="sm" variant="outline" onClick={() => navigate("/premium")}>Découvrir</Button>
        </CardContent>
      </Card>
    );
  }

  if (!subscribed && count >= FREE_TIER_LIMIT - 1) {
    const full = count >= FREE_TIER_LIMIT;
    return (
      <Card className="mb-6 border-accent/40 bg-accent/10">
        <CardContent className="flex flex-col sm:flex-row sm:items-center gap-3 py-4">
          <Crown className="h-6 w-6 text-accent-foreground shrink-0" />
          <p className="flex-1 text-sm">
            {full
              ? `Vous avez atteint la limite gratuite de ${FREE_TIER_LIMIT} reptiles. Passez à Premium pour en ajouter autant que vous voulez.`
              : `Plus qu'une place gratuite (${count}/${FREE_TIER_LIMIT} reptiles). Avec Premium, ajoutez autant de reptiles que vous voulez.`}
          </p>
          <Button size="sm" onClick={() => navigate("/settings?tab=subscription")}>Passer à Premium</Button>
        </CardContent>
      </Card>
    );
  }
  return null;
};

export default PremiumNudges;
