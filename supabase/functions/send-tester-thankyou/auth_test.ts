import { assertEquals } from 'https://deno.land/std@0.190.0/testing/asserts.ts';

Deno.test('bulk tester mail rejects unauthenticated callers before sending', async () => {
  const response = await fetch(`${Deno.env.get('SUPABASE_URL')}/functions/v1/send-tester-thankyou`, {
    method: 'POST', headers: { Authorization: 'Bearer invalid', 'Content-Type': 'application/json' }, body: '{}',
  });
  assertEquals(response.status, 401);
  await response.body?.cancel();
});