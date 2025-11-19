import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { QRCodeSVG } from "qrcode.react";
import { Button } from "@/components/ui/button";
import { Download, AlertTriangle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface QRCodeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  reptileId: string;
  reptileName: string;
}

const QRCodeDialog = ({ open, onOpenChange, reptileId, reptileName }: QRCodeDialogProps) => {
  const navigate = useNavigate();
  // Format simplifié: juste l'UUID pour meilleure compatibilité
  const qrCodeUrl = reptileId;
  
  console.log("[🔍 QR Code Dialog] Génération QR code:");
  console.log("  - Reptile ID (UUID):", reptileId);
  console.log("  - Contenu du QR:", qrCodeUrl);

  const downloadQRCode = () => {
    const svg = document.getElementById("qr-code-svg");
    if (!svg) return;

    const svgData = new XMLSerializer().serializeToString(svg);
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    const img = new Image();

    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;
      ctx?.drawImage(img, 0, 0);
      const pngFile = canvas.toDataURL("image/png");

      const downloadLink = document.createElement("a");
      downloadLink.download = `qr-code-${reptileName}.png`;
      downloadLink.href = pngFile;
      downloadLink.click();
    };

    img.src = "data:image/svg+xml;base64," + btoa(svgData);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>QR Code - {reptileName}</DialogTitle>
        </DialogHeader>
        
        <Alert className="bg-yellow-500/10 border-yellow-500/20">
          <AlertTriangle className="h-4 w-4 text-yellow-600 dark:text-yellow-500" />
          <AlertDescription className="text-sm">
            <strong>⚠️ Ancien QR code obsolète</strong>
            <br />
            Si vous avez déjà imprimé ce QR code, il ne fonctionnera pas correctement.
            <br />
            <Button
              variant="link"
              className="h-auto p-0 text-primary underline"
              onClick={() => {
                onOpenChange(false);
                navigate("/qr-codes");
              }}
            >
              Téléchargez les nouveaux QR codes ici
            </Button>
          </AlertDescription>
        </Alert>

        <div className="flex flex-col items-center gap-4 py-4">
          <div className="bg-white p-4 rounded-lg">
            <QRCodeSVG
              id="qr-code-svg"
              value={qrCodeUrl}
              size={256}
              level="H"
              includeMargin={true}
            />
          </div>
          <p className="text-sm text-muted-foreground text-center">
            Scannez ce code pour accéder directement à la fiche de {reptileName}
          </p>
          <Button onClick={downloadQRCode} variant="outline" className="w-full">
            <Download className="mr-2 h-4 w-4" />
            Télécharger le QR Code
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default QRCodeDialog;
