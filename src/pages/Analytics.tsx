import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import Navigation from "@/components/Navigation";
import { PremiumFeatureGate } from "@/components/PremiumFeatureGate";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Navigate } from "react-router-dom";
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line, Legend
} from "recharts";
import { Activity, TrendingUp, Scale, Utensils } from "lucide-react";

interface AnalyticsData {
  reptilesByCategory: { name: string; count: number }[];
  reptilesBySpecies: { name: string; count: number }[];
  feedingsPerMonth: { month: string; count: number }[];
  weightEvolution: { date: string; avgWeight: number }[];
  healthStats: { resolved: number; active: number };
  reproductionStats: { hatchedTotal: number; stillbornTotal: number; unhatched: number };
}

const COLORS = ['hsl(var(--chart-1))', 'hsl(var(--chart-2))', 'hsl(var(--chart-3))', 'hsl(var(--chart-4))', 'hsl(var(--chart-5))'];

// Custom Tooltip Components
const CustomTooltip = ({ active, payload, label, valueLabel, unit }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-popover border border-border rounded-lg p-3 shadow-lg">
        <p className="font-medium text-foreground">{label}</p>
        <p className="text-primary">
          {valueLabel}: <span className="font-bold">{payload[0].value}{unit}</span>
        </p>
      </div>
    );
  }
  return null;
};

const CustomPieTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-popover border border-border rounded-lg p-3 shadow-lg">
        <p className="font-medium text-foreground">{payload[0].name}</p>
        <p className="text-primary">
          Nombre: <span className="font-bold">{payload[0].value}</span>
        </p>
      </div>
    );
  }
  return null;
};

