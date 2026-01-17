"use client";

import { cn } from "@/lib/utils";

interface ClassFiltersProps {
  selectedDifficulty: string | null;
  selectedStyle: string | null;
  selectedDuration: string | null;
  onDifficultyChange: (value: string | null) => void;
  onStyleChange: (value: string | null) => void;
  onDurationChange: (value: string | null) => void;
  styles: string[];
}

const difficulties = [
  { value: "beginner", label: "Beginner" },
  { value: "intermediate", label: "Intermediate" },
  { value: "advanced", label: "Advanced" },
];

const durations = [
  { value: "short", label: "Under 20 min" },
  { value: "medium", label: "20-45 min" },
  { value: "long", label: "Over 45 min" },
];

export function ClassFilters({
  selectedDifficulty,
  selectedStyle,
  selectedDuration,
  onDifficultyChange,
  onStyleChange,
  onDurationChange,
  styles,
}: ClassFiltersProps) {
  return (
    <div className="space-y-6">
      {/* Difficulty */}
      <div>
        <h3 className="text-sm font-medium text-sage-900 mb-3">Difficulty</h3>
        <div className="flex flex-wrap gap-2">
          {difficulties.map((diff) => (
            <button
              key={diff.value}
              onClick={() =>
                onDifficultyChange(
                  selectedDifficulty === diff.value ? null : diff.value
                )
              }
              className={cn(
                "px-3 py-1.5 text-sm rounded-full border transition-colors",
                selectedDifficulty === diff.value
                  ? "bg-primary-600 text-white border-primary-600"
                  : "border-sage-300 text-sage-700 hover:border-primary-400"
              )}
            >
              {diff.label}
            </button>
          ))}
        </div>
      </div>

      {/* Style */}
      {styles.length > 0 && (
        <div>
          <h3 className="text-sm font-medium text-sage-900 mb-3">Style</h3>
          <div className="flex flex-wrap gap-2">
            {styles.map((style) => (
              <button
                key={style}
                onClick={() =>
                  onStyleChange(selectedStyle === style ? null : style)
                }
                className={cn(
                  "px-3 py-1.5 text-sm rounded-full border transition-colors",
                  selectedStyle === style
                    ? "bg-primary-600 text-white border-primary-600"
                    : "border-sage-300 text-sage-700 hover:border-primary-400"
                )}
              >
                {style}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Duration */}
      <div>
        <h3 className="text-sm font-medium text-sage-900 mb-3">Duration</h3>
        <div className="flex flex-wrap gap-2">
          {durations.map((dur) => (
            <button
              key={dur.value}
              onClick={() =>
                onDurationChange(
                  selectedDuration === dur.value ? null : dur.value
                )
              }
              className={cn(
                "px-3 py-1.5 text-sm rounded-full border transition-colors",
                selectedDuration === dur.value
                  ? "bg-primary-600 text-white border-primary-600"
                  : "border-sage-300 text-sage-700 hover:border-primary-400"
              )}
            >
              {dur.label}
            </button>
          ))}
        </div>
      </div>

      {/* Clear filters */}
      {(selectedDifficulty || selectedStyle || selectedDuration) && (
        <button
          onClick={() => {
            onDifficultyChange(null);
            onStyleChange(null);
            onDurationChange(null);
          }}
          className="text-sm text-primary-600 hover:underline"
        >
          Clear all filters
        </button>
      )}
    </div>
  );
}
