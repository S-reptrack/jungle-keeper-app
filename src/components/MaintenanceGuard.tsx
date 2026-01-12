import { useEffect, useState } from "react";
import { useUserRole } from "@/hooks/useUserRole";
import { useAuth } from "@/hooks/useAuth";
import Maintenance from "@/pages/Maintenance";

// TOGGLE THIS TO ENABLE/DISABLE MAINTENANCE MODE
const MAINTENANCE_MODE = true;

interface MaintenanceGuardProps {
  children: React.ReactNode;
}

const MaintenanceGuard = ({ children }: MaintenanceGuardProps) => {
  // Si le mode maintenance est désactivé, afficher directement les enfants
  // sans attendre le chargement du rôle utilisateur
  if (!MAINTENANCE_MODE) {
    return <>{children}</>;
  }

  // Mode maintenance activé - besoin de vérifier le rôle
  return <MaintenanceCheck>{children}</MaintenanceCheck>;
};

// Composant séparé pour la vérification du mode maintenance
const MaintenanceCheck = ({ children }: MaintenanceGuardProps) => {
  const { user, loading: authLoading } = useAuth();
  const { isAdmin, loading: roleLoading, role } = useUserRole();

  // Debug logs
  useEffect(() => {
    console.log("MaintenanceCheck - authLoading:", authLoading);
    console.log("MaintenanceCheck - roleLoading:", roleLoading);
    console.log("MaintenanceCheck - user:", user?.email);
    console.log("MaintenanceCheck - role:", role);
    console.log("MaintenanceCheck - isAdmin:", isAdmin);
  }, [authLoading, roleLoading, user, role, isAdmin]);

  // While loading, show spinner
  if (authLoading || roleLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  // If not admin, show maintenance page
  if (!isAdmin) {
    console.log("MaintenanceCheck - Showing maintenance page (not admin)");
    return <Maintenance />;
  }

  // Admin user, render children
  console.log("MaintenanceCheck - Admin access granted");
  return <>{children}</>;
};

export default MaintenanceGuard;
