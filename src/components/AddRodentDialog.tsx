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
  type: z.enum(["rat", "mouse", "rabbit"], {
    required_error: "Type requis",
  }),
  stage: z.string().min(1, "Stade requis"),
  weight: z.coerce.number().min(0, "Poids doit être positif").optional(),
  quantity: z.coerce.number().min(1, "Quantité minimum 1"),
  purchaseDate: z.date().optional(),
  notes: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

interface AddRodentDialogProps {
  onRodentAdded?: () => void;
}

const rodentStages = {
  rat: [
    { value: "pinky", label: "Pinky (2-5g)" },
    { value: "fuzzy", label: "Fuzzy (6-15g)" },
    { value: "hopper", label: "Hopper (16-30g)" },
    { value: "weaner", label: "Weaner (31-50g)" },
    { value: "small", label: "Small (51-90g)" },
    { value: "medium", label: "Medium (91-170g)" },
    { value: "large", label: "Large (171-300g)" },
    { value: "jumbo", label: "Jumbo (301-400g)" },
    { value: "extra-large", label: "Extra Large (400g+)" },
  ],
  mouse: [
    { value: "pinky", label: "Pinky (1-2g)" },
    { value: "fuzzy", label: "Fuzzy (3-5g)" },
    { value: "hopper", label: "Hopper (6-10g)" },
    { value: "weaner", label: "Weaner (11-15g)" },
    { value: "small", label: "Small (16-20g)" },
    { value: "medium", label: "Medium (21-30g)" },
    { value: "large", label: "Large (31-40g)" },
    { value: "jumbo", label: "Jumbo (40g+)" },
  ],
  rabbit: [
    { value: "baby", label: "Baby (50-150g)" },
    { value: "small", label: "Small (151-400g)" },
    { value: "medium", label: "Medium (401-800g)" },
    { value: "large", label: "Large (801-1200g)" },
    { value: "extra-large", label: "Extra Large (1200g+)" },
  ],
};

const AddRodentDialog = ({ onRodentAdded }: AddRodentDialogProps = {}) => {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const [selectedType, setSelectedType] = useState<"rat" | "mouse" | "rabbit" | null>(null);
  const [purchaseDateInput, setPurchaseDateInput] = useState("");

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      quantity: 1,
      notes: "",
    },
  });

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
        weight: data.weight,
        quantity: data.quantity,
        purchase_date: data.purchaseDate ? data.purchaseDate.toISOString().split('T')[0] : null,
        notes: data.notes,
      });

      if (error) throw error;

      toast.success("Rongeur ajouté avec succès!");
      form.reset();
      setPurchaseDateInput("");
      setOpen(false);
      onRodentAdded?.();
    } catch (error: any) {
      console.error("Error adding rodent:", error);
      toast.error("Erreur lors de l'ajout du rongeur");
    }
  };

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

  const availableStages = selectedType ? rodentStages[selectedType] : [];

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
                  <FormLabel>Type de rongeur</FormLabel>
                  <Select
                    onValueChange={(value) => {
                      field.onChange(value);
                      setSelectedType(value as "rat" | "mouse" | "rabbit");
                      form.setValue("stage", "");
                    }}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Sélectionner un type" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent className="bg-card border-border">
                      <SelectItem value="rat">Rat</SelectItem>
                      <SelectItem value="mouse">Souris</SelectItem>
                      <SelectItem value="rabbit">Lapin</SelectItem>
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
                        <SelectValue placeholder="Sélectionner un stade" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent className="bg-card border-border max-h-[300px]">
                      {availableStages.map((stage) => (
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
                  <FormLabel>Date d'achat - Optionnel</FormLabel>
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
                  <FormLabel>Notes - Optionnel</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Notes additionnelles..."
                      {...field}
                    />
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
