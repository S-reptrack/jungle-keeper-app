import { createClient } from 'npm:@supabase/supabase-js@2';
import { corsHeaders } from 'npm:@supabase/supabase-js@2/cors';

export async function requireAdmin(req: Request): Promise<Response | null> {
  const header = req.headers.get('Authorization');
  const unauthorized = () => new Response(JSON.stringify({ error: 'Unauthorized' }), {
    status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
  if (!header?.startsWith('Bearer ')) return unauthorized();
  const client = createClient(Deno.env.get('SUPABASE_URL') ?? '', Deno.env.get('SUPABASE_ANON_KEY') ?? '', {
    global: { headers: { Authorization: header } }, auth: { persistSession: false },
  });
  const { data, error } = await client.auth.getClaims(header.slice(7));
  if (error || !data?.claims?.sub) return unauthorized();
  const { data: admin, error: roleError } = await client.rpc('has_role', { _user_id: data.claims.sub, _role: 'admin' });
  if (roleError || admin !== true) return new Response(JSON.stringify({ error: 'Forbidden' }), {
    status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
  return null;
}