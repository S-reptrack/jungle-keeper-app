import { useEffect, useState } from "react";
import { useUserRole } from "@/hooks/useUserRole";
import { useAuth } from "@/hooks/useAuth";
import Maintenance from "@/pages/Maintenance";

// TOGGLE THIS TO ENABLE/DISABLE MAINTENANCE MODE
const MAINTENANCE_MODE = false;

interface MaintenanceGuardProps {
  children: React.ReactNode;
}

const MaintenanceGuard = ({ children }: MaintenanceGuardProps) => {
  const { user, loading: authLoading } = useAuth();
  const { isAdmin, loading: roleLoading } = useUserRole();
  const [shouldShowMaintenance, setShouldShowMaintenance] = useState(false);

  useEffect(() => {
    if (!authLoading && !roleLoading) {
      // Show maintenance page if:
      // 1. Maintenance mode is enabled
      // 2. User is not an admin
      if (MAINTENANCE_MODE && !isAdmin) {
        setShouldShowMaintenance(true);
      } else {
        setShouldShowMaintenance(false);
      }
    }
  }, [user, isAdmin, authLoading, roleLoading]);

  // While loading, show nothing (or a loading spinner)
  if (authLoading || roleLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  // If maintenance mode and not admin, show maintenance page
  if (shouldShowMaintenance) {
    return <Maintenance />;
  }

  // Otherwise, render children normally
  return <>{children}</>;
};

export default MaintenanceGuard;
