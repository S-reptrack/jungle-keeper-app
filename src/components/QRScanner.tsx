import { useState, useEffect, useRef } from "react";
import { Html5Qrcode } from "html5-qrcode";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { X, Camera as CameraIcon } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { Capacitor } from "@capacitor/core";
import { Camera, CameraResultType, CameraSource } from "@capacitor/camera";
import { Browser } from "@capacitor/browser";
import { BarcodeScanner } from "@capacitor-mlkit/barcode-scanning";
import jsQR from "jsqr";
import { BrowserQRCodeReader } from "@zxing/browser";
import QrScanner from "qr-scanner";
import { supabase } from "@/integrations/supabase/client";
// Config paths for worker & wasm (Vite-friendly URLs)
(QrScanner as any).WORKER_PATH = new URL('qr-scanner/qr-scanner-worker.min.js', import.meta.url).toString();
(QrScanner as any).WASM_PATH = new URL('qr-scanner/qr-scanner-worker.min.wasm', import.meta.url).toString();
interface QRScannerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function QRScanner({ open, onOpenChange }: QRScannerProps) {
  const [scanning, setScanning] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [forceWeb, setForceWeb] = useState(false);
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const codeReaderRef = useRef<BrowserQRCodeReader | null>(null);
  const qrScannerRef = useRef<QrScanner | null>(null);
  const navigate = useNavigate();
  const webTimeoutRef = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      stopScanning();
    };
  }, []);

  // Démarrage auto sur mobile natif quand le dialogue s'ouvre
  useEffect(() => {
    if (open && Capacitor.isNativePlatform() && !scanning) {
      startScanning();
    }
  }, [open]);

  const scanFromGallery = async () => {
    try {
      setError(null);

      // Open gallery to select image
      const photo = await Camera.getPhoto({
        source: CameraSource.Photos,
        resultType: CameraResultType.Base64,
        quality: 100,
      });

      if (!photo.base64String && !photo.webPath) {
        toast.error("Impossible de charger l'image");
        return;
      }

      // Load image
      const loadImage = async (): Promise<HTMLImageElement> => {
        return new Promise((resolve, reject) => {
          const img = new Image();
          img.onload = () => resolve(img);
          img.onerror = () => reject(new Error("Erreur de chargement de l'image"));

          if (photo.base64String) {
            const format = photo.format || 'jpeg';
            img.src = `data:image/${format};base64,${photo.base64String}`;
          } else if (photo.webPath) {
            fetch(photo.webPath)
              .then((res) => res.blob())
              .then((blob) => {
                const url = URL.createObjectURL(blob);
                img.src = url;
              })
              .catch(() => reject(new Error("Erreur de chargement de l'image")));
          }
        });
      };

      const img = await loadImage();

      // Resize if needed
      const maxDim = 1024;
      const scale = Math.min(1, maxDim / Math.max(img.width, img.height));
      const canvas = document.createElement('canvas');
      canvas.width = Math.max(1, Math.floor(img.width * scale));
      canvas.height = Math.max(1, Math.floor(img.height * scale));
      const ctx = canvas.getContext('2d');
      
      if (!ctx) {
        toast.error("Erreur de traitement de l'image");
        return;
      }

      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      
      console.log("[QR Scanner Gallery] Image loaded:", canvas.width, "x", canvas.height);
      
      // Try qr-scanner (WASM) first for image
      try {
        console.log("[QR Scanner Gallery] Trying qr-scanner (WASM)...");
        const qrResult: any = await (QrScanner as any).scanImage(canvas);
        const text = typeof qrResult === 'string' ? qrResult : qrResult?.data;
        if (text) {
          console.log("[QR Scanner Gallery] ✓ qr-scanner decoded:", text);
          handleScanSuccess(text);
          return;
        }
      } catch (e) {
        console.warn("[QR Scanner Gallery] qr-scanner failed:", e);
      }

      // Try ZXing next

      // Try jsQR
      let imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      let code = jsQR(imageData.data, imageData.width, imageData.height, {
        inversionAttempts: "attemptBoth",
      });
      console.log("[QR Scanner Gallery] jsQR attempt 1:", code ? "✓ DETECTED" : "✗ failed");

      // Try with preprocessing if first attempt failed
      if (!code) {
        const data = imageData.data;
        for (let i = 0; i < data.length; i += 4) {
          const gray = 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2];
          const contrasted = ((gray - 128) * 1.5) + 128;
          const value = Math.max(0, Math.min(255, contrasted));
          data[i] = data[i + 1] = data[i + 2] = value;
        }
        code = jsQR(imageData.data, imageData.width, imageData.height, {
          inversionAttempts: "attemptBoth",
        });
        console.log("[QR Scanner Gallery] jsQR attempt 2 (preprocessed):", code ? "✓ DETECTED" : "✗ failed");
      }

      if (code && code.data) {
        console.log("[QR Scanner Gallery] ✓ QR decoded:", code.data);
        handleScanSuccess(code.data);
      } else {
        console.error("[QR Scanner Gallery] ✗ No QR code detected");
        toast.error("Aucun QR code détecté dans cette image");
        setError("Aucun QR code détecté dans l'image");
      }

    } catch (err: any) {
      console.error("Error scanning from gallery:", err);
      if (err?.message && err.message.toLowerCase().includes('cancel')) {
        toast.info("Sélection annulée");
        return;
      }
      const msg = "Impossible de scanner l'image";
      setError(msg);
      toast.error(msg);
    }
  };

  // Vérifie et demande les permissions caméra pour les plugins natifs
  const ensureNativePermissions = async (): Promise<boolean> => {
    try {
      // Capacitor Camera
      const camPerm = await (Camera as any)?.checkPermissions?.();
      if (camPerm?.camera !== 'granted') {
        const camReq = await (Camera as any)?.requestPermissions?.({ permissions: ['camera'] });
        if (camReq?.camera !== 'granted') {
          toast.error("Accès caméra refusé. Autorisez-la dans les réglages.");
          setError("Accès caméra refusé");
          return false;
        }
      }
    } catch {}

    try {
      // ML Kit Barcode Scanner
      const res = await (BarcodeScanner as any)?.checkPermissions?.();
      if (res?.camera && res.camera !== 'granted') {
        const req = await (BarcodeScanner as any)?.requestPermissions?.();
        if (req?.camera !== 'granted') {
          toast.error("Accès caméra refusé pour le scanner. Activez-le dans les réglages.");
          setError("Accès caméra refusé pour le scanner");
          return false;
        }
      }
    } catch {}
    return true;
  };

  const startScanning = async () => {
    try {
      setError(null);

      // Native (Capacitor) - Use Camera API like ImageUploadDialog
      if (Capacitor.isNativePlatform() && !forceWeb) {
        try {
          // Vérifie les permissions caméra
          const permOk = await ensureNativePermissions();
          if (!permOk) return;

          // Vérifie la disponibilité du plugin natif ML Kit
          const hasMLKit = (Capacitor as any)?.isPluginAvailable?.('BarcodeScanner') && typeof (BarcodeScanner as any)?.scan === 'function';

          // Essayer le scanner natif ML Kit en priorité (plus fiable)
          if (hasMLKit) {
            try {
              const mlResult: any = await (BarcodeScanner as any).scan();
              const mlText = mlResult?.barcodes?.[0]?.rawValue || mlResult?.barcodes?.[0]?.displayValue || mlResult?.barcodes?.[0]?.content?.rawValue || mlResult?.barcodes?.[0]?.content?.displayValue;
              if (mlText) {
                console.log('[QR Scanner] ✓ ML Kit détecté:', mlText);
                handleScanSuccess(mlText);
                return;
              }
              console.warn('[QR Scanner] ML Kit n\'a rien détecté, fallback sur photo');
            } catch (e) {
              console.warn('[QR Scanner] ML Kit échec, fallback sur photo', e);
            }
          } else {
            console.warn('[QR Scanner] Plugin ML Kit indisponible');
            toast.info("Mettez à jour l'app (git pull + npm i + npx cap sync) pour activer le scan natif.");
          }

          // Fallback: Take photo using the same API that works for ImageUploadDialog
          const photo = await Camera.getPhoto({
            source: CameraSource.Camera,
            resultType: CameraResultType.Base64,
            quality: 100, // Qualité maximale pour meilleure détection
            correctOrientation: true,
            saveToGallery: false,
          });

          if (!photo.base64String && !photo.webPath) {
            toast.error("Impossible de capturer la photo");
            return;
          }

          // Charge l'image (base64 privilégié pour éviter le canvas "tainted")
          const loadImage = async (): Promise<HTMLImageElement> => {
            return new Promise((resolve, reject) => {
              const img = new Image();
              img.onload = () => resolve(img);
              img.onerror = () => reject(new Error("Erreur de chargement de l'image"));

              if (photo.base64String) {
                const format = photo.format || 'jpeg';
                img.src = `data:image/${format};base64,${photo.base64String}`;
              } else if (photo.webPath) {
                // Fallback: fetch pour créer un Object URL et éviter CORS/taint
                fetch(photo.webPath)
                  .then((res) => res.blob())
                  .then((blob) => {
                    const url = URL.createObjectURL(blob);
                    img.src = url;
                  })
                  .catch(() => reject(new Error("Erreur de chargement de l'image")));
              }
            });
          };

          const img = await loadImage();

          // Redimensionne (max 1024px) pour améliorer les chances de détection
          const maxDim = 1024;
          const scale = Math.min(1, maxDim / Math.max(img.width, img.height));
          const canvas = document.createElement('canvas');
          canvas.width = Math.max(1, Math.floor(img.width * scale));
          canvas.height = Math.max(1, Math.floor(img.height * scale));
          const ctx = canvas.getContext('2d');
          
          if (!ctx) {
            toast.error("Erreur de traitement de l'image");
            return;
          }

          ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
          
          console.log("[QR Scanner] Image chargée:", canvas.width, "x", canvas.height);
          
          // ÉTAPE 1: Essayer jsQR sans modification
          let imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
          let code = jsQR(imageData.data, imageData.width, imageData.height, {
            inversionAttempts: "attemptBoth",
          });
          console.log("[QR Scanner] Tentative 1 (image brute):", code ? "✓ DÉTECTÉ" : "✗ échec");

          // ÉTAPE 2: Essayer avec preprocessing (niveaux de gris + contraste)
          if (!code) {
            const data = imageData.data;
            for (let i = 0; i < data.length; i += 4) {
              const gray = 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2];
              const contrasted = ((gray - 128) * 1.5) + 128;
              const value = Math.max(0, Math.min(255, contrasted));
              data[i] = data[i + 1] = data[i + 2] = value;
            }
            code = jsQR(imageData.data, imageData.width, imageData.height, {
              inversionAttempts: "attemptBoth",
            });
            console.log("[QR Scanner] Tentative 2 (preprocessing):", code ? "✓ DÉTECTÉ" : "✗ échec");
          }

          // ÉTAPE 3: Crop central 80%
          if (!code) {
            ctx.drawImage(img, 0, 0, canvas.width, canvas.height); // Redessiner image originale
            const size = Math.floor(Math.min(canvas.width, canvas.height) * 0.8);
            const x = Math.floor((canvas.width - size) / 2);
            const y = Math.floor((canvas.height - size) / 2);
            const cropped = ctx.getImageData(x, y, size, size);
            code = jsQR(cropped.data, size, size, {
              inversionAttempts: "attemptBoth",
            });
            console.log("[QR Scanner] Tentative 3 (crop 80%):", code ? "✓ DÉTECTÉ" : "✗ échec");
          }

          // ÉTAPE 4: ZXing comme fallback ultime
          if (!code) {
            try {
              console.log("[QR Scanner] Tentative 4: ZXing fallback...");
              const reader = new BrowserQRCodeReader();
              const result = await reader.decodeFromImageElement(img);
              if (result && result.getText()) {
                console.log("[QR Scanner] ✓ DÉTECTÉ par ZXing:", result.getText());
                handleScanSuccess(result.getText());
                return;
              }
            } catch (zxingErr) {
              console.error("[QR Scanner] ZXing échec:", zxingErr);
            }
          }

          if (code && code.data) {
            console.log("[QR Scanner] ✓ QR décodé:", code.data);
            handleScanSuccess(code.data);
          } else {
            console.error("[QR Scanner] ✗ Échec total de détection");
            toast.error("QR code non détecté. Rapprochez-vous (QR code > 50% écran) avec bon éclairage.");
            setError("QR code non détecté. Cadrez le QR code pour qu'il occupe au moins 50% de l'écran.");
          }

          return;
          
        } catch (nativeErr: any) {
          console.error("Erreur caméra native:", nativeErr);
          if (nativeErr?.message && nativeErr.message.toLowerCase().includes('cancel')) {
            toast.info("Capture annulée");
            return;
          }
          const msg = "Impossible d'accéder à la caméra";
          setError(msg);
          toast.error(msg);
          return;
        }
      }

      // Web path: use qr-scanner (WASM) for live scanning first
      try {
        const videoEl = document.getElementById('qr-video') as HTMLVideoElement | null;
        if (!videoEl) {
          setError("Lecteur vidéo introuvable");
          toast.error("Erreur interne du scanner");
          return;
        }
        // Stop any previous instance
        try { await qrScannerRef.current?.stop(); } catch {}
        qrScannerRef.current = new QrScanner(
          videoEl,
          (result: any) => {
            const text = typeof result === 'string' ? result : result?.data;
            if (text) {
              console.log('[QR Scanner] qr-scanner decode:', text);
              handleScanSuccess(text);
              try { qrScannerRef.current?.stop(); } catch {}
            }
          },
          {
            preferredCamera: 'environment',
            highlightScanRegion: true,
            maxScansPerSecond: 12,
          }
        );
        await qrScannerRef.current.start();
        setScanning(true);
        if (!Capacitor.isNativePlatform() || forceWeb) {
          if (webTimeoutRef.current) clearTimeout(webTimeoutRef.current);
          webTimeoutRef.current = window.setTimeout(() => {
            toast.info("Astuce: rapprochez le QR (>50% du cadre), bonne lumière, évitez les reflets.");
          }, 10000);
        }
        return; // Do not run other methods if qr-scanner started
      } catch (err) {
        console.warn('[QR Scanner] qr-scanner live failed, fallback to html5-qrcode', err);
      }

      const scanner = new Html5Qrcode("qr-reader");
      scannerRef.current = scanner;

      // Get available cameras
      const cameras = await Html5Qrcode.getCameras();

      if (!cameras || cameras.length === 0) {
        setError("Aucune caméra trouvée sur cet appareil");
        toast.error("Aucune caméra trouvée");
        return;
      }

      // Find back camera or use last camera
      const backCamera =
        cameras.find(
          (cam) =>
            cam.label.toLowerCase().includes("back") ||
            cam.label.toLowerCase().includes("arrière") ||
            cam.label.toLowerCase().includes("rear")
        ) || cameras[cameras.length - 1];

      await scanner.start(
        backCamera.id,
        {
          fps: 15,
          qrbox: { width: 320, height: 320 },
          aspectRatio: 1.0,
        },
        (decodedText) => {
          console.log("[QR Scanner] Web decode:", decodedText);
          handleScanSuccess(decodedText);
        },
        (_errorMessage) => {
          // Ignore scan errors, they happen continuously while scanning
        }
      );

      setScanning(true);
      // Afficher un conseil si rien n'est détecté au bout de 10s (sans interrompre le scan)
      if (!Capacitor.isNativePlatform() || forceWeb) {
        if (webTimeoutRef.current) clearTimeout(webTimeoutRef.current);
        webTimeoutRef.current = window.setTimeout(() => {
          toast.info("Astuce: rapprochez le QR (>50% du cadre), bonne lumière, évitez les reflets.");
        }, 10000);
      }
    } catch (err: any) {
      console.error("Erreur lors du démarrage du scan:", err);

      let errorMessage = "Impossible de démarrer la caméra";
      if (err.name === "NotAllowedError") {
        errorMessage =
          "Accès à la caméra refusé. Veuillez autoriser l'accès dans les paramètres.";
      } else if (err.name === "NotFoundError") {
        errorMessage = "Aucune caméra trouvée sur cet appareil";
      } else if (err.name === "NotSupportedError") {
        errorMessage = "La caméra n'est pas supportée sur ce navigateur";
      } else if (err.name === "NotReadableError") {
        errorMessage =
          "La caméra est peut-être déjà utilisée par une autre application";
      }

      setError(errorMessage);
      toast.error(errorMessage);
    }
  };

  const stopScanning = async () => {
    if (webTimeoutRef.current) {
      clearTimeout(webTimeoutRef.current);
      webTimeoutRef.current = null;
    }
    // Stop qr-scanner if any
    if (qrScannerRef.current) {
      try { await qrScannerRef.current.stop(); } catch (e) { console.warn('qr-scanner stop error', e); }
      qrScannerRef.current = null;
    }

    // Stop ZXing stream if any
    if (codeReaderRef.current) {
      try { (codeReaderRef.current as any)?.reset?.(); } catch (e) { console.warn('ZXing reset error', e); }
      codeReaderRef.current = null;
    }
    const videoEl = document.getElementById('qr-video') as HTMLVideoElement | null;
    const stream = (videoEl?.srcObject as MediaStream) || undefined;
    if (stream) {
      stream.getTracks().forEach((t) => t.stop());
      if (videoEl) videoEl.srcObject = null as any;
    }

    if (scannerRef.current && scanning) {
      try {
        await scannerRef.current.stop();
        scannerRef.current.clear();
        scannerRef.current = null;
        setScanning(false);
      } catch (error) {
        console.error("Erreur lors de l'arrêt du scan:", error);
      }
    }
  };

