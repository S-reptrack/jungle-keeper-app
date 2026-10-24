# AGENTS.md

## Rules

- Prices and payment price identifiers live in one file only, `src/lib/pricing.ts`; every screen imports them from there (they were duplicated before and drifted apart).
- Calls to action that offer the paid plan point to the dedicated Premium page `/upgrade`, not to the settings tab (one clear place to compare plans and manage a subscription).
- Legal and payment disclosures shown on the Premium page must stay visible next to the purchase buttons (app-store rules require them before a purchase).
