import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { QrCode } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface ReptileCardProps {
  name: string;
  species: string;
  age: string;
  weight: string;
  lastFed: string;
  image?: string;
}

const ReptileCard = ({ name, species, age, weight, lastFed, image }: ReptileCardProps) => {
  const navigate = useNavigate();

  const handleCardClick = () => {
    // TODO: Utiliser l'ID réel du reptile
    navigate(`/reptile/1`);
  };

  return (
    <Card 
      className="group hover:shadow-elevated transition-all duration-300 hover:-translate-y-1 border-border/50 bg-card/80 backdrop-blur-sm overflow-hidden cursor-pointer"
      onClick={handleCardClick}
    >
      <div className="h-48 bg-gradient-to-br from-jungle-mid to-jungle-light relative overflow-hidden">
        {image && (
          <img 
            src={image} 
            alt={name}
            className="w-full h-full object-cover opacity-80 group-hover:scale-110 transition-transform duration-500"
          />
        )}
        <div className="absolute top-3 right-3">
          <button 
            className="p-2 bg-card/90 backdrop-blur-sm rounded-lg hover:bg-accent transition-colors"
            onClick={(e) => {
              e.stopPropagation();
              // TODO: Ouvrir la modale QR code
            }}
          >
            <QrCode className="w-5 h-5 text-foreground" />
          </button>
        </div>
      </div>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div>
            <h3 className="text-xl font-bold text-foreground">{name}</h3>
            <p className="text-sm text-muted-foreground">{species}</p>
          </div>
          <Badge variant="secondary" className="bg-accent/20 text-accent-foreground border-accent/30">
            {age}
          </Badge>
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
    </Card>
  );
};

export default ReptileCard;
