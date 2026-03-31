import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { supabase } from "@/integrations/supabase/client";
import Navigation from "@/components/Navigation";
import ReptileCard from "@/components/ReptileCard";
import ReptileListItem from "@/components/ReptileListItem";
import ViewModeSelector, { ViewMode } from "@/components/ViewModeSelector";
import AddReptileDialog from "@/components/AddReptileDialog";
import PrintQRCodesDialog from "@/components/PrintQRCodesDialog";
import { useAuth } from "@/hooks/useAuth";
import { AuthForm } from "@/components/AuthForm";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Printer, QrCode, ChevronLeft, ChevronRight } from "lucide-react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useIsMobile } from "@/hooks/use-mobile";
import { useUserRole } from "@/hooks/useUserRole";

const ITEMS_PER_PAGE = 10;

const Reptiles = () => {
  const { t } = useTranslation();
  const { user, loading: authLoading } = useAuth();
  const { role } = useUserRole();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [reptiles, setReptiles] = useState<any[]>([]);
  const [archivedReptiles, setArchivedReptiles] = useState<any[]>([]);
  const [transferredReptiles, setTransferredReptiles] = useState<any[]>([]);
  const [testReptiles, setTestReptiles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [lastFeedings, setLastFeedings] = useState<Record<string, string>>({});
  const [showPrintDialog, setShowPrintDialog] = useState(false);
  const [daysUntilHatch, setDaysUntilHatch] = useState<Record<string, number | null>>({});
  
  // Lire les pages depuis les paramètres URL
  const activePage = parseInt(searchParams.get("activePage") || "1", 10);
  const archivedPage = parseInt(searchParams.get("archivedPage") || "1", 10);
  const transferredPage = parseInt(searchParams.get("transferredPage") || "1", 10);
  const activeTab = searchParams.get("tab") || "active";
  
  const [viewMode, setViewMode] = useState<ViewMode>(() => {
    const saved = localStorage.getItem("reptiles-view-mode");
    return (saved as ViewMode) || "grid";
  });
  const isMobile = useIsMobile();

  // Fonctions pour mettre à jour les pages via URL
  const setActivePage = (page: number) => {
    const newParams = new URLSearchParams(searchParams);
    newParams.set("activePage", page.toString());
    setSearchParams(newParams, { replace: true });
  };
  
  const setArchivedPage = (page: number) => {
    const newParams = new URLSearchParams(searchParams);
    newParams.set("archivedPage", page.toString());
    setSearchParams(newParams, { replace: true });
  };
  
  const setTransferredPage = (page: number) => {
    const newParams = new URLSearchParams(searchParams);
    newParams.set("transferredPage", page.toString());
    setSearchParams(newParams, { replace: true });
  };
  
  const handleTabChange = (tab: string) => {
    const newParams = new URLSearchParams(searchParams);
    newParams.set("tab", tab);
    setSearchParams(newParams, { replace: true });
  };

  // Sauvegarder le mode de vue dans localStorage
  const handleViewModeChange = (mode: ViewMode) => {
    setViewMode(mode);
    localStorage.setItem("reptiles-view-mode", mode);
  };

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

      // Fetch all reptile categories in parallel
      const [activeResult, archivedResult, transferredResult, testResult] = await Promise.all([
        supabase
          .from("reptiles")
          .select("*")
          .in("status", ["active", "for_sale"])
          .eq("user_id", user.id)
          .order("created_at", { ascending: false }),
        supabase
          .from("reptiles")
          .select("*")
          .in("status", ["deceased", "sold"])
          .eq("user_id", user.id)
          .order("status_date", { ascending: false }),
        supabase
          .from("reptiles")
          .select("*")
          .eq("previous_owner_id", user.id)
          .order("transferred_at", { ascending: false }),
        supabase
          .from("reptiles")
          .select("*")
          .eq("status", "test")
          .eq("user_id", user.id)
          .order("created_at", { ascending: false })
      ]);

      if (activeResult.error) throw activeResult.error;
      if (archivedResult.error) throw archivedResult.error;
      if (transferredResult.error) throw transferredResult.error;

      const reptileData = activeResult.data || [];
      const archivedData = archivedResult.data || [];
      const transferredData = transferredResult.data || [];
      const testData = testResult.data || [];

      setReptiles(reptileData);
      setArchivedReptiles(archivedData);
      setTransferredReptiles(transferredData);
      setTestReptiles(testData);

      const allReptiles = [...reptileData, ...archivedData, ...transferredData, ...testData];
      const reptileIds = allReptiles.map(r => r.id);
      const femaleReptileIds = allReptiles.filter(r => r.sex === "female").map(r => r.id);

      // Fetch all feedings and observations in batch
      const [feedingsResult, observationsResult] = await Promise.all([
        reptileIds.length > 0
          ? supabase
              .from("feedings")
              .select("reptile_id, feeding_date")
              .in("reptile_id", reptileIds)
              .order("feeding_date", { ascending: false })
          : Promise.resolve({ data: [] }),
        femaleReptileIds.length > 0
          ? supabase
              .from("reproduction_observations")
              .select("reptile_id, expected_hatch_date")
              .in("reptile_id", femaleReptileIds)
              .not("expected_hatch_date", "is", null)
              .order("expected_hatch_date", { ascending: true })
          : Promise.resolve({ data: [] })
      ]);

      // Process feedings - get latest per reptile
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

      const feedingsMap: Record<string, string> = {};
      const seenReptiles = new Set<string>();
      
      for (const feeding of feedingsResult.data || []) {
        if (!seenReptiles.has(feeding.reptile_id)) {
          feedingsMap[feeding.reptile_id] = calculateDaysSince(feeding.feeding_date);
          seenReptiles.add(feeding.reptile_id);
        }
      }
      
      // Mark reptiles without feedings
      for (const reptile of allReptiles) {
        if (!feedingsMap[reptile.id]) {
          feedingsMap[reptile.id] = "Jamais";
        }
      }
      setLastFeedings(feedingsMap);

      // Process hatch dates
      const hatchMap: Record<string, number | null> = {};
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      for (const obs of observationsResult.data || []) {
        if (hatchMap[obs.reptile_id] !== undefined) continue;
        
        const hatchDate = new Date(obs.expected_hatch_date);
        hatchDate.setHours(0, 0, 0, 0);
        const diffDays = Math.ceil((hatchDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
        
        if (diffDays >= 0) {
          hatchMap[obs.reptile_id] = diffDays;
        }
      }
      setDaysUntilHatch(hatchMap);
    } catch (error) {
      console.error("Error fetching reptiles:", error);
    } finally {
      setLoading(false);
    }
  };

  const calculateAge = (birthDate: string | null | undefined) => {
    if (!birthDate) return "Inconnu";
    
    const birth = new Date(birthDate);
    if (isNaN(birth.getTime())) return "Inconnu";
    
    const today = new Date();
    let years = today.getFullYear() - birth.getFullYear();
    let months = today.getMonth() - birth.getMonth();
    
    // Ajuster si l'anniversaire n'est pas encore passé cette année
    if (months < 0 || (months === 0 && today.getDate() < birth.getDate())) {
      years--;
      months += 12;
    }
    
    if (years > 0) {
      return `${years} an${years > 1 ? 's' : ''}`;
    }
    if (months > 0) {
      return `${months} mois`;
    }
    return "< 1 mois";
  };

  // Trier par espèce puis par nom alphabétique
  const sortBySpeciesAndName = (reptileList: any[]) => {
    return [...reptileList].sort((a, b) => {
      const speciesA = (a.species || "Non spécifié").toLowerCase();
      const speciesB = (b.species || "Non spécifié").toLowerCase();
      if (speciesA !== speciesB) {
        return speciesA.localeCompare(speciesB);
      }
      const nameA = (a.name || "").toLowerCase();
      const nameB = (b.name || "").toLowerCase();
      return nameA.localeCompare(nameB);
    });
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

  const paginateReptiles = (reptileList: any[], page: number) => {
    const startIndex = (page - 1) * ITEMS_PER_PAGE;
    const endIndex = startIndex + ITEMS_PER_PAGE;
    return reptileList.slice(startIndex, endIndex);
  };

  const getTotalPages = (total: number) => Math.ceil(total / ITEMS_PER_PAGE);

  const PaginationControls = ({ 
    currentPage, 
    totalItems, 
    onPageChange 
  }: { 
    currentPage: number; 
    totalItems: number; 
    onPageChange: (page: number) => void;
  }) => {
    const totalPages = getTotalPages(totalItems);
    if (totalPages <= 1) return null;

    return (
      <div className="flex items-center justify-center gap-2 mt-6">
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <span className="text-sm text-muted-foreground">
          Page {currentPage} / {totalPages}
        </span>
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    );
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
      
      <main className="max-w-7xl mx-auto px-4 pt-[max(3.5rem,calc(env(safe-area-inset-top)+1rem))] pb-24 md:pb-8 md:pt-24">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div className="flex items-center justify-between md:justify-start gap-3 min-w-0 flex-wrap">
            <h1 className="text-xl md:text-3xl font-bold text-foreground">{t("common.reptiles")}</h1>
            <ViewModeSelector viewMode={viewMode} onViewModeChange={handleViewModeChange} />
          </div>
          <div className="flex flex-col sm:flex-row gap-2">
            <Button
              variant="outline"
              onClick={() => navigate("/qr-codes")}
              className="w-full sm:w-auto"
            >
              <QrCode className="mr-2 h-4 w-4" />
              Tous les QR codes
            </Button>
            <Button
              variant="outline"
              onClick={() => setShowPrintDialog(true)}
              disabled={reptiles.length === 0}
              className="w-full sm:w-auto"
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
          <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
            <TabsList className={`mb-6 w-full grid ${role === "admin" && testReptiles.length > 0 ? "grid-cols-4" : "grid-cols-3"}`}>
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
              {role === "admin" && testReptiles.length > 0 && (
                <TabsTrigger value="test" className="gap-2">
                  🧪 Test
                  <Badge variant="secondary">{testReptiles.length}</Badge>
                </TabsTrigger>
              )}
            </TabsList>

            <TabsContent value="active">
              {reptiles.length === 0 ? (
                <div className="text-center py-12 border border-dashed border-border rounded-lg">
                  <p className="text-muted-foreground mb-4">Aucun reptile actif</p>
                  <AddReptileDialog onReptileAdded={fetchReptiles} />
                </div>
              ) : (
                <>
                  <div className="space-y-8">
                    {groupBySpecies(paginateReptiles(sortBySpeciesAndName(reptiles), activePage)).map(([species, speciesReptiles]) => (
                      <div key={species}>
                        <h2 className="text-xl font-semibold mb-4 text-foreground">{species}</h2>
                        {viewMode === "grid" ? (
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
                                sex={reptile.sex}
                              />
                            ))}
                          </div>
                        ) : (
                          <div className="space-y-2">
                            {speciesReptiles.map((reptile) => (
                              <ReptileListItem
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
                                sex={reptile.sex}
                                showImage={viewMode === "list-with-photos"}
                              />
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                  <PaginationControls
                    currentPage={activePage}
                    totalItems={reptiles.length}
                    onPageChange={setActivePage}
                  />
                </>
              )}
            </TabsContent>

            <TabsContent value="archived">
              {archivedReptiles.length === 0 ? (
                <div className="text-center py-12 border border-dashed border-border rounded-lg">
                  <p className="text-muted-foreground">Aucun reptile archivé</p>
                </div>
              ) : (
                <>
                  <div className="space-y-8">
                    {groupBySpecies(paginateReptiles(sortBySpeciesAndName(archivedReptiles), archivedPage)).map(([species, speciesReptiles]) => (
                      <div key={species}>
                        <h2 className="text-xl font-semibold mb-4 text-foreground">{species}</h2>
                        {viewMode === "grid" ? (
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
                                  sex={reptile.sex}
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
                        ) : (
                          <div className="space-y-2">
                            {speciesReptiles.map((reptile) => (
                              <div key={reptile.id} className="relative">
                                <ReptileListItem
                                  id={reptile.id}
                                  name={reptile.name}
                                  species={reptile.species}
                                  age={reptile.birth_date ? calculateAge(reptile.birth_date) : "Inconnu"}
                                  weight={`${reptile.weight || 0}g`}
                                  lastFed={lastFeedings[reptile.id] || "Jamais"}
                                  image={reptile.image_url}
                                  daysUntilHatch={daysUntilHatch[reptile.id]}
                                  sex={reptile.sex}
                                  showImage={viewMode === "list-with-photos"}
                                />
                                <Badge 
                                  variant="secondary" 
                                  className="absolute top-1.5 right-1.5 z-10 text-xs"
                                >
                                  {reptile.status === "deceased" ? "Décédé" : "Vendu"}
                                </Badge>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                  <PaginationControls
                    currentPage={archivedPage}
                    totalItems={archivedReptiles.length}
                    onPageChange={setArchivedPage}
                  />
                </>
              )}
            </TabsContent>

            <TabsContent value="transferred">
              {transferredReptiles.length === 0 ? (
                <div className="text-center py-12 border border-dashed border-border rounded-lg">
                  <p className="text-muted-foreground">Aucun animal transféré</p>
                </div>
              ) : (
                <>
                  <div className="space-y-8">
                    {groupBySpecies(paginateReptiles(sortBySpeciesAndName(transferredReptiles), transferredPage)).map(([species, speciesReptiles]) => (
                      <div key={species}>
                        <h2 className="text-xl font-semibold mb-4 text-foreground">{species}</h2>
                        {viewMode === "grid" ? (
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
                                  sex={reptile.sex}
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
                        ) : (
                          <div className="space-y-2">
                            {speciesReptiles.map((reptile) => (
                              <div key={reptile.id} className="relative">
                                <ReptileListItem
                                  id={reptile.id}
                                  name={reptile.name}
                                  species={reptile.species}
                                  age={reptile.birth_date ? calculateAge(reptile.birth_date) : "Inconnu"}
                                  weight={`${reptile.weight || 0}g`}
                                  lastFed={lastFeedings[reptile.id] || "Jamais"}
                                  image={reptile.image_url}
                                  daysUntilHatch={daysUntilHatch[reptile.id]}
                                  sex={reptile.sex}
                                  showImage={viewMode === "list-with-photos"}
                                />
                                <Badge 
                                  variant="outline" 
                                  className="absolute top-1.5 right-1.5 z-10 border-yellow-500 text-yellow-700 dark:text-yellow-400 bg-card text-xs"
                                >
                                  Transféré
                                </Badge>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                  <PaginationControls
                    currentPage={transferredPage}
                    totalItems={transferredReptiles.length}
                    onPageChange={setTransferredPage}
                  />
                </>
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