const Analytics = () => {
  const { t } = useTranslation();
  const { user, loading: authLoading } = useAuth();
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchAnalytics();
    }
  }, [user]);

  const fetchAnalytics = async () => {
    try {
      // Fetch reptiles by category
      const { data: reptiles } = await supabase
        .from("reptiles")
        .select("category, species")
        .eq("user_id", user!.id)
        .in("status", ["active", "for_sale"]);

      const categoryCount: Record<string, number> = {};
      const speciesCount: Record<string, number> = {};
      
      (reptiles || []).forEach(r => {
        categoryCount[r.category] = (categoryCount[r.category] || 0) + 1;
        speciesCount[r.species] = (speciesCount[r.species] || 0) + 1;
      });

      const reptilesByCategory = Object.entries(categoryCount).map(([name, count]) => ({ name, count }));
      const reptilesBySpecies = Object.entries(speciesCount)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 10)
        .map(([name, count]) => ({ name, count }));

      // Fetch feedings per month (last 12 months)
      const twelveMonthsAgo = new Date();
      twelveMonthsAgo.setMonth(twelveMonthsAgo.getMonth() - 12);
      
      const { data: feedings } = await supabase
        .from("feedings")
        .select("feeding_date")
        .eq("user_id", user!.id)
        .gte("feeding_date", twelveMonthsAgo.toISOString().split('T')[0]);

      const feedingsByMonth: Record<string, number> = {};
      (feedings || []).forEach(f => {
        const monthKey = f.feeding_date.substring(0, 7);
        feedingsByMonth[monthKey] = (feedingsByMonth[monthKey] || 0) + 1;
      });

      const feedingsPerMonth = Object.entries(feedingsByMonth)
        .sort((a, b) => a[0].localeCompare(b[0]))
        .map(([month, count]) => ({ 
          month: new Date(month + "-01").toLocaleDateString("fr-FR", { month: "short", year: "2-digit" }), 
          count 
        }));

      // Fetch weight records evolution
      const { data: weights } = await supabase
        .from("weight_records")
        .select("measurement_date, weight")
        .eq("user_id", user!.id)
        .order("measurement_date", { ascending: true });

      const weightsByMonth: Record<string, number[]> = {};
      (weights || []).forEach(w => {
        const monthKey = w.measurement_date.substring(0, 7);
        if (!weightsByMonth[monthKey]) weightsByMonth[monthKey] = [];
        weightsByMonth[monthKey].push(Number(w.weight));
      });

      const weightEvolution = Object.entries(weightsByMonth)
        .map(([date, weights]) => ({
          date: new Date(date + "-01").toLocaleDateString("fr-FR", { month: "short", year: "2-digit" }),
          avgWeight: Math.round(weights.reduce((a, b) => a + b, 0) / weights.length)
        }));

      // Fetch health stats
      const { data: healthRecords } = await supabase
        .from("health_records")
        .select("resolved")
        .eq("user_id", user!.id);

      const healthStats = {
        resolved: (healthRecords || []).filter(h => h.resolved).length,
        active: (healthRecords || []).filter(h => !h.resolved).length
      };

      // Fetch reproduction stats
      const { data: reproData } = await supabase
        .from("reproduction_observations")
        .select("hatched_eggs, stillborn_juveniles, unhatched_eggs")
        .eq("user_id", user!.id)
        .eq("closed", true);

      const reproductionStats = {
        hatchedTotal: (reproData || []).reduce((acc, r) => acc + (r.hatched_eggs || 0), 0),
        stillbornTotal: (reproData || []).reduce((acc, r) => acc + (r.stillborn_juveniles || 0), 0),
        unhatched: (reproData || []).reduce((acc, r) => acc + (r.unhatched_eggs || 0), 0)
      };

      setData({
        reptilesByCategory,
        reptilesBySpecies,
        feedingsPerMonth,
        weightEvolution,
        healthStats,
        reproductionStats
      });
    } catch (error) {
      console.error("Error fetching analytics:", error);
    } finally {
      setLoading(false);
    }
  };

  if (authLoading) {
    return <div className="min-h-screen flex items-center justify-center">Chargement...</div>;
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <main className="max-w-7xl mx-auto px-4 py-8 md:pt-24 pb-24">
        <h1 className="text-3xl font-bold mb-8 flex items-center gap-2">
          <Activity className="w-8 h-8 text-primary" />
          {t("analytics.title")}
        </h1>

        <PremiumFeatureGate 
          featureName={t("analytics.title")}
          featureDescription={t("analytics.description")}
        >
          {loading ? (
            <div className="flex items-center justify-center min-h-[400px]">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : data && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Reptiles par catégorie */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">{t("analytics.byCategory")}</CardTitle>
                  <CardDescription>{t("analytics.distribution")}</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={250}>
                    <PieChart>
                      <Pie
                        data={data.reptilesByCategory}
                        dataKey="count"
                        nameKey="name"
                        cx="50%"
                        cy="50%"
                        outerRadius={80}
                        label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                      >
                        {data.reptilesByCategory.map((_, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip content={<CustomPieTooltip />} />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              {/* Top espèces */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">{t("analytics.topSpecies")}</CardTitle>
                  <CardDescription>{t("analytics.top10Species")}</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={250}>
                    <BarChart data={data.reptilesBySpecies} layout="vertical">
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis type="number" />
                      <YAxis dataKey="name" type="category" width={100} tick={{ fontSize: 12 }} />
                      <Tooltip content={<CustomTooltip valueLabel="Reptiles" unit="" />} />
                      <Bar dataKey="count" fill="hsl(var(--primary))" radius={[0, 4, 4, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              {/* Nourrissages par mois */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Utensils className="w-5 h-5" />
                    {t("analytics.feedingsPerMonth")}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={250}>
                    <BarChart data={data.feedingsPerMonth}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                      <YAxis />
                      <Tooltip content={<CustomTooltip valueLabel="Nourrissages" unit="" />} />
                      <Bar dataKey="count" fill="hsl(var(--chart-2))" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              {/* Evolution du poids moyen */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Scale className="w-5 h-5" />
                    {t("analytics.weightEvolution")}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={250}>
                    <LineChart data={data.weightEvolution}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                      <YAxis />
                      <Tooltip content={<CustomTooltip valueLabel="Poids moyen" unit=" g" />} />
                      <Line 
                        type="monotone" 
                        dataKey="avgWeight" 
                        stroke="hsl(var(--chart-3))" 
                        strokeWidth={2}
                        dot={{ fill: "hsl(var(--chart-3))" }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              {/* Stats de santé */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">{t("analytics.healthStats")}</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={250}>
                    <PieChart>
                      <Pie
                        data={[
                          { name: t("analytics.resolved"), value: data.healthStats.resolved },
                          { name: t("analytics.active"), value: data.healthStats.active }
                        ]}
                        dataKey="value"
                        nameKey="name"
                        cx="50%"
                        cy="50%"
                        outerRadius={80}
                        label
                      >
                        <Cell fill="hsl(var(--chart-4))" />
                        <Cell fill="hsl(var(--destructive))" />
                      </Pie>
                      <Tooltip content={<CustomPieTooltip />} />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              {/* Stats de reproduction */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <TrendingUp className="w-5 h-5" />
                    {t("analytics.reproductionStats")}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={250}>
                    <BarChart 
                      data={[
                        { name: t("analytics.hatched"), value: data.reproductionStats.hatchedTotal },
                        { name: t("analytics.stillborn"), value: data.reproductionStats.stillbornTotal },
                        { name: t("analytics.unhatched"), value: data.reproductionStats.unhatched }
                      ]}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip content={<CustomTooltip valueLabel="Nombre" unit="" />} />
                      <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                        <Cell fill="hsl(var(--chart-4))" />
                        <Cell fill="hsl(var(--destructive))" />
                        <Cell fill="hsl(var(--muted-foreground))" />
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>
          )}
        </PremiumFeatureGate>
      </main>
    </div>
  );
};

export default Analytics;
