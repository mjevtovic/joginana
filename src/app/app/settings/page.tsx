"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Check, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";
import { LotusFlower, DreamCatcher } from "@/components/ui/decorations";

const experienceLevels = [
  { value: "beginner", label: "Beginner", description: "New to yoga" },
  { value: "intermediate", label: "Intermediate", description: "Some experience" },
  { value: "advanced", label: "Advanced", description: "Regular practitioner" },
];

const goals = [
  { value: "flexibility", label: "Flexibility" },
  { value: "strength", label: "Strength" },
  { value: "relaxation", label: "Relaxation" },
  { value: "mindfulness", label: "Mindfulness" },
  { value: "weight_loss", label: "Weight Loss" },
  { value: "energy", label: "More Energy" },
];

const days = [
  { value: "monday", label: "Mon" },
  { value: "tuesday", label: "Tue" },
  { value: "wednesday", label: "Wed" },
  { value: "thursday", label: "Thu" },
  { value: "friday", label: "Fri" },
  { value: "saturday", label: "Sat" },
  { value: "sunday", label: "Sun" },
];

const durations = [
  { value: 15, label: "15 min" },
  { value: 30, label: "30 min" },
  { value: 45, label: "45 min" },
  { value: 60, label: "60 min" },
];

export default function AppSettingsPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [experienceLevel, setExperienceLevel] = useState("beginner");
  const [selectedGoals, setSelectedGoals] = useState<string[]>([]);
  const [availableDays, setAvailableDays] = useState<string[]>([]);
  const [preferredDuration, setPreferredDuration] = useState(30);

  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    async function loadPreferences() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: quiz } = await supabase
        .from("quiz_responses")
        .select("*")
        .eq("user_id", user.id)
        .single();

      if (quiz) {
        setExperienceLevel(quiz.experience_level || "beginner");
        setSelectedGoals(quiz.goals || []);
        setAvailableDays(quiz.available_days || []);
        setPreferredDuration(quiz.preferred_duration || 30);
      }

      setLoading(false);
    }

    loadPreferences();
  }, [supabase]);

  const toggleGoal = (goal: string) => {
    setSelectedGoals(prev =>
      prev.includes(goal)
        ? prev.filter(g => g !== goal)
        : [...prev, goal]
    );
  };

  const toggleDay = (day: string) => {
    setAvailableDays(prev =>
      prev.includes(day)
        ? prev.filter(d => d !== day)
        : [...prev, day]
    );
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      await supabase
        .from("quiz_responses")
        .upsert({
          user_id: user.id,
          experience_level: experienceLevel,
          goals: selectedGoals,
          available_days: availableDays,
          preferred_duration: preferredDuration,
          updated_at: new Date().toISOString(),
        });

      router.push("/app/profile");
    } catch (error) {
      console.error("Error saving preferences:", error);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <div className="relative">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-pink-200 border-t-primary-500" />
          <LotusFlower className="absolute inset-0 m-auto w-8 h-8 text-pink-400 animate-pulse" />
        </div>
        <p className="text-sage-500 animate-pulse">Loading preferences...</p>
      </div>
    );
  }

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
      <div className="mb-8 relative">
        <div className="absolute top-0 right-0 opacity-15">
          <DreamCatcher className="w-20 h-24 text-primary-500" />
        </div>
        <h1 className="font-display text-2xl font-bold text-gradient mb-1">
          Your Preferences
        </h1>
        <p className="text-sage-600 text-sm">
          Customize your yoga experience
        </p>
      </div>

      {/* Experience Level */}
      <div className="mb-8">
        <h2 className="font-semibold text-sage-900 mb-3">Experience Level</h2>
        <div className="grid grid-cols-3 gap-2">
          {experienceLevels.map((level) => (
            <button
              key={level.value}
              onClick={() => setExperienceLevel(level.value)}
              className={`p-3 rounded-2xl border text-center transition-all ${
                experienceLevel === level.value
                  ? "bg-gradient-to-br from-primary-500 to-pink-500 border-transparent text-white shadow-lg"
                  : "glass border-pink-100/50 text-sage-700 hover:border-pink-200"
              }`}
            >
              <p className="font-medium text-sm">{level.label}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Goals */}
      <div className="mb-8">
        <h2 className="font-semibold text-sage-900 mb-3">Your Goals</h2>
        <div className="flex flex-wrap gap-2">
          {goals.map((goal) => (
            <button
              key={goal.value}
              onClick={() => toggleGoal(goal.value)}
              className={`px-4 py-2 rounded-full border transition-all ${
                selectedGoals.includes(goal.value)
                  ? "bg-gradient-to-r from-primary-500 to-pink-500 border-transparent text-white shadow-md"
                  : "glass border-pink-100/50 text-sage-700 hover:border-pink-200"
              }`}
            >
              <span className="text-sm font-medium">{goal.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Available Days */}
      <div className="mb-8">
        <h2 className="font-semibold text-sage-900 mb-3">Practice Days</h2>
        <div className="flex gap-2">
          {days.map((day) => (
            <button
              key={day.value}
              onClick={() => toggleDay(day.value)}
              className={`flex-1 py-3 rounded-xl border transition-all ${
                availableDays.includes(day.value)
                  ? "bg-gradient-to-br from-primary-500 to-pink-500 border-transparent text-white shadow-md"
                  : "glass border-pink-100/50 text-sage-600 hover:border-pink-200"
              }`}
            >
              <span className="text-xs font-medium">{day.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Preferred Duration */}
      <div className="mb-8">
        <h2 className="font-semibold text-sage-900 mb-3">Session Length</h2>
        <div className="grid grid-cols-4 gap-2">
          {durations.map((duration) => (
            <button
              key={duration.value}
              onClick={() => setPreferredDuration(duration.value)}
              className={`py-3 rounded-xl border transition-all ${
                preferredDuration === duration.value
                  ? "bg-gradient-to-br from-primary-500 to-pink-500 border-transparent text-white shadow-md"
                  : "glass border-pink-100/50 text-sage-700 hover:border-pink-200"
              }`}
            >
              <span className="text-sm font-medium">{duration.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Save Button */}
      <Button
        onClick={handleSave}
        disabled={saving}
        className="w-full bg-gradient-to-r from-primary-500 to-pink-500 text-white py-6 rounded-2xl shadow-lg shadow-primary-500/25"
      >
        {saving ? (
          <span className="flex items-center gap-2">
            <Loader2 className="w-5 h-5 animate-spin" />
            Saving...
          </span>
        ) : (
          <span className="flex items-center gap-2">
            <Check className="w-5 h-5" />
            Save Preferences
          </span>
        )}
      </Button>
    </div>
  );
}
