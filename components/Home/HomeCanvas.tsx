// components/Home/HomeCanvas.tsx

"use client";

import { useRef, useEffect } from "react";
import { usePixelStore } from "@/lib/store";

export function HomeCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const pixels = usePixelStore((state) => state.pixels);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Clear canvas
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, 1000, 1000);

    // Draw purchased pixels
    pixels.forEach((pixel) => {
      if (pixel.color) {
        ctx.fillStyle = pixel.color;
        ctx.fillRect(pixel.x, pixel.y, 1, 1);
      }
    });
  }, [pixels]);

  return (
    <div className="w-full border-2 md:border-4 border-gray-300 rounded bg-white overflow-visible">
      <canvas
        ref={canvasRef}
        width={1000}
        height={1000}
        className="w-full h-auto"
        style={{
          imageRendering: "pixelated",
          display: "block",
          maxWidth: "100%",
          height: "auto",
        }}
      />
    </div>
  );
}
