"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export function AuthCodeHandler() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const code = searchParams.get("code");
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    const handleAuth = async () => {
      const supabase = createClient();

      // Check for hash fragment (implicit flow) - this handles token in URL hash
      const hashParams = new URLSearchParams(window.location.hash.substring(1));
      const accessToken = hashParams.get("access_token");
      const refreshToken = hashParams.get("refresh_token");

      if (accessToken && refreshToken) {
        setIsProcessing(true);
        const { data, error } = await supabase.auth.setSession({
          access_token: accessToken,
          refresh_token: refreshToken,
        });

        if (!error && data.session) {
          await createProfileIfNeeded(supabase, data.session.user);
          router.push("/app");
          return;
        } else {
          console.error("Session error:", error);
          router.push("/login?error=auth_failed");
          return;
        }
      }

      // Check for code parameter (PKCE flow)
      if (code && !isProcessing) {
        setIsProcessing(true);

        try {
          const { data, error } = await supabase.auth.exchangeCodeForSession(code);

          if (!error && data.session) {
            await createProfileIfNeeded(supabase, data.session.user);
            router.push("/app");
          } else {
            console.error("Auth error:", error);
            router.push("/login?error=auth_failed");
          }
        } catch (err) {
          console.error("Exchange error:", err);
          router.push("/login?error=auth_failed");
        }
      }
    };

    handleAuth();
  }, [code, router, isProcessing]);

  async function createProfileIfNeeded(supabase: ReturnType<typeof createClient>, user: { id: string; email?: string; user_metadata?: Record<string, string> }) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("id")
      .eq("id", user.id)
      .single();

    if (!profile) {
      await supabase.from("profiles").insert({
        id: user.id,
        email: user.email,
        full_name: user.user_metadata?.full_name || null,
        avatar_url: user.user_metadata?.avatar_url || null,
        subscription_status: "free",
      });
    }
  }

  // Show loading if we have auth params
  const hasAuthParams = code || (typeof window !== "undefined" && window.location.hash.includes("access_token"));

  if (hasAuthParams || isProcessing) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-white z-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-sage-600">Signing you in...</p>
        </div>
      </div>
    );
  }

  return null;
}
