// Ordre du registre professionnel : de l'entrée la plus ancienne à la plus récente.

export type RegisterRow = {
  name: string;
  purchase_date: string | null;
  birth_date: string | null;
  entry_type: string | null;
};

/**
 * Date d'entrée d'une fiche : la date de réception (purchase_date), sinon la date
 * de naissance pour un animal né à l'élevage (il entre le jour de sa naissance).
 */
export const entryDateOf = (row: RegisterRow): string | null =>
  row.purchase_date || (row.entry_type === "birth" ? row.birth_date : null) || null;

/**
 * Tri du registre : entrées datées de la plus ancienne à la plus récente, puis les
 * fiches sans date d'entrée, classées par nom pour un ordre stable.
 */
export const sortRegisterRows = <T extends RegisterRow>(rows: T[]): T[] =>
  [...rows].sort((a, b) => {
    const da = entryDateOf(a);
    const db = entryDateOf(b);
    if (da && db) return da.localeCompare(db);
    if (da) return -1;
    if (db) return 1;
    return (a.name || "").localeCompare(b.name || "", "fr");
  });
