import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Plus, Calendar as CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { useTranslation } from "react-i18next";
import { fr, enUS, de, es, it, pt, nl, pl, ru, ja, zhCN, hi, th, id as idLocale } from "date-fns/locale";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const localeMap: Record<string, any> = { fr, en: enUS, de, es, it, pt, nl, pl, ru, ja, zh: zhCN, hi, th, id: idLocale };

const formSchema = z.object({
  weight: z.string().min(1, "Weight is required"),
  measurement_date: z.date(),
  notes: z.string().optional(),
});

interface AddWeightRecordDialogProps {
  reptileId: string;
  onSuccess: () => void;
}

const AddWeightRecordDialog = ({ reptileId, onSuccess }: AddWeightRecordDialogProps) => {
  const { t, i18n } = useTranslation();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const dateLocale = localeMap[i18n.language] || enUS;

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      weight: "",
      measurement_date: new Date(),
      notes: "",
    },
  });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        toast.error(t("addWeight.authError"));
        return;
      }

      const { error } = await supabase.from("weight_records").insert({
        reptile_id: reptileId,
        user_id: user.id,
        weight: parseFloat(values.weight),
        measurement_date: format(values.measurement_date, "yyyy-MM-dd"),
        notes: values.notes || null,
      });

      if (error) throw error;

      await supabase.from("reptiles").update({
        weight: parseFloat(values.weight),
      }).eq("id", reptileId);

      toast.success(t("addWeight.success"));
      setOpen(false);
      form.reset();
      onSuccess();
    } catch (error) {
      console.error("Error adding weight record:", error);
      toast.error(t("addWeight.error"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" className="gap-2">
          <Plus className="w-4 h-4" />
          {t("addWeight.addButton")}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{t("addWeight.title")}</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="weight"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("addWeight.weightGrams")}</FormLabel>
                  <FormControl>
                    <Input type="number" step="0.1" placeholder="150" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="measurement_date"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>{t("addWeight.measurementDate")}</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant="outline"
                          className={cn("w-full pl-3 text-left font-normal", !field.value && "text-muted-foreground")}
                        >
                          {field.value ? format(field.value, "PPP", { locale: dateLocale }) : <span>{t("addWeight.selectDate")}</span>}
                          <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0 z-[100]" align="start">
                      <Calendar
                        mode="single"
                        selected={field.value}
                        onSelect={field.onChange}
                        disabled={(date) => date > new Date()}
                        initialFocus
                        locale={dateLocale}
                        className={cn("p-3 pointer-events-auto")}
                      />
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("addWeight.notesOptional")}</FormLabel>
                  <FormControl>
                    <Textarea placeholder={t("addWeight.notesPlaceholder")} className="resize-none" rows={3} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end gap-3">
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                {t("addWeight.cancel")}
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? t("addWeight.saving") : t("addWeight.save")}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default AddWeightRecordDialog;
