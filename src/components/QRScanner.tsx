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
  const [permissionGranted, setPermissionGranted] = useState<boolean | null>(null);
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (open && permissionGranted === null) {
      requestCameraPermission();
    }

    return () => {
      stopScanning();
    };
  }, [open]);

  const requestCameraPermission = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      stream.getTracks().forEach(track => track.stop());
      setPermissionGranted(true);
      startScanning();
    } catch (error) {
      console.error("Permission caméra refusée:", error);
      setPermissionGranted(false);
      toast.error("Accès à la caméra refusé. Veuillez autoriser l'accès dans les paramètres.");
    }
  };

  const startScanning = async () => {
    try {
      const scanner = new Html5Qrcode("qr-reader");
      scannerRef.current = scanner;

      await scanner.start(
        { facingMode: "environment" },
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
    } catch (error) {
      console.error("Erreur lors du démarrage du scan:", error);
      toast.error("Impossible de démarrer la caméra");
      setPermissionGranted(false);
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
      setPermissionGranted(null);
      onOpenChange(false);
    }
  };

  const handleClose = async () => {
    await stopScanning();
    setPermissionGranted(null);
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
          {permissionGranted === false && (
            <div className="text-center space-y-4">
              <p className="text-sm text-muted-foreground">
                L'accès à la caméra est nécessaire pour scanner les QR codes.
              </p>
              <Button onClick={requestCameraPermission} className="w-full">
                Autoriser l'accès à la caméra
              </Button>
            </div>
          )}

          {permissionGranted === true && (
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

          {permissionGranted === null && (
            <div className="text-center py-8">
              <p className="text-sm text-muted-foreground">
                Demande d'autorisation...
              </p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
