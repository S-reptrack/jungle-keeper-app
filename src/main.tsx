import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { Capacitor } from "@capacitor/core";

// Désactive et nettoie tout Service Worker en environnement natif (Android/iOS)
if (Capacitor.isNativePlatform() && 'serviceWorker' in navigator) {
  (async () => {
    try {
      const regs = await navigator.serviceWorker.getRegistrations();
      if (regs.length) {
        await Promise.all(regs.map(r => r.unregister().catch(() => {})));
        // Nettoyage des caches Workbox
        try {
          const keys = await caches.keys();
          await Promise.all(keys.map(k => caches.delete(k)));
        } catch {}
        // Recharge 1x pour repartir sans SW
        if (!sessionStorage.getItem('sw-cleaned')) {
          sessionStorage.setItem('sw-cleaned', '1');
          location.reload();
        }
      }
    } catch {}
  })();
}

createRoot(document.getElementById("root")!).render(<App />);
