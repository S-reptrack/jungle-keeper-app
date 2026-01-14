import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";
import { useUserRole } from "./useUserRole";

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
}

export const useSubscription = () => {
  const { user } = useAuth();
  const { isTester, isAdmin, loading: roleLoading } = useUserRole();
  const [state, setState] = useState<SubscriptionState>({
    subscribed: false,
    productId: null,
    priceId: null,
    subscriptionEnd: null,
    loading: true,
    error: null,
    isTesterPremium: false,
  });

  const checkSubscription = useCallback(async () => {
    if (!user) {
      setState(prev => ({ ...prev, subscribed: false, loading: false, isTesterPremium: false }));
      return;
    }

    // Testeurs et admins ont accès Premium gratuit
    if (isTester || isAdmin) {
      setState({
        subscribed: true,
        productId: "tester_premium",
        priceId: null,
        subscriptionEnd: null,
        loading: false,
        error: null,
        isTesterPremium: true,
      });
      return;
    }

    try {
      setState(prev => ({ ...prev, loading: true, error: null }));

      const { data: sessionData } = await supabase.auth.getSession();
      const accessToken = sessionData.session?.access_token;

      if (!accessToken) {
        setState(prev => ({ ...prev, subscribed: false, loading: false, isTesterPremium: false }));
        return;
      }

      const { data, error } = await supabase.functions.invoke("check-subscription", {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      if (error) throw error;

      setState({
        subscribed: data.subscribed || false,
        productId: data.product_id || null,
        priceId: data.price_id || null,
        subscriptionEnd: data.subscription_end || null,
        loading: false,
        error: null,
        isTesterPremium: false,
      });
    } catch (error) {
      console.error("Error checking subscription:", error);
      setState(prev => ({
        ...prev,
        loading: false,
        error: error instanceof Error ? error.message : "Unknown error",
        isTesterPremium: false,
      }));
    }
  }, [user, isTester, isAdmin]);

  const createCheckout = async (priceId: string) => {
    try {
      const { data: sessionData } = await supabase.auth.getSession();
      const accessToken = sessionData.session?.access_token;

      if (!accessToken) {
        throw new Error("Not authenticated");
      }

      const { data, error } = await supabase.functions.invoke("create-checkout", {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
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
    try {
      const { data: sessionData } = await supabase.auth.getSession();
      const accessToken = sessionData.session?.access_token;

      if (!accessToken) {
        throw new Error("Not authenticated");
      }

      const { data, error } = await supabase.functions.invoke("customer-portal", {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
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

  const getCurrentTier = () => {
    if (!state.subscribed || !state.priceId) return null;
    
    if (state.priceId === SUBSCRIPTION_TIERS.monthly.priceId) return "monthly";
    if (state.priceId === SUBSCRIPTION_TIERS.yearly.priceId) return "yearly";
    return null;
  };

  useEffect(() => {
    // Attendre que le rôle soit chargé avant de vérifier l'abonnement
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
    getCurrentTier,
  };
};
