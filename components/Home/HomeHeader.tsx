// components/Home/HomeHeader.tsx

"use client";

import { useRouter } from "next/navigation";
import { usePixelStore } from "@/lib/store";
import { formatNumber } from "@/lib/utils";

export function HomeHeader() {
  const router = useRouter();
  const pixels = usePixelStore((state) => state.pixels);
  const soldCount = pixels.size;

  return (
    <header className="bg-red-600 border-b-2 md:border-b-4 border-black sticky top-0 z-50 shadow-lg">
      <div className="w-full px-2 md:px-4 py-2">
        <div className="flex items-center justify-between gap-2 md:gap-3">
          {/* Logo and Title */}
          <div className="flex items-center gap-1.5 md:gap-2 flex-1 min-w-0">
            <div className="w-7 h-7 md:w-8 md:h-8 bg-yellow-400 border-2 border-black rounded flex items-center justify-center font-bold text-xs flex-shrink-0">
              1M
            </div>
            <div className="min-w-0 flex-1">
              <h1 className="font-bold text-white text-sm md:text-base lg:text-lg leading-tight truncate">
                The Million Pixel Homepage
              </h1>
              <p className="text-[10px] md:text-xs text-yellow-200 hidden sm:block truncate">
                Own a piece of internet history! • 1,000,000 pixels • $1 per
                pixel
              </p>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="flex items-center gap-1.5 md:gap-3 flex-shrink-0">
            {/* Stats */}
            <div className="text-[10px] md:text-xs text-white bg-black/20 px-1.5 md:px-2 py-1 rounded whitespace-nowrap">
              <span className="hidden sm:inline">Sold: </span>
              <span className="font-bold text-yellow-300">
                {formatNumber(soldCount)}
              </span>
              <span className="hidden md:inline"> / 1M</span>
            </div>

            {/* Buy Pixels Button */}
            <button
              onClick={() => router.push("/buy")}
              className="bg-yellow-400 hover:bg-yellow-500 text-black font-bold px-2 md:px-4 py-1 md:py-1.5 text-xs md:text-sm rounded border-2 border-black transition-all transform hover:scale-105 shadow-md whitespace-nowrap"
            >
              BUY
              <span className="hidden sm:inline"> PIXELS</span>
            </button>
          </nav>
        </div>
      </div>
    </header>
  );
}
