import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { isAdmin } from "@/lib/admin";
import { LayoutDashboard, Video, LogOut, Home } from "lucide-react";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const adminCheck = await isAdmin(user.id);

  if (!adminCheck) {
    redirect("/app");
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Admin Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-8">
              <Link href="/admin" className="flex items-center gap-2">
                <LayoutDashboard className="w-6 h-6 text-primary-600" />
                <span className="text-xl font-bold text-gray-900">Admin</span>
              </Link>
              <nav className="hidden md:flex items-center gap-6">
                <Link
                  href="/admin/classes"
                  className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900"
                >
                  <Video className="w-4 h-4" />
                  Classes
                </Link>
              </nav>
            </div>
            <div className="flex items-center gap-4">
              <Link
                href="/app"
                className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900"
              >
                <Home className="w-4 h-4" />
                Back to App
              </Link>
              <form action="/api/auth/signout" method="POST">
                <button
                  type="submit"
                  className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900"
                >
                  <LogOut className="w-4 h-4" />
                  Sign Out
                </button>
              </form>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>
    </div>
  );
}
