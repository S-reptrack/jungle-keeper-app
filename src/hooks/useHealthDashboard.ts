import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

export interface HealthAlert {
  id: string;
  reptileId: string;
  reptileName: string;
  reptileSpecies: string;
  reptileImage?: string | null;
  type: "weight_loss" | "overdue_shedding" | "feeding_refused" | "overdue_feeding" | "health_issue";
  severity: "warning" | "danger" | "info";
  message: string;
  detail: string;
  date?: string;
}

export interface ReptileHealthSummary {
  id: string;
  name: string;
  species: string;
  image_url: string | null;
  status: "good" | "warning" | "danger";
  alerts: HealthAlert[];
  lastFeeding: string | null;
  lastShedding: string | null;
  lastWeight: { weight: number; date: string } | null;
  previousWeight: { weight: number; date: string } | null;
  unresolvedHealthIssues: number;
}

export const useHealthDashboard = () => {
  const { user } = useAuth();
  const [alerts, setAlerts] = useState<HealthAlert[]>([]);
  const [summaries, setSummaries] = useState<ReptileHealthSummary[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchHealthData = useCallback(async () => {
    if (!user) return;
    setLoading(true);

    try {
      // Fetch all active reptiles
      const { data: reptiles } = await supabase
        .from("reptiles")
        .select("id, name, species, image_url, feeding_interval_days, status")
        .eq("user_id", user.id)
        .eq("status", "active")
        .order("name");

      if (!reptiles?.length) {
        setAlerts([]);
        setSummaries([]);
        setLoading(false);
        return;
      }

      const reptileIds = reptiles.map(r => r.id);
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      // Fetch latest feedings for all reptiles
      const { data: feedings } = await supabase
        .from("feedings")
        .select("reptile_id, feeding_date, notes")
        .in("reptile_id", reptileIds)
        .order("feeding_date", { ascending: false });

      // Fetch latest shedding records
      const { data: sheddings } = await supabase
        .from("shedding_records")
        .select("reptile_id, shedding_date, quality")
        .in("reptile_id", reptileIds)
        .order("shedding_date", { ascending: false });

      // Fetch latest weight records (last 2 per reptile for trend)
      const { data: weights } = await supabase
        .from("weight_records")
        .select("reptile_id, weight, measurement_date")
        .in("reptile_id", reptileIds)
        .order("measurement_date", { ascending: false });

      // Fetch unresolved health issues
      const { data: healthIssues } = await supabase
        .from("health_records")
        .select("reptile_id, condition, diagnosis_date, resolved")
        .in("reptile_id", reptileIds)
        .eq("resolved", false);

      const allAlerts: HealthAlert[] = [];
      const allSummaries: ReptileHealthSummary[] = [];

      for (const reptile of reptiles) {
        const reptileAlerts: HealthAlert[] = [];

        // Last feeding
        const reptileFeedings = feedings?.filter(f => f.reptile_id === reptile.id) || [];
        const lastFeeding = reptileFeedings[0] || null;

        // Overdue feeding check
        if (reptile.feeding_interval_days && lastFeeding) {
          const lastDate = new Date(lastFeeding.feeding_date);
          lastDate.setHours(0, 0, 0, 0);
          const nextDate = new Date(lastDate);
          nextDate.setDate(lastDate.getDate() + reptile.feeding_interval_days);
          const daysDiff = Math.floor((today.getTime() - nextDate.getTime()) / (1000 * 60 * 60 * 24));
          
          if (daysDiff > 3) {
            reptileAlerts.push({
              id: `feed-${reptile.id}`,
              reptileId: reptile.id,
              reptileName: reptile.name,
              reptileSpecies: reptile.species,
              reptileImage: reptile.image_url,
              type: "overdue_feeding",
              severity: daysDiff > 7 ? "danger" : "warning",
              message: `Repas en retard de ${daysDiff} jours`,
              detail: `Dernier repas le ${new Date(lastFeeding.feeding_date).toLocaleDateString("fr-FR")}`,
              date: lastFeeding.feeding_date,
            });
          }
        }

        // Feeding refusal detection (notes containing "refus" or no eating pattern)
        const recentFeedings = reptileFeedings.slice(0, 5);
        const refusals = recentFeedings.filter(f => 
          f.notes?.toLowerCase().includes("refus") || 
          f.notes?.toLowerCase().includes("refuse") ||
          f.notes?.toLowerCase().includes("pas mangé") ||
          f.notes?.toLowerCase().includes("rejected")
        );
        if (refusals.length >= 2) {
          reptileAlerts.push({
            id: `refuse-${reptile.id}`,
            reptileId: reptile.id,
            reptileName: reptile.name,
            reptileSpecies: reptile.species,
            reptileImage: reptile.image_url,
            type: "feeding_refused",
            severity: refusals.length >= 3 ? "danger" : "warning",
            message: `${refusals.length} refus alimentaires récents`,
            detail: "Plusieurs refus de nourriture détectés dans les derniers repas",
          });
        }

        // Shedding check
        const reptileSheddings = sheddings?.filter(s => s.reptile_id === reptile.id) || [];
        const lastShedding = reptileSheddings[0] || null;

        if (lastShedding) {
          const lastSheddingDate = new Date(lastShedding.shedding_date);
          const daysSinceShedding = Math.floor((today.getTime() - lastSheddingDate.getTime()) / (1000 * 60 * 60 * 24));
          
          // Alert if no shedding in 90+ days (snakes typically shed every 4-8 weeks)
          if (daysSinceShedding > 90) {
            reptileAlerts.push({
              id: `shed-${reptile.id}`,
              reptileId: reptile.id,
              reptileName: reptile.name,
              reptileSpecies: reptile.species,
              reptileImage: reptile.image_url,
              type: "overdue_shedding",
              severity: daysSinceShedding > 120 ? "danger" : "warning",
              message: `Pas de mue depuis ${daysSinceShedding} jours`,
              detail: `Dernière mue le ${lastSheddingDate.toLocaleDateString("fr-FR")}`,
              date: lastShedding.shedding_date,
            });
          }

          // Bad shedding quality
          if (lastShedding.quality === "partial" || lastShedding.quality === "bad") {
            reptileAlerts.push({
              id: `shed-quality-${reptile.id}`,
              reptileId: reptile.id,
              reptileName: reptile.name,
              reptileSpecies: reptile.species,
              reptileImage: reptile.image_url,
              type: "overdue_shedding",
              severity: "warning",
              message: `Dernière mue de mauvaise qualité`,
              detail: `Mue ${lastShedding.quality === "partial" ? "partielle" : "problématique"} le ${lastSheddingDate.toLocaleDateString("fr-FR")}`,
              date: lastShedding.shedding_date,
            });
          }
        }

        // Weight trend check
        const reptileWeights = weights?.filter(w => w.reptile_id === reptile.id) || [];
        const lastWeight = reptileWeights[0] || null;
        const previousWeight = reptileWeights[1] || null;

        if (lastWeight && previousWeight) {
          const weightChange = ((lastWeight.weight - previousWeight.weight) / previousWeight.weight) * 100;
          
          if (weightChange < -10) {
            reptileAlerts.push({
              id: `weight-${reptile.id}`,
              reptileId: reptile.id,
              reptileName: reptile.name,
              reptileSpecies: reptile.species,
              reptileImage: reptile.image_url,
              type: "weight_loss",
              severity: weightChange < -20 ? "danger" : "warning",
              message: `Perte de poids de ${Math.abs(Math.round(weightChange))}%`,
              detail: `${previousWeight.weight}g → ${lastWeight.weight}g`,
              date: lastWeight.measurement_date,
            });
          }
        }

        // Unresolved health issues
        const reptileHealthIssues = healthIssues?.filter(h => h.reptile_id === reptile.id) || [];
        if (reptileHealthIssues.length > 0) {
          for (const issue of reptileHealthIssues) {
            reptileAlerts.push({
              id: `health-${issue.reptile_id}-${issue.condition}`,
              reptileId: reptile.id,
              reptileName: reptile.name,
              reptileSpecies: reptile.species,
              reptileImage: reptile.image_url,
              type: "health_issue",
              severity: "danger",
              message: `Problème non résolu : ${issue.condition}`,
              detail: `Diagnostiqué le ${new Date(issue.diagnosis_date).toLocaleDateString("fr-FR")}`,
              date: issue.diagnosis_date,
            });
          }
        }

        // Determine overall status
        const hasDanger = reptileAlerts.some(a => a.severity === "danger");
        const hasWarning = reptileAlerts.some(a => a.severity === "warning");
        const status = hasDanger ? "danger" : hasWarning ? "warning" : "good";

        allAlerts.push(...reptileAlerts);
        allSummaries.push({
          id: reptile.id,
          name: reptile.name,
          species: reptile.species,
          image_url: reptile.image_url,
          status,
          alerts: reptileAlerts,
          lastFeeding: lastFeeding?.feeding_date || null,
          lastShedding: lastShedding?.shedding_date || null,
          lastWeight: lastWeight ? { weight: Number(lastWeight.weight), date: lastWeight.measurement_date } : null,
          previousWeight: previousWeight ? { weight: Number(previousWeight.weight), date: previousWeight.measurement_date } : null,
          unresolvedHealthIssues: reptileHealthIssues.length,
        });
      }

      // Sort alerts: danger first, then warning
      allAlerts.sort((a, b) => {
        const severityOrder = { danger: 0, warning: 1, info: 2 };
        return severityOrder[a.severity] - severityOrder[b.severity];
      });

      // Sort summaries: problems first
      allSummaries.sort((a, b) => {
        const statusOrder = { danger: 0, warning: 1, good: 2 };
        return statusOrder[a.status] - statusOrder[b.status];
      });

      setAlerts(allAlerts);
      setSummaries(allSummaries);
    } catch (error) {
      console.error("Error fetching health dashboard:", error);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchHealthData();
  }, [fetchHealthData]);

  // Real-time updates
  useEffect(() => {
    if (!user) return;

    const channel = supabase
      .channel("health-dashboard")
      .on("postgres_changes", { event: "*", schema: "public", table: "feedings" }, () => fetchHealthData())
      .on("postgres_changes", { event: "*", schema: "public", table: "weight_records" }, () => fetchHealthData())
      .on("postgres_changes", { event: "*", schema: "public", table: "shedding_records" }, () => fetchHealthData())
      .on("postgres_changes", { event: "*", schema: "public", table: "health_records" }, () => fetchHealthData())
      .on("postgres_changes", { event: "*", schema: "public", table: "reptiles" }, () => fetchHealthData())
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [user, fetchHealthData]);

  const stats = {
    total: summaries.length,
    healthy: summaries.filter(s => s.status === "good").length,
    warnings: summaries.filter(s => s.status === "warning").length,
    critical: summaries.filter(s => s.status === "danger").length,
    totalAlerts: alerts.length,
  };

  return { alerts, summaries, stats, loading, refresh: fetchHealthData };
};
