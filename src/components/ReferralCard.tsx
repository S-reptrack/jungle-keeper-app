import { useState, useEffect, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Gift, Copy, Check, Users } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";

const MAX_REFERRALS = 12;

const ReferralCard = () => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [referralCode, setReferralCode] = useState<string | null>(null);
  const [rewardCount, setRewardCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  const fetchReferralData = useCallback(async () => {
    if (!user) return;
    
    try {
      // Get existing referral code
      const { data: codeData } = await supabase
        .from("referral_codes")
        .select("code")
        .eq("user_id", user.id)
        .eq("is_active", true)
        .maybeSingle();

      if (codeData) {
        setReferralCode(codeData.code);
      }

      // Get reward count
      const { data: countData } = await supabase
        .rpc("get_referral_reward_count", { p_user_id: user.id });
      
      if (countData !== null) {
        setRewardCount(countData);
      }
    } catch (error) {
      console.error("Error fetching referral data:", error);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchReferralData();
  }, [fetchReferralData]);

  const generateCode = async () => {
    if (!user) return;

    try {
      // Generate unique code via DB function
      const { data: codeValue, error: genError } = await supabase
        .rpc("generate_referral_code");

      if (genError) throw genError;

      // Insert the code
      const { error: insertError } = await supabase
        .from("referral_codes")
        .insert({
          user_id: user.id,
          code: codeValue,
        });

      if (insertError) throw insertError;

      setReferralCode(codeValue);
      toast.success("Code de parrainage créé !");
    } catch (error) {
      console.error("Error generating referral code:", error);
      toast.error("Erreur lors de la création du code");
    }
  };

  const copyCode = async () => {
    if (!referralCode) return;
    try {
      await navigator.clipboard.writeText(referralCode);
      setCopied(true);
      toast.success("Code copié !");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Impossible de copier le code");
    }
  };

  if (loading) return null;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Gift className="w-5 h-5 text-primary" />
          Parrainage
        </CardTitle>
        <CardDescription>
          Parrainez des amis et gagnez 1 mois gratuit par filleul abonné (max {MAX_REFERRALS})
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {referralCode ? (
          <>
            <div className="flex items-center gap-2">
              <Input
                value={referralCode}
                readOnly
                className="font-mono text-lg tracking-wider text-center font-bold"
              />
              <Button variant="outline" size="icon" onClick={copyCode}>
                {copied ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
              </Button>
            </div>
            
            <div className="flex items-center justify-between p-3 rounded-lg bg-muted">
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm">Parrainages récompensés</span>
              </div>
              <Badge variant={rewardCount >= MAX_REFERRALS ? "destructive" : "secondary"}>
                {rewardCount} / {MAX_REFERRALS}
              </Badge>
            </div>

            {rewardCount > 0 && (
              <p className="text-xs text-muted-foreground">
                🎉 Vous avez économisé {(rewardCount * 4.99).toFixed(2)}€ grâce au parrainage !
              </p>
            )}
          </>
        ) : (
          <Button onClick={generateCode} className="w-full">
            <Gift className="w-4 h-4 mr-2" />
            Générer mon code de parrainage
          </Button>
        )}
      </CardContent>
    </Card>
  );
};

export default ReferralCard;
