import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";
import { useUserRole } from "./useUserRole";
import { getPaymentProvider, type PaymentProvider } from "@/lib/platformUtils";
import {
  initializeAppleIAP,
  checkAppleSubscriptionStatus,
  purchaseAppleProduct,
  restoreApplePurchases,
  isAppleIAPAvailable,
  APPLE_PRODUCT_IDS,
} from "@/lib/appleIAP";

// Stripe LIVE price IDs
export const SUBSCRIPTION_TIERS = {
  monthly: {
    priceId: "price_1SjkYyBpVrf7V1XbsPWXwUIc",
    productId: "prod_Th8qQ66ByaGeZa",
    price: 4.99,
    interval: "month" as const,
  },
  yearly: {
    priceId: "price_1SjkZEBpVrf7V1Xbd1DD1Ems",
    productId: "prod_Th8qGp0s3PNarf",
    price: 39.99,
    interval: "year" as const,
  },
};

interface SubscriptionState {
  subscribed: boolean;
  productId: string | null;
  priceId: string | null;
  subscriptionEnd: string | null;
  loading: boolean;
  error: string | null;
  isTesterPremium: boolean;
  testerTrialEnd: string | null;
  testerTrialExpired: boolean;
  paymentProvider: PaymentProvider;
}

const paymentProvider = getPaymentProvider();

const defaultState: SubscriptionState = {
  subscribed: false,
  productId: null,
  priceId: null,
  subscriptionEnd: null,
  loading: true,
  error: null,
  isTesterPremium: false,
  testerTrialEnd: null,
  testerTrialExpired: false,
  paymentProvider,
};

