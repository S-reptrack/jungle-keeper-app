import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";

export interface HatchingNotification {
  id: string;
  reptileName: string;
  reptileId: string;
  daysUntilHatch: number;
  expectedHatchDate: string;
  partnerName?: string;
}

export function useHatchingNotifications() {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<HatchingNotification[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setNotifications([]);
      setLoading(false);
      return;
    }

    const fetchNotifications = async () => {
      setLoading(true);
      
      const { data: observations, error } = await supabase
        .from("reproduction_observations")
        .select(`
          id,
          expected_hatch_date,
          notification_days_before,
          reptile_id,
          partner_id,
          reptiles!reproduction_observations_reptile_id_fkey (
            id,
            name,
            sex
          )
        `)
        .eq("user_id", user.id)
        .not("expected_hatch_date", "is", null);

      if (error) {
        console.error("Error fetching notifications:", error);
        setLoading(false);
        return;
      }

      if (!observations || observations.length === 0) {
        setNotifications([]);
        setLoading(false);
        return;
      }

      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const upcomingHatches: HatchingNotification[] = [];

      for (const obs of observations) {
        const hatchDate = new Date(obs.expected_hatch_date);
        hatchDate.setHours(0, 0, 0, 0);
        
        const diffTime = hatchDate.getTime() - today.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        
        const notificationThreshold = obs.notification_days_before || 7;
        
        // Only show if within notification threshold and in the future
        if (diffDays >= 0 && diffDays <= notificationThreshold) {
          const reptile = obs.reptiles as any;
          
          // Only show for female reptiles
          if (reptile?.sex === "female") {
            // Get partner name if available
            let partnerName: string | undefined;
            if (obs.partner_id) {
              const { data: partner } = await supabase
                .from("reptiles")
                .select("name")
                .eq("id", obs.partner_id)
                .single();
              
              partnerName = partner?.name;
            }

            upcomingHatches.push({
              id: obs.id,
              reptileName: reptile.name,
              reptileId: reptile.id,
              daysUntilHatch: diffDays,
              expectedHatchDate: obs.expected_hatch_date,
              partnerName,
            });
          }
        }
      }

      // Sort by days until hatch (closest first)
      upcomingHatches.sort((a, b) => a.daysUntilHatch - b.daysUntilHatch);
      
      setNotifications(upcomingHatches);
      setLoading(false);
    };

    fetchNotifications();
  }, [user]);

  return { notifications, loading };
}
