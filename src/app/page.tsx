import { Suspense } from "react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowRight, Calendar, Heart, Play, Sparkles, Moon, Sun, Flower2, Star, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { createClient } from "@/lib/supabase/server";
import { AuthCodeHandler } from "@/components/auth/auth-code-handler";
import { FloatingFlowers, LotusFlower, DreamCatcher, Mandala, OmSymbol, GradientBlob } from "@/components/ui/decorations";

const features = [
  {
    name: "Curated Classes",
    description:
      "Access a growing library of yoga classes for all levels, from gentle stretching to power flows.",
    icon: Play,
    gradient: "from-primary-500 to-pink-500",
  },
  {
    name: "Personalized Plans",
    description:
      "Get AI-powered weekly practice plans tailored to your goals, schedule, and experience level.",
    icon: Sparkles,
    gradient: "from-pink-500 to-primary-500",
  },
  {
    name: "Weekly Planner",
    description:
      "Stay consistent with an intuitive planner that adapts to your lifestyle and tracks your progress.",
    icon: Calendar,
    gradient: "from-primary-400 to-pink-400",
  },
  {
    name: "Save Favorites",
    description:
      "Build your personal collection of go-to classes for easy access whenever you need them.",
    icon: Heart,
    gradient: "from-pink-400 to-primary-400",
  },
];

const testimonials = [
  {
    content:
      "JoginAna has completely transformed my morning routine. The personalized plans keep me motivated and consistent.",
    author: "Ana M.",
    role: "Practicing for 2 years",
  },
  {
    content:
      "As a beginner, I was intimidated by yoga. The structured approach here made it so accessible and enjoyable.",
    author: "Maria T.",
    role: "Started 6 months ago",
  },
  {
    content:
      "The weekly planner is a game-changer. I finally have a sustainable practice that fits my busy schedule.",
    author: "Elena L.",
    role: "Advanced practitioner",
  },
];

const stats = [
  { value: "10K+", label: "Active Yogis", icon: Star },
  { value: "500+", label: "Classes", icon: Play },
  { value: "98%", label: "Happy Users", icon: Heart },
];

