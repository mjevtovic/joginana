import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { ArrowRight, Calendar, Play, Sparkles, Flame, Target, Heart, Sun, Moon, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { LotusFlower, DreamCatcher, OmSymbol } from "@/components/ui/decorations";

export default async function AppHomePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user!.id)
    .single();

  const firstName = profile?.full_name?.split(" ")[0] || "Yogi";

  // Get time of day for greeting
  const hour = new Date().getHours();
  const timeGreeting = hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening";
  const TimeIcon = hour < 12 ? Sun : hour < 18 ? Zap : Moon;

  return (
    <div className="px-4 pt-6 pb-8">
      {/* Header with greeting */}
      <div className="mb-8 relative">
        <div className="absolute -top-2 -right-2 opacity-20">
          <LotusFlower className="w-24 h-24 text-pink-400 animate-float" />
        </div>

        <div className="flex items-center gap-2 text-pink-500 mb-1">
          <TimeIcon className="w-4 h-4" />
          <span className="text-sm font-medium">{timeGreeting}</span>
        </div>

        <h1 className="font-display text-3xl font-bold text-gradient mb-1">
          {firstName}
        </h1>
        <p className="text-sage-600 flex items-center gap-2">
          <span>Ready for your practice?</span>
          <LotusFlower className="w-4 h-4 text-pink-400 inline-block" />
        </p>
      </div>

      {/* Quick Actions - Modern card design */}
      <div className="grid grid-cols-2 gap-4 mb-8">
        <Link href="/app/classes" className="group">
          <div className="relative overflow-hidden rounded-3xl p-6 bg-gradient-to-br from-primary-500 to-pink-500 shadow-xl shadow-primary-500/25 transition-all duration-300 group-hover:shadow-2xl group-hover:shadow-primary-500/40 group-hover:scale-[1.02]">
            {/* Decorative elements */}
            <div className="absolute -top-4 -right-4 opacity-20">
              <OmSymbol className="w-20 h-20 text-white" />
            </div>

            <div className="relative">
              <div className="w-14 h-14 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <Play className="h-7 w-7 text-white" />
              </div>
              <span className="font-display font-bold text-white text-lg">Start Class</span>
              <p className="text-white/70 text-sm mt-1">Find your flow</p>
            </div>
          </div>
        </Link>

        <Link href="/app/plan" className="group">
          <div className="relative overflow-hidden rounded-3xl p-6 glass border border-pink-200/50 shadow-lg transition-all duration-300 group-hover:shadow-xl group-hover:border-pink-300 group-hover:scale-[1.02]">
            {/* Decorative elements */}
            <div className="absolute -bottom-4 -right-4 opacity-10">
              <DreamCatcher className="w-24 h-28 text-primary-500" />
            </div>

            <div className="relative">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary-100 to-pink-100 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <Calendar className="h-7 w-7 text-primary-600" />
              </div>
              <span className="font-display font-bold text-sage-900 text-lg">Weekly Plan</span>
              <p className="text-sage-500 text-sm mt-1">Your journey</p>
            </div>
          </div>
        </Link>
      </div>

      {/* Today's Recommended Session */}
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-4">
          <div className="p-1.5 rounded-lg bg-gradient-to-br from-amber-100 to-orange-100">
            <Sparkles className="h-4 w-4 text-amber-600" />
          </div>
          <h2 className="font-display font-semibold text-sage-900">Recommended for You</h2>
        </div>

        <div className="relative overflow-hidden rounded-3xl">
          {/* Gradient background */}
          <div className="absolute inset-0 bg-gradient-to-br from-primary-600 via-primary-500 to-pink-500" />

          {/* Decorative pattern */}
          <div className="absolute inset-0 bg-pattern-mandala opacity-10" />

          {/* Floating decorations */}
          <div className="absolute top-4 right-4 opacity-30">
            <LotusFlower className="w-16 h-16 text-white animate-float" />
          </div>
          <div className="absolute bottom-4 left-4 opacity-20">
            <OmSymbol className="w-12 h-12 text-white" />
          </div>

          <div className="relative p-6">
            <div className="flex items-center gap-2 mb-2">
              <span className="px-3 py-1 rounded-full bg-white/20 backdrop-blur-sm text-white/90 text-xs font-medium">
                30 min
              </span>
              <span className="px-3 py-1 rounded-full bg-white/20 backdrop-blur-sm text-white/90 text-xs font-medium">
                Beginner
              </span>
            </div>

            <h3 className="font-display text-2xl font-bold text-white mb-2">
              Morning Flow Yoga
            </h3>
            <p className="text-white/70 text-sm mb-6">
              Start your day with gentle stretches and mindful breathing
            </p>

            <Link href="/app/classes">
              <Button className="bg-white text-primary-600 hover:bg-white/90 shadow-lg shadow-black/10 rounded-xl px-6">
                Start Now
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Stats Section */}
      <div className="mb-8">
        <h2 className="font-display font-semibold text-sage-900 mb-4 flex items-center gap-2">
          <Target className="w-4 h-4 text-primary-500" />
          Your Progress
        </h2>

        <div className="grid grid-cols-3 gap-3">
          <div className="relative overflow-hidden rounded-2xl p-4 glass border border-pink-100/50 text-center group hover:border-pink-200 transition-all">
            <div className="absolute -top-2 -right-2 opacity-10">
              <Flame className="w-12 h-12 text-orange-500" />
            </div>
            <div className="relative">
              <p className="text-3xl font-bold text-gradient">0</p>
              <p className="text-xs text-sage-500 mt-1">This Week</p>
            </div>
          </div>

          <div className="relative overflow-hidden rounded-2xl p-4 glass border border-pink-100/50 text-center group hover:border-pink-200 transition-all">
            <div className="absolute -top-2 -right-2 opacity-10">
              <Play className="w-12 h-12 text-primary-500" />
            </div>
            <div className="relative">
              <p className="text-3xl font-bold text-gradient">0</p>
              <p className="text-xs text-sage-500 mt-1">Total Classes</p>
            </div>
          </div>

          <div className="relative overflow-hidden rounded-2xl p-4 glass border border-pink-100/50 text-center group hover:border-pink-200 transition-all">
            <div className="absolute -top-2 -right-2 opacity-10">
              <Heart className="w-12 h-12 text-pink-500" />
            </div>
            <div className="relative">
              <p className="text-3xl font-bold text-gradient">0</p>
              <p className="text-xs text-sage-500 mt-1">Day Streak</p>
            </div>
          </div>
        </div>
      </div>

      {/* Motivational Quote */}
      <div className="relative overflow-hidden rounded-3xl p-6 bg-gradient-to-br from-pink-50 to-primary-50 border border-pink-100/50">
        <div className="absolute top-2 right-2 opacity-20">
          <DreamCatcher className="w-20 h-24 text-primary-400" />
        </div>

        <div className="relative">
          <LotusFlower className="w-8 h-8 text-pink-400 mb-3" />
          <p className="font-display text-lg text-sage-800 italic mb-2">
            "The body benefits from movement, and the mind benefits from stillness."
          </p>
          <p className="text-sm text-sage-500">— Sakyong Mipham</p>
        </div>
      </div>
    </div>
  );
}
