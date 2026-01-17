"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import type { Profile } from "@/types/database";
import Link from "next/link";
import { User, Crown, LogOut, Settings, HelpCircle, ChevronRight, Sparkles, Heart, Calendar, ArrowLeft } from "lucide-react";
import { LotusFlower, DreamCatcher, Mandala, OmSymbol } from "@/components/ui/decorations";

export default function AppProfilePage() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const supabase = createClient();

  const isPremium = profile?.subscription_status === "active" || profile?.subscription_status === "trialing";

  useEffect(() => {
    async function loadData() {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (user) {
        const { data: profileData } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", user.id)
          .single();
        setProfile(profileData as Profile | null);
      }

      setLoading(false);
    }

    loadData();
  }, [supabase]);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push("/");
  };

  const handleManageSubscription = async () => {
    try {
      const response = await fetch("/api/stripe/portal", {
        method: "POST",
      });
      const data = await response.json();
      if (data.url) {
        window.location.href = data.url;
      }
    } catch (error) {
      console.error("Error opening billing portal:", error);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <div className="relative">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-pink-200 border-t-primary-500" />
          <OmSymbol className="absolute inset-0 m-auto w-8 h-8 text-primary-400 animate-pulse" />
        </div>
        <p className="text-sage-500 animate-pulse">Loading your profile...</p>
      </div>
    );
  }

  return (
    <div className="px-4 pt-6 pb-8">
      {/* Header with decorations */}
      <div className="relative mb-6">
        <div className="absolute -top-4 right-0 opacity-15">
          <DreamCatcher className="w-20 h-24 text-primary-500" />
        </div>

        <div className="flex items-center gap-2 mb-1">
          <User className="w-5 h-5 text-pink-500" />
          <h1 className="font-display text-2xl font-bold text-gradient">Profile</h1>
        </div>
      </div>

      {/* Profile Card */}
      <div className="relative overflow-hidden rounded-3xl p-6 mb-6 glass border border-pink-100/50 shadow-lg">
        {/* Decorative background */}
        <div className="absolute top-0 right-0 opacity-10">
          <Mandala className="w-32 h-32 text-primary-400" />
        </div>

        <div className="relative flex items-center gap-4 mb-6">
          {/* Avatar */}
          <div className="relative">
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-primary-400 to-pink-400 flex items-center justify-center shadow-lg shadow-primary-500/25">
              {profile?.avatar_url ? (
                <img
                  src={profile.avatar_url}
                  alt={profile.full_name || "Profile"}
                  className="w-20 h-20 rounded-2xl object-cover"
                />
              ) : (
                <User className="h-10 w-10 text-white" />
              )}
            </div>
            {/* Floating lotus */}
            <div className="absolute -bottom-1 -right-1">
              <LotusFlower className="w-6 h-6 text-pink-400" />
            </div>
          </div>

          <div className="flex-1">
            <h2 className="font-display text-xl font-bold text-sage-900">
              {profile?.full_name || "Yoga Practitioner"}
            </h2>
            <p className="text-sm text-sage-500">{profile?.email}</p>
          </div>
        </div>

        {/* Subscription Status Badge */}
        <div className={`flex items-center gap-3 px-4 py-3 rounded-2xl ${
          isPremium
            ? "bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200"
            : "bg-gradient-to-r from-sage-50 to-primary-50 border border-sage-200"
        }`}>
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
            isPremium
              ? "bg-gradient-to-br from-amber-400 to-orange-400"
              : "bg-gradient-to-br from-sage-300 to-sage-400"
          }`}>
            <Crown className="h-5 w-5 text-white" />
          </div>
          <div className="flex-1">
            <span className={`text-sm font-semibold ${isPremium ? "text-amber-700" : "text-sage-700"}`}>
              {isPremium ? "Premium Member" : "Free Plan"}
            </span>
            <p className="text-xs text-sage-500">
              {isPremium ? "Full access to all features" : "Upgrade for more features"}
            </p>
          </div>
          {isPremium && (
            <Sparkles className="w-5 h-5 text-amber-500" />
          )}
        </div>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        <div className="p-4 glass rounded-2xl border border-pink-100/50 text-center">
          <Heart className="w-5 h-5 text-pink-500 mx-auto mb-1" />
          <p className="text-lg font-bold text-gradient">0</p>
          <p className="text-xs text-sage-500">Favorites</p>
        </div>
        <div className="p-4 glass rounded-2xl border border-pink-100/50 text-center">
          <Calendar className="w-5 h-5 text-primary-500 mx-auto mb-1" />
          <p className="text-lg font-bold text-gradient">0</p>
          <p className="text-xs text-sage-500">Classes</p>
        </div>
        <div className="p-4 glass rounded-2xl border border-pink-100/50 text-center">
          <LotusFlower className="w-5 h-5 text-pink-400 mx-auto mb-1" />
          <p className="text-lg font-bold text-gradient">0</p>
          <p className="text-xs text-sage-500">Streak</p>
        </div>
      </div>

      {/* Menu Items */}
      <div className="space-y-3">
        {!isPremium && (
          <Link
            href="/app/upgrade"
            className="flex items-center gap-4 p-4 rounded-2xl bg-gradient-to-r from-primary-500 to-pink-500 shadow-lg shadow-primary-500/25 group"
          >
            <div className="w-12 h-12 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
              <Crown className="h-6 w-6 text-white" />
            </div>
            <div className="flex-1">
              <span className="font-semibold text-white">Upgrade to Premium</span>
              <p className="text-sm text-white/70">Unlock all features</p>
            </div>
            <ChevronRight className="w-5 h-5 text-white/70 group-hover:translate-x-1 transition-transform" />
          </Link>
        )}

        {isPremium && (
          <button
            onClick={handleManageSubscription}
            className="w-full flex items-center gap-4 p-4 glass rounded-2xl border border-pink-100/50 hover:border-pink-200 transition-all text-left group"
          >
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary-100 to-pink-100 flex items-center justify-center">
              <Settings className="h-6 w-6 text-primary-600" />
            </div>
            <div className="flex-1">
              <span className="font-semibold text-sage-900">Manage Subscription</span>
              <p className="text-sm text-sage-500">Billing & payment</p>
            </div>
            <ChevronRight className="w-5 h-5 text-sage-400 group-hover:translate-x-1 transition-transform" />
          </button>
        )}

        <Link
          href="/app/settings"
          className="flex items-center gap-4 p-4 glass rounded-2xl border border-pink-100/50 hover:border-pink-200 transition-all group"
        >
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-pink-100 to-primary-100 flex items-center justify-center">
            <DreamCatcher className="h-6 w-7 text-primary-600" />
          </div>
          <div className="flex-1">
            <span className="font-semibold text-sage-900">Update Preferences</span>
            <p className="text-sm text-sage-500">Customize your experience</p>
          </div>
          <ChevronRight className="w-5 h-5 text-sage-400 group-hover:translate-x-1 transition-transform" />
        </Link>

        <a
          href="mailto:support@joginana.com"
          className="flex items-center gap-4 p-4 glass rounded-2xl border border-pink-100/50 hover:border-pink-200 transition-all group"
        >
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary-100 to-pink-100 flex items-center justify-center">
            <HelpCircle className="h-6 w-6 text-primary-600" />
          </div>
          <div className="flex-1">
            <span className="font-semibold text-sage-900">Help & Support</span>
            <p className="text-sm text-sage-500">Get assistance</p>
          </div>
          <ChevronRight className="w-5 h-5 text-sage-400 group-hover:translate-x-1 transition-transform" />
        </a>

        <button
          onClick={handleSignOut}
          className="w-full flex items-center gap-4 p-4 rounded-2xl bg-gradient-to-r from-red-50 to-pink-50 border border-red-100 hover:border-red-200 transition-all text-left group"
        >
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-red-100 to-pink-100 flex items-center justify-center">
            <LogOut className="h-6 w-6 text-red-500" />
          </div>
          <div className="flex-1">
            <span className="font-semibold text-red-600">Sign Out</span>
            <p className="text-sm text-red-400">See you soon!</p>
          </div>
          <ChevronRight className="w-5 h-5 text-red-300 group-hover:translate-x-1 transition-transform" />
        </button>
      </div>

      {/* App Version */}
      <div className="mt-8 text-center">
        <div className="inline-flex items-center gap-2 opacity-50">
          <LotusFlower className="w-4 h-4 text-pink-400" />
          <span className="text-xs text-sage-500 font-medium">JoginAna v1.0.0</span>
        </div>
      </div>
    </div>
  );
}
