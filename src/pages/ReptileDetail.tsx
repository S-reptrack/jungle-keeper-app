import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Calendar, Scale, QrCode } from "lucide-react";
import { useTranslation } from "react-i18next";
import Navigation from "@/components/Navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import ReproductionTab from "@/components/ReproductionTab";

const ReptileDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { t } = useTranslation();

  // TODO: Récupérer les données depuis la base de données
  const reptile = {
    id: id || "1",
    name: "Kaa",
    species: "Python royal",
    scientificName: "Python regius",
    category: "snake",
    sex: "female",
    morph: "Ghost",
    age: "3 ans",
    birthDate: "2021-06-15",
    weight: "1.5 kg",
    lastFed: "Il y a 5 jours",
    purchaseDate: "2022-01-10",
    image: undefined,
  };

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
              <div className="h-64 bg-gradient-to-br from-jungle-mid to-jungle-light relative overflow-hidden">
                {reptile.image && (
                  <img 
                    src={reptile.image} 
                    alt={reptile.name}
                    className="w-full h-full object-cover"
                  />
                )}
                <div className="absolute top-3 right-3">
                  <button className="p-2 bg-card/90 backdrop-blur-sm rounded-lg hover:bg-accent transition-colors">
                    <QrCode className="w-5 h-5 text-foreground" />
                  </button>
                </div>
              </div>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-2xl">{reptile.name}</CardTitle>
                    <p className="text-sm text-muted-foreground italic">{reptile.scientificName}</p>
                    <p className="text-sm text-muted-foreground">{reptile.species}</p>
                  </div>
                  <Badge variant="secondary" className="bg-accent/20 text-accent-foreground border-accent/30">
                    {reptile.age}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">{t("reptile.sex")}</span>
                  <Badge variant="outline">
                    {reptile.sex === "male" ? "♂ " + t("reptile.male") : 
                     reptile.sex === "female" ? "♀ " + t("reptile.female") : 
                     t("reptile.unknown")}
                  </Badge>
                </div>
                {reptile.morph && (
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">{t("reptile.morph")}</span>
                    <span className="font-medium text-foreground">{reptile.morph}</span>
                  </div>
                )}
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground flex items-center gap-2">
                    <Scale className="w-4 h-4" />
                    {t("reptile.weight")}
                  </span>
                  <span className="font-medium text-foreground">{reptile.weight}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    {t("reptile.lastFed")}
                  </span>
                  <span className="font-medium text-foreground">{reptile.lastFed}</span>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Contenu principal avec onglets */}
          <div className="lg:col-span-2">
            <Tabs defaultValue="overview" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="overview">{t("reptile.tabs.overview")}</TabsTrigger>
                <TabsTrigger value="reproduction">{t("reptile.tabs.reproduction")}</TabsTrigger>
                <TabsTrigger value="health">{t("reptile.tabs.health")}</TabsTrigger>
              </TabsList>
              
              <TabsContent value="overview" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>{t("reptile.generalInfo")}</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-muted-foreground">{t("reptile.birthDate")}</p>
                        <p className="font-medium">{reptile.birthDate}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">{t("reptile.purchaseDate")}</p>
                        <p className="font-medium">{reptile.purchaseDate}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="reproduction">
                <ReproductionTab reptileId={reptile.id} reptileSex={reptile.sex} reptileSpecies={reptile.species} />
              </TabsContent>
              
              <TabsContent value="health" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>{t("reptile.tabs.health")}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground">{t("reptile.noHealthRecords")}</p>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </main>
    </div>
  );
};

export default ReptileDetail;
