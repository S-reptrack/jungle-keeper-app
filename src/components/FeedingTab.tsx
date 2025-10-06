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
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import AddRodentDialog from "./AddRodentDialog";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface Rodent {
  id: string;
  type: string;
  stage: string;
  weight?: number;
  quantity: number;
  purchase_date?: string;
  notes?: string;
}

const FeedingTab = () => {
  const { t } = useTranslation();
  const [rodents, setRodents] = useState<Rodent[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchRodents = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from("rodents")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setRodents(data || []);
    } catch (error) {
      console.error("Error fetching rodents:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRodents();
  }, []);

  const handleDelete = async (id: string) => {
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

  const getRodentTypeName = (type: string) => {
    const types: Record<string, string> = {
      rat: "Rat",
      mouse: "Souris",
      rabbit: "Lapin"
    };
    return types[type] || type;
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
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Inventaire de rongeurs</CardTitle>
          <AddRodentDialog onRodentAdded={fetchRodents} />
        </CardHeader>
        <CardContent>
          {loading ? (
            <p className="text-muted-foreground text-center py-4">Chargement...</p>
          ) : rodents.length === 0 ? (
            <p className="text-muted-foreground text-center py-4">
              Aucun rongeur dans l'inventaire. Ajoutez-en un pour commencer.
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Type</TableHead>
                  <TableHead>Stade</TableHead>
                  <TableHead className="text-right">Poids</TableHead>
                  <TableHead className="text-right">Quantité</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rodents.map((rodent) => (
                  <TableRow key={rodent.id}>
                    <TableCell className="font-medium">
                      {getRodentTypeName(rodent.type)}
                    </TableCell>
                    <TableCell>{rodent.stage}</TableCell>
                    <TableCell className="text-right">
                      {rodent.weight ? `${rodent.weight}g` : "-"}
                    </TableCell>
                    <TableCell className="text-right">{rodent.quantity}</TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(rodent.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

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
