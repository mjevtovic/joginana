"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Heart } from "lucide-react";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { ClassCard } from "@/components/classes/class-card";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";
import type { YogaClass, Profile } from "@/types/database";

export default function FavoritesPage() {
  const [favorites, setFavorites] = useState<YogaClass[]>([]);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  const supabase = createClient();

  useEffect(() => {
    async function loadData() {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        setLoading(false);
        return;
      }

      const { data: profileData } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();
      setProfile(profileData);

      // Get favorites with class details
      const { data: favoritesData } = await supabase
        .from("favorites")
        .select("class_id, classes(*)")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (favoritesData) {
        const classes = favoritesData
          .map((f) => f.classes as unknown as YogaClass)
          .filter(Boolean);
        setFavorites(classes);
      }

      setLoading(false);
    }

    loadData();
  }, [supabase]);

  const removeFavorite = async (classId: string) => {
    if (!profile) return;

    await supabase
      .from("favorites")
      .delete()
      .eq("user_id", profile.id)
      .eq("class_id", classId);

    setFavorites((prev) => prev.filter((c) => c.id !== classId));
  };

  if (loading) {
    return (
      <div className="min-h-screen">
        <Header user={profile} />
        <div className="pt-24 flex items-center justify-center min-h-[60vh]">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <Header user={profile} />

      <main className="pt-24 pb-16">
        <div className="mx-auto max-w-7xl px-4 lg:px-8">
          <div className="mb-8">
            <h1 className="font-display text-3xl font-bold text-sage-900">
              Your Favorites
            </h1>
            <p className="mt-2 text-sage-600">
              {favorites.length} {favorites.length === 1 ? "class" : "classes"}{" "}
              saved
            </p>
          </div>

          {favorites.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-xl border border-sage-200">
              <Heart className="h-16 w-16 mx-auto text-sage-300" />
              <h2 className="mt-4 text-xl font-semibold text-sage-900">
                No favorites yet
              </h2>
              <p className="mt-2 text-sage-600">
                Start exploring classes and save your favorites here.
              </p>
              <Link href="/classes" className="inline-block mt-6">
                <Button>Browse Classes</Button>
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {favorites.map((yogaClass) => (
                <ClassCard
                  key={yogaClass.id}
                  yogaClass={yogaClass}
                  isFavorite={true}
                  onToggleFavorite={removeFavorite}
                />
              ))}
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
