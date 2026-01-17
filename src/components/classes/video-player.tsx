"use client";

import { useState } from "react";
import { Play, Pause, Volume2, VolumeX, Maximize } from "lucide-react";

interface VideoPlayerProps {
  videoUrl: string;
  title: string;
}

export function VideoPlayer({ videoUrl, title }: VideoPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);

  // For a real implementation, we'd use a proper video player library
  // This is a simplified placeholder that handles common video URLs
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

  // Native video player for direct video URLs
  return (
    <div className="relative aspect-video rounded-xl overflow-hidden bg-sage-900 group">
      <video
        src={videoUrl}
        className="w-full h-full object-contain"
        controls={false}
        muted={isMuted}
        onClick={() => setIsPlaying(!isPlaying)}
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
      />

      {/* Custom controls overlay */}
      <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
        <button
          onClick={() => setIsPlaying(!isPlaying)}
          className="p-4 rounded-full bg-white/90 hover:bg-white transition-colors"
        >
          {isPlaying ? (
            <Pause className="h-8 w-8 text-sage-900" />
          ) : (
            <Play className="h-8 w-8 text-sage-900 ml-1" />
          )}
        </button>
      </div>

      {/* Bottom controls */}
      <div className="absolute bottom-0 inset-x-0 p-4 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
        <div className="flex items-center justify-between">
          <button
            onClick={() => setIsMuted(!isMuted)}
            className="p-2 rounded-full hover:bg-white/20 transition-colors"
          >
            {isMuted ? (
              <VolumeX className="h-5 w-5 text-white" />
            ) : (
              <Volume2 className="h-5 w-5 text-white" />
            )}
          </button>
          <button className="p-2 rounded-full hover:bg-white/20 transition-colors">
            <Maximize className="h-5 w-5 text-white" />
          </button>
        </div>
      </div>
    </div>
  );
}
