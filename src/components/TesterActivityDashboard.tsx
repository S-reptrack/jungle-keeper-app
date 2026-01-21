import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, Activity, Star, MessageSquare, Clock, TrendingUp, Egg, Scale, Heart, Utensils } from "lucide-react";
import { format, formatDistanceToNow } from "date-fns";
import { fr } from "date-fns/locale";

interface TesterUsageStats {
  user_id: string;
  email: string;
  reptiles_count: number;
  feedings_count: number;
  weights_count: number;
  health_count: number;
  reproduction_count: number;
  total_actions: number;
  last_activity: string | null;
  feedback_count: number;
  avg_rating: number;
}

interface FeedbackItem {
  id: string;
  user_id: string;
  rating: number;
  category: string;
  feedback: string;
  page_url: string | null;
  created_at: string;
  email?: string;
}

const categoryLabels: Record<string, string> = {
  bug: "Bug",
  ui: "Interface",
  feature: "Fonctionnalité",
  performance: "Performance",
  general: "Général",
};

const categoryColors: Record<string, string> = {
  bug: "bg-red-500/20 text-red-400",
  ui: "bg-blue-500/20 text-blue-400",
  feature: "bg-green-500/20 text-green-400",
  performance: "bg-orange-500/20 text-orange-400",
  general: "bg-gray-500/20 text-gray-400",
};

