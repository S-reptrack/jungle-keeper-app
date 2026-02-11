import { ReactNode } from "react";
import { useTesterSuspension } from "@/hooks/useTesterSuspension";
import { useUserRole } from "@/hooks/useUserRole";
import TesterSuspendedScreen from "./TesterSuspendedScreen";

interface TesterSuspensionGuardProps {
  children: ReactNode;
}

/**
 * Guard that blocks suspended testers from accessing the app.
 * Only applies to users with the 'tester' role.
 * Admins, subscribers, and regular users are never blocked.
 */
const TesterSuspensionGuard = ({ children }: TesterSuspensionGuardProps) => {
  const { isTester, isAdmin, loading: roleLoading } = useUserRole();
  const { isSuspended, loading: suspensionLoading } = useTesterSuspension();

  // Don't block admins or non-testers
  if (!isTester || isAdmin) {
    return <>{children}</>;
  }

  // Wait for checks to complete
  if (roleLoading || suspensionLoading) {
    return null;
  }

  if (isSuspended) {
    return <TesterSuspendedScreen />;
  }

  return <>{children}</>;
};

export default TesterSuspensionGuard;
