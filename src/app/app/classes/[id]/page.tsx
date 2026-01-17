import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Clock, Share2, Lock } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { VideoPlayer } from "@/components/classes/video-player";
import { Button } from "@/components/ui/button";
import { formatDuration, capitalize } from "@/lib/utils";
import { FavoriteButton } from "./favorite-button";
import { ClassRating } from "@/components/classes/class-rating";
import { ClassComments } from "@/components/classes/class-comments";
import { PurchaseButton } from "@/components/classes/purchase-button";
import type { YogaClass, Profile, Difficulty } from "@/types/database";

interface ClassDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function ClassDetailPage({ params }: ClassDetailPageProps) {
  const { id } = await params;
  const supabase = await createClient();

  // Get user and profile
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let profile = null;
  let isFavorite = false;

  if (user) {
    const { data: profileData } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .single();
    profile = profileData;

    // Check if favorited
    const { data: favoriteData } = await supabase
      .from("favorites")
      .select("id")
      .eq("user_id", user.id)
      .eq("class_id", id)
      .single();
    isFavorite = !!favoriteData;
  }

  // Get class
  const { data: classData, error } = await supabase
    .from("classes")
    .select("*")
    .eq("id", id)
    .single();

  if (error || !classData) {
    notFound();
  }

  const yogaClass = classData as YogaClass;

  // Check access based on access_type
  const isSubscribed = (profile as Profile | null)?.subscription_status === "active";
  const accessType = yogaClass.access_type || "subscriber";

  // Check if user has purchased this class (for one_time access)
  let hasPurchased = false;
  if (user && accessType === "one_time") {
    const { data: purchaseData } = await supabase
      .from("class_purchases")
      .select("id")
      .eq("user_id", user.id)
      .eq("class_id", id)
      .eq("status", "paid")
      .single();
    hasPurchased = !!purchaseData;
  }

  // Determine access
  const hasAccess =
    accessType === "free" ||
    isSubscribed ||
    (accessType === "one_time" && hasPurchased);

  // For subscriber-only content, redirect to upgrade
  if (accessType === "subscriber" && !isSubscribed) {
    redirect("/app/upgrade");
  }

  const difficultyColors: Record<Difficulty, string> = {
    beginner: "bg-green-100 text-green-700",
    intermediate: "bg-yellow-100 text-yellow-700",
    advanced: "bg-red-100 text-red-700",
  };

  return (
    <div className="px-4 pt-6 pb-8">
      {/* Back link */}
      <Link
        href="/app/classes"
        className="inline-flex items-center text-sm text-sage-600 hover:text-sage-900 mb-6"
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to classes
      </Link>

      {/* Video player or locked state */}
      {hasAccess ? (
        yogaClass.video_url ? (
          <VideoPlayer videoUrl={yogaClass.video_url} title={yogaClass.title} />
        ) : (
          <div className="aspect-video rounded-xl bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center">
            <p className="text-white text-lg">Video coming soon</p>
          </div>
        )
      ) : (
        <div className="aspect-video rounded-xl bg-gradient-to-br from-gray-700 to-gray-900 flex flex-col items-center justify-center text-white relative overflow-hidden">
          {yogaClass.thumbnail_url && (
            <img
              src={yogaClass.thumbnail_url}
              alt={yogaClass.title}
              className="absolute inset-0 w-full h-full object-cover opacity-30"
            />
          )}
          <div className="relative z-10 text-center px-6">
            <Lock className="w-12 h-12 mx-auto mb-4 opacity-80" />
            <p className="text-lg font-medium mb-2">Purchase to watch</p>
            <p className="text-sm text-gray-300 mb-4">
              Get lifetime access to this class
            </p>
            <PurchaseButton
              classId={yogaClass.id}
              priceCents={yogaClass.one_time_price_cents || 0}
              currency={yogaClass.currency || "EUR"}
              isPurchased={hasPurchased}
              isSubscriber={isSubscribed}
              isLoggedIn={!!user}
            />
          </div>
        </div>
      )}

      {/* Class info */}
      <div className="mt-6">
        <div className="flex flex-wrap items-center gap-3 mb-4">
          {yogaClass.difficulty && (
            <span
              className={`text-sm font-medium px-3 py-1 rounded-full ${
                difficultyColors[yogaClass.difficulty]
              }`}
            >
              {capitalize(yogaClass.difficulty)}
            </span>
          )}
          {yogaClass.style && (
            <span className="text-sm text-sage-500 px-3 py-1 bg-sage-100 rounded-full">
              {yogaClass.style}
            </span>
          )}
          {yogaClass.duration_minutes && (
            <span className="flex items-center gap-1 text-sm text-sage-500">
              <Clock className="h-4 w-4" />
              {formatDuration(yogaClass.duration_minutes)}
            </span>
          )}
        </div>

        <h1 className="font-display text-2xl font-bold text-sage-900">
          {yogaClass.title}
        </h1>

        {yogaClass.instructor && (
          <p className="mt-2 text-lg text-sage-600">
            with {yogaClass.instructor}
          </p>
        )}

        {/* Rating */}
        <div className="mt-4">
          <ClassRating
            classId={yogaClass.id}
            userId={user?.id}
            size="md"
            readonly={!hasAccess}
          />
        </div>

        {yogaClass.description && (
          <p className="mt-4 text-sage-700 leading-relaxed">
            {yogaClass.description}
          </p>
        )}

        {/* Focus & Equipment Tags */}
        {(yogaClass.focus_tags?.length || yogaClass.equipment_tags?.length) && (
          <div className="mt-4 space-y-2">
            {yogaClass.focus_tags && yogaClass.focus_tags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                <span className="text-sm text-sage-500">Focus:</span>
                {yogaClass.focus_tags.map((tag) => (
                  <span
                    key={tag}
                    className="text-xs px-2 py-1 bg-primary-50 text-primary-700 rounded-full"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}
            {yogaClass.equipment_tags && yogaClass.equipment_tags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                <span className="text-sm text-sage-500">Equipment:</span>
                {yogaClass.equipment_tags.map((tag) => (
                  <span
                    key={tag}
                    className="text-xs px-2 py-1 bg-sage-100 text-sage-700 rounded-full"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Actions */}
        <div className="mt-6 flex flex-wrap gap-4">
          {profile && (
            <FavoriteButton
              classId={yogaClass.id}
              userId={profile.id}
              initialIsFavorite={isFavorite}
            />
          )}
          <Button variant="outline">
            <Share2 className="mr-2 h-4 w-4" />
            Share
          </Button>
        </div>

        {/* Purchase Button (for one_time classes without access) */}
        {accessType === "one_time" && !hasAccess && (
          <div className="mt-6 p-4 bg-gradient-to-r from-primary-50 to-pink-50 rounded-xl border border-primary-100">
            <PurchaseButton
              classId={yogaClass.id}
              priceCents={yogaClass.one_time_price_cents || 0}
              currency={yogaClass.currency || "EUR"}
              isPurchased={hasPurchased}
              isSubscriber={isSubscribed}
              isLoggedIn={!!user}
            />
          </div>
        )}

        {/* Comments Section */}
        <div className="mt-8 pt-8 border-t border-gray-100">
          <ClassComments
            classId={yogaClass.id}
            userId={user?.id}
            userName={profile?.full_name || undefined}
          />
        </div>
      </div>
    </div>
  );
}
