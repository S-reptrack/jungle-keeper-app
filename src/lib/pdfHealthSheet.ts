import { supabase } from "@/integrations/supabase/client";

interface ReptilePDFData {
  reptile: {
    name: string;
    species: string;
    category: string;
    sex: string | null;
    morphs: string[] | null;
    birth_date: string | null;
    weight: number | null;
    status: string;
    created_at: string;
  };
  feedings: { feeding_date: string; rodent_type: string; rodent_stage: string; quantity: number; notes: string | null }[];
  weights: { measurement_date: string; weight: number }[];
  healthRecords: { condition: string; diagnosis_date: string; treatment: string | null; resolved: boolean | null }[];
  sheddings: { shedding_date: string; quality: string }[];
}

export async function fetchReptilePDFData(reptileId: string): Promise<ReptilePDFData | null> {
  const { data: reptile } = await supabase
    .from("reptiles")
    .select("name, species, category, sex, morphs, birth_date, weight, status, created_at")
    .eq("id", reptileId)
    .single();

  if (!reptile) return null;

  const [feedingsRes, weightsRes, healthRes, sheddingsRes] = await Promise.all([
    supabase.from("feedings").select("feeding_date, rodent_type, rodent_stage, quantity, notes")
      .eq("reptile_id", reptileId).order("feeding_date", { ascending: false }).limit(50),
    supabase.from("weight_records").select("measurement_date, weight")
      .eq("reptile_id", reptileId).order("measurement_date", { ascending: false }).limit(50),
    supabase.from("health_records").select("condition, diagnosis_date, treatment, resolved")
      .eq("reptile_id", reptileId).order("diagnosis_date", { ascending: false }),
    supabase.from("shedding_records").select("shedding_date, quality")
      .eq("reptile_id", reptileId).order("shedding_date", { ascending: false }).limit(30),
  ]);

  return {
    reptile,
    feedings: feedingsRes.data || [],
    weights: weightsRes.data || [],
    healthRecords: healthRes.data || [],
    sheddings: sheddingsRes.data || [],
  };
}

function formatDate(d: string | null): string {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" });
}

function sexLabel(sex: string | null): string {
  if (sex === "male") return "Mâle";
  if (sex === "female") return "Femelle";
  return "Indéterminé";
}

