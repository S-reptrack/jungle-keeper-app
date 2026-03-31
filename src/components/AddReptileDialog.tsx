import { useState, useEffect } from "react";
import { useUserRole } from "@/hooks/useUserRole";
import { useTranslation } from "react-i18next";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { format } from "date-fns";
import { CalendarIcon, Plus, Crown } from "lucide-react";
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
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from "@/components/ui/command";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";
import { getAllSpecies, getSpeciesByAnnex } from "@/data/citesSpecies";
import { getMorphsForSpecies } from "@/lib/morphUtils";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { useSubscription } from "@/hooks/useSubscription";
import { useReptileCount } from "@/hooks/useReptileCount";
import { useNavigate } from "react-router-dom";

const formSchema = z.object({
  name: z.string().min(2, "validation.nameMin"),
  category: z.enum(["snake", "lizard", "turtle"], {
    required_error: "validation.categoryRequired",
  }),
  species: z.string().min(1, "validation.speciesRequired"),
  sex: z.enum(["male", "female", "unknown"], {
    required_error: "validation.sexRequired",
  }),
  morphs: z.array(z.string()).optional(),
  birthDate: z.date({
    required_error: "validation.dateRequired",
  }),
  weight: z.coerce.number().optional(),
  bornInCaptivity: z.boolean().optional(),
  purchaseDate: z.date().optional(),
});

type FormValues = z.infer<typeof formSchema>;

interface AddReptileDialogProps {
  onReptileAdded?: () => void;
}

