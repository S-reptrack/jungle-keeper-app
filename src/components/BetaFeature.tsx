import { useBetaTester } from "@/hooks/useBetaTester";
import { useTranslation } from "react-i18next";
import { Badge } from "@/components/ui/badge";
import { FlaskConical } from "lucide-react";

interface BetaFeatureProps {
  children: React.ReactNode;
  /** Message optionnel affiché si l'utilisateur n'est pas beta tester */
  fallback?: React.ReactNode;
  /** Si true, affiche un badge "Beta" à côté du contenu */
  showBadge?: boolean;
}

/**
 * Composant wrapper pour les fonctionnalités en beta.
 * Seuls les utilisateurs avec le rôle beta_tester ET un abonnement actif peuvent voir le contenu.
 */
export const BetaFeature = ({ 
  children, 
  fallback = null,
  showBadge = true 
}: BetaFeatureProps) => {
  const { canAccessBetaFeatures, loading } = useBetaTester();
  const { t } = useTranslation();

  if (loading) {
    return null; // Pas de spinner pour éviter les flashs
  }

  if (!canAccessBetaFeatures) {
    return <>{fallback}</>;
  }

  return (
    <div className="relative">
      {showBadge && (
        <Badge 
          variant="outline" 
          className="absolute -top-2 -right-2 z-10 bg-amber-500/10 text-amber-600 border-amber-500/30 text-xs"
        >
          <FlaskConical className="w-3 h-3 mr-1" />
          Beta
        </Badge>
      )}
      {children}
    </div>
  );
};

/**
 * Badge à utiliser à côté d'un titre ou d'un bouton pour indiquer une fonctionnalité beta
 */
export const BetaBadge = () => {
  const { canAccessBetaFeatures } = useBetaTester();
  
  if (!canAccessBetaFeatures) return null;
  
  return (
    <Badge 
      variant="outline" 
      className="ml-2 bg-amber-500/10 text-amber-600 border-amber-500/30 text-xs"
    >
      <FlaskConical className="w-3 h-3 mr-1" />
      Beta
    </Badge>
  );
};
