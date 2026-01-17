import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { Plus } from "lucide-react";
import { ClassListAdmin } from "@/components/admin/class-list-admin";
import type { YogaClass } from "@/types/database";

export default async function AdminClassesPage() {
  const supabase = await createClient();

  // Sort by sort_order first (lower numbers first), then by created_at for classes without sort_order
  const { data: classes, error } = await supabase
    .from("classes")
    .select("*")
    .order("sort_order", { ascending: true, nullsFirst: false })
    .order("created_at", { ascending: false });

  // Fetch ratings for all classes
  const { data: ratingsData } = await supabase
    .from("class_ratings")
    .select("class_id, rating");

  // Calculate average ratings per class
  const ratingsMap = new Map<string, { total: number; count: number }>();
  ratingsData?.forEach((r) => {
    const current = ratingsMap.get(r.class_id) || { total: 0, count: 0 };
    ratingsMap.set(r.class_id, {
      total: current.total + r.rating,
      count: current.count + 1,
    });
  });

  if (error) {
    return <div className="text-red-500">Error loading classes: {error.message}</div>;
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Classes</h1>
          <p className="text-sm text-gray-500 mt-1">
            Use the arrows to reorder classes. The order here determines display order for users.
          </p>
        </div>
        <Link
          href="/admin/classes/new"
          className="inline-flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Add Class
        </Link>
      </div>

      <ClassListAdmin
        initialClasses={(classes as YogaClass[]) || []}
        ratingsMap={ratingsMap}
      />
    </div>
  );
}
