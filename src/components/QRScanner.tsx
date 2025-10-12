import { useState, useEffect, useRef } from "react";
import { Html5Qrcode } from "html5-qrcode";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { X, Camera } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

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
    if (open) {
      startScanning();
    }

    return () => {
      stopScanning();
    };
  }, [open]);

  const startScanning = async () => {
    try {
      setError(null);
      const scanner = new Html5Qrcode("qr-reader");
      scannerRef.current = scanner;

      // Get available cameras
      const cameras = await Html5Qrcode.getCameras();
      
      if (!cameras || cameras.length === 0) {
        setError("Aucune caméra trouvée sur cet appareil");
        return;
      }

      // Use the back camera (usually the last one on mobile)
      const cameraId = cameras[cameras.length - 1].id;

      await scanner.start(
        cameraId,
        {
          fps: 10,
          qrbox: { width: 250, height: 250 }
        },
        (decodedText) => {
          handleScanSuccess(decodedText);
        },
        (errorMessage) => {
          // Ignore scan errors, they happen continuously while scanning
        }
      );

      setScanning(true);
    } catch (err: any) {
      console.error("Erreur lors du démarrage du scan:", err);
      
      let errorMessage = "Impossible de démarrer la caméra";
      if (err.name === 'NotAllowedError') {
        errorMessage = "Accès à la caméra refusé. Veuillez autoriser l'accès dans les paramètres.";
      } else if (err.name === 'NotFoundError') {
        errorMessage = "Aucune caméra trouvée sur cet appareil";
      } else if (err.name === 'NotSupportedError') {
        errorMessage = "La caméra n'est pas supportée sur ce navigateur";
      } else if (err.name === 'NotReadableError') {
        errorMessage = "La caméra est peut-être déjà utilisée par une autre application";
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
              <Camera className="h-5 w-5" />
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
              <p className="text-sm text-destructive">
                {error}
              </p>
              <Button onClick={startScanning} className="w-full">
                Réessayer
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
