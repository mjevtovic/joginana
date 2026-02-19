import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

/**
 * POST /api/mux/webhook
 * Handles Mux webhook events.
 * When a video finishes processing, we update the class record
 * with the mux_asset_id and mux_playback_id.
 *
 * Uses @supabase/supabase-js directly (not the Next.js server client)
 * because webhooks are external requests with no cookies.
 */
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { type, data } = body;

    console.log("Mux webhook received:", type, JSON.stringify(data, null, 2));

    // Handle video.asset.ready - the video is done processing
    if (type === "video.asset.ready") {
      const assetId = data.id as string;
      const playbackId = data.playback_ids?.[0]?.id as string | undefined;
      const uploadId = data.upload_id as string | undefined;

      console.log("Mux webhook: asset ready", { assetId, playbackId, uploadId });

      if (!playbackId) {
        console.error("Mux webhook: No playback ID found for asset", assetId);
        return NextResponse.json({ received: true });
      }

      // Update any class that has this upload_id stored as mux_upload_id
      if (uploadId) {
        const supabase = createClient(
          process.env.NEXT_PUBLIC_SUPABASE_URL!,
          process.env.SUPABASE_SERVICE_ROLE_KEY!
        );

        const { data: updateData, error } = await supabase
          .from("classes")
          .update({
            mux_asset_id: assetId,
            mux_playback_id: playbackId,
          })
          .eq("mux_upload_id", uploadId)
          .select();

        if (error) {
          console.error("Mux webhook: Failed to update class:", error);
        } else {
          console.log(
            `Mux webhook: Updated class with asset ${assetId}, playback ${playbackId}`,
            updateData
          );
        }
      }
    }

    // Handle video.asset.errored - the video failed to process
    if (type === "video.asset.errored") {
      console.error("Mux webhook: Asset processing failed:", data.id, data.errors);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("Mux webhook error:", error);
    return NextResponse.json(
      { error: "Webhook processing failed" },
      { status: 500 }
    );
  }
}
