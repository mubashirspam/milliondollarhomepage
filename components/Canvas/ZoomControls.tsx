"use client";

import { Minus, Plus, Maximize2 } from "lucide-react";
import { useViewportStore } from "@/lib/store";
import { GRID_SIZE, PIXEL_SIZE } from "@/lib/utils";

export function ZoomControls() {
  const zoom = useViewportStore((state) => state.zoom);
  const scale = useViewportStore((state) => state.scale);
  const setScale = useViewportStore((state) => state.setScale);
  const setPosition = useViewportStore((state) => state.setPosition);

  function handleFit() {
    if (typeof window === "undefined") return;
    const w = window.innerWidth;
    const h = window.innerHeight;
    const totalGridPx = GRID_SIZE * PIXEL_SIZE;
    const fitScale = (Math.min(w, h) / totalGridPx) * 0.88;
    const s = Math.max(0.03, Math.min(fitScale, 1.0));
    const scaledSize = totalGridPx * s;
    setScale(s);
    setPosition((w - scaledSize) / 2, (h - scaledSize) / 2);
  }

  return (
    <div className="flex flex-col gap-1 bg-white rounded-xl shadow-lg border border-gray-200 p-1 overflow-hidden">
      <button
        onClick={() => zoom(1.25)}
        className="p-2.5 hover:bg-gray-100 active:bg-gray-200 rounded-lg text-gray-600 transition"
        title="Zoom In"
      >
        <Plus className="w-5 h-5" />
      </button>

      <div className="text-[10px] text-center font-mono text-gray-400 py-0.5">
        {Math.round(scale * 100)}%
      </div>

      <button
        onClick={() => zoom(0.8)}
        className="p-2.5 hover:bg-gray-100 active:bg-gray-200 rounded-lg text-gray-600 transition"
        title="Zoom Out"
      >
        <Minus className="w-5 h-5" />
      </button>

      <div className="h-px bg-gray-100 mx-1" />

      <button
        onClick={handleFit}
        className="p-2.5 hover:bg-gray-100 active:bg-gray-200 rounded-lg text-gray-500 transition"
        title="Fit to screen"
      >
        <Maximize2 className="w-4 h-4" />
      </button>
    </div>
  );
}
