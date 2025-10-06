import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import Navigation from "@/components/Navigation";
import ReptileCard from "@/components/ReptileCard";
import AddReptileDialog from "@/components/AddReptileDialog";
import { toast } from "sonner";

const Reptiles = () => {
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
        .order("created_at", { ascending: false });

      if (error) throw error;
      setReptiles(data || []);
    } catch (error: any) {
      toast.error("Erreur lors du chargement des reptiles");
      console.error(error);
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
    <div className="min-h-screen bg-background pb-24 md:pb-8 md:pt-16">
      <Navigation />
      
      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-foreground">
            {t("reptile.recentReptiles")} ({reptiles.length})
          </h2>
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
      </main>
    </div>
  );
};

export default Reptiles;
