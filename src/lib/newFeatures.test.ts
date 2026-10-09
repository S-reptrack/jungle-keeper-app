import { describe, it, expect } from "vitest";
import { isInWelcomeTrial } from "./welcomeTrial";
import { filterReptiles } from "./reptileFilters";

describe("essai Premium offert de 7 jours", () => {
  const signup = "2026-10-01T10:00:00Z";
  it("actif 6 jours après l'inscription", () =>
    expect(isInWelcomeTrial(signup, new Date("2026-10-07T10:00:00Z"))).toBe(true));
  it("terminé 7 jours après l'inscription", () =>
    expect(isInWelcomeTrial(signup, new Date("2026-10-08T10:00:01Z"))).toBe(false));
});

describe("filtres de la liste des reptiles", () => {
  const list = [
    { name: "Kaa", species: "Python regius", sex: "male", status: "active" },
    { name: "Nala", species: "Pogona vitticeps", sex: "female", status: "for_sale" },
    { name: "Zéphyr", species: "Python regius", sex: null, status: "active" },
  ];
  const base = { search: "", species: "all", sex: "all", status: "all" };
  it("recherche sans accents", () =>
    expect(filterReptiles(list, { ...base, search: "zephyr" }).map((r) => r.name)).toEqual(["Zéphyr"]));
  it("filtre par sexe indéterminé", () =>
    expect(filterReptiles(list, { ...base, sex: "unknown" }).map((r) => r.name)).toEqual(["Zéphyr"]));
  it("filtre par espèce et statut", () =>
    expect(filterReptiles(list, { ...base, species: "Python regius", status: "active" })).toHaveLength(2));
});
