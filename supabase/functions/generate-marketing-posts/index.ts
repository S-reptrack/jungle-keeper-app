import { corsHeaders } from 'npm:@supabase/supabase-js@2/cors';

const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");

interface Body {
  network: "instagram" | "facebook" | "tiktok" | "twitter" | "linkedin";
  theme?: string;
  count?: number;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    if (!LOVABLE_API_KEY) {
      return new Response(JSON.stringify({ error: "LOVABLE_API_KEY manquante" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { network, theme, count = 3 }: Body = await req.json();

    const networkGuide: Record<string, string> = {
      instagram: "Post Instagram : accroche visuelle forte, 3-5 lignes maximum, emojis pertinents, style storytelling reptile, terminer par un appel à l'action doux (ex: 'télécharge S-reptrack'). Inclure 8-12 hashtags ciblés.",
      facebook: "Post Facebook : ton chaleureux et communautaire, 4-8 lignes, emojis modérés, question ouverte à la fin pour engager les commentaires. 3-5 hashtags.",
      tiktok: "Script TikTok court (15-30 sec) : hook percutant dès la 1re seconde, structure Hook/Valeur/CTA, ton dynamique, indications visuelles entre crochets. 5-8 hashtags tendances #reptiletok.",
      twitter: "Tweet : maximum 260 caractères, punchy, une info utile ou une astuce reptile, 2-3 hashtags maximum.",
      linkedin: "Post LinkedIn : angle professionnel (éleveurs, vétérinaires, passionnés experts), 6-10 lignes, ton expert et bienveillant, valeur ajoutée métier, 3-5 hashtags pros.",
    };

    const systemPrompt = `Tu es un expert en marketing digital spécialisé dans l'univers des reptiles et amphibiens.
Tu fais la promotion de S-reptrack, une application mobile française qui aide les éleveurs et passionnés à :
- Suivre la santé, l'alimentation et la mue de leurs reptiles
- Identifier chaque animal via une puce NFC
- Gérer généalogies, morphs génétiques et carnets d'élevage
- Exporter des documents CITES et PDF réglementaires

Ton style : chaleureux, expert, jamais commercial agressif. Tu parles à des passionnés.
Tu génères UNIQUEMENT du contenu réaliste, prêt à publier, sans meta-commentaire.`;

    const userPrompt = `Génère ${count} publications distinctes pour ${network.toUpperCase()}.
${theme ? `Thème imposé : ${theme}` : "Varie les thèmes : astuce santé, focus morph, témoignage utilisateur, fonctionnalité premium, nouveauté."}

Règles de format ${network} :
${networkGuide[network]}

Réponds en JSON strict de cette forme (aucun texte autour) :
{
  "posts": [
    { "title": "titre court interne", "content": "le texte complet du post", "hashtags": ["#tag1", "#tag2"], "visualIdea": "description en 1 phrase de l'image/vidéo à créer" }
  ]
}`;

    const aiResp = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        response_format: { type: "json_object" },
      }),
    });

    if (!aiResp.ok) {
      const errText = await aiResp.text();
      if (aiResp.status === 429) {
        return new Response(JSON.stringify({ error: "Limite atteinte, réessayez dans un instant." }), {
          status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (aiResp.status === 402) {
        return new Response(JSON.stringify({ error: "Crédits IA épuisés. Ajoutez des crédits dans votre workspace." }), {
          status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      return new Response(JSON.stringify({ error: `Erreur IA: ${errText}` }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const data = await aiResp.json();
    const raw = data.choices?.[0]?.message?.content ?? "{}";
    let parsed: any;
    try { parsed = JSON.parse(raw); } catch { parsed = { posts: [], raw }; }

    return new Response(JSON.stringify(parsed), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: (e as Error).message }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
