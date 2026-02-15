
-- Table des codes de parrainage
CREATE TABLE public.referral_codes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  code text NOT NULL UNIQUE,
  created_at timestamptz NOT NULL DEFAULT now(),
  is_active boolean NOT NULL DEFAULT true,
  CONSTRAINT referral_code_length CHECK (char_length(code) >= 6)
);

ALTER TABLE public.referral_codes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own referral code"
  ON public.referral_codes FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own referral code"
  ON public.referral_codes FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can view all referral codes"
  ON public.referral_codes FOR SELECT
  USING (is_admin(auth.uid()));

-- Table des conversions de parrainage
CREATE TABLE public.referral_conversions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  referral_code_id uuid NOT NULL REFERENCES public.referral_codes(id),
  referred_user_id uuid NOT NULL,
  referrer_user_id uuid NOT NULL,
  subscription_type text NOT NULL, -- 'monthly' or 'yearly'
  reward_applied boolean NOT NULL DEFAULT false,
  reward_applied_at timestamptz,
  stripe_coupon_id text,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.referral_conversions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own referral conversions as referrer"
  ON public.referral_conversions FOR SELECT
  USING (auth.uid() = referrer_user_id);

CREATE POLICY "Admins can view all referral conversions"
  ON public.referral_conversions FOR SELECT
  USING (is_admin(auth.uid()));

CREATE POLICY "Admins can update referral conversions"
  ON public.referral_conversions FOR UPDATE
  USING (is_admin(auth.uid()));

-- Fonction pour générer un code parrainage unique
CREATE OR REPLACE FUNCTION public.generate_referral_code()
RETURNS text
LANGUAGE plpgsql
SET search_path = public
AS $$
DECLARE
  new_code text;
  code_exists boolean;
BEGIN
  LOOP
    -- Générer un code de 8 caractères alphanumérique majuscule
    new_code := upper(substr(md5(random()::text || clock_timestamp()::text), 1, 8));
    SELECT EXISTS(SELECT 1 FROM referral_codes WHERE code = new_code) INTO code_exists;
    EXIT WHEN NOT code_exists;
  END LOOP;
  RETURN new_code;
END;
$$;

-- Fonction pour vérifier le nombre de parrainages récompensés
CREATE OR REPLACE FUNCTION public.get_referral_reward_count(p_user_id uuid)
RETURNS integer
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COUNT(*)::integer
  FROM referral_conversions
  WHERE referrer_user_id = p_user_id AND reward_applied = true;
$$;

-- Fonction pour valider un code parrainage (accessible publiquement pour l'inscription)
CREATE OR REPLACE FUNCTION public.validate_referral_code(p_code text)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  result json;
  ref_record record;
BEGIN
  SELECT rc.id, rc.user_id, rc.is_active,
    (SELECT COUNT(*) FROM referral_conversions WHERE referrer_user_id = rc.user_id AND reward_applied = true) as reward_count
  INTO ref_record
  FROM referral_codes rc
  WHERE rc.code = upper(p_code);

  IF NOT FOUND THEN
    RETURN json_build_object('valid', false, 'reason', 'code_not_found');
  END IF;

  IF NOT ref_record.is_active THEN
    RETURN json_build_object('valid', false, 'reason', 'code_inactive');
  END IF;

  IF ref_record.reward_count >= 12 THEN
    RETURN json_build_object('valid', false, 'reason', 'max_referrals_reached');
  END IF;

  RETURN json_build_object('valid', true, 'referral_code_id', ref_record.id, 'referrer_user_id', ref_record.user_id);
END;
$$;

-- Table pour stocker temporairement le code parrainage utilisé lors de l'inscription
-- (dans les metadata du profil, on utilisera une colonne dans profiles)
ALTER TABLE public.profiles ADD COLUMN referral_code_used text;
