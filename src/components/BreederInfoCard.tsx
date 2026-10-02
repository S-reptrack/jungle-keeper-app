import { useEffect, useState } from "react";
import { Building2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { COUNTRY_PERMITS, permitLabels } from "@/lib/breederPermits";

type Info = {
  breeder_name: string; cdc_number: string; aoe_number: string; breeder_address: string;
  breeder_country: string; permit1_label: string; permit2_label: string;
};
const empty: Info = { breeder_name: "", cdc_number: "", aoe_number: "", breeder_address: "", breeder_country: "FR", permit1_label: "", permit2_label: "" };
const COLS = "breeder_name,cdc_number,aoe_number,breeder_address,breeder_country,permit1_label,permit2_label";

export default function BreederInfoCard() {
  const { user } = useAuth();
  const [info, setInfo] = useState<Info>(empty);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!user) return;
    (supabase.from("profiles") as any).select(COLS).eq("user_id", user.id).maybeSingle()
      .then(({ data }: any) => {
        if (!data) return;
        const n: any = {};
        Object.keys(empty).forEach((k) => (n[k] = data[k] || (empty as any)[k]));
        setInfo(n);
      });
  }, [user]);

  const save = async () => {
    if (!user) return;
    setSaving(true);
    const c = (v: string) => (v.trim() ? v.trim().slice(0, 200) : null);
    const { error } = await (supabase.from("profiles") as any).update({
      breeder_name: c(info.breeder_name), cdc_number: c(info.cdc_number),
      aoe_number: c(info.aoe_number), breeder_address: c(info.breeder_address),
      breeder_country: info.breeder_country, permit1_label: c(info.permit1_label), permit2_label: c(info.permit2_label),
    }).eq("user_id", user.id);
    setSaving(false);
    if (error) return toast.error("Erreur lors de l'enregistrement");
    toast.success("Informations de l'élevage enregistrées");
  };

  const set = (k: keyof Info) => (e: React.ChangeEvent<HTMLInputElement>) => setInfo({ ...info, [k]: e.target.value });
  const defaults = COUNTRY_PERMITS[info.breeder_country] || COUNTRY_PERMITS.FR;
  const labels = permitLabels(info.breeder_country, info.permit1_label, info.permit2_label);

  return (
    <Card className="notranslate" translate="no">
      <CardHeader>
        <CardTitle className="flex items-center gap-2"><Building2 className="w-5 h-5" />Mon élevage</CardTitle>
        <CardDescription>Vos autorisations, affichables en en-tête du registre imprimé.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        <div><Label>Pays</Label>
          <Select value={info.breeder_country} onValueChange={(v) => setInfo({ ...info, breeder_country: v })}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>{Object.entries(COUNTRY_PERMITS).map(([k, c]) => <SelectItem key={k} value={k}>{c.name}</SelectItem>)}</SelectContent>
          </Select>
        </div>
        <div><Label>Nom de l'élevage</Label><Input value={info.breeder_name} onChange={set("breeder_name")} /></div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div><Label>{labels.p1}</Label><Input value={info.cdc_number} onChange={set("cdc_number")} /></div>
          <div><Label>{labels.p2}</Label><Input value={info.aoe_number} onChange={set("aoe_number")} /></div>
        </div>
        <div><Label>Adresse de l'élevage</Label><Input value={info.breeder_address} onChange={set("breeder_address")} /></div>
        <details className="text-sm">
          <summary className="cursor-pointer text-muted-foreground">Modifier le nom des autorisations</summary>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-2">
            <div><Label>Nom autorisation 1</Label><Input value={info.permit1_label} onChange={set("permit1_label")} placeholder={defaults.p1} /></div>
            <div><Label>Nom autorisation 2</Label><Input value={info.permit2_label} onChange={set("permit2_label")} placeholder={defaults.p2} /></div>
          </div>
        </details>
        <p className="text-xs text-muted-foreground">Les intitulés sont indicatifs : vérifiez la réglementation de votre pays ou région.</p>
        <Button onClick={save} disabled={saving} className="w-full">Enregistrer</Button>
      </CardContent>
    </Card>
  );
}
