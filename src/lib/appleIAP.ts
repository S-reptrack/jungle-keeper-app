/**
 * Service Apple In-App Purchase pour iOS natif
 * 
 * Ce module utilise l'API globale CdvPurchase injectée par le plugin Cordova
 * dans l'environnement natif. Sur le web, toutes les fonctions retournent
 * des valeurs par défaut (pas de crash).
 * 
 * Plugin requis (à installer dans le projet natif):
 *   cordova-plugin-purchase
 *   ou via: npx cap sync après ajout dans package.json
 * 
 * IMPORTANT: Les Product IDs doivent correspondre à ceux créés dans App Store Connect
 */

// Product IDs Apple (à configurer dans App Store Connect)
export const APPLE_PRODUCT_IDS = {
  monthly: "com.sreptrack.app.premium.monthly",
  yearly: "com.sreptrack.app.premium.yearly",
};

export interface AppleProduct {
  id: string;
  title: string;
  description: string;
  price: string;
  priceAmount: number;
  currency: string;
}

export interface ApplePurchaseResult {
  success: boolean;
  transactionId?: string;
  error?: string;
}

// Accès au store global CdvPurchase (injecté par le plugin natif)
const getStore = (): any => {
  const win = window as any;
  return win?.CdvPurchase?.store;
};

const getCdvPurchase = (): any => {
  const win = window as any;
  return win?.CdvPurchase;
};

/**
 * Vérifie si le plugin IAP est disponible
 */
export const isAppleIAPAvailable = (): boolean => {
  return !!getStore();
};

/**
 * Initialise le store IAP et charge les produits
 */
export const initializeAppleIAP = async (): Promise<void> => {
  const store = getStore();
  const CdvPurchase = getCdvPurchase();
  
  if (!store || !CdvPurchase) {
    console.warn("[Apple IAP] Plugin not available - running on web?");
    return;
  }

  try {
    // Enregistrer les produits
    store.register([
      {
        id: APPLE_PRODUCT_IDS.monthly,
        type: CdvPurchase.ProductType.PAID_SUBSCRIPTION,
        platform: CdvPurchase.Platform.APPLE_APPSTORE,
      },
      {
        id: APPLE_PRODUCT_IDS.yearly,
        type: CdvPurchase.ProductType.PAID_SUBSCRIPTION,
        platform: CdvPurchase.Platform.APPLE_APPSTORE,
      },
    ]);

    // Initialiser le store
    await store.initialize([CdvPurchase.Platform.APPLE_APPSTORE]);
    console.log("[Apple IAP] Store initialized successfully");
  } catch (error) {
    console.error("[Apple IAP] Failed to initialize:", error);
    throw error;
  }
};

/**
 * Récupère les infos des produits depuis App Store Connect
 */
export const getAppleProducts = async (): Promise<AppleProduct[]> => {
  const store = getStore();
  const CdvPurchase = getCdvPurchase();
  
  if (!store || !CdvPurchase) return [];

  try {
    const products: AppleProduct[] = [];

    for (const [, productId] of Object.entries(APPLE_PRODUCT_IDS)) {
      const product = store.get(productId, CdvPurchase.Platform.APPLE_APPSTORE);
      if (product) {
        const offer = product.getOffer();
        products.push({
          id: product.id,
          title: product.title,
          description: product.description,
          price: offer?.pricingPhases?.[0]?.price || "",
          priceAmount: offer?.pricingPhases?.[0]?.priceMicros
            ? offer.pricingPhases[0].priceMicros / 1_000_000
            : 0,
          currency: offer?.pricingPhases?.[0]?.currency || "EUR",
        });
      }
    }

    return products;
  } catch (error) {
    console.error("[Apple IAP] Failed to get products:", error);
    return [];
  }
};

/**
 * Lance l'achat d'un produit Apple
 */
export const purchaseAppleProduct = async (
  productId: string
): Promise<ApplePurchaseResult> => {
  const store = getStore();
  const CdvPurchase = getCdvPurchase();
  
  if (!store || !CdvPurchase) {
    return { success: false, error: "IAP plugin not available" };
  }

  try {
    const offer = store.get(productId, CdvPurchase.Platform.APPLE_APPSTORE)?.getOffer();
    if (!offer) {
      return { success: false, error: "Product not found" };
    }

    const result = await store.order(offer);

    if (result && result.isError) {
      return { success: false, error: result.message || "Purchase failed" };
    }

    console.log("[Apple IAP] Purchase initiated successfully");
    return { success: true };
  } catch (error) {
    console.error("[Apple IAP] Purchase error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
};

/**
 * Restaure les achats précédents (requis par Apple)
 */
export const restoreApplePurchases = async (): Promise<boolean> => {
  const store = getStore();
  if (!store) return false;

  try {
    await store.restorePurchases();
    console.log("[Apple IAP] Purchases restored");
    return true;
  } catch (error) {
    console.error("[Apple IAP] Restore failed:", error);
    return false;
  }
};

/**
 * Vérifie si l'utilisateur a un abonnement Apple actif
 */
export const checkAppleSubscriptionStatus = async (): Promise<{
  subscribed: boolean;
  productId?: string;
}> => {
  const store = getStore();
  const CdvPurchase = getCdvPurchase();
  
  if (!store || !CdvPurchase) return { subscribed: false };

  try {
    for (const [, productId] of Object.entries(APPLE_PRODUCT_IDS)) {
      const product = store.get(productId, CdvPurchase.Platform.APPLE_APPSTORE);
      if (product?.owned) {
        return { subscribed: true, productId };
      }
    }

    return { subscribed: false };
  } catch (error) {
    console.error("[Apple IAP] Status check failed:", error);
    return { subscribed: false };
  }
};
