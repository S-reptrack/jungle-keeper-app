import { describe, expect, it } from "vitest";
import { SUBSCRIPTION_TIERS, formatPrice } from "./pricing";

// Règle métier : tarif unique sur toutes les plateformes, annuel mis en avant comme
// « Économisez 30 % » (voir mémoire Unified Pricing).
describe("Tarifs Premium", () => {
  it("appliquent le tarif unifié 5,99 €/mois et 49,99 €/an", () => {
    expect(SUBSCRIPTION_TIERS.monthly.price).toBe(5.99);
    expect(SUBSCRIPTION_TIERS.monthly.interval).toBe("month");
    expect(SUBSCRIPTION_TIERS.yearly.price).toBe(49.99);
    expect(SUBSCRIPTION_TIERS.yearly.interval).toBe("year");
  });

  it("offrent bien environ 30 % sur le plan annuel (et non 2 mois)", () => {
    const savings =
      1 - SUBSCRIPTION_TIERS.yearly.price / (SUBSCRIPTION_TIERS.monthly.price * 12);
    expect(Math.round(savings * 100)).toBe(30);
  });

  it("utilisent les identifiants de prix Stripe LIVE", () => {
    expect(SUBSCRIPTION_TIERS.monthly.priceId).toBe("price_1T8QmuBpVrf7V1XbxPqwnald");
    expect(SUBSCRIPTION_TIERS.yearly.priceId).toBe("price_1T8Qo3BpVrf7V1XbtNBklIDu");
  });

  it("affichent les prix avec la typographie de la langue", () => {
    expect(formatPrice(5.99, "fr")).toBe("5,99");
    expect(formatPrice(5.99, "en")).toBe("5.99");
  });
});
