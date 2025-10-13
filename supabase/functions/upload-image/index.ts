import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.4';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get('Authorization') || req.headers.get('authorization');
    if (!authHeader) {
      console.error('No authorization header');
      return new Response(
        JSON.stringify({ error: 'Non autorisé' }), 
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: authHeader } } }
    );

    // Vérifier l'authentification
    const { data: { user }, error: authError } = await supabaseClient.auth.getUser();
    if (authError || !user) {
      console.error('Authentication failed:', authError);
      return new Response(
        JSON.stringify({ error: 'Non autorisé' }), 
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const formData = await req.formData();
    const file = formData.get('file');
    const reptileId = formData.get('reptileId') as string;

    if (!file || !(file instanceof File)) {
      console.error('No file provided');
      return new Response(
        JSON.stringify({ error: 'Aucun fichier fourni' }), 
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (!reptileId) {
      console.error('No reptile ID provided');
      return new Response(
        JSON.stringify({ error: 'ID du reptile manquant' }), 
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Validation du type de fichier
    const validTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      console.error('Invalid file type:', file.type);
      return new Response(
        JSON.stringify({ error: 'Type de fichier invalide. Utilisez PNG, JPEG ou WEBP.' }), 
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Validation de la taille (5MB max)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      console.error('File too large:', file.size);
      return new Response(
        JSON.stringify({ error: 'Fichier trop volumineux. Maximum 5MB.' }), 
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Validation du contenu du fichier (magic bytes)
    const buffer = await file.arrayBuffer();
    const bytes = new Uint8Array(buffer);

    // Vérifier les magic bytes
    const isPNG = bytes.length >= 8 && 
      bytes[0] === 0x89 && bytes[1] === 0x50 && bytes[2] === 0x4E && bytes[3] === 0x47;
    const isJPEG = bytes.length >= 2 && 
      bytes[0] === 0xFF && bytes[1] === 0xD8;
    const isWEBP = bytes.length >= 12 && 
      bytes[8] === 0x57 && bytes[9] === 0x45 && bytes[10] === 0x42 && bytes[11] === 0x50;

    if (!isPNG && !isJPEG && !isWEBP) {
      console.error('File content does not match declared type');
      return new Response(
        JSON.stringify({ error: 'Le contenu du fichier ne correspond pas au type déclaré' }), 
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Vérifier que l'utilisateur possède ce reptile
    const { data: reptile, error: reptileError } = await supabaseClient
      .from('reptiles')
      .select('id, user_id')
      .eq('id', reptileId)
      .eq('user_id', user.id)
      .single();

    if (reptileError || !reptile) {
      console.error('Reptile not found or unauthorized:', reptileError);
      return new Response(
        JSON.stringify({ error: 'Reptile non trouvé ou non autorisé' }), 
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Upload du fichier
    const fileExt = file.name.split('.').pop();
    const fileName = `${user.id}/${reptileId}-${Date.now()}.${fileExt}`;

    const { data: uploadData, error: uploadError } = await supabaseClient.storage
      .from('reptile-images')
      .upload(fileName, buffer, {
        contentType: file.type,
        upsert: false,
      });

    if (uploadError) {
      console.error('Upload error:', uploadError);
      return new Response(
        JSON.stringify({ error: 'Erreur lors du téléchargement: ' + uploadError.message }), 
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Mettre à jour la base de données avec le chemin de l'image
    const { error: updateError } = await supabaseClient
      .from('reptiles')
      .update({ image_url: fileName })
      .eq('id', reptileId);

    if (updateError) {
      console.error('Database update error:', updateError);
      // Supprimer le fichier uploadé en cas d'erreur
      await supabaseClient.storage.from('reptile-images').remove([fileName]);
      return new Response(
        JSON.stringify({ error: 'Erreur lors de la mise à jour de la base de données' }), 
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Image uploaded successfully:', fileName);

    return new Response(
      JSON.stringify({ 
        success: true,
        path: fileName 
      }), 
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error) {
    console.error('Unexpected error in upload-image function:', error);
    return new Response(
      JSON.stringify({ error: 'Erreur serveur inattendue' }), 
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});