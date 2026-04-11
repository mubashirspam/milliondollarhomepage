// components/Canvas/PixelCanvas.tsx

"use client";

import { useEffect, useRef, useCallback, useMemo } from "react";
import {
  usePixelStore,
  useViewportStore,
  useBlockSelectionStore,
  useUIStore,
} from "@/lib/store";
import {
  GRID_SIZE,
  PIXEL_SIZE,
  BLOCK_SIZE,
  BLOCK_COUNT,
  calculateVisibleRange,
} from "@/lib/utils";

export function PixelCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const animationFrameRef = useRef<number>(0);

  // Mouse drag tracking
  const mouseDownRef = useRef<{ x: number; y: number } | null>(null);
  const mouseDraggedRef = useRef(false);

  // Touch tracking
  const touchDataRef = useRef<{
    startX: number;
    startY: number;
    time: number;
    moved: boolean;
  } | null>(null);
  const lastTouchDistanceRef = useRef<number | null>(null);

  // Hover state (ref, not state — avoids re-renders)
  const hoveredBlockRef = useRef<{ bx: number; by: number } | null>(null);

  const pixelsMap = usePixelStore((state) => state.pixels);
  const reservedPixels = usePixelStore((state) => state.reservedPixels);

  const viewport = useViewportStore();
  const { x: viewportX, y: viewportY, scale: viewportScale } = viewport;

  const blockSelection = useBlockSelectionStore();
  const selectedBlocks = blockSelection.selectedBlocks;
  const addToast = useUIStore((state) => state.addToast);

  const pixels = useMemo(() => Array.from(pixelsMap.values()), [pixelsMap]);

  // Map block key → first sold pixel color (for block-level rendering)
  const soldBlockMap = useMemo(() => {
    const map = new Map<string, string>();
    pixels.forEach((pixel) => {
      const bx = Math.floor(pixel.x / BLOCK_SIZE);
      const by = Math.floor(pixel.y / BLOCK_SIZE);
      const key = `${bx},${by}`;
      if (!map.has(key)) map.set(key, pixel.color);
    });
    return map;
  }, [pixels]);

  // Set of reserved block keys
  const reservedBlockSet = useMemo(() => {
    const set = new Set<string>();
    reservedPixels.forEach((key) => {
      const [x, y] = key.split(",").map(Number);
      const bx = Math.floor(x / BLOCK_SIZE);
      const by = Math.floor(y / BLOCK_SIZE);
      set.add(`${bx},${by}`);
    });
    return set;
  }, [reservedPixels]);

  // Initialize viewport to fit entire grid on screen
  useEffect(() => {
    if (!containerRef.current) return;
    if (viewport.x !== 0 || viewport.y !== 0) return;

    const w = containerRef.current.clientWidth;
    const h = containerRef.current.clientHeight;
    const totalGridPx = GRID_SIZE * PIXEL_SIZE; // 10000

    const fitScale = (Math.min(w, h) / totalGridPx) * 0.88;
    const scale = Math.max(0.03, Math.min(fitScale, 1.0));

    const scaledSize = totalGridPx * scale;
    viewport.setScale(scale);
    viewport.setPosition((w - scaledSize) / 2, (h - scaledSize) / 2);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Main render loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d", { alpha: false });
    if (!ctx) return;

    function render() {
      if (!canvas || !ctx || !containerRef.current) return;

      const width = canvas.width;
      const height = canvas.height;
      const ps = PIXEL_SIZE * viewportScale; // one grid-pixel → screen pixels
      const blockPx = BLOCK_SIZE * ps; // one block → screen pixels
      const totalW = GRID_SIZE * ps;
      const totalH = GRID_SIZE * ps;

      // Background
      ctx.fillStyle = "#cbd5e1";
      ctx.fillRect(0, 0, width, height);

      // Grid canvas
      ctx.fillStyle = "#f8fafc";
      ctx.fillRect(viewportX, viewportY, totalW, totalH);

      // Visible ranges
      const visibleCols = calculateVisibleRange(
        viewportX,
        width,
        viewportScale,
        PIXEL_SIZE,
        GRID_SIZE
      );
      const visibleRows = calculateVisibleRange(
        viewportY,
        height,
        viewportScale,
        PIXEL_SIZE,
        GRID_SIZE
      );
      const bx0 = Math.max(0, Math.floor(visibleCols.start / BLOCK_SIZE));
      const bx1 = Math.min(BLOCK_COUNT, Math.ceil(visibleCols.end / BLOCK_SIZE));
      const by0 = Math.max(0, Math.floor(visibleRows.start / BLOCK_SIZE));
      const by1 = Math.min(BLOCK_COUNT, Math.ceil(visibleRows.end / BLOCK_SIZE));

      // ── 1. Sold pixels / blocks ───────────────────────────────────────────
      if (blockPx < 3) {
        // Very zoomed out → render at block level
        for (let bx = bx0; bx < bx1; bx++) {
          for (let by = by0; by < by1; by++) {
            const color = soldBlockMap.get(`${bx},${by}`);
            if (color) {
              ctx.fillStyle = color;
              ctx.fillRect(
                viewportX + bx * blockPx,
                viewportY + by * blockPx,
                blockPx,
                blockPx
              );
            }
          }
        }
      } else {
        // Zoomed in → render individual pixel colors
        pixels.forEach(({ x: gx, y: gy, color }) => {
          if (
            gx >= visibleCols.start &&
            gx < visibleCols.end &&
            gy >= visibleRows.start &&
            gy < visibleRows.end
          ) {
            ctx.fillStyle = color;
            ctx.fillRect(viewportX + gx * ps, viewportY + gy * ps, ps, ps);
          }
        });
      }

      // ── 2. Reserved block overlays (orange) ───────────────────────────────
      ctx.fillStyle = "rgba(251, 146, 60, 0.55)";
      for (let bx = bx0; bx < bx1; bx++) {
        for (let by = by0; by < by1; by++) {
          if (reservedBlockSet.has(`${bx},${by}`)) {
            ctx.fillRect(
              viewportX + bx * blockPx,
              viewportY + by * blockPx,
              blockPx,
              blockPx
            );
          }
        }
      }

      // ── 3. Hover overlay ──────────────────────────────────────────────────
      const hov = hoveredBlockRef.current;
      if (
        hov &&
        hov.bx >= bx0 &&
        hov.bx < bx1 &&
        hov.by >= by0 &&
        hov.by < by1 &&
        !soldBlockMap.has(`${hov.bx},${hov.by}`) &&
        !reservedBlockSet.has(`${hov.bx},${hov.by}`) &&
        !selectedBlocks.has(`${hov.bx},${hov.by}`)
      ) {
        ctx.fillStyle = "rgba(59, 130, 246, 0.15)";
        ctx.fillRect(
          viewportX + hov.bx * blockPx,
          viewportY + hov.by * blockPx,
          blockPx,
          blockPx
        );
      }

      // ── 4. Selected block overlays (blue) ────────────────────────────────
      const borderWidth = Math.max(1.5, Math.min(3, blockPx * 0.04));
      ctx.lineWidth = borderWidth;

      selectedBlocks.forEach((key) => {
        const [bx, by] = key.split(",").map(Number);
        if (bx >= bx0 && bx < bx1 && by >= by0 && by < by1) {
          const px = viewportX + bx * blockPx;
          const py = viewportY + by * blockPx;
          ctx.fillStyle = "rgba(59, 130, 246, 0.38)";
          ctx.fillRect(px, py, blockPx, blockPx);
          ctx.strokeStyle = "#2563eb";
          ctx.strokeRect(px, py, blockPx, blockPx);
        }
      });

      // ── 5. Block grid lines ───────────────────────────────────────────────
      if (blockPx >= 2.5) {
        ctx.strokeStyle = "rgba(100, 116, 139, 0.25)";
        ctx.lineWidth = 0.5;
        ctx.beginPath();
        for (let bx = bx0; bx <= bx1; bx++) {
          const sx = viewportX + bx * blockPx;
          ctx.moveTo(sx, Math.max(0, viewportY));
          ctx.lineTo(sx, Math.min(height, viewportY + totalH));
        }
        for (let by = by0; by <= by1; by++) {
          const sy = viewportY + by * blockPx;
          ctx.moveTo(Math.max(0, viewportX), sy);
          ctx.lineTo(Math.min(width, viewportX + totalW), sy);
        }
        ctx.stroke();
      }

      // ── 6. Pixel grid lines (very zoomed in) ─────────────────────────────
      if (ps >= 6) {
        ctx.strokeStyle = "rgba(203, 213, 225, 0.5)";
        ctx.lineWidth = 0.5;
        ctx.beginPath();
        for (let x = visibleCols.start; x <= visibleCols.end; x++) {
          const sx = viewportX + x * ps;
          ctx.moveTo(sx, Math.max(0, viewportY));
          ctx.lineTo(sx, Math.min(height, viewportY + totalH));
        }
        for (let y = visibleRows.start; y <= visibleRows.end; y++) {
          const sy = viewportY + y * ps;
          ctx.moveTo(Math.max(0, viewportX), sy);
          ctx.lineTo(Math.min(width, viewportX + totalW), sy);
        }
        ctx.stroke();
      }

      // ── 7. Block coordinate labels (zoomed in enough) ────────────────────
      if (blockPx >= 40) {
        ctx.fillStyle = "rgba(100, 116, 139, 0.6)";
        ctx.font = `${Math.min(11, blockPx * 0.12)}px monospace`;
        ctx.textAlign = "left";
        ctx.textBaseline = "top";
        for (let bx = bx0; bx < bx1; bx++) {
          for (let by = by0; by < by1; by++) {
            if (!soldBlockMap.has(`${bx},${by}`) && !reservedBlockSet.has(`${bx},${by}`)) {
              ctx.fillText(
                `${bx},${by}`,
                viewportX + bx * blockPx + 3,
                viewportY + by * blockPx + 3
              );
            }
          }
        }
      }

      animationFrameRef.current = requestAnimationFrame(render);
    }

    render();
    return () => {
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
    };
  }, [pixels, soldBlockMap, reservedBlockSet, selectedBlocks, viewportX, viewportY, viewportScale]);

  // Canvas resize handler
  useEffect(() => {
    function handleResize() {
      if (!canvasRef.current || !containerRef.current) return;
      canvasRef.current.width = containerRef.current.clientWidth;
      canvasRef.current.height = containerRef.current.clientHeight;
    }
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const screenToBlock = useCallback(
    (screenX: number, screenY: number) => {
      const blockPx = BLOCK_SIZE * PIXEL_SIZE * viewportScale;
      const bx = Math.floor((screenX - viewportX) / blockPx);
      const by = Math.floor((screenY - viewportY) / blockPx);
      return { bx, by };
    },
    [viewportX, viewportY, viewportScale]
  );

  const handleBlockClick = useCallback(
    (screenX: number, screenY: number) => {
      const { bx, by } = screenToBlock(screenX, screenY);
      if (bx < 0 || bx >= BLOCK_COUNT || by < 0 || by >= BLOCK_COUNT) return;

      const key = `${bx},${by}`;
      if (soldBlockMap.has(key)) {
        addToast("This block is already purchased", "info");
        return;
      }
      if (reservedBlockSet.has(key)) {
        addToast("This block is being purchased by someone", "info");
        return;
      }
      blockSelection.toggleBlock(bx, by);
    },
    [screenToBlock, soldBlockMap, reservedBlockSet, blockSelection, addToast]
  );

  // ── Mouse handlers ────────────────────────────────────────────────────────
  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.button !== 0) return;
    mouseDownRef.current = { x: e.clientX, y: e.clientY };
    mouseDraggedRef.current = false;
    viewport.startDrag(e.clientX, e.clientY);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (mouseDownRef.current) {
      const dx = e.clientX - mouseDownRef.current.x;
      const dy = e.clientY - mouseDownRef.current.y;
      if (Math.abs(dx) > 4 || Math.abs(dy) > 4) mouseDraggedRef.current = true;
      viewport.updateDrag(e.clientX, e.clientY);
    }

    // Update hover
    const { bx, by } = screenToBlock(e.clientX, e.clientY);
    if (bx >= 0 && bx < BLOCK_COUNT && by >= 0 && by < BLOCK_COUNT) {
      hoveredBlockRef.current = { bx, by };
    } else {
      hoveredBlockRef.current = null;
    }
  };

  const handleMouseUp = (e: React.MouseEvent) => {
    if (e.button !== 0) return;
    if (!mouseDraggedRef.current) handleBlockClick(e.clientX, e.clientY);
    mouseDownRef.current = null;
    mouseDraggedRef.current = false;
    viewport.endDrag();
  };

  const handleMouseLeave = () => {
    mouseDownRef.current = null;
    mouseDraggedRef.current = false;
    hoveredBlockRef.current = null;
    viewport.endDrag();
  };

  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const factor = Math.exp((e.deltaY < 0 ? 1 : -1) * 0.12);
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;
    viewport.zoom(factor, e.clientX - rect.left, e.clientY - rect.top);
  };

  // ── Touch handlers ────────────────────────────────────────────────────────
  const handleTouchStart = (e: React.TouchEvent) => {
    e.preventDefault();
    if (e.touches.length === 1) {
      const t = e.touches[0];
      touchDataRef.current = {
        startX: t.clientX,
        startY: t.clientY,
        time: Date.now(),
        moved: false,
      };
      lastTouchDistanceRef.current = null;
      viewport.startDrag(t.clientX, t.clientY);
    } else if (e.touches.length === 2) {
      touchDataRef.current = null;
      const dx = e.touches[1].clientX - e.touches[0].clientX;
      const dy = e.touches[1].clientY - e.touches[0].clientY;
      lastTouchDistanceRef.current = Math.sqrt(dx * dx + dy * dy);
      viewport.endDrag();
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    e.preventDefault();
    if (e.touches.length === 1) {
      const t = e.touches[0];
      if (touchDataRef.current) {
        const dx = t.clientX - touchDataRef.current.startX;
        const dy = t.clientY - touchDataRef.current.startY;
        if (Math.abs(dx) > 6 || Math.abs(dy) > 6) touchDataRef.current.moved = true;
      }
      viewport.updateDrag(t.clientX, t.clientY);
    } else if (e.touches.length === 2 && lastTouchDistanceRef.current !== null) {
      const dx = e.touches[1].clientX - e.touches[0].clientX;
      const dy = e.touches[1].clientY - e.touches[0].clientY;
      const newDist = Math.sqrt(dx * dx + dy * dy);
      const factor = Math.max(0.5, Math.min(2, newDist / lastTouchDistanceRef.current));
      lastTouchDistanceRef.current = newDist;
      const midX = (e.touches[0].clientX + e.touches[1].clientX) / 2;
      const midY = (e.touches[0].clientY + e.touches[1].clientY) / 2;
      viewport.zoom(factor, midX, midY);
    }
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    e.preventDefault();
    if (touchDataRef.current) {
      const { moved, time } = touchDataRef.current;
      if (!moved && Date.now() - time < 350 && e.changedTouches.length === 1) {
        const t = e.changedTouches[0];
        handleBlockClick(t.clientX, t.clientY);
      }
    }
    touchDataRef.current = null;
    lastTouchDistanceRef.current = null;
    viewport.endDrag();
  };

  return (
    <div
      ref={containerRef}
      className={`w-full h-full touch-none select-none ${
        viewport.isDragging ? "cursor-grabbing" : "cursor-pointer"
      }`}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseLeave}
      onWheel={handleWheel}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      <canvas ref={canvasRef} />
    </div>
  );
}
