// Essai Premium offert : 7 jours à compter de l'inscription, sans carte.
export const WELCOME_TRIAL_DAYS = 7;

export const getWelcomeTrialEnd = (createdAt: string) =>
  new Date(new Date(createdAt).getTime() + WELCOME_TRIAL_DAYS * 24 * 60 * 60 * 1000);

export const isInWelcomeTrial = (createdAt: string | null | undefined, now: Date = new Date()) =>
  !!createdAt && now < getWelcomeTrialEnd(createdAt);
