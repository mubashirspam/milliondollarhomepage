// components/UI/Header.tsx

"use client";

import { useRouter } from "next/navigation";
import { ShoppingCart, Code, Home, LayoutGrid } from "lucide-react";
import { useCartStore, useUIStore, usePixelStore } from "@/lib/store";
import { formatNumber } from "@/lib/utils";
import { authClient } from "@/lib/auth-client";

export function Header() {
  const router = useRouter();
  const { data: session } = authClient.useSession();
  const getTotalPixels = useCartStore((state) => state.getTotalPixels);
  const pixels = usePixelStore((state) => state.pixels);
  const openModal = useUIStore((state) => state.openModal);

  const soldCount = pixels.size;
  const cartCount = getTotalPixels();

  return (
    <header className="bg-white/90 backdrop-blur-md border-b border-gray-200 shadow-sm">
      <div className="px-4 py-3 flex items-center justify-between">
        {/* Logo */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.push("/")}
            className="flex items-center gap-3 hover:opacity-80 transition-opacity"
          >
            <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-purple-600 rounded text-white flex items-center justify-center font-bold text-xs">
              1M
            </div>
            <h1 className="font-bold text-gray-800 text-lg hidden sm:block">
              The Million Pixel Homepage
            </h1>
          </button>
        </div>

        {/* Right Section */}
        <div className="flex items-center gap-4">
          {/* Stats */}
          <div className="text-xs text-gray-500 hidden md:block">
            Sold:{" "}
            <span className="font-bold text-indigo-600">
              {formatNumber(soldCount)}
            </span>{" "}
            / 1,000,000
          </div>

          {/* Auth Section */}
          {session ? (
            <button
              onClick={() => authClient.signOut()}
              className="flex items-center gap-2 hover:bg-gray-100 p-1 rounded pr-2 transition cursor-pointer"
            >
              <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center font-bold border border-indigo-200">
                {session.user?.name?.[0] || "U"}
              </div>
              <div className="text-xs text-left hidden md:block">
                <p className="font-bold text-gray-700 leading-tight">
                  {session.user?.name}
                </p>
                <p className="text-gray-400 leading-tight">Log out</p>
              </div>
            </button>
          ) : (
            <button
              onClick={() => openModal("login")}
              className="text-sm font-bold text-gray-600 hover:text-indigo-600 px-3 py-1.5 rounded hover:bg-gray-100 transition"
            >
              Sign In
            </button>
          )}

          {/* My Pixels (only when logged in) */}
          {session && (
            <button
              onClick={() => router.push("/my-pixels")}
              className="p-2 text-gray-400 hover:text-indigo-600 transition-colors"
              title="My Pixels"
            >
              <LayoutGrid className="w-5 h-5" />
            </button>
          )}

          {/* Home Button */}
          <button
            onClick={() => router.push("/")}
            className="p-2 text-gray-400 hover:text-indigo-600 transition-colors"
            title="Home"
          >
            <Home className="w-5 h-5" />
          </button>

          {/* Dev Info */}
          <button
            onClick={() => openModal("dev-info")}
            className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
            title="Developer Info"
          >
            <Code className="w-5 h-5" />
          </button>

          {/* Cart Button */}
          <button
            onClick={() => openModal("cart")}
            className="relative p-2 text-gray-600 hover:text-indigo-600 transition-colors"
          >
            <ShoppingCart className="w-5 h-5" />
            {cartCount > 0 && (
              <span className="absolute top-0 right-0 bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                {cartCount}
              </span>
            )}
          </button>
        </div>
      </div>
    </header>
  );
}
