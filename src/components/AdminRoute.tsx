import { useEffect, useState } from "react";
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
  const [decided, setDecided] = useState(false);

  const loading = authLoading || roleLoading;

  useEffect(() => {
    if (loading || decided) return;

    if (!user) {
      navigate("/auth", { replace: true });
    } else if (!isAdmin) {
      navigate("/landing", { replace: true });
    } else {
      setDecided(true);
    }
  }, [user, isAdmin, loading, navigate, decided]);

  // Reset when user changes
  useEffect(() => {
    setDecided(false);
  }, [user?.id]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Vérification des droits administrateur...</p>
        </div>
      </div>
    );
  }

  if (decided && user && isAdmin) {
    return <>{children}</>;
  }

  return null;
};

export default AdminRoute;
