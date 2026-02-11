import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";
import { useUserRole } from "./useUserRole";

const INACTIVITY_DAYS = 30;

export const useTesterSuspension = () => {
  const { user, loading: authLoading } = useAuth();
  const { isTester, loading: roleLoading } = useUserRole();
  const [isSuspended, setIsSuspended] = useState(false);
  const [suspendedAt, setSuspendedAt] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (authLoading || roleLoading) return;

    const checkSuspension = async () => {
      if (!user || !isTester) {
        setIsSuspended(false);
        setLoading(false);
        return;
      }

      try {
        // 1. Check if already suspended in tester_invitations
        const { data: invitation } = await supabase
          .from("tester_invitations")
          .select("suspended, suspended_at")
          .eq("email", user.email || "")
          .eq("status", "accepted")
          .maybeSingle();

        if (invitation?.suspended) {
          setIsSuspended(true);
          setSuspendedAt(invitation.suspended_at);
          setLoading(false);
          return;
        }

        // 2. Check last activity
        const { data: lastActivity } = await supabase
          .from("tester_activity")
          .select("created_at")
          .eq("user_id", user.id)
          .order("created_at", { ascending: false })
          .limit(1)
          .maybeSingle();

        if (lastActivity) {
          const lastDate = new Date(lastActivity.created_at);
          const now = new Date();
          const diffDays = Math.floor((now.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24));

          if (diffDays >= INACTIVITY_DAYS) {
            // Auto-suspend
            await supabase
              .from("tester_invitations")
              .update({ 
                suspended: true, 
                suspended_at: new Date().toISOString() 
              })
              .eq("email", user.email || "")
              .eq("status", "accepted");

            setIsSuspended(true);
            setSuspendedAt(new Date().toISOString());
            setLoading(false);
            return;
          }
        }

        setIsSuspended(false);
      } catch (error) {
        console.debug("Suspension check failed:", error);
        setIsSuspended(false);
      } finally {
        setLoading(false);
      }
    };

    checkSuspension();
  }, [user, isTester, authLoading, roleLoading]);

  return { isSuspended, suspendedAt, loading: loading || authLoading || roleLoading, inactivityDays: INACTIVITY_DAYS };
};
