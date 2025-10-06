import { Users, Calendar, Scale, TrendingUp } from "lucide-react";
import { useTranslation } from "react-i18next";
import Navigation from "@/components/Navigation";
import StatsCard from "@/components/StatsCard";
import ReptileCard from "@/components/ReptileCard";
import AddReptileDialog from "@/components/AddReptileDialog";
import jungleHero from "@/assets/jungle-hero.jpg";

const Index = () => {
  const { t } = useTranslation();
  
  const mockReptiles: any[] = [];

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
            value="0"
            icon={Users}
          />
          <StatsCard
            title={t("stats.feedingsDue")}
            value="0"
            icon={Calendar}
          />
          <StatsCard
            title={t("stats.avgWeight")}
            value="0kg"
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
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {mockReptiles.map((reptile, index) => (
              <ReptileCard key={index} {...reptile} />
            ))}
          </div>
        </div>
      </main>
    </div>
  );
};

export default Index;
