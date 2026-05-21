import { useEffect, useState, useRef, ReactNode } from "react";
import { App as CapApp } from "@capacitor/app";
import { Fingerprint, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { isNativeIOS } from "@/lib/platformUtils";
import {
  isBiometricLockEnabled,
  authenticateBiometric,
  checkBiometricAvailable,
} from "@/lib/biometricLock";

interface Props {
  children: ReactNode;
}

/**
 * Affiche un écran de verrouillage Face ID au lancement et à chaque retour
 * depuis l'arrière-plan, si l'utilisateur a activé l'option dans Réglages.
 * Sur Web/Android : ne fait rien (passe-plat).
 */
const BiometricLockGate = ({ children }: Props) => {
  const [locked, setLocked] = useState<boolean>(() => {
    return isNativeIOS() && isBiometricLockEnabled();
  });
  const [authenticating, setAuthenticating] = useState(false);
  const promptingRef = useRef(false);

  const tryUnlock = async () => {
    if (promptingRef.current) return;
    promptingRef.current = true;
    setAuthenticating(true);
    try {
      const available = await checkBiometricAvailable();
      if (!available) {
        // Si la biométrie n'est plus dispo, on ne bloque pas l'utilisateur.
        setLocked(false);
        return;
      }
      const ok = await authenticateBiometric("Déverrouillez S-reptrack");
      if (ok) setLocked(false);
    } finally {
      setAuthenticating(false);
      promptingRef.current = false;
    }
  };

  // Lancement initial
  useEffect(() => {
    if (locked) {
      tryUnlock();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Re-verrouille au retour depuis l'arrière-plan
  useEffect(() => {
    if (!isNativeIOS()) return;
    const sub = CapApp.addListener("appStateChange", ({ isActive }) => {
      if (!isActive) return; // app passe en arrière-plan
      if (isBiometricLockEnabled()) {
        setLocked(true);
        tryUnlock();
      }
    });
    return () => {
      sub.then((s) => s.remove());
    };
  }, []);

  if (!locked) return <>{children}</>;

  return (
    <div className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-background p-6">
      <div className="flex flex-col items-center gap-6 max-w-sm text-center">
        <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center">
          <Lock className="w-10 h-10 text-primary" />
        </div>
        <div className="space-y-2">
          <h1 className="text-2xl font-semibold">S-reptrack verrouillé</h1>
          <p className="text-sm text-muted-foreground">
            Authentifiez-vous avec Face ID ou Touch ID pour accéder à vos reptiles.
          </p>
        </div>
        <Button
          onClick={tryUnlock}
          disabled={authenticating}
          size="lg"
          className="w-full"
        >
          <Fingerprint className="w-5 h-5 mr-2" />
          {authenticating ? "Authentification..." : "Déverrouiller"}
        </Button>
      </div>
    </div>
  );
};

export default BiometricLockGate;
