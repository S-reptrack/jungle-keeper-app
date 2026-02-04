import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";
import { useSubscription } from "./useSubscription";

export const useBetaTester = () => {
  const { user, loading: authLoading } = useAuth();
  const { subscribed, loading: subLoading } = useSubscription();
  const [isBetaTester, setIsBetaTester] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (authLoading) return;

    const checkBetaTester = async () => {
      if (!user) {
        setIsBetaTester(false);
        setLoading(false);
        return;
      }

      try {
        const { data, error } = await supabase
          .from("user_roles")
          .select("role")
          .eq("user_id", user.id)
          .eq("role", "beta_tester");

        if (error) throw error;

        setIsBetaTester(data && data.length > 0);
      } catch (error) {
        console.error("[useBetaTester] Error:", error);
        setIsBetaTester(false);
      } finally {
        setLoading(false);
      }
    };

    checkBetaTester();
  }, [user, authLoading]);

  return {
    isBetaTester,
    // Un beta tester doit aussi être abonné
    canAccessBetaFeatures: isBetaTester && subscribed,
    loading: loading || authLoading || subLoading,
  };
};
