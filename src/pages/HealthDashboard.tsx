import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import Navigation from "@/components/Navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, HeartPulse, AlertTriangle, CheckCircle2, TrendingDown, Clock, Bug, Utensils, ShieldAlert, RefreshCw } from "lucide-react";
import { useHealthDashboard, HealthAlert, ReptileHealthSummary } from "@/hooks/useHealthDashboard";
import { useAuth } from "@/hooks/useAuth";
import { Skeleton } from "@/components/ui/skeleton";

const HealthDashboard = () => {
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  const { user } = useAuth();
  const { alerts, summaries, stats, loading, refresh } = useHealthDashboard();

  const formatLocalDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString(i18n.language, { day: "numeric", month: "short" });
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <main className="max-w-4xl mx-auto px-4 py-6 md:mt-16 text-center pt-32">
          <p className="text-muted-foreground">{t("healthDashboard.loginRequired")}</p>
          <Button onClick={() => navigate("/auth")} className="mt-4">{t("healthDashboard.login")}</Button>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <main className="max-w-4xl mx-auto px-4 py-6 md:mt-16" style={{ paddingBottom: 'calc(6rem + env(safe-area-inset-bottom))' }}>
        {/* Header */}
        <div className="mb-6">
          <Button variant="ghost" size="sm" onClick={() => navigate(-1)} className="mb-3 -ml-2">
            <ArrowLeft className="w-4 h-4 mr-2" />
            {t("common.back")}
          </Button>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-gradient-to-br from-emerald-500/20 to-teal-500/20 border border-emerald-500/30">
                <HeartPulse className="w-6 h-6 text-emerald-400" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-foreground">{t("healthDashboard.title")}</h1>
                <p className="text-sm text-muted-foreground">{t("healthDashboard.subtitle")}</p>
              </div>
            </div>
            <Button variant="ghost" size="icon" onClick={refresh} className="flex-shrink-0">
              <RefreshCw className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {loading ? (
          <div className="space-y-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {[1,2,3,4].map(i => <Skeleton key={i} className="h-24 rounded-xl" />)}
            </div>
            <Skeleton className="h-48 rounded-xl" />
          </div>
        ) : (
          <>
            {/* Stats Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
              <StatsCard icon={<CheckCircle2 className="w-5 h-5" />} label={t("healthDashboard.healthy")} value={stats.healthy} color="text-emerald-500" bgColor="bg-emerald-500/10" />
              <StatsCard icon={<AlertTriangle className="w-5 h-5" />} label={t("healthDashboard.warnings")} value={stats.warnings} color="text-amber-500" bgColor="bg-amber-500/10" />
              <StatsCard icon={<ShieldAlert className="w-5 h-5" />} label={t("healthDashboard.critical")} value={stats.critical} color="text-destructive" bgColor="bg-destructive/10" />
              <StatsCard icon={<HeartPulse className="w-5 h-5" />} label={t("healthDashboard.totalAnimals")} value={stats.total} color="text-primary" bgColor="bg-primary/10" />
            </div>

            {/* Alerts Section */}
            {alerts.length > 0 && (
              <Card className="mb-6 border-destructive/20">
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2 text-base">
                    <AlertTriangle className="w-5 h-5 text-amber-500" />
                    {alerts.length > 1 
                      ? t("healthDashboard.activeAlertsPlural", { count: alerts.length })
                      : t("healthDashboard.activeAlerts", { count: alerts.length })}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {alerts.slice(0, 10).map((alert) => (
                    <AlertRow key={alert.id} alert={alert} onNavigate={() => navigate(`/reptile/${alert.reptileId}`)} />
                  ))}
                  {alerts.length > 10 && (
                    <p className="text-xs text-muted-foreground text-center pt-2">
                      {t("healthDashboard.moreAlerts", { count: alerts.length - 10 })}
                    </p>
                  )}
                </CardContent>
              </Card>
            )}

            {alerts.length === 0 && (
              <Card className="mb-6 border-emerald-500/20 bg-emerald-500/5">
                <CardContent className="py-8 text-center">
                  <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto mb-3" />
                  <p className="font-medium text-foreground">{t("healthDashboard.allHealthy")}</p>
                  <p className="text-sm text-muted-foreground mt-1">{t("healthDashboard.noAlerts")}</p>
                </CardContent>
              </Card>
            )}

            {/* Reptile Health Summaries */}
            <h2 className="text-lg font-semibold text-foreground mb-3">{t("healthDashboard.detailByAnimal")}</h2>
            <div className="space-y-3">
              {summaries.map((summary) => (
                <ReptileSummaryCard 
                  key={summary.id} 
                  summary={summary} 
                  onNavigate={() => navigate(`/reptile/${summary.id}`)} 
                />
              ))}
            </div>

            {summaries.length === 0 && (
              <Card className="border-dashed border-2">
                <CardContent className="py-12 text-center">
                  <HeartPulse className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
                  <p className="text-muted-foreground">{t("healthDashboard.addReptilesToSee")}</p>
                </CardContent>
              </Card>
            )}
          </>
        )}
      </main>
    </div>
  );
};

// === Sub-components ===

const StatsCard = ({ icon, label, value, color, bgColor }: { icon: React.ReactNode; label: string; value: number; color: string; bgColor: string }) => (
  <Card className="border-border/50">
    <CardContent className="p-4 flex items-center gap-3">
      <div className={`p-2 rounded-lg ${bgColor} ${color}`}>
        {icon}
      </div>
      <div>
        <p className="text-2xl font-bold text-foreground">{value}</p>
        <p className="text-[11px] text-muted-foreground leading-tight">{label}</p>
      </div>
    </CardContent>
  </Card>
);

