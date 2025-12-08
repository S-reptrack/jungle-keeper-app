import { useNavigate } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { useSignedImageUrl } from "@/lib/storageUtils";

interface ReptileListItemProps {
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
  showImage?: boolean;
}

const ReptileListItem = ({ 
  id, 
  name, 
  species, 
  age, 
  weight, 
  lastFed, 
  image, 
  daysUntilHatch, 
  status, 
  sex,
  showImage = false
}: ReptileListItemProps) => {
  const navigate = useNavigate();
  const { signedUrl, loading } = useSignedImageUrl(showImage ? image : null);

  const handleClick = () => {
    navigate(`/reptile/${id}`);
  };

  return (
    <div 
      className="flex items-center gap-3 p-3 bg-card border border-border/50 rounded-lg hover:bg-accent/10 cursor-pointer transition-colors"
      onClick={handleClick}
    >
      {showImage && (
        <div className="w-12 h-12 rounded-lg overflow-hidden flex-shrink-0 bg-muted">
          {!loading && signedUrl ? (
            <img 
              src={signedUrl} 
              alt={name}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-jungle-mid to-jungle-light" />
          )}
        </div>
      )}
      
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          {sex && (
            <span 
              className={`text-lg font-bold ${
                sex === "male" 
                  ? "text-blue-500" 
                  : sex === "female" 
                  ? "text-pink-500" 
                  : "text-muted-foreground"
              }`}
            >
              {sex === "male" ? "♂" : sex === "female" ? "♀" : "?"}
            </span>
          )}
          <span className="font-semibold text-foreground truncate">{name}</span>
          {daysUntilHatch !== undefined && daysUntilHatch !== null && (
            <Badge className="bg-orange-500 text-white text-xs px-1.5 py-0.5">
              🥚 {daysUntilHatch}j
            </Badge>
          )}
          {status === "for_sale" && (
            <span className="inline-flex items-center gap-0.5 text-[10px] font-medium text-amber-400/90 bg-amber-400/10 px-1.5 py-0.5 rounded-full">
              <span className="text-[8px]">💰</span>
              vendre
            </span>
          )}
        </div>
        <p className="text-xs text-muted-foreground truncate">{species}</p>
      </div>
      
      <div className="flex items-center gap-3 text-xs text-muted-foreground flex-shrink-0">
        <span>{age}</span>
        <span>{weight}</span>
      </div>
    </div>
  );
};

export default ReptileListItem;
