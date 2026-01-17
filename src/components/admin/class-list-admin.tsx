"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ChevronUp, ChevronDown, Edit, Eye, EyeOff, Clock, Star, Loader2 } from "lucide-react";
import { formatPrice } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";
import type { YogaClass } from "@/types/database";

interface ClassListAdminProps {
  initialClasses: YogaClass[];
  ratingsMap: Map<string, { total: number; count: number }>;
}

export function ClassListAdmin({ initialClasses, ratingsMap }: ClassListAdminProps) {
  const [classes, setClasses] = useState(initialClasses);
  const [movingId, setMovingId] = useState<string | null>(null);
  const router = useRouter();

  const getAccessBadgeColor = (accessType?: string) => {
    switch (accessType) {
      case "free":
        return "bg-green-100 text-green-700";
      case "subscriber":
        return "bg-blue-100 text-blue-700";
      case "one_time":
        return "bg-purple-100 text-purple-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  const moveClass = async (classId: string, direction: "up" | "down") => {
    const currentIndex = classes.findIndex((c) => c.id === classId);
    if (currentIndex === -1) return;

    const targetIndex = direction === "up" ? currentIndex - 1 : currentIndex + 1;
    if (targetIndex < 0 || targetIndex >= classes.length) return;

    setMovingId(classId);

    const supabase = createClient();
    const currentClass = classes[currentIndex];
    const targetClass = classes[targetIndex];

    // Swap sort_order values
    const currentSortOrder = currentClass.sort_order ?? currentIndex;
    const targetSortOrder = targetClass.sort_order ?? targetIndex;

    try {
      // Update both classes in the database
      const [result1, result2] = await Promise.all([
        supabase
          .from("classes")
          .update({ sort_order: targetSortOrder })
          .eq("id", currentClass.id),
        supabase
          .from("classes")
          .update({ sort_order: currentSortOrder })
          .eq("id", targetClass.id),
      ]);

      if (result1.error) throw result1.error;
      if (result2.error) throw result2.error;

      // Update local state
      const newClasses = [...classes];
      newClasses[currentIndex] = { ...targetClass, sort_order: currentSortOrder };
      newClasses[targetIndex] = { ...currentClass, sort_order: targetSortOrder };
      setClasses(newClasses);

      // Refresh the page to ensure server state is in sync
      router.refresh();
    } catch (error) {
      console.error("Failed to reorder class:", error);
    } finally {
      setMovingId(null);
    }
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-20">
              Order
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Class
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Access
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Duration
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Rating
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Status
            </th>
            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {classes.map((yogaClass, index) => (
            <tr key={yogaClass.id} className="hover:bg-gray-50">
              <td className="px-4 py-4">
                <div className="flex flex-col items-center gap-1">
                  <button
                    onClick={() => moveClass(yogaClass.id, "up")}
                    disabled={index === 0 || movingId !== null}
                    className={`p-1 rounded transition-colors ${
                      index === 0 || movingId !== null
                        ? "text-gray-300 cursor-not-allowed"
                        : "text-gray-400 hover:text-gray-600 hover:bg-gray-100"
                    }`}
                    title="Move up"
                  >
                    {movingId === yogaClass.id ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <ChevronUp className="w-4 h-4" />
                    )}
                  </button>
                  <span className="text-xs text-gray-400 font-medium">{index + 1}</span>
                  <button
                    onClick={() => moveClass(yogaClass.id, "down")}
                    disabled={index === classes.length - 1 || movingId !== null}
                    className={`p-1 rounded transition-colors ${
                      index === classes.length - 1 || movingId !== null
                        ? "text-gray-300 cursor-not-allowed"
                        : "text-gray-400 hover:text-gray-600 hover:bg-gray-100"
                    }`}
                    title="Move down"
                  >
                    <ChevronDown className="w-4 h-4" />
                  </button>
                </div>
              </td>
              <td className="px-6 py-4">
                <div className="flex items-center gap-4">
                  {yogaClass.thumbnail_url ? (
                    <img
                      src={yogaClass.thumbnail_url}
                      alt={yogaClass.title}
                      className="w-16 h-10 object-cover rounded"
                    />
                  ) : (
                    <div className="w-16 h-10 bg-gray-200 rounded flex items-center justify-center">
                      <span className="text-xs text-gray-400">No image</span>
                    </div>
                  )}
                  <div>
                    <p className="font-medium text-gray-900">{yogaClass.title}</p>
                    <p className="text-sm text-gray-500">{yogaClass.instructor || "No instructor"}</p>
                  </div>
                </div>
              </td>
              <td className="px-6 py-4">
                <div className="flex flex-col gap-1">
                  <span
                    className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getAccessBadgeColor(
                      yogaClass.access_type
                    )}`}
                  >
                    {yogaClass.access_type || "subscriber"}
                  </span>
                  {yogaClass.access_type === "one_time" && yogaClass.one_time_price_cents && (
                    <span className="text-xs text-gray-500">
                      {formatPrice(yogaClass.one_time_price_cents, yogaClass.currency)}
                    </span>
                  )}
                </div>
              </td>
              <td className="px-6 py-4">
                <div className="flex items-center gap-1 text-sm text-gray-500">
                  <Clock className="w-4 h-4" />
                  {yogaClass.duration_minutes ? `${yogaClass.duration_minutes} min` : "-"}
                </div>
              </td>
              <td className="px-6 py-4">
                {(() => {
                  const ratingInfo = ratingsMap.get(yogaClass.id);
                  if (!ratingInfo || ratingInfo.count === 0) {
                    return <span className="text-sm text-gray-400">-</span>;
                  }
                  const avg = Math.round((ratingInfo.total / ratingInfo.count) * 10) / 10;
                  return (
                    <div className="flex items-center gap-1">
                      <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                      <span className="text-sm font-medium text-gray-700">{avg}</span>
                      <span className="text-xs text-gray-400">({ratingInfo.count})</span>
                    </div>
                  );
                })()}
              </td>
              <td className="px-6 py-4">
                <span
                  className={`inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-full ${
                    yogaClass.published !== false
                      ? "bg-green-100 text-green-700"
                      : "bg-yellow-100 text-yellow-700"
                  }`}
                >
                  {yogaClass.published !== false ? (
                    <>
                      <Eye className="w-3 h-3" />
                      Published
                    </>
                  ) : (
                    <>
                      <EyeOff className="w-3 h-3" />
                      Draft
                    </>
                  )}
                </span>
              </td>
              <td className="px-6 py-4 text-right">
                <Link
                  href={`/admin/classes/${yogaClass.id}/edit`}
                  className="inline-flex items-center gap-1 px-3 py-1.5 text-sm text-primary-600 hover:text-primary-700 hover:bg-primary-50 rounded-lg transition-colors"
                >
                  <Edit className="w-4 h-4" />
                  Edit
                </Link>
              </td>
            </tr>
          ))}
          {classes.length === 0 && (
            <tr>
              <td colSpan={7} className="px-6 py-12 text-center text-gray-500">
                No classes yet. Create your first class to get started.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
