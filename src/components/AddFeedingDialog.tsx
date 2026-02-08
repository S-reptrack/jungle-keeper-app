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
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { getAllowedFoodTypes, type FoodType } from "@/data/speciesDiets";

const formSchema = z.object({
  rodentType: z.string().min(1, "Le type d'aliment est requis"),
  rodentStage: z.string().min(1, "Le stade est requis"),
  quantity: z.coerce.number().min(1, "La quantité doit être au moins 1"),
  feedingDate: z.date(),
  calcium: z.boolean().default(false),
  vitamins: z.boolean().default(false),
  notes: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

interface AddFeedingDialogProps {
  reptileId: string;
  species?: string;
  onFeedingAdded: () => void;
}

// All possible food types with their translation keys and categories
const allFoodTypes: { value: FoodType; labelKey: string }[] = [
  { value: "rat", labelKey: "feeding.rats.title" },
  { value: "mouse", labelKey: "feeding.mice.title" },
  { value: "rabbit", labelKey: "feeding.rabbits.title" },
  { value: "insect", labelKey: "feeding.insects.title" },
  { value: "vegetable", labelKey: "feeding.vegetables.title" },
  { value: "fruit", labelKey: "feeding.fruits.title" },
  { value: "pellet", labelKey: "feeding.pellets.title" },
  { value: "fish", labelKey: "feeding.fish.title" },
  { value: "crustacean", labelKey: "feeding.crustaceans.title" },
  { value: "wholePrey", labelKey: "feeding.wholePrey.title" },
];

// Map food type value to i18n translation key prefix
const getTranslationKey = (type: string): string => {
  const keyMap: Record<string, string> = {
    rat: "rats",
    mouse: "mice",
    rabbit: "rabbits",
    insect: "insects",
    vegetable: "vegetables",
    fruit: "fruits",
    pellet: "pellets",
    fish: "fish",
    crustacean: "crustaceans",
    wholePrey: "wholePrey",
  };
  return keyMap[type] || type;
};

// Stages available for each food type
const getStagesForType = (type: string): string[] => {
  const stages: Record<string, string[]> = {
    rat: ["pinky", "fuzzy", "hopper", "weaner", "small", "medium", "large", "jumbo", "extraLarge"],
    mouse: ["pinky", "fuzzy", "hopper", "weaner", "small", "medium", "large", "jumbo"],
    rabbit: ["baby", "small", "medium", "large", "extraLarge"],
    insect: ["cricket", "dubia", "locust", "mealworm", "superworm", "waxworm", "hornworm", "silkworm", "blackSoldierFly"],
    vegetable: ["leafyGreens", "squash", "carrot", "bellPepper", "cucumber", "zucchini", "greenBeans", "mixedVegetables"],
    fruit: ["banana", "strawberry", "mango", "papaya", "raspberry", "blueberry", "apple", "mixedFruits"],
    pellet: ["turtlePellet", "lizardPellet", "omnivore", "herbivore", "carnivore"],
    fish: ["guppy", "goldfish", "tilapia", "trout", "smelt", "shrimp", "silverside", "wholefish"],
    crustacean: ["crayfish", "shrimp", "crab", "snail"],
    wholePrey: ["chick", "quail", "egg", "frog", "fish"],
  };
  return stages[type] || [];
};

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
      calcium: false,
      vitamins: false,
      notes: "",
    },
  });

  // Get allowed food types based on species
  const allowedFoods = species ? getAllowedFoodTypes(species) : allFoodTypes.map(f => f.value);
  const filteredFoodTypes = allFoodTypes.filter(f => allowedFoods.includes(f.value));

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
        calcium: values.calcium,
        vitamins: values.vitamins,
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
                  <FormLabel>{t("feeding.foodType", "Type d'aliment")}</FormLabel>
                  <Select
                    onValueChange={(value) => {
                      field.onChange(value);
                      form.setValue("rodentStage", "");
                    }}
                    value={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder={t("feeding.selectFoodType", "Sélectionner un type")} />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent className="bg-card border-border max-h-[300px]">
                      {filteredFoodTypes.map((type) => (
                        <SelectItem key={type.value} value={type.value}>
                          {t(type.labelKey)}
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
                            {t(`feeding.${getTranslationKey(selectedType)}.${stage}`)}
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
