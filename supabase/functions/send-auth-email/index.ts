import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "https://esm.sh/resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface AuthEmailRequest {
  type: "signup" | "recovery" | "magic_link";
  email: string;
  token?: string;
  confirmationUrl?: string;
  language?: string;
}

const getEmailContent = (type: string, confirmationUrl: string, language: string = "fr") => {
  const isFrench = language === "fr";
  
  switch (type) {
    case "signup":
      return {
        subject: isFrench ? "Confirmez votre inscription à S-reptrack" : "Confirm your S-reptrack registration",
        html: `
          <!DOCTYPE html>
          <html>
          <head>
            <meta charset="utf-8">
            <style>
              body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #0a1f0a; color: #ffffff; margin: 0; padding: 40px 20px; }
              .container { max-width: 500px; margin: 0 auto; background: linear-gradient(135deg, #0f2f0f 0%, #1a3d1a 100%); border-radius: 16px; padding: 40px; border: 1px solid #2d5a2d; }
              .logo { text-align: center; margin-bottom: 30px; }
              .logo img { width: 80px; height: 80px; border-radius: 16px; }
              h1 { color: #4ade80; text-align: center; margin-bottom: 20px; font-size: 24px; }
              p { color: #a3e6a3; line-height: 1.6; margin-bottom: 20px; }
              .button { display: block; width: fit-content; margin: 30px auto; padding: 14px 32px; background: linear-gradient(135deg, #22c55e 0%, #16a34a 100%); color: #ffffff; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 16px; }
              .button:hover { background: linear-gradient(135deg, #16a34a 0%, #15803d 100%); }
              .footer { text-align: center; margin-top: 30px; color: #6b8f6b; font-size: 12px; }
            </style>
          </head>
          <body>
            <div class="container">
              <h1>${isFrench ? "Bienvenue sur S-reptrack !" : "Welcome to S-reptrack!"}</h1>
              <p>${isFrench 
                ? "Merci de vous être inscrit à S-reptrack, votre application de gestion d'élevage de reptiles." 
                : "Thank you for signing up to S-reptrack, your reptile breeding management application."}</p>
              <p>${isFrench 
                ? "Cliquez sur le bouton ci-dessous pour confirmer votre adresse email et accéder à votre compte :" 
                : "Click the button below to confirm your email address and access your account:"}</p>
              <a href="${confirmationUrl}" class="button">${isFrench ? "Confirmer mon email" : "Confirm my email"}</a>
              <p style="font-size: 12px; color: #6b8f6b;">${isFrench 
                ? "Si vous n'avez pas créé de compte, vous pouvez ignorer cet email." 
                : "If you didn't create an account, you can ignore this email."}</p>
              <div class="footer">
                <p>© 2025 S-reptrack</p>
              </div>
            </div>
          </body>
          </html>
        `,
      };
    
    case "recovery":
      return {
        subject: isFrench ? "Réinitialisez votre mot de passe S-reptrack" : "Reset your S-reptrack password",
        html: `
          <!DOCTYPE html>
          <html>
          <head>
            <meta charset="utf-8">
            <style>
              body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #0a1f0a; color: #ffffff; margin: 0; padding: 40px 20px; }
              .container { max-width: 500px; margin: 0 auto; background: linear-gradient(135deg, #0f2f0f 0%, #1a3d1a 100%); border-radius: 16px; padding: 40px; border: 1px solid #2d5a2d; }
              h1 { color: #4ade80; text-align: center; margin-bottom: 20px; font-size: 24px; }
              p { color: #a3e6a3; line-height: 1.6; margin-bottom: 20px; }
              .button { display: block; width: fit-content; margin: 30px auto; padding: 14px 32px; background: linear-gradient(135deg, #22c55e 0%, #16a34a 100%); color: #ffffff; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 16px; }
              .footer { text-align: center; margin-top: 30px; color: #6b8f6b; font-size: 12px; }
            </style>
          </head>
          <body>
            <div class="container">
              <h1>${isFrench ? "Réinitialisation du mot de passe" : "Password Reset"}</h1>
              <p>${isFrench 
                ? "Vous avez demandé à réinitialiser votre mot de passe S-reptrack." 
                : "You requested to reset your S-reptrack password."}</p>
              <p>${isFrench 
                ? "Cliquez sur le bouton ci-dessous pour définir un nouveau mot de passe :" 
                : "Click the button below to set a new password:"}</p>
              <a href="${confirmationUrl}" class="button">${isFrench ? "Réinitialiser mon mot de passe" : "Reset my password"}</a>
              <p style="font-size: 12px; color: #6b8f6b;">${isFrench 
                ? "Si vous n'avez pas demandé cette réinitialisation, ignorez cet email. Votre mot de passe restera inchangé." 
                : "If you didn't request this reset, ignore this email. Your password will remain unchanged."}</p>
              <div class="footer">
                <p>© 2025 S-reptrack</p>
              </div>
            </div>
          </body>
          </html>
        `,
      };
    
    default:
      return {
        subject: isFrench ? "Connexion à S-reptrack" : "S-reptrack Login",
        html: `
          <!DOCTYPE html>
          <html>
          <head>
            <meta charset="utf-8">
            <style>
              body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #0a1f0a; color: #ffffff; margin: 0; padding: 40px 20px; }
              .container { max-width: 500px; margin: 0 auto; background: linear-gradient(135deg, #0f2f0f 0%, #1a3d1a 100%); border-radius: 16px; padding: 40px; border: 1px solid #2d5a2d; }
              h1 { color: #4ade80; text-align: center; margin-bottom: 20px; font-size: 24px; }
              p { color: #a3e6a3; line-height: 1.6; margin-bottom: 20px; }
              .button { display: block; width: fit-content; margin: 30px auto; padding: 14px 32px; background: linear-gradient(135deg, #22c55e 0%, #16a34a 100%); color: #ffffff; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 16px; }
              .footer { text-align: center; margin-top: 30px; color: #6b8f6b; font-size: 12px; }
            </style>
          </head>
          <body>
            <div class="container">
              <h1>${isFrench ? "Connexion à S-reptrack" : "Login to S-reptrack"}</h1>
              <p>${isFrench 
                ? "Cliquez sur le bouton ci-dessous pour vous connecter :" 
                : "Click the button below to log in:"}</p>
              <a href="${confirmationUrl}" class="button">${isFrench ? "Me connecter" : "Log in"}</a>
              <div class="footer">
                <p>© 2025 S-reptrack</p>
              </div>
            </div>
          </body>
          </html>
        `,
      };
  }
};

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { type, email, confirmationUrl, language }: AuthEmailRequest = await req.json();

    console.log(`Sending ${type} email to ${email}`);

    if (!email || !confirmationUrl) {
      throw new Error("Email and confirmationUrl are required");
    }

    const { subject, html } = getEmailContent(type, confirmationUrl, language);

    const emailResponse = await resend.emails.send({
      from: "S-reptrack <contact@s-reptrack.app>",
      to: [email],
      subject,
      html,
    });

    console.log("Email sent successfully:", emailResponse);

    return new Response(JSON.stringify({ success: true, data: emailResponse }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error: any) {
    console.error("Error sending auth email:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
};

serve(handler);
