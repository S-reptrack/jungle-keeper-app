import { useState } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from "react-router-dom";
import { useSignedImageUrl } from "@/lib/storageUtils";
import { useSignedImageUrl } from "@/lib/storageUtils";

interface ReptileCardProps {
  id: string;
  name: string;
  species: string;
  age: string;
  weight: string;
  lastFed: string;
  image?: string | null;
  daysUntilHatch?: number | null;
  status?: string;
  sex?: string | null;
  hasHealthIssue?: boolean;
  hasReproductionActivity?: boolean;
}

const ReptileCard = ({ id, name, species, age, weight, lastFed, image, daysUntilHatch, status, sex, hasHealthIssue, hasReproductionActivity }: ReptileCardProps) => {
  const navigate = useNavigate();
  const [qrDialogOpen, setQrDialogOpen] = useState(false);
  const { signedUrl, loading } = useSignedImageUrl(image);

  const handleCardClick = () => {
    navigate(`/reptile/${id}`, { state: { from: window.location.pathname + window.location.search } });
  };

  return (
    <Card 
      className="group hover:shadow-elevated transition-all duration-300 hover:-translate-y-1 border-border/50 bg-card/80 backdrop-blur-sm overflow-hidden cursor-pointer"
      onClick={handleCardClick}
    >
      <div className="h-48 bg-gradient-to-br from-jungle-mid to-jungle-light relative overflow-hidden">
        {!loading && signedUrl && (
          <img 
            src={signedUrl} 
            alt={name}
            className="w-full h-full object-cover opacity-80 group-hover:scale-110 transition-transform duration-500"
          />
        )}
        {daysUntilHatch !== undefined && daysUntilHatch !== null && status !== 'deceased' && (
          <div className="absolute top-3 left-3">
            <Badge className="bg-orange-500 hover:bg-orange-600 text-white border-0 text-sm font-bold px-3 py-1.5 shadow-lg animate-pulse">
              🥚 Éclosion dans {daysUntilHatch}j
            </Badge>
          </div>
        )}
        {hasReproductionActivity && !(daysUntilHatch !== undefined && daysUntilHatch !== null && status !== 'deceased') && (
          <div className="absolute top-3 left-3">
            <Badge className="bg-pink-500 hover:bg-pink-600 text-white border-0 text-sm font-bold px-3 py-1.5 shadow-lg">
              💕 Reproduction
            </Badge>
          </div>
        )}
        {hasHealthIssue && (
          <div className={`absolute ${(daysUntilHatch !== undefined && daysUntilHatch !== null && status !== 'deceased') || hasReproductionActivity ? 'top-14' : 'top-3'} left-3`}>
            <Badge className="bg-blue-500 hover:bg-blue-600 text-white border-0 text-sm font-bold px-3 py-1.5 shadow-lg">
              🩺 Santé
            </Badge>
          </div>
        )}
        <div className="absolute top-3 right-3">
          <button 
            className="p-2 bg-card/90 backdrop-blur-sm rounded-lg hover:bg-accent transition-colors"
            onClick={(e) => {
              e.stopPropagation();
              setQrDialogOpen(true);
            }}
          >
            <QrCode className="w-5 h-5 text-foreground" />
          </button>
        </div>
      </div>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2">
            {sex && (
              <span 
                className={`text-2xl font-bold ${
                  sex === "male" 
                    ? "text-blue-500" 
                    : sex === "female" 
                    ? "text-pink-500" 
                    : "text-muted-foreground"
                }`}
                title={sex === "male" ? "Mâle" : sex === "female" ? "Femelle" : "Inconnu"}
              >
                {sex === "male" ? "♂" : sex === "female" ? "♀" : "?"}
              </span>
            )}
            <div>
              <h3 className="text-xl font-bold text-foreground">{name}</h3>
              <p className="text-sm text-muted-foreground">{species}</p>
            </div>
          </div>
          <div className="flex flex-col items-end gap-2">
            {status === "for_sale" && (
              <Badge variant="outline" className="border-primary text-primary">
                À vendre
              </Badge>
            )}
            <Badge variant="secondary" className="bg-accent/20 text-accent-foreground border-accent/30">
              {age}
            </Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-2">
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Poids</span>
          <span className="font-medium text-foreground">{weight}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Dernier repas</span>
          <span className="font-medium text-foreground">{lastFed}</span>
        </div>
      </CardContent>

      <QRCodeDialog
        open={qrDialogOpen}
        onOpenChange={setQrDialogOpen}
        reptileId={id}
        reptileName={name}
      />
    </Card>
  );
};

export default ReptileCard;
