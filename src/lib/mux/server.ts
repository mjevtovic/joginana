import Mux from "@mux/mux-node";

// Server-side only - never import this in client components
const mux = new Mux({
  tokenId: process.env.MUX_TOKEN_ID!,
  tokenSecret: process.env.MUX_TOKEN_SECRET!,
});

export { mux };

/**
 * Create a direct upload URL for the client.
 * The client uploads the video file directly to Mux (no server relay needed).
 * Once the upload completes, Mux will process the asset and send a webhook.
 */
export async function createMuxUpload(corsOrigin?: string) {
  const upload = await mux.video.uploads.create({
    cors_origin: corsOrigin || process.env.NEXT_PUBLIC_APP_URL || "*",
    new_asset_settings: {
      playback_policy: ["public"],
      // Mux will auto-generate a thumbnail from the video
      encoding_tier: "baseline",
    },
  });

  return {
    uploadId: upload.id,
    uploadUrl: upload.url,
  };
}

/**
 * Get the playback ID for an asset.
 */
export async function getMuxAsset(assetId: string) {
  const asset = await mux.video.assets.retrieve(assetId);
  return asset;
}

/**
 * Delete a Mux asset (cleanup when deleting a class).
 */
export async function deleteMuxAsset(assetId: string) {
  try {
    await mux.video.assets.delete(assetId);
  } catch (error) {
    // Asset may already be deleted or not found - log but don't throw
    console.error("Failed to delete Mux asset:", error);
  }
}

/**
 * Get a thumbnail URL from a Mux playback ID.
 * This can be used as a fallback when no custom thumbnail is uploaded.
 */
export function getMuxThumbnailUrl(playbackId: string) {
  return `https://image.mux.com/${playbackId}/thumbnail.jpg?width=640&height=360&fit_mode=smartcrop`;
}
