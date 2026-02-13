import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Plus, Trash2, CircleDot } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { format, type Locale } from "date-fns";
import { fr, enUS, de, es, it, pt, nl, pl, ru, ja, zhCN, hi, th, id } from "date-fns/locale";

interface BowelRecord {
  id: string;
  bowel_date: string;
  consistency: string;
  notes: string | null;
  created_at: string;
}

interface BowelSectionProps {
  reptileId: string;
  readOnly?: boolean;
}

const localeMap: Record<string, Locale> = {
  fr, en: enUS, de, es, it, pt, nl, pl, ru, ja, zh: zhCN, hi, th, id,
};

const BowelSection = ({ reptileId, readOnly = false }: BowelSectionProps) => {
  const { t, i18n } = useTranslation();
  const [records, setRecords] = useState<BowelRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [bowelDate, setBowelDate] = useState(new Date().toISOString().split("T")[0]);
  const [consistency, setConsistency] = useState("normal");
  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const consistencyOptions = [
    { value: "normal", label: t("bowel.normal"), color: "bg-green-500/20 text-green-700 dark:text-green-400 border-green-500/30" },
    { value: "liquid", label: t("bowel.liquid"), color: "bg-yellow-500/20 text-yellow-700 dark:text-yellow-400 border-yellow-500/30" },
    { value: "hard", label: t("bowel.hard"), color: "bg-orange-500/20 text-orange-700 dark:text-orange-400 border-orange-500/30" },
    { value: "abnormal", label: t("bowel.abnormal"), color: "bg-red-500/20 text-red-700 dark:text-red-400 border-red-500/30" },
  ];

  const fetchRecords = async () => {
    try {
      const { data, error } = await supabase
        .from("bowel_records")
        .select("*")
        .eq("reptile_id", reptileId)
        .order("bowel_date", { ascending: false });

      if (error) throw error;
      setRecords(data || []);
    } catch (error) {
      console.error("Error fetching bowel records:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRecords();
  }, [reptileId]);

  const handleSubmit = async () => {
    if (!bowelDate) {
      toast.error(t("bowel.dateRequired"));
      return;
    }

    setSubmitting(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error(t("bowel.loginRequired"));
        return;
      }

      const { error } = await supabase
        .from("bowel_records")
        .insert({
          reptile_id: reptileId,
          user_id: user.id,
          bowel_date: bowelDate,
          consistency,
          notes: notes || null,
        });

      if (error) throw error;

      toast.success(t("bowel.success"));
      setDialogOpen(false);
      setBowelDate(new Date().toISOString().split("T")[0]);
      setConsistency("normal");
      setNotes("");
      fetchRecords();
    } catch (error) {
      console.error("Error adding bowel record:", error);
      toast.error(t("bowel.error"));
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (recordId: string) => {
    const confirmDelete = window.confirm(t("bowel.deleteConfirm"));
    if (!confirmDelete) return;

    try {
      const { error } = await supabase
        .from("bowel_records")
        .delete()
        .eq("id", recordId);

      if (error) throw error;

      toast.success(t("bowel.deleted"));
      fetchRecords();
    } catch (error) {
      console.error("Error deleting bowel record:", error);
      toast.error(t("bowel.deleteError"));
    }
  };

  const getConsistencyBadge = (value: string) => {
    const option = consistencyOptions.find(o => o.value === value);
    if (!option) return null;
    return (
      <Badge variant="outline" className={option.color}>
        {option.label}
      </Badge>
    );
  };

  const formatDate = (dateString: string) => {
    const [year, month, day] = dateString.split("-").map(Number);
    const locale = localeMap[i18n.language] || enUS;
    return format(new Date(year, month - 1, day), "d MMMM yyyy", { locale });
  };

  const getInterval = (index: number): string | null => {
    if (index >= records.length - 1) return null;
    const current = new Date(records[index].bowel_date);
    const previous = new Date(records[index + 1].bowel_date);
    const diffDays = Math.floor((current.getTime() - previous.getTime()) / (1000 * 60 * 60 * 24));
    return `${diffDays} ${t("bowel.days")}`;
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
        <CardTitle className="flex items-center gap-2">
          <CircleDot className="w-5 h-5" />
          {t("bowel.title")}
        </CardTitle>
        {!readOnly && (
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button size="sm" className="gap-1">
                <Plus className="w-4 h-4" />
                {t("bowel.add")}
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{t("bowel.record")}</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 pt-2">
                <div>
                  <Label htmlFor="bowel-date">{t("bowel.date")}</Label>
                  <Input
                    id="bowel-date"
                    type="date"
                    value={bowelDate}
                    onChange={(e) => setBowelDate(e.target.value)}
                    max={new Date().toISOString().split("T")[0]}
                  />
                </div>
                <div>
                  <Label htmlFor="consistency">{t("bowel.consistency")}</Label>
                  <Select value={consistency} onValueChange={setConsistency}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {consistencyOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="bowel-notes">{t("bowel.notes")}</Label>
                  <Textarea
                    id="bowel-notes"
                    placeholder={t("bowel.notesPlaceholder")}
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    rows={3}
                  />
                </div>
                <Button
                  onClick={handleSubmit}
                  disabled={submitting}
                  className="w-full"
                >
                  {submitting ? t("bowel.saving") : t("bowel.save")}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </CardHeader>
      <CardContent>
        {records.length === 0 ? (
          <div className="text-center py-8">
            <CircleDot className="w-12 h-12 mx-auto text-muted-foreground/30 mb-3" />
            <p className="text-muted-foreground">{t("bowel.empty")}</p>
            {!readOnly && (
              <p className="text-sm text-muted-foreground mt-1">
                {t("bowel.emptyHint")}
              </p>
            )}
          </div>
        ) : (
          <div className="space-y-3">
            {records.map((record, index) => {
              const interval = getInterval(index);
              return (
                <div
                  key={record.id}
                  className="flex items-start justify-between p-3 rounded-lg border border-border bg-card hover:bg-accent/5 transition-colors"
                >
                  <div className="space-y-1 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-medium text-sm">
                        {formatDate(record.bowel_date)}
                      </span>
                      {getConsistencyBadge(record.consistency)}
                      {interval && (
                        <span className="text-xs text-muted-foreground">
                          (+{interval})
                        </span>
                      )}
                    </div>
                    {record.notes && (
                      <p className="text-sm text-muted-foreground">{record.notes}</p>
                    )}
                  </div>
                  {!readOnly && (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="shrink-0 text-destructive hover:text-destructive"
                      onClick={() => handleDelete(record.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default BowelSection;
