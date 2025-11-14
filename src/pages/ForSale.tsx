import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import Navigation from "@/components/Navigation";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tag, Scale, Calendar } from "lucide-react";
import { useSignedImageUrl } from "@/lib/storageUtils";
import { differenceInYears, differenceInMonths } from "date-fns";

interface Reptile {
  id: string;
  name: string;
  species: string;
  sex: string | null;
  birth_date: string;
  weight: number;
  morphs: string[];
  image_url: string | null;
  user_id: string;
}

const ForSale = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [reptiles, setReptiles] = useState<Reptile[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchReptiles();
  }, []);

  const fetchReptiles = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from("reptiles")
        .select("*")
        .eq("status", "for_sale")
        .eq("user_id", user.id)
        .order("name", { ascending: true });

      if (error) throw error;
      setReptiles(data || []);
    } catch (error) {
      console.error("Error fetching reptiles:", error);
    } finally {
      setLoading(false);
    }
  };

  const parseDate = (dateString: string) => {
    const [year, month, day] = dateString.split('-').map(Number);
    return new Date(year, month - 1, day);
  };

  const formatDate = (dateString: string) => {
    return parseDate(dateString).toLocaleDateString('fr-FR');
  };

  const calculateAge = (birthDate: string) => {
    const birth = parseDate(birthDate);
    const now = new Date();
    const years = differenceInYears(now, birth);
    const months = differenceInMonths(now, birth) % 12;

    if (years > 0) {
      return `${years} an${years > 1 ? 's' : ''}${months > 0 ? ` ${months} mois` : ""}`;
    }
    return `${months} mois`;
  };

  const getSexIcon = (sex: string | null) => {
    if (sex === "male") return "♂";
    if (sex === "female") return "♀";
    return "?";
  };

  const getSexLabel = (sex: string | null) => {
    if (sex === "male") return "Mâle";
    if (sex === "female") return "Femelle";
    return "Inconnu";
  };

  const groupBySpecies = (reptileList: Reptile[]) => {
    const grouped = reptileList.reduce((acc, reptile) => {
      const species = reptile.species || "Non spécifié";
      if (!acc[species]) {
        acc[species] = [];
      }
      acc[species].push(reptile);
      return acc;
    }, {} as Record<string, Reptile[]>);
    
    return Object.entries(grouped).sort(([a], [b]) => a.localeCompare(b)) as [string, Reptile[]][];
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <main className="max-w-7xl mx-auto px-4 py-8 md:mt-16">
          <p className="text-center text-muted-foreground">Chargement...</p>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <main className="max-w-7xl mx-auto px-4 py-8 md:mt-16" style={{ paddingBottom: 'calc(6rem + env(safe-area-inset-bottom))' }}>
        <div className="mb-8 flex items-center gap-3">
          <Tag className="w-8 h-8 text-primary" />
          <div>
            <h1 className="text-3xl font-bold text-foreground mb-2">À vendre</h1>
            <p className="text-muted-foreground">{reptiles.length} reptile{reptiles.length > 1 ? 's' : ''} à vendre</p>
          </div>
        </div>

        {reptiles.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <p className="text-muted-foreground">Aucun reptile à vendre pour le moment</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            {reptiles.map((reptile) => (
              <ReptileForSaleCard key={reptile.id} reptile={reptile} />
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

interface ReptileForSaleCardProps {
  reptile: Reptile;
}

const ReptileForSaleCard = ({ reptile }: ReptileForSaleCardProps) => {
  const navigate = useNavigate();
  const { signedUrl, loading } = useSignedImageUrl(reptile.image_url);

  const parseDate = (dateString: string) => {
    const [year, month, day] = dateString.split('-').map(Number);
    return new Date(year, month - 1, day);
  };

  const calculateAge = (birthDate: string) => {
    const birth = parseDate(birthDate);
    const now = new Date();
    const years = differenceInYears(now, birth);
    const months = differenceInMonths(now, birth) % 12;

    if (years > 0) {
      return `${years} an${years > 1 ? 's' : ''}${months > 0 ? ` ${months} mois` : ""}`;
    }
    return `${months} mois`;
  };

  const getSexLabel = (sex: string | null) => {
    if (sex === "male") return "Mâle";
    if (sex === "female") return "Femelle";
    return "Inconnu";
  };

  const getSexIcon = (sex: string | null) => {
    if (sex === "male") return "♂";
    if (sex === "female") return "♀";
    return "?";
  };

  return (
    <Card 
      className="overflow-hidden cursor-pointer hover:shadow-lg transition-all hover:border-primary/50"
      onClick={() => navigate(`/reptile/${reptile.id}`)}
    >
      <div className="grid md:grid-cols-[300px_1fr] gap-0">
        {/* Image Section */}
        <div className="relative h-64 md:h-auto bg-gradient-to-br from-jungle-mid to-jungle-light">
          {!loading && signedUrl && (
            <img 
              src={signedUrl} 
              alt={reptile.name}
              className="w-full h-full object-cover"
            />
          )}
          <div className="absolute top-3 right-3">
            <Badge variant="outline" className="border-primary text-primary bg-background/90 backdrop-blur-sm">
              À vendre
            </Badge>
          </div>
        </div>

        {/* Info Section */}
        <div className="p-6">
          <CardHeader className="p-0 mb-4">
            <div className="flex items-start justify-between mb-2">
              <div className="flex-1">
                <CardTitle className="text-2xl mb-1">{reptile.name}</CardTitle>
                <p className="text-sm text-muted-foreground">{reptile.species}</p>
              </div>
              <Badge variant="secondary" className="bg-accent/20 text-accent-foreground border-accent/30">
                {calculateAge(reptile.birth_date)}
              </Badge>
            </div>
          </CardHeader>
          
          <CardContent className="p-0 space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Sexe</span>
              <Badge variant="outline" className="inline-flex flex-col items-center justify-center gap-0 whitespace-nowrap leading-none py-1">
                <span className="text-xs leading-none">{getSexLabel(reptile.sex)}</span>
                <span className="h-3.5 leading-none text-xs flex items-center justify-center">
                  {getSexIcon(reptile.sex)}
                </span>
              </Badge>
            </div>
            
            {reptile.morphs && reptile.morphs.length > 0 && (
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Mutations</span>
                <span className="font-medium text-foreground">{reptile.morphs.join(", ")}</span>
              </div>
            )}
            
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground flex items-center gap-2">
                <Scale className="w-4 h-4" />
                Poids
              </span>
              <span className="font-medium text-foreground">{reptile.weight}g</span>
            </div>
          </CardContent>
        </div>
      </div>
    </Card>
  );
};

export default ForSale;
