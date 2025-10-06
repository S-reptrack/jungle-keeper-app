import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { supabase } from "@/integrations/supabase/client";
import Navigation from "@/components/Navigation";
import ReptileCard from "@/components/ReptileCard";
import AddReptileDialog from "@/components/AddReptileDialog";
import { useAuth } from "@/hooks/useAuth";
import { AuthForm } from "@/components/AuthForm";

const Reptiles = () => {
  const { t } = useTranslation();
  const { user, loading: authLoading } = useAuth();
  const [reptiles, setReptiles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

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
        .order("created_at", { ascending: false });

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
      
      <main className="max-w-7xl mx-auto px-4 py-8 pb-24 md:pb-8 md:pt-24">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold text-foreground">{t("common.reptiles")}</h1>
          <AddReptileDialog onReptileAdded={fetchReptiles} />
        </div>
        
        {loading ? (
          <div className="text-center py-12">Chargement...</div>
        ) : reptiles.length === 0 ? (
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
      </main>
    </div>
  );
};

export default Reptiles;
