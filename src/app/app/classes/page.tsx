"use client";

import { useEffect, useState, useCallback } from "react";
import { ClassCard } from "@/components/classes/class-card";
import { ClassFilters } from "@/components/classes/class-filters";
import { createClient } from "@/lib/supabase/client";
import type { YogaClass, Profile } from "@/types/database";
import { Filter, X, Sparkles, Search } from "lucide-react";
import { LotusFlower, OmSymbol } from "@/components/ui/decorations";

export default function AppClassesPage() {
  const [classes, setClasses] = useState<YogaClass[]>([]);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [favorites, setFavorites] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const [selectedDifficulty, setSelectedDifficulty] = useState<string | null>(null);
  const [selectedStyle, setSelectedStyle] = useState<string | null>(null);
  const [selectedDuration, setSelectedDuration] = useState<string | null>(null);

  const supabase = createClient();

  useEffect(() => {
    async function loadData() {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (user) {
        const { data: profileData } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", user.id)
          .single();
        setProfile(profileData as Profile | null);

        const { data: favoritesData } = await supabase
          .from("favorites")
          .select("class_id")
          .eq("user_id", user.id);

        if (favoritesData) {
          setFavorites(new Set(favoritesData.map((f) => f.class_id)));
        }
      }

      const { data: classesData } = await supabase
        .from("classes")
        .select("*")
        .eq("published", true)
        .order("sort_order", { ascending: true, nullsFirst: false })
        .order("created_at", { ascending: false });

      if (classesData) {
        setClasses(classesData as YogaClass[]);
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

  const filteredClasses = classes.filter((c) => {
    if (selectedDifficulty && c.difficulty !== selectedDifficulty) return false;
    if (selectedStyle && c.style !== selectedStyle) return false;
    if (selectedDuration) {
      const duration = c.duration_minutes || 0;
      if (selectedDuration === "short" && duration >= 20) return false;
      if (selectedDuration === "medium" && (duration < 20 || duration > 45)) return false;
      if (selectedDuration === "long" && duration <= 45) return false;
    }
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      return (
        c.title.toLowerCase().includes(query) ||
        c.description?.toLowerCase().includes(query) ||
        c.instructor?.toLowerCase().includes(query)
      );
    }
    return true;
  });

  const styles = [...new Set(classes.map((c) => c.style).filter(Boolean))] as string[];
  const activeFiltersCount = [selectedDifficulty, selectedStyle, selectedDuration].filter(Boolean).length;

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <div className="relative">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-pink-200 border-t-primary-500" />
          <LotusFlower className="absolute inset-0 m-auto w-8 h-8 text-pink-400 animate-pulse" />
        </div>
        <p className="text-sage-500 animate-pulse">Finding your flow...</p>
      </div>
    );
  }

  return (
    <div className="px-4 pt-6 pb-8">
      {/* Header */}
      <div className="mb-6 relative">
        <div className="absolute -top-4 right-0 opacity-15">
          <OmSymbol className="w-20 h-20 text-primary-500" />
        </div>

        <div className="flex items-center gap-2 mb-1">
          <Sparkles className="w-5 h-5 text-pink-500" />
          <h1 className="font-display text-2xl font-bold text-gradient">Explore Classes</h1>
        </div>
        <p className="text-sm text-sage-500">{filteredClasses.length} classes available</p>
      </div>

      {/* Search Bar */}
      <div className="mb-4">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-sage-400" />
          <input
            type="text"
            placeholder="Search classes, instructors..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-12 pr-4 py-3 rounded-2xl glass border border-pink-100/50 text-sage-900 placeholder:text-sage-400 focus:border-primary-300 focus:outline-none focus:ring-2 focus:ring-primary-500/20 transition-all"
          />
        </div>
      </div>

      {/* Filter Toggle */}
      <div className="flex items-center gap-3 mb-6">
        <button
          onClick={() => setShowFilters(!showFilters)}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl transition-all duration-300 ${
            showFilters || activeFiltersCount > 0
              ? "bg-gradient-to-r from-primary-500 to-pink-500 text-white shadow-lg shadow-primary-500/25"
              : "glass border border-pink-100/50 text-sage-700 hover:border-pink-200"
          }`}
        >
          {showFilters ? (
            <X className="h-4 w-4" />
          ) : (
            <Filter className="h-4 w-4" />
          )}
          <span className="font-medium">Filters</span>
          {activeFiltersCount > 0 && (
            <span className={`text-xs px-2 py-0.5 rounded-full ${
              showFilters ? "bg-white/20" : "bg-primary-100 text-primary-600"
            }`}>
              {activeFiltersCount}
            </span>
          )}
        </button>

        {activeFiltersCount > 0 && (
          <button
            onClick={() => {
              setSelectedDifficulty(null);
              setSelectedStyle(null);
              setSelectedDuration(null);
            }}
            className="text-sm text-pink-500 hover:text-pink-600 transition-colors"
          >
            Clear all
          </button>
        )}
      </div>

      {/* Filters Panel */}
      {showFilters && (
        <div className="mb-6 p-5 glass rounded-2xl border border-pink-100/50 animate-in slide-in-from-top-2 duration-300">
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
      )}

      {/* Classes Grid */}
      {filteredClasses.length === 0 ? (
        <div className="text-center py-12">
          <LotusFlower className="w-16 h-16 text-pink-300 mx-auto mb-4 animate-float" />
          <h3 className="font-display text-lg font-semibold text-sage-700 mb-2">No classes found</h3>
          <p className="text-sage-500 text-sm">Try adjusting your filters or search</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {filteredClasses.map((yogaClass, index) => (
            <div
              key={yogaClass.id}
              className="animate-in fade-in slide-in-from-bottom-2"
              style={{ animationDelay: `${index * 50}ms` }}
            >
              <ClassCard
                yogaClass={yogaClass}
                isFavorite={favorites.has(yogaClass.id)}
                isLocked={yogaClass.is_premium && profile?.subscription_status !== 'active'}
                onToggleFavorite={profile ? toggleFavorite : undefined}
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
