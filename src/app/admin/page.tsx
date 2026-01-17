import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { Video, Users, Star, MessageSquare } from "lucide-react";

export default async function AdminDashboard() {
  const supabase = await createClient();

  // Get stats
  const [classesResult, ratingsResult, commentsResult] = await Promise.all([
    supabase.from("classes").select("id", { count: "exact" }),
    supabase.from("class_ratings").select("id", { count: "exact" }),
    supabase.from("class_comments").select("id", { count: "exact" }).eq("status", "published"),
  ]);

  const stats = [
    {
      name: "Total Classes",
      value: classesResult.count || 0,
      icon: Video,
      href: "/admin/classes",
    },
    {
      name: "Total Ratings",
      value: ratingsResult.count || 0,
      icon: Star,
      href: "/admin/classes",
    },
    {
      name: "Total Comments",
      value: commentsResult.count || 0,
      icon: MessageSquare,
      href: "/admin/classes",
    },
  ];

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-8">Dashboard</h1>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {stats.map((stat) => (
          <Link
            key={stat.name}
            href={stat.href}
            className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md transition-shadow"
          >
            <div className="flex items-center gap-4">
              <div className="p-3 bg-primary-50 rounded-lg">
                <stat.icon className="w-6 h-6 text-primary-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">{stat.name}</p>
                <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
              </div>
            </div>
          </Link>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
        <div className="flex flex-wrap gap-4">
          <Link
            href="/admin/classes/new"
            className="inline-flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
          >
            <Video className="w-4 h-4" />
            Add New Class
          </Link>
          <Link
            href="/admin/classes"
            className="inline-flex items-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Manage Classes
          </Link>
        </div>
      </div>
    </div>
  );
}
