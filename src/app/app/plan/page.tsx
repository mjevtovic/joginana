"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import type { Profile, WeeklyPlan, PlannedSession, YogaClass } from "@/types/database";
import { Calendar, CheckCircle2, Circle, Lock, Sparkles, Trophy, Target } from "lucide-react";
import Link from "next/link";
import { LotusFlower, DreamCatcher, OmSymbol, Mandala } from "@/components/ui/decorations";

const DAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
const SHORT_DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

type SessionWithClass = PlannedSession & { class: YogaClass };

export default function AppPlanPage() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [currentPlan, setCurrentPlan] = useState<WeeklyPlan | null>(null);
  const [sessions, setSessions] = useState<SessionWithClass[]>([]);
  const [loading, setLoading] = useState(true);

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

        // Get current week's plan
        const today = new Date();
        const dayOfWeek = today.getDay();
        const weekStart = new Date(today);
        weekStart.setDate(today.getDate() - dayOfWeek);
        const weekStartStr = weekStart.toISOString().split("T")[0];

        const { data: planData } = await supabase
          .from("weekly_plans")
          .select("*")
          .eq("user_id", user.id)
          .eq("week_start", weekStartStr)
          .single();

        if (planData) {
          setCurrentPlan(planData as WeeklyPlan);

          // Get planned sessions with class details
          const { data: sessionsData } = await supabase
            .from("planned_sessions")
            .select("*, class:classes(*)")
            .eq("plan_id", planData.id)
            .order("day_of_week");

          if (sessionsData) {
            setSessions(sessionsData as SessionWithClass[]);
          }
        }
      }

      setLoading(false);
    }

    loadData();
  }, [supabase]);

  const toggleSession = async (sessionId: string, completed: boolean) => {
    if (!isPremium) return;

    await supabase
      .from("planned_sessions")
      .update({
        completed: !completed,
        completed_at: !completed ? new Date().toISOString() : null,
      })
      .eq("id", sessionId);

    setSessions((prev) =>
      prev.map((s) =>
        s.id === sessionId
          ? { ...s, completed: !completed, completed_at: !completed ? new Date().toISOString() : null }
          : s
      )
    );
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <div className="relative">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-pink-200 border-t-primary-500" />
          <Mandala className="absolute inset-0 m-auto w-8 h-8 text-primary-400 animate-pulse" />
        </div>
        <p className="text-sage-500 animate-pulse">Loading your journey...</p>
      </div>
    );
  }

  if (!isPremium) {
    return (
      <div className="px-4 pt-6">
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary-500 via-primary-600 to-pink-500 p-8 text-center">
          {/* Decorative elements */}
          <div className="absolute top-4 right-4 opacity-20">
            <LotusFlower className="w-24 h-24 text-white animate-float" />
          </div>
          <div className="absolute bottom-4 left-4 opacity-15">
            <DreamCatcher className="w-20 h-24 text-white" />
          </div>
          <div className="absolute inset-0 bg-pattern-mandala opacity-10" />

          <div className="relative">
            <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
              <Lock className="h-10 w-10 text-white" />
            </div>

            <h1 className="font-display text-3xl font-bold text-white mb-3">
              Weekly Planner
            </h1>
            <p className="text-white/80 mb-8 max-w-xs mx-auto">
              Unlock your personalized weekly yoga plan designed just for you
            </p>

            <Link
              href="/pricing"
              className="inline-flex items-center px-8 py-4 bg-white text-primary-600 font-semibold rounded-2xl hover:bg-white/90 transition-all shadow-xl shadow-black/10"
            >
              <Sparkles className="mr-2 h-5 w-5" />
              Upgrade to Premium
            </Link>
          </div>
        </div>

        {/* Benefits */}
        <div className="mt-8 space-y-4">
          <h2 className="font-display font-semibold text-sage-900">What you'll get:</h2>
          {[
            { icon: Target, text: "Personalized weekly schedule" },
            { icon: Calendar, text: "AI-powered class recommendations" },
            { icon: Trophy, text: "Progress tracking & achievements" },
          ].map((item, i) => (
            <div key={i} className="flex items-center gap-4 p-4 glass rounded-2xl border border-pink-100/50">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary-100 to-pink-100 flex items-center justify-center">
                <item.icon className="w-6 h-6 text-primary-600" />
              </div>
              <span className="font-medium text-sage-800">{item.text}</span>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (!currentPlan) {
    return (
      <div className="px-4 pt-6">
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-pink-50 to-primary-50 border border-pink-100/50 p-8 text-center">
          {/* Decorative elements */}
          <div className="absolute top-4 right-4 opacity-20">
            <DreamCatcher className="w-20 h-24 text-primary-400" />
          </div>
          <div className="absolute bottom-4 left-4 opacity-15">
            <Mandala className="w-24 h-24 text-pink-400" />
          </div>

          <div className="relative">
            <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-to-br from-primary-100 to-pink-100 flex items-center justify-center animate-float">
              <Calendar className="h-10 w-10 text-primary-600" />
            </div>

            <h1 className="font-display text-2xl font-bold text-gradient mb-3">
              Create Your Plan
            </h1>
            <p className="text-sage-600 mb-8 max-w-xs mx-auto">
              Complete a quick quiz to get your personalized weekly yoga journey
            </p>

            <Link
              href="/planner/onboarding"
              className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-primary-500 to-pink-500 text-white font-semibold rounded-2xl hover:from-primary-600 hover:to-pink-600 transition-all shadow-xl shadow-primary-500/25"
            >
              <Sparkles className="mr-2 h-5 w-5" />
              Start Onboarding
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const completedCount = sessions.filter((s) => s.completed).length;
  const totalCount = sessions.length;
  const progressPercent = totalCount > 0 ? (completedCount / totalCount) * 100 : 0;
  const todayIndex = new Date().getDay();

  return (
    <div className="px-4 pt-6 pb-8">
      {/* Header */}
      <div className="mb-6 relative">
        <div className="absolute -top-2 right-0 opacity-15">
          <DreamCatcher className="w-20 h-24 text-primary-500" />
        </div>

        <div className="flex items-center gap-2 mb-1">
          <Calendar className="w-5 h-5 text-pink-500" />
          <h1 className="font-display text-2xl font-bold text-gradient">Your Weekly Plan</h1>
        </div>
        <p className="text-sm text-sage-500">
          {completedCount} of {totalCount} sessions completed
        </p>
      </div>

      {/* Progress Card */}
      <div className="relative overflow-hidden rounded-3xl p-6 mb-6 bg-gradient-to-br from-primary-500 to-pink-500 shadow-xl shadow-primary-500/25">
        <div className="absolute top-2 right-2 opacity-20">
          <LotusFlower className="w-16 h-16 text-white animate-float" />
        </div>

        <div className="relative">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-white/80 text-sm">Weekly Progress</p>
              <p className="text-3xl font-bold text-white">{Math.round(progressPercent)}%</p>
            </div>
            <div className="w-16 h-16 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
              <Trophy className="w-8 h-8 text-white" />
            </div>
          </div>

          {/* Progress bar */}
          <div className="h-3 bg-white/20 rounded-full overflow-hidden">
            <div
              className="h-full bg-white rounded-full transition-all duration-500 ease-out"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>
      </div>

      {/* Week Overview */}
      <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
        {SHORT_DAYS.map((day, index) => {
          const daySessions = sessions.filter((s) => s.day_of_week === index);
          const hasSession = daySessions.length > 0;
          const allCompleted = hasSession && daySessions.every((s) => s.completed);
          const isToday = index === todayIndex;

          return (
            <div
              key={day}
              className={`flex-shrink-0 w-12 h-16 rounded-2xl flex flex-col items-center justify-center transition-all ${
                isToday
                  ? "bg-gradient-to-br from-primary-500 to-pink-500 text-white shadow-lg shadow-primary-500/25"
                  : hasSession
                  ? allCompleted
                    ? "bg-gradient-to-br from-green-100 to-emerald-100 border border-green-200"
                    : "glass border border-pink-100"
                  : "bg-sage-50 border border-sage-100"
              }`}
            >
              <span className={`text-xs font-medium ${isToday ? "text-white/80" : "text-sage-500"}`}>
                {day}
              </span>
              {hasSession && (
                <div className={`w-2 h-2 rounded-full mt-1 ${
                  allCompleted
                    ? "bg-green-500"
                    : isToday
                    ? "bg-white"
                    : "bg-primary-400"
                }`} />
              )}
            </div>
          );
        })}
      </div>

      {/* Sessions by day */}
      <div className="space-y-4">
        {DAYS.map((day, index) => {
          const daySessions = sessions.filter((s) => s.day_of_week === index);
          if (daySessions.length === 0) return null;

          const isToday = index === todayIndex;

          return (
            <div
              key={day}
              className={`rounded-2xl p-5 transition-all ${
                isToday
                  ? "glass border-2 border-primary-200 shadow-lg shadow-primary-500/10"
                  : "glass border border-pink-100/50"
              }`}
            >
              <div className="flex items-center gap-2 mb-4">
                <h2 className={`font-display font-semibold ${isToday ? "text-gradient" : "text-sage-900"}`}>
                  {day}
                </h2>
                {isToday && (
                  <span className="px-2 py-0.5 rounded-full bg-gradient-to-r from-primary-500 to-pink-500 text-white text-xs font-medium">
                    Today
                  </span>
                )}
              </div>

              <div className="space-y-3">
                {daySessions.map((session) => (
                  <div
                    key={session.id}
                    className={`flex items-center gap-4 p-4 rounded-xl transition-all ${
                      session.completed
                        ? "bg-gradient-to-r from-green-50 to-emerald-50 border border-green-100"
                        : "bg-white/50 border border-sage-100 hover:border-pink-200"
                    }`}
                  >
                    <button
                      onClick={() => toggleSession(session.id, session.completed)}
                      className="flex-shrink-0 transition-transform hover:scale-110"
                    >
                      {session.completed ? (
                        <CheckCircle2 className="h-7 w-7 text-green-500" />
                      ) : (
                        <Circle className="h-7 w-7 text-sage-300 hover:text-primary-400" />
                      )}
                    </button>
                    <div className={`flex-1 ${session.completed ? "opacity-60" : ""}`}>
                      <p className={`font-medium text-sage-900 ${session.completed ? "line-through" : ""}`}>
                        {session.class?.title}
                      </p>
                      <p className="text-sm text-sage-500">
                        {session.class?.duration_minutes} min • {session.class?.difficulty}
                      </p>
                    </div>
                    {session.completed && (
                      <LotusFlower className="w-6 h-6 text-green-400" />
                    )}
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
