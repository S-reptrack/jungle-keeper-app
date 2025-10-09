import { useParams, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { ArrowLeft, Calendar, Scale, QrCode, Eye, Utensils, Heart, Activity, Camera } from "lucide-react";
import { useTranslation } from "react-i18next";
import Navigation from "@/components/Navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import ReproductionTab from "@/components/ReproductionTab";
import FeedingTab from "@/components/FeedingTab";
import HealthTab from "@/components/HealthTab";
import EditReptileDialog from "@/components/EditReptileDialog";
import WeightChart from "@/components/WeightChart";
import QRCodeDialog from "@/components/QRCodeDialog";
import ImageUploadDialog from "@/components/ImageUploadDialog";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { differenceInYears, differenceInMonths } from "date-fns";

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
}

const ReptileDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [reptile, setReptile] = useState<Reptile | null>(null);
  const [loading, setLoading] = useState(true);
  const [qrDialogOpen, setQrDialogOpen] = useState(false);
  const [imageUploadOpen, setImageUploadOpen] = useState(false);

  const fetchReptile = async () => {
    if (!id) return;

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("reptiles")
        .select("*")
        .eq("id", id)
        .maybeSingle();

      if (error) throw error;

      if (!data) {
        toast.error("Reptile introuvable");
        navigate("/");
        return;
      }

      setReptile(data);
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

  const handleImageUploadSuccess = (url: string) => {
    if (reptile) {
      setReptile({ ...reptile, image_url: url });
    }
    fetchReptile();
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
          onClick={() => navigate("/")}
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
                {reptile.image_url && (
                  <img 
                    src={reptile.image_url} 
                    alt={reptile.name}
                    className="w-full h-full object-cover"
                  />
                )}
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
              </div>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-2xl">{reptile.name}</CardTitle>
                    <p className="text-sm text-muted-foreground">{reptile.species}</p>
                  </div>
                  <Badge variant="secondary" className="bg-accent/20 text-accent-foreground border-accent/30">
                    {calculateAge(reptile.birth_date)}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">{t("reptile.sex")}</span>
                  <Badge variant="outline" className="inline-flex flex-col items-center justify-center gap-0.5 whitespace-nowrap leading-none">
                    <span className="text-xs md:text-sm leading-none">
                      {reptile.sex === "male" ? t("reptile.male") : reptile.sex === "female" ? t("reptile.female") : t("reptile.unknown")}
                    </span>
                    <span className="h-4 leading-none text-sm flex items-center justify-center">
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
              </CardContent>
            </Card>
          </div>

          {/* Contenu principal avec onglets */}
          <div className="lg:col-span-2">
            <Tabs defaultValue="overview" className="w-full">
              <TabsList className="grid w-full grid-cols-4">
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
              </TabsList>
              
              <TabsContent value="overview" className="space-y-4">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
                    <CardTitle>{t("reptile.generalInfo")}</CardTitle>
                    <EditReptileDialog
                      reptileId={reptile.id}
                      currentBirthDate={reptile.birth_date}
                      currentPurchaseDate={reptile.purchase_date}
                      currentWeight={reptile.weight}
                      onUpdate={fetchReptile}
                    />
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
                <FeedingTab reptileId={reptile.id} />
              </TabsContent>
              
              <TabsContent value="reproduction">
                <ReproductionTab reptileId={reptile.id} reptileSex={reptile.sex} reptileSpecies={reptile.species} />
              </TabsContent>
              
              <TabsContent value="health" className="space-y-4">
                <HealthTab reptileId={reptile.id} />
              </TabsContent>
            </Tabs>
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
      </main>
    </div>
  );
};

export default ReptileDetail;
