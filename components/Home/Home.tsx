// components/Home/Home.tsx

"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { usePixelStore } from "@/lib/store";
import { HomeHeader } from "./HomeHeader";
import { HomeCanvas } from "./HomeCanvas";

export function Home() {
  const router = useRouter();
  const setPixels = usePixelStore((state) => state.setPixels);

  useEffect(() => {
    async function fetchPixels() {
      try {
        const response = await fetch("/api/pixels");
        if (response.ok) {
          const data = await response.json();
          setPixels(data.pixels);
        }
      } catch (error) {
        console.error("Failed to fetch pixels:", error);
      }
    }

    fetchPixels();
    const interval = setInterval(fetchPixels, 30000);
    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="w-full bg-gray-50">
      {/* Header Section */}
      <HomeHeader />

      {/* Canvas Section - Read Only */}
      <div className="bg-gray-100 py-2 md:py-4">
        <div className="w-full px-2 md:px-4 lg:max-w-5xl lg:mx-auto">
          <HomeCanvas />
        </div>
      </div>

      {/* Compact Footer */}
      <div className="bg-white py-3 md:py-4 border-t-2 border-gray-200">
        <div className="w-full px-2 md:px-4">
          <div className="flex flex-wrap items-center justify-center gap-2 md:gap-4 text-[10px] md:text-xs text-gray-600">
            <span>💰 $1 per pixel</span>
            <span className="hidden sm:inline">•</span>
            <span>🎨 Customize</span>
            <span className="hidden sm:inline">•</span>
            <span className="hidden sm:inline">🌍 Be part of history</span>
            <span className="hidden sm:inline">•</span>
            <button
              onClick={() => router.push("/buy")}
              className="text-indigo-600 hover:text-indigo-800 font-semibold underline"
            >
              Buy Now
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
