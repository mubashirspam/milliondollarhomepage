"use client";

import { useEffect, useRef, useMemo } from "react";
import { usePixelStore, useViewportStore } from "@/lib/store";
import { GRID_SIZE, PIXEL_SIZE } from "@/lib/utils";

export function Minimap() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const pixelsMap = usePixelStore((state) => state.pixels);
  const viewport = useViewportStore();
  const { x: viewportX, y: viewportY, scale: viewportScale } = viewport;
  const setPosition = useViewportStore((state) => state.setPosition);

  // Convert Map to array to prevent infinite re-renders
  const pixels = useMemo(() => Array.from(pixelsMap.values()), [pixelsMap]);

  // Draw minimap
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const size = 150; // Size of minimap in px
    const scale = size / GRID_SIZE;

    canvas.width = size;
    canvas.height = size;

    // Background
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, size, size);

    // Pixels
    pixels.forEach((pixel) => {
      ctx.fillStyle = pixel.color;
      ctx.fillRect(pixel.x * scale, pixel.y * scale, scale, scale);
    });

    // Viewport rect
    if (typeof window !== "undefined") {
      const viewW = window.innerWidth / PIXEL_SIZE / viewportScale;
      const viewH = window.innerHeight / PIXEL_SIZE / viewportScale;

      // Viewport position in grid coords
      const vx = -viewportX / (PIXEL_SIZE * viewportScale);
      const vy = -viewportY / (PIXEL_SIZE * viewportScale);

      ctx.strokeStyle = "#ef4444";
      ctx.lineWidth = 2;
      ctx.strokeRect(vx * scale, vy * scale, viewW * scale, viewH * scale);
    }
  }, [pixels, viewportX, viewportY, viewportScale]);

  const handleClick = (e: React.MouseEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const size = 150;
    const scale = size / GRID_SIZE;

    const gridX = x / scale;
    const gridY = y / scale;

    // Center viewport on this point
    // We need to calculate the correct viewport x/y
    // viewport.x is the offset in screen pixels

    const screenW = window.innerWidth;
    const screenH = window.innerHeight;

    const newX = screenW / 2 - gridX * PIXEL_SIZE * viewportScale;
    const newY = screenH / 2 - gridY * PIXEL_SIZE * viewportScale;

    setPosition(newX, newY);
  };

  return (
    <div className="bg-white p-2 rounded-lg shadow-lg border border-gray-200">
      <canvas
        ref={canvasRef}
        className="cursor-pointer border border-gray-100"
        onClick={handleClick}
      />
    </div>
  );
}
