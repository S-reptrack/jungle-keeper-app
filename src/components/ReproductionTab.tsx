import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Plus, Calendar, Eye } from "lucide-react";
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
import { CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

interface ReproductionTabProps {
  reptileId: string;
  reptileSex: string;
  reptileSpecies: string;
}

const observationSchema = z.object({
  partnerId: z.string().min(1, "validation.partnerRequired"),
  date: z.date({
    required_error: "validation.dateRequired",
  }),
  observation: z.string().min(10, "validation.observationMin"),
  action: z.enum(["introduction", "mating", "separation", "laying", "other"], {
    required_error: "validation.actionRequired",
  }),
});

type ObservationValues = z.infer<typeof observationSchema>;

const ReproductionTab = ({ reptileId, reptileSex, reptileSpecies }: ReproductionTabProps) => {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);

  // TODO: Récupérer les partenaires potentiels depuis la base de données
  // Filtrer par espèce et sexe opposé
  const oppositeSex = reptileSex === "male" ? "female" : "male";
  const potentialPartners = [
    { id: "2", name: "Luna", sex: oppositeSex, species: reptileSpecies },
    { id: "3", name: "Storm", sex: oppositeSex, species: reptileSpecies },
  ];

  // TODO: Récupérer les observations depuis la base de données
  const observations = [
    {
      id: "1",
      date: "2024-01-15",
      partner: "Luna",
      action: "introduction",
      observation: "Première mise en présence. Les deux individus se sont approchés avec curiosité.",
    },
  ];

  const form = useForm<ObservationValues>({
    resolver: zodResolver(observationSchema),
    defaultValues: {
      observation: "",
    },
  });

  const onSubmit = (data: ObservationValues) => {
    console.log("Observation data:", data);
    toast.success(t("reptile.reproduction.observationAdded"));
    form.reset();
    setOpen(false);
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>{t("reptile.reproduction.title")}</CardTitle>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                {t("reptile.reproduction.addObservation")}
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
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
                          <SelectContent className="bg-card border-border">
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
                          <SelectContent className="bg-card border-border">
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
                                  <span>{t("reptile.reproduction.selectDate")}</span>
                                )}
                                <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                              </Button>
                            </FormControl>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0" align="start">
                            <CalendarComponent
                              mode="single"
                              selected={field.value}
                              onSelect={field.onChange}
                              disabled={(date) =>
                                date > new Date() || date < new Date("2000-01-01")
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
          {observations.length === 0 ? (
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
                        <span className="font-medium">{obs.partner}</span>
                      </div>
                      <div className="flex items-center gap-1 text-sm text-muted-foreground">
                        <Calendar className="w-3 h-3" />
                        {obs.date}
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground mb-1">
                      {t(`reptile.reproduction.actions.${obs.action}`)}
                    </p>
                    <p className="text-sm">{obs.observation}</p>
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
