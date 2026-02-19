"use client";

import MuxPlayer from "@mux/mux-player-react";

interface VideoPlayerProps {
  videoUrl?: string | null;
  muxPlaybackId?: string | null;
  title: string;
  posterUrl?: string | null;
}

export function VideoPlayer({ videoUrl, muxPlaybackId, title, posterUrl }: VideoPlayerProps) {
  // Priority: Mux playback > YouTube/Vimeo embed > direct video URL
  if (muxPlaybackId) {
    return (
      <div className="relative aspect-video rounded-xl overflow-hidden bg-sage-900">
        <MuxPlayer
          playbackId={muxPlaybackId}
          metadata={{ video_title: title }}
          streamType="on-demand"
          accentColor="#7c8c6e"
          poster={posterUrl || undefined}
          style={{ width: "100%", height: "100%", aspectRatio: "16/9" }}
        />
      </div>
    );
  }

  if (!videoUrl) {
    return null;
  }

  // Check for embedded video platforms
  const isYouTube =
    videoUrl.includes("youtube.com") || videoUrl.includes("youtu.be");
  const isVimeo = videoUrl.includes("vimeo.com");

  if (isYouTube) {
    const videoId = videoUrl.includes("youtu.be")
      ? videoUrl.split("/").pop()
      : new URLSearchParams(new URL(videoUrl).search).get("v");
    return (
      <div className="relative aspect-video rounded-xl overflow-hidden bg-sage-900">
        <iframe
          src={`https://www.youtube.com/embed/${videoId}?autoplay=0&rel=0`}
          title={title}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          className="absolute inset-0 w-full h-full"
        />
      </div>
    );
  }

  if (isVimeo) {
    const videoId = videoUrl.split("/").pop();
    return (
      <div className="relative aspect-video rounded-xl overflow-hidden bg-sage-900">
        <iframe
          src={`https://player.vimeo.com/video/${videoId}`}
          title={title}
          allow="autoplay; fullscreen; picture-in-picture"
          allowFullScreen
          className="absolute inset-0 w-full h-full"
        />
      </div>
    );
  }

  // Native video player for direct video URLs (MP4, WebM, etc.)
  return (
    <div className="relative aspect-video rounded-xl overflow-hidden bg-sage-900">
      <video
        src={videoUrl}
        className="w-full h-full object-contain"
        controls
        controlsList="nodownload"
        playsInline
        preload="metadata"
        poster={posterUrl || undefined}
      >
        Your browser does not support the video tag.
      </video>
    </div>
  );
}
