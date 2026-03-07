import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const anonKey = Deno.env.get("SUPABASE_ANON_KEY")!;

    // Verify user from JWT
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Not authenticated" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseUser = createClient(supabaseUrl, anonKey, {
      global: { headers: { Authorization: authHeader } },
    });

    const {
      data: { user },
      error: userError,
    } = await supabaseUser.auth.getUser();

    if (userError || !user) {
      return new Response(JSON.stringify({ error: "Invalid token" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const userId = user.id;

    // Use service role to delete all user data and auth account
    const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey);

    // Delete all user data in correct order (respecting foreign keys)
    const tablesToDelete = [
      "reproduction_observations",
      "reptile_genealogy",
      "reptile_photos",
      "shedding_records",
      "bowel_records",
      "weight_records",
      "health_records",
      "feedings",
      "animal_transfers",
      "tester_activity",
      "tester_feedback",
      "referral_conversions",
      "referral_codes",
      "rodents",
      "reptiles",
      "user_roles",
      "profiles",
    ];

    for (const table of tablesToDelete) {
      const { error } = await supabaseAdmin
        .from(table)
        .delete()
        .eq("user_id", userId);

      if (error) {
        console.error(`Error deleting from ${table}:`, error.message);
      }
    }

    // Also delete transfers where user is recipient
    await supabaseAdmin
      .from("animal_transfers")
      .delete()
      .eq("to_user_id", userId);

    // Delete storage files (reptile images)
    const { data: storageFiles } = await supabaseAdmin.storage
      .from("reptile-images")
      .list(userId);

    if (storageFiles && storageFiles.length > 0) {
      const filePaths = storageFiles.map((f) => `${userId}/${f.name}`);
      await supabaseAdmin.storage.from("reptile-images").remove(filePaths);
    }

    // Finally delete the auth user (Apple requirement: FULL account deletion)
    const { error: deleteAuthError } =
      await supabaseAdmin.auth.admin.deleteUser(userId);

    if (deleteAuthError) {
      console.error("Error deleting auth user:", deleteAuthError.message);
      return new Response(
        JSON.stringify({ error: "Failed to delete account" }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    return new Response(
      JSON.stringify({ success: true }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Delete account error:", error);
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
