import { NextResponse } from "next/server";
import { createClient, createServiceClient } from "@/lib/supabase/server";
import { createCheckoutSession, createCustomer } from "@/lib/stripe/server";
import type { Profile } from "@/types/database";

export async function GET() {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.redirect(
        new URL("/login", process.env.NEXT_PUBLIC_APP_URL)
      );
    }

    // Get or create profile with Stripe customer
    const serviceClient = await createServiceClient();
    const { data } = await serviceClient
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .single();

    const profile = data as Profile | null;
    let stripeCustomerId = profile?.stripe_customer_id;

    if (!stripeCustomerId) {
      const customer = await createCustomer(
        user.email!,
        profile?.full_name || undefined
      );
      stripeCustomerId = customer.id;

      await serviceClient
        .from("profiles")
        .update({ stripe_customer_id: stripeCustomerId })
        .eq("id", user.id);
    }

    const session = await createCheckoutSession(
      stripeCustomerId,
      process.env.STRIPE_PRICE_ID!,
      `${process.env.NEXT_PUBLIC_APP_URL}/classes?success=true`,
      `${process.env.NEXT_PUBLIC_APP_URL}/pricing?canceled=true`
    );

    if (!session.url) {
      return NextResponse.json(
        { error: "Failed to create checkout session" },
        { status: 500 }
      );
    }

    return NextResponse.redirect(session.url);
  } catch (error) {
    console.error("Checkout error:", error);
    return NextResponse.json(
      { error: "Failed to create checkout session" },
      { status: 500 }
    );
  }
}
