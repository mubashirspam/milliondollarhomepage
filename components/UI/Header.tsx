// components/UI/Header.tsx

"use client";

import { useRouter } from "next/navigation";
import { Code, Home, LayoutGrid, Layers } from "lucide-react";
import { useUIStore, usePixelStore, useBlockSelectionStore } from "@/lib/store";
import { formatNumber } from "@/lib/utils";
import { authClient } from "@/lib/auth-client";

export function Header() {
  const router = useRouter();
  const { data: session } = authClient.useSession();
  const pixels = usePixelStore((state) => state.pixels);
  const openModal = useUIStore((state) => state.openModal);
  const selectedCount = useBlockSelectionStore((state) => state.getSelectedCount());

  const soldCount = pixels.size;

  return (
    <header className="bg-red-600 border-b-2 md:border-b-4 border-black shadow-lg">
      <div className="px-4 py-3 flex items-center justify-between">
        {/* Logo */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.push("/")}
            className="flex items-center gap-3 hover:opacity-80 transition-opacity"
          >
            <div className="w-8 h-8 bg-yellow-400 border-2 border-black rounded flex items-center justify-center font-bold text-xs">
              1M
            </div>
            <h1 className="font-bold text-white text-lg hidden sm:block">
              The Million Pixel Homepage
            </h1>
          </button>
        </div>

        {/* Right Section */}
        <div className="flex items-center gap-3">
          {/* Stats */}
          <div className="text-xs text-white bg-black/20 px-2 py-1 rounded hidden md:flex items-center gap-1.5">
            <span>Sold:</span>
            <span className="font-bold text-yellow-300">{formatNumber(soldCount)}</span>
            <span>/ 1M</span>
          </div>

          {/* Selected block indicator */}
          {selectedCount > 0 && (
            <div className="flex items-center gap-1.5 bg-blue-500 text-white text-xs font-bold px-2.5 py-1 rounded-full border-2 border-blue-300">
              <Layers className="w-3.5 h-3.5" />
              {selectedCount} block{selectedCount > 1 ? "s" : ""}
            </div>
          )}

          {/* Auth */}
          {session ? (
            <button
              onClick={() => authClient.signOut()}
              className="flex items-center gap-2 hover:bg-black/10 p-1 rounded pr-2 transition cursor-pointer"
            >
              <div className="w-8 h-8 rounded-full bg-yellow-400 text-black flex items-center justify-center font-bold border-2 border-black">
                {session.user?.name?.[0] || "U"}
              </div>
              <div className="text-xs text-left hidden md:block">
                <p className="font-bold text-white leading-tight">{session.user?.name}</p>
                <p className="text-yellow-200 leading-tight">Log out</p>
              </div>
            </button>
          ) : (
            <button
              onClick={() => openModal("login")}
              className="text-sm font-bold text-white hover:text-yellow-300 px-3 py-1.5 rounded hover:bg-black/10 transition"
            >
              Sign In
            </button>
          )}

          {/* My Pixels */}
          {session && (
            <button
              onClick={() => router.push("/my-pixels")}
              className="p-2 text-white hover:text-yellow-300 transition-colors"
              title="My Pixels"
            >
              <LayoutGrid className="w-5 h-5" />
            </button>
          )}

          {/* Home */}
          <button
            onClick={() => router.push("/")}
            className="p-2 text-white hover:text-yellow-300 transition-colors"
            title="Home"
          >
            <Home className="w-5 h-5" />
          </button>

          {/* Dev Info */}
          <button
            onClick={() => openModal("dev-info")}
            className="p-2 text-white hover:text-yellow-300 transition-colors"
            title="Developer Info"
          >
            <Code className="w-5 h-5" />
          </button>
        </div>
      </div>
    </header>
  );
}
