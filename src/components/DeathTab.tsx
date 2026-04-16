import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { fr, enUS, de, es, it, pt, nl, pl, ru, ja, zhCN, hi, th, id as idLocale } from "date-fns/locale";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

const localeMap: Record<string, any> = { fr, en: enUS, de, es, it, pt, nl, pl, ru, ja, zh: zhCN, hi, th, id: idLocale };

interface DeathTabProps {
  reptileId: string;
  reptileName: string;
}

const DeathTab = ({ reptileId, reptileName }: DeathTabProps) => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const [date, setDate] = useState<Date>();
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);
  const dateLocale = localeMap[i18n.language] || enUS;

  const handleSubmit = async () => {
    if (!date) {
      toast.error(t("deathTab.selectDateError"));
      return;
    }

    try {
      setLoading(true);

      const { error } = await supabase
        .from("reptiles")
        .update({
          status: "deceased",
          status_date: format(date, "yyyy-MM-dd"),
          archive_notes: notes || null,
        })
        .eq("id", reptileId);

      if (error) throw error;

      toast.success(t("deathTab.success", { name: reptileName }));
      navigate("/reptiles");
    } catch (error) {
      console.error("Error archiving reptile:", error);
      toast.error(t("deathTab.error"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Heart className="w-5 h-5" />
          {t("deathTab.title")}
        </CardTitle>
        <CardDescription>
          {t("deathTab.description", { name: reptileName })}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label>{t("deathTab.deathDate")}</Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "w-full justify-start text-left font-normal",
                  !date && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {date ? format(date, "PPP", { locale: dateLocale }) : t("deathTab.selectDate")}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
              <Calendar
                mode="single"
                selected={date}
                onSelect={setDate}
                disabled={(date) => date > new Date()}
                initialFocus
                locale={dateLocale}
                className="pointer-events-auto"
              />
            </PopoverContent>
          </Popover>
        </div>

        <div className="space-y-2">
          <Label>{t("deathTab.notes")}</Label>
          <Textarea
            placeholder={t("deathTab.notesPlaceholder")}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={4}
          />
        </div>

        <div className="pt-4">
          <Button 
            onClick={handleSubmit} 
            disabled={loading || !date}
            className="w-full"
            variant="destructive"
          >
            {loading ? t("deathTab.submitting") : t("deathTab.submit")}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default DeathTab;
