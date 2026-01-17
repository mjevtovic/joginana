import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { ResponsiveNav } from "@/components/layout/responsive-nav";
import { InstallPrompt } from "@/components/pwa/install-prompt";
import { GradientBlob, Mandala } from "@/components/ui/decorations";
import type { Profile } from "@/types/database";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login?redirectTo=/app");
  }

  // Fetch profile for the header
  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  return (
    <div className="min-h-screen relative overflow-hidden pb-24 lg:pb-16 pt-12 lg:pt-24">
      {/* Animated gradient background */}
      <div className="fixed inset-0 bg-gradient-to-br from-pink-50 via-white to-primary-50 animate-gradient -z-20" />

      {/* Background pattern */}
      <div className="fixed inset-0 bg-pattern-lotus opacity-30 -z-10" />

      {/* Decorative blobs */}
      <GradientBlob className="fixed w-[500px] h-[500px] -top-64 -right-64 opacity-40" variant="pink" />
      <GradientBlob className="fixed w-[400px] h-[400px] top-1/2 -left-48 opacity-30" variant="purple" />
      <GradientBlob className="fixed w-[300px] h-[300px] bottom-32 right-0 opacity-20" variant="pink" />

      {/* Floating mandala */}
      <div className="fixed top-20 right-4 opacity-10 animate-float pointer-events-none lg:top-32">
        <Mandala className="w-32 h-32" />
      </div>
      <div className="fixed bottom-40 left-4 opacity-10 animate-float pointer-events-none" style={{ animationDelay: '2s' }}>
        <Mandala className="w-24 h-24" />
      </div>

      {/* Main content - centered on desktop */}
      <div className="relative z-10 lg:max-w-7xl lg:mx-auto lg:px-8">
        {children}
      </div>

      <InstallPrompt />
      <ResponsiveNav profile={profile as Profile | null} />
    </div>
  );
}
