import { useEffect, useState } from "react";
import { Users, Calendar, Scale, TrendingUp } from "lucide-react";
import { useTranslation } from "react-i18next";
import Navigation from "@/components/Navigation";
import StatsCard from "@/components/StatsCard";
import ReptileCard from "@/components/ReptileCard";
import AddReptileDialog from "@/components/AddReptileDialog";
import jungleHero from "@/assets/jungle-hero.jpg";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { AuthForm } from "@/components/AuthForm";

const Index = () => {
  const { t } = useTranslation();
  const { user, loading: authLoading } = useAuth();
  const [reptiles, setReptiles] = useState<any[]>([]);
  const [stats, setStats] = useState({
    total: 0,
    avgWeight: 0,
  });

  useEffect(() => {
    if (user) {
      fetchReptiles();
    }
  }, [user]);

  const fetchReptiles = async () => {
    try {
      const { data, error } = await supabase
        .from("reptiles")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(6);

      if (error) throw error;
      
      const reptileData = data || [];
      setReptiles(reptileData);
      
      // Calculate stats
      const { count } = await supabase
        .from("reptiles")
        .select("*", { count: "exact", head: true });
      
      const total = count || 0;
      const avgWeight = reptileData.length > 0
        ? reptileData.reduce((sum: number, r: any) => sum + (r.weight || 0), 0) / reptileData.length
        : 0;
      
      setStats({ total, avgWeight });
    } catch (error) {
      console.error("Error fetching reptiles:", error);
    }
  };

  const calculateAge = (birthDate: string) => {
    const birth = new Date(birthDate);
    const today = new Date();
    const years = today.getFullYear() - birth.getFullYear();
    const months = today.getMonth() - birth.getMonth();
    
    if (years > 0) {
      return `${years} an${years > 1 ? 's' : ''}`;
    }
    return `${months} mois`;
  };

  if (authLoading) {
    return <div className="min-h-screen flex items-center justify-center">Chargement...</div>;
  }

  if (!user) {
    return <AuthForm />;
  }

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
            value={stats.total.toString()}
            icon={Users}
          />
          <StatsCard
            title={t("stats.feedingsDue")}
            value="0"
            icon={Calendar}
          />
          <StatsCard
            title={t("stats.avgWeight")}
            value={`${Math.round(stats.avgWeight)}g`}
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
            <AddReptileDialog onReptileAdded={fetchReptiles} />
          </div>
          
          {reptiles.length === 0 ? (
            <div className="text-center py-12 border border-dashed border-border rounded-lg">
              <p className="text-muted-foreground mb-4">Aucun reptile pour le moment</p>
              <AddReptileDialog onReptileAdded={fetchReptiles} />
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {reptiles.map((reptile) => (
                <ReptileCard
                  key={reptile.id}
                  id={reptile.id}
                  name={reptile.name}
                  species={reptile.species}
                  age={reptile.birth_date ? calculateAge(reptile.birth_date) : "Inconnu"}
                  weight={`${reptile.weight || 0}g`}
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
