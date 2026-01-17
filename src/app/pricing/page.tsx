import Link from "next/link";
import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { createClient } from "@/lib/supabase/server";
import { cn } from "@/lib/utils";

const tiers = [
  {
    name: "Free",
    id: "free",
    price: "$0",
    description: "Perfect for trying out JoginAna",
    features: [
      "2 free preview classes",
      "Browse full class library",
      "Basic progress tracking",
      "Mobile-friendly experience",
    ],
    cta: "Get Started",
    featured: false,
  },
  {
    name: "Premium",
    id: "premium",
    price: "$9.99",
    period: "/month",
    description: "Unlimited access to transform your practice",
    features: [
      "Unlimited class access",
      "AI-powered weekly planner",
      "Personalized recommendations",
      "Save favorite classes",
      "Detailed progress analytics",
      "Offline viewing (coming soon)",
      "Priority support",
    ],
    cta: "Start Free Trial",
    featured: true,
  },
];

export default async function PricingPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let profile = null;
  if (user) {
    const { data } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .single();
    profile = data;
  }

  const isSubscribed = profile?.subscription_status === "active";

  return (
    <div className="min-h-screen">
      <Header user={profile} />

      <section className="pt-32 pb-24">
        <div className="mx-auto max-w-7xl px-4 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <h1 className="font-display text-4xl font-bold tracking-tight text-sage-900 sm:text-5xl">
              Simple, Transparent Pricing
            </h1>
            <p className="mt-4 text-lg text-sage-600">
              Start free, upgrade when you&apos;re ready. No hidden fees, cancel
              anytime.
            </p>
          </div>

          <div className="mx-auto mt-16 grid max-w-4xl grid-cols-1 gap-8 lg:grid-cols-2">
            {tiers.map((tier) => (
              <div
                key={tier.id}
                className={cn(
                  "relative rounded-2xl p-8",
                  tier.featured
                    ? "bg-primary-600 text-white shadow-xl ring-2 ring-primary-600"
                    : "bg-white border border-sage-200"
                )}
              >
                {tier.featured && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                    <span className="inline-flex items-center rounded-full bg-primary-100 px-4 py-1 text-sm font-medium text-primary-700">
                      Most Popular
                    </span>
                  </div>
                )}

                <div className="text-center">
                  <h2
                    className={cn(
                      "text-lg font-semibold",
                      tier.featured ? "text-white" : "text-sage-900"
                    )}
                  >
                    {tier.name}
                  </h2>
                  <div className="mt-4 flex items-baseline justify-center gap-x-1">
                    <span
                      className={cn(
                        "text-5xl font-bold tracking-tight",
                        tier.featured ? "text-white" : "text-sage-900"
                      )}
                    >
                      {tier.price}
                    </span>
                    {tier.period && (
                      <span
                        className={cn(
                          "text-sm",
                          tier.featured ? "text-primary-100" : "text-sage-500"
                        )}
                      >
                        {tier.period}
                      </span>
                    )}
                  </div>
                  <p
                    className={cn(
                      "mt-4 text-sm",
                      tier.featured ? "text-primary-100" : "text-sage-600"
                    )}
                  >
                    {tier.description}
                  </p>
                </div>

                <ul className="mt-8 space-y-3">
                  {tier.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-3">
                      <Check
                        className={cn(
                          "h-5 w-5 flex-shrink-0",
                          tier.featured ? "text-primary-200" : "text-primary-600"
                        )}
                      />
                      <span
                        className={cn(
                          "text-sm",
                          tier.featured ? "text-primary-50" : "text-sage-700"
                        )}
                      >
                        {feature}
                      </span>
                    </li>
                  ))}
                </ul>

                <div className="mt-8">
                  {tier.featured ? (
                    isSubscribed ? (
                      <Button
                        variant="secondary"
                        className="w-full bg-white text-primary-600 hover:bg-primary-50"
                        disabled
                      >
                        Current Plan
                      </Button>
                    ) : (
                      <Link href={user ? "/api/checkout" : "/login"}>
                        <Button
                          variant="secondary"
                          className="w-full bg-white text-primary-600 hover:bg-primary-50"
                        >
                          {tier.cta}
                        </Button>
                      </Link>
                    )
                  ) : (
                    <Link href={user ? "/classes" : "/login"}>
                      <Button variant="outline" className="w-full">
                        {tier.cta}
                      </Button>
                    </Link>
                  )}
                </div>
              </div>
            ))}
          </div>

          <div className="mx-auto mt-16 max-w-2xl text-center">
            <h3 className="text-lg font-semibold text-sage-900">
              Frequently Asked Questions
            </h3>
            <div className="mt-8 space-y-6 text-left">
              <div>
                <h4 className="font-medium text-sage-900">
                  Can I cancel anytime?
                </h4>
                <p className="mt-2 text-sage-600">
                  Yes! You can cancel your subscription at any time. You&apos;ll
                  continue to have access until the end of your billing period.
                </p>
              </div>
              <div>
                <h4 className="font-medium text-sage-900">
                  What happens after my free trial?
                </h4>
                <p className="mt-2 text-sage-600">
                  After your 7-day free trial, you&apos;ll be charged $9.99/month.
                  You can cancel before the trial ends to avoid charges.
                </p>
              </div>
              <div>
                <h4 className="font-medium text-sage-900">
                  Do you offer refunds?
                </h4>
                <p className="mt-2 text-sage-600">
                  We offer a 30-day money-back guarantee. If you&apos;re not
                  satisfied, contact us for a full refund.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
