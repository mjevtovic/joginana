"use client";

import { useEffect, useState } from "react";
import { Header } from "./header";
import { BottomNav } from "./bottom-nav";
import type { Profile } from "@/types/database";

interface ResponsiveNavProps {
  profile: Profile | null;
}

export function ResponsiveNav({ profile }: ResponsiveNavProps) {
  const [isDesktop, setIsDesktop] = useState(false);

  useEffect(() => {
    // Check if we're on desktop (lg breakpoint = 1024px)
    const checkIsDesktop = () => {
      setIsDesktop(window.innerWidth >= 1024);
    };

    // Initial check
    checkIsDesktop();

    // Listen for resize
    window.addEventListener("resize", checkIsDesktop);
    return () => window.removeEventListener("resize", checkIsDesktop);
  }, []);

  // On desktop, show the header
  // On mobile, show the bottom nav
  return (
    <>
      {isDesktop ? (
        <Header user={profile} />
      ) : (
        <BottomNav />
      )}
    </>
  );
}
