import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useTranslation } from "react-i18next";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { supabase } from "@/integrations/supabase/client";
import AddRodentDialog from "./AddRodentDialog";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface Rodent {
  id: string;
  type: string;
  stage: string;
  weight: number | null;
  quantity: number;
  purchase_date: string;
  notes: string | null;
}

const FeedingTab = () => {
  const { t } = useTranslation();
  const [rodents, setRodents] = useState<Rodent[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchRodents = async () => {
    try {
      const { data, error } = await supabase
        .from("rodents")
        .select("*")
        .order("purchase_date", { ascending: false });

      if (error) throw error;
      setRodents(data || []);
    } catch (error) {
      console.error("Error fetching rodents:", error);
      toast.error("Erreur lors du chargement des rongeurs");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRodents();
  }, []);

  const handleDeleteRodent = async (id: string) => {
    try {
      const { error } = await supabase
        .from("rodents")
        .delete()
        .eq("id", id);

      if (error) throw error;
      
      toast.success("Rongeur supprimé");
      fetchRodents();
    } catch (error) {
      console.error("Error deleting rodent:", error);
      toast.error("Erreur lors de la suppression");
    }
  };

  const getTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      rat: t("feeding.rats.title"),
      mouse: t("feeding.mice.title"),
      rabbit: t("feeding.rabbits.title"),
    };
    return labels[type] || type;
  };

  const getStageLabel = (type: string, stage: string) => {
    return t(`feeding.${type}s.${stage}`) || stage;
  };

  const rats = [
    { stage: t("feeding.rats.pinky"), weight: "2-5g" },
    { stage: t("feeding.rats.fuzzy"), weight: "6-15g" },
    { stage: t("feeding.rats.hopper"), weight: "16-30g" },
    { stage: t("feeding.rats.weaner"), weight: "31-50g" },
    { stage: t("feeding.rats.small"), weight: "51-90g" },
    { stage: t("feeding.rats.medium"), weight: "91-170g" },
    { stage: t("feeding.rats.large"), weight: "171-300g" },
    { stage: t("feeding.rats.jumbo"), weight: "301-400g" },
    { stage: t("feeding.rats.extraLarge"), weight: "400g+" },
  ];

  const mice = [
    { stage: t("feeding.mice.pinky"), weight: "1-2g" },
    { stage: t("feeding.mice.fuzzy"), weight: "3-5g" },
    { stage: t("feeding.mice.hopper"), weight: "6-10g" },
    { stage: t("feeding.mice.weaner"), weight: "11-15g" },
    { stage: t("feeding.mice.small"), weight: "16-20g" },
    { stage: t("feeding.mice.medium"), weight: "21-30g" },
    { stage: t("feeding.mice.large"), weight: "31-40g" },
    { stage: t("feeding.mice.jumbo"), weight: "40g+" },
  ];

  const rabbits = [
    { stage: t("feeding.rabbits.baby"), weight: "50-150g" },
    { stage: t("feeding.rabbits.small"), weight: "151-400g" },
    { stage: t("feeding.rabbits.medium"), weight: "401-800g" },
    { stage: t("feeding.rabbits.large"), weight: "801-1200g" },
    { stage: t("feeding.rabbits.extraLarge"), weight: "1200g+" },
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Gestion des rongeurs</h2>
        <AddRodentDialog onRodentAdded={fetchRodents} />
      </div>

      {loading ? (
        <Card>
          <CardContent className="py-8">
            <p className="text-muted-foreground text-center">Chargement...</p>
          </CardContent>
        </Card>
      ) : rodents.length > 0 ? (
        <Card>
          <CardHeader>
            <CardTitle>Inventaire des rongeurs</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Type</TableHead>
                  <TableHead>Stade</TableHead>
                  <TableHead>Poids</TableHead>
                  <TableHead>Quantité</TableHead>
                  <TableHead>Date d'achat</TableHead>
                  <TableHead>Notes</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rodents.map((rodent) => (
                  <TableRow key={rodent.id}>
                    <TableCell className="font-medium">{getTypeLabel(rodent.type)}</TableCell>
                    <TableCell>{getStageLabel(rodent.type, rodent.stage)}</TableCell>
                    <TableCell>{rodent.weight ? `${rodent.weight}g` : "-"}</TableCell>
                    <TableCell>{rodent.quantity}</TableCell>
                    <TableCell>
                      {format(new Date(rodent.purchase_date), "dd MMM yyyy", { locale: fr })}
                    </TableCell>
                    <TableCell className="max-w-[200px] truncate">{rodent.notes || "-"}</TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteRodent(rodent.id)}
                        className="text-destructive hover:text-destructive"
                      >
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

      <Card>
        <CardHeader>
          <CardTitle>{t("feeding.rats.title")}</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t("feeding.stage")}</TableHead>
                <TableHead className="text-right">{t("feeding.weight")}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rats.map((rat, index) => (
                <TableRow key={index}>
                  <TableCell className="font-medium">{rat.stage}</TableCell>
                  <TableCell className="text-right">{rat.weight}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{t("feeding.mice.title")}</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t("feeding.stage")}</TableHead>
                <TableHead className="text-right">{t("feeding.weight")}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {mice.map((mouse, index) => (
                <TableRow key={index}>
                  <TableCell className="font-medium">{mouse.stage}</TableCell>
                  <TableCell className="text-right">{mouse.weight}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{t("feeding.rabbits.title")}</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t("feeding.stage")}</TableHead>
                <TableHead className="text-right">{t("feeding.weight")}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rabbits.map((rabbit, index) => (
                <TableRow key={index}>
                  <TableCell className="font-medium">{rabbit.stage}</TableCell>
                  <TableCell className="text-right">{rabbit.weight}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default FeedingTab;
