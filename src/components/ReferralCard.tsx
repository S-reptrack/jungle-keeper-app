import { useState, useEffect, useCallback, useRef } from "react";
import { useTranslation } from "react-i18next";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Gift, Copy, Check, Users, Eye, EyeOff } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import { Progress } from "@/components/ui/progress";

const MAX_REFERRALS = 12;
const CODE_DISPLAY_DURATION = 20; // seconds visible
const CODE_VALID_DURATION = 60; // seconds valid

const ReferralCard = () => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [referralCode, setReferralCode] = useState<string | null>(null);
  const [rewardCount, setRewardCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [codeVisible, setCodeVisible] = useState(false);
  const [displayCountdown, setDisplayCountdown] = useState(0);
  const [validCountdown, setValidCountdown] = useState(0);
  const displayTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const validTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const fetchReferralData = useCallback(async () => {
    if (!user) return;
    
    try {
      const { data: codeData } = await supabase
        .from("referral_codes")
        .select("code")
        .eq("user_id", user.id)
        .eq("is_active", true)
        .maybeSingle();

      if (codeData) {
        setReferralCode(codeData.code);
      }

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

  // Cleanup timers
  useEffect(() => {
    return () => {
      if (displayTimerRef.current) clearInterval(displayTimerRef.current);
      if (validTimerRef.current) clearInterval(validTimerRef.current);
    };
  }, []);

  const generateCode = async () => {
    if (!user) return;

    try {
      const { data: codeValue, error: genError } = await supabase
        .rpc("generate_referral_code");

      if (genError) throw genError;

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

  const revealCode = () => {
    setCodeVisible(true);
    setDisplayCountdown(CODE_DISPLAY_DURATION);
    setValidCountdown(CODE_VALID_DURATION);

    // Display timer (20s)
    if (displayTimerRef.current) clearInterval(displayTimerRef.current);
    displayTimerRef.current = setInterval(() => {
      setDisplayCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(displayTimerRef.current!);
          setCodeVisible(false);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    // Validity timer (60s)
    if (validTimerRef.current) clearInterval(validTimerRef.current);
    validTimerRef.current = setInterval(() => {
      setValidCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(validTimerRef.current!);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const copyCode = async () => {
    if (!referralCode) return;
    try {
      await navigator.clipboard.writeText(referralCode);
      setCopied(true);
      toast.success("Code copié ! Valide pendant " + validCountdown + " secondes");
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
            {codeVisible ? (
              <div className="space-y-3">
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
                
                <div className="space-y-1">
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>Masquage dans {displayCountdown}s</span>
                    <span>Validité : {validCountdown}s</span>
                  </div>
                  <Progress value={(displayCountdown / CODE_DISPLAY_DURATION) * 100} className="h-1.5" />
                </div>
              </div>
            ) : (
              <Button onClick={revealCode} variant="outline" className="w-full">
                <Eye className="w-4 h-4 mr-2" />
                Afficher mon code de parrainage
              </Button>
            )}
            
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
                🎉 Vous avez économisé {(rewardCount * 5.99).toFixed(2)}€ grâce au parrainage !
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
