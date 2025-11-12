import { useState, useEffect, useRef } from "react";
import { Html5Qrcode } from "html5-qrcode";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { X, Camera as CameraIcon } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { Capacitor } from "@capacitor/core";
import { Camera, CameraResultType, CameraSource } from "@capacitor/camera";
import jsQR from "jsqr";
interface QRScannerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function QRScanner({ open, onOpenChange }: QRScannerProps) {
  const [scanning, setScanning] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const navigate = useNavigate();

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

  const startScanning = async () => {
    try {
      setError(null);

      // Native (Capacitor) - Use Camera API like ImageUploadDialog
      if (Capacitor.isNativePlatform()) {
        try {
          // Take photo using the same API that works for ImageUploadDialog
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
          let imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
          
          // Conversion en niveaux de gris et augmentation du contraste pour meilleure détection
          const data = imageData.data;
          for (let i = 0; i < data.length; i += 4) {
            const gray = 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2];
            // Augmentation du contraste
            const contrasted = ((gray - 128) * 1.5) + 128;
            const value = Math.max(0, Math.min(255, contrasted));
            data[i] = data[i + 1] = data[i + 2] = value;
          }
          
          // Tentative 1: Image complète
          let code = jsQR(imageData.data, imageData.width, imageData.height, {
            inversionAttempts: "dontInvert",
          });

          // Tentative 2: Image complète avec inversion
          if (!code) {
            code = jsQR(imageData.data, imageData.width, imageData.height, {
              inversionAttempts: "attemptBoth",
            });
          }

          // Tentative 3: Crop central 80%
          if (!code) {
            const size = Math.floor(Math.min(canvas.width, canvas.height) * 0.8);
            const x = Math.floor((canvas.width - size) / 2);
            const y = Math.floor((canvas.height - size) / 2);
            const cropped = ctx.getImageData(x, y, size, size);
            code = jsQR(cropped.data, size, size, {
              inversionAttempts: "attemptBoth",
            });
          }

          // Tentative 4: Crop central 60%
          if (!code) {
            const size = Math.floor(Math.min(canvas.width, canvas.height) * 0.6);
            const x = Math.floor((canvas.width - size) / 2);
            const y = Math.floor((canvas.height - size) / 2);
            const cropped = ctx.getImageData(x, y, size, size);
            code = jsQR(cropped.data, size, size, {
              inversionAttempts: "attemptBoth",
            });
          }

          if (code && code.data) {
            handleScanSuccess(code.data);
          } else {
            toast.error("QR code non détecté");
            setError("Assurez-vous que le QR code occupe au moins 50% de l'écran, avec un bon éclairage et sans reflets.");
          }

          return;
          
        } catch (nativeErr: any) {
          console.error("Erreur caméra native:", nativeErr);
          if (nativeErr.message && nativeErr.message.toLowerCase().includes('cancel')) {
            // User cancelled, just close
            return;
          }
          const msg = "Impossible d'accéder à la caméra";
          setError(msg);
          toast.error(msg);
          return;
        }
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
              <Button onClick={startScanning} className="w-full">
                <CameraIcon className="h-4 w-4 mr-2" />
                Ouvrir la caméra
              </Button>
              {!Capacitor.isNativePlatform() && (
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
                    className="w-full rounded-lg overflow-hidden border-2 border-primary"
                  />
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
