// components/Canvas/PixelCanvas.tsx

"use client";

import { useEffect, useRef, useCallback, useMemo, useState } from "react";
import {
  usePixelStore,
  useViewportStore,
  useCartStore,
  useUIStore,
  useSelectionStore,
} from "@/lib/store";
import { GRID_SIZE, PIXEL_SIZE, calculateVisibleRange } from "@/lib/utils";

export function PixelCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const animationFrameRef = useRef<number>(0);
  const [isShiftPressed, setIsShiftPressed] = useState(false);

  const pixelsMap = usePixelStore((state) => state.pixels);
  const selectedPixel = usePixelStore((state) => state.selectedPixel);
  const selectPixel = usePixelStore((state) => state.selectPixel);
  const deselectPixel = usePixelStore((state) => state.deselectPixel);

  const viewport = useViewportStore();
  const { x: viewportX, y: viewportY, scale: viewportScale } = viewport;
  const addArea = useCartStore((state) => state.addArea);
  const getPixelsInAreas = useCartStore((state) => state.getPixelsInAreas);
  const openModal = useUIStore((state) => state.openModal);
  const toggleSidebar = useUIStore((state) => state.toggleSidebar);

  const selection = useSelectionStore();
  const selectionArea = selection.getSelectionArea();

  // Convert Map/Set to arrays to prevent infinite re-renders
  const pixels = useMemo(() => Array.from(pixelsMap.values()), [pixelsMap]);
  const cartPixels = useMemo(() => getPixelsInAreas(), [getPixelsInAreas]);

  // Initialize viewport position (run only once)
  useEffect(() => {
    if (containerRef.current && viewport.x === 0 && viewport.y === 0) {
      const totalGridSize = GRID_SIZE * PIXEL_SIZE;
      const x = (containerRef.current.clientWidth - totalGridSize) / 2;
      const y = (containerRef.current.clientHeight - totalGridSize) / 2;
      viewport.setPosition(x, y);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Render loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d", { alpha: false });
    if (!ctx) return;

    function render() {
      if (!canvas || !ctx || !containerRef.current) return;

      const width = canvas.width;
      const height = canvas.height;
      const ps = PIXEL_SIZE * viewportScale;

      // Clear with background color
      ctx.fillStyle = "#e5e7eb";
      ctx.fillRect(0, 0, width, height);

      // Draw grid background
      const totalW = GRID_SIZE * ps;
      const totalH = GRID_SIZE * ps;
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(viewportX, viewportY, totalW, totalH);

      // Calculate visible range
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

      // Draw sold pixels
      pixels.forEach((pixel) => {
        const { x: gx, y: gy } = pixel;

        if (
          gx >= visibleCols.start &&
          gx < visibleCols.end &&
          gy >= visibleRows.start &&
          gy < visibleRows.end
        ) {
          ctx.fillStyle = pixel.color;
          const px = viewportX + gx * ps;
          const py = viewportY + gy * ps;
          ctx.fillRect(px, py, ps, ps);
        }
      });

      // Draw cart items
      ctx.fillStyle = "rgba(239, 68, 68, 0.5)";
      cartPixels.forEach((key) => {
        const [gx, gy] = key.toString().split(",").map(Number);

        if (
          gx >= visibleCols.start &&
          gx < visibleCols.end &&
          gy >= visibleRows.start &&
          gy < visibleRows.end
        ) {
          const px = viewportX + gx * ps;
          const py = viewportY + gy * ps;
          ctx.fillRect(px, py, ps, ps);
        }
      });

      // Draw selected pixel
      if (selectedPixel) {
        const { x, y } = selectedPixel;
        ctx.strokeStyle = "#f59e0b";
        ctx.lineWidth = Math.max(2, 2 * viewportScale);
        const px = viewportX + x * ps;
        const py = viewportY + y * ps;
        ctx.strokeRect(px, py, ps, ps);
      }

      // Draw selection rectangle
      if (selectionArea) {
        const { minX, minY, maxX, maxY } = selectionArea;
        ctx.fillStyle = "rgba(59, 130, 246, 0.2)";
        ctx.strokeStyle = "#3b82f6";
        ctx.lineWidth = Math.max(2, 2 * viewportScale);

        const px = viewportX + minX * ps;
        const py = viewportY + minY * ps;
        const pw = (maxX - minX + 1) * ps;
        const ph = (maxY - minY + 1) * ps;

        ctx.fillRect(px, py, pw, ph);
        ctx.strokeRect(px, py, pw, ph);
      }

      // Draw grid lines when zoomed in
      if (viewportScale > 0.8) {
        ctx.strokeStyle = "#f3f4f6";
        ctx.lineWidth = 1;
        ctx.beginPath();

        // Vertical lines
        for (let x = visibleCols.start; x <= visibleCols.end; x++) {
          const px = viewportX + x * ps;
          ctx.moveTo(px, Math.max(0, viewportY));
          ctx.lineTo(px, Math.min(height, viewportY + totalH));
        }

        // Horizontal lines
        for (let y = visibleRows.start; y <= visibleRows.end; y++) {
          const py = viewportY + y * ps;
          ctx.moveTo(Math.max(0, viewportX), py);
          ctx.lineTo(Math.min(width, viewportX + totalW), py);
        }

        ctx.stroke();
      }

      animationFrameRef.current = requestAnimationFrame(render);
    }

    render();

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [
    pixels,
    selectedPixel,
    cartPixels,
    viewportX,
    viewportY,
    viewportScale,
    selectionArea,
  ]);

  // Handle resize
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

  // Track shift key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Shift") setIsShiftPressed(true);
    };
    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.key === "Shift") setIsShiftPressed(false);
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, []);

  // Screen to grid coordinate conversion
  const screenToGrid = useCallback(
    (screenX: number, screenY: number) => {
      const x = Math.floor(
        (screenX - viewportX) / (PIXEL_SIZE * viewportScale)
      );
      const y = Math.floor(
        (screenY - viewportY) / (PIXEL_SIZE * viewportScale)
      );
      return { x, y };
    },
    [viewportX, viewportY, viewportScale]
  );

  // Mouse handlers
  const handleMouseDown = (e: React.MouseEvent) => {
    if (isShiftPressed) {
      // Start area selection
      const { x, y } = screenToGrid(e.clientX, e.clientY);
      if (x >= 0 && x < GRID_SIZE && y >= 0 && y < GRID_SIZE) {
        selection.startSelection(x, y);
      }
    } else {
      // Start panning
      viewport.startDrag(e.clientX, e.clientY);
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (selection.isSelecting) {
      // Update selection area
      const { x, y } = screenToGrid(e.clientX, e.clientY);
      if (x >= 0 && x < GRID_SIZE && y >= 0 && y < GRID_SIZE) {
        selection.updateSelection(x, y);
      }
    } else {
      // Pan viewport
      viewport.updateDrag(e.clientX, e.clientY);
    }
  };

  const handleMouseUp = (e: React.MouseEvent) => {
    if (selection.isSelecting) {
      // Finalize selection and add to cart as one area
      const area = selection.getSelectionArea();
      if (area) {
        const { minX, minY, maxX, maxY } = area;

        // Add the entire area as a single cart item
        addArea(minX, minY, maxX, maxY);

        // Open cart modal
        openModal("cart");
      }

      selection.clearSelection();
    } else if (!viewport.isDragging && !isShiftPressed) {
      // Single click to view pixel details (not dragging, not selecting)
      const { x, y } = screenToGrid(e.clientX, e.clientY);
      if (x >= 0 && x < GRID_SIZE && y >= 0 && y < GRID_SIZE) {
        selectPixel(x, y);
        toggleSidebar(true);
      }
    }

    viewport.endDrag();
  };

  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();

    const zoomIntensity = 0.1;
    const wheel = e.deltaY < 0 ? 1 : -1;
    const factor = Math.exp(wheel * zoomIntensity);

    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;

    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    viewport.zoom(factor, mouseX, mouseY);
  };

  const getCursor = () => {
    if (selection.isSelecting) return "cursor-crosshair";
    if (viewport.isDragging) return "cursor-grabbing";
    if (isShiftPressed) return "cursor-crosshair";
    return "cursor-grab";
  };

  return (
    <div
      ref={containerRef}
      className={`w-full h-full ${getCursor()}`}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      onWheel={handleWheel}
    >
      <canvas ref={canvasRef} />
    </div>
  );
}
