import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { ArrowLeft } from "lucide-react";
import Navigation from "@/components/Navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { Badge } from "@/components/ui/badge";

interface FeedingDueReptile {
  id: string;
  name: string;
  species: string;
  image_url: string | null;
  feeding_interval_days: number;
  last_feeding_date: string | null;
  next_feeding_date: Date;
  days_overdue: number;
}

const FeedingsDue = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [reptiles, setReptiles] = useState<FeedingDueReptile[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchFeedingsDue();
  }, []);

  const fetchFeedingsDue = async () => {
    try {
      setLoading(true);
      const { data: reptilesWithInterval } = await supabase
        .from("reptiles")
        .select("id, name, species, image_url, feeding_interval_days")
        .eq("status", "active")
        .not("feeding_interval_days", "is", null);

      const feedingsDueList: FeedingDueReptile[] = [];
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      for (const reptile of reptilesWithInterval || []) {
        const { data: lastFeeding } = await supabase
          .from("feedings")
          .select("feeding_date")
          .eq("reptile_id", reptile.id)
          .order("feeding_date", { ascending: false })
          .limit(1)
          .maybeSingle();

        let nextFeedingDate: Date;
        let lastFeedingDate: string | null = null;

        if (lastFeeding) {
          lastFeedingDate = lastFeeding.feeding_date;
          const lastFeedDate = new Date(lastFeeding.feeding_date);
          lastFeedDate.setHours(0, 0, 0, 0);
          nextFeedingDate = new Date(lastFeedDate);
          nextFeedingDate.setDate(nextFeedingDate.getDate() + (reptile.feeding_interval_days || 0));
        } else {
          // No feeding recorded yet, consider as due today
          nextFeedingDate = today;
        }

        // Calculate days difference (negative = overdue, 0 = today, positive = upcoming)
        const daysDifference = Math.floor((nextFeedingDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
        
        feedingsDueList.push({
          id: reptile.id,
          name: reptile.name,
          species: reptile.species,
          image_url: reptile.image_url,
          feeding_interval_days: reptile.feeding_interval_days || 0,
          last_feeding_date: lastFeedingDate,
          next_feeding_date: nextFeedingDate,
          days_overdue: daysDifference,
        });
      }

      // Sort by next feeding date (soonest first)
      feedingsDueList.sort((a, b) => a.next_feeding_date.getTime() - b.next_feeding_date.getTime());

      setReptiles(feedingsDueList);
    } catch (error) {
      console.error("Error fetching feedings due:", error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString("fr-FR", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <main className="max-w-7xl mx-auto px-4 py-8 md:mt-16" style={{ paddingBottom: 'calc(6rem + env(safe-area-inset-bottom))' }}>
        <div className="mb-6">
          <Button
            variant="ghost"
            onClick={() => navigate("/")}
            className="mb-4"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Retour
          </Button>
          
          <h1 className="text-3xl font-bold text-foreground mb-2">
            Repas à venir
          </h1>
          <p className="text-muted-foreground">
            Tous les reptiles avec un intervalle de nourrissage défini
          </p>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">Chargement...</p>
          </div>
        ) : reptiles.length === 0 ? (
          <div className="text-center py-12 border border-dashed border-border rounded-lg">
            <p className="text-muted-foreground">Aucun reptile avec intervalle de repas défini</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {reptiles.map((reptile) => (
              <Card
                key={reptile.id}
                className="cursor-pointer hover:shadow-lg transition-shadow"
                onClick={() => navigate(`/reptiles/${reptile.id}`)}
              >
                <CardContent className="p-6">
                  {reptile.image_url && (
                    <img
                      src={reptile.image_url}
                      alt={reptile.name}
                      className="w-full h-48 object-cover rounded-lg mb-4"
                    />
                  )}
                  
                  <h3 className="text-xl font-semibold text-foreground mb-2">
                    {reptile.name}
                  </h3>
                  
                  <p className="text-sm text-muted-foreground mb-4">
                    {reptile.species}
                  </p>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Intervalle:</span>
                      <span className="font-medium">{reptile.feeding_interval_days} jours</span>
                    </div>

                    {reptile.last_feeding_date && (
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Dernier repas:</span>
                        <span className="font-medium">{formatDate(reptile.last_feeding_date)}</span>
                      </div>
                    )}

                    <div className="mt-4">
                      {reptile.days_overdue < 0 ? (
                        <Badge variant="destructive">
                          En retard de {Math.abs(reptile.days_overdue)} jour{Math.abs(reptile.days_overdue) > 1 ? "s" : ""}
                        </Badge>
                      ) : reptile.days_overdue === 0 ? (
                        <Badge variant="default">À nourrir aujourd'hui</Badge>
                      ) : (
                        <Badge variant="secondary">
                          Dans {reptile.days_overdue} jour{reptile.days_overdue > 1 ? "s" : ""}
                        </Badge>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default FeedingsDue;
