import { Capacitor } from "@capacitor/core";

/**
 * Détecte si l'app tourne en natif iOS (pas le web dans Safari)
 */
export const isNativeIOS = (): boolean => {
  return Capacitor.isNativePlatform() && Capacitor.getPlatform() === "ios";
};

/**
 * Détecte si l'app tourne en natif Android
 */
export const isNativeAndroid = (): boolean => {
  return Capacitor.isNativePlatform() && Capacitor.getPlatform() === "android";
};

/**
 * Détermine le fournisseur de paiement à utiliser
 * iOS natif → Apple IAP (obligatoire par Apple)
 * Tout le reste (Android, Web) → Stripe
 */
export type PaymentProvider = "apple" | "stripe";

export const getPaymentProvider = (): PaymentProvider => {
  if (isNativeIOS()) return "apple";
  return "stripe";
};
