import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useUserRole } from "@/hooks/useUserRole";
import { useAuth } from "@/hooks/useAuth";

interface AdminRouteProps {
  children: React.ReactNode;
}

const AdminRoute = ({ children }: AdminRouteProps) => {
  const { user, loading: authLoading } = useAuth();
  const { isAdmin, loading: roleLoading, role } = useUserRole();
  const navigate = useNavigate();
  const [hasChecked, setHasChecked] = useState(false);
  const [accessGranted, setAccessGranted] = useState(false);
  const lastUserId = useRef<string | null>(null);

  const loading = authLoading || roleLoading;

  useEffect(() => {
    console.log("[AdminRoute] State:", { 
      user: user?.email, 
      isAdmin, 
      role,
      loading, 
      authLoading, 
      roleLoading,
      hasChecked,
      accessGranted
    });
    
    // Ne faire la vérification que si le chargement est terminé ET qu'on n'a pas encore vérifié pour CET utilisateur
    if (!loading && !hasChecked) {
      setHasChecked(true);
      lastUserId.current = user?.id || null;
      
      if (!user) {
        console.log("[AdminRoute] No user, redirecting to /auth");
        navigate("/auth", { replace: true });
      } else if (!isAdmin) {
        console.log("[AdminRoute] Not admin (role:", role, "), redirecting to /landing");
        navigate("/landing", { replace: true });
      } else {
        console.log("[AdminRoute] Admin access granted!");
        setAccessGranted(true);
      }
    }
  }, [user, isAdmin, role, loading, navigate, hasChecked]);

  // Réinitialiser hasChecked UNIQUEMENT si l'utilisateur change réellement
  useEffect(() => {
    if (user?.id && user.id !== lastUserId.current) {
      console.log("[AdminRoute] User changed from", lastUserId.current, "to", user.id);
      setHasChecked(false);
      setAccessGranted(false);
    }
  }, [user?.id]);

  // Afficher le spinner pendant le chargement
  if (loading || !hasChecked) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Vérification des droits administrateur...</p>
        </div>
      </div>
    );
  }

  // Afficher les enfants si l'accès est accordé
  if (accessGranted && user && isAdmin) {
    return <>{children}</>;
  }

  // Sinon, retourner null (la redirection est gérée dans useEffect)
  return null;
};

export default AdminRoute;
