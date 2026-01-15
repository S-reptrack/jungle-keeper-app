import { useEffect, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";
import { useUserRole } from "./useUserRole";

// Hook pour tracker automatiquement l'activité des testeurs
export const useTesterActivity = () => {
  const { user } = useAuth();
  const { isTester, isAdmin } = useUserRole();
  const lastTrackedPage = useRef<string | null>(null);

  useEffect(() => {
    if (!user || (!isTester && !isAdmin)) return;

    const trackPageView = async () => {
      const currentPath = window.location.pathname;
      
      // Éviter de tracker la même page plusieurs fois de suite
      if (lastTrackedPage.current === currentPath) return;
      lastTrackedPage.current = currentPath;

      try {
        await supabase.from("tester_activity").insert({
          user_id: user.id,
          action_type: "page_view",
          action_details: { path: currentPath },
          page_url: currentPath,
        });
      } catch (error) {
        // Silently fail - don't disrupt user experience
        console.debug("Activity tracking failed:", error);
      }
    };

    trackPageView();
  }, [user, isTester, isAdmin, window.location.pathname]);

  // Fonction pour tracker des actions spécifiques
  const trackAction = async (actionType: string, details?: Record<string, any>) => {
    if (!user || (!isTester && !isAdmin)) return;

    try {
      await supabase.from("tester_activity").insert({
        user_id: user.id,
        action_type: actionType,
        action_details: details || {},
        page_url: window.location.pathname,
      });
    } catch (error) {
      console.debug("Activity tracking failed:", error);
    }
  };

  return { trackAction };
};
