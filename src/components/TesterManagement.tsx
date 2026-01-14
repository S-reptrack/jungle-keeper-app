import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { UserPlus, Trash2, Users, Loader2, Mail, Send } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface Tester {
  id: string;
  user_id: string;
  email: string;
  created_at: string;
}

const TesterManagement = () => {
  const { t } = useTranslation();
  const [testers, setTesters] = useState<Tester[]>([]);
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);
  const [inviting, setInviting] = useState(false);
  const [email, setEmail] = useState("");
  const [inviteEmail, setInviteEmail] = useState("");

  const fetchTesters = async () => {
    try {
      const { data: roles, error } = await supabase
        .from("user_roles")
        .select("id, user_id, created_at")
        .eq("role", "tester");

      if (error) throw error;

      const testersWithEmail: Tester[] = [];
      for (const role of roles || []) {
        const { data: profile } = await supabase
          .from("profiles")
          .select("email")
          .eq("user_id", role.user_id)
          .maybeSingle();

        testersWithEmail.push({
          id: role.id,
          user_id: role.user_id,
          email: profile?.email || "Email inconnu",
          created_at: role.created_at,
        });
      }

      setTesters(testersWithEmail);
    } catch (error) {
      console.error("Error fetching testers:", error);
      toast.error(t("admin.testers.errorFetching"));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTesters();
  }, []);

  const addTester = async () => {
    if (!email.trim()) {
      toast.error(t("admin.testers.enterEmail"));
      return;
    }

    setAdding(true);
    try {
      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("user_id")
        .eq("email", email.trim().toLowerCase())
        .maybeSingle();

      if (profileError) throw profileError;

      if (!profile) {
        toast.error(t("admin.testers.userNotFound"));
        setAdding(false);
        return;
      }

      const existingTester = testers.find(t => t.user_id === profile.user_id);
      if (existingTester) {
        toast.error(t("admin.testers.alreadyTester"));
        setAdding(false);
        return;
      }

      const { error } = await supabase
        .from("user_roles")
        .insert({
          user_id: profile.user_id,
          role: "tester" as const,
        });

      if (error) throw error;

      toast.success(t("admin.testers.addSuccess"));
      setEmail("");
      fetchTesters();
    } catch (error) {
      console.error("Error adding tester:", error);
      toast.error(t("admin.testers.errorAdding"));
    } finally {
      setAdding(false);
    }
  };

  const inviteTester = async () => {
    if (!inviteEmail.trim()) {
      toast.error("Veuillez entrer une adresse email");
      return;
    }

    // Vérifier si l'utilisateur existe déjà
    const { data: existingProfile } = await supabase
      .from("profiles")
      .select("user_id")
      .eq("email", inviteEmail.trim().toLowerCase())
      .maybeSingle();

    if (existingProfile) {
      toast.error("Cet utilisateur a déjà un compte. Ajoutez-le directement comme testeur.");
      return;
    }

    setInviting(true);
    try {
      const appUrl = window.location.origin;
      
      const response = await supabase.functions.invoke("invite-tester", {
        body: {
          email: inviteEmail.trim().toLowerCase(),
          appUrl,
        },
      });

      if (response.error) {
        throw new Error(response.error.message);
      }

      toast.success(`Invitation envoyée à ${inviteEmail}`);
      setInviteEmail("");
    } catch (error: any) {
      console.error("Error inviting tester:", error);
      toast.error(`Erreur lors de l'envoi: ${error.message}`);
    } finally {
      setInviting(false);
    }
  };

  const removeTester = async (testerId: string, testerEmail: string) => {
    try {
      const { error } = await supabase
        .from("user_roles")
        .delete()
        .eq("id", testerId);

      if (error) throw error;

      toast.success(t("admin.testers.removeSuccess", { email: testerEmail }));
      fetchTesters();
    } catch (error) {
      console.error("Error removing tester:", error);
      toast.error(t("admin.testers.errorRemoving"));
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <Users className="h-5 w-5 text-primary" />
          <CardTitle>{t("admin.testers.title")}</CardTitle>
        </div>
        <CardDescription>{t("admin.testers.description")}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Tabs defaultValue="invite" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="invite" className="flex items-center gap-2">
              <Mail className="h-4 w-4" />
              Inviter
            </TabsTrigger>
            <TabsTrigger value="add" className="flex items-center gap-2">
              <UserPlus className="h-4 w-4" />
              Ajouter
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="invite" className="space-y-3 mt-4">
            <p className="text-sm text-muted-foreground">
              Envoyez une invitation par email. Le testeur recevra un lien pour créer son compte.
            </p>
            <div className="flex gap-2">
              <Input
                type="email"
                placeholder="Email du futur testeur"
                value={inviteEmail}
                onChange={(e) => setInviteEmail(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && inviteTester()}
                className="flex-1"
              />
              <Button onClick={inviteTester} disabled={inviting} variant="default">
                {inviting ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Send className="h-4 w-4" />
                )}
                <span className="ml-2 hidden sm:inline">Envoyer</span>
              </Button>
            </div>
          </TabsContent>
          
          <TabsContent value="add" className="space-y-3 mt-4">
            <p className="text-sm text-muted-foreground">
              Ajoutez un utilisateur existant comme testeur (doit déjà avoir un compte).
            </p>
            <div className="flex gap-2">
              <Input
                type="email"
                placeholder={t("admin.testers.emailPlaceholder")}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && addTester()}
                className="flex-1"
              />
              <Button onClick={addTester} disabled={adding}>
                {adding ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <UserPlus className="h-4 w-4" />
                )}
                <span className="ml-2 hidden sm:inline">{t("admin.testers.add")}</span>
              </Button>
            </div>
          </TabsContent>
        </Tabs>

        {/* Liste des testeurs */}
        <div className="pt-4 border-t">
          <h4 className="text-sm font-medium mb-3">Testeurs actuels</h4>
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : testers.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">
              {t("admin.testers.noTesters")}
            </p>
          ) : (
            <div className="space-y-2">
              {testers.map((tester) => (
                <div
                  key={tester.id}
                  className="flex items-center justify-between p-3 bg-muted/50 rounded-lg"
                >
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">{tester.email}</span>
                    <Badge variant="secondary" className="text-xs">
                      {t("admin.testers.tester")}
                    </Badge>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeTester(tester.id, tester.email)}
                    className="text-destructive hover:text-destructive hover:bg-destructive/10"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>

        <p className="text-xs text-muted-foreground">
          {t("admin.testers.note")}
        </p>
      </CardContent>
    </Card>
  );
};

export default TesterManagement;
