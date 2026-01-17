"use client";

import { useEffect, useState, useCallback } from "react";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { ClassCard } from "@/components/classes/class-card";
import { ClassFilters } from "@/components/classes/class-filters";
import { createClient } from "@/lib/supabase/client";
import type { YogaClass, Profile } from "@/types/database";
import { Filter, X } from "lucide-react";

const FREE_CLASS_LIMIT = 2;

export default function ClassesPage() {
  const [classes, setClasses] = useState<YogaClass[]>([]);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [favorites, setFavorites] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);

  // Filters
  const [selectedDifficulty, setSelectedDifficulty] = useState<string | null>(null);
  const [selectedStyle, setSelectedStyle] = useState<string | null>(null);
  const [selectedDuration, setSelectedDuration] = useState<string | null>(null);

  const supabase = createClient();

  useEffect(() => {
    async function loadData() {
      // Get user profile
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (user) {
        const { data: profileData } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", user.id)
          .single();
        setProfile(profileData);

        // Get favorites
        const { data: favoritesData } = await supabase
          .from("favorites")
          .select("class_id")
          .eq("user_id", user.id);

        if (favoritesData) {
          setFavorites(new Set(favoritesData.map((f) => f.class_id)));
        }
      }

      // Get classes - sorted by admin-defined order
      const { data: classesData } = await supabase
        .from("classes")
        .select("*")
        .eq("published", true)
        .order("sort_order", { ascending: true, nullsFirst: false })
        .order("created_at", { ascending: false });

      if (classesData) {
        setClasses(classesData);
      }

      setLoading(false);
    }

    loadData();
  }, [supabase]);

  const toggleFavorite = useCallback(
    async (classId: string) => {
      if (!profile) return;

      const isFavorite = favorites.has(classId);

      if (isFavorite) {
        await supabase
          .from("favorites")
          .delete()
          .eq("user_id", profile.id)
          .eq("class_id", classId);
        setFavorites((prev) => {
          const next = new Set(prev);
          next.delete(classId);
          return next;
        });
      } else {
        await supabase.from("favorites").insert({
          user_id: profile.id,
          class_id: classId,
        });
        setFavorites((prev) => new Set(prev).add(classId));
      }
    },
    [profile, favorites, supabase]
  );

  // Filter classes
  const filteredClasses = classes.filter((c) => {
    if (selectedDifficulty && c.difficulty !== selectedDifficulty) return false;
    if (selectedStyle && c.style !== selectedStyle) return false;
    if (selectedDuration) {
      const duration = c.duration_minutes || 0;
      if (selectedDuration === "short" && duration >= 20) return false;
      if (selectedDuration === "medium" && (duration < 20 || duration > 45))
        return false;
      if (selectedDuration === "long" && duration <= 45) return false;
    }
    return true;
  });

  // Get unique styles
  const styles = [...new Set(classes.map((c) => c.style).filter(Boolean))] as string[];

  // Check if class is locked (premium required)
  const isSubscribed = profile?.subscription_status === "active";
  const freeClasses = classes.filter((c) => !c.is_premium).slice(0, FREE_CLASS_LIMIT);
  const freeClassIds = new Set(freeClasses.map((c) => c.id));

  const isClassLocked = (yogaClass: YogaClass) => {
    if (isSubscribed) return false;
    if (!yogaClass.is_premium) return false;
    // One-time purchase classes should NOT be locked - they're purchasable
    if (yogaClass.access_type === 'one_time') return false;
    if (freeClassIds.has(yogaClass.id)) return false;
    return true;
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
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="font-display text-3xl font-bold text-sage-900">
                Yoga Classes
              </h1>
              <p className="mt-2 text-sage-600">
                {filteredClasses.length} classes available
              </p>
            </div>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="lg:hidden flex items-center gap-2 px-4 py-2 border border-sage-300 rounded-lg text-sage-700 hover:bg-sage-50"
            >
              {showFilters ? (
                <X className="h-5 w-5" />
              ) : (
                <Filter className="h-5 w-5" />
              )}
              Filters
            </button>
          </div>

          <div className="flex gap-8">
            {/* Filters sidebar */}
            <aside
              className={`${
                showFilters ? "block" : "hidden"
              } lg:block w-full lg:w-64 flex-shrink-0`}
            >
              <div className="sticky top-24 bg-white rounded-xl border border-sage-200 p-6">
                <ClassFilters
                  selectedDifficulty={selectedDifficulty}
                  selectedStyle={selectedStyle}
                  selectedDuration={selectedDuration}
                  onDifficultyChange={setSelectedDifficulty}
                  onStyleChange={setSelectedStyle}
                  onDurationChange={setSelectedDuration}
                  styles={styles}
                />
              </div>
            </aside>

            {/* Classes grid */}
            <div className="flex-1">
              {filteredClasses.length === 0 ? (
                <div className="text-center py-16">
                  <p className="text-sage-600">
                    No classes found matching your filters.
                  </p>
                  <button
                    onClick={() => {
                      setSelectedDifficulty(null);
                      setSelectedStyle(null);
                      setSelectedDuration(null);
                    }}
                    className="mt-4 text-primary-600 hover:underline"
                  >
                    Clear filters
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredClasses.map((yogaClass) => (
                    <ClassCard
                      key={yogaClass.id}
                      yogaClass={yogaClass}
                      isFavorite={favorites.has(yogaClass.id)}
                      isLocked={isClassLocked(yogaClass)}
                      onToggleFavorite={profile ? toggleFavorite : undefined}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
