import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { Plus, Edit, Eye, EyeOff, Clock } from "lucide-react";
import { formatPrice } from "@/lib/utils";
import type { YogaClass } from "@/types/database";

export default async function AdminClassesPage() {
  const supabase = await createClient();

  const { data: classes, error } = await supabase
    .from("classes")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    return <div className="text-red-500">Error loading classes: {error.message}</div>;
  }

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

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Classes</h1>
        <Link
          href="/admin/classes/new"
          className="inline-flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Add Class
        </Link>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
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
                Status
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {(classes as YogaClass[])?.map((yogaClass) => (
              <tr key={yogaClass.id} className="hover:bg-gray-50">
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
            {(!classes || classes.length === 0) && (
              <tr>
                <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                  No classes yet. Create your first class to get started.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
