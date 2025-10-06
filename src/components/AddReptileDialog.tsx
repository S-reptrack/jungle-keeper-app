import { useState, useEffect } from "react";
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
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from "@/components/ui/command";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { citesAnnexIISpecies, getSpeciesByCategory } from "@/data/citesSpecies";
import { toast } from "sonner";

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
  weight: z.coerce.number().min(1, "validation.weightMin"),
  purchaseDate: z.date({
    required_error: "validation.dateRequired",
  }),
});

type FormValues = z.infer<typeof formSchema>;

const AddReptileDialog = () => {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<"snake" | "lizard" | "turtle" | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      weight: 0,
      morphs: [],
    },
  });

  const onSubmit = async (data: FormValues) => {
    try {
      const { supabase } = await import("@/integrations/supabase/client");
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        toast.error("Vous devez être connecté pour ajouter un reptile");
        return;
      }

      const { error } = await supabase.from("reptiles").insert({
        user_id: user.id,
        name: data.name,
        category: data.category,
        species: data.species,
        sex: data.sex,
        morphs: data.morphs || [],
        birth_date: data.birthDate.toISOString().split('T')[0],
        weight: data.weight,
        purchase_date: data.purchaseDate.toISOString().split('T')[0],
      });

      if (error) throw error;

      toast.success(t("reptile.addReptile"), {
        description: `${data.name} a été ajouté avec succès!`,
      });
      form.reset();
      setSelectedMorphs([]);
      setOpen(false);
      
      // Refresh the page to show the new reptile
      window.location.reload();
    } catch (error: any) {
      console.error("Error adding reptile:", error);
      toast.error("Erreur lors de l'ajout du reptile");
    }
  };

  const filteredSpecies = selectedCategory 
    ? getSpeciesByCategory(selectedCategory)
    : citesAnnexIISpecies;

  const selectedSpeciesData = citesAnnexIISpecies.find(
    (s) => s.id === form.watch("species")
  );
  
  const availableMorphs = selectedSpeciesData?.morphs || [];
  const [selectedMorphs, setSelectedMorphs] = useState<string[]>([]);
  const [birthDateInput, setBirthDateInput] = useState("");
  const [purchaseDateInput, setPurchaseDateInput] = useState("");
  const [newMorph, setNewMorph] = useState("");

  const formatDateToInput = (date?: Date) => (date ? format(date, "dd/MM/yyyy") : "");
  const parseInputToDate = (value: string) => {
    const match = value.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
    if (!match) return null;
    const [, d, m, y] = match;
    const date = new Date(parseInt(y), parseInt(m) - 1, parseInt(d));
    return isNaN(date.getTime()) ? null : date;
  };

  const speciesValue = form.watch("species");
  useEffect(() => {
    setSelectedMorphs([]);
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
    <Dialog open={open} onOpenChange={setOpen}>
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
                    }}
                    defaultValue={field.value}
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
                  <FormLabel>{t("reptile.species")} (CITES Annexe II)</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant="outline"
                          role="combobox"
                          className="w-full justify-between"
                          disabled={!selectedCategory}
                        >
                          {field.value
                            ? (
                              <div className="flex flex-col text-left">
                                <span className="font-medium">
                                  {citesAnnexIISpecies.find(s => s.id === field.value)?.commonName}
                                </span>
                                <span className="text-xs text-muted-foreground italic">
                                  {citesAnnexIISpecies.find(s => s.id === field.value)?.scientificName}
                                </span>
                              </div>
                            ) : (
                              <span>{t("reptile.selectSpecies")}</span>
                            )}
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-[--radix-popover-trigger-width] p-0 z-50 bg-card border-border" align="start">
                      <Command>
                        <CommandInput placeholder={t("reptile.selectSpecies") as string} />
                        <CommandEmpty>Aucune espèce trouvée</CommandEmpty>
                        <CommandGroup>
                          {filteredSpecies.map((species) => (
                            <CommandItem
                              key={species.id}
                              value={`${species.commonName} ${species.scientificName}`}
                              onSelect={() => field.onChange(species.id)}
                            >
                              <div className="flex flex-col">
                                <span className="font-medium">{species.commonName}</span>
                                <span className="text-xs text-muted-foreground italic">{species.scientificName}</span>
                              </div>
                            </CommandItem>
                          ))}
                        </CommandGroup>
                      </Command>
                    </PopoverContent>
                  </Popover>
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
                        <div className="max-h-[200px] overflow-y-auto p-4 space-y-2">
                          {availableMorphs.map((morph) => (
                            <label
                              key={morph}
                              className="flex items-center space-x-2 cursor-pointer hover:bg-accent rounded p-2"
                            >
                              <input
                                type="checkbox"
                                checked={selectedMorphs.includes(morph)}
                                onChange={(e) => {
                                  const newMorphs = e.target.checked
                                    ? [...selectedMorphs, morph]
                                    : selectedMorphs.filter((m) => m !== morph);
                                  setSelectedMorphs(newMorphs);
                                  field.onChange(newMorphs);
                                }}
                                className="w-4 h-4"
                              />
                              <span className="text-sm">{morph}</span>
                            </label>
                          ))}
                        </div>
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
                      onChange={(e) => setBirthDateInput(e.target.value)}
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
                      onChange={(e) => setPurchaseDateInput(e.target.value)}
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

            <div className="flex gap-2 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setOpen(false)}
                className="flex-1"
              >
                {t("common.cancel")}
              </Button>
              <Button type="submit" className="flex-1">
                {t("common.save")}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default AddReptileDialog;
