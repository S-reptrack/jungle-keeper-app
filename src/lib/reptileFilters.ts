export interface ReptileFilters {
  search: string;
  species: string; // "all" ou nom d'espèce
  sex: string; // "all" | "male" | "female" | "unknown"
  status: string; // "all" | "active" | "for_sale"
}

type R = {
  name?: string | null;
  species?: string | null;
  sex?: string | null;
  status?: string | null;
  identification_number?: string | null;
  cites_number?: string | null;
  morphs?: string[] | null;
};

const norm = (s: string) => s.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();

export const filterReptiles = <T extends R>(list: T[], f: ReptileFilters): T[] => {
  const q = norm(f.search.trim());
  return list.filter((r) => {
    if (f.species !== "all" && r.species !== f.species) return false;
    if (f.sex !== "all") {
      const sex = r.sex === "male" || r.sex === "female" ? r.sex : "unknown";
      if (sex !== f.sex) return false;
    }
    if (f.status !== "all" && r.status !== f.status) return false;
    if (!q) return true;
    const hay = [r.name, r.species, r.identification_number, r.cites_number, ...(r.morphs || [])]
      .filter(Boolean)
      .map((v) => norm(String(v)))
      .join(" ");
    return hay.includes(q);
  });
};
