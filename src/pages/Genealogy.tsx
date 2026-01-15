import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import Navigation from "@/components/Navigation";
import { PremiumFeatureGate } from "@/components/PremiumFeatureGate";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Navigate, useNavigate } from "react-router-dom";
import { GitBranch, Plus, Trash2, User } from "lucide-react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";

interface Reptile {
  id: string;
  name: string;
  species: string;
  sex: string | null;
}

interface GenealogyLink {
  id: string;
  reptile_id: string;
  parent_id: string;
  parent_type: "mother" | "father";
  reptile: Reptile;
  parent: Reptile;
}

const Genealogy = () => {
  const { t } = useTranslation();
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [reptiles, setReptiles] = useState<Reptile[]>([]);
  const [genealogyLinks, setGenealogyLinks] = useState<GenealogyLink[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedChild, setSelectedChild] = useState<string>("");
  const [selectedMother, setSelectedMother] = useState<string>("");
  const [selectedFather, setSelectedFather] = useState<string>("");

  useEffect(() => {
    if (user) {
      fetchData();
    }
  }, [user]);

  const fetchData = async () => {
    try {
      // Fetch all reptiles
      const { data: reptileData } = await supabase
        .from("reptiles")
        .select("id, name, species, sex")
        .eq("user_id", user!.id)
        .in("status", ["active", "for_sale"])
        .order("name");

      setReptiles(reptileData || []);

      // Fetch genealogy links
      const { data: geneData } = await supabase
        .from("reptile_genealogy")
        .select(`
          id,
          reptile_id,
          parent_id,
          parent_type
        `)
        .eq("user_id", user!.id);

      // Map links with reptile details
      const linksWithDetails: GenealogyLink[] = [];
      for (const link of geneData || []) {
        const reptile = reptileData?.find(r => r.id === link.reptile_id);
        const parent = reptileData?.find(r => r.id === link.parent_id);
        if (reptile && parent) {
          linksWithDetails.push({
            ...link,
            parent_type: link.parent_type as "mother" | "father",
            reptile,
            parent
          });
        }
      }

      setGenealogyLinks(linksWithDetails);
    } catch (error) {
      console.error("Error fetching genealogy:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddLink = async () => {
    if (!selectedChild) {
      toast.error(t("genealogy.selectChild"));
      return;
    }

    const hasMother = selectedMother && selectedMother !== "none";
    const hasFather = selectedFather && selectedFather !== "none";

    if (!hasMother && !hasFather) {
      toast.error(t("genealogy.selectAtLeastOneParent"));
      return;
    }

    if (selectedChild === selectedMother || selectedChild === selectedFather) {
      toast.error(t("genealogy.cannotBeSameAnimal"));
      return;
    }

    try {
      const linksToInsert = [];
      
      if (hasMother) {
        linksToInsert.push({
          reptile_id: selectedChild,
          parent_id: selectedMother,
          parent_type: "mother",
          user_id: user!.id
        });
      }
      
      if (hasFather) {
        linksToInsert.push({
          reptile_id: selectedChild,
          parent_id: selectedFather,
          parent_type: "father",
          user_id: user!.id
        });
      }

      const { error } = await supabase.from("reptile_genealogy").insert(linksToInsert);

      if (error) throw error;

      toast.success(t("genealogy.linkAdded"));
      setDialogOpen(false);
      setSelectedChild("");
      setSelectedMother("");
      setSelectedFather("");
      fetchData();
    } catch (error: any) {
      if (error.code === "23505") {
        toast.error(t("genealogy.parentAlreadySet"));
      } else {
        toast.error(t("common.error"));
      }
    }
  };

  const handleDeleteLink = async (linkId: string) => {
    try {
      const { error } = await supabase
        .from("reptile_genealogy")
        .delete()
        .eq("id", linkId);

      if (error) throw error;
      toast.success(t("genealogy.linkRemoved"));
      fetchData();
    } catch (error) {
      toast.error(t("common.error"));
    }
  };

  // Group links by child reptile
  const groupedByChild = genealogyLinks.reduce((acc, link) => {
    if (!acc[link.reptile_id]) {
      acc[link.reptile_id] = { reptile: link.reptile, mother: null, father: null };
    }
    if (link.parent_type === "mother") {
      acc[link.reptile_id].mother = link;
    } else {
      acc[link.reptile_id].father = link;
    }
    return acc;
  }, {} as Record<string, { reptile: Reptile; mother: GenealogyLink | null; father: GenealogyLink | null }>);

  if (authLoading) {
    return <div className="min-h-screen flex items-center justify-center">Chargement...</div>;
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  const femaleReptiles = reptiles.filter(r => r.sex === "female");
  const maleReptiles = reptiles.filter(r => r.sex === "male");

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <main className="max-w-7xl mx-auto px-4 py-8 md:pt-24 pb-24">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <GitBranch className="w-8 h-8 text-primary" />
            {t("genealogy.title")}
          </h1>
        </div>

        <PremiumFeatureGate 
          featureName={t("genealogy.title")}
          featureDescription={t("genealogy.description")}
        >
          <div className="mb-6">
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="w-4 h-4 mr-2" />
                  {t("genealogy.addLink")}
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>{t("genealogy.addParentLink")}</DialogTitle>
                  <DialogDescription>
                    {t("genealogy.addParentLinkDescription")}
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label>{t("genealogy.childReptile")}</Label>
                    <Select value={selectedChild} onValueChange={setSelectedChild}>
                      <SelectTrigger>
                        <SelectValue placeholder={t("genealogy.selectChild")} />
                      </SelectTrigger>
                      <SelectContent>
                        {reptiles.map(r => (
                          <SelectItem key={r.id} value={r.id}>
                            {r.name} ({r.species})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label className="flex items-center gap-2">
                      <span className="text-pink-500">♀</span> {t("genealogy.mother")}
                    </Label>
                    <Select value={selectedMother} onValueChange={setSelectedMother}>
                      <SelectTrigger>
                        <SelectValue placeholder={t("genealogy.selectMother")} />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">{t("genealogy.unknown")}</SelectItem>
                        {femaleReptiles.filter(r => r.id !== selectedChild).map(r => (
                          <SelectItem key={r.id} value={r.id}>
                            {r.name} ({r.species})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label className="flex items-center gap-2">
                      <span className="text-blue-500">♂</span> {t("genealogy.father")}
                    </Label>
                    <Select value={selectedFather} onValueChange={setSelectedFather}>
                      <SelectTrigger>
                        <SelectValue placeholder={t("genealogy.selectFather")} />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">{t("genealogy.unknown")}</SelectItem>
                        {maleReptiles.filter(r => r.id !== selectedChild).map(r => (
                          <SelectItem key={r.id} value={r.id}>
                            {r.name} ({r.species})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <Button onClick={handleAddLink} className="w-full">
                    {t("genealogy.addLink")}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          {loading ? (
            <div className="flex items-center justify-center min-h-[300px]">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : Object.keys(groupedByChild).length === 0 ? (
            <Card>
              <CardContent className="text-center py-12">
                <GitBranch className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">{t("genealogy.noLinks")}</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {Object.values(groupedByChild).map(({ reptile, mother, father }) => (
                <Card key={reptile.id} className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => navigate(`/reptile/${reptile.id}`)}>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <User className="w-5 h-5" />
                      {reptile.name}
                    </CardTitle>
                    <CardDescription>{reptile.species}</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="bg-pink-500/10 text-pink-600 border-pink-200">
                          ♀ {t("genealogy.mother")}
                        </Badge>
                        <span className="text-sm">
                          {mother ? mother.parent.name : t("genealogy.unknown")}
                        </span>
                      </div>
                      {mother && (
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteLink(mother.id);
                          }}
                        >
                          <Trash2 className="w-4 h-4 text-destructive" />
                        </Button>
                      )}
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="bg-blue-500/10 text-blue-600 border-blue-200">
                          ♂ {t("genealogy.father")}
                        </Badge>
                        <span className="text-sm">
                          {father ? father.parent.name : t("genealogy.unknown")}
                        </span>
                      </div>
                      {father && (
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteLink(father.id);
                          }}
                        >
                          <Trash2 className="w-4 h-4 text-destructive" />
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </PremiumFeatureGate>
      </main>
    </div>
  );
};

export default Genealogy;
