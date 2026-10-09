// Règle : un ancien testeur garde tous ses reptiles en gratuit pendant 1 an
// après la fin de son test, puis dispose d'un délai de 7 jours pour passer
// Premium. Ensuite, seuls les 5 reptiles les plus anciens restent visibles
// (les autres sont cachés, jamais supprimés).

export const FORMER_TESTER_GRACE_MONTHS = 12;
export const FORMER_TESTER_BUFFER_DAYS = 7;
export const FORMER_TESTER_WARNING_DAYS = 30;
export const FORMER_TESTER_VISIBLE_LIMIT = 5;

export type GracePhase = "none" | "grace" | "warning" | "buffer" | "locked";

const DAY = 24 * 60 * 60 * 1000;

export const getGraceDates = (trialEnd: string) => {
  const end = new Date(trialEnd + "T00:00:00");
  const graceEnd = new Date(end);
  graceEnd.setMonth(graceEnd.getMonth() + FORMER_TESTER_GRACE_MONTHS);
  const bufferEnd = new Date(graceEnd.getTime() + FORMER_TESTER_BUFFER_DAYS * DAY);
  return { graceEnd, bufferEnd };
};

export const getGracePhase = (trialEnd: string | null, now: Date = new Date()): GracePhase => {
  if (!trialEnd) return "none";
  const { graceEnd, bufferEnd } = getGraceDates(trialEnd);
  if (now >= bufferEnd) return "locked";
  if (now >= graceEnd) return "buffer";
  if (graceEnd.getTime() - now.getTime() <= FORMER_TESTER_WARNING_DAYS * DAY) return "warning";
  return "grace";
};
