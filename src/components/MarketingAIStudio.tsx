import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Sparkles, Copy, Instagram, Facebook, Twitter, Linkedin, Music2, Image as ImageIcon, Loader2 } from "lucide-react";

type Network = "instagram" | "facebook" | "tiktok" | "twitter" | "linkedin";

interface Post {
  title: string;
  content: string;
  hashtags: string[];
  visualIdea: string;
}

const NETWORKS: { value: Network; label: string; icon: any }[] = [
  { value: "instagram", label: "Instagram", icon: Instagram },
  { value: "facebook", label: "Facebook", icon: Facebook },
  { value: "tiktok", label: "TikTok", icon: Music2 },
  { value: "twitter", label: "X / Twitter", icon: Twitter },
  { value: "linkedin", label: "LinkedIn", icon: Linkedin },
];

const MarketingAIStudio = () => {
  const [network, setNetwork] = useState<Network>("instagram");
  const [theme, setTheme] = useState("");
  const [count, setCount] = useState(3);
  const [loading, setLoading] = useState(false);
  const [posts, setPosts] = useState<Post[]>([]);

  const handleGenerate = async () => {
    setLoading(true);
    setPosts([]);
    try {
      const { data, error } = await supabase.functions.invoke("generate-marketing-posts", {
        body: { network, theme: theme.trim() || undefined, count },
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      const list: Post[] = data?.posts ?? [];
      if (list.length === 0) {
        toast.error("Aucun contenu généré, réessayez.");
      } else {
        setPosts(list);
        toast.success(`${list.length} publication(s) générée(s) !`);
      }
    } catch (e: any) {
      toast.error(e?.message ?? "Erreur de génération");
    } finally {
      setLoading(false);
    }
  };

  const copyPost = (p: Post) => {
    const text = `${p.content}\n\n${p.hashtags.join(" ")}`;
    navigator.clipboard.writeText(text);
    toast.success("Copié dans le presse-papier !");
  };

  const CurrentIcon = NETWORKS.find((n) => n.value === network)?.icon ?? Sparkles;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            Studio Marketing IA
          </CardTitle>
          <CardDescription>
            Générez des publications prêtes à copier-coller sur vos réseaux sociaux pour promouvoir S-reptrack.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-3">
            <div className="space-y-2">
              <Label>Réseau social</Label>
              <Select value={network} onValueChange={(v) => setNetwork(v as Network)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {NETWORKS.map((n) => (
                    <SelectItem key={n.value} value={n.value}>
                      <div className="flex items-center gap-2">
                        <n.icon className="h-4 w-4" /> {n.label}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Nombre de posts</Label>
              <Select value={String(count)} onValueChange={(v) => setCount(Number(v))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {[1, 3, 5].map((n) => <SelectItem key={n} value={String(n)}>{n}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Thème (optionnel)</Label>
              <Input
                placeholder="ex: mue du gecko, morphs, NFC…"
                value={theme}
                onChange={(e) => setTheme(e.target.value)}
              />
            </div>
          </div>

          <Button onClick={handleGenerate} disabled={loading} className="w-full md:w-auto">
            {loading ? (
              <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Génération en cours…</>
            ) : (
              <><Sparkles className="h-4 w-4 mr-2" /> Générer les publications</>
            )}
          </Button>
        </CardContent>
      </Card>

      {posts.length > 0 && (
        <div className="grid gap-4 md:grid-cols-2">
          {posts.map((p, i) => (
            <Card key={i}>
              <CardHeader>
                <div className="flex items-center justify-between gap-2">
                  <CardTitle className="text-base flex items-center gap-2">
                    <CurrentIcon className="h-4 w-4 text-primary" />
                    {p.title || `Post ${i + 1}`}
                  </CardTitle>
                  <Button size="sm" variant="ghost" onClick={() => copyPost(p)}>
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="whitespace-pre-wrap text-sm">{p.content}</p>
                {p.hashtags?.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {p.hashtags.map((h, k) => (
                      <Badge key={k} variant="secondary" className="text-xs">{h}</Badge>
                    ))}
                  </div>
                )}
                {p.visualIdea && (
                  <div className="flex items-start gap-2 text-xs text-muted-foreground border-t pt-3">
                    <ImageIcon className="h-3.5 w-3.5 mt-0.5 flex-shrink-0" />
                    <span><strong>Idée visuelle :</strong> {p.visualIdea}</span>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default MarketingAIStudio;
