import { corsHeaders } from 'npm:@supabase/supabase-js@2/cors';

// Retired endpoint: authentication emails are handled by the managed auth service.
Deno.serve((req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });
  return new Response(JSON.stringify({ error: 'This endpoint has been retired' }), {
    status: 410, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
});
