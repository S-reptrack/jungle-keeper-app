import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { CheckCircle2, Circle, X, Sparkles } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

/** Guide de démarrage en 3 étapes pour les nouveaux utilisateurs. */
const OnboardingChecklist = ({ refreshKey = 0 }: { refreshKey?: number }) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const storageKey = user ? `onboarding-dismissed-${user.id}` : "";
  const [dismissed, setDismissed] = useState(() => !!storageKey && localStorage.getItem(storageKey) === "1");
  const [done, setDone] = useState<{ reptile: boolean; feeding: boolean; weight: boolean } | null>(null);
  const [firstReptileId, setFirstReptileId] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;
    setDismissed(localStorage.getItem(`onboarding-dismissed-${user.id}`) === "1");
    (async () => {
      const [r, f, w] = await Promise.all([
        supabase.from("reptiles").select("id").eq("user_id", user.id).order("created_at").limit(1),
        supabase.from("feedings").select("id", { count: "exact", head: true }).eq("user_id", user.id),
        supabase.from("weight_records").select("id", { count: "exact", head: true }).eq("user_id", user.id),
      ]);
      setFirstReptileId(r.data?.[0]?.id ?? null);
      setDone({ reptile: (r.data?.length ?? 0) > 0, feeding: (f.count ?? 0) > 0, weight: (w.count ?? 0) > 0 });
    })();
  }, [user, refreshKey]);

  if (!user || dismissed || !done) return null;
  const steps = [
    { key: "reptile", label: "Ajouter votre premier reptile", hint: "Bouton « Ajouter un reptile » ci-dessous.", ok: done.reptile, go: null },
    { key: "feeding", label: "Enregistrer un premier repas", hint: "Dans la fiche de votre reptile, onglet Alimentation.", ok: done.feeding, go: "feeding" },
    { key: "weight", label: "Noter une première pesée", hint: "Dans la fiche de votre reptile, section Poids.", ok: done.weight, go: "overview" },
  ];
  const count = steps.filter((s) => s.ok).length;
  if (count === steps.length) return null;

  const hide = () => {
    localStorage.setItem(storageKey, "1");
    setDismissed(true);
  };

  return (
    <Card className="mb-6 border-primary/30 bg-primary/5">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            <CardTitle className="text-lg">Bien démarrer avec S-reptrack</CardTitle>
          </div>
          <Button variant="ghost" size="icon" onClick={hide} aria-label="Masquer le guide" className="h-11 w-11 -mt-2 -mr-2">
            <X className="h-4 w-4" />
          </Button>
        </div>
        <CardDescription>{count}/3 étapes terminées</CardDescription>
        <Progress value={(count / 3) * 100} className="h-2" />
      </CardHeader>
      <CardContent className="space-y-3">
        {steps.map((s) => (
          <div key={s.key} className="flex items-start gap-3">
            {s.ok ? <CheckCircle2 className="h-5 w-5 text-primary shrink-0 mt-0.5" /> : <Circle className="h-5 w-5 text-muted-foreground shrink-0 mt-0.5" />}
            <div className="flex-1">
              <p className={s.ok ? "line-through text-muted-foreground" : "font-medium"}>{s.label}</p>
              {!s.ok && <p className="text-sm text-muted-foreground">{s.hint}</p>}
            </div>
            {!s.ok && s.go && firstReptileId && (
              <Button size="sm" variant="outline" onClick={() => navigate(`/reptile/${firstReptileId}?tab=${s.go}`)}>
                Y aller
              </Button>
            )}
          </div>
        ))}
      </CardContent>
    </Card>
  );
};

export default OnboardingChecklist;
