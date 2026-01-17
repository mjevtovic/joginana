import { redirect } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { QuizForm } from "@/components/planner/quiz-form";

export default async function PlannerOnboardingPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login?redirectTo=/planner/onboarding");
  }

  // Check subscription
  const { data: profile } = await supabase
    .from("profiles")
    .select("subscription_status")
    .eq("id", user.id)
    .single();

  if (profile?.subscription_status !== "active") {
    redirect("/pricing");
  }

  // Check if already completed quiz
  const { data: existingQuiz } = await supabase
    .from("quiz_responses")
    .select("id")
    .eq("user_id", user.id)
    .single();

  if (existingQuiz) {
    redirect("/planner");
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-sage-50 to-white">
      <div className="mx-auto max-w-3xl px-4 py-12">
        <Link
          href="/planner"
          className="inline-flex items-center text-sm text-sage-600 hover:text-sage-900 mb-8"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to planner
        </Link>

        <div className="text-center mb-12">
          <h1 className="font-display text-3xl font-bold text-sage-900">
            Let&apos;s Personalize Your Practice
          </h1>
          <p className="mt-2 text-sage-600">
            Answer a few questions so we can create your perfect weekly plan
          </p>
        </div>

        <QuizForm userId={user.id} />
      </div>
    </div>
  );
}
