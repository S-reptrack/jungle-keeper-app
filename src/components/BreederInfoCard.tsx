import { useEffect, useState } from "react";
import { Building2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

type Info = { breeder_name: string; cdc_number: string; aoe_number: string; breeder_address: string };
const empty: Info = { breeder_name: "", cdc_number: "", aoe_number: "", breeder_address: "" };

export default function BreederInfoCard() {
  const { user } = useAuth();
  const [info, setInfo] = useState<Info>(empty);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!user) return;
    (supabase.from("profiles") as any)
      .select("breeder_name,cdc_number,aoe_number,breeder_address")
      .eq("user_id", user.id).maybeSingle()
      .then(({ data }: any) => data && setInfo({
        breeder_name: data.breeder_name || "", cdc_number: data.cdc_number || "",
        aoe_number: data.aoe_number || "", breeder_address: data.breeder_address || "",
      }));
  }, [user]);

  const save = async () => {
    if (!user) return;
    setSaving(true);
    const c = (v: string) => (v.trim() ? v.trim().slice(0, 200) : null);
    const { error } = await (supabase.from("profiles") as any).update({
      breeder_name: c(info.breeder_name), cdc_number: c(info.cdc_number),
      aoe_number: c(info.aoe_number), breeder_address: c(info.breeder_address),
    }).eq("user_id", user.id);
    setSaving(false);
    if (error) return toast.error("Erreur lors de l'enregistrement");
    toast.success("Informations de l'élevage enregistrées");
  };

  const set = (k: keyof Info) => (e: React.ChangeEvent<HTMLInputElement>) => setInfo({ ...info, [k]: e.target.value });

  return (
    <Card className="notranslate" translate="no">
      <CardHeader>
        <CardTitle className="flex items-center gap-2"><Building2 className="w-5 h-5" />Mon élevage</CardTitle>
        <CardDescription>Vos agréments, affichables en en-tête du registre imprimé.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        <div><Label>Nom de l'élevage</Label><Input value={info.breeder_name} onChange={set("breeder_name")} /></div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div><Label>N° certificat de capacité (CDC)</Label><Input value={info.cdc_number} onChange={set("cdc_number")} /></div>
          <div><Label>N° autorisation d'ouverture (AOE)</Label><Input value={info.aoe_number} onChange={set("aoe_number")} /></div>
        </div>
        <div><Label>Adresse de l'élevage</Label><Input value={info.breeder_address} onChange={set("breeder_address")} /></div>
        <Button onClick={save} disabled={saving} className="w-full">Enregistrer</Button>
      </CardContent>
    </Card>
  );
}
