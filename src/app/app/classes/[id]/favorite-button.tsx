"use client";

import { useState } from "react";
import { Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";

interface FavoriteButtonProps {
  classId: string;
  userId: string;
  initialIsFavorite: boolean;
}

export function FavoriteButton({
  classId,
  userId,
  initialIsFavorite,
}: FavoriteButtonProps) {
  const [isFavorite, setIsFavorite] = useState(initialIsFavorite);
  const [isLoading, setIsLoading] = useState(false);

  const toggleFavorite = async () => {
    setIsLoading(true);
    const supabase = createClient();

    if (isFavorite) {
      await supabase
        .from("favorites")
        .delete()
        .eq("user_id", userId)
        .eq("class_id", classId);
      setIsFavorite(false);
    } else {
      await supabase.from("favorites").insert({
        user_id: userId,
        class_id: classId,
      });
      setIsFavorite(true);
    }

    setIsLoading(false);
  };

  return (
    <Button
      variant={isFavorite ? "primary" : "outline"}
      onClick={toggleFavorite}
      disabled={isLoading}
    >
      <Heart
        className={cn(
          "mr-2 h-4 w-4",
          isFavorite && "fill-current"
        )}
      />
      {isFavorite ? "Saved" : "Save to Favorites"}
    </Button>
  );
}
