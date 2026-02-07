import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Plus, Calendar, Eye, Trash2, CheckCircle } from "lucide-react";
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
import { CloseHatchingDialog } from "./CloseHatchingDialog";
import { getReproductionType } from "@/lib/reproductionTypes";

interface ReproductionTabProps {
  reptileId: string;
  reptileSex: string;
  reptileSpecies: string;
  reptileCategory: string;
  readOnly?: boolean;
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
  incubation_days?: number;
  expected_hatch_date?: string;
  notification_days_before?: number;
  closed?: boolean;
  closed_at?: string;
  hatched_eggs?: number;
  unhatched_eggs?: number;
  stillborn_juveniles?: number;
  outcome_notes?: string;
  fertilized_eggs?: number;
  unfertilized_eggs?: number;
  slugs?: number;
  partner?: {
    name: string;
    sex: string;
  };
}

const observationSchema = z.object({
  partnerIds: z.array(z.string()).min(1, "Au moins un partenaire requis"),
  date: z.date({
    required_error: "Date requise",
  }),
  observation: z.string().optional(),
  action: z.enum(["introduction", "mating", "separation", "prelaying_shed", "laying", "birth", "other"], {
    required_error: "Action requise",
  }),
  matingPartnerId: z.string().optional(),
  incubationDays: z.number().optional(),
  notificationDaysBefore: z.number().optional(),
  liveBornCount: z.number().optional(),
  stillbornCount: z.number().optional(),
  fertilizedEggs: z.number().optional(),
  unfertilizedEggs: z.number().optional(),
  slugs: z.number().optional(),
});

type ObservationValues = z.infer<typeof observationSchema>;

