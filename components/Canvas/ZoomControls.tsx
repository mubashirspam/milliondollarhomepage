"use client";

import { Minus, Plus } from "lucide-react";
import { useViewportStore } from "@/lib/store";

export function ZoomControls() {
  const zoom = useViewportStore((state) => state.zoom);
  const scale = useViewportStore((state) => state.scale);

  return (
    <div className="flex flex-col gap-2 bg-white rounded-lg shadow-lg border border-gray-200 p-1">
      <button
        onClick={() => zoom(1.2)}
        className="p-2 hover:bg-gray-100 rounded text-gray-600 transition"
        title="Zoom In"
      >
        <Plus className="w-5 h-5" />
      </button>
      <div className="h-px bg-gray-200 w-full" />
      <button
        onClick={() => zoom(0.8)}
        className="p-2 hover:bg-gray-100 rounded text-gray-600 transition"
        title="Zoom Out"
      >
        <Minus className="w-5 h-5" />
      </button>
      <div className="text-[10px] text-center font-mono text-gray-400 py-1 border-t border-gray-100">
        {Math.round(scale * 100)}%
      </div>
    </div>
  );
}