const AddReptileDialog = ({ onReptileAdded }: AddReptileDialogProps = {}) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<"snake" | "lizard" | "turtle" | null>("snake");
  const [selectedAnnex, setSelectedAnnex] = useState<'A' | 'B' | 'C' | 'D'>('B');
  const [speciesPopoverOpen, setSpeciesPopoverOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showLimitDialog, setShowLimitDialog] = useState(false);
  const [isTestEntry, setIsTestEntry] = useState(false);
  const { role } = useUserRole();

  const { subscribed } = useSubscription();
  const { count, canAddReptile, FREE_TIER_LIMIT, refreshCount } = useReptileCount();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      category: "snake",
      weight: 0,
      morphs: [],
      bornInCaptivity: false,
    },
  });

  const handleOpenChange = (newOpen: boolean) => {
    if (newOpen && !canAddReptile(subscribed)) {
      setShowLimitDialog(true);
      return;
    }
    setOpen(newOpen);
  };

  const onSubmit = async (data: FormValues) => {
    if (isSubmitting) return;
    setIsSubmitting(true);
    
    try {
      const { supabase } = await import("@/integrations/supabase/client");
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        toast.error("Vous devez être connecté pour ajouter un reptile");
        return;
      }

      const birthDateStr = `${data.birthDate.getFullYear()}-${String(data.birthDate.getMonth() + 1).padStart(2, '0')}-${String(data.birthDate.getDate()).padStart(2, '0')}`;
      
      const { data: insertedReptile, error } = await supabase.from("reptiles").insert({
        user_id: user.id,
        name: data.name,
        category: data.category,
        species: data.species,
        sex: data.sex,
        morphs: data.morphs || [],
        birth_date: birthDateStr,
        weight: data.weight,
        status: isTestEntry ? "test" : "active",
        purchase_date: data.purchaseDate && !data.bornInCaptivity
          ? `${data.purchaseDate.getFullYear()}-${String(data.purchaseDate.getMonth() + 1).padStart(2, '0')}-${String(data.purchaseDate.getDate()).padStart(2, '0')}`
          : null,
      }).select('id').single();

      if (error) throw error;

      // Enregistrer le poids initial comme première pesée
      if (data.weight && data.weight > 0 && insertedReptile) {
        await supabase.from("weight_records").insert({
          reptile_id: insertedReptile.id,
          user_id: user.id,
          weight: data.weight,
          measurement_date: new Date().toISOString().split('T')[0],
          notes: "Poids initial",
        });
      }

      toast.success(t("reptile.addReptile"), {
        description: `${data.name} a été ajouté avec succès!`,
      });
      form.reset();
      setSelectedMorphs([]);
      setOpen(false);
      
      // Refresh count and call the callback to refresh the list
      refreshCount();
      if (onReptileAdded) {
        onReptileAdded();
      }
    } catch (error: any) {
      console.error("Error adding reptile:", error);
      toast.error("Erreur lors de l'ajout du reptile");
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredSpecies = getSpeciesByAnnex(selectedAnnex, selectedCategory || undefined);

  const currentSpeciesId = form.watch("species");
  
  const availableMorphs = getMorphsForSpecies(currentSpeciesId);
  const [selectedMorphs, setSelectedMorphs] = useState<string[]>([]);
  const [birthDateInput, setBirthDateInput] = useState("");
  const [purchaseDateInput, setPurchaseDateInput] = useState("");
  const [newMorph, setNewMorph] = useState("");
  const [morphSearch, setMorphSearch] = useState("");

  const formatDateToInput = (date?: Date) => (date ? format(date, "dd/MM/yyyy") : "");
  const parseInputToDate = (value: string) => {
    const match = value.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
    if (!match) return null;
    const [, d, m, y] = match;
    const date = new Date(parseInt(y), parseInt(m) - 1, parseInt(d));
    return isNaN(date.getTime()) ? null : date;
  };

  const handleDateInput = (value: string, setter: (val: string) => void) => {
    // Remove all non-digit characters
    const digitsOnly = value.replace(/\D/g, '');
    
    // Format with slashes: DD/MM/YYYY
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

  const speciesValue = form.watch("species");
  useEffect(() => {
    setSelectedMorphs([]);
    setMorphSearch("");
    form.setValue("morphs", []);
  }, [speciesValue]);

  useEffect(() => {
    if (open) {
      const bd = form.getValues("birthDate");
      const pd = form.getValues("purchaseDate");
      setBirthDateInput(formatDateToInput(bd as Date | undefined));
      setPurchaseDateInput(formatDateToInput(pd as Date | undefined));
    }
  }, [open]);

  return (
    <>
      {/* Limit Reached Dialog */}
      <Dialog open={showLimitDialog} onOpenChange={setShowLimitDialog}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Crown className="w-5 h-5 text-primary" />
              {t("subscription.limitReached")}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-muted-foreground">
              {t("subscription.limitReachedDescription")}
            </p>
            <p className="text-sm text-muted-foreground">
              {t("subscription.reptilesUsed", { count })}
            </p>
            <div className="flex gap-2">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => setShowLimitDialog(false)}
              >
                {t("common.cancel")}
              </Button>
              <Button
                className="flex-1 gap-2"
                onClick={() => {
                  setShowLimitDialog(false);
                  navigate("/settings");
                }}
              >
                <Crown className="w-4 h-4" />
                {t("subscription.upgradeNow")}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Add Reptile Dialog */}
      <Dialog open={open} onOpenChange={handleOpenChange}>
        <DialogTrigger asChild>
          <Button className="gap-2">
            <Plus className="w-4 h-4" />
            {t("reptile.addReptile")}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{t("reptile.addReptile")}</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("reptile.name")}</FormLabel>
                  <FormControl>
                    <Input placeholder="Ex: Charlie" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="category"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("reptile.category")}</FormLabel>
                  <Select
                    onValueChange={(value) => {
                      field.onChange(value);
                      setSelectedCategory(value as "snake" | "lizard" | "turtle");
                      form.setValue("species", "");
                      setSelectedMorphs([]);
                    }}
                    defaultValue={field.value}
                    value={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder={t("reptile.selectCategory")} />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent className="bg-card border-border">
                      <SelectItem value="snake">{t("reptile.snake")}</SelectItem>
                      <SelectItem value="lizard">{t("reptile.lizard")}</SelectItem>
                      <SelectItem value="turtle">{t("reptile.turtle")}</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="species"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Espèce CITES</FormLabel>
                  
                  <Tabs value={selectedAnnex} onValueChange={(value) => {
                    setSelectedAnnex(value as 'A' | 'B' | 'C' | 'D');
                    form.setValue("species", "");
                  }}>
                    <TabsList className="grid w-full grid-cols-4 mb-4">
                      <TabsTrigger value="A">Annexe A</TabsTrigger>
                      <TabsTrigger value="B">Annexe B</TabsTrigger>
                      <TabsTrigger value="C">Annexe C</TabsTrigger>
                      <TabsTrigger value="D">Annexe D</TabsTrigger>
                    </TabsList>
                    
                    <TabsContent value={selectedAnnex} className="mt-0">
                      <div className="flex gap-2">
                        <Popover open={speciesPopoverOpen} onOpenChange={setSpeciesPopoverOpen}>
                          <PopoverTrigger asChild>
                            <FormControl>
                              <Button
                                variant="outline"
                                role="combobox"
                                className="w-full justify-between"
                                disabled={!selectedCategory}
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
                              <CommandEmpty>Aucune espèce trouvée</CommandEmpty>
                              <CommandGroup className="max-h-[300px] overflow-y-auto">
                                {filteredSpecies.map((species) => (
                                  <CommandItem
                                    key={species.id}
                                    value={`${t(species.commonNameKey)} ${species.scientificName}`}
                                    onSelect={() => {
                                      field.onChange(species.id);
                                      setSpeciesPopoverOpen(false);
                                    }}
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

            <FormField
              control={form.control}
              name="sex"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("reptile.sex")}</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder={t("reptile.selectSex")} />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent className="bg-card border-border">
                      <SelectItem value="male">{t("reptile.male")}</SelectItem>
                      <SelectItem value="female">{t("reptile.female")}</SelectItem>
                      <SelectItem value="unknown">{t("reptile.unknown")}</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

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
                          <CommandEmpty>Aucune mutation trouvée</CommandEmpty>
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
                              placeholder={t("reptile.morphs")}
                              value={newMorph}
                              onChange={(e) => setNewMorph(e.target.value)}
                            />
                            <Button
                              type="button"
                              onClick={() => {
                                const v = newMorph.trim();
                                if (!v) return;
                                if (!selectedMorphs.includes(v)) {
                                  const updated = [...selectedMorphs, v];
                                  setSelectedMorphs(updated);
                                  field.onChange(updated);
                                }
                                setNewMorph("");
                              }}
                            >
                              +
                            </Button>
                          </div>
                        </Command>
                      </PopoverContent>
                    </Popover>
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
              name="bornInCaptivity"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center space-x-3 space-y-0">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={(checked) => {
                        field.onChange(checked);
                        if (checked) {
                          form.setValue("purchaseDate", undefined);
                          setPurchaseDateInput("");
                        }
                      }}
                    />
                  </FormControl>
                  <FormLabel className="font-normal cursor-pointer">
                    {t("reptile.bornInCaptivity")}
                  </FormLabel>
                </FormItem>
              )}
            />

            {role === "admin" && (
              <div className="flex flex-row items-center space-x-3 space-y-0">
                <Checkbox
                  id="isTestEntry"
                  checked={isTestEntry}
                  onCheckedChange={(checked) => setIsTestEntry(!!checked)}
                />
                <label htmlFor="isTestEntry" className="text-sm font-normal cursor-pointer text-muted-foreground">
                  🧪 Fiche de test (sera séparée des vrais animaux)
                </label>
              </div>
            )}

            <FormField
              control={form.control}
              name="weight"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("reptile.weight")} ({t("reptile.grams")})</FormLabel>
                  <FormControl>
                    <Input type="number" placeholder="500" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {!form.watch("bornInCaptivity") && (
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
            )}

            <div className="flex gap-2 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setOpen(false)}
                className="flex-1"
              >
                {t("common.cancel")}
              </Button>
              <Button type="submit" className="flex-1" disabled={isSubmitting}>
                {isSubmitting ? "..." : t("common.save")}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
    </>
  );
};

export default AddReptileDialog;
