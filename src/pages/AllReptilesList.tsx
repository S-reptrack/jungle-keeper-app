import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import Navigation from "@/components/Navigation";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ChevronRight, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Reptile {
  id: string;
  name: string;
  species: string;
  sex: string | null;
  birth_date: string;
  weight: number;
}

const AllReptilesList = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [reptiles, setReptiles] = useState<Reptile[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchReptiles();
  }, []);

  const fetchReptiles = async () => {
    try {
      const { data, error } = await supabase
        .from("reptiles")
        .select("id, name, species, sex, birth_date, weight")
        .in("status", ["active", "for_sale"])
        .order("name", { ascending: true });

      if (error) throw error;
      setReptiles(data || []);
    } catch (error) {
      console.error("Error fetching reptiles:", error);
    } finally {
      setLoading(false);
    }
  };

  const calculateAge = (birthDate: string) => {
    const birth = new Date(birthDate);
    const today = new Date();
    const years = today.getFullYear() - birth.getFullYear();
    const months = today.getMonth() - birth.getMonth();
    
    if (years > 0) {
      return `${years} an${years > 1 ? 's' : ''}`;
    }
    return `${months} mois`;
  };

  const getSexIcon = (sex: string | null) => {
    if (sex === "male") return "♂";
    if (sex === "female") return "♀";
    return "?";
  };

  const groupBySpecies = (reptileList: Reptile[]) => {
    const grouped = reptileList.reduce((acc, reptile) => {
      const species = reptile.species || "Non spécifié";
      if (!acc[species]) {
        acc[species] = [];
      }
      acc[species].push(reptile);
      return acc;
    }, {} as Record<string, Reptile[]>);
    
    return Object.entries(grouped).sort(([a], [b]) => a.localeCompare(b)) as [string, Reptile[]][];
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
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate("/")}
            className="mb-4 -ml-2"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Retour
          </Button>
          <h1 className="text-3xl font-bold text-foreground mb-2">Tous les reptiles</h1>
          <p className="text-muted-foreground">{reptiles.length} reptile{reptiles.length > 1 ? 's' : ''} actif{reptiles.length > 1 ? 's' : ''}</p>
        </div>

        {reptiles.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <p className="text-muted-foreground">Aucun reptile trouvé</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-8">
            {groupBySpecies(reptiles).map(([species, speciesReptiles]) => (
              <div key={species}>
                <h2 className="text-xl font-semibold mb-4 text-foreground">{species}</h2>
                <div className="space-y-3">
                  {speciesReptiles.map((reptile) => (
                    <Card
                      key={reptile.id}
                      className="cursor-pointer hover:shadow-md transition-all hover:border-primary/50"
                      onClick={() => navigate(`/reptile/${reptile.id}`)}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4 flex-1">
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-1">
                                <h3 className="font-semibold text-lg text-foreground truncate">{reptile.name}</h3>
                                <Badge variant="outline" className="shrink-0">
                                  {getSexIcon(reptile.sex)}
                                </Badge>
                              </div>
                              <p className="text-sm text-muted-foreground truncate">{reptile.species}</p>
                            </div>
                            <div className="hidden sm:flex items-center gap-6 text-sm">
                              <div className="text-right">
                                <p className="text-muted-foreground">Âge</p>
                                <p className="font-medium">{calculateAge(reptile.birth_date)}</p>
                              </div>
                              <div className="text-right">
                                <p className="text-muted-foreground">Poids</p>
                                <p className="font-medium">{reptile.weight}g</p>
                              </div>
                            </div>
                          </div>
                          <ChevronRight className="w-5 h-5 text-muted-foreground ml-2 shrink-0" />
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default AllReptilesList;
