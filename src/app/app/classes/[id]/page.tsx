import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Clock, Share2 } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { VideoPlayer } from "@/components/classes/video-player";
import { Button } from "@/components/ui/button";
import { formatDuration, capitalize } from "@/lib/utils";
import { FavoriteButton } from "./favorite-button";
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

  // Check access
  const isSubscribed = (profile as Profile | null)?.subscription_status === "active";
  const hasAccess = !yogaClass.is_premium || isSubscribed;

  if (!hasAccess) {
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

      {/* Video player */}
      {yogaClass.video_url ? (
        <VideoPlayer videoUrl={yogaClass.video_url} title={yogaClass.title} />
      ) : (
        <div className="aspect-video rounded-xl bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center">
          <p className="text-white text-lg">Video coming soon</p>
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

        {yogaClass.description && (
          <p className="mt-4 text-sage-700 leading-relaxed">
            {yogaClass.description}
          </p>
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
      </div>
    </div>
  );
}
