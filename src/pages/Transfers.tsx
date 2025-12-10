import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import Navigation from "@/components/Navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { CheckCircle, XCircle, Send, Inbox, Ban } from "lucide-react";
import { format } from "date-fns";
import { maskEmail } from "@/lib/emailUtils";

interface Transfer {
  id: string;
  reptile_id: string;
  from_user_id: string;
  to_user_email: string;
  to_user_id: string | null;
  status: string;
  message: string | null;
  created_at: string;
  reptiles: {
    name: string;
    species: string;
  };
  from_user_email?: string;
}

export default function Transfers() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [sentTransfers, setSentTransfers] = useState<Transfer[]>([]);
  const [receivedTransfers, setReceivedTransfers] = useState<Transfer[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchTransfers();
    }
  }, [user]);

  const fetchTransfers = async () => {
    try {
      // Fetch sent transfers
      const { data: sent, error: sentError } = await supabase
        .from("animal_transfers")
        .select(`
          *,
          reptiles (name, species)
        `)
        .eq("from_user_id", user!.id)
        .order("created_at", { ascending: false });

      if (sentError) throw sentError;

      // Fetch received transfers
      const { data: userProfile } = await supabase
        .from("profiles")
        .select("email")
        .eq("user_id", user!.id)
        .single();

      const { data: received, error: receivedError } = await supabase
        .from("animal_transfers")
        .select(`
          *,
          reptiles (name, species)
        `)
        .or(`to_user_id.eq.${user!.id},to_user_email.eq.${userProfile?.email}`)
        .order("created_at", { ascending: false });

      if (receivedError) throw receivedError;

      // Fetch sender emails separately and enrich data
      const enrichedReceived: Transfer[] = [];
      if (received) {
        const senderIds = [...new Set(received.map(t => t.from_user_id))];
        const { data: profiles } = await supabase
          .from("profiles")
          .select("user_id, email")
          .in("user_id", senderIds);

        const emailMap = new Map(profiles?.map(p => [p.user_id, p.email]) || []);
        
        received.forEach(t => {
          enrichedReceived.push({
            ...t,
            from_user_email: emailMap.get(t.from_user_id)
          });
        });
      }

      setSentTransfers(sent || []);
      setReceivedTransfers(enrichedReceived);
    } catch (error: any) {
      console.error("Error fetching transfers:", error);
      toast.error(t("transfer.fetchError"));
    } finally {
      setLoading(false);
    }
  };

  const handleAccept = async (transferId: string) => {
    try {
      const { error } = await supabase
        .from("animal_transfers")
        .update({ 
          status: "accepted",
          to_user_id: user!.id
        })
        .eq("id", transferId);

      if (error) throw error;

      toast.success(t("transfer.accepted"));
      fetchTransfers();
    } catch (error: any) {
      console.error("Error accepting transfer:", error);
      toast.error(t("transfer.acceptError"));
    }
  };

  const handleReject = async (transferId: string) => {
    try {
      const { error } = await supabase
        .from("animal_transfers")
        .update({ status: "rejected" })
        .eq("id", transferId);

      if (error) throw error;

      toast.success(t("transfer.rejected"));
      fetchTransfers();
    } catch (error: any) {
      console.error("Error rejecting transfer:", error);
      toast.error(t("transfer.rejectError"));
    }
  };

  const handleCancel = async (transferId: string) => {
    try {
      const { error } = await supabase
        .from("animal_transfers")
        .update({ status: "cancelled" })
        .eq("id", transferId);

      if (error) throw error;

      toast.success(t("transfer.cancelled"));
      fetchTransfers();
    } catch (error: any) {
      console.error("Error cancelling transfer:", error);
      toast.error(t("transfer.cancelError"));
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      pending: { variant: "secondary" as const, label: t("transfer.statusPending") },
      accepted: { variant: "default" as const, label: t("transfer.statusAccepted") },
      rejected: { variant: "destructive" as const, label: t("transfer.statusRejected") },
      cancelled: { variant: "outline" as const, label: t("transfer.statusCancelled") },
    };

    const config = statusConfig[status as keyof typeof statusConfig];
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <main className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">{t("transfer.pageTitle")}</h1>

        <Tabs defaultValue="received" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="received">
              <Inbox className="h-4 w-4 mr-2" />
              {t("transfer.received")}
            </TabsTrigger>
            <TabsTrigger value="sent">
              <Send className="h-4 w-4 mr-2" />
              {t("transfer.sent")}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="received" className="space-y-4">
            {loading ? (
              <p className="text-center text-muted-foreground">{t("common.loading")}</p>
            ) : receivedTransfers.length === 0 ? (
              <p className="text-center text-muted-foreground">{t("transfer.noReceived")}</p>
            ) : (
              receivedTransfers.map((transfer) => (
                <Card key={transfer.id}>
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle>{transfer.reptiles.name}</CardTitle>
                        <CardDescription>
                          {transfer.reptiles.species} • {t("transfer.from")}: {maskEmail(transfer.from_user_email) || t("transfer.unknownSender")}
                        </CardDescription>
                      </div>
                      {getStatusBadge(transfer.status)}
                    </div>
                  </CardHeader>
                  <CardContent>
                    {transfer.message && (
                      <p className="text-sm text-muted-foreground mb-4">{transfer.message}</p>
                    )}
                    <p className="text-xs text-muted-foreground mb-4">
                      {format(new Date(transfer.created_at), "PPp")}
                    </p>
                    {transfer.status === "pending" && (
                      <div className="flex gap-2">
                        <Button onClick={() => handleAccept(transfer.id)} size="sm">
                          <CheckCircle className="h-4 w-4 mr-2" />
                          {t("transfer.accept")}
                        </Button>
                        <Button onClick={() => handleReject(transfer.id)} variant="destructive" size="sm">
                          <XCircle className="h-4 w-4 mr-2" />
                          {t("transfer.reject")}
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))
            )}
          </TabsContent>

          <TabsContent value="sent" className="space-y-4">
            {loading ? (
              <p className="text-center text-muted-foreground">{t("common.loading")}</p>
            ) : sentTransfers.length === 0 ? (
              <p className="text-center text-muted-foreground">{t("transfer.noSent")}</p>
            ) : (
              sentTransfers.map((transfer) => (
                <Card key={transfer.id}>
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle>{transfer.reptiles.name}</CardTitle>
                        <CardDescription>
                          {transfer.reptiles.species} • {t("transfer.to")}: {maskEmail(transfer.to_user_email)}
                        </CardDescription>
                      </div>
                      {getStatusBadge(transfer.status)}
                    </div>
                  </CardHeader>
                  <CardContent>
                    {transfer.message && (
                      <p className="text-sm text-muted-foreground mb-4">{transfer.message}</p>
                    )}
                    <p className="text-xs text-muted-foreground mb-4">
                      {format(new Date(transfer.created_at), "PPp")}
                    </p>
                    {transfer.status === "pending" && (
                      <Button onClick={() => handleCancel(transfer.id)} variant="outline" size="sm">
                        <Ban className="h-4 w-4 mr-2" />
                        {t("transfer.cancel")}
                      </Button>
                    )}
                  </CardContent>
                </Card>
              ))
            )}
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
