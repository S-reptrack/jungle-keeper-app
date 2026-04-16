import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useTranslation } from "react-i18next";
import FeedingIntervalCard from "./FeedingIntervalCard";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { supabase } from "@/integrations/supabase/client";
import AddRodentDialog from "./AddRodentDialog";
import AddFeedingDialog from "./AddFeedingDialog";
import { format } from "date-fns";
import { fr, enUS, de, es, it, pt, nl, pl, ru, ja, zhCN, hi, th, id as idLocale } from "date-fns/locale";
import { Trash2, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

const localeMap: Record<string, any> = { fr, en: enUS, de, es, it, pt, nl, pl, ru, ja, zh: zhCN, hi, th, id: idLocale };

interface Rodent {
  id: string; type: string; stage: string; weight: number | null; quantity: number; purchase_date: string; notes: string | null;
}
interface Feeding {
  id: string; rodent_type: string; rodent_stage: string; quantity: number; feeding_date: string; notes: string | null; prey_state: string | null; calcium: boolean; vitamins: boolean;
}
interface FeedingTabProps {
  reptileId: string; species?: string; readOnly?: boolean;
}

const FeedingTab = ({ reptileId, species, readOnly = false }: FeedingTabProps) => {
  const { t, i18n } = useTranslation();
  const [rodents, setRodents] = useState<Rodent[]>([]);
  const [feedings, setFeedings] = useState<Feeding[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const FEEDINGS_PER_PAGE = 6;
  const dateLocale = localeMap[i18n.language] || enUS;

  const fetchRodents = async () => {
    try {
      const { data, error } = await supabase.from("rodents").select("*").order("purchase_date", { ascending: false });
      if (error) throw error;
      setRodents(data || []);
    } catch (error) {
      console.error("Error fetching rodents:", error);
      toast.error(t("feedingTab.rodentLoadError"));
    } finally {
      setLoading(false);
    }
  };

  const fetchFeedings = async () => {
    try {
      const { data, error } = await supabase.from("feedings").select("*").eq("reptile_id", reptileId).order("feeding_date", { ascending: false });
      if (error) throw error;
      setFeedings(data || []);
    } catch (error) {
      console.error("Error fetching feedings:", error);
      toast.error(t("feedingTab.feedingLoadError"));
    }
  };

  useEffect(() => { fetchRodents(); fetchFeedings(); }, [reptileId]);

  const handleDeleteRodent = async (id: string) => {
    try {
      const { error } = await supabase.from("rodents").delete().eq("id", id);
      if (error) throw error;
      toast.success(t("feedingTab.rodentDeleted"));
      fetchRodents();
    } catch (error) {
      console.error("Error deleting rodent:", error);
      toast.error(t("feedingTab.deleteError"));
    }
  };

  const handleDeleteFeeding = async (id: string) => {
    try {
      const { error } = await supabase.from("feedings").delete().eq("id", id);
      if (error) throw error;
      toast.success(t("feedingTab.feedingDeleted"));
      const totalPages = Math.ceil((feedings.length - 1) / FEEDINGS_PER_PAGE);
      if (currentPage > totalPages && totalPages > 0) setCurrentPage(totalPages);
      fetchFeedings();
    } catch (error) {
      console.error("Error deleting feeding:", error);
      toast.error(t("feedingTab.deleteError"));
    }
  };

  const getTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      rat: t("feeding.rats.title"), mouse: t("feeding.mice.title"), rabbit: t("feeding.rabbits.title"),
      insect: t("feeding.insects.title"), vegetable: t("feeding.vegetables.title"), fruit: t("feeding.fruits.title"), pellet: t("feeding.pellets.title"),
    };
    return labels[type] || type;
  };

  const getStageLabel = (type: string, stage: string) => {
    const typeToKey: Record<string, string> = { rat: "rats", mouse: "mice", rabbit: "rabbits", insect: "insects", vegetable: "vegetables", fruit: "fruits", pellet: "pellets" };
    const key = typeToKey[type] || type;
    return t(`feeding.${key}.${stage}`) || stage;
  };

  const rats = [
    { stage: t("feeding.rats.pinky"), weight: "2-5g" }, { stage: t("feeding.rats.fuzzy"), weight: "6-15g" },
    { stage: t("feeding.rats.hopper"), weight: "16-30g" }, { stage: t("feeding.rats.weaner"), weight: "31-50g" },
    { stage: t("feeding.rats.small"), weight: "51-90g" }, { stage: t("feeding.rats.medium"), weight: "91-170g" },
    { stage: t("feeding.rats.large"), weight: "171-300g" }, { stage: t("feeding.rats.jumbo"), weight: "301-400g" },
    { stage: t("feeding.rats.extraLarge"), weight: "400g+" },
  ];

  const mice = [
    { stage: t("feeding.mice.pinky"), weight: "1-2g" }, { stage: t("feeding.mice.fuzzy"), weight: "3-5g" },
    { stage: t("feeding.mice.hopper"), weight: "6-10g" }, { stage: t("feeding.mice.weaner"), weight: "11-15g" },
    { stage: t("feeding.mice.small"), weight: "16-20g" }, { stage: t("feeding.mice.medium"), weight: "21-30g" },
    { stage: t("feeding.mice.large"), weight: "31-40g" }, { stage: t("feeding.mice.jumbo"), weight: "40g+" },
  ];

  const rabbits = [
    { stage: t("feeding.rabbits.baby"), weight: "50-150g" }, { stage: t("feeding.rabbits.small"), weight: "151-400g" },
    { stage: t("feeding.rabbits.medium"), weight: "401-800g" }, { stage: t("feeding.rabbits.large"), weight: "801-1200g" },
    { stage: t("feeding.rabbits.extraLarge"), weight: "1200g+" },
  ];

  const insects = [
    { stage: t("feeding.insects.cricket"), weight: "0.3-0.5g" }, { stage: t("feeding.insects.dubia"), weight: "0.5-3g" },
    { stage: t("feeding.insects.locust"), weight: "1-3g" }, { stage: t("feeding.insects.mealworm"), weight: "0.1-0.2g" },
    { stage: t("feeding.insects.superworm"), weight: "0.5-1g" }, { stage: t("feeding.insects.waxworm"), weight: "0.2-0.3g" },
    { stage: t("feeding.insects.hornworm"), weight: "3-10g" }, { stage: t("feeding.insects.silkworm"), weight: "1-3g" },
    { stage: t("feeding.insects.blackSoldierFly"), weight: "0.1-0.2g" },
  ];

  const totalPages = Math.ceil(feedings.length / FEEDINGS_PER_PAGE);
  const startIndex = (currentPage - 1) * FEEDINGS_PER_PAGE;
  const paginatedFeedings = feedings.slice(startIndex, startIndex + FEEDINGS_PER_PAGE);

  return (
    <div className="space-y-6">
      <FeedingIntervalCard reptileId={reptileId} readOnly={readOnly} />
      
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">{t("feedingTab.mealHistory")}</h2>
        {!readOnly && <AddFeedingDialog reptileId={reptileId} species={species} onFeedingAdded={() => { setCurrentPage(1); fetchFeedings(); }} />}
      </div>

      {loading ? (
        <Card><CardContent className="py-8"><p className="text-muted-foreground text-center">{t("common.loading")}</p></CardContent></Card>
      ) : feedings.length > 0 ? (
        <Card>
          <CardHeader><CardTitle>{t("feedingTab.mealsGiven")}</CardTitle></CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t("feedingTab.date")}</TableHead>
                  <TableHead>{t("feedingTab.type")}</TableHead>
                  <TableHead>{t("feedingTab.stage")}</TableHead>
                  <TableHead>{t("feedingTab.qty")}</TableHead>
                  <TableHead>{t("feedingTab.state")}</TableHead>
                  <TableHead>{t("feedingTab.notes")}</TableHead>
                  <TableHead className="text-right">{t("feedingTab.actions")}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedFeedings.map((feeding) => (
                  <TableRow key={feeding.id}>
                    <TableCell>{format(new Date(feeding.feeding_date), "dd MMM yyyy", { locale: dateLocale })}</TableCell>
                    <TableCell className="font-medium">{getTypeLabel(feeding.rodent_type)}</TableCell>
                    <TableCell>{getStageLabel(feeding.rodent_type, feeding.rodent_stage)}</TableCell>
                    <TableCell>{feeding.quantity}</TableCell>
                    <TableCell>
                      {feeding.prey_state ? (
                        <span className={`text-xs px-2 py-0.5 rounded-full ${feeding.prey_state === 'live' ? 'bg-green-500/15 text-green-600 dark:text-green-400' : 'bg-muted text-muted-foreground'}`}>
                          {feeding.prey_state === 'live' ? t("feedingTab.live") : t("feedingTab.dead")}
                        </span>
                      ) : "-"}
                    </TableCell>
                    <TableCell className="max-w-[200px] truncate">{feeding.notes || "-"}</TableCell>
                    <TableCell className="text-right">
                      {!readOnly && (
                        <Button variant="ghost" size="sm" onClick={() => handleDeleteFeeding(feeding.id)} className="text-destructive hover:text-destructive">
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            {totalPages > 1 && (
              <div className="flex items-center justify-between px-4 py-4 border-t">
                <div className="text-sm text-muted-foreground">
                  {t("feedingTab.page", { current: currentPage, total: totalPages, count: feedings.length })}
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={() => setCurrentPage((p) => Math.max(1, p - 1))} disabled={currentPage === 1}>
                    <ChevronLeft className="w-4 h-4 mr-1" />{t("feedingTab.previous")}
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages}>
                    {t("feedingTab.next")}<ChevronRight className="w-4 h-4 ml-1" />
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      ) : (
        <Card><CardContent className="py-8"><p className="text-muted-foreground text-center">{t("feedingTab.noMeals")}</p></CardContent></Card>
      )}

      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">{t("feedingTab.rodentManagement")}</h2>
        {!readOnly && <AddRodentDialog onRodentAdded={fetchRodents} />}
      </div>

      {loading ? (
        <Card><CardContent className="py-8"><p className="text-muted-foreground text-center">{t("common.loading")}</p></CardContent></Card>
      ) : rodents.length > 0 ? (
        <Card>
          <CardHeader><CardTitle>{t("feedingTab.rodentInventory")}</CardTitle></CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t("feedingTab.type")}</TableHead>
                  <TableHead>{t("feedingTab.stage")}</TableHead>
                  <TableHead>{t("feedingTab.weight")}</TableHead>
                  <TableHead>{t("feedingTab.quantity")}</TableHead>
                  <TableHead>{t("feedingTab.purchaseDate")}</TableHead>
                  <TableHead>{t("feedingTab.notes")}</TableHead>
                  <TableHead className="text-right">{t("feedingTab.actions")}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rodents.map((rodent) => (
                  <TableRow key={rodent.id}>
                    <TableCell className="font-medium">{getTypeLabel(rodent.type)}</TableCell>
                    <TableCell>{getStageLabel(rodent.type, rodent.stage)}</TableCell>
                    <TableCell>{rodent.weight ? `${rodent.weight}g` : "-"}</TableCell>
                    <TableCell>{rodent.quantity}</TableCell>
                    <TableCell>{format(new Date(rodent.purchase_date), "dd MMM yyyy", { locale: dateLocale })}</TableCell>
                    <TableCell className="max-w-[200px] truncate">{rodent.notes || "-"}</TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="sm" onClick={() => handleDeleteRodent(rodent.id)} className="text-destructive hover:text-destructive">
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      ) : null}

      <Card><CardHeader><CardTitle>{t("feeding.rats.title")}</CardTitle></CardHeader><CardContent><Table><TableHeader><TableRow><TableHead>{t("feeding.stage")}</TableHead><TableHead className="text-right">{t("feeding.weight")}</TableHead></TableRow></TableHeader><TableBody>{rats.map((r, i) => (<TableRow key={i}><TableCell className="font-medium">{r.stage}</TableCell><TableCell className="text-right">{r.weight}</TableCell></TableRow>))}</TableBody></Table></CardContent></Card>
      <Card><CardHeader><CardTitle>{t("feeding.mice.title")}</CardTitle></CardHeader><CardContent><Table><TableHeader><TableRow><TableHead>{t("feeding.stage")}</TableHead><TableHead className="text-right">{t("feeding.weight")}</TableHead></TableRow></TableHeader><TableBody>{mice.map((m, i) => (<TableRow key={i}><TableCell className="font-medium">{m.stage}</TableCell><TableCell className="text-right">{m.weight}</TableCell></TableRow>))}</TableBody></Table></CardContent></Card>
      <Card><CardHeader><CardTitle>{t("feeding.rabbits.title")}</CardTitle></CardHeader><CardContent><Table><TableHeader><TableRow><TableHead>{t("feeding.stage")}</TableHead><TableHead className="text-right">{t("feeding.weight")}</TableHead></TableRow></TableHeader><TableBody>{rabbits.map((r, i) => (<TableRow key={i}><TableCell className="font-medium">{r.stage}</TableCell><TableCell className="text-right">{r.weight}</TableCell></TableRow>))}</TableBody></Table></CardContent></Card>
      <Card><CardHeader><CardTitle>{t("feeding.insects.title")}</CardTitle></CardHeader><CardContent><Table><TableHeader><TableRow><TableHead>{t("feeding.stage")}</TableHead><TableHead className="text-right">{t("feeding.weight")}</TableHead></TableRow></TableHeader><TableBody>{insects.map((ins, i) => (<TableRow key={i}><TableCell className="font-medium">{ins.stage}</TableCell><TableCell className="text-right">{ins.weight}</TableCell></TableRow>))}</TableBody></Table></CardContent></Card>
    </div>
  );
};

export default FeedingTab;
