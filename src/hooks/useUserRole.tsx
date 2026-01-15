import { useState, useEffect, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";

export type UserRole = "admin" | "tester" | "user" | null;

export const useUserRole = () => {
  const { user, loading: authLoading } = useAuth();
  const [role, setRole] = useState<UserRole>(null);
  const [loading, setLoading] = useState(true);
  const lastUserId = useRef<string | null>(null);

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
        setLoading(false);
        lastUserId.current = null;
        return;
      }

      // Éviter de recharger si c'est le même utilisateur et qu'on a déjà un rôle
      if (lastUserId.current === user.id && role !== null) {
        console.log("[useUserRole] Same user, keeping current role:", role);
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

        // Vérifier les rôles par ordre de priorité
        const hasAdminRole = data?.some((r) => r.role === "admin");
        const hasTesterRole = data?.some((r) => r.role === "tester");
        
        console.log("[useUserRole] Roles found:", { hasAdminRole, hasTesterRole, allRoles: data });
        
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
      } finally {
        setLoading(false);
      }
    };

    fetchUserRole();
  }, [user, authLoading]);

  return { 
    role, 
    loading: loading || authLoading, 
    isAdmin: role === "admin",
    isTester: role === "tester",
    canBypassMaintenance: role === "admin" // Seuls les admins peuvent contourner la maintenance
  };
};
