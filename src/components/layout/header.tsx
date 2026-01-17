"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X, User, Sparkles } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { LotusFlower } from "@/components/ui/decorations";
import type { Profile } from "@/types/database";

interface HeaderProps {
  user: Profile | null;
}

export function Header({ user }: HeaderProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const pathname = usePathname();

  // Detect if we're in the /app section (PWA routes)
  const isInAppSection = pathname.startsWith("/app");

  // Use /app routes when in the app section, otherwise use desktop routes
  const navigation = user
    ? isInAppSection
      ? [
          { name: "Home", href: "/" },
          { name: "Classes", href: "/app/classes" },
          { name: "Plan", href: "/app/plan" },
          { name: "Profile", href: "/app/profile" },
        ]
      : [
          { name: "Home", href: "/" },
          { name: "Classes", href: "/classes" },
          { name: "Favorites", href: "/favorites" },
          { name: "Planner", href: "/planner" },
        ]
    : [
        { name: "Features", href: "/#features" },
        { name: "Pricing", href: "/pricing" },
      ];

  return (
    <>
      <header className="fixed inset-x-0 top-0 z-40 glass border-b border-pink-100/50 pt-6 sm:pt-0">
        <nav className="mx-auto flex max-w-7xl items-center justify-between p-4 lg:px-8">
          <div className="flex lg:flex-1">
            <Link href="/" className="-m-1.5 p-1.5 flex items-center gap-2 group">
              <LotusFlower className="w-8 h-8 text-pink-400 group-hover:scale-110 transition-transform" />
              <span className="text-2xl font-display font-bold text-gradient">
                JoginAna
              </span>
            </Link>
          </div>

          <div className="flex lg:hidden">
            <button
              type="button"
              className="-m-2.5 inline-flex items-center justify-center rounded-md p-2.5 text-sage-700 hover:bg-pink-50 transition-colors"
              onClick={() => setMobileMenuOpen(true)}
            >
              <span className="sr-only">Open main menu</span>
              <Menu className="h-6 w-6" aria-hidden="true" />
            </button>
          </div>

          <div className="hidden lg:flex lg:gap-x-8">
            {navigation.map((item) => {
              const isActive = pathname === item.href ||
                (item.href !== "/" && pathname.startsWith(item.href));
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={cn(
                    "text-sm font-medium transition-colors relative",
                    isActive
                      ? "text-primary-600"
                      : "text-sage-700 hover:text-primary-600",
                    isActive && "after:absolute after:-bottom-1 after:left-0 after:right-0 after:h-0.5 after:bg-gradient-to-r after:from-primary-500 after:to-pink-500 after:rounded-full"
                  )}
                >
                  {item.name}
                </Link>
              );
            })}
          </div>

          <div className="hidden lg:flex lg:flex-1 lg:justify-end lg:gap-x-4">
            {user ? (
              <div className="flex items-center gap-4">
                <span className="text-sm text-sage-600">
                  {user.email}
                </span>
                <form action="/api/auth/signout" method="POST">
                  <Button variant="ghost" size="sm" type="submit" className="hover:bg-pink-50">
                    Sign out
                  </Button>
                </form>
              </div>
            ) : (
              <>
                <Link href="/login">
                  <Button variant="ghost" size="sm" className="hover:bg-pink-50">
                    Log in
                  </Button>
                </Link>
                <Link href="/login">
                  <Button size="sm" className="bg-gradient-to-r from-primary-500 to-pink-500 hover:from-primary-600 hover:to-pink-600 border-0 shadow-lg shadow-primary-500/25">
                    <Sparkles className="w-4 h-4 mr-1" />
                    Start Free Trial
                  </Button>
                </Link>
              </>
            )}
          </div>
        </nav>
      </header>

      {/* Mobile menu - separate from header for proper z-index */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-sage-900/30 backdrop-blur-sm"
            onClick={() => setMobileMenuOpen(false)}
          />

          {/* Menu panel */}
          <div className="fixed inset-y-0 right-0 z-50 w-full overflow-y-auto bg-gradient-to-br from-white to-pink-50 px-6 py-6 pt-14 sm:pt-6 sm:max-w-sm shadow-2xl">
            <div className="flex items-center justify-between">
              <Link
                href="/"
                className="-m-1.5 p-1.5 flex items-center gap-2"
                onClick={() => setMobileMenuOpen(false)}
              >
                <LotusFlower className="w-8 h-8 text-pink-400" />
                <span className="text-2xl font-display font-bold text-gradient">
                  JoginAna
                </span>
              </Link>
              <button
                type="button"
                className="-m-2.5 rounded-md p-2.5 text-sage-700 hover:bg-pink-100 transition-colors"
                onClick={() => setMobileMenuOpen(false)}
              >
                <span className="sr-only">Close menu</span>
                <X className="h-6 w-6" aria-hidden="true" />
              </button>
            </div>
            <div className="mt-6 flow-root">
              <div className="-my-6 divide-y divide-pink-100">
                <div className="space-y-2 py-6">
                  {navigation.map((item) => {
                    const isActive = pathname === item.href ||
                      (item.href !== "/" && pathname.startsWith(item.href));
                    return (
                      <Link
                        key={item.name}
                        href={item.href}
                        className={cn(
                          "-mx-3 block rounded-xl px-3 py-2.5 text-base font-medium transition-all",
                          isActive
                            ? "bg-gradient-to-r from-primary-50 to-pink-50 text-primary-600 shadow-sm"
                            : "text-sage-700 hover:bg-pink-50"
                        )}
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        {item.name}
                      </Link>
                    );
                  })}
                </div>
                <div className="py-6">
                  {user ? (
                    <div className="space-y-4">
                      <div className="flex items-center gap-3 px-3">
                        <div className="h-10 w-10 rounded-full bg-gradient-to-br from-primary-200 to-pink-200 flex items-center justify-center">
                          <User className="h-5 w-5 text-primary-600" />
                        </div>
                        <span className="text-sm text-sage-600">{user.email}</span>
                      </div>
                      <form action="/api/auth/signout" method="POST">
                        <Button variant="outline" className="w-full border-pink-200 hover:bg-pink-50" type="submit">
                          Sign out
                        </Button>
                      </form>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <Link href="/login" className="block" onClick={() => setMobileMenuOpen(false)}>
                        <Button variant="outline" className="w-full border-pink-200 hover:bg-pink-50">
                          Log in
                        </Button>
                      </Link>
                      <Link href="/login" className="block" onClick={() => setMobileMenuOpen(false)}>
                        <Button className="w-full bg-gradient-to-r from-primary-500 to-pink-500 hover:from-primary-600 hover:to-pink-600 border-0">
                          <Sparkles className="w-4 h-4 mr-1" />
                          Start Free Trial
                        </Button>
                      </Link>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
