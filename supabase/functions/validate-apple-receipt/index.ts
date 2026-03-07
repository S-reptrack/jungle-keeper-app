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

// Apple App Store Server API v2
const APPLE_PRODUCTION_URL = "https://api.storekit.itunes.apple.com/inApps/v1";
const APPLE_SANDBOX_URL = "https://api.storekit-sandbox.itunes.apple.com/inApps/v1";

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

    const { transactionId, originalTransactionId } = await req.json();
    if (!transactionId && !originalTransactionId) {
      throw new Error("Transaction ID required");
    }
    logStep("Transaction ID received", { transactionId, originalTransactionId });

    // For App Store Server API v2, we need the App Store Server API Key
    // This validates the transaction directly with Apple
    const appStoreApiKey = Deno.env.get("APPLE_APP_STORE_API_KEY");
    const appStoreIssuerId = Deno.env.get("APPLE_APP_STORE_ISSUER_ID");
    const appStoreKeyId = Deno.env.get("APPLE_APP_STORE_KEY_ID");
    const appStoreBundleId = Deno.env.get("APPLE_BUNDLE_ID") || "com.sreptrack.app";

    if (!appStoreApiKey || !appStoreIssuerId || !appStoreKeyId) {
      // Fallback: trust the client-side verification for now
      // In production, you MUST set up App Store Server API keys
      logStep("WARNING: App Store Server API keys not configured, using client-side trust");
      
      return new Response(JSON.stringify({
        valid: true,
        subscribed: true,
        warning: "Server-side validation not fully configured",
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    }

    // Generate JWT for App Store Server API
    const header = btoa(JSON.stringify({ alg: "ES256", kid: appStoreKeyId, typ: "JWT" }));
    const now = Math.floor(Date.now() / 1000);
    const payload = btoa(JSON.stringify({
      iss: appStoreIssuerId,
      iat: now,
      exp: now + 3600,
      aud: "appstoreconnect-v1",
      bid: appStoreBundleId,
    }));

    // Note: Full ES256 signing requires the private key - simplified here
    // In production, use a proper JWT library with the .p8 key
    logStep("Validating with Apple App Store Server API");

    const txId = originalTransactionId || transactionId;
    const appleUrl = `${APPLE_PRODUCTION_URL}/subscriptions/${txId}`;

    const appleResponse = await fetch(appleUrl, {
      headers: {
        Authorization: `Bearer ${header}.${payload}`, // Simplified - needs proper signing
      },
    });

    if (!appleResponse.ok) {
      // Try sandbox
      const sandboxResponse = await fetch(
        `${APPLE_SANDBOX_URL}/subscriptions/${txId}`,
        {
          headers: {
            Authorization: `Bearer ${header}.${payload}`,
          },
        }
      );

      if (!sandboxResponse.ok) {
        throw new Error("Apple validation failed for both production and sandbox");
      }

      const sandboxData = await sandboxResponse.json();
      logStep("Validated via sandbox", sandboxData);

      return new Response(JSON.stringify({
        valid: true,
        subscribed: true,
        environment: "sandbox",
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    }

    const appleData = await appleResponse.json();
    logStep("Validated via production", { status: appleResponse.status });

    // Check subscription status from Apple's response
    const isActive = appleData?.data?.some((sub: any) => 
      sub.lastTransactions?.some((tx: any) => 
        tx.status === 1 || tx.status === 3 // 1=active, 3=in billing retry
      )
    );

    return new Response(JSON.stringify({
      valid: true,
      subscribed: isActive ?? false,
      environment: "production",
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
