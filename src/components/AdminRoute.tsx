import { useEffect, useState } from "react";
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

  const loading = authLoading || roleLoading;

  useEffect(() => {
    console.log("[AdminRoute] State:", { 
      user: user?.email, 
      isAdmin, 
      role,
      loading, 
      authLoading, 
      roleLoading,
      hasChecked 
    });
    
    // Ne rediriger que si le chargement est terminé ET qu'on n'a pas encore vérifié
    if (!loading && !hasChecked) {
      setHasChecked(true);
      
      if (!user) {
        console.log("[AdminRoute] No user, redirecting to /auth");
        navigate("/auth", { replace: true });
      } else if (!isAdmin) {
        console.log("[AdminRoute] Not admin (role:", role, "), redirecting to /dashboard");
        navigate("/dashboard", { replace: true });
      } else {
        console.log("[AdminRoute] Admin access granted!");
      }
    }
  }, [user, isAdmin, role, loading, navigate, hasChecked]);

  // Réinitialiser hasChecked si l'utilisateur change
  useEffect(() => {
    if (user?.id) {
      setHasChecked(false);
    }
  }, [user?.id]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Vérification des droits admin...</p>
        </div>
      </div>
    );
  }

  if (!user || !isAdmin) {
    return null;
  }

  return <>{children}</>;
};

export default AdminRoute;
