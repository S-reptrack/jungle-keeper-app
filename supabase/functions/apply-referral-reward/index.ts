import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[APPLY-REFERRAL-REWARD] ${step}${detailsStr}`);
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const supabaseClient = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
    { auth: { persistSession: false } }
  );

  try {
    logStep("Function started");

    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    if (!stripeKey) throw new Error("STRIPE_SECRET_KEY is not set");

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("No authorization header provided");

    const token = authHeader.replace("Bearer ", "");
    const { data: userData, error: userError } = await supabaseClient.auth.getUser(token);
    if (userError) throw new Error(`Authentication error: ${userError.message}`);
    const user = userData.user;
    if (!user?.email) throw new Error("User not authenticated");
    logStep("User authenticated", { userId: user.id, email: user.email });

    const { referral_code } = await req.json();
    if (!referral_code) throw new Error("Referral code is required");
    logStep("Referral code received", { referral_code });

    // Validate referral code
    const { data: validation, error: valError } = await supabaseClient
      .rpc("validate_referral_code", { p_code: referral_code });

    if (valError) throw new Error(`Validation error: ${valError.message}`);
    const parsed = typeof validation === 'string' ? JSON.parse(validation) : validation;
    
    if (!parsed.valid) {
      logStep("Invalid referral code", { reason: parsed.reason });
      return new Response(JSON.stringify({ success: false, reason: parsed.reason }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 400,
      });
    }

    const referrerUserId = parsed.referrer_user_id;
    const referralCodeId = parsed.referral_code_id;
    logStep("Referral code valid", { referrerUserId, referralCodeId });

    // Check if the referred user (current user) has an active paid subscription
    const stripe = new Stripe(stripeKey, { apiVersion: "2025-08-27.basil" });
    
    const customers = await stripe.customers.list({ email: user.email, limit: 1 });
    if (customers.data.length === 0) {
      return new Response(JSON.stringify({ success: false, reason: "no_subscription" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 400,
      });
    }

    const referredCustomerId = customers.data[0].id;
    const subscriptions = await stripe.subscriptions.list({
      customer: referredCustomerId,
      status: "active",
      limit: 1,
    });

    if (subscriptions.data.length === 0) {
      return new Response(JSON.stringify({ success: false, reason: "no_active_subscription" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 400,
      });
    }

    const referredSubscription = subscriptions.data[0];
    const subscriptionType = referredSubscription.items.data[0]?.price?.recurring?.interval === "year" ? "yearly" : "monthly";
    logStep("Referred user has active subscription", { subscriptionType });

    // Check if this referral was already recorded
    const { data: existingConversion } = await supabaseClient
      .from("referral_conversions")
      .select("id")
      .eq("referred_user_id", user.id)
      .maybeSingle();

    if (existingConversion) {
      logStep("Referral already recorded for this user");
      return new Response(JSON.stringify({ success: false, reason: "already_referred" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 400,
      });
    }

    // Get referrer's email to find their Stripe customer
    const { data: referrerProfile } = await supabaseClient
      .from("profiles")
      .select("email")
      .eq("user_id", referrerUserId)
      .maybeSingle();

    if (!referrerProfile?.email) {
      throw new Error("Referrer profile not found");
    }

    // Find referrer's Stripe customer
    const referrerCustomers = await stripe.customers.list({ email: referrerProfile.email, limit: 1 });
    
    let stripeCouponId: string | null = null;

    if (referrerCustomers.data.length > 0) {
      const referrerCustomerId = referrerCustomers.data[0].id;
      
      // Check if referrer has an active subscription
      const referrerSubs = await stripe.subscriptions.list({
        customer: referrerCustomerId,
        status: "active",
        limit: 1,
      });

      if (referrerSubs.data.length > 0) {
        // Create a 100% off coupon for 1 month
        const coupon = await stripe.coupons.create({
          percent_off: 100,
          duration: "once",
          name: `Parrainage - ${user.email}`,
          metadata: {
            referral_code: referral_code,
            referred_user: user.email,
          },
        });
        stripeCouponId = coupon.id;
        logStep("Created Stripe coupon", { couponId: coupon.id });

        // Apply coupon to referrer's subscription
        await stripe.subscriptions.update(referrerSubs.data[0].id, {
          coupon: coupon.id,
        });
        logStep("Applied coupon to referrer subscription");
      } else {
        logStep("Referrer has no active subscription - storing conversion for later");
      }
    } else {
      logStep("Referrer has no Stripe customer - storing conversion for later");
    }

    // Record the conversion using service role
    const { error: insertError } = await supabaseClient
      .from("referral_conversions")
      .insert({
        referral_code_id: referralCodeId,
        referred_user_id: user.id,
        referrer_user_id: referrerUserId,
        subscription_type: subscriptionType,
        reward_applied: !!stripeCouponId,
        reward_applied_at: stripeCouponId ? new Date().toISOString() : null,
        stripe_coupon_id: stripeCouponId,
      });

    if (insertError) {
      logStep("Error inserting conversion", { error: insertError.message });
      throw new Error(`Failed to record conversion: ${insertError.message}`);
    }

    // Update profile with referral code used
    await supabaseClient
      .from("profiles")
      .update({ referral_code_used: referral_code })
      .eq("user_id", user.id);

    logStep("Referral conversion recorded successfully");

    return new Response(JSON.stringify({ 
      success: true, 
      reward_applied: !!stripeCouponId,
      message: stripeCouponId 
        ? "Coupon applied to referrer" 
        : "Conversion recorded, reward pending referrer subscription"
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR", { message: errorMessage });
    return new Response(JSON.stringify({ error: errorMessage }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
