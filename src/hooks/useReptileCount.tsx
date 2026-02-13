import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";

const FREE_TIER_LIMIT = 5;

export const useReptileCount = () => {
  const { user } = useAuth();
  const [count, setCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [isExpiredTester, setIsExpiredTester] = useState(false);

  const fetchCount = useCallback(async () => {
    if (!user) {
      setCount(0);
      setLoading(false);
      return;
    }

    try {
      // Check if user is an expired tester (trial ended, no subscription)
      const { data: roleData } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", user.id)
        .eq("role", "tester")
        .maybeSingle();

      if (roleData) {
        const { data: profile } = await supabase
          .from("profiles")
          .select("email")
          .eq("user_id", user.id)
          .maybeSingle();

        if (profile?.email) {
          const { data: invitation } = await supabase
            .from("tester_invitations")
            .select("trial_end_date, suspended")
            .eq("email", profile.email)
            .eq("status", "accepted")
            .maybeSingle();

          const trialEndDate = invitation?.trial_end_date;
          const isExpired = trialEndDate ? new Date(trialEndDate) < new Date() : false;
          const isSuspended = invitation?.suspended || false;

          // Expired tester who is not suspended = free tier but no reptile limit, just can't add new ones
          setIsExpiredTester(isExpired && !isSuspended);
        }
      }

      const { count: reptileCount, error } = await supabase
        .from("reptiles")
        .select("*", { count: "exact", head: true })
        .eq("user_id", user.id)
        .in("status", ["active", "for_sale"]);

      if (error) throw error;
      setCount(reptileCount || 0);
    } catch (error) {
      console.error("Error fetching reptile count:", error);
      setCount(0);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchCount();
  }, [fetchCount]);

  const canAddReptile = (isSubscribed: boolean) => {
    if (isSubscribed) return true;
    // Expired testers cannot add new reptiles but keep existing ones
    if (isExpiredTester) return false;
    return count < FREE_TIER_LIMIT;
  };

  const remainingSlots = (isSubscribed: boolean) => {
    if (isSubscribed) return Infinity;
    // Expired testers have 0 remaining slots
    if (isExpiredTester) return 0;
    return Math.max(0, FREE_TIER_LIMIT - count);
  };

  return {
    count,
    loading,
    canAddReptile,
    remainingSlots,
    refreshCount: fetchCount,
    FREE_TIER_LIMIT,
    isExpiredTester,
  };
};