const ReproductionTab = ({ reptileId, reptileSex, reptileSpecies, reptileCategory, readOnly = false }: ReproductionTabProps) => {
  const { t } = useTranslation();
  const reproductionType = getReproductionType(reptileSpecies);
  const [open, setOpen] = useState(false);
  const [potentialPartners, setPotentialPartners] = useState<Partner[]>([]);
  const [observations, setObservations] = useState<Observation[]>([]);
  const [loading, setLoading] = useState(true);
  const [dateInput, setDateInput] = useState("");
  const [selectedAction, setSelectedAction] = useState<string>("");
  const [selectedPartnerIds, setSelectedPartnerIds] = useState<string[]>([]);
  const [closeHatchingDialog, setCloseHatchingDialog] = useState<{
    open: boolean;
    observationId: string;
    reptileName: string;
    expectedHatchDate: string;
    partnerId: string;
  }>({ open: false, observationId: "", reptileName: "", expectedHatchDate: "", partnerId: "" });

  const form = useForm<ObservationValues>({
    resolver: zodResolver(observationSchema),
    defaultValues: {
      observation: "",
      partnerIds: [],
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
          incubation_days,
          expected_hatch_date,
          notification_days_before,
          closed,
          closed_at,
          hatched_eggs,
          unhatched_eggs,
          stillborn_juveniles,
          outcome_notes,
          fertilized_eggs,
          unfertilized_eggs,
          slugs,
          partner:reptiles!partner_id(name, sex)
        `)
        .eq("reptile_id", reptileId)
        .order("observation_date", { ascending: false });

      if (obsError) throw obsError;
      setObservations((obs as any) || []);
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

      let expectedHatchDate = null;
      if (data.action === "laying" && data.incubationDays) {
        const layingDate = new Date(data.date);
        expectedHatchDate = new Date(layingDate);
        expectedHatchDate.setDate(layingDate.getDate() + data.incubationDays);
      }

      // Si accouplement observé avec un partenaire précis, ajouter la précision dans les notes
      let notes = data.observation || null;
      if (data.action === "mating" && data.matingPartnerId && selectedPartnerIds.length > 1) {
        const matingPartner = potentialPartners.find(p => p.id === data.matingPartnerId);
        if (matingPartner) {
          const matingNote = `Accouplement observé avec ${matingPartner.name}`;
          notes = notes ? `${matingNote} — ${notes}` : matingNote;
        }
      }

      const observationData: any = {
        user_id: user.id,
        action: data.action,
        observation_date: data.date.toISOString().split('T')[0],
        notes,
        incubation_days: data.action === "laying" ? data.incubationDays : null,
        expected_hatch_date: expectedHatchDate ? expectedHatchDate.toISOString().split('T')[0] : null,
        notification_days_before: data.action === "laying" ? data.notificationDaysBefore : null,
        fertilized_eggs: data.action === "laying" ? (data.fertilizedEggs || 0) : 0,
        unfertilized_eggs: data.action === "laying" ? (data.unfertilizedEggs || 0) : 0,
        slugs: data.action === "laying" ? (data.slugs || 0) : 0,
      };

      // Pour mise bas, clôturer directement avec les résultats
      if (data.action === "birth") {
        observationData.closed = true;
        observationData.closed_at = data.date.toISOString().split('T')[0];
        observationData.hatched_eggs = data.liveBornCount || 0;
        observationData.unhatched_eggs = 0;
        observationData.stillborn_juveniles = data.stillbornCount || 0;
      }

      // Create observations for each selected partner
      for (const partnerId of data.partnerIds) {
        // Create observation for current reptile
        const { error: error1 } = await supabase.from("reproduction_observations").insert({
          reptile_id: reptileId,
          partner_id: partnerId,
          ...observationData,
        });

        if (error1) throw error1;

        // Create mirrored observation for partner reptile
        const { error: error2 } = await supabase.from("reproduction_observations").insert({
          reptile_id: partnerId,
          partner_id: reptileId,
          ...observationData,
        });

        if (error2) throw error2;
      }

      toast.success(t("reptile.reproduction.observationAdded"));
      form.reset();
      setDateInput("");
      setSelectedAction("");
      setSelectedPartnerIds([]);
      setOpen(false);
      fetchData();
    } catch (error) {
      console.error("Error adding observation:", error);
      toast.error("Erreur lors de l'ajout de l'observation");
    }
  };

  const handleDelete = async (id: string, observationDate: string, partnerId: string, action: string) => {
    try {
      // Delete the current observation
      const { error: error1 } = await supabase
        .from("reproduction_observations")
        .delete()
        .eq("id", id);

      if (error1) throw error1;

      // Delete the mirrored observation on partner's record
      const { error: error2 } = await supabase
        .from("reproduction_observations")
        .delete()
        .eq("reptile_id", partnerId)
        .eq("partner_id", reptileId)
        .eq("observation_date", observationDate)
        .eq("action", action);

      if (error2) throw error2;

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
          {!readOnly && (
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
                  {/* Multi-partner selector */}
                  <div className="space-y-2">
                    <FormLabel>{t("reptile.reproduction.partner")}</FormLabel>
                    {selectedPartnerIds.map((pid, index) => {
                      const partner = potentialPartners.find(p => p.id === pid);
                      return (
                        <div key={pid} className="flex items-center gap-2">
                          <Select
                            value={pid}
                            onValueChange={(value) => {
                              const updated = [...selectedPartnerIds];
                              updated[index] = value;
                              setSelectedPartnerIds(updated);
                              form.setValue("partnerIds", updated);
                            }}
                          >
                            <SelectTrigger className="flex-1">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent className="bg-card border-border z-[100]">
                              {potentialPartners
                                .filter(p => p.id === pid || !selectedPartnerIds.includes(p.id))
                                .map((p) => (
                                  <SelectItem key={p.id} value={p.id}>
                                    {p.name} ({p.sex === "male" ? "♂" : "♀"})
                                  </SelectItem>
                                ))}
                            </SelectContent>
                          </Select>
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 shrink-0"
                            onClick={() => {
                              const updated = selectedPartnerIds.filter((_, i) => i !== index);
                              setSelectedPartnerIds(updated);
                              form.setValue("partnerIds", updated);
                            }}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      );
                    })}
                    {selectedPartnerIds.length === 0 && (
                      <Select
                        onValueChange={(value) => {
                          const updated = [value];
                          setSelectedPartnerIds(updated);
                          form.setValue("partnerIds", updated);
                        }}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder={t("reptile.reproduction.selectPartner")} />
                        </SelectTrigger>
                        <SelectContent className="bg-card border-border z-[100]">
                          {potentialPartners.map((p) => (
                            <SelectItem key={p.id} value={p.id}>
                              {p.name} ({p.sex === "male" ? "♂" : "♀"})
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                    {selectedPartnerIds.length > 0 && selectedPartnerIds.length < potentialPartners.length && (
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="w-full"
                        onClick={() => {
                          const available = potentialPartners.find(p => !selectedPartnerIds.includes(p.id));
                          if (available) {
                            const updated = [...selectedPartnerIds, available.id];
                            setSelectedPartnerIds(updated);
                            form.setValue("partnerIds", updated);
                          }
                        }}
                      >
                        <Plus className="h-4 w-4 mr-1" />
                        Ajouter un partenaire
                      </Button>
                    )}
                    {form.formState.errors.partnerIds && (
                      <p className="text-sm font-medium text-destructive">
                        {form.formState.errors.partnerIds.message}
                      </p>
                    )}
                  </div>

                  <FormField
                    control={form.control}
                    name="action"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t("reptile.reproduction.action")}</FormLabel>
                        <Select onValueChange={(value) => {
                          field.onChange(value);
                          setSelectedAction(value);
                        }} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder={t("reptile.reproduction.selectAction")} />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent className="bg-card border-border z-[100]">
                            <SelectItem value="introduction">{t("reptile.reproduction.actions.introduction")}</SelectItem>
                            <SelectItem value="mating">{t("reptile.reproduction.actions.mating")}</SelectItem>
                            <SelectItem value="separation">{t("reptile.reproduction.actions.separation")}</SelectItem>
                            {reptileSex === "female" && reproductionType === "oviparous" && (
                              <>
                                <SelectItem value="prelaying_shed">{t("reptile.reproduction.actions.prelaying_shed")}</SelectItem>
                                <SelectItem value="laying">{t("reptile.reproduction.actions.laying")}</SelectItem>
                              </>
                            )}
                            {reptileSex === "female" && reproductionType === "viviparous" && (
                              <SelectItem value="birth">Mise bas</SelectItem>
                            )}
                            <SelectItem value="other">{t("reptile.reproduction.actions.other")}</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {selectedAction === "mating" && selectedPartnerIds.length > 1 && (
                    <FormField
                      control={form.control}
                      name="matingPartnerId"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Accouplement observé avec</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value || ""}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Sélectionner le partenaire observé" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent className="bg-card border-border z-[100]">
                              {selectedPartnerIds.map((pid) => {
                                const partner = potentialPartners.find(p => p.id === pid);
                                return partner ? (
                                  <SelectItem key={partner.id} value={partner.id}>
                                    {partner.name} ({partner.sex === "male" ? "♂" : "♀"})
                                  </SelectItem>
                                ) : null;
                              })}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  )}

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

                  {selectedAction === "laying" && (
                    <>
                      <FormField
                        control={form.control}
                        name="fertilizedEggs"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Œufs fécondés</FormLabel>
                            <FormControl>
                              <Input
                                type="number"
                                min="0"
                                placeholder="Ex: 6"
                                {...field}
                                onChange={(e) => field.onChange(e.target.value ? parseInt(e.target.value) : undefined)}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="unfertilizedEggs"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Œufs non fécondés</FormLabel>
                            <FormControl>
                              <Input
                                type="number"
                                min="0"
                                placeholder="Ex: 2"
                                {...field}
                                onChange={(e) => field.onChange(e.target.value ? parseInt(e.target.value) : undefined)}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="slugs"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Slugs</FormLabel>
                            <FormControl>
                              <Input
                                type="number"
                                min="0"
                                placeholder="Ex: 1"
                                {...field}
                                onChange={(e) => field.onChange(e.target.value ? parseInt(e.target.value) : undefined)}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="incubationDays"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Durée d'incubation (jours)</FormLabel>
                            <FormControl>
                              <Input
                                type="number"
                                min="1"
                                placeholder="Ex: 60"
                                {...field}
                                onChange={(e) => field.onChange(e.target.value ? parseInt(e.target.value) : undefined)}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="notificationDaysBefore"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Notification avant éclosion (jours)</FormLabel>
                            <FormControl>
                              <Input
                                type="number"
                                min="1"
                                placeholder="Ex: 7"
                                {...field}
                                onChange={(e) => field.onChange(e.target.value ? parseInt(e.target.value) : undefined)}
                                value={field.value ?? 7}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </>
                  )}

                  {selectedAction === "birth" && (
                    <>
                      <FormField
                        control={form.control}
                        name="liveBornCount"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Nombre de juvéniles nés vivants</FormLabel>
                            <FormControl>
                              <Input
                                type="number"
                                min="0"
                                placeholder="Ex: 12"
                                {...field}
                                onChange={(e) => field.onChange(e.target.value ? parseInt(e.target.value) : undefined)}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="stillbornCount"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Juvéniles mort-nés (facultatif)</FormLabel>
                            <FormControl>
                              <Input
                                type="number"
                                min="0"
                                placeholder="Ex: 0"
                                {...field}
                                onChange={(e) => field.onChange(e.target.value ? parseInt(e.target.value) : undefined)}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </>
                  )}

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
          )}
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
              {observations.map((obs) => {
                const daysRemaining = obs.expected_hatch_date 
                  ? Math.ceil((new Date(obs.expected_hatch_date).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))
                  : null;
                const isNotificationTime = daysRemaining !== null && obs.notification_days_before 
                  ? daysRemaining <= obs.notification_days_before && daysRemaining > 0
                  : false;

                return (
                  <Card key={obs.id} className={cn(
                    "border-border/50",
                    isNotificationTime && "border-amber-500/50 bg-amber-500/5"
                  )}>
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
                            onClick={() => handleDelete(
                              obs.id,
                              obs.observation_date,
                              obs.partner_id,
                              obs.action
                            )}
                            className="text-destructive hover:text-destructive"
                            disabled={readOnly}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                      <p className="text-sm text-muted-foreground mb-1">
                        {obs.action === "birth" ? "Mise bas" : t(`reptile.reproduction.actions.${obs.action}`)}
                      </p>
                      <p className="text-sm">{obs.notes}</p>
                      
                      {obs.action === "birth" && obs.closed && (
                        <div className="mt-3 pt-3 border-t border-border/50">
                          <p className="text-sm font-medium text-green-600">
                            ✓ Mise bas le {format(new Date(obs.closed_at!), "dd MMM yyyy", { locale: fr })}
                          </p>
                          <div className="text-xs text-muted-foreground space-y-0.5 mt-1">
                            <p>👶 Nés vivants : {obs.hatched_eggs || 0}</p>
                            {(obs.stillborn_juveniles || 0) > 0 && (
                              <p>⚠️ Mort-nés : {obs.stillborn_juveniles}</p>
                            )}
                            {obs.outcome_notes && (
                              <p className="mt-1 italic">{obs.outcome_notes}</p>
                            )}
                          </div>
                        </div>
                      )}

                       {obs.action === "laying" && (
                        <div className="mt-2 text-xs text-muted-foreground space-y-0.5">
                          {(obs.fertilized_eggs || 0) > 0 && <p>🥚 Œufs fécondés : {obs.fertilized_eggs}</p>}
                          {(obs.unfertilized_eggs || 0) > 0 && <p>🥚 Œufs non fécondés : {obs.unfertilized_eggs}</p>}
                          {(obs.slugs || 0) > 0 && <p>🥚 Slugs : {obs.slugs}</p>}
                        </div>
                       )}

                       {obs.action === "laying" && obs.expected_hatch_date && (
                        <div className="mt-3 pt-3 border-t border-border/50">
                          <div className="flex items-center justify-between">
                            <div className="flex-1">
                              <p className="text-sm font-medium">
                                Éclosion prévue : {format(new Date(obs.expected_hatch_date), "dd MMM yyyy", { locale: fr })}
                              </p>
                              {daysRemaining !== null && !obs.closed && (
                                <p className={cn(
                                  "text-sm mt-1",
                                  isNotificationTime && "text-amber-600 font-medium",
                                  daysRemaining <= 0 && "text-green-600 font-medium"
                                )}>
                                  {daysRemaining > 0 
                                    ? `${daysRemaining} jour${daysRemaining > 1 ? 's' : ''} restant${daysRemaining > 1 ? 's' : ''}`
                                    : daysRemaining === 0
                                    ? "Éclosion aujourd'hui !"
                                    : "Éclosion passée"
                                  }
                                </p>
                              )}
                              {obs.closed && (
                                <div className="mt-2 space-y-1">
                                  <p className="text-sm font-medium text-green-600">
                                    ✓ Clôturée le {format(new Date(obs.closed_at!), "dd MMM yyyy", { locale: fr })}
                                  </p>
                                  <div className="text-xs text-muted-foreground space-y-0.5">
                                    {obs.unhatched_eggs === 0 ? (
                                      <>
                                        <p>👶 Nés vivants : {obs.hatched_eggs || 0}</p>
                                        {(obs.stillborn_juveniles || 0) > 0 && (
                                          <p>⚠️ Mort-nés : {obs.stillborn_juveniles}</p>
                                        )}
                                      </>
                                    ) : (
                                      <>
                                        <p>🥚 Éclos : {obs.hatched_eggs || 0}</p>
                                        <p>❌ Non éclos : {obs.unhatched_eggs || 0}</p>
                                        {(obs.stillborn_juveniles || 0) > 0 && (
                                          <p>⚠️ Mort-nés : {obs.stillborn_juveniles}</p>
                                        )}
                                      </>
                                    )}
                                    {obs.outcome_notes && (
                                      <p className="mt-1 italic">{obs.outcome_notes}</p>
                                    )}
                                  </div>
                                </div>
                              )}
                            </div>
                            {!obs.closed && daysRemaining !== null && daysRemaining <= 7 && !readOnly && (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => {
                                  const partnerData = obs.partner as any;
                                  setCloseHatchingDialog({
                                    open: true,
                                    observationId: obs.id,
                                    reptileName: partnerData?.name || "Partenaire",
                                    expectedHatchDate: obs.expected_hatch_date,
                                    partnerId: obs.partner_id,
                                  });
                                }}
                                className="ml-2 text-green-600 hover:text-green-700 border-green-600 hover:border-green-700"
                              >
                                <CheckCircle className="w-4 h-4 mr-1" />
                                Clôturer
                              </Button>
                            )}
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      <CloseHatchingDialog
        open={closeHatchingDialog.open}
        onOpenChange={(open) => setCloseHatchingDialog(prev => ({ ...prev, open }))}
        observationId={closeHatchingDialog.observationId}
        reptileName={closeHatchingDialog.reptileName}
        expectedHatchDate={closeHatchingDialog.expectedHatchDate}
        motherId={reptileSex === "female" ? reptileId : closeHatchingDialog.partnerId}
        fatherId={reptileSex === "male" ? reptileId : closeHatchingDialog.partnerId}
        species={reptileSpecies}
        category={reptileCategory}
        onSuccess={fetchData}
      />
    </div>
  );
};

export default ReproductionTab;
