import { redirect } from "next/navigation";
import Link from "next/link";
import { Calendar, Lock, RefreshCw, Sparkles } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { Button } from "@/components/ui/button";
import { WeeklyPlan } from "@/components/planner/weekly-plan";
import type { PlannedSessionWithClass, YogaClass } from "@/types/database";

function getWeekStart(date: Date): string {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day;
  d.setDate(diff);
  d.setHours(0, 0, 0, 0);
  return d.toISOString().split("T")[0];
}

export default async function PlannerPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login?redirectTo=/planner");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  // Check subscription - planner is premium only
  const isSubscribed = profile?.subscription_status === "active";

  if (!isSubscribed) {
    return (
      <div className="min-h-screen">
        <Header user={profile} />
        <main className="pt-24 pb-16">
          <div className="mx-auto max-w-2xl px-4 lg:px-8 text-center">
            <div className="bg-white rounded-2xl border border-sage-200 p-12">
              <Lock className="h-16 w-16 mx-auto text-sage-300" />
              <h1 className="mt-6 font-display text-2xl font-bold text-sage-900">
                Unlock Your Personal Planner
              </h1>
              <p className="mt-4 text-sage-600">
                Get AI-powered weekly plans tailored to your goals, schedule,
                and experience level. Subscribe to access the planner and all
                premium features.
              </p>
              <Link href="/pricing" className="inline-block mt-8">
                <Button size="lg">
                  <Sparkles className="mr-2 h-5 w-5" />
                  View Plans
                </Button>
              </Link>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  // Check for quiz completion
  const { data: quizResponse } = await supabase
    .from("quiz_responses")
    .select("*")
    .eq("user_id", user.id)
    .single();

  if (!quizResponse) {
    redirect("/planner/onboarding");
  }

  // Get or create current week's plan
  const weekStart = getWeekStart(new Date());

  let { data: weeklyPlan } = await supabase
    .from("weekly_plans")
    .select("*")
    .eq("user_id", user.id)
    .eq("week_start", weekStart)
    .single();

  // If no plan exists, generate one
  if (!weeklyPlan) {
    // Get available classes matching preferences
    const { data: classes } = await supabase
      .from("classes")
      .select("*")
      .eq("difficulty", quizResponse.experience_level)
      .lte("duration_minutes", (quizResponse.preferred_duration || 30) + 15)
      .gte("duration_minutes", (quizResponse.preferred_duration || 30) - 15);

    if (classes && classes.length > 0) {
      // Create plan
      const { data: newPlan } = await supabase
        .from("weekly_plans")
        .insert({
          user_id: user.id,
          week_start: weekStart,
        })
        .select()
        .single();

      if (newPlan) {
        weeklyPlan = newPlan;

        // Map days to numbers
        const dayMap: Record<string, number> = {
          sunday: 0,
          monday: 1,
          tuesday: 2,
          wednesday: 3,
          thursday: 4,
          friday: 5,
          saturday: 6,
        };

        const availableDays = (quizResponse.available_days || [])
          .map((d: string) => dayMap[d.toLowerCase()])
          .filter((d: number | undefined) => d !== undefined);

        // Create sessions for each available day
        const sessionsToInsert = availableDays.map((dayOfWeek: number, index: number) => ({
          plan_id: newPlan.id,
          class_id: classes[index % classes.length].id,
          day_of_week: dayOfWeek,
          completed: false,
        }));

        await supabase.from("planned_sessions").insert(sessionsToInsert);
      }
    }
  }

  // Get sessions with class details
  let sessions: PlannedSessionWithClass[] = [];

  if (weeklyPlan) {
    const { data: sessionsData } = await supabase
      .from("planned_sessions")
      .select("*, classes(*)")
      .eq("plan_id", weeklyPlan.id)
      .order("day_of_week");

    if (sessionsData) {
      sessions = sessionsData.map((s) => ({
        ...s,
        class: s.classes as unknown as YogaClass,
      }));
    }
  }

  return (
    <div className="min-h-screen">
      <Header user={profile} />

      <main className="pt-24 pb-16">
        <div className="mx-auto max-w-3xl px-4 lg:px-8">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="font-display text-3xl font-bold text-sage-900">
                Your Weekly Plan
              </h1>
              <p className="mt-2 text-sage-600">
                Week of {new Date(weekStart).toLocaleDateString("en-US", {
                  month: "long",
                  day: "numeric",
                })}
              </p>
            </div>
            <div className="flex gap-3">
              <Link href="/planner/onboarding">
                <Button variant="outline" size="sm">
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Retake Quiz
                </Button>
              </Link>
            </div>
          </div>

          {sessions.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-xl border border-sage-200">
              <Calendar className="h-16 w-16 mx-auto text-sage-300" />
              <h2 className="mt-4 text-xl font-semibold text-sage-900">
                No classes scheduled
              </h2>
              <p className="mt-2 text-sage-600">
                We couldn&apos;t find classes matching your preferences. Try
                updating your quiz responses.
              </p>
              <Link href="/planner/onboarding" className="inline-block mt-6">
                <Button>Update Preferences</Button>
              </Link>
            </div>
          ) : (
            <WeeklyPlan sessions={sessions} planId={weeklyPlan!.id} />
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
