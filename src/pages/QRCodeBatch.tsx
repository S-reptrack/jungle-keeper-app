import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Download, ArrowLeft } from "lucide-react";
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
    if (!ctx) return;
    
    const img = new Image();

    img.onload = () => {
      // Ajouter de l'espace pour le texte en bas (40px de plus)
      canvas.width = img.width;
      canvas.height = img.height + 40;
      
      // Fond blanc
      ctx.fillStyle = "white";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      // Dessiner le QR code
      ctx.drawImage(img, 0, 0);
      
      // Nom du reptile en noir
      ctx.fillStyle = "#000000";
      ctx.font = "14px Arial";
      ctx.textAlign = "center";
      ctx.fillText(reptileName, canvas.width / 2, img.height + 25);
      
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
      toast.success(`✅ ${reptiles.length} QR codes téléchargés !`, { duration: 5000 });
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
          <Button onClick={downloadAllQRCodes} size="lg" className="bg-primary text-primary-foreground hover:bg-primary/90 shadow-lg">
            <Download className="mr-2 h-5 w-5" />
            Télécharger Tous les QR Codes ({reptiles.length})
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {reptiles.map((reptile) => {
            // Format simplifié: juste l'UUID pour meilleure compatibilité
            const qrCodeUrl = reptile.id;
            
            console.log(`[QR Batch] ${reptile.name}: ${qrCodeUrl}`);

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
