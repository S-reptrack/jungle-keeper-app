import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { useUserRole } from "@/hooks/useUserRole";
import { useAuth } from "@/hooks/useAuth";
import Maintenance from "@/pages/Maintenance";

// TOGGLE THIS TO ENABLE/DISABLE MAINTENANCE MODE
const MAINTENANCE_MODE = true;

// Routes accessibles même en mode maintenance
const ALLOWED_ROUTES = ["/auth", "/privacy", "/terms", "/legal"];

interface MaintenanceGuardProps {
  children: React.ReactNode;
}

const MaintenanceGuard = ({ children }: MaintenanceGuardProps) => {
  const location = useLocation();
  
  // Si le mode maintenance est désactivé, afficher directement les enfants
  if (!MAINTENANCE_MODE) {
    return <>{children}</>;
  }

  // Si la route actuelle est dans les routes autorisées, afficher les enfants
  if (ALLOWED_ROUTES.includes(location.pathname)) {
    return <>{children}</>;
  }

  // Mode maintenance activé - besoin de vérifier le rôle
  return <MaintenanceCheck>{children}</MaintenanceCheck>;
};

// Composant séparé pour la vérification du mode maintenance
const MaintenanceCheck = ({ children }: MaintenanceGuardProps) => {
  const { user, loading: authLoading } = useAuth();
  const { isAdmin, isTester, canBypassMaintenance, loading: roleLoading, role } = useUserRole();
  const [timedOut, setTimedOut] = useState(false);

  // Timeout de sécurité pour éviter un spinner infini
  useEffect(() => {
    const timeout = setTimeout(() => {
      if (authLoading || roleLoading) {
        console.log("MaintenanceCheck - Loading timeout reached");
        setTimedOut(true);
      }
    }, 5000); // 5 secondes max

    return () => clearTimeout(timeout);
  }, [authLoading, roleLoading]);

  // Debug logs
  useEffect(() => {
    console.log("MaintenanceCheck - authLoading:", authLoading);
    console.log("MaintenanceCheck - roleLoading:", roleLoading);
    console.log("MaintenanceCheck - user:", user?.email);
    console.log("MaintenanceCheck - role:", role);
    console.log("MaintenanceCheck - isAdmin:", isAdmin);
    console.log("MaintenanceCheck - isTester:", isTester);
    console.log("MaintenanceCheck - canBypassMaintenance:", canBypassMaintenance);
  }, [authLoading, roleLoading, user, role, isAdmin, isTester, canBypassMaintenance]);

  // While loading (with timeout protection), show spinner
  if ((authLoading || roleLoading) && !timedOut) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  // If timed out or not admin/tester, show maintenance page
  if (timedOut || !canBypassMaintenance) {
    console.log("MaintenanceCheck - Showing maintenance page (timedOut:", timedOut, ", not admin or tester)");
    return <Maintenance />;
  }

  // Admin or tester user, render children
  console.log("MaintenanceCheck - Access granted (admin or tester)");
  return <>{children}</>;
};

export default MaintenanceGuard;
