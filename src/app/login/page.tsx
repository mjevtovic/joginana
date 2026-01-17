"use client";

import { Suspense, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Mail, ArrowLeft, Lock, Sparkles } from "lucide-react";
import { LotusFlower, FloatingFlowers, GradientBlob } from "@/components/ui/decorations";

function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const searchParams = useSearchParams();
  const router = useRouter();
  const redirectTo = searchParams.get("redirectTo") || "/app";

  const handleEmailPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage(null);

    const supabase = createClient();

    if (isSignUp) {
      // Sign up with email/password
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
      });

      if (error) {
        setMessage({ type: "error", text: error.message });
      } else if (data.user) {
        // Create profile
        await supabase.from("profiles").insert({
          id: data.user.id,
          email: data.user.email,
          subscription_status: "free",
        });

        setMessage({
          type: "success",
          text: "Account created! Check your email to confirm, or sign in if email confirmation is disabled.",
        });
      }
    } else {
      // Sign in with email/password
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        setMessage({ type: "error", text: error.message });
      } else if (data.session) {
        // Check if profile exists
        const { data: profile } = await supabase
          .from("profiles")
          .select("id")
          .eq("id", data.user.id)
          .single();

        if (!profile) {
          await supabase.from("profiles").insert({
            id: data.user.id,
            email: data.user.email,
            subscription_status: "free",
          });
        }

        router.push(redirectTo);
        return;
      }
    }

    setIsLoading(false);
  };

  const handleGoogleLogin = async () => {
    setIsGoogleLoading(true);
    setMessage(null);

    const supabase = createClient();
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback?redirectTo=${redirectTo}`,
      },
    });

    if (error) {
      setMessage({ type: "error", text: error.message });
      setIsGoogleLoading(false);
    }
  };

  return (
    <Card className="glass border-pink-100/50 shadow-xl shadow-primary-500/10">
      <CardHeader className="text-center pb-4">
        <div className="flex justify-center mb-4">
          <div className="relative">
            <LotusFlower className="w-16 h-16 text-pink-400 animate-float" />
            <div className="absolute inset-0 blur-xl bg-pink-300/30 rounded-full" />
          </div>
        </div>
        <CardTitle className="font-display text-3xl text-gradient">
          {isSignUp ? "Join JoginAna" : "Welcome Back"}
        </CardTitle>
        <CardDescription className="text-sage-600">
          {isSignUp ? "Begin your yoga journey with us" : "Continue your path to inner peace"}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Google OAuth */}
        <Button
          variant="outline"
          className="w-full border-pink-200 hover:bg-gradient-to-r hover:from-pink-50 hover:to-primary-50 hover:border-pink-300 transition-all"
          onClick={handleGoogleLogin}
          isLoading={isGoogleLoading}
        >
          <svg className="mr-2 h-5 w-5" viewBox="0 0 24 24">
            <path
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              fill="#4285F4"
            />
            <path
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              fill="#34A853"
            />
            <path
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              fill="#FBBC05"
            />
            <path
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              fill="#EA4335"
            />
          </svg>
          Continue with Google
        </Button>

        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t border-pink-200" />
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="bg-white/70 backdrop-blur-sm px-4 text-sage-500">or</span>
          </div>
        </div>

        {/* Email/Password */}
        <form onSubmit={handleEmailPassword} className="space-y-4">
          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-sage-700 mb-1"
            >
              Email address
            </label>
            <div className="relative">
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                required
                className="w-full rounded-xl border border-pink-200 bg-white/70 px-4 py-3 text-sage-900 placeholder:text-sage-400 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20 transition-all"
              />
              <Mail className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-sage-400" />
            </div>
          </div>
          <div>
            <label
              htmlFor="password"
              className="block text-sm font-medium text-sage-700 mb-1"
            >
              Password
            </label>
            <div className="relative">
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                minLength={6}
                className="w-full rounded-xl border border-pink-200 bg-white/70 px-4 py-3 text-sage-900 placeholder:text-sage-400 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20 transition-all"
              />
              <Lock className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-sage-400" />
            </div>
          </div>
          <Button
            type="submit"
            className="w-full bg-gradient-to-r from-primary-500 to-pink-500 hover:from-primary-600 hover:to-pink-600 border-0 shadow-lg shadow-primary-500/25 py-6 text-base"
            isLoading={isLoading}
          >
            {isSignUp ? (
              <>
                <Sparkles className="mr-2 h-5 w-5" />
                Create Account
              </>
            ) : (
              <>
                <LotusFlower className="mr-2 h-5 w-5 text-white" />
                Sign In
              </>
            )}
          </Button>
        </form>

        <button
          type="button"
          onClick={() => {
            setIsSignUp(!isSignUp);
            setMessage(null);
          }}
          className="w-full text-center text-sm text-primary-600 hover:text-pink-600 transition-colors"
        >
          {isSignUp ? "Already have an account? Sign in" : "Don't have an account? Create one"}
        </button>

        {message && (
          <div
            className={`rounded-xl p-4 text-sm ${
              message.type === "success"
                ? "bg-gradient-to-r from-green-50 to-emerald-50 text-green-700 border border-green-200"
                : "bg-gradient-to-r from-red-50 to-pink-50 text-red-700 border border-red-200"
            }`}
          >
            {message.text}
          </div>
        )}

        <p className="text-center text-sm text-sage-500">
          By signing in, you agree to our{" "}
          <Link href="#" className="text-primary-600 hover:text-pink-600 transition-colors">
            Terms of Service
          </Link>{" "}
          and{" "}
          <Link href="#" className="text-primary-600 hover:text-pink-600 transition-colors">
            Privacy Policy
          </Link>
        </p>
      </CardContent>
    </Card>
  );
}

function LoginFormFallback() {
  return (
    <Card className="glass border-pink-100/50 shadow-xl shadow-primary-500/10">
      <CardHeader className="text-center pb-4">
        <div className="flex justify-center mb-4">
          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-pink-200 to-primary-200 animate-pulse" />
        </div>
        <div className="h-8 bg-gradient-to-r from-pink-100 to-primary-100 rounded-lg animate-pulse mx-auto w-48 mb-2" />
        <div className="h-4 bg-sage-100 rounded animate-pulse mx-auto w-64" />
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="animate-pulse space-y-4">
          <div className="h-11 bg-gradient-to-r from-pink-100 to-primary-100 rounded-xl" />
          <div className="h-11 bg-gradient-to-r from-primary-100 to-pink-100 rounded-xl" />
          <div className="h-12 bg-gradient-to-r from-primary-300 to-pink-300 rounded-xl" />
        </div>
      </CardContent>
    </Card>
  );
}

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center px-4 relative overflow-hidden">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-pink-50 via-white to-primary-50" />

      {/* Decorative elements */}
      <FloatingFlowers className="z-0" />
      <GradientBlob className="w-96 h-96 -top-48 -left-48" variant="purple" />
      <GradientBlob className="w-96 h-96 -bottom-48 -right-48" variant="pink" />

      <div className="w-full max-w-md relative z-10">
        <Link
          href="/"
          className="inline-flex items-center text-sm text-sage-600 hover:text-primary-600 mb-8 group transition-colors"
        >
          <ArrowLeft className="mr-2 h-4 w-4 group-hover:-translate-x-1 transition-transform" />
          Back to home
        </Link>

        <Suspense fallback={<LoginFormFallback />}>
          <LoginForm />
        </Suspense>

        {/* Bottom branding */}
        <div className="mt-8 text-center">
          <Link href="/" className="inline-flex items-center gap-2 opacity-60 hover:opacity-100 transition-opacity">
            <LotusFlower className="w-6 h-6 text-pink-400" />
            <span className="text-sm font-display font-medium text-gradient">JoginAna</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
