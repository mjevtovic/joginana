"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, Check, Crown, Sparkles, Star, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { LotusFlower, DreamCatcher, OmSymbol } from "@/components/ui/decorations";

const features = [
  "Unlimited class access",
  "AI-powered weekly planner",
  "Personalized recommendations",
  "Save favorite classes",
  "Detailed progress analytics",
  "Offline viewing (coming soon)",
  "Priority support",
];

export default function AppUpgradePage() {
  const [loading, setLoading] = useState(false);

  const handleUpgrade = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/checkout", {
        method: "GET",
      });
      const data = await response.json();
      if (data.url) {
        window.location.href = data.url;
      }
    } catch (error) {
      console.error("Error starting checkout:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="px-4 pt-2 pb-8">
      {/* Back button */}
      <Link
        href="/app/profile"
        className="inline-flex items-center gap-2 text-sage-600 hover:text-sage-900 mb-6 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        <span className="text-sm font-medium">Back to Profile</span>
      </Link>

      {/* Header */}
      <div className="text-center mb-8 relative">
        <div className="absolute top-0 right-0 opacity-15">
          <DreamCatcher className="w-24 h-28 text-primary-500" />
        </div>

        <div className="relative inline-block mb-4">
          <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center shadow-xl shadow-amber-500/30 mx-auto">
            <Crown className="w-10 h-10 text-white" />
          </div>
          <Sparkles className="absolute -top-1 -right-1 w-6 h-6 text-amber-400 animate-pulse" />
        </div>

        <h1 className="font-display text-3xl font-bold text-gradient mb-2">
          Upgrade to Premium
        </h1>
        <p className="text-sage-600">
          Unlock the full potential of your yoga journey
        </p>
      </div>

      {/* Pricing Card */}
      <div className="relative overflow-hidden rounded-3xl p-6 mb-6 bg-gradient-to-br from-primary-600 via-primary-500 to-pink-500 shadow-xl">
        {/* Background decorations */}
        <div className="absolute top-0 right-0 opacity-20">
          <LotusFlower className="w-32 h-32 text-white" />
        </div>
        <div className="absolute bottom-0 left-0 opacity-10">
          <OmSymbol className="w-24 h-24 text-white" />
        </div>

        <div className="relative text-center mb-6">
          <div className="flex items-baseline justify-center gap-1">
            <span className="text-5xl font-bold text-white">$9.99</span>
            <span className="text-lg text-white/70">/month</span>
          </div>
          <p className="text-white/80 mt-2">7-day free trial included</p>
        </div>

        {/* Features list */}
        <div className="relative space-y-3 mb-6">
          {features.map((feature, index) => (
            <div key={index} className="flex items-center gap-3">
              <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0">
                <Check className="w-4 h-4 text-white" />
              </div>
              <span className="text-white/90 text-sm">{feature}</span>
            </div>
          ))}
        </div>

        <Button
          onClick={handleUpgrade}
          disabled={loading}
          className="w-full bg-white text-primary-600 hover:bg-white/90 font-semibold py-6 rounded-2xl shadow-lg"
        >
          {loading ? (
            <span className="flex items-center gap-2">
              <div className="w-5 h-5 border-2 border-primary-600 border-t-transparent rounded-full animate-spin" />
              Loading...
            </span>
          ) : (
            <span className="flex items-center gap-2">
              <Zap className="w-5 h-5" />
              Start Free Trial
            </span>
          )}
        </Button>
      </div>

      {/* Guarantees */}
      <div className="space-y-3">
        <div className="flex items-center gap-3 p-4 glass rounded-2xl border border-pink-100/50">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-green-100 to-emerald-100 flex items-center justify-center">
            <Check className="w-5 h-5 text-green-600" />
          </div>
          <div>
            <p className="font-medium text-sage-900 text-sm">Cancel anytime</p>
            <p className="text-xs text-sage-500">No questions asked</p>
          </div>
        </div>

        <div className="flex items-center gap-3 p-4 glass rounded-2xl border border-pink-100/50">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-100 to-orange-100 flex items-center justify-center">
            <Star className="w-5 h-5 text-amber-600" />
          </div>
          <div>
            <p className="font-medium text-sage-900 text-sm">30-day money back</p>
            <p className="text-xs text-sage-500">Full refund guaranteed</p>
          </div>
        </div>
      </div>

      {/* Footer note */}
      <p className="text-center text-xs text-sage-500 mt-6">
        By subscribing, you agree to our Terms of Service and Privacy Policy
      </p>
    </div>
  );
}
