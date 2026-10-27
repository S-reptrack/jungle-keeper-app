const DEFAULT_ORIGIN = 'https://s-reptrack.app';
const TRUSTED_ORIGINS = new Set([
  DEFAULT_ORIGIN, 'https://www.s-reptrack.app', 'https://s-reptrack.lovable.app',
  'https://id-preview--6bcbc9d4-57cb-49d8-b821-4dcda0936c9c.lovable.app',
  'http://localhost:8080',
]);

// Native apps and unknown origins always return to the canonical public site.
export function billingOrigin(origin: string | null): string {
  return origin && TRUSTED_ORIGINS.has(origin) ? origin : DEFAULT_ORIGIN;
}