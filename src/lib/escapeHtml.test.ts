import { expect, it } from 'vitest';
import { escapeHtml } from './escapeHtml';

it('treats stored treatment and animal text as text, never executable HTML', () => {
  expect(escapeHtml('<img src=x onerror="alert(1)">')).toBe('&lt;img src=x onerror=&quot;alert(1)&quot;&gt;');
  expect(escapeHtml("A&B's")).toBe('A&amp;B&#39;s');
});