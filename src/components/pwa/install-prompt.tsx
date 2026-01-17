"use client";

import { useState, useEffect } from "react";
import { Download, X, Share, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

export function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showIOSPrompt, setShowIOSPrompt] = useState(false);
  const [dismissed, setDismissed] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);

  useEffect(() => {
    // Check if already installed (standalone mode)
    const standalone = window.matchMedia("(display-mode: standalone)").matches
      || (window.navigator as Navigator & { standalone?: boolean }).standalone === true;
    setIsStandalone(standalone);

    // Check if dismissed recently
    const dismissedAt = localStorage.getItem("pwa-install-dismissed");
    if (dismissedAt) {
      const dismissedTime = parseInt(dismissedAt, 10);
      // Show again after 7 days
      if (Date.now() - dismissedTime < 7 * 24 * 60 * 60 * 1000) {
        setDismissed(true);
      }
    }

    // Listen for beforeinstallprompt (Android/Chrome)
    const handleBeforeInstall = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstall);

    // Detect iOS Safari
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
    const isSafari = /Safari/.test(navigator.userAgent) && !/Chrome/.test(navigator.userAgent);

    if (isIOS && isSafari && !standalone) {
      setShowIOSPrompt(true);
    }

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstall);
    };
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;

    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;

    if (outcome === "accepted") {
      setDeferredPrompt(null);
    }
  };

  const handleDismiss = () => {
    setDismissed(true);
    localStorage.setItem("pwa-install-dismissed", Date.now().toString());
  };

  // Don't show if already installed, dismissed, or no prompt available
  if (isStandalone || dismissed || (!deferredPrompt && !showIOSPrompt)) {
    return null;
  }

  // iOS Safari prompt with instructions
  if (showIOSPrompt) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-300">
        <div className="relative rounded-2xl shadow-2xl p-4 bg-gray-800 border border-gray-700 max-w-sm w-full">
          <button
            onClick={handleDismiss}
            className="absolute top-3 right-3 p-1.5 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
          >
            <X className="w-4 h-4 text-white" />
          </button>

          <div className="flex items-start gap-3">
            <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center flex-shrink-0">
              <Download className="w-6 h-6 text-white" />
            </div>

            <div className="flex-1 pr-6">
              <h3 className="font-display font-bold text-white mb-1">
                Add to Home Screen
              </h3>
              <p className="text-sm text-gray-300 mb-3">
                Install JoginAna for quick access and a better experience
              </p>

              <div className="flex items-center gap-2 text-sm text-white bg-gray-700 rounded-xl p-3">
                <span>Tap</span>
                <span className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-white">
                  <Share className="w-4 h-4 text-blue-500" />
                </span>
                <span>then</span>
                <span className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-white text-gray-800">
                  <Plus className="w-4 h-4" />
                  <span className="text-xs font-medium">Add to Home Screen</span>
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Android/Chrome install button
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="relative rounded-2xl shadow-2xl p-4 bg-gray-800 border border-gray-700 max-w-sm w-full">
        <button
          onClick={handleDismiss}
          className="absolute top-3 right-3 p-1.5 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
        >
          <X className="w-4 h-4 text-white" />
        </button>

        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center flex-shrink-0">
            <Download className="w-6 h-6 text-white" />
          </div>

          <div className="flex-1">
            <h3 className="font-display font-bold text-white mb-0.5">
              Install JoginAna
            </h3>
            <p className="text-sm text-gray-300">
              Add to home screen for quick access
            </p>
          </div>

          <Button
            onClick={handleInstall}
            size="sm"
            className="bg-white text-gray-800 hover:bg-gray-100 font-semibold rounded-xl px-4"
          >
            Install
          </Button>
        </div>
      </div>
    </div>
  );
}
