import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[VALIDATE-APPLE-RECEIPT] ${step}${detailsStr}`);
};

// Apple verifyReceipt endpoints
const APPLE_PRODUCTION_URL = "https://buy.itunes.apple.com/verifyReceipt";
const APPLE_SANDBOX_URL = "https://sandbox.itunes.apple.com/verifyReceipt";

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

    // Authenticate user
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("No authorization header provided");

    const token = authHeader.replace("Bearer ", "");
    const { data: userData, error: userError } = await supabaseClient.auth.getUser(token);
    if (userError) throw new Error(`Authentication error: ${userError.message}`);
    const user = userData.user;
    if (!user?.email) throw new Error("User not authenticated");
    logStep("User authenticated", { userId: user.id, email: user.email });

    const { receiptData, transactionId } = await req.json();
    if (!receiptData) {
      throw new Error("Receipt data required");
    }
    logStep("Receipt received", { hasReceipt: !!receiptData, transactionId });

    const sharedSecret = Deno.env.get("APPLE_SHARED_SECRET");
    if (!sharedSecret) {
      throw new Error("APPLE_SHARED_SECRET not configured");
    }

    // Validate with Apple Production first
    const requestBody = {
      "receipt-data": receiptData,
      password: sharedSecret,
      "exclude-old-transactions": true,
    };

    logStep("Validating with Apple Production");
    let appleResponse = await fetch(APPLE_PRODUCTION_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(requestBody),
    });

    let appleData = await appleResponse.json();
    logStep("Production response", { status: appleData.status });

    // Status 21007 means sandbox receipt sent to production - retry with sandbox
    if (appleData.status === 21007) {
      logStep("Sandbox receipt detected, retrying with sandbox endpoint");
      appleResponse = await fetch(APPLE_SANDBOX_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(requestBody),
      });
      appleData = await appleResponse.json();
      logStep("Sandbox response", { status: appleData.status });
    }

    // Status 0 = valid receipt
    if (appleData.status !== 0) {
      logStep("Invalid receipt", { status: appleData.status });
      return new Response(JSON.stringify({
        valid: false,
        subscribed: false,
        error: `Apple validation failed with status ${appleData.status}`,
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    }

    // Check for active subscription in latest_receipt_info
    const latestReceiptInfo = appleData.latest_receipt_info || [];
    const now = Date.now();

    const activeSubscription = latestReceiptInfo.find((receipt: any) => {
      const expiresDateMs = parseInt(receipt.expires_date_ms, 10);
      return expiresDateMs > now;
    });

    const isSubscribed = !!activeSubscription;
    logStep("Subscription check", {
      isSubscribed,
      activeProductId: activeSubscription?.product_id,
      expiresDate: activeSubscription?.expires_date,
    });

    return new Response(JSON.stringify({
      valid: true,
      subscribed: isSubscribed,
      productId: activeSubscription?.product_id || null,
      expiresDate: activeSubscription?.expires_date || null,
      environment: appleData.environment || "unknown",
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR", { message: errorMessage });
    return new Response(JSON.stringify({ error: errorMessage, valid: false }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
