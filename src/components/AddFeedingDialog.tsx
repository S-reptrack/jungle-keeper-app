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
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon, Plus } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { getAllowedFoodTypes, type FoodType } from "@/data/speciesDiets";
import FoodTypePicker, { allFoodTypes } from "@/components/FoodTypePicker";

const formSchema = z.object({
  rodentType: z.string().min(1, "Le type d'aliment est requis"),
  rodentStage: z.string().min(1, "Le stade est requis"),
  quantity: z.coerce.number().min(0, "La quantité doit être positive"),
  feedingDate: z.date(),
  preyState: z.enum(["live", "dead"]).default("dead"),
  calcium: z.boolean().default(false),
  vitamins: z.boolean().default(false),
  refused: z.boolean().default(false),
  notes: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

interface AddFeedingDialogProps {
  reptileId: string;
  species?: string;
  onFeedingAdded: () => void;
}

const AddFeedingDialog = ({ reptileId, species, onFeedingAdded }: AddFeedingDialogProps) => {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      rodentType: "",
      rodentStage: "",
      quantity: 1,
      feedingDate: new Date(),
      preyState: "dead" as const,
      calcium: false,
      vitamins: false,
      refused: false,
      notes: "",
    },
  });

  const isRefused = form.watch("refused");

  // Get allowed food types based on species
  const allowedFoods = species ? getAllowedFoodTypes(species) : allFoodTypes.map(f => f.value);
  

  const onSubmit = async (values: FormValues) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        toast.error("Vous devez être connecté");
        return;
      }

      const refusedNote = values.refused ? "🚫 Alimentation refusée" : "";
      const combinedNotes = [refusedNote, values.notes].filter(Boolean).join(" — ") || null;

      const feedingData = {
        reptile_id: reptileId,
        user_id: user.id,
        rodent_type: values.rodentType,
        rodent_stage: values.rodentStage,
        quantity: values.refused ? 0 : values.quantity,
        feeding_date: format(values.feedingDate, "yyyy-MM-dd"),
        prey_state: values.preyState,
        calcium: values.refused ? false : values.calcium,
        vitamins: values.refused ? false : values.vitamins,
        notes: combinedNotes,
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
            <FormItem>
              <FormLabel>{t("feeding.foodType", "Type d'aliment")}</FormLabel>
              <FoodTypePicker
                allowedFoods={allowedFoods}
                selectedType={form.watch("rodentType")}
                selectedStage={form.watch("rodentStage")}
                onSelect={(type, stage) => {
                  form.setValue("rodentType", type);
                  form.setValue("rodentStage", stage);
                }}
              />
              {form.formState.errors.rodentType && (
                <p className="text-sm font-medium text-destructive">{form.formState.errors.rodentType.message}</p>
              )}
              {form.formState.errors.rodentStage && (
                <p className="text-sm font-medium text-destructive">{form.formState.errors.rodentStage.message}</p>
              )}
            </FormItem>
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

            {selectedType && ["rat", "mouse", "rabbit", "insect", "fish", "crustacean", "wholePrey"].includes(selectedType) && (
              <FormField
                control={form.control}
                name="preyState"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("feeding.preyState", "État de la proie")}</FormLabel>
                    <div className="flex gap-4">
                      <button
                        type="button"
                        onClick={() => field.onChange("dead")}
                        className={cn(
                          "flex items-center gap-2 px-3 py-2 rounded-md border text-sm transition-colors",
                          field.value === "dead"
                            ? "border-primary bg-primary/10 text-primary font-medium"
                            : "border-border text-muted-foreground hover:border-primary/50"
                        )}
                      >
                        ⚫ {t("feeding.dead", "Mort / Décongelé")}
                      </button>
                      <button
                        type="button"
                        onClick={() => field.onChange("live")}
                        className={cn(
                          "flex items-center gap-2 px-3 py-2 rounded-md border text-sm transition-colors",
                          field.value === "live"
                            ? "border-green-500 bg-green-500/10 text-green-600 font-medium"
                            : "border-border text-muted-foreground hover:border-green-500/50"
                        )}
                      >
                        🟢 {t("feeding.live", "Vivant")}
                      </button>
                    </div>
                  </FormItem>
                )}
              />
            )}

            <div className="flex gap-6">
              <FormField
                control={form.control}
                name="calcium"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center space-x-2 space-y-0">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <FormLabel className="font-normal cursor-pointer">
                      {t("feeding.calcium", "Calcium")}
                    </FormLabel>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="vitamins"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center space-x-2 space-y-0">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <FormLabel className="font-normal cursor-pointer">
                      {t("feeding.vitamins", "Vitamines")}
                    </FormLabel>
                  </FormItem>
                )}
              />
            </div>


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
