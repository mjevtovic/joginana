"use client";

import { useState, useEffect } from "react";
import { Star } from "lucide-react";
import { cn } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";

interface ClassRatingProps {
  classId: string;
  userId?: string;
  showAverage?: boolean;
  size?: "sm" | "md" | "lg";
  readonly?: boolean;
}

export function ClassRating({
  classId,
  userId,
  showAverage = true,
  size = "md",
  readonly = false,
}: ClassRatingProps) {
  const [userRating, setUserRating] = useState<number | null>(null);
  const [hoverRating, setHoverRating] = useState<number | null>(null);
  const [averageRating, setAverageRating] = useState<number | null>(null);
  const [ratingCount, setRatingCount] = useState<number>(0);
  const [loading, setLoading] = useState(false);

  const starSizes = {
    sm: "w-4 h-4",
    md: "w-5 h-5",
    lg: "w-6 h-6",
  };

  const textSizes = {
    sm: "text-xs",
    md: "text-sm",
    lg: "text-base",
  };

  useEffect(() => {
    const fetchRatings = async () => {
      const supabase = createClient();

      // Fetch average rating from the view
      const { data: stats } = await supabase
        .from("class_rating_stats")
        .select("*")
        .eq("class_id", classId)
        .single();

      if (stats) {
        setAverageRating(stats.average_rating);
        setRatingCount(stats.rating_count);
      }

      // Fetch user's rating if logged in
      if (userId) {
        const { data: userRatingData } = await supabase
          .from("class_ratings")
          .select("rating")
          .eq("class_id", classId)
          .eq("user_id", userId)
          .single();

        if (userRatingData) {
          setUserRating(userRatingData.rating);
        }
      }
    };

    fetchRatings();
  }, [classId, userId]);

  const handleRate = async (rating: number) => {
    if (readonly || !userId || loading) return;

    setLoading(true);
    const supabase = createClient();

    try {
      if (userRating) {
        // Update existing rating
        await supabase
          .from("class_ratings")
          .update({ rating })
          .eq("class_id", classId)
          .eq("user_id", userId);
      } else {
        // Insert new rating
        await supabase.from("class_ratings").insert({
          class_id: classId,
          user_id: userId,
          rating,
        });
      }

      setUserRating(rating);

      // Refresh average rating
      const { data: stats } = await supabase
        .from("class_rating_stats")
        .select("*")
        .eq("class_id", classId)
        .single();

      if (stats) {
        setAverageRating(stats.average_rating);
        setRatingCount(stats.rating_count);
      }
    } catch (error) {
      console.error("Failed to rate:", error);
    } finally {
      setLoading(false);
    }
  };

  const displayRating = hoverRating || userRating || 0;
  const isInteractive = !readonly && !!userId;

  return (
    <div className="flex items-center gap-2">
      <div className="flex items-center gap-0.5">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            disabled={!isInteractive || loading}
            onClick={() => handleRate(star)}
            onMouseEnter={() => isInteractive && setHoverRating(star)}
            onMouseLeave={() => setHoverRating(null)}
            className={cn(
              "transition-colors",
              isInteractive && "cursor-pointer hover:scale-110",
              loading && "opacity-50"
            )}
          >
            <Star
              className={cn(
                starSizes[size],
                star <= displayRating
                  ? "fill-yellow-400 text-yellow-400"
                  : "fill-transparent text-gray-300"
              )}
            />
          </button>
        ))}
      </div>

      {showAverage && (
        <div className={cn("text-gray-500", textSizes[size])}>
          {averageRating ? (
            <>
              <span className="font-medium text-gray-700">
                {averageRating.toFixed(1)}
              </span>
              <span className="ml-1">({ratingCount})</span>
            </>
          ) : (
            <span>No ratings yet</span>
          )}
        </div>
      )}
    </div>
  );
}

// Simple display component for showing average rating only
export function ClassRatingDisplay({
  averageRating,
  ratingCount,
  size = "sm",
}: {
  averageRating: number | null;
  ratingCount: number;
  size?: "sm" | "md" | "lg";
}) {
  const starSizes = {
    sm: "w-3.5 h-3.5",
    md: "w-4 h-4",
    lg: "w-5 h-5",
  };

  const textSizes = {
    sm: "text-xs",
    md: "text-sm",
    lg: "text-base",
  };

  if (!averageRating) {
    return null;
  }

  return (
    <div className="flex items-center gap-1.5">
      <div className="flex items-center gap-0.5">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={cn(
              starSizes[size],
              star <= Math.round(averageRating)
                ? "fill-yellow-400 text-yellow-400"
                : "fill-transparent text-gray-300"
            )}
          />
        ))}
      </div>
      <span className={cn("text-gray-500", textSizes[size])}>
        {averageRating.toFixed(1)} ({ratingCount})
      </span>
    </div>
  );
}
