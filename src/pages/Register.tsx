import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import Navigation from "@/components/Navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { toast } from "sonner";
import { BookOpen, Pencil, Printer } from "lucide-react";
import { format } from "date-fns";
import { Switch } from "@/components/ui/switch";
import { Link } from "react-router-dom";
import { permitLabels } from "@/lib/breederPermits";

const ENTRY_TYPES: Record<string, string> = {
  purchase: "Achat", donation: "Don", placement: "Placement", birth: "Naissance à l'élevage",
  exchange: "Échange", rescue: "Recueil / sauvetage", other: "Autre",
};
const EXIT_TYPES: Record<string, string> = {
  sale: "Vente", donation: "Don", placement: "Placement", death: "Décès",
  exchange: "Échange", transfer: "Transfert", other: "Autre",
};

type Row = {
  id: string; name: string; species: string; sex: string | null; status: string;
  purchase_date: string | null; birth_date: string | null; status_date: string | null;
  entry_type: string | null; entry_origin: string | null;
  identification_number: string | null; cites_number: string | null;
  exit_type: string | null; exit_date: string | null; exit_destination: string | null;
};

const fmt = (d: string | null) => (d ? format(new Date(d), "dd/MM/yyyy") : "—");

export default function Register() {
  const { user } = useAuth();
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);
  const [edit, setEdit] = useState<Row | null>(null);
  const [saving, setSaving] = useState(false);
  const [breeder, setBreeder] = useState<{ breeder_name: string | null; cdc_number: string | null; aoe_number: string | null; breeder_address: string | null; breeder_country: string | null; permit1_label: string | null; permit2_label: string | null } | null>(null);
  const [showBreeder, setShowBreeder] = useState(localStorage.getItem("registerShowBreeder") === "true");

  const load = async () => {
    const { data, error } = await supabase
      .from("reptiles")
      .select("id,name,species,sex,status,purchase_date,birth_date,status_date,entry_type,entry_origin,identification_number,cites_number,exit_type,exit_date,exit_destination")
      .eq("user_id", user!.id)
      .order("purchase_date", { ascending: true, nullsFirst: false });
    if (error) toast.error("Impossible de charger le registre");
    setRows((data as Row[]) || []);
    setLoading(false);
  };

  useEffect(() => {
    if (!user) return;
    load();
    (supabase.from("profiles") as any).select("breeder_name,cdc_number,aoe_number,breeder_address,breeder_country,permit1_label,permit2_label")
      .eq("user_id", user.id).maybeSingle().then(({ data }: any) => setBreeder(data));
  }, [user]);

  const toggleBreeder = (v: boolean) => { setShowBreeder(v); localStorage.setItem("registerShowBreeder", String(v)); };

  const save = async () => {
    if (!edit) return;
    setSaving(true);
    const clean = (v: string | null) => (v && v.trim() ? v.trim().slice(0, 200) : null);
    const { error } = await supabase.from("reptiles").update({
      purchase_date: edit.purchase_date || null,
      entry_type: edit.entry_type, entry_origin: clean(edit.entry_origin),
      identification_number: clean(edit.identification_number), cites_number: clean(edit.cites_number),
      exit_type: edit.exit_type, exit_date: edit.exit_date || null, exit_destination: clean(edit.exit_destination),
    }).eq("id", edit.id);
    setSaving(false);
    if (error) return toast.error("Erreur lors de l'enregistrement");
    toast.success("Registre mis à jour");
    setEdit(null);
    load();
  };

  const set = (k: keyof Row, v: string | null) => setEdit((e) => (e ? { ...e, [k]: v } : e));

  return (
    <div className="min-h-screen bg-background notranslate" translate="no">
      <Navigation />
      <main className="container mx-auto px-4 py-8 pb-32">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
          <h1 className="text-3xl font-bold flex items-center gap-2"><BookOpen className="w-7 h-7" />Registre des entrées et sorties</h1>
          <Button variant="outline" onClick={() => window.print()}><Printer className="w-4 h-4 mr-2" />Imprimer</Button>
        </div>
        <div className="flex items-center gap-2 mb-4 print:hidden">
          <Switch id="show-breeder" checked={showBreeder} onCheckedChange={toggleBreeder} />
          <Label htmlFor="show-breeder" className="cursor-pointer">Afficher mes informations d'éleveur (autorisations)</Label>
        </div>
        {showBreeder && (
          <Card className="mb-4">
            <CardContent className="p-4 text-sm space-y-1">
              {breeder && (breeder.breeder_name || breeder.cdc_number || breeder.aoe_number || breeder.breeder_address) ? (
                <>
                  {breeder.breeder_name && <div className="font-semibold text-base">{breeder.breeder_name}</div>}
                  {breeder.breeder_address && <div>{breeder.breeder_address}</div>}
                  <div className="flex flex-wrap gap-x-6">
                    <span><strong>{permitLabels(breeder.breeder_country, breeder.permit1_label, breeder.permit2_label).p1} :</strong> {breeder.cdc_number || "—"}</span>
                    <span><strong>{permitLabels(breeder.breeder_country, breeder.permit1_label, breeder.permit2_label).p2} :</strong> {breeder.aoe_number || "—"}</span>
                  </div>
                  {user?.email && <div className="text-muted-foreground">{user.email}</div>}
                </>
              ) : (
                <p className="text-muted-foreground print:hidden">Renseignez vos informations dans <Link to="/settings" className="underline">Paramètres → Mon élevage</Link>.</p>
              )}
            </CardContent>
          </Card>
        )}
        <Card>
          <CardContent className="p-0 overflow-x-auto">
            {loading ? <p className="p-6 text-center text-muted-foreground">Chargement…</p> : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>N°</TableHead><TableHead>Animal</TableHead><TableHead>Sexe</TableHead><TableHead>Identification</TableHead>
                    <TableHead>N° CITES</TableHead><TableHead>Entrée</TableHead><TableHead>Provenance</TableHead>
                    <TableHead>Sortie</TableHead><TableHead>Destination</TableHead><TableHead />
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {rows.map((r, i) => (
                    <TableRow key={r.id}>
                      <TableCell>{i + 1}</TableCell>
                      <TableCell><div className="font-medium">{r.name}</div><div className="text-xs text-muted-foreground italic">{r.species}</div></TableCell>
                      <TableCell>{r.sex === "male" ? "Mâle ♂" : r.sex === "female" ? "Femelle ♀" : "Indéterminé"}</TableCell>
                      <TableCell>{r.identification_number || "—"}</TableCell>
                      <TableCell>{r.cites_number || "—"}</TableCell>
                      <TableCell><div>{fmt(r.purchase_date)}</div><div className="text-xs text-muted-foreground">{r.entry_type ? ENTRY_TYPES[r.entry_type] : ""}</div></TableCell>
                      <TableCell>{r.entry_origin || "—"}</TableCell>
                      <TableCell><div>{fmt(r.exit_date)}</div><div className="text-xs text-muted-foreground">{r.exit_type ? EXIT_TYPES[r.exit_type] : ""}</div></TableCell>
                      <TableCell>{r.exit_destination || "—"}</TableCell>
                      <TableCell><Button size="icon" variant="ghost" aria-label="Modifier" onClick={() => setEdit(r)}><Pencil className="w-4 h-4" /></Button></TableCell>
                    </TableRow>
                  ))}
                  {rows.length === 0 && <TableRow><TableCell colSpan={10} className="text-center text-muted-foreground">Aucun animal</TableCell></TableRow>}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </main>

      <Dialog open={!!edit} onOpenChange={(o) => !o && setEdit(null)}>
        <DialogContent className="max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle>{edit?.name}</DialogTitle></DialogHeader>
          {edit && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div><Label>N° d'identification</Label><Input value={edit.identification_number || ""} onChange={(e) => set("identification_number", e.target.value)} placeholder="Puce, bague…" /></div>
                <div><Label>N° CITES</Label><Input value={edit.cites_number || ""} onChange={(e) => set("cites_number", e.target.value)} /></div>
              </div>
              <h3 className="font-semibold pt-2">Entrée</h3>
              <div className="grid grid-cols-2 gap-3">
                <div><Label>Date d'entrée</Label><Input type="date" value={edit.purchase_date || ""} onChange={(e) => set("purchase_date", e.target.value)} /></div>
                <div><Label>Type</Label>
                  <Select value={edit.entry_type || undefined} onValueChange={(v) => set("entry_type", v)}>
                    <SelectTrigger><SelectValue placeholder="Choisir" /></SelectTrigger>
                    <SelectContent>{Object.entries(ENTRY_TYPES).map(([k, l]) => <SelectItem key={k} value={k}>{l}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
              </div>
              <div><Label>Provenance (nom, adresse de l'éleveur…)</Label><Input value={edit.entry_origin || ""} onChange={(e) => set("entry_origin", e.target.value)} /></div>
              <h3 className="font-semibold pt-2">Sortie</h3>
              <div className="grid grid-cols-2 gap-3">
                <div><Label>Date de sortie</Label><Input type="date" value={edit.exit_date || ""} onChange={(e) => set("exit_date", e.target.value)} /></div>
                <div><Label>Type</Label>
                  <Select value={edit.exit_type || undefined} onValueChange={(v) => set("exit_type", v)}>
                    <SelectTrigger><SelectValue placeholder="Choisir" /></SelectTrigger>
                    <SelectContent>{Object.entries(EXIT_TYPES).map(([k, l]) => <SelectItem key={k} value={k}>{l}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
              </div>
              <div><Label>Destination (nom, adresse du destinataire…)</Label><Input value={edit.exit_destination || ""} onChange={(e) => set("exit_destination", e.target.value)} /></div>
            </div>
          )}
          <DialogFooter><Button onClick={save} disabled={saving}>Enregistrer</Button></DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
