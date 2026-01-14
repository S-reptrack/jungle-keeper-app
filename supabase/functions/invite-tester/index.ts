import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "https://esm.sh/resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface InviteTesterRequest {
  email: string;
  appUrl: string;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { email, appUrl }: InviteTesterRequest = await req.json();

    if (!email) {
      throw new Error("Email is required");
    }

    const signupUrl = `${appUrl}/auth?mode=signup&tester=true`;

    const emailResponse = await resend.emails.send({
      from: "S-RepTrack <contact@s-reptrack.app>",
      to: [email],
      subject: "🦎 Invitation à tester S-RepTrack",
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #1a1a1a; color: #ffffff; margin: 0; padding: 20px;">
          <div style="max-width: 600px; margin: 0 auto; background-color: #2d2d2d; border-radius: 12px; padding: 40px; border: 1px solid #3d3d3d;">
            <div style="text-align: center; margin-bottom: 30px;">
              <h1 style="color: #4ade80; margin: 0; font-size: 28px;">🦎 S-RepTrack</h1>
              <p style="color: #9ca3af; margin-top: 10px;">Gestion de reptiles professionnelle</p>
            </div>
            
            <h2 style="color: #ffffff; margin-bottom: 20px;">Vous êtes invité(e) à tester S-RepTrack !</h2>
            
            <p style="color: #d1d5db; line-height: 1.6;">
              Bonjour,<br><br>
              Vous avez été sélectionné(e) pour tester notre application de gestion de reptiles. 
              En tant que testeur, vous aurez accès à toutes les fonctionnalités premium gratuitement.
            </p>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${signupUrl}" style="display: inline-block; background: linear-gradient(135deg, #4ade80, #22c55e); color: #000000; text-decoration: none; padding: 16px 40px; border-radius: 8px; font-weight: bold; font-size: 16px;">
                Créer mon compte testeur
              </a>
            </div>
            
            <p style="color: #9ca3af; font-size: 14px; line-height: 1.6;">
              <strong>Comment ça marche :</strong><br>
              1. Cliquez sur le bouton ci-dessus<br>
              2. Créez votre compte avec cette adresse email<br>
              3. L'administrateur vous ajoutera comme testeur<br>
              4. Vous aurez accès à toute l'application !
            </p>
            
            <hr style="border: none; border-top: 1px solid #3d3d3d; margin: 30px 0;">
            
            <p style="color: #6b7280; font-size: 12px; text-align: center;">
              Si vous n'avez pas demandé cette invitation, vous pouvez ignorer cet email.<br>
              © 2025 S-RepTrack - Tous droits réservés
            </p>
          </div>
        </body>
        </html>
      `,
    });

    console.log("Invitation email sent successfully:", emailResponse);

    return new Response(JSON.stringify({ success: true, ...emailResponse }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });
  } catch (error: any) {
    console.error("Error in invite-tester function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
