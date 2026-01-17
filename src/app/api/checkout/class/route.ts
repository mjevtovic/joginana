import { NextRequest, NextResponse } from "next/server";
import { createClient, createServiceClient } from "@/lib/supabase/server";
import { createOneTimeCheckoutSession, createCustomer } from "@/lib/stripe/server";
import type { Profile, YogaClass } from "@/types/database";

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { classId } = await request.json();

    if (!classId) {
      return NextResponse.json(
        { error: "Class ID is required" },
        { status: 400 }
      );
    }

    // Get the class details
    const serviceClient = await createServiceClient();
    const { data: classData, error: classError } = await serviceClient
      .from("classes")
      .select("*")
      .eq("id", classId)
      .single();

    if (classError || !classData) {
      return NextResponse.json(
        { error: "Class not found" },
        { status: 404 }
      );
    }

    const yogaClass = classData as YogaClass;

    // Check if class is purchasable
    if (yogaClass.access_type !== "one_time") {
      return NextResponse.json(
        { error: "This class is not available for purchase" },
        { status: 400 }
      );
    }

    if (!yogaClass.one_time_price_cents) {
      return NextResponse.json(
        { error: "Class price is not set" },
        { status: 400 }
      );
    }

    // Check if user already purchased
    const { data: existingPurchase } = await serviceClient
      .from("class_purchases")
      .select("id")
      .eq("user_id", user.id)
      .eq("class_id", classId)
      .eq("status", "paid")
      .single();

    if (existingPurchase) {
      return NextResponse.json(
        { error: "You have already purchased this class" },
        { status: 400 }
      );
    }

    // Get or create profile with Stripe customer
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

    // Create checkout session
    const session = await createOneTimeCheckoutSession({
      customerId: stripeCustomerId,
      classId: yogaClass.id,
      classTitle: yogaClass.title,
      amountCents: yogaClass.one_time_price_cents,
      currency: yogaClass.currency || "EUR",
      successUrl: `${process.env.NEXT_PUBLIC_APP_URL}/app/classes/${classId}?purchased=true`,
      cancelUrl: `${process.env.NEXT_PUBLIC_APP_URL}/app/classes/${classId}?canceled=true`,
    });

    // Create pending purchase record
    await serviceClient.from("class_purchases").insert({
      user_id: user.id,
      class_id: classId,
      stripe_checkout_session_id: session.id,
      amount_cents: yogaClass.one_time_price_cents,
      currency: yogaClass.currency || "EUR",
      status: "pending",
    });

    return NextResponse.json({ url: session.url });
  } catch (error) {
    console.error("Class checkout error:", error);
    return NextResponse.json(
      { error: "Failed to create checkout session" },
      { status: 500 }
    );
  }
}