const getAlertIcon = (type: HealthAlert["type"]) => {
  switch (type) {
    case "weight_loss": return <TrendingDown className="w-4 h-4" />;
    case "overdue_shedding": return <Clock className="w-4 h-4" />;
    case "feeding_refused": return <Utensils className="w-4 h-4" />;
    case "overdue_feeding": return <Utensils className="w-4 h-4" />;
    case "health_issue": return <Bug className="w-4 h-4" />;
  }
};

const AlertRow = ({ alert, onNavigate }: { alert: HealthAlert; onNavigate: () => void }) => {
  const { t } = useTranslation();
  return (
  <button
    onClick={onNavigate}
    className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-muted/50 transition-colors text-left"
  >
    {alert.reptileImage ? (
      <img src={alert.reptileImage} alt={alert.reptileName} className="w-9 h-9 rounded-lg object-cover flex-shrink-0" />
    ) : (
      <div className="w-9 h-9 rounded-lg bg-muted flex items-center justify-center flex-shrink-0">
        <HeartPulse className="w-4 h-4 text-muted-foreground" />
      </div>
    )}
    <div className="flex-1 min-w-0">
      <div className="flex items-center gap-2">
        <span className="text-sm font-medium truncate">{alert.reptileName}</span>
        <Badge 
          variant={alert.severity === "danger" ? "destructive" : "secondary"}
          className="text-[9px] flex-shrink-0 gap-1"
        >
          {getAlertIcon(alert.type)}
          {alert.severity === "danger" ? t("healthDashboard.criticalLabel") : t("healthDashboard.attention")}
        </Badge>
      </div>
      <p className="text-xs text-muted-foreground truncate">{alert.message}</p>
    </div>
  </button>
  );
};

const ReptileSummaryCard = ({ summary, onNavigate }: { summary: ReptileHealthSummary; onNavigate: () => void }) => {
  const { t, i18n } = useTranslation();
  const statusConfig = {
    good: { color: "text-emerald-500", bg: "bg-emerald-500/10", border: "border-emerald-500/20", label: t("healthDashboard.ok") },
    warning: { color: "text-amber-500", bg: "bg-amber-500/10", border: "border-amber-500/20", label: t("healthDashboard.attention") },
    danger: { color: "text-destructive", bg: "bg-destructive/10", border: "border-destructive/20", label: t("healthDashboard.criticalLabel") },
  };
  const config = statusConfig[summary.status];

  return (
    <Card className={`${config.border} cursor-pointer hover:shadow-md transition-shadow`} onClick={onNavigate}>
      <CardContent className="p-4">
        <div className="flex items-center gap-3 mb-3">
          {summary.image_url ? (
            <img src={summary.image_url} alt={summary.name} className="w-12 h-12 rounded-xl object-cover flex-shrink-0" />
          ) : (
            <div className="w-12 h-12 rounded-xl bg-muted flex items-center justify-center flex-shrink-0">
              <HeartPulse className="w-5 h-5 text-muted-foreground" />
            </div>
          )}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <p className="font-semibold text-foreground truncate">{summary.name}</p>
              <Badge className={`text-[9px] ${config.bg} ${config.color} border-0`}>
                {config.label}
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground">{summary.species}</p>
          </div>
        </div>

        {/* Quick stats row */}
        <div className="grid grid-cols-3 gap-2 text-center">
          <div className="p-2 rounded-lg bg-muted/50">
            <p className="text-[10px] text-muted-foreground">{t("healthDashboard.lastMeal")}</p>
            <p className="text-xs font-medium text-foreground">
              {summary.lastFeeding ? new Date(summary.lastFeeding).toLocaleDateString(i18n.language, { day: "numeric", month: "short" }) : "—"}
            </p>
          </div>
          <div className="p-2 rounded-lg bg-muted/50">
            <p className="text-[10px] text-muted-foreground">{t("healthDashboard.lastShedding")}</p>
            <p className="text-xs font-medium text-foreground">
              {summary.lastShedding ? new Date(summary.lastShedding).toLocaleDateString(i18n.language, { day: "numeric", month: "short" }) : "—"}
            </p>
          </div>
          <div className="p-2 rounded-lg bg-muted/50">
            <p className="text-[10px] text-muted-foreground">{t("healthDashboard.weight")}</p>
            <p className="text-xs font-medium text-foreground">
              {summary.lastWeight ? `${summary.lastWeight.weight}g` : "—"}
              {summary.lastWeight && summary.previousWeight && (
                <span className={`ml-1 ${summary.lastWeight.weight < summary.previousWeight.weight ? "text-destructive" : "text-emerald-500"}`}>
                  {summary.lastWeight.weight >= summary.previousWeight.weight ? "↑" : "↓"}
                </span>
              )}
            </p>
          </div>
        </div>

        {/* Alert list for this reptile */}
        {summary.alerts.length > 0 && (
          <div className="mt-3 pt-3 border-t border-border/50 space-y-1">
            {summary.alerts.map(alert => (
              <div key={alert.id} className="flex items-center gap-2 text-xs">
                <span className={alert.severity === "danger" ? "text-destructive" : "text-amber-500"}>
                  {getAlertIcon(alert.type)}
                </span>
                <span className="text-muted-foreground truncate">{alert.message}</span>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default HealthDashboard;
