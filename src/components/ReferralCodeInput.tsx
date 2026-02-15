import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Gift, CheckCircle2, XCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface ReferralCodeInputProps {
  value: string;
  onChange: (value: string) => void;
  onValidated: (isValid: boolean) => void;
}

const ReferralCodeInput = ({ value, onChange, onValidated }: ReferralCodeInputProps) => {
  const [status, setStatus] = useState<"idle" | "checking" | "valid" | "invalid">("idle");
  const [errorReason, setErrorReason] = useState<string>("");

  const validateCode = async (code: string) => {
    if (!code || code.length < 6) {
      setStatus("idle");
      onValidated(false);
      return;
    }

    setStatus("checking");
    try {
      const { data, error } = await supabase.rpc("validate_referral_code", { p_code: code });
      
      if (error) {
        setStatus("invalid");
        setErrorReason("Erreur de vérification");
        onValidated(false);
        return;
      }

      const parsed = typeof data === "string" ? JSON.parse(data) : data;
      
      if (parsed.valid) {
        setStatus("valid");
        onValidated(true);
      } else {
        setStatus("invalid");
        switch (parsed.reason) {
          case "code_not_found":
            setErrorReason("Code introuvable");
            break;
          case "code_inactive":
            setErrorReason("Code désactivé");
            break;
          case "max_referrals_reached":
            setErrorReason("Limite de parrainages atteinte");
            break;
          default:
            setErrorReason("Code invalide");
        }
        onValidated(false);
      }
    } catch {
      setStatus("invalid");
      setErrorReason("Erreur de vérification");
      onValidated(false);
    }
  };

  const handleChange = (val: string) => {
    const upperVal = val.toUpperCase();
    onChange(upperVal);
    if (upperVal.length >= 6) {
      validateCode(upperVal);
    } else {
      setStatus("idle");
      onValidated(false);
    }
  };

  return (
    <div className="space-y-2">
      <Label htmlFor="referral-code" className="flex items-center gap-2">
        <Gift className="w-4 h-4" />
        Code de parrainage (optionnel)
      </Label>
      <Input
        id="referral-code"
        placeholder="Ex: AB12CD34"
        value={value}
        onChange={(e) => handleChange(e.target.value)}
        maxLength={8}
        className="font-mono tracking-wider uppercase"
      />
      {status === "checking" && (
        <p className="text-xs text-muted-foreground">Vérification...</p>
      )}
      {status === "valid" && (
        <div className="flex items-center gap-1">
          <CheckCircle2 className="w-4 h-4 text-green-500" />
          <span className="text-xs text-green-600 dark:text-green-400">Code valide !</span>
        </div>
      )}
      {status === "invalid" && (
        <div className="flex items-center gap-1">
          <XCircle className="w-4 h-4 text-red-500" />
          <span className="text-xs text-red-600 dark:text-red-400">{errorReason}</span>
        </div>
      )}
    </div>
  );
};

export default ReferralCodeInput;