const TesterActivityDashboard = () => {
  const [loading, setLoading] = useState(true);
  const [testerStats, setTesterStats] = useState<TesterUsageStats[]>([]);
  const [recentFeedback, setRecentFeedback] = useState<FeedbackItem[]>([]);
  const [globalStats, setGlobalStats] = useState({
    totalReptiles: 0,
    totalFeedings: 0,
    totalWeights: 0,
    totalHealth: 0,
    totalReproduction: 0,
    totalFeedback: 0,
    avgRating: 0,
    activeTesters: 0,
  });

  const fetchData = async () => {
    setLoading(true);
    try {
      // Récupérer les testeurs avec leurs rôles
      const { data: testersData, error: testersError } = await supabase
        .from("user_roles")
        .select("user_id")
        .eq("role", "tester");

      if (testersError) throw testersError;

      const testerIds = testersData?.map((t) => t.user_id) || [];

      if (testerIds.length === 0) {
        setLoading(false);
        return;
      }

      // Récupérer les profils des testeurs
      const { data: profilesData } = await supabase
        .from("profiles")
        .select("user_id, email")
        .in("user_id", testerIds);

      const profileMap = new Map(
        profilesData?.map((p) => [p.user_id, p.email]) || []
      );

      // Récupérer les données d'utilisation réelle en parallèle
      const [
        reptilesResult,
        feedingsResult,
        weightsResult,
        healthResult,
        reproductionResult,
        feedbackResult
      ] = await Promise.all([
        supabase.from("reptiles").select("id, user_id, created_at, updated_at").in("user_id", testerIds),
        supabase.from("feedings").select("id, user_id, created_at").in("user_id", testerIds),
        supabase.from("weight_records").select("id, user_id, created_at").in("user_id", testerIds),
        supabase.from("health_records").select("id, user_id, created_at").in("user_id", testerIds),
        supabase.from("reproduction_observations").select("id, user_id, created_at").in("user_id", testerIds),
        supabase.from("tester_feedback").select("*").order("created_at", { ascending: false }),
      ]);

      const reptiles = reptilesResult.data || [];
      const feedings = feedingsResult.data || [];
      const weights = weightsResult.data || [];
      const health = healthResult.data || [];
      const reproduction = reproductionResult.data || [];
      const feedbacks = feedbackResult.data || [];

      // Calculer les stats par testeur
      const statsMap = new Map<string, TesterUsageStats>();

      for (const testerId of testerIds) {
        const testerReptiles = reptiles.filter((r) => r.user_id === testerId);
        const testerFeedings = feedings.filter((f) => f.user_id === testerId);
        const testerWeights = weights.filter((w) => w.user_id === testerId);
        const testerHealth = health.filter((h) => h.user_id === testerId);
        const testerRepro = reproduction.filter((r) => r.user_id === testerId);
        const testerFeedback = feedbacks.filter((f) => f.user_id === testerId);

        const avgRating = testerFeedback.length > 0
          ? testerFeedback.reduce((sum, f) => sum + f.rating, 0) / testerFeedback.length
          : 0;

        // Trouver la dernière activité
        const allDates = [
          ...testerReptiles.map(r => r.updated_at || r.created_at),
          ...testerFeedings.map(f => f.created_at),
          ...testerWeights.map(w => w.created_at),
          ...testerHealth.map(h => h.created_at),
          ...testerRepro.map(r => r.created_at),
        ].filter(Boolean).map(d => new Date(d).getTime());

        const lastActivity = allDates.length > 0 
          ? new Date(Math.max(...allDates)).toISOString() 
          : null;

        const totalActions = testerReptiles.length + testerFeedings.length + 
          testerWeights.length + testerHealth.length + testerRepro.length;

        statsMap.set(testerId, {
          user_id: testerId,
          email: profileMap.get(testerId) || "Email inconnu",
          reptiles_count: testerReptiles.length,
          feedings_count: testerFeedings.length,
          weights_count: testerWeights.length,
          health_count: testerHealth.length,
          reproduction_count: testerRepro.length,
          total_actions: totalActions,
          last_activity: lastActivity,
          feedback_count: testerFeedback.length,
          avg_rating: avgRating,
        });
      }

      // Trier par nombre d'actions décroissant
      const sortedStats = Array.from(statsMap.values()).sort(
        (a, b) => b.total_actions - a.total_actions
      );
      setTesterStats(sortedStats);

      // Ajouter l'email aux feedbacks récents
      const feedbackWithEmail = feedbacks.slice(0, 10).map((f) => ({
        ...f,
        email: profileMap.get(f.user_id) || "Email inconnu",
      }));
      setRecentFeedback(feedbackWithEmail);

      // Stats globales
      const activeTesters = sortedStats.filter(t => t.total_actions > 0).length;
      const avgRating = feedbacks.length > 0
        ? feedbacks.reduce((sum, f) => sum + f.rating, 0) / feedbacks.length
        : 0;

      setGlobalStats({
        totalReptiles: reptiles.length,
        totalFeedings: feedings.length,
        totalWeights: weights.length,
        totalHealth: health.length,
        totalReproduction: reproduction.length,
        totalFeedback: feedbacks.length,
        avgRating,
        activeTesters,
      });
    } catch (error) {
      console.error("Error fetching tester activity:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats globales d'utilisation */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-green-500/10">
                <Egg className="h-5 w-5 text-green-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">{globalStats.totalReptiles}</p>
                <p className="text-sm text-muted-foreground">Reptiles créés</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-orange-500/10">
                <Utensils className="h-5 w-5 text-orange-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">{globalStats.totalFeedings}</p>
                <p className="text-sm text-muted-foreground">Repas enregistrés</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-blue-500/10">
                <Scale className="h-5 w-5 text-blue-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">{globalStats.totalWeights}</p>
                <p className="text-sm text-muted-foreground">Pesées</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-red-500/10">
                <Heart className="h-5 w-5 text-red-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">{globalStats.totalHealth}</p>
                <p className="text-sm text-muted-foreground">Suivis santé</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Stats secondaires */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-pink-500/10">
                <Egg className="h-5 w-5 text-pink-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">{globalStats.totalReproduction}</p>
                <p className="text-sm text-muted-foreground">Observations repro</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <MessageSquare className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">{globalStats.totalFeedback}</p>
                <p className="text-sm text-muted-foreground">Feedbacks</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-yellow-500/10">
                <Star className="h-5 w-5 text-yellow-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">
                  {globalStats.avgRating.toFixed(1)}/5
                </p>
                <p className="text-sm text-muted-foreground">Note moyenne</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-purple-500/10">
                <TrendingUp className="h-5 w-5 text-purple-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">{globalStats.activeTesters}</p>
                <p className="text-sm text-muted-foreground">Testeurs actifs</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Classement des testeurs par utilisation */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Activity className="h-5 w-5 text-primary" />
            <CardTitle>Classement des testeurs</CardTitle>
          </div>
          <CardDescription>
            Basé sur l'utilisation réelle de l'application (reptiles, repas, pesées, santé)
          </CardDescription>
        </CardHeader>
        <CardContent>
          {testerStats.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">
              Aucun testeur enregistré
            </p>
          ) : (
            <div className="space-y-3">
              {testerStats.map((tester, index) => (
                <div
                  key={tester.user_id}
                  className={`flex flex-col md:flex-row md:items-center justify-between p-4 rounded-lg border ${
                    tester.total_actions > 0 
                      ? "bg-muted/50 border-border" 
                      : "bg-muted/20 border-dashed border-muted-foreground/30"
                  }`}
                >
                  <div className="flex items-center gap-3 mb-3 md:mb-0">
                    <div className={`flex items-center justify-center w-10 h-10 rounded-full text-sm font-bold ${
                      index === 0 ? "bg-yellow-500/20 text-yellow-500" :
                      index === 1 ? "bg-gray-400/20 text-gray-400" :
                      index === 2 ? "bg-orange-600/20 text-orange-600" :
                      "bg-muted text-muted-foreground"
                    }`}>
                      {index + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{tester.email}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-xs font-semibold text-primary">
                          {tester.total_actions} actions
                        </span>
                        {tester.avg_rating > 0 && (
                          <span className="flex items-center gap-1 text-xs text-yellow-500">
                            <Star className="h-3 w-3 fill-current" />
                            {tester.avg_rating.toFixed(1)}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex flex-wrap gap-2 md:gap-3">
                    <Badge variant="outline" className="flex items-center gap-1 bg-green-500/10 text-green-600 border-green-500/30">
                      <Egg className="h-3 w-3" />
                      {tester.reptiles_count}
                    </Badge>
                    <Badge variant="outline" className="flex items-center gap-1 bg-orange-500/10 text-orange-600 border-orange-500/30">
                      <Utensils className="h-3 w-3" />
                      {tester.feedings_count}
                    </Badge>
                    <Badge variant="outline" className="flex items-center gap-1 bg-blue-500/10 text-blue-600 border-blue-500/30">
                      <Scale className="h-3 w-3" />
                      {tester.weights_count}
                    </Badge>
                    <Badge variant="outline" className="flex items-center gap-1 bg-red-500/10 text-red-600 border-red-500/30">
                      <Heart className="h-3 w-3" />
                      {tester.health_count}
                    </Badge>
                    {tester.last_activity && (
                      <div className="flex items-center gap-1 text-xs text-muted-foreground ml-auto">
                        <Clock className="h-3 w-3" />
                        {formatDistanceToNow(new Date(tester.last_activity), {
                          addSuffix: true,
                          locale: fr,
                        })}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Feedbacks récents */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5 text-primary" />
            <CardTitle>Feedbacks récents</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          {recentFeedback.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">
              Aucun feedback reçu
            </p>
          ) : (
            <div className="space-y-4">
              {recentFeedback.map((item) => (
                <div
                  key={item.id}
                  className="p-4 border rounded-lg space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium">{item.email}</span>
                      <Badge
                        variant="outline"
                        className={categoryColors[item.category] || ""}
                      >
                        {categoryLabels[item.category] || item.category}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                          key={star}
                          className={`h-3 w-3 ${
                            star <= item.rating
                              ? "fill-yellow-400 text-yellow-400"
                              : "text-muted-foreground"
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground">{item.feedback}</p>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Clock className="h-3 w-3" />
                    {format(new Date(item.created_at), "dd MMM yyyy à HH:mm", {
                      locale: fr,
                    })}
                    {item.page_url && (
                      <span className="text-primary">• {item.page_url}</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default TesterActivityDashboard;
