import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Download, ArrowLeft, AlertTriangle } from "lucide-react";
import { QRCodeSVG } from "qrcode.react";
import { toast } from "sonner";

interface Reptile {
  id: string;
  name: string;
  species: string;
}

const QRCodeBatch = () => {
  const [reptiles, setReptiles] = useState<Reptile[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchReptiles();
  }, []);

  const fetchReptiles = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate("/auth");
        return;
      }

      const { data, error } = await supabase
        .from("reptiles")
        .select("id, name, species")
        .eq("user_id", user.id)
        .order("name");

      if (error) throw error;
      setReptiles(data || []);
    } catch (error) {
      console.error("Erreur:", error);
      toast.error("Impossible de charger les reptiles");
    } finally {
      setLoading(false);
    }
  };

  const downloadQRCode = (reptileId: string, reptileName: string) => {
    const svg = document.getElementById(`qr-code-${reptileId}`);
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
      
      toast.success(`QR Code téléchargé: ${reptileName}`);
    };

    img.src = "data:image/svg+xml;base64," + btoa(svgData);
  };

  const downloadAllQRCodes = () => {
    toast.info("🚀 Téléchargement en cours...", { duration: 2000 });
    
    reptiles.forEach((reptile, index) => {
      setTimeout(() => {
        downloadQRCode(reptile.id, reptile.name);
      }, index * 500);
    });
    
    setTimeout(() => {
      toast.success(`✅ ${reptiles.length} nouveaux QR codes téléchargés !`, { duration: 5000 });
      toast.warning("⚠️ N'oubliez pas : JETEZ et REMPLACEZ tous les anciens QR codes imprimés", { duration: 8000 });
    }, reptiles.length * 500 + 1000);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-background to-secondary/20 p-6">
        <div className="max-w-7xl mx-auto">
          <p>Chargement...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-secondary/20 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              size="icon"
              onClick={() => navigate("/reptiles")}
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <h1 className="text-3xl font-bold">Tous les QR Codes</h1>
          </div>
          <Button onClick={downloadAllQRCodes} size="lg" className="bg-primary text-primary-foreground hover:bg-primary/90 shadow-lg animate-pulse">
            <Download className="mr-2 h-5 w-5" />
            ⬇️ TÉLÉCHARGER TOUS LES NOUVEAUX QR CODES ({reptiles.length})
          </Button>
        </div>

        <div className="bg-red-500/10 border-2 border-red-500 rounded-lg p-6 space-y-3">
          <div className="flex items-start gap-3">
            <div className="bg-red-500 text-white rounded-full p-2 flex-shrink-0">
              <AlertTriangle className="h-6 w-6" />
            </div>
            <div className="space-y-2">
              <h3 className="text-lg font-bold text-red-700 dark:text-red-400">
                🚨 ACTION REQUISE : Remplacer TOUS les anciens QR codes
              </h3>
              <div className="text-sm text-red-600 dark:text-red-300 space-y-2">
                <p className="font-semibold">Les anciens QR codes imprimés NE FONCTIONNENT PLUS !</p>
                <ol className="list-decimal list-inside space-y-1 ml-2">
                  <li>Cliquez sur "Télécharger Tous" ci-dessus</li>
                  <li>Imprimez les nouveaux QR codes téléchargés</li>
                  <li>JETEZ et REMPLACEZ tous les anciens QR codes</li>
                  <li>Testez avec un nouveau QR code pour confirmer</li>
                </ol>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {reptiles.map((reptile) => {
            const qrCodeUrl = `${window.location.origin}/reptile/${reptile.id}`;
            
            console.log(`[QR Batch] ${reptile.name}:`, qrCodeUrl);

            return (
              <Card key={reptile.id}>
                <CardHeader>
                  <CardTitle className="text-lg">{reptile.name}</CardTitle>
                  <p className="text-sm text-muted-foreground">{reptile.species}</p>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="bg-white p-4 rounded-lg flex justify-center">
                    <QRCodeSVG
                      id={`qr-code-${reptile.id}`}
                      value={qrCodeUrl}
                      size={200}
                      level="H"
                      includeMargin={true}
                    />
                  </div>
                  <div className="text-xs text-muted-foreground break-all bg-secondary/50 p-2 rounded">
                    {qrCodeUrl}
                  </div>
                  <Button
                    onClick={() => downloadQRCode(reptile.id, reptile.name)}
                    variant="outline"
                    className="w-full"
                  >
                    <Download className="mr-2 h-4 w-4" />
                    Télécharger
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default QRCodeBatch;
