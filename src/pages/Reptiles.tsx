import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { supabase } from "@/integrations/supabase/client";
import Navigation from "@/components/Navigation";
import ReptileCard from "@/components/ReptileCard";
import AddReptileDialog from "@/components/AddReptileDialog";
import PrintQRCodesDialog from "@/components/PrintQRCodesDialog";
import { useAuth } from "@/hooks/useAuth";
import { AuthForm } from "@/components/AuthForm";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Printer, QrCode } from "lucide-react";
import { useNavigate } from "react-router-dom";

const Reptiles = () => {
  const { t } = useTranslation();
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [reptiles, setReptiles] = useState<any[]>([]);
  const [archivedReptiles, setArchivedReptiles] = useState<any[]>([]);
  const [transferredReptiles, setTransferredReptiles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [lastFeedings, setLastFeedings] = useState<Record<string, string>>({});
  const [showPrintDialog, setShowPrintDialog] = useState(false);
  const [daysUntilHatch, setDaysUntilHatch] = useState<Record<string, number | null>>({});

  useEffect(() => {
    if (user) {
      fetchReptiles();
      
      // Subscribe to real-time updates for reptiles
      const channel = supabase
        .channel('data-changes')
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'reptiles',
          },
          () => {
            fetchReptiles();
          }
        )
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'feedings',
          },
          () => {
            fetchReptiles();
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [user]);

  const fetchReptiles = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Fetch active reptiles (current owner) including those for sale
      const { data, error } = await supabase
        .from("reptiles")
        .select("*")
        .in("status", ["active", "for_sale"])
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (error) throw error;

      const reptileData = data || [];
      setReptiles(reptileData);

      // Fetch archived reptiles
      const { data: archivedData, error: archivedError } = await supabase
        .from("reptiles")
        .select("*")
        .in("status", ["deceased", "sold"])
        .eq("user_id", user.id)
        .order("status_date", { ascending: false });

      if (archivedError) throw archivedError;

      setArchivedReptiles(archivedData || []);

      // Fetch transferred reptiles (where user is previous owner)
      const { data: transferredData, error: transferredError } = await supabase
        .from("reptiles")
        .select("*")
        .eq("previous_owner_id", user.id)
        .order("transferred_at", { ascending: false });

      if (transferredError) throw transferredError;

      setTransferredReptiles(transferredData || []);

      // Calculate last feeding per reptile
      const calculateDaysSince = (dateString: string) => {
        const feedDate = new Date(dateString);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        feedDate.setHours(0, 0, 0, 0);
        const diffTime = today.getTime() - feedDate.getTime();
        const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
        if (diffDays === 0) return "Aujourd'hui";
        if (diffDays === 1) return "Il y a 1 jour";
        return `Il y a ${diffDays} jours`;
      };

      const allReptiles = [...reptileData, ...(archivedData || []), ...(transferredData || [])];
      const feedingsMap: Record<string, string> = {};
      for (const reptile of allReptiles) {
        const { data: feedingData } = await supabase
          .from("feedings")
          .select("feeding_date")
          .eq("reptile_id", reptile.id)
          .order("feeding_date", { ascending: false })
          .limit(1)
          .single();

        if (feedingData) {
          feedingsMap[reptile.id] = calculateDaysSince(feedingData.feeding_date);
        } else {
          feedingsMap[reptile.id] = "Jamais";
        }
      }

      setLastFeedings(feedingsMap);

      // Calculate days until hatch for reproduction observations
      const hatchMap: Record<string, number | null> = {};
      for (const reptile of allReptiles) {
        // Only calculate for female reptiles
        if (reptile.sex === "female") {
          const { data: observations } = await supabase
            .from("reproduction_observations")
            .select("expected_hatch_date")
            .eq("reptile_id", reptile.id)
            .not("expected_hatch_date", "is", null)
            .order("expected_hatch_date", { ascending: true });

          if (observations && observations.length > 0) {
            // Find the closest upcoming hatch date
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            
            for (const obs of observations) {
              const hatchDate = new Date(obs.expected_hatch_date);
              hatchDate.setHours(0, 0, 0, 0);
              const diffTime = hatchDate.getTime() - today.getTime();
              const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
              
              // Only show if hatch date is in the future (0 or positive days)
              if (diffDays >= 0) {
                hatchMap[reptile.id] = diffDays;
                break;
              }
            }
          }
        }
      }
      setDaysUntilHatch(hatchMap);
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

  const groupBySpecies = (reptileList: any[]) => {
    const grouped = reptileList.reduce((acc, reptile) => {
      const species = reptile.species || "Non spécifié";
      if (!acc[species]) {
        acc[species] = [];
      }
      acc[species].push(reptile);
      return acc;
    }, {} as Record<string, any[]>);
    
    return Object.entries(grouped).sort(([a], [b]) => a.localeCompare(b)) as [string, any[]][];
  };

  if (authLoading) {
    return <div className="min-h-screen flex items-center justify-center">Chargement...</div>;
  }

  if (!user) {
    return <AuthForm />;
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <main className="max-w-7xl mx-auto px-4 py-8 pb-24 md:pb-8 md:pt-24">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold text-foreground">{t("common.reptiles")}</h1>
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => navigate("/qr-codes")}
            >
              <QrCode className="mr-2 h-4 w-4" />
              Tous les QR codes
            </Button>
            <Button
              variant="outline"
              onClick={() => setShowPrintDialog(true)}
              disabled={reptiles.length === 0}
            >
              <Printer className="mr-2 h-4 w-4" />
              Imprimer QR codes
            </Button>
            <AddReptileDialog onReptileAdded={fetchReptiles} />
          </div>
        </div>
        
        {loading ? (
          <div className="text-center py-12">Chargement...</div>
        ) : (
          <Tabs defaultValue="active" className="w-full">
            <TabsList className="mb-6">
              <TabsTrigger value="active" className="gap-2">
                Actifs
                <Badge variant="secondary">{reptiles.length}</Badge>
              </TabsTrigger>
              <TabsTrigger value="archived" className="gap-2">
                Archivés
                <Badge variant="secondary">{archivedReptiles.length}</Badge>
              </TabsTrigger>
              <TabsTrigger value="transferred" className="gap-2">
                Transférés
                <Badge variant="secondary">{transferredReptiles.length}</Badge>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="active">
              {reptiles.length === 0 ? (
                <div className="text-center py-12 border border-dashed border-border rounded-lg">
                  <p className="text-muted-foreground mb-4">Aucun reptile actif</p>
                  <AddReptileDialog onReptileAdded={fetchReptiles} />
                </div>
              ) : (
                <div className="space-y-8">
                  {groupBySpecies(reptiles).map(([species, speciesReptiles]) => (
                    <div key={species}>
                      <h2 className="text-xl font-semibold mb-4 text-foreground">{species}</h2>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {speciesReptiles.map((reptile) => (
                          <ReptileCard
                            key={reptile.id}
                            id={reptile.id}
                            name={reptile.name}
                            species={reptile.species}
                            age={reptile.birth_date ? calculateAge(reptile.birth_date) : "Inconnu"}
                            weight={`${reptile.weight || 0}g`}
                            lastFed={lastFeedings[reptile.id] || "Jamais"}
                            image={reptile.image_url}
                            daysUntilHatch={daysUntilHatch[reptile.id]}
                            status={reptile.status}
                          />
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="archived">
              {archivedReptiles.length === 0 ? (
                <div className="text-center py-12 border border-dashed border-border rounded-lg">
                  <p className="text-muted-foreground">Aucun reptile archivé</p>
                </div>
              ) : (
                <div className="space-y-8">
                  {groupBySpecies(archivedReptiles).map(([species, speciesReptiles]) => (
                    <div key={species}>
                      <h2 className="text-xl font-semibold mb-4 text-foreground">{species}</h2>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {speciesReptiles.map((reptile) => (
                          <div key={reptile.id} className="relative">
                            <ReptileCard
                              id={reptile.id}
                              name={reptile.name}
                              species={reptile.species}
                              age={reptile.birth_date ? calculateAge(reptile.birth_date) : "Inconnu"}
                              weight={`${reptile.weight || 0}g`}
                              lastFed={lastFeedings[reptile.id] || "Jamais"}
                              image={reptile.image_url}
                              daysUntilHatch={daysUntilHatch[reptile.id]}
                            />
                            <Badge 
                              variant="secondary" 
                              className="absolute top-4 right-4 z-10"
                            >
                              {reptile.status === "deceased" ? "Décédé" : "Vendu"}
                              {reptile.status_date && ` - ${new Date(reptile.status_date).toLocaleDateString("fr-FR")}`}
                            </Badge>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="transferred">
              {transferredReptiles.length === 0 ? (
                <div className="text-center py-12 border border-dashed border-border rounded-lg">
                  <p className="text-muted-foreground">Aucun animal transféré</p>
                </div>
              ) : (
                <div className="space-y-8">
                  {groupBySpecies(transferredReptiles).map(([species, speciesReptiles]) => (
                    <div key={species}>
                      <h2 className="text-xl font-semibold mb-4 text-foreground">{species}</h2>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {speciesReptiles.map((reptile) => (
                          <div key={reptile.id} className="relative">
                            <ReptileCard
                              id={reptile.id}
                              name={reptile.name}
                              species={reptile.species}
                              age={reptile.birth_date ? calculateAge(reptile.birth_date) : "Inconnu"}
                              weight={`${reptile.weight || 0}g`}
                              lastFed={lastFeedings[reptile.id] || "Jamais"}
                              image={reptile.image_url}
                              daysUntilHatch={daysUntilHatch[reptile.id]}
                            />
                            <Badge 
                              variant="outline" 
                              className="absolute top-4 right-4 z-10 border-yellow-500 text-yellow-700 dark:text-yellow-400 bg-card"
                            >
                              Transféré
                              {reptile.transferred_at && ` - ${new Date(reptile.transferred_at).toLocaleDateString("fr-FR")}`}
                            </Badge>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>
        )}

        <PrintQRCodesDialog
          open={showPrintDialog}
          onOpenChange={setShowPrintDialog}
          reptiles={reptiles}
        />
      </main>
    </div>
  );
};

export default Reptiles;
