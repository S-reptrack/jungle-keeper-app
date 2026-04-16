import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, Egg } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";

interface HatchingCardProps {
  reptileId: string;
  reptileName: string;
  reptileSpecies: string;
  expectedHatchDate: string;
  daysUntilHatch: number;
  image?: string;
}

export const HatchingCard = ({
  reptileId,
  reptileName,
  reptileSpecies,
  expectedHatchDate,
  daysUntilHatch,
  image,
}: HatchingCardProps) => {
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString(i18n.language, {
      day: "numeric",
      month: "long",
      year: "numeric"
    });
  };

  const getDaysText = (days: number) => {
    if (days === 0) return t("timeAgo.todayExclaim");
    if (days === 1) return t("timeAgo.tomorrow");
    return t("timeAgo.inDays", { days });
  };

  return (
    <Card 
      className="cursor-pointer hover:shadow-lg transition-shadow overflow-hidden"
      onClick={() => navigate(`/reptile/${reptileId}`)}
    >
      <div className="relative h-32 bg-muted overflow-hidden">
        {image ? (
          <img 
            src={image} 
            alt={reptileName}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Egg className="h-12 w-12 text-muted-foreground" />
          </div>
        )}
        <Badge 
          variant={daysUntilHatch <= 7 ? "destructive" : "secondary"}
          className="absolute top-2 right-2"
        >
          {getDaysText(daysUntilHatch)}
        </Badge>
      </div>
      
      <CardHeader className="pb-3">
        <CardTitle className="text-lg">{reptileName}</CardTitle>
        <p className="text-sm text-muted-foreground">{reptileSpecies}</p>
      </CardHeader>
      
      <CardContent>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Calendar className="h-4 w-4" />
          <span>{t("reptile.reproduction.expectedDate")}: {formatDate(expectedHatchDate)}</span>
        </div>
      </CardContent>
    </Card>
  );
};