const handleScanSuccess = async (decodedText: string) => {
  if (webTimeoutRef.current) {
    clearTimeout(webTimeoutRef.current);
    webTimeoutRef.current = null;
  }
  await stopScanning();

  console.log("[QR Scanner] Texte scanné:", decodedText);

  // S'assurer d'une session valide
  const { data: { session }, error: sessionError } = await supabase.auth.getSession();
  if (sessionError || !session) {
    console.error("❌ Pas de session:", sessionError);
    toast.error("Vous devez être connecté pour scanner");
    onOpenChange(false);
    navigate("/auth");
    return;
  }
  const userId = session.user.id;

  // 1) Chercher un UUID complet dans le texte
  const uuidPattern = /[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/i;
  const uuidMatch = decodedText.match(uuidPattern);

  let reptileId: string | null = null;

  if (uuidMatch) {
    reptileId = uuidMatch[0];
    console.log("[QR Scanner] UUID extrait:", reptileId);
    toast.info(`ID détecté: ${reptileId.substring(0, 8)}…`, { duration: 3000 });
  } else {
    // 2) Supporter les QR codes courts: extraire un préfixe hex (8 à 12 caractères)
    const prefixMatch = decodedText.match(/[0-9a-f]{12}/i) || decodedText.match(/[0-9a-f]{10}/i) || decodedText.match(/[0-9a-f]{8}/i);
    const prefix = prefixMatch?.[0]?.toLowerCase();

    if (prefix) {
      try {
        // Récupère les IDs de vos reptiles actifs puis cherche ceux qui commencent par le préfixe
        const { data: myReptiles, error: listErr } = await supabase
          .from("reptiles")
          .select("id,name")
          .eq("user_id", userId)
          .in("status", ["active", "for_sale"])
          .limit(1000);
        if (listErr) console.warn("[QR Scanner] Liste perso non dispo:", listErr);
        const candidates = (myReptiles || []).filter((r) => r.id.toLowerCase().startsWith(prefix));

        if (candidates.length === 1) {
          reptileId = candidates[0].id;
          toast.info(`ID court ${prefix} → ${reptileId.substring(0, 8)}…`, { duration: 3000 });
        } else if (candidates.length > 1) {
          toast.error(`Plusieurs correspondances pour ${prefix}. QR trop court.`);
          setError("Ambiguïté d'ID - plusieurs correspondances");
          return;
        } else {
          toast.error("Cet ID n'existe pas dans votre base");
          setError("Reptile introuvable");
          return;
        }
      } catch (e) {
        console.warn("[QR Scanner] Erreur de résolution d'ID court:", e);
        toast.error("Erreur pendant la résolution de l'ID");
        return;
      }
    }
  }

  if (reptileId) {
    onOpenChange(false);
    toast.success("QR code scanné avec succès !");
    navigate(`/reptile/${reptileId}`);
    return;
  }

  // 3) Si aucun ID n'a été trouvé, tenter d'ouvrir un lien si présent
  if (/^https?:\/\//i.test(decodedText)) {
    console.log("[QR Scanner] Lien détecté:", decodedText);
    toast.info("Ouverture du lien détecté");
    try {
      if (Capacitor.isNativePlatform()) {
        await Browser.open({ url: decodedText, presentationStyle: 'fullscreen' });
      } else {
        window.open(decodedText, '_blank', 'noopener,noreferrer');
      }
      return;
    } catch (e) {
      console.error('[QR Scanner] Ouverture du lien a échoué:', e);
    }
  }

  console.warn("[QR Scanner] Format non reconnu:", decodedText);
  toast.error("Format de QR code non reconnu");
  setError("QR code invalide - aucun ID trouvé");
};

  const handleClose = async () => {
    await stopScanning();
    setError(null);
    setForceWeb(false);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span className="flex items-center gap-2">
              <CameraIcon className="h-5 w-5" />
              Scanner un QR Code
            </span>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleClose}
              className="h-6 w-6"
            >
              <X className="h-4 w-4" />
            </Button>
          </DialogTitle>
          <DialogDescription className="sr-only">
            Scannez un QR code pour ouvrir la fiche de l'animal
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {error ? (
            <div className="text-center space-y-4">
              <div className="flex justify-center">
                <div className="rounded-full bg-destructive/10 p-4">
                  <CameraIcon className="h-12 w-12 text-destructive" />
                </div>
              </div>
              <div className="space-y-3">
                <p className="text-sm font-medium text-destructive">
                  {error}
                </p>
                <p className="text-xs text-muted-foreground">
                  Assurez-vous que le QR code est bien visible et net dans la photo.
                </p>
              </div>
              <Button onClick={startScanning} className="w-full">
                Réessayer
              </Button>
            </div>
          ) : (
            <div className="text-center space-y-4">
              <div className="flex justify-center">
                <div className="rounded-full bg-primary/10 p-4">
                  <CameraIcon className="h-12 w-12 text-primary" />
                </div>
              </div>
              <div className="space-y-2">
                <p className="text-sm font-medium">
                  Scanner un QR Code
                </p>
                <p className="text-xs text-muted-foreground">
                  Prenez une photo du QR code pour accéder rapidement à la fiche de l'animal.
                </p>
              </div>
              <div className="flex flex-col gap-2">
                <Button onClick={startScanning} className="w-full">
                  <CameraIcon className="h-4 w-4 mr-2" />
                  Prendre une photo
                </Button>
                <Button onClick={scanFromGallery} variant="outline" className="w-full">
                  Scanner depuis une image
                </Button>
              </div>
              {Capacitor.isNativePlatform() && (
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => { setForceWeb(true); startScanning(); }}
                  className="w-full"
                >
                  Essayer le scan en direct (mode web)
                </Button>
              )}
              {(!Capacitor.isNativePlatform() || forceWeb) && (
                <div className="space-y-4 pt-4">
                  <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                      <span className="w-full border-t" />
                    </div>
                    <div className="relative flex justify-center text-xs uppercase">
                      <span className="bg-background px-2 text-muted-foreground">
                        ou scan en direct (web)
                      </span>
                    </div>
                  </div>
                  <div 
                    id="qr-reader" 
                    className="w-full rounded-lg overflow-hidden border-2 border-primary mb-2"
                  />
                  <video id="qr-video" className="w-full rounded-lg overflow-hidden border-2 border-primary" muted playsInline />
                  <p className="text-xs text-center text-muted-foreground">
                    Positionnez le QR code dans le cadre
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
