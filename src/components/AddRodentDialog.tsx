import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { format } from "date-fns";
import { CalendarIcon, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
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
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

const formSchema = z.object({
  type: z.enum(["rat", "mouse", "rabbit", "insect", "vegetable", "fruit", "pellet"], {
    required_error: "Type requis",
  }),
  stage: z.string().min(1, "Stade requis"),
  weight: z.coerce.number().optional(),
  quantity: z.coerce.number().min(1, "La quantité doit être au moins 1"),
  purchaseDate: z.date({
    required_error: "Date requise",
  }),
  notes: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

interface AddRodentDialogProps {
  onRodentAdded?: () => void;
}

const AddRodentDialog = ({ onRodentAdded }: AddRodentDialogProps = {}) => {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const [selectedType, setSelectedType] = useState<"rat" | "mouse" | "rabbit" | "insect" | "vegetable" | "fruit" | "pellet" | null>(null);
  const [purchaseDateInput, setPurchaseDateInput] = useState("");

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      quantity: 1,
      weight: 0,
    },
  });

  const formatDateToInput = (date?: Date) => (date ? format(date, "dd/MM/yyyy") : "");
  
  const parseInputToDate = (value: string) => {
    const match = value.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
    if (!match) return null;
    const [, d, m, y] = match;
    const date = new Date(parseInt(y), parseInt(m) - 1, parseInt(d));
    return isNaN(date.getTime()) ? null : date;
  };

  const handleDateInput = (value: string, setter: (val: string) => void) => {
    const digitsOnly = value.replace(/\D/g, '');
    let formatted = digitsOnly;
    if (digitsOnly.length >= 2) {
      formatted = digitsOnly.slice(0, 2);
      if (digitsOnly.length >= 3) {
        formatted += '/' + digitsOnly.slice(2, 4);
        if (digitsOnly.length >= 5) {
          formatted += '/' + digitsOnly.slice(4, 8);
        }
      }
    }
    setter(formatted);
  };

  const onSubmit = async (data: FormValues) => {
    try {
      const { supabase } = await import("@/integrations/supabase/client");
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        toast.error("Vous devez être connecté pour ajouter un rongeur");
        return;
      }

      const { error } = await supabase.from("rodents").insert({
        user_id: user.id,
        type: data.type,
        stage: data.stage,
        weight: data.weight || null,
        quantity: data.quantity,
        purchase_date: data.purchaseDate.toISOString().split('T')[0],
        notes: data.notes || null,
      });

      if (error) throw error;

      toast.success("Rongeur ajouté avec succès!");
      form.reset();
      setOpen(false);
      onRodentAdded?.();
    } catch (error: any) {
      console.error("Error adding rodent:", error);
      toast.error("Erreur lors de l'ajout du rongeur");
    }
  };

  const getStageOptions = () => {
    if (!selectedType) return [];
    
    const stages: Record<string, { value: string; label: string }[]> = {
      rat: [
        { value: "pinky", label: t("feeding.rats.pinky") },
        { value: "fuzzy", label: t("feeding.rats.fuzzy") },
        { value: "hopper", label: t("feeding.rats.hopper") },
        { value: "weaner", label: t("feeding.rats.weaner") },
        { value: "small", label: t("feeding.rats.small") },
        { value: "medium", label: t("feeding.rats.medium") },
        { value: "large", label: t("feeding.rats.large") },
        { value: "jumbo", label: t("feeding.rats.jumbo") },
        { value: "extraLarge", label: t("feeding.rats.extraLarge") },
      ],
      mouse: [
        { value: "pinky", label: t("feeding.mice.pinky") },
        { value: "fuzzy", label: t("feeding.mice.fuzzy") },
        { value: "hopper", label: t("feeding.mice.hopper") },
        { value: "weaner", label: t("feeding.mice.weaner") },
        { value: "small", label: t("feeding.mice.small") },
        { value: "medium", label: t("feeding.mice.medium") },
        { value: "large", label: t("feeding.mice.large") },
        { value: "jumbo", label: t("feeding.mice.jumbo") },
      ],
      rabbit: [
        { value: "baby", label: t("feeding.rabbits.baby") },
        { value: "small", label: t("feeding.rabbits.small") },
        { value: "medium", label: t("feeding.rabbits.medium") },
        { value: "large", label: t("feeding.rabbits.large") },
        { value: "extraLarge", label: t("feeding.rabbits.extraLarge") },
      ],
      insect: [
        { value: "cricket", label: t("feeding.insects.cricket") },
        { value: "dubia", label: t("feeding.insects.dubia") },
        { value: "locust", label: t("feeding.insects.locust") },
        { value: "mealworm", label: t("feeding.insects.mealworm") },
        { value: "superworm", label: t("feeding.insects.superworm") },
        { value: "waxworm", label: t("feeding.insects.waxworm") },
        { value: "hornworm", label: t("feeding.insects.hornworm") },
        { value: "silkworm", label: t("feeding.insects.silkworm") },
        { value: "blackSoldierFly", label: t("feeding.insects.blackSoldierFly") },
      ],
      vegetable: [
        { value: "leafyGreens", label: t("feeding.vegetables.leafyGreens") },
        { value: "squash", label: t("feeding.vegetables.squash") },
        { value: "carrot", label: t("feeding.vegetables.carrot") },
        { value: "bellPepper", label: t("feeding.vegetables.bellPepper") },
        { value: "cucumber", label: t("feeding.vegetables.cucumber") },
        { value: "zucchini", label: t("feeding.vegetables.zucchini") },
        { value: "greenBeans", label: t("feeding.vegetables.greenBeans") },
        { value: "mixedVegetables", label: t("feeding.vegetables.mixedVegetables") },
      ],
      fruit: [
        { value: "banana", label: t("feeding.fruits.banana") },
        { value: "strawberry", label: t("feeding.fruits.strawberry") },
        { value: "mango", label: t("feeding.fruits.mango") },
        { value: "papaya", label: t("feeding.fruits.papaya") },
        { value: "raspberry", label: t("feeding.fruits.raspberry") },
        { value: "blueberry", label: t("feeding.fruits.blueberry") },
        { value: "apple", label: t("feeding.fruits.apple") },
        { value: "mixedFruits", label: t("feeding.fruits.mixedFruits") },
      ],
      pellet: [
        { value: "turtlePellet", label: t("feeding.pellets.turtlePellet") },
        { value: "lizardPellet", label: t("feeding.pellets.lizardPellet") },
        { value: "omnivore", label: t("feeding.pellets.omnivore") },
        { value: "herbivore", label: t("feeding.pellets.herbivore") },
        { value: "carnivore", label: t("feeding.pellets.carnivore") },
      ],
    };

    return stages[selectedType] || [];
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="gap-2">
          <Plus className="w-4 h-4" />
          Ajouter un rongeur
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Ajouter un rongeur</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("feeding.foodType", "Type d'aliment")}</FormLabel>
                  <Select
                    onValueChange={(value) => {
                      field.onChange(value);
                      setSelectedType(value as typeof selectedType);
                      form.setValue("stage", "");
                    }}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Sélectionner le type" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent className="bg-card border-border max-h-[300px]">
                      <SelectItem value="rat">{t("feeding.rats.title")}</SelectItem>
                      <SelectItem value="mouse">{t("feeding.mice.title")}</SelectItem>
                      <SelectItem value="rabbit">{t("feeding.rabbits.title")}</SelectItem>
                      <SelectItem value="insect">{t("feeding.insects.title")}</SelectItem>
                      <SelectItem value="vegetable">{t("feeding.vegetables.title")}</SelectItem>
                      <SelectItem value="fruit">{t("feeding.fruits.title")}</SelectItem>
                      <SelectItem value="pellet">{t("feeding.pellets.title")}</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="stage"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Stade</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                    disabled={!selectedType}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Sélectionner le stade" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent className="bg-card border-border">
                      {getStageOptions().map((stage) => (
                        <SelectItem key={stage.value} value={stage.value}>
                          {stage.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="weight"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Poids (g) - Optionnel</FormLabel>
                  <FormControl>
                    <Input type="number" placeholder="50" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="quantity"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Quantité</FormLabel>
                  <FormControl>
                    <Input type="number" placeholder="1" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="purchaseDate"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Date d'achat</FormLabel>
                  <div className="flex gap-2">
                    <Input
                      type="text"
                      placeholder="JJ/MM/AAAA"
                      value={purchaseDateInput}
                      onChange={(e) => handleDateInput(e.target.value, setPurchaseDateInput)}
                      onBlur={() => {
                        const parsed = parseInputToDate(purchaseDateInput);
                        if (parsed) field.onChange(parsed);
                      }}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          const parsed = parseInputToDate(purchaseDateInput);
                          if (parsed) field.onChange(parsed);
                        }
                      }}
                      className="flex-1"
                      maxLength={10}
                    />
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className={cn(
                            "w-10 p-0",
                            !field.value && "text-muted-foreground"
                          )}
                        >
                          <CalendarIcon className="h-4 w-4" />
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0 z-50" align="start">
                        <Calendar
                          mode="single"
                          selected={field.value}
                          onSelect={(date) => {
                            field.onChange(date);
                            setPurchaseDateInput(formatDateToInput(date));
                          }}
                          disabled={(date) =>
                            date > new Date() || date < new Date("1900-01-01")
                          }
                          initialFocus
                          className="pointer-events-auto"
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Notes (Optionnel)</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Notes..." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex gap-2 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setOpen(false)}
                className="flex-1"
              >
                Annuler
              </Button>
              <Button type="submit" className="flex-1">
                Ajouter
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default AddRodentDialog;
