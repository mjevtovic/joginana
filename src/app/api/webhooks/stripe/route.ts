import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { stripe } from "@/lib/stripe/server";
import { createServiceClient } from "@/lib/supabase/server";

export async function POST(request: NextRequest) {
  const body = await request.text();
  const signature = request.headers.get("stripe-signature");

  if (!signature) {
    return NextResponse.json(
      { error: "Missing stripe-signature header" },
      { status: 400 }
    );
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err) {
    console.error("Webhook signature verification failed:", err);
    return NextResponse.json(
      { error: "Invalid signature" },
      { status: 400 }
    );
  }

  const supabase = await createServiceClient();

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        const customerId = session.customer as string;

        // Check if this is a class purchase or subscription
        const metadata = session.metadata;
        if (metadata?.type === "class_purchase" && metadata?.class_id) {
          // Handle one-time class purchase
          const paymentIntent = session.payment_intent as string;

          await supabase
            .from("class_purchases")
            .update({
              status: "paid",
              stripe_payment_intent_id: paymentIntent,
            })
            .eq("stripe_checkout_session_id", session.id);

          console.log(`Class purchase completed: ${metadata.class_id}`);
        } else {
          // Handle subscription checkout
          const subscriptionId = session.subscription as string;

          await supabase
            .from("profiles")
            .update({
              subscription_status: "active",
              subscription_id: subscriptionId,
            })
            .eq("stripe_customer_id", customerId);
        }

        break;
      }

      case "customer.subscription.updated": {
        const subscription = event.data.object as Stripe.Subscription;
        const customerId = subscription.customer as string;
        const status = subscription.status;

        let subscriptionStatus: string;
        switch (status) {
          case "active":
          case "trialing":
            subscriptionStatus = "active";
            break;
          case "past_due":
            subscriptionStatus = "past_due";
            break;
          case "canceled":
          case "unpaid":
            subscriptionStatus = "canceled";
            break;
          default:
            subscriptionStatus = "free";
        }

        await supabase
          .from("profiles")
          .update({
            subscription_status: subscriptionStatus,
          })
          .eq("stripe_customer_id", customerId);

        break;
      }

      case "customer.subscription.deleted": {
        const subscription = event.data.object as Stripe.Subscription;
        const customerId = subscription.customer as string;

        await supabase
          .from("profiles")
          .update({
            subscription_status: "free",
            subscription_id: null,
          })
          .eq("stripe_customer_id", customerId);

        break;
      }
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("Webhook handler error:", error);
    return NextResponse.json(
      { error: "Webhook handler failed" },
      { status: 500 }
    );
  }
}
