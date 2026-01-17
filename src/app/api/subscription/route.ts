import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createPortalSession } from "@/lib/stripe/server";

export async function GET() {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { data: profile } = await supabase
      .from("profiles")
      .select("subscription_status, stripe_customer_id")
      .eq("id", user.id)
      .single();

    return NextResponse.json({
      isSubscribed: profile?.subscription_status === "active",
      status: profile?.subscription_status || "free",
    });
  } catch (error) {
    console.error("Subscription check error:", error);
    return NextResponse.json(
      { error: "Failed to check subscription" },
      { status: 500 }
    );
  }
}

export async function POST() {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { data: profile } = await supabase
      .from("profiles")
      .select("stripe_customer_id")
      .eq("id", user.id)
      .single();

    if (!profile?.stripe_customer_id) {
      return NextResponse.json(
        { error: "No subscription found" },
        { status: 400 }
      );
    }

    const session = await createPortalSession(
      profile.stripe_customer_id,
      `${process.env.NEXT_PUBLIC_APP_URL}/classes`
    );

    return NextResponse.json({ url: session.url });
  } catch (error) {
    console.error("Portal session error:", error);
    return NextResponse.json(
      { error: "Failed to create portal session" },
      { status: 500 }
    );
  }
}
