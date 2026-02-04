import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { FlaskConical, Plus, Trash2, Search, Crown, Loader2 } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface BetaTester {
  user_id: string;
  email: string;
  created_at: string;
}

export const BetaTesterManagement = () => {
  const { t } = useTranslation();
  const [betaTesters, setBetaTesters] = useState<BetaTester[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchEmail, setSearchEmail] = useState("");
  const [addingEmail, setAddingEmail] = useState("");
  const [isAdding, setIsAdding] = useState(false);

  const fetchBetaTesters = async () => {
    try {
      // Get all users with beta_tester role
      const { data: roles, error: rolesError } = await supabase
        .from("user_roles")
        .select("user_id, created_at")
        .eq("role", "beta_tester");

      if (rolesError) throw rolesError;

      if (!roles || roles.length === 0) {
        setBetaTesters([]);
        return;
      }

      // Get emails from profiles
      const userIds = roles.map(r => r.user_id);
      const { data: profiles, error: profilesError } = await supabase
        .from("profiles")
        .select("user_id, email")
        .in("user_id", userIds);

      if (profilesError) throw profilesError;

      const testers: BetaTester[] = roles.map(role => {
        const profile = profiles?.find(p => p.user_id === role.user_id);
        return {
          user_id: role.user_id,
          email: profile?.email || "Email inconnu",
          created_at: role.created_at,
        };
      });

      setBetaTesters(testers);
    } catch (error) {
      console.error("[BetaTesterManagement] Error fetching:", error);
      toast.error("Erreur lors du chargement des beta testers");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBetaTesters();
  }, []);

  const handleAddBetaTester = async () => {
    if (!addingEmail.trim()) return;

    setIsAdding(true);
    try {
      // Find user by email in profiles
      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("user_id")
        .eq("email", addingEmail.trim().toLowerCase())
        .maybeSingle();

      if (profileError) throw profileError;

      if (!profile) {
        toast.error("Aucun utilisateur trouvé avec cet email");
        return;
      }

      // Check if already a beta tester
      const existing = betaTesters.find(t => t.user_id === profile.user_id);
      if (existing) {
        toast.error("Cet utilisateur est déjà beta tester");
        return;
      }

      // Add beta_tester role
      const { error: insertError } = await supabase
        .from("user_roles")
        .insert({
          user_id: profile.user_id,
          role: "beta_tester" as any,
        });

      if (insertError) throw insertError;

      toast.success("Beta tester ajouté avec succès !");
      setAddingEmail("");
      fetchBetaTesters();
    } catch (error: any) {
      console.error("[BetaTesterManagement] Error adding:", error);
      toast.error(error.message || "Erreur lors de l'ajout");
    } finally {
      setIsAdding(false);
    }
  };

  const handleRemoveBetaTester = async (userId: string, email: string) => {
    try {
      const { error } = await supabase
        .from("user_roles")
        .delete()
        .eq("user_id", userId)
        .eq("role", "beta_tester");

      if (error) throw error;

      toast.success(`${email} retiré des beta testers`);
      fetchBetaTesters();
    } catch (error: any) {
      console.error("[BetaTesterManagement] Error removing:", error);
      toast.error(error.message || "Erreur lors de la suppression");
    }
  };

  const filteredTesters = betaTesters.filter(t =>
    t.email.toLowerCase().includes(searchEmail.toLowerCase())
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FlaskConical className="w-5 h-5 text-amber-500" />
          Gestion des Beta Testers
        </CardTitle>
        <CardDescription>
          Les beta testers (abonnés payants) peuvent accéder aux nouvelles fonctionnalités avant leur déploiement général.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Add new beta tester */}
        <div className="flex gap-2">
          <Input
            placeholder="Email de l'abonné à ajouter..."
            value={addingEmail}
            onChange={(e) => setAddingEmail(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleAddBetaTester()}
          />
          <Button 
            onClick={handleAddBetaTester} 
            disabled={isAdding || !addingEmail.trim()}
          >
            {isAdding ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Plus className="w-4 h-4 mr-2" />
            )}
            Ajouter
          </Button>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Rechercher un beta tester..."
            value={searchEmail}
            onChange={(e) => setSearchEmail(e.target.value)}
            className="pl-9"
          />
        </div>

        {/* List */}
        {loading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
          </div>
        ) : filteredTesters.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <FlaskConical className="w-12 h-12 mx-auto mb-2 opacity-20" />
            <p>Aucun beta tester pour le moment</p>
            <p className="text-sm">Ajoutez des abonnés payants pour leur donner accès aux nouvelles fonctionnalités</p>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Email</TableHead>
                <TableHead>Ajouté le</TableHead>
                <TableHead className="w-[100px]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredTesters.map((tester) => (
                <TableRow key={tester.user_id}>
                  <TableCell className="font-medium">
                    <div className="flex items-center gap-2">
                      {tester.email}
                      <Badge variant="outline" className="text-xs bg-amber-500/10 text-amber-600 border-amber-500/30">
                        <Crown className="w-3 h-3 mr-1" />
                        Premium + Beta
                      </Badge>
                    </div>
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {new Date(tester.created_at).toLocaleDateString("fr-FR")}
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleRemoveBetaTester(tester.user_id, tester.email)}
                      className="text-destructive hover:text-destructive"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}

        <div className="text-xs text-muted-foreground bg-muted/50 p-3 rounded-lg">
          <strong>Comment utiliser :</strong> Encapsulez vos nouvelles fonctionnalités avec le composant{" "}
          <code className="bg-muted px-1 rounded">&lt;BetaFeature&gt;</code> pour qu'elles ne soient visibles que par les beta testers.
        </div>
      </CardContent>
    </Card>
  );
};
