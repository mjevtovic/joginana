"use client";

import Image from "next/image";
import Link from "next/link";
import { Heart, Clock, Lock, Play, Sparkles, Star, MessageCircle } from "lucide-react";
import { cn, formatDuration, capitalize, formatPrice } from "@/lib/utils";
import type { YogaClass } from "@/types/database";
import { LotusFlower } from "@/components/ui/decorations";

interface ClassCardProps {
  yogaClass: YogaClass;
  isFavorite?: boolean;
  isLocked?: boolean;
  onToggleFavorite?: (classId: string) => void;
  commentCount?: number;
  averageRating?: number;
  ratingCount?: number;
}

export function ClassCard({
  yogaClass,
  isFavorite = false,
  isLocked = false,
  onToggleFavorite,
  commentCount = 0,
  averageRating,
  ratingCount = 0,
}: ClassCardProps) {
  const difficultyConfig = {
    beginner: {
      bg: "bg-gradient-to-r from-green-100 to-emerald-100",
      text: "text-green-700",
      border: "border-green-200",
    },
    intermediate: {
      bg: "bg-gradient-to-r from-amber-100 to-orange-100",
      text: "text-amber-700",
      border: "border-amber-200",
    },
    advanced: {
      bg: "bg-gradient-to-r from-red-100 to-pink-100",
      text: "text-red-700",
      border: "border-red-200",
    },
  };

  const difficulty = yogaClass.difficulty ? difficultyConfig[yogaClass.difficulty] : null;
  const cardHref = isLocked ? "/app/upgrade" : `/app/classes/${yogaClass.id}`;

  return (
    <Link href={cardHref} className="block">
      <div className="group relative rounded-3xl overflow-hidden glass border border-pink-100/50 shadow-lg hover:shadow-xl hover:border-pink-200 transition-all duration-300">
        {/* Thumbnail */}
        <div className="relative aspect-[16/10] overflow-hidden">
          {yogaClass.thumbnail_url ? (
            <Image
              src={yogaClass.thumbnail_url}
              alt={yogaClass.title}
              fill
              className="object-cover group-hover:scale-110 transition-transform duration-500"
            />
          ) : (
            <div className="absolute inset-0 bg-gradient-to-br from-primary-400 via-primary-500 to-pink-500">
              {/* Decorative pattern */}
              <div className="absolute inset-0 bg-pattern-mandala opacity-20" />
              {/* Floating lotus */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-30">
                <LotusFlower className="w-24 h-24 text-white animate-float" />
              </div>
            </div>
          )}

          {/* Gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

          {/* One-time price ribbon in top-right corner */}
          {yogaClass.access_type === "one_time" && yogaClass.one_time_price_cents && (
            <div className="absolute top-0 right-0">
              <div className="relative">
                <div className="bg-gradient-to-r from-primary-500 to-pink-500 text-white text-sm font-bold px-4 py-1.5 rounded-bl-2xl shadow-lg">
                  {formatPrice(yogaClass.one_time_price_cents, yogaClass.currency || "EUR")}
                </div>
              </div>
            </div>
          )}

          {/* Overlay for locked content */}
          {isLocked && (
            <div className="absolute inset-0 bg-sage-900/70 backdrop-blur-sm flex items-center justify-center">
              <div className="text-center text-white">
                <div className="w-16 h-16 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center mx-auto mb-3">
                  <Lock className="h-8 w-8" />
                </div>
                <p className="font-semibold">Premium Only</p>
                <p className="text-sm text-white/70">Unlock with subscription</p>
              </div>
            </div>
          )}

          {/* Duration badge */}
          {yogaClass.duration_minutes && (
            <div className="absolute bottom-3 left-3 flex items-center gap-1.5 bg-black/50 backdrop-blur-sm text-white text-sm px-3 py-1.5 rounded-full">
              <Clock className="h-4 w-4" />
              {formatDuration(yogaClass.duration_minutes)}
            </div>
          )}

          {/* Play button overlay */}
          {!isLocked && (
            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              <div className="w-16 h-16 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center shadow-xl transform scale-75 group-hover:scale-100 transition-transform duration-300">
                <Play className="h-7 w-7 text-primary-600 ml-1" />
              </div>
            </div>
          )}

          {/* Favorite button */}
          {onToggleFavorite && !isLocked && (
            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onToggleFavorite(yogaClass.id);
              }}
              className={cn(
                "absolute top-3 left-3 p-2.5 rounded-full transition-all duration-300 backdrop-blur-sm z-10",
                isFavorite
                  ? "bg-pink-500 shadow-lg shadow-pink-500/40"
                  : "bg-white/80 hover:bg-white shadow-md"
              )}
            >
              <Heart
                className={cn(
                  "h-5 w-5 transition-all duration-300",
                  isFavorite
                    ? "fill-white text-white scale-110"
                    : "text-sage-600 hover:text-pink-500"
                )}
              />
            </button>
          )}
        </div>

        {/* Content */}
        <div className="p-5">
          <div className="flex items-center gap-2 mb-3 flex-wrap">
            {difficulty && (
              <span
                className={cn(
                  "text-xs font-semibold px-3 py-1 rounded-full border",
                  difficulty.bg,
                  difficulty.text,
                  difficulty.border
                )}
              >
                {capitalize(yogaClass.difficulty!)}
              </span>
            )}
            {yogaClass.style && (
              <span className="text-xs font-medium px-3 py-1 rounded-full bg-gradient-to-r from-primary-50 to-pink-50 text-primary-600 border border-primary-100">
                {yogaClass.style}
              </span>
            )}
            {yogaClass.access_type === "subscriber" && (
              <span className="text-xs font-medium px-2 py-1 rounded-full bg-gradient-to-r from-amber-100 to-orange-100 text-amber-700 border border-amber-200 flex items-center gap-1">
                <Sparkles className="w-3 h-3" />
                Premium
              </span>
            )}
            {yogaClass.access_type === "free" && (
              <span className="text-xs font-medium px-2 py-1 rounded-full bg-gradient-to-r from-green-100 to-emerald-100 text-green-700 border border-green-200">
                Free
              </span>
            )}
          </div>

          <h3 className="font-display font-bold text-lg text-sage-900 group-hover:text-gradient transition-all duration-300 mb-1">
            {yogaClass.title}
          </h3>

          {yogaClass.instructor && (
            <p className="text-sm text-sage-500 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-pink-400"></span>
              with {yogaClass.instructor}
            </p>
          )}

          {yogaClass.description && (
            <p className="mt-3 text-sm text-sage-600 line-clamp-2 leading-relaxed">
              {yogaClass.description}
            </p>
          )}

          {/* Rating and Comments Row */}
          {(ratingCount > 0 || commentCount > 0) && (
            <div className="mt-4 pt-4 border-t border-pink-100/50 flex items-center gap-4">
              {/* Average Rating */}
              {ratingCount > 0 && averageRating !== undefined && (
                <div className="flex items-center gap-1.5">
                  <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
                  <span className="text-sm font-semibold text-sage-700">
                    {averageRating.toFixed(1)}
                  </span>
                  <span className="text-xs text-sage-400">
                    ({ratingCount})
                  </span>
                </div>
              )}

              {/* Comment Count */}
              {commentCount > 0 && (
                <div className="flex items-center gap-1.5">
                  <MessageCircle className="w-4 h-4 text-primary-400" />
                  <span className="text-sm text-sage-600">
                    {commentCount} {commentCount === 1 ? "comment" : "comments"}
                  </span>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </Link>
  );
}
