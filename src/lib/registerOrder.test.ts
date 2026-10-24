import { describe, expect, it } from "vitest";
import { entryDateOf, sortRegisterRows, type RegisterRow } from "./registerOrder";

const row = (name: string, over: Partial<RegisterRow> = {}): RegisterRow => ({
  name,
  purchase_date: null,
  birth_date: null,
  entry_type: null,
  ...over,
});

describe("ordre du registre", () => {
  it("classe les entrées de la plus ancienne à la plus récente", () => {
    const rows = [
      row("Deuxieme", { purchase_date: "2024-06-01" }),
      row("Premier", { purchase_date: "2023-01-15" }),
      row("Troisieme", { purchase_date: "2025-02-20" }),
    ];
    expect(sortRegisterRows(rows).map((r) => r.name)).toEqual([
      "Premier",
      "Deuxieme",
      "Troisieme",
    ]);
  });

  it("une naissance à l'élevage entre à sa date de naissance", () => {
    const ne = row("Ne a elevage", { entry_type: "birth", birth_date: "2024-03-10" });
    expect(entryDateOf(ne)).toBe("2024-03-10");
    const rows = [ne, row("Acquis", { purchase_date: "2023-05-05" })];
    expect(sortRegisterRows(rows).map((r) => r.name)).toEqual(["Acquis", "Ne a elevage"]);
  });

  it("place les fiches sans date d'entrée à la fin, classées par nom", () => {
    const rows = [row("Zoulou"), row("Alpha"), row("Ancien", { purchase_date: "2022-01-01" })];
    expect(sortRegisterRows(rows).map((r) => r.name)).toEqual(["Ancien", "Alpha", "Zoulou"]);
  });
});
