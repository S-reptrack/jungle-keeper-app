import { describe, it, expect } from "vitest";
import { getGracePhase, getGraceDates } from "./formerTesterGrace";

const T = "2026-03-01";
const d = (s: string) => new Date(s + "T12:00:00");

describe("ancien testeur", () => {
  it("droit gratuit jusqu'au 1er mars 2027, délai jusqu'au 8 mars 2027", () => {
    const { graceEnd, bufferEnd } = getGraceDates(T);
    expect(graceEnd.toDateString()).toBe(new Date(2027, 2, 1).toDateString());
    expect(bufferEnd.toDateString()).toBe(new Date(2027, 2, 8).toDateString());
  });
  it("garde tout en octobre 2026", () => expect(getGracePhase(T, d("2026-10-09"))).toBe("grace"));
  it("averti un mois avant", () => expect(getGracePhase(T, d("2027-02-10"))).toBe("warning"));
  it("délai d'une semaine", () => expect(getGracePhase(T, d("2027-03-05"))).toBe("buffer"));
  it("limité à 5 après le 8 mars 2027", () => expect(getGracePhase(T, d("2027-03-09"))).toBe("locked"));
});
