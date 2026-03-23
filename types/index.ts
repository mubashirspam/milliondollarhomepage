// types/index.ts

export interface Pixel {
  id: string;
  x: number;
  y: number;
  color: string;
  url?: string | null;
  message?: string | null;
  image?: string | null;
  ownerId: string;
  owner?: User;
  createdAt: Date;
  updatedAt: Date;
}

export interface User {
  id: string;
  name?: string | null;
  email?: string | null;
  image?: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface Purchase {
  id: string;
  userId: string;
  amount: number;
  pixelCount: number;
  status: "pending" | "completed" | "failed";
  stripeSessionId: string;
  metadata?: Record<string, unknown>;
  createdAt: Date;
  updatedAt: Date;
}

export interface CartItem {
  x: number;
  y: number;
  key: string;
}

export interface ViewportState {
  x: number;
  y: number;
  scale: number;
  isDragging: boolean;
  lastX: number;
  lastY: number;
}

export interface CanvasConfig {
  gridSize: number;
  pixelSize: number;
  totalPixels: number;
}

export interface PixelMap {
  [key: string]: Pixel;
}

export interface Toast {
  id: string;
  message: string;
  type: "success" | "error" | "info";
}

export interface EditPixelFormData {
  color: string;
  url?: string;
  message?: string;
  image?: string;
}

export interface CheckoutSessionData {
  pixelCoordinates: Array<{ x: number; y: number }>;
  totalAmount: number;
}

export interface APIResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
}

export interface PixelResponse {
  pixels: Pixel[];
  total: number;
}

export interface BoundingBox {
  minX: number;
  maxX: number;
  minY: number;
  maxY: number;
}
