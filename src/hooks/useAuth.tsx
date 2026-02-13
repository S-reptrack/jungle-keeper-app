import { useEffect, useState, useRef } from "react";
import { User, Session } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const isMounted = useRef(true);

  useEffect(() => {
    isMounted.current = true;

    // 1. Set up listener FIRST (before getSession) to catch all changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        if (!isMounted.current) return;
        setSession(session);
        setUser(session?.user ?? null);
        // Do NOT control loading here - only initial load does
      }
    );

    // 2. THEN get initial session (controls loading)
    const initializeAuth = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!isMounted.current) return;
        setSession(session);
        setUser(session?.user ?? null);
      } catch (error) {
        console.error("[useAuth] Error getting session:", error);
      } finally {
        if (isMounted.current) setLoading(false);
      }
    };

    initializeAuth();

    return () => {
      isMounted.current = false;
      subscription.unsubscribe();
    };
  }, []);

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  return { user, session, loading, signOut };
};
