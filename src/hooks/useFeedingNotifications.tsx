import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Capacitor } from "@capacitor/core";

interface FeedingDueItem {
  reptileId: string;
  reptileName: string;
  daysUntil: number;
}

export const useFeedingNotifications = () => {
  const { user } = useAuth();
  const [feedingsDue, setFeedingsDue] = useState<FeedingDueItem[]>([]);
  const [overdueCount, setOverdueCount] = useState(0);
  const [todayCount, setTodayCount] = useState(0);
  const [totalDueCount, setTotalDueCount] = useState(0);
  const [loading, setLoading] = useState(true);

  const fetchFeedingsDue = useCallback(async () => {
    if (!user) return;

    try {
      const { data: reptilesWithInterval } = await supabase
        .from("reptiles")
        .select("id, name, feeding_interval_days")
        .eq("status", "active")
        .eq("user_id", user.id)
        .not("feeding_interval_days", "is", null);

      if (!reptilesWithInterval?.length) {
        setFeedingsDue([]);
        setOverdueCount(0);
        setTodayCount(0);
        setTotalDueCount(0);
        setLoading(false);
        return;
      }

      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const items: FeedingDueItem[] = [];

      for (const reptile of reptilesWithInterval) {
        const { data: lastFeeding } = await supabase
          .from("feedings")
          .select("feeding_date")
          .eq("reptile_id", reptile.id)
          .order("feeding_date", { ascending: false })
          .limit(1)
          .maybeSingle();

        let nextFeedingDate: Date;

        if (lastFeeding) {
          const lastDate = new Date(lastFeeding.feeding_date);
          lastDate.setHours(0, 0, 0, 0);
          nextFeedingDate = new Date(lastDate);
          nextFeedingDate.setDate(lastDate.getDate() + (reptile.feeding_interval_days || 0));
        } else {
          nextFeedingDate = today;
        }

        const diffDays = Math.floor(
          (nextFeedingDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
        );

        // Include if due within 3 days or overdue
        if (diffDays <= 3) {
          items.push({
            reptileId: reptile.id,
            reptileName: reptile.name,
            daysUntil: diffDays,
          });
        }
      }

      items.sort((a, b) => a.daysUntil - b.daysUntil);
      setFeedingsDue(items);
      setOverdueCount(items.filter((i) => i.daysUntil < 0).length);
      setTodayCount(items.filter((i) => i.daysUntil === 0).length);
      setTotalDueCount(items.length);

      // Schedule local push notifications on native
      if (Capacitor.isNativePlatform()) {
        schedulePushNotifications(items);
      }
    } catch (error) {
      console.error("Error fetching feeding notifications:", error);
    } finally {
      setLoading(false);
    }
  }, [user]);

  const schedulePushNotifications = async (items: FeedingDueItem[]) => {
    try {
      const { LocalNotifications } = await import("@capacitor/local-notifications");

      const { display } = await LocalNotifications.checkPermissions();
      if (display !== "granted") {
        const { display: newDisplay } = await LocalNotifications.requestPermissions();
        if (newDisplay !== "granted") return;
      }

      // Cancel previous feeding notifications
      const { notifications: pending } = await LocalNotifications.getPending();
      const feedingIds = pending
        .filter((n) => n.id >= 10000 && n.id < 20000)
        .map((n) => ({ id: n.id }));
      if (feedingIds.length > 0) {
        await LocalNotifications.cancel({ notifications: feedingIds });
      }

      // Schedule new notifications for overdue and today
      const urgentItems = items.filter((i) => i.daysUntil <= 0);
      if (urgentItems.length > 0) {
        const notifications = urgentItems.map((item, index) => {
          const body =
            item.daysUntil < 0
              ? `${item.reptileName} a un repas en retard de ${Math.abs(item.daysUntil)} jour(s) !`
              : `${item.reptileName} doit être nourri aujourd'hui`;

          return {
            id: 10000 + index,
            title: "🍽️ Repas à donner",
            body,
            schedule: { at: new Date(Date.now() + 1000) },
            smallIcon: "ic_stat_icon_config_sample",
            iconColor: "#4CAF50",
          };
        });

        await LocalNotifications.schedule({ notifications });
      }

      // Schedule reminder notifications for upcoming (1-3 days)
      const upcomingItems = items.filter((i) => i.daysUntil > 0 && i.daysUntil <= 3);
      if (upcomingItems.length > 0) {
        const upcomingNotifs = upcomingItems.map((item, index) => {
          const scheduleDate = new Date();
          scheduleDate.setDate(scheduleDate.getDate() + item.daysUntil);
          scheduleDate.setHours(8, 0, 0, 0); // 8h du matin

          return {
            id: 15000 + index,
            title: "🍽️ Repas prévu aujourd'hui",
            body: `${item.reptileName} doit être nourri aujourd'hui`,
            schedule: { at: scheduleDate },
            smallIcon: "ic_stat_icon_config_sample",
            iconColor: "#FF9800",
          };
        });

        await LocalNotifications.schedule({ notifications: upcomingNotifs });
      }
    } catch (error) {
      console.error("Error scheduling push notifications:", error);
    }
  };

  useEffect(() => {
    fetchFeedingsDue();
  }, [fetchFeedingsDue]);

  // Listen for feeding changes
  useEffect(() => {
    if (!user) return;

    const channel = supabase
      .channel("feeding-notifications")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "feedings" },
        () => fetchFeedingsDue()
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "reptiles" },
        () => fetchFeedingsDue()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, fetchFeedingsDue]);

  return {
    feedingsDue,
    overdueCount,
    todayCount,
    totalDueCount,
    loading,
    refresh: fetchFeedingsDue,
  };
};
