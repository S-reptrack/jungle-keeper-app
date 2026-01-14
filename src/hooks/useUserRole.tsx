import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";

export type UserRole = "admin" | "tester" | "user" | null;

export const useUserRole = () => {
  const { user } = useAuth();
  const [role, setRole] = useState<UserRole>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserRole = async () => {
      if (!user) {
        setRole(null);
        setLoading(false);
        return;
      }

      try {
        const { data, error } = await supabase
          .from("user_roles")
          .select("role")
          .eq("user_id", user.id)
          .order("role", { ascending: false }); // admin avant user

        if (error) throw error;

        // Vérifier les rôles par ordre de priorité
        const isAdmin = data?.some((r) => r.role === "admin");
        const isTester = data?.some((r) => r.role === "tester");
        
        if (isAdmin) {
          setRole("admin");
        } else if (isTester) {
          setRole("tester");
        } else {
          setRole("user");
        }
      } catch (error) {
        console.error("Error fetching user role:", error);
        setRole("user"); // Par défaut, considérer comme user
      } finally {
        setLoading(false);
      }
    };

    fetchUserRole();
  }, [user]);

  return { 
    role, 
    loading, 
    isAdmin: role === "admin",
    isTester: role === "tester",
    canBypassMaintenance: role === "admin" || role === "tester"
  };
};
