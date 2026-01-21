import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, Activity, Star, MessageSquare, Clock, TrendingUp, Timer } from "lucide-react";
import { format, formatDistanceToNow } from "date-fns";
import { fr } from "date-fns/locale";

interface TesterStats {
  user_id: string;
  email: string;
  total_feedback: number;
  avg_rating: number;
  last_activity: string | null;
  activity_count: number;
  total_time_seconds: number;
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

// Fonction pour formater le temps en heures, minutes, secondes
const formatDuration = (seconds: number): string => {
  if (seconds < 60) {
    return `${seconds}s`;
  }
  
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;
  
  if (hours > 0) {
    return `${hours}h ${minutes}m`;
  }
  
  return `${minutes}m ${secs}s`;
};

const TesterActivityDashboard = () => {
  const [loading, setLoading] = useState(true);
  const [testerStats, setTesterStats] = useState<TesterStats[]>([]);
  const [recentFeedback, setRecentFeedback] = useState<FeedbackItem[]>([]);
  const [globalStats, setGlobalStats] = useState({
    totalFeedback: 0,
    avgRating: 0,
    activeTesters: 0,
    totalTimeSpent: 0,
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

      // Récupérer tous les feedbacks
      const { data: feedbackData, error: feedbackError } = await supabase
        .from("tester_feedback")
        .select("*")
        .order("created_at", { ascending: false });

      if (feedbackError) throw feedbackError;

      // Récupérer les activités avec la durée de session
      const { data: activityData } = await supabase
        .from("tester_activity")
        .select("user_id, created_at, session_duration")
        .in("user_id", testerIds);

      // Calculer les stats par testeur
      const statsMap = new Map<string, TesterStats>();
      let totalGlobalTime = 0;

      for (const testerId of testerIds) {
        const testerFeedback = feedbackData?.filter((f) => f.user_id === testerId) || [];
        const testerActivity = activityData?.filter((a) => a.user_id === testerId) || [];
        
        const avgRating = testerFeedback.length > 0
          ? testerFeedback.reduce((sum, f) => sum + f.rating, 0) / testerFeedback.length
          : 0;

        const lastFeedback = testerFeedback[0]?.created_at;
        const lastActivityDate = testerActivity.sort((a, b) => 
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        )[0]?.created_at;

        const lastActivity = lastFeedback && lastActivityDate
          ? new Date(lastFeedback) > new Date(lastActivityDate) ? lastFeedback : lastActivityDate
          : lastFeedback || lastActivityDate;

        // Calculer le temps total passé
        const totalTimeSeconds = testerActivity.reduce((sum, a) => {
          return sum + ((a as any).session_duration || 0);
        }, 0);

        totalGlobalTime += totalTimeSeconds;

        statsMap.set(testerId, {
          user_id: testerId,
          email: profileMap.get(testerId) || "Email inconnu",
          total_feedback: testerFeedback.length,
          avg_rating: avgRating,
          last_activity: lastActivity || null,
          activity_count: testerActivity.length + testerFeedback.length,
          total_time_seconds: totalTimeSeconds,
        });
      }

      // Trier par temps passé décroissant
      const sortedStats = Array.from(statsMap.values()).sort(
        (a, b) => b.total_time_seconds - a.total_time_seconds
      );
      setTesterStats(sortedStats);

      // Ajouter l'email aux feedbacks récents
      const feedbackWithEmail = (feedbackData || []).slice(0, 10).map((f) => ({
        ...f,
        email: profileMap.get(f.user_id) || "Email inconnu",
      }));
      setRecentFeedback(feedbackWithEmail);

      // Stats globales
      const totalFeedback = feedbackData?.length || 0;
      const avgRating = totalFeedback > 0
        ? (feedbackData?.reduce((sum, f) => sum + f.rating, 0) || 0) / totalFeedback
        : 0;
      const activeTesters = new Set(feedbackData?.map((f) => f.user_id)).size;

      setGlobalStats({
        totalFeedback,
        avgRating,
        activeTesters,
        totalTimeSpent: totalGlobalTime,
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
      {/* Stats globales */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <MessageSquare className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">{globalStats.totalFeedback}</p>
                <p className="text-sm text-muted-foreground">Feedbacks reçus</p>
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
              <div className="p-2 rounded-lg bg-green-500/10">
                <TrendingUp className="h-5 w-5 text-green-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">{globalStats.activeTesters}</p>
                <p className="text-sm text-muted-foreground">Testeurs actifs</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-purple-500/10">
                <Timer className="h-5 w-5 text-purple-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">
                  {formatDuration(globalStats.totalTimeSpent)}
                </p>
                <p className="text-sm text-muted-foreground">Temps total</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Temps passé par utilisateur */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Timer className="h-5 w-5 text-primary" />
            <CardTitle>Temps passé par utilisateur</CardTitle>
          </div>
          <CardDescription>
            Suivi du temps d'utilisation de l'application par chaque testeur
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
                  className="flex items-center justify-between p-3 bg-muted/50 rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary text-sm font-bold">
                      {index + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{tester.email}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-xs text-muted-foreground">
                          {tester.activity_count} actions
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
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <div className="flex items-center gap-1 text-sm font-semibold text-primary">
                        <Timer className="h-4 w-4" />
                        {formatDuration(tester.total_time_seconds)}
                      </div>
                      {tester.last_activity && (
                        <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
                          <Clock className="h-3 w-3" />
                          {formatDistanceToNow(new Date(tester.last_activity), {
                            addSuffix: true,
                            locale: fr,
                          })}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Activité des testeurs */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Activity className="h-5 w-5 text-primary" />
            <CardTitle>Activité des testeurs</CardTitle>
          </div>
          <CardDescription>
            Vue d'ensemble de l'engagement des testeurs
          </CardDescription>
        </CardHeader>
        <CardContent>
          {testerStats.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">
              Aucun testeur enregistré
            </p>
          ) : (
            <div className="space-y-3">
              {testerStats.map((tester) => (
                <div
                  key={tester.user_id}
                  className="flex items-center justify-between p-3 bg-muted/50 rounded-lg"
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{tester.email}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xs text-muted-foreground">
                        {tester.total_feedback} feedbacks
                      </span>
                      {tester.avg_rating > 0 && (
                        <span className="flex items-center gap-1 text-xs text-yellow-500">
                          <Star className="h-3 w-3 fill-current" />
                          {tester.avg_rating.toFixed(1)}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="text-right">
                    {tester.last_activity ? (
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Clock className="h-3 w-3" />
                        {formatDistanceToNow(new Date(tester.last_activity), {
                          addSuffix: true,
                          locale: fr,
                        })}
                      </div>
                    ) : (
                      <Badge variant="outline" className="text-xs">
                        Jamais actif
                      </Badge>
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
