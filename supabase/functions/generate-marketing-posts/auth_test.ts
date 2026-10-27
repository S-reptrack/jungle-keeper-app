import { assertEquals } from 'https://deno.land/std@0.190.0/testing/asserts.ts';

Deno.test('paid marketing generator rejects unauthenticated callers', async () => {
  const response = await fetch(`${Deno.env.get('SUPABASE_URL')}/functions/v1/generate-marketing-posts`, {
    method: 'POST', headers: { Authorization: 'Bearer invalid', 'Content-Type': 'application/json' }, body: '{}',
  });
  assertEquals(response.status, 401);
  await response.body?.cancel();
});