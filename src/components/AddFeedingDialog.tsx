import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useTranslation } from "react-i18next";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon, Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

const formSchema = z.object({
  rodentType: z.string().min(1, "Le type de rongeur est requis"),
  rodentStage: z.string().min(1, "Le stade est requis"),
  quantity: z.coerce.number().min(1, "La quantité doit être au moins 1"),
  feedingDate: z.date(),
  notes: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

interface AddFeedingDialogProps {
  reptileId: string;
  onFeedingAdded: () => void;
}

const AddFeedingDialog = ({ reptileId, onFeedingAdded }: AddFeedingDialogProps) => {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      rodentType: "",
      rodentStage: "",
      quantity: 1,
      feedingDate: new Date(),
      notes: "",
    },
  });

  const onSubmit = async (values: FormValues) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        toast.error("Vous devez être connecté");
        return;
      }

      const feedingData = {
        reptile_id: reptileId,
        user_id: user.id,
        rodent_type: values.rodentType,
        rodent_stage: values.rodentStage,
        quantity: values.quantity,
        feeding_date: format(values.feedingDate, "yyyy-MM-dd"),
        notes: values.notes || null,
      };

      const { error } = await supabase
        .from("feedings")
        .insert(feedingData);

      if (error) throw error;

      toast.success("Repas enregistré");
      form.reset();
      setOpen(false);
      onFeedingAdded();
    } catch (error) {
      console.error("Error adding feeding:", error);
      toast.error("Erreur lors de l'enregistrement du repas");
    }
  };

  const rodentTypes = [
    { value: "rat", label: t("feeding.rats.title") },
    { value: "mouse", label: t("feeding.mice.title") },
    { value: "rabbit", label: t("feeding.rabbits.title") },
  ];

  const getStagesForType = (type: string) => {
    const stages = {
      rat: ["pinky", "fuzzy", "hopper", "weaner", "small", "medium", "large", "jumbo", "extraLarge"],
      mouse: ["pinky", "fuzzy", "hopper", "weaner", "small", "medium", "large", "jumbo"],
      rabbit: ["baby", "small", "medium", "large", "extraLarge"],
    };
    return stages[type as keyof typeof stages] || [];
  };

  const selectedType = form.watch("rodentType");

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="w-4 h-4 mr-2" />
          Enregistrer un repas
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Enregistrer un repas</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="rodentType"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Type de rongeur</FormLabel>
                  <Select
                    onValueChange={(value) => {
                      field.onChange(value);
                      form.setValue("rodentStage", "");
                    }}
                    value={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Sélectionner un type" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent className="bg-card border-border">
                      {rodentTypes.map((type) => (
                        <SelectItem key={type.value} value={type.value}>
                          {type.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {selectedType && (
              <FormField
                control={form.control}
                name="rodentStage"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Stade</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Sélectionner un stade" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent className="bg-card border-border">
                        {getStagesForType(selectedType).map((stage) => (
                          <SelectItem key={stage} value={stage}>
                            {t(`feeding.${selectedType}s.${stage}`)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            <FormField
              control={form.control}
              name="quantity"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Quantité</FormLabel>
                  <FormControl>
                    <Input type="number" min="1" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="feedingDate"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Date du repas</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant="outline"
                          className={cn(
                            "w-full pl-3 text-left font-normal",
                            !field.value && "text-muted-foreground"
                          )}
                        >
                          {field.value ? (
                            format(field.value, "dd MMM yyyy", { locale: fr })
                          ) : (
                            <span>Sélectionner une date</span>
                          )}
                          <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0 z-50" align="start">
                      <Calendar
                        mode="single"
                        selected={field.value}
                        onSelect={field.onChange}
                        disabled={(date) => date > new Date()}
                        initialFocus
                        className="pointer-events-auto"
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
                  <FormLabel>Notes (optionnel)</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Remarques sur le repas..."
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex gap-2 justify-end">
              <Button
                type="button"
                variant="outline"
                onClick={() => setOpen(false)}
              >
                {t("common.cancel")}
              </Button>
              <Button type="submit">{t("common.save")}</Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default AddFeedingDialog;
