import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useUserRole } from "@/hooks/useUserRole";
import { useAuth } from "@/hooks/useAuth";

interface AdminRouteProps {
  children: React.ReactNode;
}

const AdminRoute = ({ children }: AdminRouteProps) => {
  const { user, loading: authLoading } = useAuth();
  const { isAdmin, loading: roleLoading } = useUserRole();
  const navigate = useNavigate();

  const loading = authLoading || roleLoading;

  useEffect(() => {
    console.log("[AdminRoute] Checking access:", { user: user?.email, isAdmin, loading });
    
    if (!loading) {
      if (!user) {
        console.log("[AdminRoute] No user, redirecting to /auth");
        navigate("/auth");
      } else if (!isAdmin) {
        console.log("[AdminRoute] Not admin, redirecting to /dashboard");
        navigate("/dashboard");
      } else {
        console.log("[AdminRoute] Admin access granted");
      }
    }
  }, [user, isAdmin, loading, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Chargement...</p>
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
