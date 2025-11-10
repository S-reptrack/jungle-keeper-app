import { useState, useEffect, useRef } from "react";
import { Html5Qrcode } from "html5-qrcode";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { X, Camera as CameraIcon } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { Capacitor } from "@capacitor/core";
import { Camera } from "@capacitor/camera";
import { BarcodeScanner } from "@capacitor-mlkit/barcode-scanning";
interface QRScannerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function QRScanner({ open, onOpenChange }: QRScannerProps) {
  const [scanning, setScanning] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [permissionRequested, setPermissionRequested] = useState(false);
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    return () => {
      stopScanning();
    };
  }, []);

  // Force permission prompt when the dialog opens
  useEffect(() => {
    if (open && !permissionRequested && !scanning) {
      startScanning();
    }
    // We intentionally avoid adding startScanning as a dependency to prevent re-runs
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const startScanning = async () => {
    try {
      setError(null);
      setPermissionRequested(true);

      // Native (Capacitor) fallback using MLKit BarcodeScanner
      if (Capacitor.isNativePlatform()) {
        try {
          // Preflight via Capacitor Camera to ensure runtime permission prompt exists
          try {
            const camPerm: any = await Camera.requestPermissions({ permissions: ['camera'] as any });
            console.log('Camera plugin permissions:', camPerm);
            if (camPerm?.camera && camPerm.camera !== 'granted') {
              const msg = "Accès à la caméra refusé";
              setError(msg);
              toast.error(msg);
              return;
            }
          } catch (e) {
            console.warn('Camera.requestPermissions failed', e);
          }

          // Check and request MLKit permissions
          const permissions = await BarcodeScanner.checkPermissions();
          console.log("Permissions initiales:", permissions);
          
          if (permissions.camera !== 'granted') {
            const requested = await BarcodeScanner.requestPermissions();
            console.log("Permissions après demande:", requested);
            
            if (requested.camera !== 'granted') {
              const msg = "Accès à la caméra refusé";
              setError(msg);
              toast.error(msg);
              return;
            }
          }

          // Start scanning only if we have permission
          const result = await BarcodeScanner.scan();
          
          if (result.barcodes && result.barcodes.length > 0) {
            const barcodeValue = result.barcodes[0].displayValue || result.barcodes[0].rawValue;
            if (barcodeValue) {
              await handleScanSuccess(barcodeValue);
            } else {
              toast.error("Aucun QR code détecté");
            }
          } else {
            toast.error("Aucun QR code détecté");
          }
        } catch (nativeErr: any) {
          console.error("Erreur scan natif:", nativeErr);
          // Check if it's a permission error
          if (nativeErr.message && nativeErr.message.toLowerCase().includes('permission')) {
            const msg = "Accès à la caméra refusé";
            setError(msg);
            toast.error(msg);
          } else {
            const msg = "Impossible de démarrer la caméra. Vérifiez les autorisations dans les paramètres.";
            setError(msg);
            toast.error(msg);
          }
        }
        return; // stop here for native path
      }

      // Web path with html5-qrcode
      // Request camera permission explicitly
      try {
        await navigator.mediaDevices
          .getUserMedia({ video: { facingMode: "environment" } })
          .then((stream) => {
            // Stop the stream immediately, we just needed permission
            stream.getTracks().forEach((track) => track.stop());
          });
      } catch (permError: any) {
        console.error("Permission error:", permError);
        let errorMessage = "Accès à la caméra refusé";
        if (permError.name === "NotAllowedError") {
          errorMessage =
            "Veuillez autoriser l'accès à la caméra dans les paramètres de votre navigateur";
        } else if (permError.name === "NotFoundError") {
          errorMessage = "Aucune caméra trouvée sur cet appareil";
        }
        setError(errorMessage);
        toast.error(errorMessage);
        return;
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
          fps: 10,
          qrbox: { width: 250, height: 250 },
          aspectRatio: 1.0,
        },
        (decodedText) => {
          handleScanSuccess(decodedText);
        },
        (_errorMessage) => {
          // Ignore scan errors, they happen continuously while scanning
        }
      );

      setScanning(true);
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
    try {
      if (Capacitor.isNativePlatform()) {
        await BarcodeScanner.stopScan();
      }
    } catch (e) {
      console.warn("Arrêt du scan natif: ", e);
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
    await stopScanning();
    
    // Extract reptile ID from URL
    const urlPattern = /\/reptile\/([a-f0-9-]+)/i;
    const match = decodedText.match(urlPattern);
    
    if (match && match[1]) {
      const reptileId = match[1];
      onOpenChange(false);
      toast.success("QR code scanné avec succès !");
      navigate(`/reptile/${reptileId}`);
    } else {
      toast.error("QR code invalide. Veuillez scanner un QR code d'animal.");
      setError("QR code invalide");
    }
  };

  const handleClose = async () => {
    await stopScanning();
    setError(null);
    setPermissionRequested(false);
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
        </DialogHeader>

        <div className="space-y-4">
          {!permissionRequested ? (
            <div className="text-center space-y-4">
              <div className="flex justify-center">
                <div className="rounded-full bg-primary/10 p-4">
                  <CameraIcon className="h-12 w-12 text-primary" />
                </div>
              </div>
              <div className="space-y-2">
                <p className="text-sm font-medium">
                  Autorisation requise
                </p>
                <p className="text-xs text-muted-foreground">
                  Pour scanner le QR code, l'application a besoin d'accéder à votre appareil photo.
                </p>
              </div>
              <Button onClick={startScanning} className="w-full">
                Autoriser et scanner
              </Button>
            </div>
          ) : error ? (
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
                <div className="bg-muted/50 rounded-lg p-4 space-y-3 text-left">
                  <div className="space-y-2">
                    <p className="text-xs font-semibold text-foreground">
                      📱 Sur Android :
                    </p>
                    <ol className="text-xs text-muted-foreground space-y-1.5 pl-4">
                      <li className="list-decimal">Fermez l'application complètement</li>
                      <li className="list-decimal">Ouvrez <span className="font-medium text-foreground">Paramètres</span> → <span className="font-medium text-foreground">Applications</span></li>
                      <li className="list-decimal">Trouvez <span className="font-medium text-foreground">S-reptrack</span> dans la liste</li>
                      <li className="list-decimal">Appuyez sur <span className="font-medium text-foreground">Autorisations</span></li>
                      <li className="list-decimal">Appuyez sur <span className="font-medium text-foreground">Appareil photo</span></li>
                      <li className="list-decimal">Sélectionnez <span className="font-medium text-foreground">Autoriser</span></li>
                      <li className="list-decimal">Rouvrez l'application</li>
                    </ol>
                  </div>
                  <div className="space-y-2 pt-2 border-t border-border/50">
                    <p className="text-xs font-semibold text-foreground">
                      🍎 Sur iPhone :
                    </p>
                    <ol className="text-xs text-muted-foreground space-y-1.5 pl-4">
                      <li className="list-decimal">Fermez l'application complètement</li>
                      <li className="list-decimal">Ouvrez <span className="font-medium text-foreground">Réglages</span></li>
                      <li className="list-decimal">Descendez et trouvez <span className="font-medium text-foreground">S-reptrack</span></li>
                      <li className="list-decimal">Activez <span className="font-medium text-foreground">Appareil photo</span></li>
                      <li className="list-decimal">Rouvrez l'application</li>
                    </ol>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Astuce: si l'option <span className="font-medium text-foreground">Appareil photo</span> n'apparaît pas dans les autorisations de <span className="font-medium text-foreground">S-reptrack</span>, l'application a été installée sans la permission caméra. Dans ce cas, mettez l'application à jour puis réessayez.
                  </p>
                </div>
              </div>
              <Button onClick={startScanning} className="w-full">
                Réessayer après avoir activé l'autorisation
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              <div 
                id="qr-reader" 
                className="w-full rounded-lg overflow-hidden border-2 border-primary"
              />
              <p className="text-xs text-center text-muted-foreground">
                Positionnez le QR code dans le cadre pour le scanner
              </p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
