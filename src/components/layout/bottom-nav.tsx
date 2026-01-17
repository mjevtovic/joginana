"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Play, Calendar, User } from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/app", label: "Home", icon: Home },
  { href: "/app/classes", label: "Classes", icon: Play },
  { href: "/app/plan", label: "Plan", icon: Calendar },
  { href: "/app/profile", label: "Profile", icon: User },
];

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 pb-2">
      {/* Solid white background */}
      <div className="absolute inset-0 bg-white border-t border-pink-100/50" />

      {/* Gradient accent line */}
      <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-pink-300 to-transparent opacity-50" />

      <div className="relative flex items-center justify-around h-14">
        {navItems.map((item) => {
          const isActive =
            pathname === item.href ||
            (item.href !== "/app" && pathname.startsWith(item.href));

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex flex-col items-center justify-center w-full h-full gap-1 transition-all duration-300 relative",
                isActive
                  ? "text-primary-600"
                  : "text-sage-400 hover:text-primary-500"
              )}
            >
              {/* Active indicator glow */}
              {isActive && (
                <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-12 h-1 rounded-full bg-gradient-to-r from-primary-500 to-pink-500 shadow-lg shadow-pink-500/50" />
              )}

              {/* Icon with background for active state */}
              <div className={cn(
                "relative p-1.5 rounded-xl transition-all duration-300",
                isActive && "bg-gradient-to-br from-primary-100 to-pink-100"
              )}>
                <item.icon className={cn(
                  "h-5 w-5 transition-transform duration-300",
                  isActive && "scale-110"
                )} />
              </div>

              <span className={cn(
                "text-[10px] font-medium transition-all duration-300",
                isActive && "text-gradient font-semibold"
              )}>
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
