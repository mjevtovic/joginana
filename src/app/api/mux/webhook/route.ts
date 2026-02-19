import { NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/server";

/**
 * POST /api/mux/webhook
 * Handles Mux webhook events.
 * When a video finishes processing, we update the class record
 * with the mux_asset_id and mux_playback_id.
 */
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { type, data } = body;

    // Handle video.asset.ready - the video is done processing
    if (type === "video.asset.ready") {
      const assetId = data.id as string;
      const playbackId = data.playback_ids?.[0]?.id as string | undefined;
      const uploadId = data.upload_id as string | undefined;

      if (!playbackId) {
        console.error("Mux webhook: No playback ID found for asset", assetId);
        return NextResponse.json({ received: true });
      }

      // Update any class that has this upload_id stored as mux_upload_id
      if (uploadId) {
        const supabase = await createServiceClient();

        const { error } = await supabase
          .from("classes")
          .update({
            mux_asset_id: assetId,
            mux_playback_id: playbackId,
          })
          .eq("mux_upload_id", uploadId);

        if (error) {
          console.error("Mux webhook: Failed to update class:", error);
        } else {
          console.log(
            `Mux webhook: Updated class with asset ${assetId}, playback ${playbackId}`
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
