import { createContext, useCallback, useContext, useEffect, useRef, useState, type ReactNode } from "react";
import { User, Session } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import { Capacitor } from "@capacitor/core";
import { App as CapacitorApp } from "@capacitor/app";

type AuthContextValue = {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const isMounted = useRef(true);

  const syncSession = useCallback(async (keepLoading = false) => {
    if (!keepLoading && isMounted.current) {
      setLoading(true);
    }

    try {
      const { data: { session } } = await supabase.auth.getSession();

      if (!isMounted.current) return;

      setSession(session);
      setUser(session?.user ?? null);

      if (session) {
        await supabase.auth.refreshSession();
      }
    } catch (error) {
      console.error("[useAuth] Error syncing session:", error);
    } finally {
      if (isMounted.current) {
        setLoading(false);
      }
    }
  }, []);

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
    syncSession(true);

    let appStateListener: { remove: () => Promise<void> } | null = null;

    if (Capacitor.isNativePlatform()) {
      CapacitorApp.addListener("appStateChange", ({ isActive }) => {
        if (isActive) {
          void syncSession();
        }
      }).then((listener) => {
        appStateListener = listener;
      }).catch((error) => {
        console.error("[useAuth] Error attaching appStateChange listener:", error);
      });
    }

    return () => {
      isMounted.current = false;
      subscription.unsubscribe();
      if (appStateListener) {
        void appStateListener.remove();
      }
    };
  }, [syncSession]);

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  return (
    <AuthContext.Provider value={{ user, session, loading, signOut }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }

  return context;
};