export const useSubscription = () => {
  const { user } = useAuth();
  const { isTester, isAdmin, loading: roleLoading } = useUserRole();
  const [state, setState] = useState<SubscriptionState>(defaultState);
  const [appleIAPInitialized, setAppleIAPInitialized] = useState(false);

  // Initialize Apple IAP on iOS
  useEffect(() => {
    if (paymentProvider === "apple" && !appleIAPInitialized) {
      initializeAppleIAP()
        .then(() => setAppleIAPInitialized(true))
        .catch((err) => console.error("[Apple IAP] Init failed:", err));
    }
  }, [appleIAPInitialized]);

  const checkSubscription = useCallback(async () => {
    if (!user) {
      setState((prev) => ({ ...prev, subscribed: false, loading: false, isTesterPremium: false, testerTrialEnd: null, testerTrialExpired: false }));
      return;
    }

    // Vérifier si testeur avec date limite
    if (isTester) {
      try {
        const { data: profile } = await supabase
          .from("profiles")
          .select("email")
          .eq("user_id", user.id)
          .maybeSingle();

        if (profile?.email) {
          const { data: invitation } = await supabase
            .from("tester_invitations")
            .select("trial_end_date")
            .eq("email", profile.email)
            .eq("status", "accepted")
            .maybeSingle();

          const trialEndDate = invitation?.trial_end_date;
          const isExpired = trialEndDate ? new Date(trialEndDate) < new Date() : false;

          if (isExpired) {
            // Check for real subscription (Stripe or Apple)
            const hasRealSub = await checkRealSubscription();
            if (hasRealSub.subscribed) {
              await supabase.rpc("remove_tester_role_on_subscribe", { user_email: profile.email });
              setState({
                ...defaultState,
                subscribed: true,
                productId: hasRealSub.productId,
                priceId: hasRealSub.priceId,
                subscriptionEnd: hasRealSub.subscriptionEnd,
                loading: false,
                isTesterPremium: false,
              });
              return;
            }

            setState({
              ...defaultState,
              subscribed: false,
              loading: false,
              testerTrialEnd: trialEndDate,
              testerTrialExpired: true,
            });
            return;
          }

          // Trial actif
          setState({
            ...defaultState,
            subscribed: true,
            productId: "tester_premium",
            loading: false,
            isTesterPremium: true,
            testerTrialEnd: trialEndDate,
          });
          return;
        }
      } catch (error) {
        console.error("Error checking tester trial:", error);
      }

      setState({
        ...defaultState,
        subscribed: true,
        productId: "tester_premium",
        loading: false,
        isTesterPremium: true,
      });
      return;
    }

    // Admin a accès Premium gratuit illimité
    if (isAdmin) {
      setState({
        ...defaultState,
        subscribed: true,
        productId: "admin_premium",
        loading: false,
        isTesterPremium: true,
      });
      return;
    }

    // Check real subscription based on platform
    try {
      setState((prev) => ({ ...prev, loading: true, error: null }));
      const result = await checkRealSubscription();
      setState({
        ...defaultState,
        subscribed: result.subscribed,
        productId: result.productId,
        priceId: result.priceId,
        subscriptionEnd: result.subscriptionEnd,
        loading: false,
      });
    } catch (error) {
      console.error("Error checking subscription:", error);
      setState((prev) => ({
        ...prev,
        loading: false,
        error: error instanceof Error ? error.message : "Unknown error",
      }));
    }
  }, [user, isTester, isAdmin]);

  /**
   * Vérifie l'abonnement réel (Stripe ou Apple IAP selon la plateforme)
   */
  const checkRealSubscription = async (): Promise<{
    subscribed: boolean;
    productId: string | null;
    priceId: string | null;
    subscriptionEnd: string | null;
  }> => {
    // Sur iOS natif, vérifier Apple IAP d'abord
    if (paymentProvider === "apple" && isAppleIAPAvailable()) {
      const appleStatus = await checkAppleSubscriptionStatus();
      if (appleStatus.subscribed) {
        return {
          subscribed: true,
          productId: appleStatus.productId || "apple_premium",
          priceId: null,
          subscriptionEnd: null,
        };
      }
    }

    // Fallback ou plateforme non-iOS : vérifier Stripe
    const { data: sessionData } = await supabase.auth.getSession();
    const accessToken = sessionData.session?.access_token;

    if (!accessToken) {
      return { subscribed: false, productId: null, priceId: null, subscriptionEnd: null };
    }

    const { data, error } = await supabase.functions.invoke("check-subscription", {
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    if (error) throw error;

    return {
      subscribed: data.subscribed || false,
      productId: data.product_id || null,
      priceId: data.price_id || null,
      subscriptionEnd: data.subscription_end || null,
    };
  };

  const createCheckout = async (priceId: string) => {
    // Sur iOS natif, utiliser Apple IAP
    if (paymentProvider === "apple") {
      const appleProductId = priceId === SUBSCRIPTION_TIERS.monthly.priceId
        ? APPLE_PRODUCT_IDS.monthly
        : APPLE_PRODUCT_IDS.yearly;

      const result = await purchaseAppleProduct(appleProductId);
      if (!result.success) {
        throw new Error(result.error || "Apple purchase failed");
      }
      // Rafraîchir le statut après achat
      await checkSubscription();
      return;
    }

    // Stripe checkout (Android/Web)
    try {
      const { data: sessionData } = await supabase.auth.getSession();
      const accessToken = sessionData.session?.access_token;

      if (!accessToken) {
        throw new Error("Not authenticated");
      }

      const { data, error } = await supabase.functions.invoke("create-checkout", {
        headers: { Authorization: `Bearer ${accessToken}` },
        body: { priceId },
      });

      if (error) throw error;

      if (data.url) {
        window.location.href = data.url;
      }
    } catch (error) {
      console.error("Error creating checkout:", error);
      throw error;
    }
  };

  const openCustomerPortal = async () => {
    // Sur iOS, pas de portail Stripe - utiliser la gestion Apple
    if (paymentProvider === "apple") {
      // Ouvre les paramètres d'abonnement iOS
      window.open("https://apps.apple.com/account/subscriptions", "_blank");
      return;
    }

    try {
      const { data: sessionData } = await supabase.auth.getSession();
      const accessToken = sessionData.session?.access_token;

      if (!accessToken) {
        throw new Error("Not authenticated");
      }

      const { data, error } = await supabase.functions.invoke("customer-portal", {
        headers: { Authorization: `Bearer ${accessToken}` },
      });

      if (error) throw error;

      if (data.url) {
        window.location.href = data.url;
      }
    } catch (error) {
      console.error("Error opening customer portal:", error);
      throw error;
    }
  };

  const restorePurchases = async () => {
    if (paymentProvider === "apple") {
      const restored = await restoreApplePurchases();
      if (restored) {
        await checkSubscription();
      }
      return restored;
    }
    return false;
  };

  const getCurrentTier = () => {
    if (!state.subscribed || !state.priceId) return null;

    if (state.priceId === SUBSCRIPTION_TIERS.monthly.priceId) return "monthly";
    if (state.priceId === SUBSCRIPTION_TIERS.yearly.priceId) return "yearly";
    return null;
  };

  useEffect(() => {
    if (!roleLoading) {
      checkSubscription();
    }
  }, [checkSubscription, roleLoading]);

  // Auto-refresh every minute
  useEffect(() => {
    const interval = setInterval(checkSubscription, 60000);
    return () => clearInterval(interval);
  }, [checkSubscription]);

  return {
    ...state,
    loading: state.loading || roleLoading,
    checkSubscription,
    createCheckout,
    openCustomerPortal,
    restorePurchases,
    getCurrentTier,
  };
};
