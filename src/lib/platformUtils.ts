import { Capacitor } from "@capacitor/core";

/**
 * Détecte si l'app tourne en natif iOS (pas le web dans Safari)
 * Utilise Capacitor en priorité, avec fallback sur la détection du WebView iOS
 * pour couvrir le cas où le bridge n'est pas injecté (server.url distant)
 */
export const isNativeIOS = (): boolean => {
  // Méthode 1 : Capacitor bridge disponible
  if (Capacitor.isNativePlatform() && Capacitor.getPlatform() === "ios") {
    return true;
  }
  
  // Méthode 2 : Détection du WebView iOS Capacitor via User Agent
  // Le WebView Capacitor iOS contient toujours ces marqueurs
  const ua = navigator.userAgent;
  const isIOSDevice = /iPad|iPhone|iPod/.test(ua) || 
    (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
  const isStandaloneOrWebView = (window.navigator as any).standalone === true || 
    !ua.includes("Safari") || ua.includes("CriOS") === false;
  
  // Si c'est un appareil iOS ET pas un navigateur Safari classique → probablement WebView Capacitor
  if (isIOSDevice && !ua.includes("Safari/")) {
    return true;
  }
  
  return false;
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
