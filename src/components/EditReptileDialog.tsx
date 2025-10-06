import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { format } from "date-fns";
import { CalendarIcon, Pencil } from "lucide-react";
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
import { Input } from "@/components/ui/input";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

const formSchema = z.object({
  birthDate: z.date({
    required_error: "La date de naissance est requise",
  }),
  purchaseDate: z.date({
    required_error: "La date d'achat est requise",
  }),
  weight: z.coerce.number().min(1, "Le poids doit être supérieur à 0"),
});

type FormValues = z.infer<typeof formSchema>;

interface EditReptileDialogProps {
  reptileId: string;
  currentBirthDate: string;
  currentPurchaseDate: string;
  currentWeight: number;
  onUpdate?: () => void;
}

const EditReptileDialog = ({ 
  reptileId, 
  currentBirthDate, 
  currentPurchaseDate,
  currentWeight,
  onUpdate 
}: EditReptileDialogProps) => {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const [birthDateInput, setBirthDateInput] = useState("");
  const [purchaseDateInput, setPurchaseDateInput] = useState("");

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      birthDate: new Date(Number(currentBirthDate.slice(0,4)), Number(currentBirthDate.slice(5,7)) - 1, Number(currentBirthDate.slice(8,10))),
      purchaseDate: new Date(Number(currentPurchaseDate.slice(0,4)), Number(currentPurchaseDate.slice(5,7)) - 1, Number(currentPurchaseDate.slice(8,10))),
      weight: currentWeight,
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

  useEffect(() => {
    if (open) {
      form.reset({
        birthDate: new Date(Number(currentBirthDate.slice(0,4)), Number(currentBirthDate.slice(5,7)) - 1, Number(currentBirthDate.slice(8,10))),
        purchaseDate: new Date(Number(currentPurchaseDate.slice(0,4)), Number(currentPurchaseDate.slice(5,7)) - 1, Number(currentPurchaseDate.slice(8,10))),
        weight: currentWeight,
      });
      setBirthDateInput(formatDateToInput(new Date(Number(currentBirthDate.slice(0,4)), Number(currentBirthDate.slice(5,7)) - 1, Number(currentBirthDate.slice(8,10)))));
      setPurchaseDateInput(formatDateToInput(new Date(Number(currentPurchaseDate.slice(0,4)), Number(currentPurchaseDate.slice(5,7)) - 1, Number(currentPurchaseDate.slice(8,10)))));
    }
  }, [open, currentBirthDate, currentPurchaseDate, currentWeight]);

  const onSubmit = async (data: FormValues) => {
    try {
      const { error } = await supabase
        .from("reptiles")
        .update({
          birth_date: `${data.birthDate.getFullYear()}-${String(data.birthDate.getMonth() + 1).padStart(2, '0')}-${String(data.birthDate.getDate()).padStart(2, '0')}`,
          purchase_date: `${data.purchaseDate.getFullYear()}-${String(data.purchaseDate.getMonth() + 1).padStart(2, '0')}-${String(data.purchaseDate.getDate()).padStart(2, '0')}`,
          weight: data.weight,
        })
        .eq("id", reptileId);

      if (error) throw error;

      toast.success("Informations mises à jour avec succès!");
      setOpen(false);
      
      if (onUpdate) {
        onUpdate();
      }
    } catch (error) {
      console.error("Error updating reptile:", error);
      toast.error("Erreur lors de la mise à jour");
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <Pencil className="w-4 h-4" />
          Modifier
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Modifier les informations</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="birthDate"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>{t("reptile.birthDate")}</FormLabel>
                  <div className="flex gap-2">
                    <Input
                      type="text"
                      placeholder="JJ/MM/AAAA"
                      value={birthDateInput}
                      onChange={(e) => handleDateInput(e.target.value, setBirthDateInput)}
                      onBlur={() => {
                        const parsed = parseInputToDate(birthDateInput);
                        if (parsed) field.onChange(parsed);
                      }}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          const parsed = parseInputToDate(birthDateInput);
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
                            setBirthDateInput(formatDateToInput(date));
                          }}
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
              name="purchaseDate"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>{t("reptile.purchaseDate")}</FormLabel>
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
              name="weight"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("reptile.weight")} (g)</FormLabel>
                  <FormControl>
                    <Input type="number" placeholder="Ex: 500" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end gap-2 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setOpen(false)}
              >
                Annuler
              </Button>
              <Button type="submit">
                Enregistrer
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default EditReptileDialog;
