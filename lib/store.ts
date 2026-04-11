// lib/store.ts

import { create } from "zustand";
import { Pixel, ViewportState, Toast } from "@/types";
import { generatePixelKey, BLOCK_SIZE } from "./utils";

interface PixelStore {
  pixels: Map<string, Pixel>;
  selectedPixel: { x: number; y: number } | null;
  reservedPixels: Set<string>; // "x,y" — pixels locked by pending orders
  setPixels: (pixels: Pixel[]) => void;
  addPixel: (pixel: Pixel) => void;
  updatePixel: (pixel: Pixel) => void;
  selectPixel: (x: number, y: number) => void;
  deselectPixel: () => void;
  getPixelByCoord: (x: number, y: number) => Pixel | undefined;
  setReservedPixels: (pixels: { x: number; y: number }[]) => void;
}

export const usePixelStore = create<PixelStore>((set, get) => ({
  pixels: new Map(),
  selectedPixel: null,
  reservedPixels: new Set<string>(),

  setPixels: (pixels) => {
    const pixelMap = new Map<string, Pixel>();
    pixels.forEach((pixel) => {
      const key = generatePixelKey(pixel.x, pixel.y);
      pixelMap.set(key, pixel);
    });
    set({ pixels: pixelMap });
  },

  addPixel: (pixel) => {
    const key = generatePixelKey(pixel.x, pixel.y);
    set((state) => {
      const newPixels = new Map(state.pixels);
      newPixels.set(key, pixel);
      return { pixels: newPixels };
    });
  },

  updatePixel: (pixel) => {
    const key = generatePixelKey(pixel.x, pixel.y);
    set((state) => {
      const newPixels = new Map(state.pixels);
      newPixels.set(key, pixel);
      return { pixels: newPixels };
    });
  },

  selectPixel: (x, y) => set({ selectedPixel: { x, y } }),

  deselectPixel: () => set({ selectedPixel: null }),

  getPixelByCoord: (x, y) => {
    const key = generatePixelKey(x, y);
    return get().pixels.get(key);
  },

  setReservedPixels: (pixels) => {
    const pixelSet = new Set<string>(pixels.map((p) => generatePixelKey(p.x, p.y)));
    set({ reservedPixels: pixelSet });
  },
}));

export interface CartArea {
  id: string;
  minX: number;
  minY: number;
  maxX: number;
  maxY: number;
  pixelCount: number;
}

interface CartStore {
  areas: CartArea[];
  addArea: (minX: number, minY: number, maxX: number, maxY: number) => void;
  removeArea: (id: string) => void;
  clearCart: () => void;
  getTotalPixels: () => number;
  getPixelsInAreas: () => Set<string>;
}

export const useCartStore = create<CartStore>((set, get) => ({
  areas: [],

  addArea: (minX, minY, maxX, maxY) => {
    const pixelCount = (maxX - minX + 1) * (maxY - minY + 1);
    const id = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const newArea: CartArea = { id, minX, minY, maxX, maxY, pixelCount };

    set((state) => ({
      areas: [...state.areas, newArea],
    }));
  },

  removeArea: (id) => {
    set((state) => ({
      areas: state.areas.filter((area) => area.id !== id),
    }));
  },

  clearCart: () => set({ areas: [] }),

  getTotalPixels: () => {
    return get().areas.reduce((sum, area) => sum + area.pixelCount, 0);
  },

  getPixelsInAreas: () => {
    const pixels = new Set<string>();
    get().areas.forEach((area) => {
      for (let x = area.minX; x <= area.maxX; x++) {
        for (let y = area.minY; y <= area.maxY; y++) {
          pixels.add(generatePixelKey(x, y));
        }
      }
    });
    return pixels;
  },
}));

interface SelectionStore {
  isSelecting: boolean;
  startX: number | null;
  startY: number | null;
  endX: number | null;
  endY: number | null;
  startSelection: (x: number, y: number) => void;
  updateSelection: (x: number, y: number) => void;
  endSelection: () => void;
  clearSelection: () => void;
  getSelectionArea: () => {
    minX: number;
    minY: number;
    maxX: number;
    maxY: number;
  } | null;
}

export const useSelectionStore = create<SelectionStore>((set, get) => ({
  isSelecting: false,
  startX: null,
  startY: null,
  endX: null,
  endY: null,

  startSelection: (x, y) =>
    set({ isSelecting: true, startX: x, startY: y, endX: x, endY: y }),

  updateSelection: (x, y) => {
    const state = get();
    if (!state.isSelecting) return;
    set({ endX: x, endY: y });
  },

  endSelection: () => set({ isSelecting: false }),

  clearSelection: () =>
    set({
      isSelecting: false,
      startX: null,
      startY: null,
      endX: null,
      endY: null,
    }),

  getSelectionArea: () => {
    const state = get();
    if (
      state.startX === null ||
      state.startY === null ||
      state.endX === null ||
      state.endY === null
    ) {
      return null;
    }
    return {
      minX: Math.min(state.startX, state.endX),
      minY: Math.min(state.startY, state.endY),
      maxX: Math.max(state.startX, state.endX),
      maxY: Math.max(state.startY, state.endY),
    };
  },
}));

