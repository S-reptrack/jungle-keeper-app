import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";
import { useSubscription } from "./useSubscription";
import { getGracePhase, FORMER_TESTER_VISIBLE_LIMIT } from "@/lib/formerTesterGrace";

/** Renvoie les ids visibles (5 plus anciens) si l'ancien testeur est verrouillé, sinon null. */
export const useFormerTesterLock = () => {
  const { user } = useAuth();
  const { testerTrialEnd, testerTrialExpired, subscribed } = useSubscription();
  const phase = testerTrialExpired && !subscribed ? getGracePhase(testerTrialEnd) : "none";
  const locked = phase === "locked";
  const [allowedIds, setAllowedIds] = useState<Set<string> | null>(null);

  useEffect(() => {
    if (!locked || !user) {
      setAllowedIds(null);
      return;
    }
    supabase
      .from("reptiles")
      .select("id")
      .eq("user_id", user.id)
      .in("status", ["active", "for_sale"])
      .order("created_at", { ascending: true })
      .limit(FORMER_TESTER_VISIBLE_LIMIT)
      .then(({ data }) => setAllowedIds(new Set((data || []).map((r) => r.id))));
  }, [locked, user]);

  const filterVisible = <T extends { id: string }>(list: T[]) =>
    allowedIds ? list.filter((r) => allowedIds.has(r.id)) : list;

  return { phase, locked, filterVisible };
};
