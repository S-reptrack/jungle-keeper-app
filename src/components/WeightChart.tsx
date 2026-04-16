import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from "recharts";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { format, parseISO } from "date-fns";
import { fr, enUS, de, es, it, pt, nl, pl, ru, ja, zhCN, hi, th, id as idLocale } from "date-fns/locale";
import AddWeightRecordDialog from "./AddWeightRecordDialog";
import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

const localeMap: Record<string, any> = { fr, en: enUS, de, es, it, pt, nl, pl, ru, ja, zh: zhCN, hi, th, id: idLocale };

interface WeightRecord {
  id: string;
  weight: number;
  measurement_date: string;
  notes: string | null;
}

interface WeightChartProps {
  reptileId: string;
}

const WeightChart = ({ reptileId }: WeightChartProps) => {
  const { t, i18n } = useTranslation();
  const [records, setRecords] = useState<WeightRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const dateLocale = localeMap[i18n.language] || enUS;

  const fetchWeightRecords = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("weight_records")
        .select("*")
        .eq("reptile_id", reptileId)
        .order("measurement_date", { ascending: true });

      if (error) throw error;
      setRecords(data || []);
    } catch (error) {
      console.error("Error fetching weight records:", error);
      toast.error(t("weightChart.loadError"));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWeightRecords();
  }, [reptileId]);

  const handleDelete = async (id: string) => {
    try {
      const { error } = await supabase.from("weight_records").delete().eq("id", id);
      if (error) throw error;
      toast.success(t("weightChart.deleteSuccess"));
      fetchWeightRecords();
    } catch (error) {
      console.error("Error deleting weight record:", error);
      toast.error(t("weightChart.deleteError"));
    } finally {
      setDeleteId(null);
    }
  };

  const chartData = records.map((record) => ({
    date: format(parseISO(record.measurement_date), "dd MMM yyyy", { locale: dateLocale }),
    weight: Number(record.weight),
    fullDate: record.measurement_date,
  }));

  const chartConfig = {
    weight: {
      label: t("weightChart.weightLabel"),
      color: "hsl(var(--primary))",
    },
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{t("weightChart.title")}</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">{t("common.loading")}</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <div>
            <CardTitle>{t("weightChart.title")}</CardTitle>
            <CardDescription>
              {records.length > 0
                ? (records.length > 1
                    ? t("weightChart.measurementsPlural", { count: records.length })
                    : t("weightChart.measurements", { count: records.length }))
                : t("weightChart.noMeasurements")}
            </CardDescription>
          </div>
          <AddWeightRecordDialog reptileId={reptileId} onSuccess={fetchWeightRecords} />
        </CardHeader>
        <CardContent>
          {records.length > 0 ? (
            <div className="space-y-6">
              <ChartContainer config={chartConfig} className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis dataKey="date" className="text-xs" tick={{ fill: "hsl(var(--muted-foreground))" }} />
                    <YAxis className="text-xs" tick={{ fill: "hsl(var(--muted-foreground))" }} label={{ value: t("weightChart.weightUnit"), angle: -90, position: "insideLeft" }} />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Line type="monotone" dataKey="weight" stroke="hsl(var(--primary))" strokeWidth={2} dot={{ fill: "hsl(var(--primary))", r: 4 }} activeDot={{ r: 6 }} />
                  </LineChart>
                </ResponsiveContainer>
              </ChartContainer>

              <div className="space-y-2">
                <h4 className="font-semibold text-sm">{t("weightChart.history")}</h4>
                <div className="space-y-2">
                  {records.slice().reverse().map((record) => (
                    <div key={record.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors">
                      <div className="flex-1">
                        <div className="flex items-center gap-3">
                          <p className="font-medium">{record.weight}g</p>
                          <p className="text-sm text-muted-foreground">
                            {format(parseISO(record.measurement_date), "dd MMMM yyyy", { locale: dateLocale })}
                          </p>
                        </div>
                        {record.notes && <p className="text-sm text-muted-foreground mt-1">{record.notes}</p>}
                      </div>
                      <Button variant="ghost" size="sm" onClick={() => setDeleteId(record.id)} className="text-destructive hover:text-destructive">
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-muted-foreground mb-4">{t("weightChart.noData")}</p>
            </div>
          )}
        </CardContent>
      </Card>

      <AlertDialog open={deleteId !== null} onOpenChange={(open) => !open && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t("weightChart.confirmDelete")}</AlertDialogTitle>
            <AlertDialogDescription>{t("weightChart.confirmDeleteDesc")}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t("weightChart.cancel")}</AlertDialogCancel>
            <AlertDialogAction onClick={() => deleteId && handleDelete(deleteId)}>
              {t("weightChart.delete")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default WeightChart;
