import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import Navigation from "@/components/Navigation";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ChevronRight, Heart } from "lucide-react";

interface ReproductionRecord {
  id: string;
  reptile_id: string;
  observation_date: string;
  action: string;
  expected_hatch_date: string | null;
  reptile: {
    id: string;
    name: string;
    species: string;
    sex: string | null;
  };
}

const ReproductionReptilesList = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [reproductionRecords, setReproductionRecords] = useState<ReproductionRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchReproductionRecords();
  }, []);

  const fetchReproductionRecords = async () => {
    try {
      const { data, error } = await supabase
        .from("reproduction_observations")
        .select(`
          id,
          reptile_id,
          observation_date,
          action,
          expected_hatch_date,
          reptile:reptiles!inner(id, name, species, sex, status)
        `)
        .eq("reptile.status", "active")
        .order("observation_date", { ascending: false });

      if (error) throw error;
      
      // Group by reptile to show unique reptiles
      const uniqueReptiles = new Map<string, ReproductionRecord>();
      (data || []).forEach((record: any) => {
        if (record.reptile && !uniqueReptiles.has(record.reptile.id)) {
          uniqueReptiles.set(record.reptile.id, record);
        }
      });
      
      setReproductionRecords(Array.from(uniqueReptiles.values()));
    } catch (error) {
      console.error("Error fetching reproduction records:", error);
    } finally {
      setLoading(false);
    }
  };

  const getSexIcon = (sex: string | null) => {
    if (sex === "male") return "♂";
    if (sex === "female") return "♀";
    return "?";
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("fr-FR", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  const getActionLabel = (action: string) => {
    const labels: Record<string, string> = {
      introduction: "Introduction",
      mating: "Accouplement",
      separation: "Séparation",
      prelaying_shed: "Mue pré-ponte",
      laying: "Ponte",
      other: "Autre",
    };
    return labels[action] || action;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <main className="max-w-7xl mx-auto px-4 py-8 md:mt-16">
          <p className="text-center text-muted-foreground">Chargement...</p>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <main className="max-w-7xl mx-auto px-4 py-8 md:mt-16" style={{ paddingBottom: 'calc(6rem + env(safe-area-inset-bottom))' }}>
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-2">
            <Heart className="w-8 h-8 text-primary" />
            <h1 className="text-3xl font-bold text-foreground">Reproduction</h1>
          </div>
          <p className="text-muted-foreground">
            {reproductionRecords.length} reptile{reproductionRecords.length > 1 ? 's' : ''} avec des observations de reproduction
          </p>
        </div>

        {reproductionRecords.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <p className="text-muted-foreground">Aucune observation de reproduction</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {reproductionRecords.map((record) => (
              <Card
                key={record.id}
                className="cursor-pointer hover:shadow-md transition-all hover:border-primary/50"
                onClick={() => navigate(`/reptile/${record.reptile.id}?tab=reproduction`)}
              >
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4 flex-1">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-semibold text-lg text-foreground truncate">
                            {record.reptile.name}
                          </h3>
                          <Badge variant="outline" className="shrink-0">
                            {getSexIcon(record.reptile.sex)}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground truncate mb-1">
                          {record.reptile.species}
                        </p>
                        <div className="flex items-center gap-2 flex-wrap">
                          <Badge variant="secondary" className="text-xs">
                            {getActionLabel(record.action)}
                          </Badge>
                          <span className="text-xs text-muted-foreground">
                            {formatDate(record.observation_date)}
                          </span>
                          {record.expected_hatch_date && record.reptile.sex === "female" && (
                            <Badge variant="default" className="text-xs">
                              🥚 Éclosion prévue: {formatDate(record.expected_hatch_date)}
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                    <ChevronRight className="w-5 h-5 text-muted-foreground ml-2 shrink-0" />
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

export default ReproductionReptilesList;
