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
  age: z.coerce.number().min(0, "validation.ageMin"),
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
      age: 0,
      weight: 0,
    },
  });

  const onSubmit = (data: FormValues) => {
    // TODO: Intégrer avec la base de données
    console.log("Reptile data:", data);
    toast.success(t("reptile.addReptile"), {
      description: `${data.name} a été ajouté avec succès!`,
    });
    form.reset();
    setOpen(false);
  };

  const filteredSpecies = selectedCategory 
    ? getSpeciesByCategory(selectedCategory)
    : citesAnnexIISpecies;

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
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                    disabled={!selectedCategory}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder={t("reptile.selectSpecies")} />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent className="bg-card border-border max-h-[200px]">
                      {filteredSpecies.map((species) => (
                        <SelectItem key={species.id} value={species.id}>
                          <div className="flex flex-col">
                            <span className="font-medium">{species.commonName}</span>
                            <span className="text-xs text-muted-foreground italic">
                              {species.scientificName}
                            </span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="age"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("reptile.age")} ({t("reptile.months")})</FormLabel>
                    <FormControl>
                      <Input type="number" placeholder="12" {...field} />
                    </FormControl>
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
            </div>

            <FormField
              control={form.control}
              name="purchaseDate"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>{t("reptile.purchaseDate")}</FormLabel>
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
                            format(field.value, "PPP")
                          ) : (
                            <span>{t("reptile.purchaseDate")}</span>
                          )}
                          <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={field.value}
                        onSelect={field.onChange}
                        disabled={(date) =>
                          date > new Date() || date < new Date("1900-01-01")
                        }
                        initialFocus
                        className="pointer-events-auto"
                      />
                    </PopoverContent>
                  </Popover>
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
