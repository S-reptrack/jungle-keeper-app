import { useState, useEffect, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";

export type UserRole = "admin" | "tester" | "beta_tester" | "user" | null;

export const useUserRole = () => {
  const { user, loading: authLoading } = useAuth();
  const [role, setRole] = useState<UserRole>(null);
  const [isBetaTester, setIsBetaTester] = useState(false);
  const [loading, setLoading] = useState(true);
  const lastUserId = useRef<string | null>(null);
  const hasChecked = useRef(false);

  useEffect(() => {
    // Attendre que l'auth soit prête
    if (authLoading) {
      console.log("[useUserRole] Auth still loading, waiting...");
      return;
    }

    const fetchUserRole = async () => {
      if (!user) {
        console.log("[useUserRole] No user, setting role to null");
        setRole(null);
        setIsBetaTester(false);
        setLoading(false);
        lastUserId.current = null;
        hasChecked.current = true;
        return;
      }

      // Éviter de recharger si c'est le même utilisateur et qu'on a déjà vérifié
      if (lastUserId.current === user.id && hasChecked.current) {
        console.log("[useUserRole] Same user already checked, keeping current role:", role);
        setLoading(false);
        return;
      }

      console.log("[useUserRole] Fetching role for user:", user.id, user.email);
      setLoading(true);

      try {
        const { data, error } = await supabase
          .from("user_roles")
          .select("role")
          .eq("user_id", user.id);

        console.log("[useUserRole] Query result:", { data, error });

        if (error) {
          console.error("[useUserRole] Error:", error);
          throw error;
        }

        lastUserId.current = user.id;
        hasChecked.current = true;

        // Vérifier les rôles par ordre de priorité
        const hasAdminRole = data?.some((r) => r.role === "admin");
        const hasTesterRole = data?.some((r) => r.role === "tester");
        const hasBetaTesterRole = data?.some((r) => r.role === "beta_tester");
        
        console.log("[useUserRole] Roles found:", { hasAdminRole, hasTesterRole, hasBetaTesterRole, allRoles: data });
        
        setIsBetaTester(hasBetaTesterRole);
        
        if (hasAdminRole) {
          console.log("[useUserRole] Setting role to admin");
          setRole("admin");
        } else if (hasTesterRole) {
          console.log("[useUserRole] Setting role to tester");
          setRole("tester");
        } else {
          console.log("[useUserRole] Setting role to user (default)");
          setRole("user");
        }
      } catch (error) {
        console.error("[useUserRole] Error fetching user role:", error);
        setRole("user"); // Par défaut, considérer comme user
        hasChecked.current = true;
      } finally {
        setLoading(false);
      }
    };

    fetchUserRole();
  }, [user, authLoading]);

  // Reset hasChecked when user changes
  useEffect(() => {
    if (user?.id !== lastUserId.current) {
      hasChecked.current = false;
    }
  }, [user?.id]);

  return { 
    role, 
    loading: loading || authLoading, 
    isAdmin: role === "admin",
    isTester: role === "tester",
    isBetaTester,
    canBypassMaintenance: role === "admin" || role === "tester"
  };
};
