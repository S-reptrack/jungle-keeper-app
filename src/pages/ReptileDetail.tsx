import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import { useState, useEffect } from "react";
import { ArrowLeft, Calendar, Scale, QrCode, Eye, Utensils, Heart, Activity, Camera, Send, DollarSign, Skull } from "lucide-react";
import { useTranslation } from "react-i18next";
import Navigation from "@/components/Navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import ReproductionTab from "@/components/ReproductionTab";
import FeedingTab from "@/components/FeedingTab";
import HealthTab from "@/components/HealthTab";
import EditReptileDialog from "@/components/EditReptileDialog";
import WeightChart from "@/components/WeightChart";
import QRCodeDialog from "@/components/QRCodeDialog";
import ImageUploadDialog from "@/components/ImageUploadDialog";
import { TransferAnimalDialog } from "@/components/TransferAnimalDialog";
import SellTab from "@/components/SellTab";
import DeathTab from "@/components/DeathTab";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { differenceInYears, differenceInMonths } from "date-fns";
import { useSignedImageUrl } from "@/lib/storageUtils";

interface Reptile {
  id: string;
  name: string;
  species: string;
  category: string;
  sex: string;
  morphs: string[];
  birth_date: string;
  weight: number;
  purchase_date: string;
  image_url: string | null;
  status: string;
  status_date: string | null;
  archive_notes: string | null;
  user_id: string;
  previous_owner_id: string | null;
  transferred_at: string | null;
}

const ReptileDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { t } = useTranslation();
  const [reptile, setReptile] = useState<Reptile | null>(null);
  const [loading, setLoading] = useState(true);
  const [qrDialogOpen, setQrDialogOpen] = useState(false);
  const [imageUploadOpen, setImageUploadOpen] = useState(false);
  const [transferDialogOpen, setTransferDialogOpen] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [daysUntilHatch, setDaysUntilHatch] = useState<number | null>(null);
  const { signedUrl: imageSignedUrl, loading: imageLoading } = useSignedImageUrl(reptile?.image_url);

  // Get tab from URL params, default to "overview"
  const defaultTab = searchParams.get("tab") || "overview";

  // Check if current user is the previous owner (read-only access)
  const isPreviousOwner = reptile && currentUserId && reptile.previous_owner_id === currentUserId;
  const isCurrentOwner = reptile && currentUserId && reptile.user_id === currentUserId;

  useEffect(() => {
    const getCurrentUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setCurrentUserId(user.id);
      }
    };
    getCurrentUser();
  }, []);

  const fetchReptile = async () => {
    if (!id) return;

    try {
      setLoading(true);
      
      // CRITIQUE: Forcer la récupération d'une session fraîche avant toute requête
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError || !session) {
        console.error("❌ Pas de session:", sessionError);
        toast.error("Vous devez être connecté pour voir ce reptile");
        navigate("/auth");
        return;
      }

      console.log("✅ Session active:", session.user.id.substring(0, 8));
      toast.info(`🟢 Session OK: ${session.user.id.substring(0, 8)}... | Recherche: ${id.substring(0, 8)}...`, { duration: 3000 });
      
      // Requête avec le token de session explicite
      const { data, error } = await supabase
        .from("reptiles")
        .select("*")
        .eq("id", id)
        .maybeSingle();

      if (error) {
        console.error("Erreur lors de la récupération du reptile:", error);
        throw error;
      }

      if (!data) {
        console.error("Aucun reptile trouvé avec l'ID:", id);
        // Vérifie si ce reptile fait partie de vos animaux (au cas où RLS filtre la première requête)
        const { data: myReptiles, error: listErr } = await supabase
          .from("reptiles")
          .select("id,name")
          .eq("user_id", session.user.id)
          .limit(500);
        if (listErr) console.warn("Liste perso non dispo:", listErr);
        const ids = (myReptiles || []).map(r => r.id);
        const isMine = ids.includes(id);

        toast.error(
          isMine
            ? `🔴 REPTILE INTROUVABLE\nL'ID scanné vous appartient mais n'a pas été retourné (RLS/sync).`
            : `🔴 REPTILE INTROUVABLE\nCet ID ne correspond à aucun de vos reptiles.`,
          { duration: 8000 }
        );
        if (!isMine) {
          toast.info(`Vous avez ${ids.length} reptiles.`, { duration: 5000 });
        }
        navigate("/");
        return;
      }
      
      toast.success(`🟢 Reptile trouvé: ${data.name}`);

      setReptile(data);

      // Fetch reproduction observations to check for expected hatch dates
      const { data: observations } = await supabase
        .from("reproduction_observations")
        .select("expected_hatch_date")
        .eq("reptile_id", id)
        .not("expected_hatch_date", "is", null)
        .order("expected_hatch_date", { ascending: true });

      if (observations && observations.length > 0) {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        for (const obs of observations) {
          const hatchDate = new Date(obs.expected_hatch_date);
          hatchDate.setHours(0, 0, 0, 0);
          const diffTime = hatchDate.getTime() - today.getTime();
          const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
          
          if (diffDays >= 0) {
            setDaysUntilHatch(diffDays);
            break;
          }
        }
      }
    } catch (error) {
      console.error("Error fetching reptile:", error);
      toast.error("Erreur lors du chargement du reptile");
      navigate("/");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReptile();
  }, [id, navigate]);

  const parseDate = (dateString: string) => {
    // Parse YYYY-MM-DD as local date to avoid timezone issues
    const [year, month, day] = dateString.split('-').map(Number);
    return new Date(year, month - 1, day);
  };

  const formatDate = (dateString: string) => {
    return parseDate(dateString).toLocaleDateString('fr-FR');
  };

  const calculateAge = (birthDate: string) => {
    const birth = parseDate(birthDate);
    const now = new Date();
    const years = differenceInYears(now, birth);
    const months = differenceInMonths(now, birth) % 12;

    if (years > 0) {
      return `${years} ${t("reptile.years")}${months > 0 ? ` ${months} ${t("reptile.months")}` : ""}`;
    }
    return `${months} ${t("reptile.months")}`;
  };

  const handleImageUploadSuccess = async (url: string) => {
    // Recharger les données du reptile depuis la base de données
    await fetchReptile();
    toast.success("Photo mise à jour avec succès");
  };

  const handleForSaleToggle = async (checked: boolean) => {
    if (!reptile) return;
    
    try {
      const { error } = await supabase
        .from("reptiles")
        .update({ status: checked ? "for_sale" : "active" })
        .eq("id", reptile.id);

      if (error) throw error;
      
      toast.success(checked ? "Reptile marqué à vendre" : "Reptile retiré de la vente");
      fetchReptile();
    } catch (error) {
      console.error("Error updating status:", error);
      toast.error("Erreur lors de la mise à jour du statut");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <main className="max-w-7xl mx-auto px-4 py-8 mt-16">
          <div className="flex justify-center items-center h-64">
            <p className="text-muted-foreground">Chargement...</p>
          </div>
        </main>
      </div>
    );
  }

  if (!reptile) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <main className="max-w-7xl mx-auto px-4 py-8 mt-16">
        <Button
          variant="ghost"
          onClick={() => navigate("/reptiles")}
          className="mb-6"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          {t("common.back")}
        </Button>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Sidebar avec infos principales */}
          <div className="lg:col-span-1 space-y-4">
            <Card>
              <div className="h-64 bg-gradient-to-br from-jungle-mid to-jungle-light relative overflow-hidden group">
                {!imageLoading && imageSignedUrl && (
                  <img 
                    src={imageSignedUrl} 
                    alt={reptile.name}
                    className="w-full h-full object-cover"
                  />
                )}
                {daysUntilHatch !== null && daysUntilHatch !== undefined && reptile.sex === "female" && (
                  <div className="absolute top-3 left-3">
                    <Badge className="bg-orange-500 hover:bg-orange-600 text-white border-0 text-sm font-bold px-3 py-1.5 shadow-lg animate-pulse">
                      🥚 Éclosion dans {daysUntilHatch}j
                    </Badge>
                  </div>
                )}
                {reptile.status === "active" && (
                  <>
                    <div className="absolute top-3 right-3 flex gap-2">
                      <button 
                        className="p-2 bg-card/90 backdrop-blur-sm rounded-lg hover:bg-accent transition-colors"
                        onClick={() => setImageUploadOpen(true)}
                      >
                        <Camera className="w-5 h-5 text-foreground" />
                      </button>
                      <button 
                        className="p-2 bg-card/90 backdrop-blur-sm rounded-lg hover:bg-accent transition-colors"
                        onClick={() => setQrDialogOpen(true)}
                      >
                        <QrCode className="w-5 h-5 text-foreground" />
                      </button>
                    </div>
                    {!reptile.image_url && (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <Button
                          variant="secondary"
                          onClick={() => setImageUploadOpen(true)}
                          className="gap-2"
                        >
                          <Camera className="w-4 h-4" />
                          Ajouter une photo
                        </Button>
                      </div>
                    )}
                  </>
                )}
              </div>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-2xl">{reptile.name}</CardTitle>
                    <p className="text-sm text-muted-foreground">{reptile.species}</p>
                  </div>
                   <div className="flex flex-col items-end gap-2">
                    {isPreviousOwner && (
                      <Badge variant="outline" className="border-yellow-500 text-yellow-700 dark:text-yellow-400">
                        {t("transfer.transferred")}
                        {reptile.transferred_at && ` - ${formatDate(reptile.transferred_at.split('T')[0])}`}
                      </Badge>
                    )}
                    {reptile.status === "for_sale" && (
                      <Badge variant="outline" className="border-primary text-primary">
                        À vendre
                      </Badge>
                    )}
                    {reptile.status !== "active" && reptile.status !== "for_sale" && (
                      <Badge variant="destructive">
                        {reptile.status === "deceased" ? "Décédé" : "Vendu"}
                        {reptile.status_date && ` - ${formatDate(reptile.status_date)}`}
                      </Badge>
                    )}
                    <Badge variant="secondary" className="bg-accent/20 text-accent-foreground border-accent/30">
                      {calculateAge(reptile.birth_date)}
                    </Badge>
                  </div>
                </div>
                {isPreviousOwner && (
                  <div className="mt-4 p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-md">
                    <p className="text-sm text-yellow-800 dark:text-yellow-200">
                      {t("transfer.readOnlyAccess")}
                    </p>
                  </div>
                )}
                {reptile.status !== "active" && reptile.archive_notes && (
                  <div className="mt-4 p-3 bg-muted rounded-md">
                    <p className="text-xs font-medium text-muted-foreground mb-1">Notes d'archivage:</p>
                    <p className="text-sm">{reptile.archive_notes}</p>
                  </div>
                )}
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">{t("reptile.sex")}</span>
                  <Badge variant="outline" className="inline-flex flex-col items-center justify-center gap-0 whitespace-nowrap leading-none py-1">
                    <span className="text-xs leading-none">
                      {reptile.sex === "male" ? t("reptile.male") : reptile.sex === "female" ? t("reptile.female") : t("reptile.unknown")}
                    </span>
                    <span className="h-3.5 leading-none text-xs flex items-center justify-center">
                      {reptile.sex === "male" ? "♂" : reptile.sex === "female" ? "♀" : "?"}
                    </span>
                  </Badge>
                </div>
                {reptile.morphs && reptile.morphs.length > 0 && (
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">{t("reptile.morphs")}</span>
                    <span className="font-medium text-foreground">{reptile.morphs.join(", ")}</span>
                  </div>
                )}
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground flex items-center gap-2">
                    <Scale className="w-4 h-4" />
                    {t("reptile.weight")}
                  </span>
                  <span className="font-medium text-foreground">{reptile.weight}g</span>
                </div>
                {isCurrentOwner && (reptile.status === "active" || reptile.status === "for_sale") && (
                  <div className="flex items-center justify-between py-3 border-t border-border">
                    <Label htmlFor="for-sale-switch" className="text-sm text-muted-foreground cursor-pointer">
                      À vendre
                    </Label>
                    <Switch
                      id="for-sale-switch"
                      checked={reptile.status === "for_sale"}
                      onCheckedChange={handleForSaleToggle}
                    />
                  </div>
                )}
                {isCurrentOwner && (reptile.status === "active" || reptile.status === "for_sale") && (
                  <div className="mt-4 flex gap-2">
                    <EditReptileDialog
                      reptileId={reptile.id}
                      currentSpecies={reptile.species}
                      currentBirthDate={reptile.birth_date}
                      currentPurchaseDate={reptile.purchase_date}
                      currentWeight={reptile.weight}
                      currentSex={reptile.sex as "male" | "female" | "unknown"}
                      onUpdate={fetchReptile}
                    />
                    <Button 
                      variant="outline" 
                      className="flex-1"
                      onClick={() => setTransferDialogOpen(true)}
                    >
                      <Send className="w-4 h-4 mr-2" />
                      {t("transfer.transferAnimal")}
                    </Button>
                  </div>
                )}
                {isCurrentOwner && reptile.status === "sold" && (
                  <div className="mt-4">
                    <Button 
                      variant="outline" 
                      className="w-full"
                      onClick={() => setTransferDialogOpen(true)}
                    >
                      <Send className="w-4 h-4 mr-2" />
                      {t("transfer.transferAnimal")}
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Contenu principal avec onglets */}
          <div className="lg:col-span-2">
            {(reptile.status === "active" || reptile.status === "for_sale") ? (
              <Tabs defaultValue={defaultTab} className="w-full">
                <TabsList className="grid w-full grid-cols-6">
                  <TabsTrigger value="overview" className="flex items-center justify-center gap-1.5 px-2">
                    <Eye className="w-4 h-4 shrink-0" />
                    <span className="truncate text-xs md:text-sm">{t("reptile.tabs.overview")}</span>
                  </TabsTrigger>
                  <TabsTrigger value="feeding" className="flex items-center justify-center gap-1.5 px-2">
                    <Utensils className="w-4 h-4 shrink-0" />
                    <span className="truncate text-xs md:text-sm">{t("reptile.tabs.feeding")}</span>
                  </TabsTrigger>
                  <TabsTrigger value="reproduction" className="flex items-center justify-center gap-1.5 px-2">
                    <Heart className="w-4 h-4 shrink-0" />
                    <span className="truncate text-xs md:text-sm">{t("reptile.tabs.reproduction")}</span>
                  </TabsTrigger>
                  <TabsTrigger value="health" className="flex items-center justify-center gap-1.5 px-2">
                    <Activity className="w-4 h-4 shrink-0" />
                    <span className="truncate text-xs md:text-sm">{t("reptile.tabs.health")}</span>
                  </TabsTrigger>
                  <TabsTrigger value="sell" className="flex items-center justify-center gap-1.5 px-2">
                    <DollarSign className="w-4 h-4 shrink-0" />
                    <span className="truncate text-xs md:text-sm">Vendre</span>
                  </TabsTrigger>
                  <TabsTrigger value="death" className="flex items-center justify-center gap-1.5 px-2">
                    <Skull className="w-4 h-4 shrink-0" />
                    <span className="truncate text-xs md:text-sm">Décès</span>
                  </TabsTrigger>
                </TabsList>
                
                <TabsContent value="overview" className="space-y-4">
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
                      <CardTitle>{t("reptile.generalInfo")}</CardTitle>
                      {isCurrentOwner && (
                        <EditReptileDialog
                          reptileId={reptile.id}
                          currentSpecies={reptile.species}
                          currentBirthDate={reptile.birth_date}
                          currentPurchaseDate={reptile.purchase_date}
                          currentWeight={reptile.weight}
                          currentSex={reptile.sex as "male" | "female" | "unknown"}
                          onUpdate={fetchReptile}
                        />
                      )}
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-sm text-muted-foreground">{t("reptile.birthDate")}</p>
                          <p className="font-medium">{formatDate(reptile.birth_date)}</p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">{t("reptile.purchaseDate")}</p>
                          <p className="font-medium">{formatDate(reptile.purchase_date)}</p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">{t("reptile.category")}</p>
                          <p className="font-medium">
                            {reptile.category === "snake" ? t("reptile.snake") : 
                             reptile.category === "lizard" ? t("reptile.lizard") : 
                             t("reptile.turtle")}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  
                  <WeightChart reptileId={reptile.id} />
                </TabsContent>
                
                <TabsContent value="feeding">
                  <FeedingTab reptileId={reptile.id} readOnly={isPreviousOwner || false} />
                </TabsContent>
                
                <TabsContent value="reproduction">
                  <ReproductionTab reptileId={reptile.id} reptileSex={reptile.sex} reptileSpecies={reptile.species} readOnly={isPreviousOwner || false} />
                </TabsContent>
                
                <TabsContent value="health" className="space-y-4">
                  <HealthTab reptileId={reptile.id} reptileStatus={reptile.status} readOnly={isPreviousOwner || false} />
                </TabsContent>
                
                <TabsContent value="sell">
                  <SellTab reptileId={reptile.id} reptileName={reptile.name} />
                </TabsContent>
                
                <TabsContent value="death">
                  <DeathTab reptileId={reptile.id} reptileName={reptile.name} />
                </TabsContent>
              </Tabs>
            ) : (
              <Card>
                <CardHeader>
                  <CardTitle>{t("reptile.generalInfo")}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground">{t("reptile.birthDate")}</p>
                      <p className="font-medium">{formatDate(reptile.birth_date)}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">{t("reptile.purchaseDate")}</p>
                      <p className="font-medium">{formatDate(reptile.purchase_date)}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">{t("reptile.category")}</p>
                      <p className="font-medium">
                        {reptile.category === "snake" ? t("reptile.snake") : 
                         reptile.category === "lizard" ? t("reptile.lizard") : 
                         t("reptile.turtle")}
                      </p>
                    </div>
                  </div>
                  {reptile.status === "sold" && (
                    <div className="mt-6 p-4 bg-muted rounded-md">
                      <p className="text-sm text-muted-foreground text-center">
                        Cet animal a été vendu. Seul le transfert est possible pour transmettre l'historique au nouveau propriétaire.
                      </p>
                    </div>
                  )}
                  {reptile.status === "deceased" && (
                    <div className="mt-6 p-4 bg-muted rounded-md">
                      <p className="text-sm text-muted-foreground text-center">
                        Cet animal est décédé. Aucune action n'est possible.
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
          </div>
        </div>

        <QRCodeDialog
          open={qrDialogOpen}
          onOpenChange={setQrDialogOpen}
          reptileId={reptile.id}
          reptileName={reptile.name}
        />
        
        <ImageUploadDialog
          open={imageUploadOpen}
          onOpenChange={setImageUploadOpen}
          reptileId={reptile.id}
          reptileName={reptile.name}
          onUploadSuccess={handleImageUploadSuccess}
        />
        
        <TransferAnimalDialog
          open={transferDialogOpen}
          onOpenChange={setTransferDialogOpen}
          reptileId={reptile.id}
          reptileName={reptile.name}
        />
      </main>
    </div>
  );
};

export default ReptileDetail;
