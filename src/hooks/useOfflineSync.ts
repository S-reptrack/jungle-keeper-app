import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { 
  cacheReptiles, cacheFeedings, getCachedReptiles, getCachedFeedings,
  getPendingActions, removePendingAction, isOnline, getPendingCount, getLastCacheDate
} from "@/lib/offlineStorage";
import { toast } from "sonner";

export const useOfflineSync = () => {
  const { user } = useAuth();
  const [online, setOnline] = useState(isOnline());
  const [syncing, setSyncing] = useState(false);
  const [pendingCount, setPendingCount] = useState(0);
  const [lastCached, setLastCached] = useState<string | null>(getLastCacheDate());

  // Monitor online/offline status
  useEffect(() => {
    const handleOnline = () => {
      setOnline(true);
      toast.success("Connexion rétablie", { description: "Synchronisation en cours..." });
      syncPendingActions();
    };
    const handleOffline = () => {
      setOnline(false);
      toast.warning("Mode hors ligne", { description: "Vos données sont disponibles localement" });
    };

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);
    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  // Update pending count periodically
  useEffect(() => {
    const updateCount = async () => {
      const count = await getPendingCount();
      setPendingCount(count);
    };
    updateCount();
    const interval = setInterval(updateCount, 10000);
    return () => clearInterval(interval);
  }, []);

  // Cache data when online and user is logged in
  const cacheAllData = useCallback(async () => {
    if (!user || !isOnline()) return;

    try {
      const [reptilesRes, feedingsRes] = await Promise.all([
        supabase.from("reptiles").select("*").eq("user_id", user.id).eq("status", "active"),
        supabase.from("feedings").select("*").eq("user_id", user.id).order("feeding_date", { ascending: false }).limit(500),
      ]);

      if (reptilesRes.data) await cacheReptiles(reptilesRes.data);
      if (feedingsRes.data) await cacheFeedings(feedingsRes.data);
      
      setLastCached(new Date().toISOString());
    } catch (e) {
      console.warn("Failed to cache data:", e);
    }
  }, [user]);

  // Auto-cache on login and periodically
  useEffect(() => {
    if (user && online) {
      cacheAllData();
      const interval = setInterval(cacheAllData, 5 * 60 * 1000); // Every 5 min
      return () => clearInterval(interval);
    }
  }, [user, online, cacheAllData]);

  // Sync pending actions when back online
  const syncPendingActions = useCallback(async () => {
    if (!isOnline() || syncing) return;
    setSyncing(true);

    try {
      const actions = await getPendingActions();
      let syncedCount = 0;

      for (const action of actions) {
        try {
          if (action.operation === "insert") {
            const { error } = await supabase.from(action.table as any).insert(action.data as any);
            if (!error) {
              await removePendingAction(action.id);
              syncedCount++;
            }
          } else if (action.operation === "update") {
            const { id: recordId, ...updateData } = action.data;
            const { error } = await supabase.from(action.table as any).update(updateData as any).eq("id", recordId as string);
            if (!error) {
              await removePendingAction(action.id);
              syncedCount++;
            }
          } else if (action.operation === "delete") {
            const { error } = await supabase.from(action.table as any).delete().eq("id", action.data.id as string);
            if (!error) {
              await removePendingAction(action.id);
              syncedCount++;
            }
          }
        } catch (e) {
          console.warn("Failed to sync action:", action.id, e);
        }
      }

      if (syncedCount > 0) {
        toast.success(`${syncedCount} modification${syncedCount > 1 ? "s" : ""} synchronisée${syncedCount > 1 ? "s" : ""}`);
        await cacheAllData(); // Refresh cache after sync
      }

      const remaining = await getPendingCount();
      setPendingCount(remaining);
    } catch (e) {
      console.warn("Sync failed:", e);
    } finally {
      setSyncing(false);
    }
  }, [syncing, cacheAllData]);

  return {
    online,
    syncing,
    pendingCount,
    lastCached,
    cacheAllData,
    syncPendingActions,
    getCachedReptiles,
    getCachedFeedings,
  };
};