export default async function HomePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // If user is logged in, redirect to /app (the mobile-first dashboard)
  if (user) {
    redirect("/app");
  }

  return (
    <div className="min-h-screen relative overflow-hidden">
      <Suspense fallback={null}>
        <AuthCodeHandler />
      </Suspense>

      {/* Global decorative elements */}
      <FloatingFlowers className="fixed" />

      <Header user={null} />

      {/* Hero Section */}
      <section className="relative isolate pt-24 lg:pt-32 overflow-hidden">
        {/* Background blobs */}
        <GradientBlob className="w-[600px] h-[600px] -top-40 -right-40" variant="purple" />
        <GradientBlob className="w-[500px] h-[500px] top-1/2 -left-40" variant="pink" />
        <GradientBlob className="w-[400px] h-[400px] bottom-0 right-1/4" variant="purple" />

        {/* Animated floating decorations */}
        <div className="absolute top-32 right-10 opacity-20 animate-float" style={{ animationDelay: '0s' }}>
          <DreamCatcher className="w-20 h-24 text-primary-400" />
        </div>
        <div className="absolute top-48 left-10 opacity-15 animate-float" style={{ animationDelay: '1s' }}>
          <OmSymbol className="w-16 h-16 text-pink-400" />
        </div>
        <div className="absolute bottom-20 right-20 opacity-10 animate-float" style={{ animationDelay: '2s' }}>
          <LotusFlower className="w-24 h-24 text-primary-300" />
        </div>

        <div className="mx-auto max-w-7xl px-4 py-24 sm:py-32 lg:px-8 relative">
          <div className="mx-auto max-w-3xl text-center">
            {/* Logo lotus with glow effect */}
            <div className="flex justify-center mb-8">
              <div className="relative">
                <LotusFlower className="w-28 h-28 text-pink-400 animate-float drop-shadow-2xl" />
                <div className="absolute inset-0 w-28 h-28 bg-gradient-to-br from-primary-400/30 to-pink-400/30 rounded-full blur-2xl animate-pulse" />
                {/* Sparkle effects */}
                <Sparkles className="absolute -top-2 -right-2 w-6 h-6 text-amber-400 animate-pulse" />
                <Sparkles className="absolute -bottom-2 -left-2 w-5 h-5 text-pink-400 animate-pulse" style={{ animationDelay: '0.5s' }} />
              </div>
            </div>

            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-primary-100/80 to-pink-100/80 backdrop-blur-sm border border-pink-200/50 mb-6">
              <Zap className="w-4 h-4 text-primary-600" />
              <span className="text-sm font-medium text-primary-700">Your 2026 Yoga Companion</span>
            </div>

            <h1 className="font-display text-6xl font-bold tracking-tight sm:text-8xl">
              <span className="text-gradient drop-shadow-sm">JoginAna</span>
            </h1>
            <p className="mt-2 font-display text-2xl text-sage-700 sm:text-3xl flex items-center justify-center gap-3">
              <LotusFlower className="w-6 h-6 text-pink-400" />
              Find Your Inner Peace
              <LotusFlower className="w-6 h-6 text-pink-400" />
            </p>
            <p className="mt-6 text-lg leading-8 text-sage-600 max-w-2xl mx-auto">
              Discover personalized yoga classes, build a sustainable practice
              with our weekly planner, and transform your mind-body connection
              on your unique spiritual journey.
            </p>
            <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link href="/login">
                <Button size="lg" className="bg-gradient-to-r from-primary-600 to-pink-600 hover:from-primary-700 hover:to-pink-700 shadow-xl shadow-primary-500/30 animate-pulse-glow text-lg px-8 py-6">
                  Begin Your Journey
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Link href="/pricing">
                <Button variant="outline" size="lg" className="border-pink-300 text-primary-700 hover:bg-pink-50/50 backdrop-blur-sm text-lg px-8 py-6">
                  <Sparkles className="mr-2 h-5 w-5 text-pink-500" />
                  View Pricing
                </Button>
              </Link>
            </div>

            {/* Stats */}
            <div className="mt-16 flex justify-center gap-8 sm:gap-12">
              {stats.map((stat, i) => (
                <div key={i} className="text-center group">
                  <div className="flex items-center justify-center gap-2">
                    <stat.icon className="w-5 h-5 text-pink-500 group-hover:scale-110 transition-transform" />
                    <span className="text-2xl sm:text-3xl font-bold text-gradient">{stat.value}</span>
                  </div>
                  <span className="text-sm text-sage-500">{stat.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Decorative mandala */}
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[1000px] h-[500px] overflow-hidden opacity-15 pointer-events-none">
          <Mandala className="w-full h-full" />
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-24 sm:py-32 relative">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-white/90 to-transparent" />

        {/* Floating decorations */}
        <div className="absolute top-20 left-10 opacity-10 animate-float">
          <DreamCatcher className="w-24 h-28 text-primary-400" />
        </div>
        <div className="absolute bottom-20 right-10 opacity-10 animate-float" style={{ animationDelay: '1.5s' }}>
          <OmSymbol className="w-20 h-20 text-pink-400" />
        </div>

        <div className="mx-auto max-w-7xl px-4 lg:px-8 relative">
          <div className="mx-auto max-w-2xl text-center">
            <div className="flex justify-center mb-4">
              <div className="relative">
                <Flower2 className="h-10 w-10 text-pink-400" />
                <div className="absolute inset-0 bg-pink-400/20 blur-xl rounded-full" />
              </div>
            </div>
            <h2 className="font-display text-4xl font-bold tracking-tight sm:text-5xl">
              <span className="text-gradient">Everything You Need</span>
            </h2>
            <p className="mt-4 text-lg text-sage-600">
              A complete yoga platform designed to support every step of your
              spiritual journey.
            </p>
          </div>
          <div className="mx-auto mt-16 max-w-5xl">
            <div className="grid grid-cols-1 gap-8 sm:grid-cols-2">
              {features.map((feature, index) => (
                <div
                  key={feature.name}
                  className="group relative rounded-3xl glass border border-pink-100/50 p-8 hover:shadow-2xl hover:shadow-primary-500/20 hover:border-pink-200 transition-all duration-500 hover:-translate-y-1"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  {/* Background decoration */}
                  <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-primary-100/50 to-pink-100/50 rounded-full blur-2xl opacity-0 group-hover:opacity-100 transition-opacity" />

                  <div className={`relative flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br ${feature.gradient} text-white shadow-xl shadow-primary-500/25 group-hover:scale-110 transition-transform duration-300`}>
                    <feature.icon className="h-8 w-8" />
                  </div>
                  <h3 className="mt-6 text-xl font-display font-bold text-sage-900 group-hover:text-gradient transition-all">
                    {feature.name}
                  </h3>
                  <p className="mt-3 text-sage-600 leading-relaxed">{feature.description}</p>

                  {/* Hover decoration */}
                  <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-all duration-300 transform group-hover:rotate-12">
                    <LotusFlower className="w-10 h-10 text-pink-300" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-24 sm:py-32 relative">
        <div className="absolute inset-0 bg-pattern-mandala opacity-40" />
        <GradientBlob className="w-[400px] h-[400px] top-0 left-1/4 opacity-30" variant="pink" />
        <GradientBlob className="w-[300px] h-[300px] bottom-0 right-1/4 opacity-20" variant="purple" />

        <div className="mx-auto max-w-7xl px-4 lg:px-8 relative">
          <div className="mx-auto max-w-2xl text-center">
            <div className="relative inline-block">
              <DreamCatcher className="w-20 h-24 mx-auto mb-4 text-primary-400" />
              <Sparkles className="absolute top-0 right-0 w-5 h-5 text-amber-400 animate-pulse" />
            </div>
            <h2 className="font-display text-4xl font-bold tracking-tight sm:text-5xl">
              <span className="text-gradient">Loved by Yogis</span>
            </h2>
            <p className="mt-4 text-lg text-sage-600">
              Join thousands who have transformed their practice with JoginAna.
            </p>
          </div>
          <div className="mx-auto mt-16 grid max-w-5xl grid-cols-1 gap-8 sm:grid-cols-3">
            {testimonials.map((testimonial, index) => (
              <div
                key={index}
                className="group rounded-3xl glass border border-pink-100/50 p-8 hover:shadow-2xl hover:shadow-pink-500/15 hover:border-pink-200 transition-all duration-500 hover:-translate-y-1"
              >
                {/* Stars */}
                <div className="flex gap-1 mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 text-amber-400 fill-amber-400" />
                  ))}
                </div>
                <p className="text-sage-700 italic leading-relaxed">
                  &ldquo;{testimonial.content}&rdquo;
                </p>
                <div className="mt-6 flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary-400 to-pink-400 flex items-center justify-center text-white font-bold text-lg shadow-lg shadow-primary-500/25">
                    {testimonial.author[0]}
                  </div>
                  <div>
                    <p className="font-semibold text-sage-900">
                      {testimonial.author}
                    </p>
                    <p className="text-sm text-sage-500">{testimonial.role}</p>
                  </div>
                </div>

                {/* Hover lotus */}
                <div className="absolute bottom-4 right-4 opacity-0 group-hover:opacity-30 transition-opacity">
                  <LotusFlower className="w-12 h-12 text-pink-400" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 sm:py-32 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary-600 via-primary-700 to-pink-600" />
        <div className="absolute inset-0 bg-pattern-lotus opacity-10" />
        <div className="absolute inset-0 bg-pattern-mandala opacity-5" />

        {/* Decorative elements */}
        <LotusFlower className="absolute -top-20 -left-20 w-96 h-96 text-white/10 animate-float" />
        <LotusFlower className="absolute -bottom-20 -right-20 w-96 h-96 text-white/10 animate-float" style={{ animationDelay: '1.5s' }} />
        <DreamCatcher className="absolute top-10 right-10 w-32 h-40 text-white/10" />
        <OmSymbol className="absolute bottom-10 left-10 w-24 h-24 text-white/10" />

        <div className="mx-auto max-w-7xl px-4 lg:px-8 text-center relative">
          <div className="relative inline-block mb-6">
            <Moon className="w-14 h-14 text-pink-200" />
            <Sparkles className="absolute -top-1 -right-1 w-5 h-5 text-amber-300 animate-pulse" />
          </div>
          <h2 className="font-display text-4xl font-bold tracking-tight text-white sm:text-6xl">
            Ready to Begin Your Journey?
          </h2>
          <p className="mx-auto mt-6 max-w-xl text-lg text-primary-100">
            Start with 2 free classes and experience the JoginAna difference.
            No credit card required.
          </p>
          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/login">
              <Button
                variant="secondary"
                size="lg"
                className="bg-white text-primary-600 hover:bg-pink-50 shadow-2xl text-lg px-8 py-6"
              >
                Get Started Free
                <Sun className="ml-2 h-5 w-5" />
              </Button>
            </Link>
          </div>

          {/* Floating elements */}
          <div className="mt-16 flex justify-center gap-6 opacity-50">
            <LotusFlower className="w-8 h-8 text-white animate-float" />
            <OmSymbol className="w-8 h-8 text-white animate-float" style={{ animationDelay: '0.5s' }} />
            <Mandala className="w-8 h-8 text-white animate-float" style={{ animationDelay: '1s' }} />
            <DreamCatcher className="w-8 h-10 text-white animate-float" style={{ animationDelay: '1.5s' }} />
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
