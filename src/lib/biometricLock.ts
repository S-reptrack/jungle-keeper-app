import { isNativeIOS } from "./platformUtils";

const STORAGE_KEY = "biometricLockEnabled";

export const isBiometricLockEnabled = (): boolean => {
  return localStorage.getItem(STORAGE_KEY) === "true";
};

export const setBiometricLockEnabled = (enabled: boolean): void => {
  localStorage.setItem(STORAGE_KEY, enabled ? "true" : "false");
};

/**
 * Vérifie si le biométrique (Face ID / Touch ID) est disponible sur l'appareil.
 */
export const checkBiometricAvailable = async (): Promise<boolean> => {
  if (!isNativeIOS()) return false;
  try {
    const { BiometricAuth } = await import("@aparajita/capacitor-biometric-auth");
    const info = await BiometricAuth.checkBiometry();
    return info.isAvailable;
  } catch (e) {
    console.warn("[BiometricLock] checkBiometry failed", e);
    return false;
  }
};

/**
 * Lance l'authentification biométrique. Renvoie true si succès.
 */
export const authenticateBiometric = async (
  reason = "Déverrouillez S-reptrack"
): Promise<boolean> => {
  if (!isNativeIOS()) return true;
  try {
    const { BiometricAuth } = await import("@aparajita/capacitor-biometric-auth");
    await BiometricAuth.authenticate({
      reason,
      cancelTitle: "Annuler",
      allowDeviceCredential: true,
      iosFallbackTitle: "Utiliser le code",
    });
    return true;
  } catch (e: any) {
    console.warn("[BiometricLock] authenticate failed", e?.message || e);
    return false;
  }
};
