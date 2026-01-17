"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";
import { ArrowLeft, ArrowRight, Check } from "lucide-react";

interface QuizFormProps {
  userId: string;
}

const experienceLevels = [
  {
    value: "beginner",
    label: "Beginner",
    description: "New to yoga or practicing for less than 6 months",
  },
  {
    value: "intermediate",
    label: "Intermediate",
    description: "Practicing for 6 months to 2 years",
  },
  {
    value: "advanced",
    label: "Advanced",
    description: "Practicing for over 2 years",
  },
];

const goals = [
  { value: "flexibility", label: "Improve Flexibility" },
  { value: "strength", label: "Build Strength" },
  { value: "stress", label: "Reduce Stress" },
  { value: "sleep", label: "Better Sleep" },
  { value: "mindfulness", label: "Practice Mindfulness" },
  { value: "fitness", label: "General Fitness" },
];

const daysOfWeek = [
  { value: "monday", label: "Mon" },
  { value: "tuesday", label: "Tue" },
  { value: "wednesday", label: "Wed" },
  { value: "thursday", label: "Thu" },
  { value: "friday", label: "Fri" },
  { value: "saturday", label: "Sat" },
  { value: "sunday", label: "Sun" },
];

const durations = [
  { value: 15, label: "15 min", description: "Quick sessions" },
  { value: 30, label: "30 min", description: "Standard practice" },
  { value: 45, label: "45 min", description: "Extended sessions" },
  { value: 60, label: "60 min", description: "Full practice" },
];

export function QuizForm({ userId }: QuizFormProps) {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [experienceLevel, setExperienceLevel] = useState<string>("");
  const [selectedGoals, setSelectedGoals] = useState<string[]>([]);
  const [availableDays, setAvailableDays] = useState<string[]>([]);
  const [preferredDuration, setPreferredDuration] = useState<number>(30);

  const steps = [
    {
      title: "What's your experience level?",
      subtitle: "This helps us recommend the right classes for you",
    },
    {
      title: "What are your goals?",
      subtitle: "Select all that apply",
    },
    {
      title: "Which days work best for you?",
      subtitle: "We'll build your weekly plan around these days",
    },
    {
      title: "How long do you want to practice?",
      subtitle: "Choose your preferred session length",
    },
  ];

  const canProceed = () => {
    switch (step) {
      case 0:
        return experienceLevel !== "";
      case 1:
        return selectedGoals.length > 0;
      case 2:
        return availableDays.length > 0;
      case 3:
        return preferredDuration > 0;
      default:
        return false;
    }
  };

  const toggleGoal = (goal: string) => {
    setSelectedGoals((prev) =>
      prev.includes(goal) ? prev.filter((g) => g !== goal) : [...prev, goal]
    );
  };

  const toggleDay = (day: string) => {
    setAvailableDays((prev) =>
      prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day]
    );
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);

    const supabase = createClient();

    // Upsert quiz response
    const { error } = await supabase.from("quiz_responses").upsert(
      {
        user_id: userId,
        experience_level: experienceLevel,
        goals: selectedGoals,
        available_days: availableDays,
        preferred_duration: preferredDuration,
      },
      { onConflict: "user_id" }
    );

    if (error) {
      console.error("Error saving quiz:", error);
      setIsSubmitting(false);
      return;
    }

    router.push("/planner");
  };

  return (
    <div className="max-w-xl mx-auto">
      {/* Progress */}
      <div className="flex gap-2 mb-8">
        {steps.map((_, i) => (
          <div
            key={i}
            className={cn(
              "h-1 flex-1 rounded-full transition-colors",
              i <= step ? "bg-primary-600" : "bg-sage-200"
            )}
          />
        ))}
      </div>

      {/* Question */}
      <div className="text-center mb-8">
        <h2 className="font-display text-2xl font-bold text-sage-900">
          {steps[step].title}
        </h2>
        <p className="mt-2 text-sage-600">{steps[step].subtitle}</p>
      </div>

      {/* Options */}
      <div className="space-y-4">
        {step === 0 && (
          <div className="space-y-3">
            {experienceLevels.map((level) => (
              <button
                key={level.value}
                onClick={() => setExperienceLevel(level.value)}
                className={cn(
                  "w-full p-4 rounded-xl border-2 text-left transition-colors",
                  experienceLevel === level.value
                    ? "border-primary-600 bg-primary-50"
                    : "border-sage-200 hover:border-primary-300"
                )}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-sage-900">{level.label}</p>
                    <p className="text-sm text-sage-600">{level.description}</p>
                  </div>
                  {experienceLevel === level.value && (
                    <Check className="h-5 w-5 text-primary-600" />
                  )}
                </div>
              </button>
            ))}
          </div>
        )}

        {step === 1 && (
          <div className="grid grid-cols-2 gap-3">
            {goals.map((goal) => (
              <button
                key={goal.value}
                onClick={() => toggleGoal(goal.value)}
                className={cn(
                  "p-4 rounded-xl border-2 text-center transition-colors",
                  selectedGoals.includes(goal.value)
                    ? "border-primary-600 bg-primary-50"
                    : "border-sage-200 hover:border-primary-300"
                )}
              >
                <p className="font-medium text-sage-900">{goal.label}</p>
              </button>
            ))}
          </div>
        )}

        {step === 2 && (
          <div className="flex flex-wrap justify-center gap-3">
            {daysOfWeek.map((day) => (
              <button
                key={day.value}
                onClick={() => toggleDay(day.value)}
                className={cn(
                  "w-14 h-14 rounded-full border-2 font-medium transition-colors",
                  availableDays.includes(day.value)
                    ? "border-primary-600 bg-primary-600 text-white"
                    : "border-sage-200 text-sage-700 hover:border-primary-300"
                )}
              >
                {day.label}
              </button>
            ))}
          </div>
        )}

        {step === 3 && (
          <div className="grid grid-cols-2 gap-3">
            {durations.map((duration) => (
              <button
                key={duration.value}
                onClick={() => setPreferredDuration(duration.value)}
                className={cn(
                  "p-4 rounded-xl border-2 text-center transition-colors",
                  preferredDuration === duration.value
                    ? "border-primary-600 bg-primary-50"
                    : "border-sage-200 hover:border-primary-300"
                )}
              >
                <p className="text-2xl font-bold text-sage-900">
                  {duration.label}
                </p>
                <p className="text-sm text-sage-600">{duration.description}</p>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Navigation */}
      <div className="flex justify-between mt-10">
        <Button
          variant="ghost"
          onClick={() => setStep(step - 1)}
          disabled={step === 0}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>

        {step < steps.length - 1 ? (
          <Button onClick={() => setStep(step + 1)} disabled={!canProceed()}>
            Next
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        ) : (
          <Button
            onClick={handleSubmit}
            disabled={!canProceed()}
            isLoading={isSubmitting}
          >
            Create My Plan
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        )}
      </div>
    </div>
  );
}
