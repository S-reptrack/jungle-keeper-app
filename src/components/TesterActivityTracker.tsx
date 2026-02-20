import { useEffect, useRef, useCallback } from "react";
import { useLocation } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

/**
 * Composant qui track automatiquement l'activité de tous les utilisateurs
 * Inclut le suivi du temps passé sur chaque page
 * Doit être placé à l'intérieur du BrowserRouter
 */
const TesterActivityTracker = () => {
  const { user } = useAuth();
  const location = useLocation();
  const lastTrackedPage = useRef<string | null>(null);
  const pageStartTime = useRef<number>(Date.now());
  const currentActivityId = useRef<string | null>(null);

  // Fonction pour mettre à jour la durée de session
  const updateSessionDuration = useCallback(async () => {
    if (!currentActivityId.current || !user) return;

    const duration = Math.floor((Date.now() - pageStartTime.current) / 1000);
    
    // Ne mettre à jour que si la durée est significative (> 1 seconde)
    if (duration > 1) {
      try {
        await supabase
          .from("tester_activity")
          .update({ session_duration: duration })
          .eq("id", currentActivityId.current);
      } catch (error) {
        console.debug("Session duration update failed:", error);
      }
    }
  }, [user]);

  // Tracker une nouvelle page
  useEffect(() => {
    if (!user) return;

    const trackPageView = async () => {
      const currentPath = location.pathname;
      
      // Si on change de page, mettre à jour la durée de la page précédente
      if (lastTrackedPage.current !== currentPath && currentActivityId.current) {
        await updateSessionDuration();
      }
      
      // Éviter de tracker la même page plusieurs fois de suite
      if (lastTrackedPage.current === currentPath) return;
      lastTrackedPage.current = currentPath;
      pageStartTime.current = Date.now();

      try {
        const { data, error } = await supabase
          .from("tester_activity")
          .insert({
            user_id: user.id,
            action_type: "page_view",
            action_details: { path: currentPath },
            page_url: currentPath,
          })
          .select("id")
          .single();

        if (!error && data) {
          currentActivityId.current = data.id;
        }
      } catch (error) {
        console.debug("Activity tracking failed:", error);
      }
    };

    trackPageView();
  }, [user, location.pathname, updateSessionDuration]);

  // Mettre à jour la durée quand l'utilisateur quitte la page
  useEffect(() => {
    const handleBeforeUnload = async () => {
      if (currentActivityId.current && user) {
        const duration = Math.floor((Date.now() - pageStartTime.current) / 1000);
        // Utiliser fetch keepalive avec authentification au lieu de sendBeacon sans auth
        const { data: sessionData } = await supabase.auth.getSession();
        const accessToken = sessionData?.session?.access_token;
        if (accessToken) {
          const url = `${import.meta.env.VITE_SUPABASE_URL}/rest/v1/tester_activity?id=eq.${currentActivityId.current}`;
          fetch(url, {
            method: 'PATCH',
            headers: {
              'Content-Type': 'application/json',
              'apikey': import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
              'Authorization': `Bearer ${accessToken}`,
              'Prefer': 'return=minimal',
            },
            body: JSON.stringify({ session_duration: duration }),
            keepalive: true,
          }).catch(() => {});
        }
      }
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden') {
        updateSessionDuration();
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      // Mettre à jour la durée quand le composant est démonté
      updateSessionDuration();
    };
  }, [user, updateSessionDuration]);

  // Mettre à jour périodiquement la durée (toutes les 30 secondes)
  useEffect(() => {
    if (!user) return;

    const interval = setInterval(() => {
      updateSessionDuration();
    }, 30000);

    return () => clearInterval(interval);
  }, [user, updateSessionDuration]);

  return null; // Ce composant ne rend rien visuellement
};

export default TesterActivityTracker;