interface ViewportStore extends ViewportState {
  setPosition: (x: number, y: number) => void;
  setScale: (scale: number) => void;
  startDrag: (x: number, y: number) => void;
  updateDrag: (x: number, y: number) => void;
  endDrag: () => void;
  zoom: (factor: number, centerX?: number, centerY?: number) => void;
}

export const useViewportStore = create<ViewportStore>((set, get) => ({
  x: 0,
  y: 0,
  scale: 0.1,
  isDragging: false,
  lastX: 0,
  lastY: 0,

  setPosition: (x, y) => set({ x, y }),

  setScale: (scale) => set({ scale }),

  startDrag: (x, y) => set({ isDragging: true, lastX: x, lastY: y }),

  updateDrag: (x, y) => {
    const state = get();
    if (!state.isDragging) return;

    const dx = x - state.lastX;
    const dy = y - state.lastY;

    set({
      x: state.x + dx,
      y: state.y + dy,
      lastX: x,
      lastY: y,
    });
  },

  endDrag: () => set({ isDragging: false }),

  zoom: (factor, centerX, centerY) => {
    const state = get();
    const newScale = Math.max(0.1, Math.min(20, state.scale * factor));

    if (centerX !== undefined && centerY !== undefined) {
      // Zoom towards specific point
      const gridX = (centerX - state.x) / state.scale;
      const gridY = (centerY - state.y) / state.scale;

      set({
        scale: newScale,
        x: centerX - gridX * newScale,
        y: centerY - gridY * newScale,
      });
    } else {
      set({ scale: newScale });
    }
  },
}));

interface UIStore {
  sidebarOpen: boolean;
  activeModal: string | null;
  toasts: Toast[];
  toggleSidebar: (open?: boolean) => void;
  openModal: (modalId: string) => void;
  closeModal: () => void;
  addToast: (message: string, type?: Toast["type"]) => void;
  removeToast: (id: string) => void;
}

export const useUIStore = create<UIStore>((set, get) => ({
  sidebarOpen: false,
  activeModal: null,
  toasts: [],

  toggleSidebar: (open) =>
    set((state) => ({
      sidebarOpen: open !== undefined ? open : !state.sidebarOpen,
    })),

  openModal: (modalId) => set({ activeModal: modalId }),

  closeModal: () => set({ activeModal: null }),

  addToast: (message, type = "info") => {
    const id = Math.random().toString(36).substr(2, 9);
    const toast: Toast = { id, message, type };

    set((state) => ({
      toasts: [...state.toasts, toast],
    }));

    // Auto remove after 3s
    setTimeout(() => {
      get().removeToast(id);
    }, 3000);
  },

  removeToast: (id) =>
    set((state) => ({
      toasts: state.toasts.filter((t) => t.id !== id),
    })),
}));

// Block selection store — one block = 10×10 pixels = 100 pixels
interface BlockSelectionStore {
  selectedBlocks: Set<string>; // "bx,by" block coordinates
  toggleBlock: (bx: number, by: number) => void;
  clearSelection: () => void;
  isSelected: (bx: number, by: number) => boolean;
  getSelectedCount: () => number;
  getSelectedPixels: () => { x: number; y: number }[];
}

export const useBlockSelectionStore = create<BlockSelectionStore>((set, get) => ({
  selectedBlocks: new Set<string>(),

  toggleBlock: (bx, by) => {
    const key = `${bx},${by}`;
    set((state) => {
      const next = new Set(state.selectedBlocks);
      if (next.has(key)) {
        next.delete(key);
      } else {
        next.add(key);
      }
      return { selectedBlocks: next };
    });
  },

  clearSelection: () => set({ selectedBlocks: new Set<string>() }),

  isSelected: (bx, by) => get().selectedBlocks.has(`${bx},${by}`),

  getSelectedCount: () => get().selectedBlocks.size,

  getSelectedPixels: () => {
    const pixels: { x: number; y: number }[] = [];
    get().selectedBlocks.forEach((key) => {
      const [bx, by] = key.split(",").map(Number);
      for (let dx = 0; dx < BLOCK_SIZE; dx++) {
        for (let dy = 0; dy < BLOCK_SIZE; dy++) {
          pixels.push({ x: bx * BLOCK_SIZE + dx, y: by * BLOCK_SIZE + dy });
        }
      }
    });
    return pixels;
  },
}));
