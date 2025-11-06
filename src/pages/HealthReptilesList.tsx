import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import Navigation from "@/components/Navigation";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ChevronRight, AlertCircle } from "lucide-react";

interface HealthRecord {
  id: string;
  reptile_id: string;
  condition: string;
  diagnosis_date: string;
  resolved: boolean;
  reptile: {
    id: string;
    name: string;
    species: string;
    sex: string | null;
  };
}

const HealthReptilesList = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [healthRecords, setHealthRecords] = useState<HealthRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchHealthRecords();
  }, []);

  const fetchHealthRecords = async () => {
    try {
      // First, fetch health records
      const { data: healthData, error: healthError } = await supabase
        .from("health_records")
        .select("id, reptile_id, condition, diagnosis_date, resolved")
        .eq("resolved", false)
        .order("diagnosis_date", { ascending: false });

      if (healthError) throw healthError;
      
      if (!healthData || healthData.length === 0) {
        setHealthRecords([]);
        return;
      }

      // Get unique reptile IDs
      const reptileIds = [...new Set(healthData.map(h => h.reptile_id))];
      
      // Fetch reptile details
      const { data: reptilesData, error: reptilesError } = await supabase
        .from("reptiles")
        .select("id, name, species, sex, status")
        .in("id", reptileIds)
        .eq("status", "active");

      if (reptilesError) throw reptilesError;
      
      // Create a map of reptiles
      const reptilesMap = new Map(
        (reptilesData || []).map(r => [r.id, r])
      );
      
      // Combine data and group by reptile
      const uniqueReptiles = new Map<string, HealthRecord>();
      healthData.forEach((record) => {
        const reptile = reptilesMap.get(record.reptile_id);
        if (reptile && !uniqueReptiles.has(reptile.id)) {
          uniqueReptiles.set(reptile.id, {
            id: record.id,
            reptile_id: record.reptile_id,
            condition: record.condition,
            diagnosis_date: record.diagnosis_date,
            resolved: record.resolved,
            reptile: reptile
          });
        }
      });
      
      setHealthRecords(Array.from(uniqueReptiles.values()));
    } catch (error) {
      console.error("Error fetching health records:", error);
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
            <AlertCircle className="w-8 h-8 text-destructive" />
            <h1 className="text-3xl font-bold text-foreground">Problèmes de santé</h1>
          </div>
          <p className="text-muted-foreground">
            {healthRecords.length} reptile{healthRecords.length > 1 ? 's' : ''} avec des problèmes de santé actifs
          </p>
        </div>

        {healthRecords.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <p className="text-muted-foreground">Aucun problème de santé actif</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {healthRecords.map((record) => (
              <Card
                key={record.id}
                className="cursor-pointer hover:shadow-md transition-all hover:border-destructive/50"
                onClick={() => navigate(`/reptile/${record.reptile.id}?tab=health`)}
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
                        <div className="flex items-center gap-2">
                          <Badge variant="destructive" className="text-xs">
                            {record.condition}
                          </Badge>
                          <span className="text-xs text-muted-foreground">
                            Depuis le {formatDate(record.diagnosis_date)}
                          </span>
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

export default HealthReptilesList;
