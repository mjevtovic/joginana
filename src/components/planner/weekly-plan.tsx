"use client";

import { useState } from "react";
import Link from "next/link";
import { Check, Clock, Play, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";
import { formatDuration, capitalize } from "@/lib/utils";
import type { PlannedSessionWithClass } from "@/types/database";

interface WeeklyPlanProps {
  sessions: PlannedSessionWithClass[];
  planId: string;
}

const dayNames = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];

export function WeeklyPlan({ sessions: initialSessions, planId }: WeeklyPlanProps) {
  const [sessions, setSessions] = useState(initialSessions);
  const supabase = createClient();

  const toggleComplete = async (sessionId: string, completed: boolean) => {
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

  // Group sessions by day
  const sessionsByDay = dayNames.map((dayName, index) => ({
    name: dayName,
    sessions: sessions.filter((s) => s.day_of_week === index),
  }));

  const completedCount = sessions.filter((s) => s.completed).length;
  const totalCount = sessions.length;
  const progressPercent = totalCount > 0 ? (completedCount / totalCount) * 100 : 0;

  return (
    <div>
      {/* Progress bar */}
      <div className="bg-white rounded-xl border border-sage-200 p-6 mb-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="font-semibold text-sage-900">Weekly Progress</h2>
            <p className="text-sm text-sage-600">
              {completedCount} of {totalCount} sessions completed
            </p>
          </div>
          <span className="text-2xl font-bold text-primary-600">
            {Math.round(progressPercent)}%
          </span>
        </div>
        <div className="h-3 bg-sage-100 rounded-full overflow-hidden">
          <div
            className="h-full bg-primary-600 rounded-full transition-all duration-500"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      {/* Weekly calendar */}
      <div className="space-y-4">
        {sessionsByDay.map((day) => (
          <div
            key={day.name}
            className="bg-white rounded-xl border border-sage-200 overflow-hidden"
          >
            <div className="px-6 py-4 bg-sage-50 border-b border-sage-200">
              <h3 className="font-semibold text-sage-900">{day.name}</h3>
            </div>

            {day.sessions.length === 0 ? (
              <div className="px-6 py-8 text-center text-sage-500">
                Rest day
              </div>
            ) : (
              <div className="divide-y divide-sage-100">
                {day.sessions.map((session) => (
                  <div
                    key={session.id}
                    className={cn(
                      "p-4 flex items-center gap-4 transition-colors",
                      session.completed && "bg-green-50"
                    )}
                  >
                    <button
                      onClick={() => toggleComplete(session.id, session.completed)}
                      className={cn(
                        "flex-shrink-0 w-8 h-8 rounded-full border-2 flex items-center justify-center transition-colors",
                        session.completed
                          ? "bg-green-500 border-green-500 text-white"
                          : "border-sage-300 hover:border-primary-400"
                      )}
                    >
                      {session.completed && <Check className="h-4 w-4" />}
                    </button>

                    <div className="flex-1 min-w-0">
                      <Link
                        href={`/app/classes/${session.class_id}`}
                        className={cn(
                          "font-medium hover:text-primary-600 transition-colors",
                          session.completed
                            ? "text-sage-600 line-through"
                            : "text-sage-900"
                        )}
                      >
                        {session.class.title}
                      </Link>
                      <div className="flex items-center gap-3 mt-1 text-sm text-sage-500">
                        {session.class.difficulty && (
                          <span>{capitalize(session.class.difficulty)}</span>
                        )}
                        {session.class.duration_minutes && (
                          <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {formatDuration(session.class.duration_minutes)}
                          </span>
                        )}
                      </div>
                    </div>

                    {!session.completed && (
                      <Link href={`/app/classes/${session.class_id}`}>
                        <Button size="sm" variant="outline">
                          <Play className="h-4 w-4 mr-1" />
                          Start
                        </Button>
                      </Link>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
