import { assertEquals } from 'https://deno.land/std@0.190.0/testing/asserts.ts';

Deno.test('retired referral rewards cannot grant discounts', async () => {
  const response = await fetch(`${Deno.env.get('SUPABASE_URL')}/functions/v1/apply-referral-reward`, {
    method: 'POST', headers: { Authorization: 'Bearer invalid', 'Content-Type': 'application/json' }, body: '{}',
  });
  assertEquals(response.status, 410);
  await response.body?.cancel();
});