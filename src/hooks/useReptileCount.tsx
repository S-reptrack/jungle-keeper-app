import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";

const FREE_TIER_LIMIT = 5;

export const useReptileCount = () => {
  const { user } = useAuth();
  const [count, setCount] = useState(0);
  const [loading, setLoading] = useState(true);

  const fetchCount = useCallback(async () => {
    if (!user) {
      setCount(0);
      setLoading(false);
      return;
    }

    try {
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
    return count < FREE_TIER_LIMIT;
  };

  const remainingSlots = (isSubscribed: boolean) => {
    if (isSubscribed) return Infinity;
    return Math.max(0, FREE_TIER_LIMIT - count);
  };

  return {
    count,
    loading,
    canAddReptile,
    remainingSlots,
    refreshCount: fetchCount,
    FREE_TIER_LIMIT,
  };
};