export function generateHealthPDF(data: ReptilePDFData, printWindow?: Window | null): void {
  const { reptile, feedings, weights, healthRecords, sheddings } = data;

  // Build HTML content for PDF
  const html = `
<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <title>Fiche Santé - ${reptile.name}</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; color: #1a1a1a; padding: 40px; font-size: 12px; line-height: 1.5; }
    .header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 30px; border-bottom: 3px solid #10b981; padding-bottom: 20px; }
    .header h1 { font-size: 28px; color: #064e3b; margin-bottom: 4px; }
    .header .species { font-size: 14px; color: #6b7280; font-style: italic; }
    .header .date { font-size: 11px; color: #9ca3af; text-align: right; }
    .badge { display: inline-block; padding: 2px 8px; border-radius: 10px; font-size: 10px; font-weight: 600; margin-right: 4px; }
    .badge-morph { background: #dbeafe; color: #1d4ed8; }
    .badge-status { background: #d1fae5; color: #065f46; }
    .section { margin-bottom: 24px; }
    .section h2 { font-size: 16px; color: #064e3b; border-bottom: 1px solid #d1d5db; padding-bottom: 6px; margin-bottom: 12px; }
    .info-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; margin-bottom: 20px; }
    .info-item { background: #f9fafb; border-radius: 8px; padding: 12px; }
    .info-item .label { font-size: 10px; color: #6b7280; text-transform: uppercase; letter-spacing: 0.5px; }
    .info-item .value { font-size: 14px; font-weight: 600; color: #1f2937; margin-top: 2px; }
    table { width: 100%; border-collapse: collapse; font-size: 11px; }
    th { background: #f3f4f6; text-align: left; padding: 8px 10px; font-weight: 600; color: #374151; border-bottom: 2px solid #d1d5db; }
    td { padding: 6px 10px; border-bottom: 1px solid #e5e7eb; }
    tr:nth-child(even) { background: #f9fafb; }
    .resolved { color: #10b981; }
    .unresolved { color: #ef4444; font-weight: 600; }
    .footer { margin-top: 40px; padding-top: 16px; border-top: 1px solid #d1d5db; font-size: 10px; color: #9ca3af; text-align: center; }
    .weight-chart { display: flex; align-items: flex-end; gap: 2px; height: 80px; margin: 12px 0; }
    .weight-bar { background: #10b981; border-radius: 2px 2px 0 0; min-width: 8px; flex: 1; }
    .empty-msg { color: #9ca3af; font-style: italic; padding: 12px 0; }
    @media print { body { padding: 20px; } }
  </style>
</head>
<body>
  <div class="header">
    <div>
      <h1>🦎 ${reptile.name}</h1>
      <div class="species">${reptile.species} — ${reptile.category}</div>
      <div style="margin-top: 8px;">
        <span class="badge badge-status">${reptile.status === "active" ? "Actif" : reptile.status}</span>
        <span class="badge badge-morph">${sexLabel(reptile.sex)}</span>
        ${(reptile.morphs || []).map(m => `<span class="badge badge-morph">${m}</span>`).join("")}
      </div>
    </div>
    <div class="date">
      Généré le ${formatDate(new Date().toISOString())}<br>
      S-reptrack
    </div>
  </div>

  <div class="info-grid">
    <div class="info-item">
      <div class="label">Date de naissance</div>
      <div class="value">${formatDate(reptile.birth_date)}</div>
    </div>
    <div class="info-item">
      <div class="label">Poids actuel</div>
      <div class="value">${reptile.weight ? reptile.weight + " g" : "—"}</div>
    </div>
    <div class="info-item">
      <div class="label">Ajouté le</div>
      <div class="value">${formatDate(reptile.created_at)}</div>
    </div>
  </div>

  ${weights.length > 0 ? `
  <div class="section">
    <h2>📊 Historique de poids</h2>
    <div class="weight-chart">
      ${(() => {
        const sorted = [...weights].reverse();
        const maxW = Math.max(...sorted.map(w => w.weight));
        return sorted.map(w => `<div class="weight-bar" style="height: ${(w.weight / maxW) * 100}%" title="${w.weight}g - ${formatDate(w.measurement_date)}"></div>`).join("");
      })()}
    </div>
    <table>
      <thead><tr><th>Date</th><th>Poids (g)</th><th>Variation</th></tr></thead>
      <tbody>
        ${weights.slice(0, 20).map((w, i) => {
          const prev = weights[i + 1];
          const diff = prev ? w.weight - prev.weight : 0;
          const diffPct = prev ? ((diff / prev.weight) * 100).toFixed(1) : "—";
          return `<tr><td>${formatDate(w.measurement_date)}</td><td>${w.weight}g</td><td style="color: ${diff < 0 ? '#ef4444' : '#10b981'}">${prev ? (diff >= 0 ? '+' : '') + diff + 'g (' + diffPct + '%)' : '—'}</td></tr>`;
        }).join("")}
      </tbody>
    </table>
  </div>` : ""}

  ${healthRecords.length > 0 ? `
  <div class="section">
    <h2>🏥 Historique de santé</h2>
    <table>
      <thead><tr><th>Date</th><th>Condition</th><th>Traitement</th><th>Statut</th></tr></thead>
      <tbody>
        ${healthRecords.map(h => `
          <tr>
            <td>${formatDate(h.diagnosis_date)}</td>
            <td>${h.condition}</td>
            <td>${h.treatment || "—"}</td>
            <td class="${h.resolved ? 'resolved' : 'unresolved'}">${h.resolved ? "✓ Résolu" : "⚠ En cours"}</td>
          </tr>
        `).join("")}
      </tbody>
    </table>
  </div>` : ""}

  ${feedings.length > 0 ? `
  <div class="section">
    <h2>🍽️ Derniers repas (${Math.min(feedings.length, 20)} sur ${feedings.length})</h2>
    <table>
      <thead><tr><th>Date</th><th>Type</th><th>Stade</th><th>Qté</th><th>Notes</th></tr></thead>
      <tbody>
        ${feedings.slice(0, 20).map(f => `
          <tr>
            <td>${formatDate(f.feeding_date)}</td>
            <td>${f.rodent_type}</td>
            <td>${f.rodent_stage}</td>
            <td>${f.quantity}</td>
            <td>${f.notes || "—"}</td>
          </tr>
        `).join("")}
      </tbody>
    </table>
  </div>` : ""}

  ${sheddings.length > 0 ? `
  <div class="section">
    <h2>🐍 Historique des mues</h2>
    <table>
      <thead><tr><th>Date</th><th>Qualité</th></tr></thead>
      <tbody>
        ${sheddings.map(s => `
          <tr>
            <td>${formatDate(s.shedding_date)}</td>
            <td>${s.quality === "complete" ? "✓ Complète" : s.quality === "partial" ? "⚠ Partielle" : s.quality}</td>
          </tr>
        `).join("")}
      </tbody>
    </table>
  </div>` : ""}

  <div class="footer">
    Fiche santé générée par S-reptrack — ${new Date().toLocaleDateString("fr-FR")} — Document non officiel à titre informatif
  </div>
</body>
</html>`;

  // Use provided window or open a new one
  const win = printWindow || window.open("", "_blank");
  if (win) {
    win.document.open();
    win.document.write(html);
    win.document.close();
    setTimeout(() => {
      win.print();
    }, 500);
  }
}
