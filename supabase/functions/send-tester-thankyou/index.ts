import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const EMAIL_HTML = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: Arial, sans-serif; background: #f9f9f9; margin: 0; padding: 0; }
    .container { max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 12px; overflow: hidden; }
    .header { background: linear-gradient(135deg, #16a34a, #15803d); padding: 32px; text-align: center; }
    .header h1 { color: #ffffff; margin: 0; font-size: 24px; }
    .header .emoji { font-size: 48px; display: block; margin-bottom: 12px; }
    .content { padding: 32px; color: #333; line-height: 1.7; }
    .content h2 { color: #16a34a; font-size: 18px; margin-top: 24px; }
    .option { background: #f0fdf4; border-left: 4px solid #16a34a; padding: 16px; margin: 12px 0; border-radius: 0 8px 8px 0; }
    .option.free { background: #f8fafc; border-left-color: #64748b; }
    .footer { padding: 24px 32px; text-align: center; color: #94a3b8; font-size: 13px; border-top: 1px solid #e2e8f0; }
    strong { color: #111; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <span class="emoji">🦎</span>
      <h1>Merci pour votre participation !</h1>
    </div>
    <div class="content">
      <p>Bonjour,</p>
      <p>La période de test de <strong>S-RepTrack</strong> touche à sa fin, et nous tenions à vous remercier sincèrement pour votre participation. Vos retours et votre utilisation de l'application nous ont été précieux pour améliorer l'expérience.</p>
      <p>Nous espérons que vous avez apprécié cette aventure autant que nous !</p>
      
      <p><strong>Bonne nouvelle concernant vos données :</strong> tous les animaux et informations que vous avez enregistrés pendant la période de test sont <strong>conservés en l'état</strong>, quelle que soit votre décision.</p>
      
      <h2>Deux options s'offrent à vous :</h2>
      
      <div class="option">
        🌟 <strong>Version Premium</strong> (4,99€/mois ou 39,99€/an)<br>
        Vous retrouvez l'intégralité de vos données et continuez à profiter de toutes les fonctionnalités sans aucune interruption. Aucune ressaisie nécessaire.
      </div>
      
      <div class="option free">
        🆓 <strong>Version Gratuite</strong><br>
        Vous conservez tous les animaux déjà enregistrés, même au-delà de la limite habituelle de 5. C'est un avantage exclusif réservé à nos testeurs ! En revanche, vous ne pourrez pas en ajouter de nouveaux et seules les fonctionnalités de base seront accessibles (suivi d'alimentation, poids actuel, QR code, photo de profil).
      </div>
      
      <p>Dans les deux cas, <strong>rien n'est perdu</strong>. Vos données vous attendent. 🎉</p>
      <p>Nous espérons vous retrouver très bientôt !</p>
      <p>À bientôt,<br><strong>L'équipe S-RepTrack</strong></p>
    </div>
    <div class="footer">
      © 2026 S-RepTrack — L'application de suivi pour éleveurs de reptiles
    </div>
  </div>
</body>
</html>
`;

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY');
    if (!RESEND_API_KEY) {
      throw new Error('RESEND_API_KEY is not configured');
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get all testers (users with 'tester' role)
    const { data: testerRoles, error: rolesError } = await supabase
      .from('user_roles')
      .select('user_id')
      .eq('role', 'tester');

    if (rolesError) throw new Error(`Error fetching tester roles: ${rolesError.message}`);
    if (!testerRoles || testerRoles.length === 0) {
      return new Response(JSON.stringify({ success: true, message: 'No testers found', sent: 0 }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const testerUserIds = testerRoles.map(r => r.user_id);

    // Get emails from profiles
    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select('email, user_id')
      .in('user_id', testerUserIds);

    if (profilesError) throw new Error(`Error fetching profiles: ${profilesError.message}`);

    const emails = profiles?.filter(p => p.email).map(p => p.email!) || [];

    if (emails.length === 0) {
      return new Response(JSON.stringify({ success: true, message: 'No tester emails found', sent: 0 }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Send emails one by one via Resend with delay to respect rate limits
    const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));
    const results = [];
    for (let i = 0; i < emails.length; i++) {
      const email = emails[i];
      if (i > 0) await delay(600); // 600ms delay to stay under 2 req/s
      try {
        const res = await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${RESEND_API_KEY}`,
          },
          body: JSON.stringify({
            from: 'S-RepTrack <contact@s-reptrack.app>',
            to: [email],
            subject: 'Merci pour votre participation au programme de test S-RepTrack ! 🦎',
            html: EMAIL_HTML,
          }),
        });

        const data = await res.json();
        results.push({ email, success: res.ok, data });
      } catch (err) {
        results.push({ email, success: false, error: err.message });
      }
    }

    const sentCount = results.filter(r => r.success).length;

    return new Response(JSON.stringify({ 
      success: true, 
      sent: sentCount, 
      total: emails.length,
      results 
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error:', error);
    return new Response(JSON.stringify({ success: false, error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
