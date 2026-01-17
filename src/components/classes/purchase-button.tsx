"use client";

import { useState } from "react";
import { ShoppingCart, Loader2, Lock, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatPrice } from "@/lib/utils";

interface PurchaseButtonProps {
  classId: string;
  priceCents: number;
  currency: string;
  isPurchased?: boolean;
  isSubscriber?: boolean;
  isLoggedIn?: boolean;
}

export function PurchaseButton({
  classId,
  priceCents,
  currency,
  isPurchased = false,
  isSubscriber = false,
  isLoggedIn = false,
}: PurchaseButtonProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handlePurchase = async () => {
    if (!isLoggedIn) {
      // Redirect to login
      window.location.href = `/login?redirect=/app/classes/${classId}`;
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/checkout/class", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ classId }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to start checkout");
      }

      // Redirect to Stripe Checkout
      window.location.href = data.url;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
      setLoading(false);
    }
  };

  // User is a subscriber - they have access
  if (isSubscriber) {
    return (
      <div className="flex items-center gap-2 text-green-600">
        <Check className="w-5 h-5" />
        <span className="font-medium">Included with subscription</span>
      </div>
    );
  }

  // User already purchased
  if (isPurchased) {
    return (
      <div className="flex items-center gap-2 text-green-600">
        <Check className="w-5 h-5" />
        <span className="font-medium">Purchased</span>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <Button
        onClick={handlePurchase}
        disabled={loading}
        className="w-full bg-gradient-to-r from-primary-500 to-pink-500 hover:from-primary-600 hover:to-pink-600"
      >
        {loading ? (
          <>
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            Processing...
          </>
        ) : (
          <>
            <ShoppingCart className="w-4 h-4 mr-2" />
            Buy for {formatPrice(priceCents, currency)}
          </>
        )}
      </Button>

      {!isLoggedIn && (
        <p className="text-xs text-gray-500 text-center flex items-center justify-center gap-1">
          <Lock className="w-3 h-3" />
          Sign in required to purchase
        </p>
      )}

      {error && (
        <p className="text-sm text-red-500 text-center">{error}</p>
      )}
    </div>
  );
}
