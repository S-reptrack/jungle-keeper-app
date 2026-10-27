# AGENTS.md

## Rules

- Administrative edge actions use the shared JWT-and-database-role guard before any privileged read or paid service call, so client-side roles never authorize them.
- Billing return destinations use the shared exact-origin allowlist with the canonical site as fallback, so caller headers cannot redirect users to untrusted sites.
- Escape all stored free-text values before writing printable HTML, so exports cannot execute animal or health-record content.
- Retired auth-email and referral endpoints return 410 without side effects; historical referral tables remain inaccessible to application users.
- Edge diagnostics log operation names only, never user emails or payment-session URLs, to avoid persisting personal data in logs.

- Reptile photo storage paths start with the authenticated owner's ID; photo history uses `reptilePhotoPath` to comply with private storage policies.

- Prices and payment price identifiers live in one file only, `src/lib/pricing.ts`; every screen imports them from there (they were duplicated before and drifted apart).
- Calls to action that offer the paid plan point to the dedicated Premium page `/upgrade`, not to the settings tab (one clear place to compare plans and manage a subscription).
- Legal and payment disclosures shown on the Premium page must stay visible next to the purchase buttons (app-store rules require them before a purchase).
