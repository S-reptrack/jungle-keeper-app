import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Plus, Calendar, Eye, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

interface ReproductionTabProps {
  reptileId: string;
  reptileSex: string;
  reptileSpecies: string;
}

interface Partner {
  id: string;
  name: string;
  sex: string;
  species: string;
}

interface Observation {
  id: string;
  observation_date: string;
  partner_id: string;
  action: string;
  notes: string;
  partner?: {
    name: string;
    sex: string;
  };
}

const observationSchema = z.object({
  partnerId: z.string().min(1, "Partenaire requis"),
  date: z.date({
    required_error: "Date requise",
  }),
  observation: z.string().min(10, "L'observation doit contenir au moins 10 caractères"),
  action: z.enum(["introduction", "mating", "separation", "laying", "other"], {
    required_error: "Action requise",
  }),
});

type ObservationValues = z.infer<typeof observationSchema>;

const ReproductionTab = ({ reptileId, reptileSex, reptileSpecies }: ReproductionTabProps) => {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const [potentialPartners, setPotentialPartners] = useState<Partner[]>([]);
  const [observations, setObservations] = useState<Observation[]>([]);
  const [loading, setLoading] = useState(true);
  const [dateInput, setDateInput] = useState("");

  const form = useForm<ObservationValues>({
    resolver: zodResolver(observationSchema),
    defaultValues: {
      observation: "",
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

  const handleDateInput = (value: string) => {
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
    setDateInput(formatted);
  };

  useEffect(() => {
    fetchData();
  }, [reptileId]);

  const fetchData = async () => {
    try {
      // Fetch potential partners (opposite sex, same species)
      const oppositeSex = reptileSex === "male" ? "female" : "male";
      const { data: partners, error: partnersError } = await supabase
        .from("reptiles")
        .select("id, name, sex, species")
        .eq("species", reptileSpecies)
        .eq("sex", oppositeSex)
        .neq("id", reptileId);

      if (partnersError) throw partnersError;
      setPotentialPartners(partners || []);

      // Fetch observations
      const { data: obs, error: obsError } = await supabase
        .from("reproduction_observations")
        .select(`
          id,
          observation_date,
          partner_id,
          action,
          notes,
          partner:reptiles!partner_id(name, sex)
        `)
        .eq("reptile_id", reptileId)
        .order("observation_date", { ascending: false });

      if (obsError) throw obsError;
      setObservations(obs || []);
    } catch (error) {
      console.error("Error fetching data:", error);
      toast.error("Erreur lors du chargement des données");
    } finally {
      setLoading(false);
    }
  };

  const onSubmit = async (data: ObservationValues) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        toast.error("Vous devez être connecté");
        return;
      }

      const { error } = await supabase.from("reproduction_observations").insert({
        reptile_id: reptileId,
        partner_id: data.partnerId,
        user_id: user.id,
        action: data.action,
        observation_date: data.date.toISOString().split('T')[0],
        notes: data.observation,
      });

      if (error) throw error;

      toast.success(t("reptile.reproduction.observationAdded"));
      form.reset();
      setDateInput("");
      setOpen(false);
      fetchData();
    } catch (error) {
      console.error("Error adding observation:", error);
      toast.error("Erreur lors de l'ajout de l'observation");
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const { error } = await supabase
        .from("reproduction_observations")
        .delete()
        .eq("id", id);

      if (error) throw error;

      toast.success("Observation supprimée");
      fetchData();
    } catch (error) {
      console.error("Error deleting observation:", error);
      toast.error("Erreur lors de la suppression");
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="py-8">
          <p className="text-muted-foreground text-center">Chargement...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <CardTitle>{t("reptile.reproduction.title")}</CardTitle>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button disabled={potentialPartners.length === 0} className="w-full sm:w-auto">
                <Plus className="w-4 h-4 mr-2" />
                <span className="truncate">{t("reptile.reproduction.addObservation")}</span>
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>{t("reptile.reproduction.addObservation")}</DialogTitle>
              </DialogHeader>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <FormField
                    control={form.control}
                    name="partnerId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t("reptile.reproduction.partner")}</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder={t("reptile.reproduction.selectPartner")} />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent className="bg-card border-border z-[100]">
                            {potentialPartners.map((partner) => (
                              <SelectItem key={partner.id} value={partner.id}>
                                {partner.name} ({partner.sex === "male" ? "♂" : "♀"})
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
                    name="action"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t("reptile.reproduction.action")}</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder={t("reptile.reproduction.selectAction")} />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent className="bg-card border-border z-[100]">
                            <SelectItem value="introduction">{t("reptile.reproduction.actions.introduction")}</SelectItem>
                            <SelectItem value="mating">{t("reptile.reproduction.actions.mating")}</SelectItem>
                            <SelectItem value="separation">{t("reptile.reproduction.actions.separation")}</SelectItem>
                            <SelectItem value="laying">{t("reptile.reproduction.actions.laying")}</SelectItem>
                            <SelectItem value="other">{t("reptile.reproduction.actions.other")}</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="date"
                    render={({ field }) => (
                      <FormItem className="flex flex-col">
                        <FormLabel>{t("reptile.reproduction.date")}</FormLabel>
                        <div className="flex gap-2">
                          <Input
                            type="text"
                            placeholder="JJ/MM/AAAA"
                            value={dateInput}
                            onChange={(e) => handleDateInput(e.target.value)}
                            onBlur={() => {
                              const parsed = parseInputToDate(dateInput);
                              if (parsed) field.onChange(parsed);
                            }}
                            onKeyDown={(e) => {
                              if (e.key === "Enter") {
                                const parsed = parseInputToDate(dateInput);
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
                            <PopoverContent className="w-auto p-0 z-[100]" align="start">
                              <CalendarComponent
                                mode="single"
                                selected={field.value}
                                onSelect={(date) => {
                                  field.onChange(date);
                                  setDateInput(formatDateToInput(date));
                                }}
                                disabled={(date) =>
                                  date > new Date() || date < new Date("2000-01-01")
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
                    name="observation"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t("reptile.reproduction.observation")}</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder={t("reptile.reproduction.observationPlaceholder")}
                            className="resize-none"
                            rows={4}
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
        </CardHeader>
        <CardContent>
          {potentialPartners.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">
              Aucun partenaire potentiel trouvé. Ajoutez un reptile de sexe opposé et de même espèce.
            </p>
          ) : observations.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">
              {t("reptile.reproduction.noObservations")}
            </p>
          ) : (
            <div className="space-y-4">
              {observations.map((obs) => (
                <Card key={obs.id} className="border-border/50">
                  <CardContent className="pt-6">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <Eye className="w-4 h-4 text-muted-foreground" />
                        <span className="font-medium">
                          {obs.partner?.name} ({obs.partner?.sex === "male" ? "♂" : "♀"})
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="flex items-center gap-1 text-sm text-muted-foreground">
                          <Calendar className="w-3 h-3" />
                          {format(new Date(obs.observation_date), "dd MMM yyyy", { locale: fr })}
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(obs.id)}
                          className="text-destructive hover:text-destructive"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground mb-1">
                      {t(`reptile.reproduction.actions.${obs.action}`)}
                    </p>
                    <p className="text-sm">{obs.notes}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ReproductionTab;
