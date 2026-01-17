"use client";

import { useRef, useState, useCallback, useEffect } from "react";
import { RefreshCw } from "lucide-react";
import { cn } from "@/lib/utils";

interface PullToRefreshProps {
  onRefresh: () => Promise<void>;
  children: React.ReactNode;
  className?: string;
}

export function PullToRefresh({ onRefresh, children, className }: PullToRefreshProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [pullDistance, setPullDistance] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [touchStart, setTouchStart] = useState<number | null>(null);

  const threshold = 80; // Distance needed to trigger refresh
  const maxPull = 120; // Maximum pull distance

  const handleTouchStart = useCallback((e: TouchEvent) => {
    // Only allow pull-to-refresh when scrolled to top
    if (containerRef.current && containerRef.current.scrollTop === 0) {
      setTouchStart(e.touches[0].clientY);
    }
  }, []);

  const handleTouchMove = useCallback((e: TouchEvent) => {
    if (touchStart === null || isRefreshing) return;

    const currentY = e.touches[0].clientY;
    const diff = currentY - touchStart;

    if (diff > 0) {
      // Apply resistance - pull gets harder the further you go
      const resistance = 0.5;
      const distance = Math.min(diff * resistance, maxPull);
      setPullDistance(distance);

      // Prevent default scroll when pulling
      if (distance > 0) {
        e.preventDefault();
      }
    }
  }, [touchStart, isRefreshing, maxPull]);

  const handleTouchEnd = useCallback(async () => {
    if (pullDistance >= threshold && !isRefreshing) {
      setIsRefreshing(true);
      setPullDistance(threshold / 2); // Keep some distance while refreshing

      try {
        await onRefresh();
      } finally {
        setIsRefreshing(false);
        setPullDistance(0);
      }
    } else {
      setPullDistance(0);
    }
    setTouchStart(null);
  }, [pullDistance, threshold, isRefreshing, onRefresh]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    container.addEventListener("touchstart", handleTouchStart, { passive: true });
    container.addEventListener("touchmove", handleTouchMove, { passive: false });
    container.addEventListener("touchend", handleTouchEnd);

    return () => {
      container.removeEventListener("touchstart", handleTouchStart);
      container.removeEventListener("touchmove", handleTouchMove);
      container.removeEventListener("touchend", handleTouchEnd);
    };
  }, [handleTouchStart, handleTouchMove, handleTouchEnd]);

  const progress = Math.min(pullDistance / threshold, 1);
  const showIndicator = pullDistance > 10 || isRefreshing;

  return (
    <div ref={containerRef} className={cn("relative overflow-auto", className)}>
      {/* Pull indicator */}
      <div
        className={cn(
          "absolute left-0 right-0 flex justify-center transition-all duration-200 z-50",
          showIndicator ? "opacity-100" : "opacity-0"
        )}
        style={{
          top: Math.max(pullDistance - 50, -50),
          transform: `translateY(${isRefreshing ? 0 : pullDistance > threshold ? 10 : 0}px)`
        }}
      >
        <div className={cn(
          "flex items-center justify-center w-10 h-10 rounded-full bg-white shadow-lg border border-pink-100",
          isRefreshing && "animate-pulse"
        )}>
          <RefreshCw
            className={cn(
              "w-5 h-5 text-primary-500 transition-transform duration-200",
              isRefreshing && "animate-spin"
            )}
            style={{
              transform: isRefreshing ? undefined : `rotate(${progress * 180}deg)`,
            }}
          />
        </div>
      </div>

      {/* Content with pull transform */}
      <div
        style={{
          transform: `translateY(${pullDistance}px)`,
          transition: touchStart === null ? "transform 0.2s ease-out" : "none"
        }}
      >
        {children}
      </div>
    </div>
  );
}
