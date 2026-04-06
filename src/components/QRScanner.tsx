import { useState, useEffect, useRef, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { X, Camera as CameraIcon, Image as ImageIcon, RefreshCw } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { Capacitor } from "@capacitor/core";
import { Camera, CameraResultType, CameraSource } from "@capacitor/camera";
import { Browser } from "@capacitor/browser";
import { BarcodeScanner, BarcodeFormat } from "@capacitor-mlkit/barcode-scanning";
import jsQR from "jsqr";
import QrScanner from "qr-scanner";
import { supabase } from "@/integrations/supabase/client";

interface QRScannerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function QRScanner({ open, onOpenChange }: QRScannerProps) {
  const [scanning, setScanning] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [cameraPermissionDenied, setCameraPermissionDenied] = useState(false);
  const [scannerReady, setScannerReady] = useState(false);
  const qrScannerRef = useRef<QrScanner | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const navigate = useNavigate();
  const isNative = Capacitor.isNativePlatform();

  const hasCameraPermission = (state?: string) => state === "granted" || state === "limited";

  const isCameraPermissionError = (err: unknown) => {
    const message = err instanceof Error ? err.message : String(err ?? "");
    const normalized = message.toLowerCase();

    return ["permission", "denied", "refused", "notallowed", "not allowed", "restricted", "camera"].some(
      (token) => normalized.includes(token),
    );
  };

  const stopScanning = useCallback(async () => {
    try {
      if (Capacitor.isNativePlatform()) {
        try {
          await BarcodeScanner.removeAllListeners();
        } catch {}
        try {
          await BarcodeScanner.stopScan();
        } catch {}
      }

      if (qrScannerRef.current) {
        qrScannerRef.current.stop();
        qrScannerRef.current.destroy();
        qrScannerRef.current = null;
      }
    } catch (e) {
      console.warn("[QR Scanner] cleanup error:", e);
    }

    setScanning(false);
    setScannerReady(false);
  }, []);

  const handleScanSuccess = useCallback(
    async (decodedText: string) => {
      await stopScanning();
      console.log("[QR Scanner] Decoded:", decodedText);

      const {
        data: { user },
      } = await supabase.auth.getUser();
      const userId = user?.id;
      if (!userId) {
        toast.error("Vous devez être connecté");
        return;
      }

      const urlMatch = decodedText.match(/\/reptile\/([0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})/i);
      if (urlMatch?.[1]) {
        toast.success("QR code scanné !");
        onOpenChange(false);
        navigate(`/reptile/${urlMatch[1]}`);
        return;
      }

      const uuidMatch = decodedText.match(/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/i);
      if (uuidMatch) {
        toast.success("QR code scanné !");
        onOpenChange(false);
        navigate(`/reptile/${uuidMatch[0]}`);
        return;
      }

      const prefixMatch = decodedText.match(/[0-9a-f]{12}/i) || decodedText.match(/[0-9a-f]{10}/i) || decodedText.match(/[0-9a-f]{8}/i);
      const prefix = prefixMatch?.[0]?.toLowerCase();
      if (prefix) {
        try {
          const { data: myReptiles } = await supabase
            .from("reptiles")
            .select("id,name")
            .eq("user_id", userId)
            .in("status", ["active", "for_sale"])
            .limit(1000);

          const candidates = (myReptiles || []).filter((r) => r.id.toLowerCase().startsWith(prefix));
          if (candidates.length === 1) {
            toast.success(`Reptile trouvé: ${candidates[0].name}`);
            onOpenChange(false);
            navigate(`/reptile/${candidates[0].id}`);
            return;
          }

          if (candidates.length > 1) {
            toast.error("Plusieurs correspondances pour cet ID");
            setError("Ambiguïté - plusieurs correspondances");
            return;
          }

          toast.error("ID introuvable dans votre base");
          setError("Reptile introuvable");
          return;
        } catch {
          toast.error("Erreur lors de la recherche");
          return;
        }
      }

      if (/^https?:\/\//i.test(decodedText)) {
        toast.info("Ouverture du lien détecté");
        try {
          if (Capacitor.isNativePlatform()) {
            await Browser.open({ url: decodedText, presentationStyle: "fullscreen" });
          } else {
            window.open(decodedText, "_blank", "noopener,noreferrer");
          }
          onOpenChange(false);
          return;
        } catch (e) {
          console.error("[QR Scanner] Failed to open URL:", e);
        }
      }

      toast.error("QR code non reconnu. Utilisez un QR généré par S-reptrack.");
      setError("QR code non reconnu");
    },
    [navigate, onOpenChange, stopScanning],
  );

  const startNativeScan = useCallback(async () => {
    try {
      await stopScanning();
      setError(null);
      setCameraPermissionDenied(false);
      setScanning(true);

      const { supported } = await BarcodeScanner.isSupported();
      if (!supported) {
        setError("La caméra n'est pas disponible sur cet appareil.");
        setScanning(false);
        return;
      }

      let permissions = await BarcodeScanner.checkPermissions();
      if (!hasCameraPermission(permissions.camera)) {
        permissions = await BarcodeScanner.requestPermissions();
      }

      if (!hasCameraPermission(permissions.camera)) {
        setCameraPermissionDenied(true);
        setError("Accès à l’appareil photo refusé. Autorisez la caméra dans Réglages > S-reptrack > Caméra.");
        setScanning(false);
        return;
      }

      const result = await BarcodeScanner.scan({
        formats: [BarcodeFormat.QrCode],
      });

      const barcode = result.barcodes?.[0];
      const text = barcode?.rawValue || barcode?.displayValue || "";

      if (!text) {
        setScanning(false);
        toast.info("Scan annulé");
        return;
      }

      await handleScanSuccess(text);
    } catch (err) {
      console.error("[QR Scanner] Native scan error:", err);

      if (isCameraPermissionError(err)) {
        setCameraPermissionDenied(true);
        setError("Accès à l’appareil photo refusé. Autorisez la caméra dans Réglages > S-reptrack > Caméra.");
      } else {
        setError("Impossible d'accéder à l'appareil photo. Essayez à nouveau ou utilisez une image.");
      }

      setScanning(false);
    }
  }, [handleScanSuccess, stopScanning]);

  const startLiveScanner = useCallback(async () => {
    if (Capacitor.isNativePlatform()) {
      await startNativeScan();
      return;
    }

    try {
      setError(null);
      setCameraPermissionDenied(false);
      setScanning(true);

      await new Promise((resolve) => setTimeout(resolve, 200));

      const videoEl = videoRef.current;
      if (!videoEl) {
        console.error("[QR Scanner] Video element not found");
        setError("Erreur interne du scanner");
        setScanning(false);
        return;
      }

      if (qrScannerRef.current) {
        try {
          qrScannerRef.current.stop();
          qrScannerRef.current.destroy();
        } catch {}
        qrScannerRef.current = null;
      }

      const scanner = new QrScanner(
        videoEl,
        (result) => {
          const text = typeof result === "string" ? result : result?.data;
          if (text) {
            console.log("[QR Scanner] Live decode:", text);
            void handleScanSuccess(text);
          }
        },
        {
          preferredCamera: "environment",
          highlightScanRegion: true,
          highlightCodeOutline: true,
          maxScansPerSecond: 10,
        },
      );

      qrScannerRef.current = scanner;
      await scanner.start();
      setScannerReady(true);
      console.log("[QR Scanner] Live scanner started");
    } catch (err) {
      console.error("[QR Scanner] Live scanner error:", err);

      if (isCameraPermissionError(err)) {
        setCameraPermissionDenied(true);
        setError("Accès à l’appareil photo refusé. Autorisez la caméra dans les réglages du navigateur ou de l’app.");
      } else {
        setError("Impossible d'accéder à l'appareil photo. Essayez " + '"Scanner depuis une image"' + ".");
      }

      setScanning(false);
    }
  }, [handleScanSuccess, startNativeScan]);

  const scanFromPhoto = async () => {
    try {
      await stopScanning();
      setError(null);
      setCameraPermissionDenied(false);

      const photo = await Camera.getPhoto({
        source: CameraSource.Camera,
        resultType: CameraResultType.Base64,
        quality: 100,
        correctOrientation: true,
        saveToGallery: false,
      });

      if (!photo.base64String) {
        toast.error("Impossible de capturer la photo");
        return;
      }

      await decodeQRFromBase64(photo.base64String, photo.format);
    } catch (err: any) {
      if (err?.message?.toLowerCase()?.includes("cancel")) {
        toast.info("Capture annulée");
        return;
      }

      console.error("[QR Scanner] Photo error:", err);
      if (isCameraPermissionError(err)) {
        setCameraPermissionDenied(true);
        setError("Accès à l’appareil photo refusé. Autorisez la caméra dans Réglages > S-reptrack > Caméra.");
      } else {
        toast.error("Erreur lors de la capture photo");
      }
    }
  };

  const scanFromGallery = async () => {
    try {
      await stopScanning();
      setError(null);

      const photo = await Camera.getPhoto({
        source: CameraSource.Photos,
        resultType: CameraResultType.Base64,
        quality: 100,
      });

      if (!photo.base64String) {
        toast.error("Impossible de charger l'image");
        return;
      }

      await decodeQRFromBase64(photo.base64String, photo.format);
    } catch (err: any) {
      if (err?.message?.toLowerCase()?.includes("cancel")) {
        toast.info("Sélection annulée");
        return;
      }
      console.error("[QR Scanner] Gallery error:", err);
      toast.error("Impossible de scanner l'image");
    }
  };

  const decodeQRFromBase64 = async (base64: string, format?: string) => {
    const img = new Image();
    await new Promise<void>((resolve, reject) => {
      img.onload = () => resolve();
      img.onerror = () => reject(new Error("Erreur de chargement de l'image"));
      img.src = `data:image/${format || "jpeg"};base64,${base64}`;
    });

    const maxDim = 1024;
    const scale = Math.min(1, maxDim / Math.max(img.width, img.height));
    const canvas = document.createElement("canvas");
    canvas.width = Math.max(1, Math.floor(img.width * scale));
    canvas.height = Math.max(1, Math.floor(img.height * scale));
    const ctx = canvas.getContext("2d");
    if (!ctx) {
      toast.error("Erreur de traitement de l'image");
      return;
    }
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

    try {
      const qrResult: any = await (QrScanner as any).scanImage(canvas);
      const text = typeof qrResult === "string" ? qrResult : qrResult?.data;
      if (text) {
        await handleScanSuccess(text);
        return;
      }
    } catch {}

    let imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    let code = jsQR(imageData.data, imageData.width, imageData.height, {
      inversionAttempts: "attemptBoth",
    });

    if (!code) {
      const data = imageData.data;
      for (let i = 0; i < data.length; i += 4) {
        const gray = 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2];
        const value = Math.max(0, Math.min(255, (gray - 128) * 1.5 + 128));
        data[i] = data[i + 1] = data[i + 2] = value;
      }
      code = jsQR(imageData.data, imageData.width, imageData.height, {
        inversionAttempts: "attemptBoth",
      });
    }

    if (!code) {
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      const size = Math.floor(Math.min(canvas.width, canvas.height) * 0.8);
      const x = Math.floor((canvas.width - size) / 2);
      const y = Math.floor((canvas.height - size) / 2);
      const cropped = ctx.getImageData(x, y, size, size);
      code = jsQR(cropped.data, size, size, { inversionAttempts: "attemptBoth" });
    }

    if (code?.data) {
      await handleScanSuccess(code.data);
    } else {
      toast.error("QR code non détecté. Assurez-vous que le QR code est bien visible et net.");
      setError("QR code non détecté dans l'image");
    }
  };

  useEffect(() => {
    if (!open) {
      void stopScanning();
      setError(null);
      setCameraPermissionDenied(false);
      setScannerReady(false);
    }
  }, [open, stopScanning]);

  useEffect(() => {
    return () => {
      void stopScanning();
    };
  }, [stopScanning]);

  const handleClose = async () => {
    await stopScanning();
    setError(null);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md max-h-[100dvh] overflow-y-auto pt-[env(safe-area-inset-top,16px)]">
        <div className="sticky top-0 z-10 pb-2">
          <Button variant="destructive" size="sm" onClick={handleClose} className="w-full h-10 gap-2 text-sm font-medium">
            <X className="h-4 w-4" />
            Fermer le scanner
          </Button>
        </div>

        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 justify-center">
            <CameraIcon className="h-5 w-5" />
            Scanner un QR Code
          </DialogTitle>
          <DialogDescription className="sr-only">Scannez un QR code pour ouvrir la fiche de l'animal</DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {error ? (
            <div className="text-center space-y-4">
              <div className="flex justify-center">
                <div className="rounded-full bg-destructive/10 p-4">
                  <CameraIcon className="h-12 w-12 text-destructive" />
                </div>
              </div>
              <div className="space-y-2">
                <p className="text-sm font-medium text-destructive">{error}</p>
                <p className="text-xs text-muted-foreground">
                  {cameraPermissionDenied
                    ? "Autorisez la caméra dans les réglages iOS de l’app, puis relancez le scanner."
                    : "Vous pouvez aussi scanner depuis une photo ou une image existante."}
                </p>
              </div>
              <div className="flex flex-col gap-2">
                <Button onClick={() => void startLiveScanner()} className="w-full min-h-[44px]" style={{ touchAction: "manipulation" }}>
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Réessayer le scanner
                </Button>
                {cameraPermissionDenied && isNative && (
                  <Button
                    onClick={() => void BarcodeScanner.openSettings()}
                    variant="secondary"
                    className="w-full min-h-[44px]"
                    style={{ touchAction: "manipulation" }}
                  >
                    Ouvrir les réglages iOS
                  </Button>
                )}
                <Button onClick={scanFromPhoto} variant="outline" className="w-full min-h-[44px]" style={{ touchAction: "manipulation" }}>
                  <CameraIcon className="h-4 w-4 mr-2" />
                  Prendre une photo du QR
                </Button>
                <Button onClick={scanFromGallery} variant="outline" className="w-full min-h-[44px]" style={{ touchAction: "manipulation" }}>
                  <ImageIcon className="h-4 w-4 mr-2" />
                  Scanner depuis une image
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {isNative ? (
                <div className="space-y-4">
                  <div className="rounded-lg border border-border bg-muted/40 p-6 text-center space-y-3">
                    <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-primary/10">
                      <CameraIcon className="h-7 w-7 text-primary" />
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm font-medium text-foreground">Scanner natif iPhone / iPad</p>
                      <p className="text-xs text-muted-foreground">
                        Touchez le bouton ci-dessous pour ouvrir le vrai scanner caméra de l’app.
                      </p>
                    </div>
                  </div>

                  <Button onClick={() => void startLiveScanner()} className="w-full min-h-[44px]" style={{ touchAction: "manipulation" }}>
                    <CameraIcon className="h-4 w-4 mr-2" />
                    {scanning ? "Ouverture du scanner..." : "Ouvrir le scanner QR"}
                  </Button>
                </div>
              ) : (
                <>
                  <div className="relative rounded-lg overflow-hidden border-2 border-primary bg-black aspect-square">
                    <video ref={videoRef} className="w-full h-full object-cover" muted playsInline />
                    {scanning && !scannerReady && (
                      <div className="absolute inset-0 flex items-center justify-center bg-black/60">
                        <div className="text-center space-y-2">
                          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto" />
                          <p className="text-xs text-white">Initialisation de la caméra...</p>
                        </div>
                      </div>
                    )}
                    {!scanning && (
                      <div className="absolute inset-0 flex items-center justify-center bg-black/40">
                        <Button onClick={() => void startLiveScanner()} size="lg" className="min-h-[44px]" style={{ touchAction: "manipulation" }}>
                          <CameraIcon className="h-5 w-5 mr-2" />
                          Démarrer le scanner
                        </Button>
                      </div>
                    )}
                  </div>

                  {scannerReady && (
                    <p className="text-xs text-center text-muted-foreground">
                      Positionnez le QR code dans le cadre — la détection est automatique
                    </p>
                  )}
                </>
              )}

              <div className="flex flex-col gap-2">
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-background px-2 text-muted-foreground">ou</span>
                  </div>
                </div>
                <Button onClick={scanFromPhoto} variant="outline" className="w-full min-h-[44px]" style={{ touchAction: "manipulation" }}>
                  <CameraIcon className="h-4 w-4 mr-2" />
                  Prendre une photo du QR
                </Button>
                <Button onClick={scanFromGallery} variant="outline" className="w-full min-h-[44px]" style={{ touchAction: "manipulation" }}>
                  <ImageIcon className="h-4 w-4 mr-2" />
                  Scanner depuis une image
                </Button>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
