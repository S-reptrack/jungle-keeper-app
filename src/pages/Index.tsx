import { Users, Calendar, Scale, TrendingUp } from "lucide-react";
import Navigation from "@/components/Navigation";
import StatsCard from "@/components/StatsCard";
import ReptileCard from "@/components/ReptileCard";
import jungleHero from "@/assets/jungle-hero.jpg";

const Index = () => {
  const mockReptiles = [
    {
      name: "Kaa",
      species: "Python royal",
      age: "3 ans",
      weight: "1.5 kg",
      lastFed: "Il y a 5 jours",
    },
    {
      name: "Rex",
      species: "Iguane vert",
      age: "2 ans",
      weight: "2.3 kg",
      lastFed: "Aujourd'hui",
    },
    {
      name: "Shelby",
      species: "Tortue d'Hermann",
      age: "5 ans",
      weight: "1.2 kg",
      lastFed: "Hier",
    },
  ];

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
            S-reptrack
          </h1>
          <p className="text-lg text-muted-foreground">
            Suivez vos reptiles avec précision
          </p>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-8 pb-24 md:pb-8">
        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
          <StatsCard
            title="Total reptiles"
            value="12"
            icon={Users}
            trend="+2 ce mois"
          />
          <StatsCard
            title="Repas cette semaine"
            value="24"
            icon={Calendar}
          />
          <StatsCard
            title="Poids moyen"
            value="1.8kg"
            icon={Scale}
          />
          <StatsCard
            title="Croissance"
            value="+12%"
            icon={TrendingUp}
            trend="Ce trimestre"
          />
        </div>

        {/* Recent Reptiles */}
        <div>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-foreground">Reptiles récents</h2>
            <button className="text-sm text-primary hover:text-primary/80 font-medium transition-colors">
              Voir tout →
            </button>
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
