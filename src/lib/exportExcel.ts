import { supabase } from "@/integrations/supabase/client";

type Col = [key: string, header: string];

const SHEETS: { table: string; title: string; cols: Col[] }[] = [
  { table: "reptiles", title: "Reptiles", cols: [["name", "Nom"], ["species", "Espèce"], ["category", "Catégorie"], ["sex", "Sexe"], ["morphs", "Phases"], ["birth_date", "Naissance"], ["weight", "Poids (g)"], ["status", "Statut"], ["identification_number", "N° identification"], ["cites_number", "N° CITES"], ["entry_type", "Type d'entrée"], ["entry_origin", "Provenance"], ["purchase_date", "Date d'entrée"], ["exit_type", "Type de sortie"], ["exit_date", "Date de sortie"], ["exit_destination", "Destination"]] },
  { table: "feedings", title: "Repas", cols: [["feeding_date", "Date"], ["rodent_type", "Proie"], ["rodent_stage", "Taille"], ["rodent_weight", "Poids proie (g)"], ["quantity", "Quantité"], ["prey_state", "État"], ["calcium", "Calcium"], ["vitamins", "Vitamines"], ["notes", "Notes"]] },
  { table: "weight_records", title: "Pesées", cols: [["measurement_date", "Date"], ["weight", "Poids (g)"], ["notes", "Notes"]] },
  { table: "health_records", title: "Santé", cols: [["diagnosis_date", "Date"], ["condition", "Problème"], ["treatment", "Traitement"], ["resolved", "Résolu"], ["notes", "Notes"]] },
  { table: "shedding_records", title: "Mues", cols: [["shedding_date", "Date"], ["quality", "Qualité"], ["notes", "Notes"]] },
  { table: "bowel_records", title: "Selles", cols: [["bowel_date", "Date"], ["consistency", "Consistance"], ["notes", "Notes"]] },
  { table: "reproduction_observations", title: "Reproduction", cols: [["observation_date", "Date"], ["partner_id", "Partenaire"], ["action", "Action"], ["expected_hatch_date", "Éclosion prévue"], ["fertilized_eggs", "Œufs fécondés"], ["unfertilized_eggs", "Œufs non fécondés"], ["hatched_eggs", "Éclos"], ["notes", "Notes"]] },
];

const fmt = (v: unknown) => {
  if (v === null || v === undefined) return "";
  if (typeof v === "boolean") return v ? "Oui" : "Non";
  if (Array.isArray(v)) return v.join(", ");
  return v as string | number;
};

/** Télécharge un fichier Excel avec un onglet par type de donnée. */
export const exportUserDataToExcel = async (userId: string) => {
  const ExcelJS = (await import("exceljs")).default;
  const wb = new ExcelJS.Workbook();
  wb.creator = "S-reptrack";

  const results = await Promise.all(
    SHEETS.map((s) => (supabase.from(s.table as any) as any).select("*").eq("user_id", userId)),
  );
  const reptiles: any[] = results[0].data || [];
  const names = new Map(reptiles.map((r) => [r.id, r.name]));

  SHEETS.forEach((s, i) => {
    const ws = wb.addWorksheet(s.title);
    const withReptile = s.table !== "reptiles";
    const cols: Col[] = withReptile ? [["reptile_id", "Reptile"], ...s.cols] : s.cols;
    ws.columns = cols.map(([key, header]) => ({ key, header, width: Math.max(12, header.length + 4) }));
    ws.getRow(1).font = { bold: true, name: "Arial" };
    ws.views = [{ state: "frozen", ySplit: 1 }];
    for (const row of (results[i].data || []) as any[]) {
      const out: Record<string, unknown> = {};
      for (const [key] of cols) {
        out[key] = key === "reptile_id" || key === "partner_id" ? names.get(row[key]) ?? "" : fmt(row[key]);
      }
      ws.addRow(out);
    }
  });

  const buf = await wb.xlsx.writeBuffer();
  const blob = new Blob([buf], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `s-reptrack-export-${new Date().toISOString().split("T")[0]}.xlsx`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};
