import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Users, Calendar, Scale, TrendingUp } from "lucide-react";
import { useTranslation } from "react-i18next";
import { supabase } from "@/integrations/supabase/client";
import Navigation from "@/components/Navigation";
import StatsCard from "@/components/StatsCard";
import ReptileCard from "@/components/ReptileCard";
import AddReptileDialog from "@/components/AddReptileDialog";
import jungleHero from "@/assets/jungle-hero.jpg";

const Index = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [reptiles, setReptiles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuth();
    fetchReptiles();
  }, []);

  const checkAuth = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      navigate("/auth");
    }
  };

  const fetchReptiles = async () => {
    try {
      const { data, error } = await supabase
        .from("reptiles")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(6);

      if (error) throw error;
      setReptiles(data || []);
    } catch (error) {
      console.error("Error fetching reptiles:", error);
    } finally {
      setLoading(false);
    }
  };

  const calculateAge = (birthDate: string) => {
    const birth = new Date(birthDate);
    const today = new Date();
    const months = (today.getFullYear() - birth.getFullYear()) * 12 + today.getMonth() - birth.getMonth();
    const years = Math.floor(months / 12);
    const remainingMonths = months % 12;
    
    if (years > 0) {
      return `${years} an${years > 1 ? 's' : ''}${remainingMonths > 0 ? ` ${remainingMonths} mois` : ''}`;
    }
    return `${remainingMonths} mois`;
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      {/* Hero Section */}
      <div className="relative h-64 md:h-80 overflow-hidden md:mt-16">
        <img 
          src={jungleHero} 
          alt="Jungle amazonienne"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/50 to-transparent" />
        <div className="absolute bottom-8 left-4 right-4 md:left-8">
          <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-2">
            {t("common.appName")}
          </h1>
          <p className="text-lg text-muted-foreground">
            {t("common.tagline")}
          </p>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-8 pb-24 md:pb-8">
        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
          <StatsCard
            title={t("stats.totalReptiles")}
            value={reptiles.length.toString()}
            icon={Users}
          />
          <StatsCard
            title={t("stats.feedingsDue")}
            value="0"
            icon={Calendar}
          />
          <StatsCard
            title={t("stats.avgWeight")}
            value={reptiles.length > 0 ? `${Math.round(reptiles.reduce((sum, r) => sum + (r.weight || 0), 0) / reptiles.length)}g` : "0g"}
            icon={Scale}
          />
          <StatsCard
            title={t("stats.activeBreeding")}
            value="0"
            icon={TrendingUp}
          />
        </div>

        {/* Recent Reptiles */}
        <div>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-foreground">{t("reptile.recentReptiles")}</h2>
            <AddReptileDialog />
          </div>
          
          {loading ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">Chargement...</p>
            </div>
          ) : reptiles.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">
                Aucun reptile ajouté pour le moment. Cliquez sur "Ajouter un reptile" pour commencer!
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {reptiles.map((reptile) => (
                <ReptileCard
                  key={reptile.id}
                  id={reptile.id}
                  name={reptile.name}
                  species={reptile.species}
                  age={calculateAge(reptile.birth_date)}
                  weight={`${reptile.weight}g`}
                  lastFed="Il y a 3 jours"
                  image={reptile.image_url}
                />
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default Index;
