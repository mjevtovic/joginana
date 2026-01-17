"use client";

import { cn } from "@/lib/utils";

// Lotus Flower SVG
export function LotusFlower({ className, style }: { className?: string; style?: React.CSSProperties }) {
  return (
    <svg
      viewBox="0 0 100 100"
      className={cn("text-pink-300", className)}
      fill="currentColor"
      style={style}
    >
      {/* Center petal */}
      <ellipse cx="50" cy="45" rx="8" ry="25" opacity="0.9" />
      {/* Left petals */}
      <ellipse cx="35" cy="50" rx="8" ry="20" transform="rotate(-30 35 50)" opacity="0.7" />
      <ellipse cx="25" cy="55" rx="7" ry="18" transform="rotate(-50 25 55)" opacity="0.5" />
      {/* Right petals */}
      <ellipse cx="65" cy="50" rx="8" ry="20" transform="rotate(30 65 50)" opacity="0.7" />
      <ellipse cx="75" cy="55" rx="7" ry="18" transform="rotate(50 75 55)" opacity="0.5" />
      {/* Base */}
      <ellipse cx="50" cy="75" rx="20" ry="5" className="text-primary-300" fill="currentColor" opacity="0.6" />
    </svg>
  );
}

// Dream Catcher SVG
export function DreamCatcher({ className, style }: { className?: string; style?: React.CSSProperties }) {
  return (
    <svg
      viewBox="0 0 100 120"
      className={cn("text-primary-300", className)}
      fill="none"
      stroke="currentColor"
      strokeWidth="1"
      style={style}
    >
      {/* Outer ring */}
      <circle cx="50" cy="40" r="35" opacity="0.6" />
      <circle cx="50" cy="40" r="32" opacity="0.4" />

      {/* Inner web pattern */}
      <circle cx="50" cy="40" r="25" opacity="0.3" />
      <circle cx="50" cy="40" r="18" opacity="0.3" />
      <circle cx="50" cy="40" r="11" opacity="0.3" />
      <circle cx="50" cy="40" r="5" fill="currentColor" opacity="0.5" />

      {/* Web lines */}
      <line x1="50" y1="5" x2="50" y2="75" opacity="0.2" />
      <line x1="15" y1="40" x2="85" y2="40" opacity="0.2" />
      <line x1="25" y1="15" x2="75" y2="65" opacity="0.2" />
      <line x1="75" y1="15" x2="25" y2="65" opacity="0.2" />

      {/* Feathers */}
      <path d="M30 75 Q25 90 30 105" className="text-pink-300" stroke="currentColor" opacity="0.5" />
      <path d="M50 75 Q50 95 50 110" className="text-pink-400" stroke="currentColor" opacity="0.5" />
      <path d="M70 75 Q75 90 70 105" className="text-pink-300" stroke="currentColor" opacity="0.5" />

      {/* Beads */}
      <circle cx="30" cy="78" r="2" fill="currentColor" className="text-primary-400" opacity="0.7" />
      <circle cx="50" cy="78" r="2" fill="currentColor" className="text-pink-400" opacity="0.7" />
      <circle cx="70" cy="78" r="2" fill="currentColor" className="text-primary-400" opacity="0.7" />
    </svg>
  );
}

// Mandala Pattern
export function Mandala({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 100 100"
      className={cn("text-primary-200", className)}
      fill="none"
      stroke="currentColor"
      strokeWidth="0.5"
    >
      {/* Concentric circles */}
      <circle cx="50" cy="50" r="45" opacity="0.3" />
      <circle cx="50" cy="50" r="38" opacity="0.4" />
      <circle cx="50" cy="50" r="30" opacity="0.5" />
      <circle cx="50" cy="50" r="22" opacity="0.6" />
      <circle cx="50" cy="50" r="14" opacity="0.7" />
      <circle cx="50" cy="50" r="6" fill="currentColor" className="text-pink-300" opacity="0.5" />

      {/* Petal patterns */}
      {[0, 45, 90, 135, 180, 225, 270, 315].map((angle) => (
        <ellipse
          key={angle}
          cx="50"
          cy="25"
          rx="4"
          ry="12"
          transform={`rotate(${angle} 50 50)`}
          className="text-pink-200"
          stroke="currentColor"
          opacity="0.4"
        />
      ))}
    </svg>
  );
}

// Om Symbol
export function OmSymbol({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 100 100"
      className={cn("text-primary-400", className)}
      fill="currentColor"
    >
      <path
        d="M25 70 Q15 60 20 45 Q25 30 40 30 Q55 30 55 45 Q55 55 45 60 Q35 65 35 75 Q35 85 50 85 Q65 85 70 70 Q75 55 70 40 Q65 25 50 20 Q35 15 25 25 M75 25 Q85 25 85 35 Q85 45 75 45 M80 15 L80 20"
        opacity="0.6"
      />
    </svg>
  );
}

// Floating Flowers Background
export function FloatingFlowers({ className }: { className?: string }) {
  return (
    <div className={cn("absolute inset-0 overflow-hidden pointer-events-none", className)}>
      {/* Top left lotus */}
      <LotusFlower className="absolute -top-10 -left-10 w-40 h-40 opacity-20 animate-float" />

      {/* Top right dream catcher */}
      <DreamCatcher className="absolute -top-5 -right-10 w-32 h-40 opacity-15" style={{ animationDelay: '1s' }} />

      {/* Bottom left mandala */}
      <Mandala className="absolute bottom-20 -left-20 w-60 h-60 opacity-10" />

      {/* Bottom right lotus */}
      <LotusFlower className="absolute -bottom-10 right-10 w-36 h-36 opacity-15 animate-float" style={{ animationDelay: '2s' }} />

      {/* Center decorations */}
      <div className="absolute top-1/4 right-1/4 w-20 h-20 opacity-10">
        <OmSymbol className="w-full h-full" />
      </div>

      {/* Small floating elements */}
      <div className="absolute top-1/3 left-1/4 w-8 h-8 rounded-full bg-gradient-to-br from-pink-200 to-primary-200 opacity-20 animate-float" style={{ animationDelay: '0.5s' }} />
      <div className="absolute top-2/3 right-1/3 w-6 h-6 rounded-full bg-gradient-to-br from-primary-200 to-pink-200 opacity-15 animate-float" style={{ animationDelay: '1.5s' }} />
      <div className="absolute bottom-1/4 left-1/3 w-10 h-10 rounded-full bg-gradient-to-br from-pink-100 to-primary-100 opacity-20 animate-float" style={{ animationDelay: '2.5s' }} />
    </div>
  );
}

// Gradient Blob
export function GradientBlob({ className, variant = "purple" }: { className?: string; variant?: "purple" | "pink" }) {
  const gradientClasses = variant === "purple"
    ? "from-primary-200 via-primary-300 to-pink-200"
    : "from-pink-200 via-pink-300 to-primary-200";

  return (
    <div
      className={cn(
        "absolute rounded-full blur-3xl opacity-30 bg-gradient-to-br",
        gradientClasses,
        className
      )}
    />
  );
}
