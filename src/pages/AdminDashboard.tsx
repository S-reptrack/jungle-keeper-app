import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import Navigation from "@/components/Navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { Users, Database, Activity, TrendingUp, MessageSquare, FlaskConical } from "lucide-react";
import { toast } from "sonner";
import TesterManagement from "@/components/TesterManagement";
import TesterActivityDashboard from "@/components/TesterActivityDashboard";
import { BetaTesterManagement } from "@/components/BetaTesterManagement";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface AdminStats {
  totalUsers: number;
  totalReptiles: number;
  totalFeedings: number;
  activeUsers: number;
}

const AdminDashboard = () => {
  const { t } = useTranslation();
  const [stats, setStats] = useState<AdminStats>({
    totalUsers: 0,
    totalReptiles: 0,
    totalFeedings: 0,
    activeUsers: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        // Compter les utilisateurs
        const { count: usersCount } = await supabase
          .from("profiles")
          .select("*", { count: "exact", head: true });

        // Compter les reptiles
        const { count: reptilesCount } = await supabase
          .from("reptiles")
          .select("*", { count: "exact", head: true });

        // Compter les alimentations
        const { count: feedingsCount } = await supabase
          .from("feedings")
          .select("*", { count: "exact", head: true });

        // Compter les utilisateurs actifs (avec au moins un reptile)
        const { data: activeUsersData } = await supabase
          .from("reptiles")
          .select("user_id");
        
        const uniqueActiveUsers = new Set(activeUsersData?.map(r => r.user_id) || []).size;

        setStats({
          totalUsers: usersCount || 0,
          totalReptiles: reptilesCount || 0,
          totalFeedings: feedingsCount || 0,
          activeUsers: uniqueActiveUsers,
        });
      } catch (error) {
        console.error("Error fetching stats:", error);
        toast.error(t("admin.errorFetchingStats"));
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [t]);

  return (
    <div className="min-h-screen bg-background pb-24 md:pb-8">
      <Navigation />
      
      <main className="max-w-7xl mx-auto px-4 py-8 md:pt-24">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">
            {t("admin.dashboard")}
          </h1>
          <p className="text-muted-foreground">
            {t("admin.dashboardDescription")}
          </p>
        </div>

        {loading ? (
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-muted-foreground">{t("common.loading")}</p>
            </div>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  {t("admin.totalUsers")}
                </CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.totalUsers}</div>
                <p className="text-xs text-muted-foreground">
                  {t("admin.registeredUsers")}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  {t("admin.activeUsers")}
                </CardTitle>
                <Activity className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.activeUsers}</div>
                <p className="text-xs text-muted-foreground">
                  {t("admin.usersWithReptiles")}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  {t("admin.totalReptiles")}
                </CardTitle>
                <Database className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.totalReptiles}</div>
                <p className="text-xs text-muted-foreground">
                  {t("admin.reptilesInDatabase")}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  {t("admin.totalFeedings")}
                </CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.totalFeedings}</div>
                <p className="text-xs text-muted-foreground">
                  {t("admin.feedingsRecorded")}
                </p>
              </CardContent>
            </Card>
          </div>
        )}

        <div className="mt-8">
          <Tabs defaultValue="testers" className="w-full">
            <TabsList className="grid w-full grid-cols-3 mb-6">
              <TabsTrigger value="testers" className="flex items-center gap-2">
                <Users className="h-4 w-4" />
                Testeurs
              </TabsTrigger>
              <TabsTrigger value="beta" className="flex items-center gap-2">
                <FlaskConical className="h-4 w-4" />
                Beta Testers
              </TabsTrigger>
              <TabsTrigger value="activity" className="flex items-center gap-2">
                <MessageSquare className="h-4 w-4" />
                Feedbacks
              </TabsTrigger>
            </TabsList>

            <TabsContent value="testers">
              <div className="grid gap-6 lg:grid-cols-2">
                <TesterManagement />
                
                <Card>
                  <CardHeader>
                    <CardTitle>{t("admin.managementTools")}</CardTitle>
                    <CardDescription>{t("admin.managementToolsDescription")}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">
                      {t("admin.comingSoon")}
                    </p>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="beta">
              <BetaTesterManagement />
            </TabsContent>

            <TabsContent value="activity">
              <TesterActivityDashboard />
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  );
};

export default AdminDashboard;
