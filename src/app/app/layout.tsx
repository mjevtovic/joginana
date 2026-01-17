import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { BottomNav } from "@/components/layout/bottom-nav";
import { InstallPrompt } from "@/components/pwa/install-prompt";
import { FloatingFlowers, GradientBlob, Mandala } from "@/components/ui/decorations";

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

  return (
    <div className="min-h-screen relative overflow-hidden pb-24 pt-12">
      {/* Animated gradient background */}
      <div className="fixed inset-0 bg-gradient-to-br from-pink-50 via-white to-primary-50 animate-gradient -z-20" />

      {/* Background pattern */}
      <div className="fixed inset-0 bg-pattern-lotus opacity-30 -z-10" />

      {/* Decorative blobs */}
      <GradientBlob className="fixed w-[500px] h-[500px] -top-64 -right-64 opacity-40" variant="pink" />
      <GradientBlob className="fixed w-[400px] h-[400px] top-1/2 -left-48 opacity-30" variant="purple" />
      <GradientBlob className="fixed w-[300px] h-[300px] bottom-32 right-0 opacity-20" variant="pink" />

      {/* Floating mandala */}
      <div className="fixed top-20 right-4 opacity-10 animate-float pointer-events-none">
        <Mandala className="w-32 h-32" />
      </div>
      <div className="fixed bottom-40 left-4 opacity-10 animate-float pointer-events-none" style={{ animationDelay: '2s' }}>
        <Mandala className="w-24 h-24" />
      </div>

      {/* Main content */}
      <div className="relative z-10">
        {children}
      </div>

      <InstallPrompt />
      <BottomNav />
    </div>
  );
}
