import { describe, expect, it } from 'vitest';
import { billingOrigin } from './billingOrigin';

describe('approved billing return destinations', () => {
  it('rejects attacker-controlled origins', () => {
    expect(billingOrigin('https://evil.example')).toBe('https://s-reptrack.app');
    expect(billingOrigin('https://s-reptrack.app.evil.example')).toBe('https://s-reptrack.app');
  });
  it('preserves the published app and native return', () => {
    expect(billingOrigin('https://s-reptrack.app')).toBe('https://s-reptrack.app');
    expect(billingOrigin('capacitor://localhost')).toBe('https://s-reptrack.app');
  });
});