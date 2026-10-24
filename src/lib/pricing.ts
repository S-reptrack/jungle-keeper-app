// Source unique des tarifs Premium — identique sur le web, Android et iOS.
// Les identifiants de prix Stripe sont LIVE.
export const SUBSCRIPTION_TIERS = {
  monthly: {
    priceId: "price_1T8QmuBpVrf7V1XbxPqwnald",
    productId: "prod_U6e5gpDvGNmPGR",
    price: 5.99,
    interval: "month" as const,
  },
  yearly: {
    priceId: "price_1T8Qo3BpVrf7V1XbtNBklIDu",
    productId: "prod_U6e6twDbrf5BlB",
    price: 49.99,
    interval: "year" as const,
  },
};

/** Affiche un tarif avec la virgule ou le point décimal de la langue affichée. */
export const formatPrice = (value: number, locale: string) =>
  new Intl.NumberFormat(locale, { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(value);
