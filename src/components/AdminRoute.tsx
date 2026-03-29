import { Navigate } from "react-router-dom";
import { useUserRole } from "@/hooks/useUserRole";
import { useAuth } from "@/hooks/useAuth";

interface AdminRouteProps {
  children: React.ReactNode;
}

const AdminRoute = ({ children }: AdminRouteProps) => {
  const { user, loading: authLoading } = useAuth();
  const { isAdmin, loading: roleLoading } = useUserRole();
  const [timedOut, setTimedOut] = useState(false);

  const loading = (authLoading || roleLoading) && !timedOut;

  useEffect(() => {
    const timer = setTimeout(() => {
      if (authLoading || roleLoading) {
        console.warn("[AdminRoute] Loading timed out after 5s");
        setTimedOut(true);
      }
    }, 5000);
    return () => clearTimeout(timer);
  }, [authLoading, roleLoading]);

  console.log("[AdminRoute] State:", { user: user?.email, authLoading, roleLoading, isAdmin, timedOut });

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Vérification des droits administrateur...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  if (!isAdmin) {
    return <Navigate to="/landing" replace />;
  }

  return <>{children}</>;
};

export default AdminRoute;
