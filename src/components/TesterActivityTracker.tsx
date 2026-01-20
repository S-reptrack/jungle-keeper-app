import { useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useUserRole } from "@/hooks/useUserRole";

/**
 * Composant qui track automatiquement l'activité des testeurs et admins
 * Doit être placé à l'intérieur du BrowserRouter
 */
const TesterActivityTracker = () => {
  const { user } = useAuth();
  const { isTester, isAdmin } = useUserRole();
  const location = useLocation();
  const lastTrackedPage = useRef<string | null>(null);

  useEffect(() => {
    if (!user || (!isTester && !isAdmin)) return;

    const trackPageView = async () => {
      const currentPath = location.pathname;
      
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
  }, [user, isTester, isAdmin, location.pathname]);

  return null; // Ce composant ne rend rien visuellement
};

export default TesterActivityTracker;
