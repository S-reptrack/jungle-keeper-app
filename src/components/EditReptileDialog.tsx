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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from "@/components/ui/command";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { getAllSpecies, getSpeciesByAnnex } from "@/data/citesSpecies";
import { getMorphsForSpecies } from "@/lib/morphUtils";

const formSchema = z.object({
  name: z.string().min(2, "Le nom doit contenir au moins 2 caractères"),
  species: z.string().min(1, "L'espèce est requise"),
  birthDate: z.date().optional(),
  purchaseDate: z.date().optional(),
  weight: z.coerce.number().optional(),
  sex: z.enum(["male", "female", "unknown"], {
    required_error: "Le sexe est requis",
  }),
  morphs: z.array(z.string()).optional(),
});

type FormValues = z.infer<typeof formSchema>;

interface EditReptileDialogProps {
  reptileId: string;
  currentName: string;
  currentSpecies: string;
  currentCategory: "snake" | "lizard" | "turtle";
  currentBirthDate?: string;
  currentPurchaseDate?: string;
  currentWeight?: number;
  currentSex: "male" | "female" | "unknown";
  currentMorphs?: string[];
  createdAt: string;
  onUpdate?: () => void;
}

const EditReptileDialog = ({ 
  reptileId,
  currentName,
  currentSpecies,
  currentCategory,
  currentBirthDate, 
  currentPurchaseDate,
  currentWeight,
  currentSex,
  currentMorphs,
  createdAt,
  onUpdate 
}: EditReptileDialogProps) => {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const [birthDateInput, setBirthDateInput] = useState("");
  const [purchaseDateInput, setPurchaseDateInput] = useState("");
  const [selectedAnnex, setSelectedAnnex] = useState<'A' | 'B' | 'C' | 'D'>('B');
  const [selectedMorphs, setSelectedMorphs] = useState<string[]>(currentMorphs || []);
  const [morphSearch, setMorphSearch] = useState("");
  const [newMorph, setNewMorph] = useState("");
  
  const canEditName = true;

  const parseDateSafe = (dateStr?: string) => {
    if (!dateStr) return undefined;
    const date = new Date(Number(dateStr.slice(0,4)), Number(dateStr.slice(5,7)) - 1, Number(dateStr.slice(8,10)));
    return isNaN(date.getTime()) ? undefined : date;
  };

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: currentName,
      species: currentSpecies,
      birthDate: parseDateSafe(currentBirthDate),
      purchaseDate: parseDateSafe(currentPurchaseDate),
      weight: currentWeight || 0,
      sex: currentSex,
      morphs: currentMorphs || [],
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

  const filteredSpecies = getSpeciesByAnnex(selectedAnnex, currentCategory);
  
  const currentSpeciesId = form.watch("species");
  const availableMorphs = getMorphsForSpecies(currentSpeciesId);

  // Reset morphs when species changes
  useEffect(() => {
    if (currentSpeciesId !== currentSpecies) {
      setSelectedMorphs([]);
      setMorphSearch("");
      form.setValue("morphs", []);
    }
  }, [currentSpeciesId]);

  useEffect(() => {
    if (open) {
      form.reset({
        name: currentName,
        species: currentSpecies,
        birthDate: parseDateSafe(currentBirthDate),
        purchaseDate: parseDateSafe(currentPurchaseDate),
        weight: currentWeight || 0,
        sex: currentSex,
        morphs: currentMorphs || [],
      });
      setSelectedMorphs(currentMorphs || []);
      setBirthDateInput(formatDateToInput(parseDateSafe(currentBirthDate)));
      setPurchaseDateInput(formatDateToInput(parseDateSafe(currentPurchaseDate)));
      setMorphSearch("");
      setNewMorph("");
    }
  }, [open, currentName, currentSpecies, currentBirthDate, currentPurchaseDate, currentWeight, currentSex, currentMorphs]);

  const onSubmit = async (data: FormValues) => {
    try {
      const updateData: any = {
        species: data.species,
        sex: data.sex,
        morphs: data.morphs || [],
      };
      
      if (canEditName && data.name !== currentName) {
        updateData.name = data.name;
      }

      if (data.birthDate) {
        updateData.birth_date = `${data.birthDate.getFullYear()}-${String(data.birthDate.getMonth() + 1).padStart(2, '0')}-${String(data.birthDate.getDate()).padStart(2, '0')}`;
      }
      if (data.purchaseDate) {
        updateData.purchase_date = `${data.purchaseDate.getFullYear()}-${String(data.purchaseDate.getMonth() + 1).padStart(2, '0')}-${String(data.purchaseDate.getDate()).padStart(2, '0')}`;
      }
      if (data.weight) {
        updateData.weight = data.weight;
      }

      const { error } = await supabase
        .from("reptiles")
        .update(updateData)
        .eq("id", reptileId);

      if (error) throw error;

      toast.success(t("editReptile.success"));
      setOpen(false);
      
      if (onUpdate) {
        onUpdate();
      }
    } catch (error) {
      console.error("Error updating reptile:", error);
      toast.error(t("editReptile.error"));
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <Pencil className="w-4 h-4" />
          {t("editReptile.trigger")}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{t("editReptile.title")}</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            {/* Champ Nom */}
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center gap-2">
                    {t("reptile.name")}
                    {!canEditName && (
                      <span className="text-xs text-muted-foreground font-normal">
                        (96h dépassées)
                      </span>
                    )}
                  </FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="Ex: Charlie" 
                      {...field} 
                      disabled={!canEditName}
                      className={!canEditName ? "opacity-60 cursor-not-allowed" : ""}
                    />
                  </FormControl>
                  {!canEditName && (
                    <p className="text-xs text-muted-foreground">
                      Le nom ne peut être modifié que dans les 96h suivant la création.
                    </p>
                  )}
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="species"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("editReptile.citesSpecies")}</FormLabel>
                  
                  <Tabs value={selectedAnnex} onValueChange={(value) => {
                    setSelectedAnnex(value as 'A' | 'B' | 'C' | 'D');
                  }}>
                    <TabsList className="grid w-full grid-cols-4 mb-4">
                      <TabsTrigger value="A">{t("editReptile.annexA")}</TabsTrigger>
                      <TabsTrigger value="B">{t("editReptile.annexB")}</TabsTrigger>
                      <TabsTrigger value="C">{t("editReptile.annexC")}</TabsTrigger>
                      <TabsTrigger value="D">{t("editReptile.annexD")}</TabsTrigger>
                    </TabsList>
                    
                    <TabsContent value={selectedAnnex} className="mt-0">
                      <div className="flex gap-2">
                        <Popover>
                          <PopoverTrigger asChild>
                            <FormControl>
                              <Button
                                variant="outline"
                                role="combobox"
                                className="w-full justify-between"
                              >
                                <span>
                                  {field.value 
                                    ? t(getAllSpecies().find(s => s.id === field.value)?.commonNameKey || '')
                                    : t("reptile.selectSpecies")}
                                </span>
                              </Button>
                            </FormControl>
                          </PopoverTrigger>
                          <PopoverContent className="w-[--radix-popover-trigger-width] p-0 z-50 bg-card border-border" align="start">
                            <Command>
                              <CommandInput placeholder={t("reptile.selectSpecies") as string} />
                              <CommandEmpty>{t("editReptile.noSpeciesFound")}</CommandEmpty>
                              <CommandGroup className="max-h-[300px] overflow-y-auto">
                                {filteredSpecies.map((species) => (
                                  <CommandItem
                                    key={species.id}
                                    value={`${t(species.commonNameKey)} ${species.scientificName}`}
                                    onSelect={() => field.onChange(species.id)}
                                  >
                                    <div className="flex flex-col">
                                      <span className="font-medium">{t(species.commonNameKey)}</span>
                                      <span className="text-xs text-muted-foreground italic">{species.scientificName}</span>
                                    </div>
                                  </CommandItem>
                                ))}
                              </CommandGroup>
                            </Command>
                          </PopoverContent>
                        </Popover>
                        {field.value && (
                          <Button
                            type="button"
                            variant="outline"
                            size="icon"
                            onClick={() => {
                              field.onChange("");
                              setSelectedMorphs([]);
                              form.setValue("morphs", []);
                            }}
                            className="shrink-0"
                          >
                            ✕
                          </Button>
                        )}
                      </div>
                    </TabsContent>
                  </Tabs>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Morphs / Mutations */}
            {availableMorphs.length > 0 && (
              <FormField
                control={form.control}
                name="morphs"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("reptile.morphs")} ({t("reptile.optional")})</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant="outline"
                            className="w-full justify-start text-left font-normal"
                          >
                            {selectedMorphs.length > 0
                              ? selectedMorphs.join(", ")
                              : t("reptile.selectMorphs")}
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-full p-0 z-50 bg-card border-border" align="start">
                        <Command>
                          <CommandInput 
                            placeholder={t("reptile.selectMorphs") as string}
                            value={morphSearch}
                            onValueChange={setMorphSearch}
                          />
                          <CommandEmpty>{t("editReptile.noMorphFound")}</CommandEmpty>
                          <CommandGroup className="max-h-[200px] overflow-y-auto">
                            {availableMorphs
                              .filter(morph => 
                                morph.toLowerCase().includes(morphSearch.toLowerCase())
                              )
                              .map((morph) => (
                                <CommandItem
                                  key={morph}
                                  value={morph}
                                  onSelect={() => {
                                    const newMorphs = selectedMorphs.includes(morph)
                                      ? selectedMorphs.filter((m) => m !== morph)
                                      : [...selectedMorphs, morph];
                                    setSelectedMorphs(newMorphs);
                                    field.onChange(newMorphs);
                                  }}
                                  className="flex items-center space-x-2"
                                >
                                  <input
                                    type="checkbox"
                                    checked={selectedMorphs.includes(morph)}
                                    onChange={() => {}}
                                    className="w-4 h-4"
                                  />
                                  <span>{morph}</span>
                                </CommandItem>
                              ))}
                          </CommandGroup>
                          <div className="p-3 border-t border-border flex gap-2">
                            <Input
                              placeholder={t("reptile.morphs") as string}
                              value={newMorph}
                              onChange={(e) => setNewMorph(e.target.value)}
                              className="flex-1"
                            />
                            <Button
                              type="button"
                              size="sm"
                              onClick={() => {
                                if (newMorph.trim() && !selectedMorphs.includes(newMorph.trim())) {
                                  const updated = [...selectedMorphs, newMorph.trim()];
                                  setSelectedMorphs(updated);
                                  field.onChange(updated);
                                  setNewMorph("");
                                }
                              }}
                            >
                              +
                            </Button>
                          </div>
                        </Command>
                      </PopoverContent>
                    </Popover>
                    {selectedMorphs.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-2">
                        {selectedMorphs.map((morph) => (
                          <span
                            key={morph}
                            className="bg-primary/10 text-primary text-xs px-2 py-1 rounded-full flex items-center gap-1"
                          >
                            {morph}
                            <button
                              type="button"
                              onClick={() => {
                                const updated = selectedMorphs.filter((m) => m !== morph);
                                setSelectedMorphs(updated);
                                field.onChange(updated);
                              }}
                              className="hover:text-destructive"
                            >
                              ✕
                            </button>
                          </span>
                        ))}
                      </div>
                    )}
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

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

            <FormField
              control={form.control}
              name="sex"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("reptile.sex")}</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder={t("reptile.selectSex")} />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="male">{t("reptile.male")}</SelectItem>
                      <SelectItem value="female">{t("reptile.female")}</SelectItem>
                      <SelectItem value="unknown">{t("reptile.unknown")}</SelectItem>
                    </SelectContent>
                  </Select>
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
                {t("editReptile.cancel")}
              </Button>
              <Button type="submit">
                {t("editReptile.save")}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default EditReptileDialog;
