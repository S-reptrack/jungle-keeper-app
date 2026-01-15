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

interface Invitation {
  id: string;
  email: string;
  created_at: string;
  status: string;
  accepted_at: string | null;
}

const TesterManagement = () => {
  const { t } = useTranslation();
  const [testers, setTesters] = useState<Tester[]>([]);
  const [pendingInvitations, setPendingInvitations] = useState<Invitation[]>([]);
  const [acceptedInvitations, setAcceptedInvitations] = useState<Invitation[]>([]);
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);
  const [inviting, setInviting] = useState(false);
  const [email, setEmail] = useState("");
  const [inviteEmail, setInviteEmail] = useState("");

  const fetchTesters = async () => {
    try {
      // Récupérer les testeurs
      const { data: roles, error } = await supabase
        .from("user_roles")
        .select("id, user_id, created_at")
        .eq("role", "tester");

      if (error) throw error;

      if (!roles || roles.length === 0) {
        setTesters([]);
        setLoading(false);
        return;
      }

      // Récupérer tous les profils en une seule requête
      const userIds = roles.map(r => r.user_id);
      const { data: profiles, error: profilesError } = await supabase
        .from("profiles")
        .select("user_id, email")
        .in("user_id", userIds);

      if (profilesError) {
        console.error("Error fetching profiles:", profilesError);
      }

      // Créer un map pour accès rapide
      const profileMap = new Map<string, string>();
      (profiles || []).forEach(p => {
        if (p.email) profileMap.set(p.user_id, p.email);
      });

      const testersWithEmail: Tester[] = roles.map((role) => ({
        id: role.id,
        user_id: role.user_id,
        email: profileMap.get(role.user_id) || "Email inconnu",
        created_at: role.created_at,
      }));

      setTesters(testersWithEmail);
    } catch (error) {
      console.error("Error fetching testers:", error);
      toast.error(t("admin.testers.errorFetching"));
    } finally {
      setLoading(false);
    }
  };

  const fetchInvitations = async () => {
    try {
      // Fetch pending invitations
      const { data: pending, error: pendingError } = await supabase
        .from("tester_invitations")
        .select("id, email, created_at, status, accepted_at")
        .eq("status", "pending")
        .order("created_at", { ascending: false });

      if (pendingError) throw pendingError;
      setPendingInvitations(pending || []);

      // Fetch accepted invitations
      const { data: accepted, error: acceptedError } = await supabase
        .from("tester_invitations")
        .select("id, email, created_at, status, accepted_at")
        .eq("status", "accepted")
        .order("accepted_at", { ascending: false });

      if (acceptedError) throw acceptedError;
      setAcceptedInvitations(accepted || []);
    } catch (error) {
      console.error("Error fetching invitations:", error);
    }
  };

  useEffect(() => {
    fetchTesters();
    fetchInvitations();
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

    const emailLower = inviteEmail.trim().toLowerCase();

    // Vérifier si l'utilisateur existe déjà
    const { data: existingProfile } = await supabase
      .from("profiles")
      .select("user_id")
      .eq("email", emailLower)
      .maybeSingle();

    if (existingProfile) {
      toast.error("Cet utilisateur a déjà un compte. Ajoutez-le directement comme testeur.");
      return;
    }

    // Vérifier si une invitation existe déjà
    const existingInvitation = pendingInvitations.find(inv => inv.email === emailLower);
    if (existingInvitation) {
      toast.error("Une invitation est déjà en attente pour cet email.");
      return;
    }

    setInviting(true);
    try {
      // Récupérer l'ID de l'admin
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Non authentifié");

      // Créer l'invitation dans la base de données avec date limite au 15 février 2025
      const { error: insertError } = await supabase
        .from("tester_invitations")
        .insert({
          email: emailLower,
          invited_by: user.id,
          status: "pending",
          trial_end_date: "2025-02-15",
        });

      if (insertError) throw insertError;

      // Envoyer l'email d'invitation
      const appUrl = window.location.origin;
      const response = await supabase.functions.invoke("invite-tester", {
        body: {
          email: emailLower,
          appUrl,
        },
      });

      if (response.error) {
        // Supprimer l'invitation si l'email échoue
        await supabase.from("tester_invitations").delete().eq("email", emailLower);
        throw new Error(response.error.message);
      }

      toast.success(`Invitation envoyée à ${inviteEmail}`);
      setInviteEmail("");
      fetchInvitations();
    } catch (error: any) {
      console.error("Error inviting tester:", error);
      toast.error(`Erreur lors de l'envoi: ${error.message}`);
    } finally {
      setInviting(false);
    }
  };

  const cancelInvitation = async (invitationId: string, invitationEmail: string) => {
    try {
      const { error } = await supabase
        .from("tester_invitations")
        .delete()
        .eq("id", invitationId);

      if (error) throw error;

      toast.success(`Invitation annulée pour ${invitationEmail}`);
      fetchInvitations();
    } catch (error) {
      console.error("Error canceling invitation:", error);
      toast.error("Erreur lors de l'annulation");
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
              Envoyez une invitation par email. Le testeur recevra un lien pour créer son compte et sera <strong>automatiquement</strong> ajouté comme testeur.
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

            {/* Invitations en attente */}
            {pendingInvitations.length > 0 && (
              <div className="mt-4 pt-3 border-t">
                <h5 className="text-sm font-medium mb-2 flex items-center gap-2">
                  <Mail className="h-4 w-4" />
                  Invitations en attente ({pendingInvitations.length})
                </h5>
                <div className="space-y-2">
                  {pendingInvitations.map((inv) => (
                    <div
                      key={inv.id}
                      className="flex items-center justify-between p-2 bg-yellow-500/10 rounded-lg text-sm"
                    >
                      <div className="flex items-center gap-2">
                        <span>{inv.email}</span>
                        <Badge variant="outline" className="text-xs bg-yellow-500/20">
                          En attente
                        </Badge>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => cancelInvitation(inv.id, inv.email)}
                        className="text-destructive hover:text-destructive hover:bg-destructive/10 h-7 px-2"
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            )}
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

        {/* Invitations acceptées */}
        {acceptedInvitations.length > 0 && (
          <div className="pt-4 border-t">
            <h4 className="text-sm font-medium mb-3 flex items-center gap-2">
              <Mail className="h-4 w-4 text-green-500" />
              Invitations acceptées ({acceptedInvitations.length})
            </h4>
            <div className="space-y-2">
              {acceptedInvitations.map((inv) => (
                <div
                  key={inv.id}
                  className="flex items-center justify-between p-2 bg-green-500/10 rounded-lg text-sm"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2">
                    <span className="font-medium">{inv.email}</span>
                    <Badge variant="outline" className="text-xs bg-green-500/20 text-green-600 w-fit">
                      Acceptée
                    </Badge>
                    {inv.accepted_at && (
                      <span className="text-xs text-muted-foreground">
                        le {new Date(inv.accepted_at).toLocaleDateString("fr-FR")}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Liste des testeurs */}
        <div className="pt-4 border-t">
          <h4 className="text-sm font-medium mb-3 flex items-center gap-2">
            <Users className="h-4 w-4 text-primary" />
            Testeurs actuels ({testers.length})
          </h4>
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
                  <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2">
                    <span className="text-sm font-medium">{tester.email}</span>
                    <Badge variant="secondary" className="text-xs w-fit">
                      {t("admin.testers.tester")}
                    </Badge>
                    <span className="text-xs text-muted-foreground">
                      depuis le {new Date(tester.created_at).toLocaleDateString("fr-FR")}
                    </span>
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
