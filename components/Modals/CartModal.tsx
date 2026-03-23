// components/Modals/CartModal.tsx

"use client";

import { X, Trash2 } from "lucide-react";
import { useCartStore, useUIStore } from "@/lib/store";
import { formatCurrency, PIXEL_PRICE } from "@/lib/utils";
import { useSession } from "next-auth/react";

export function CartModal() {
  const { data: session } = useSession();
  const activeModal = useUIStore((state) => state.activeModal);
  const closeModal = useUIStore((state) => state.closeModal);
  const openModal = useUIStore((state) => state.openModal);
  const addToast = useUIStore((state) => state.addToast);

  const areas = useCartStore((state) => state.areas);
  const removeArea = useCartStore((state) => state.removeArea);
  const getTotalPixels = useCartStore((state) => state.getTotalPixels);

  if (activeModal !== "cart") return null;

  const totalPixels = getTotalPixels();
  const total = totalPixels * PIXEL_PRICE;

  async function handleCheckout() {
    if (!session) {
      closeModal();
      openModal("login");
      addToast("Please sign in to continue", "error");
      return;
    }

    // Disable purchasing for now
    addToast("Purchasing is currently disabled", "info");
    return;

    /* 
    try {
      const response = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ areas }),
      });

      const data = await response.json();

      if (data.success && data.url) {
        window.location.href = data.url;
      } else {
        addToast("Failed to create checkout session", "error");
      }
    } catch (error) {
      console.error("Checkout error:", error);
      addToast("An error occurred", "error");
    }
    */
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg p-6 m-4 flex flex-col max-h-[80vh]">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-gray-800">Your Cart</h2>
          <button
            onClick={closeModal}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto mb-4 border-t border-b border-gray-100 py-2">
          {areas.length === 0 ? (
            <div className="text-center py-10 text-gray-400">
              <p>Your cart is empty</p>
              <p className="text-xs mt-2">
                Hold Shift and drag to select pixels
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {areas.map((area) => {
                const width = area.maxX - area.minX + 1;
                const height = area.maxY - area.minY + 1;
                return (
                  <div
                    key={area.id}
                    className="flex justify-between items-center p-3 border border-gray-200 hover:bg-gray-50 rounded-lg"
                  >
                    <div className="flex items-center gap-3 flex-1">
                      <div
                        className="bg-indigo-100 border-2 border-indigo-300 rounded flex items-center justify-center text-xs font-bold text-indigo-700"
                        style={{ width: "32px", height: "32px" }}
                      >
                        {area.pixelCount}
                      </div>
                      <div>
                        <div className="text-sm font-semibold text-gray-700">
                          {width}×{height} Area
                        </div>
                        <div className="text-xs text-gray-500 font-mono">
                          ({area.minX}, {area.minY}) to ({area.maxX},{" "}
                          {area.maxY})
                        </div>
                        <div className="text-xs text-indigo-600 font-medium">
                          {area.pixelCount} pixels
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="font-bold text-gray-800">
                        {formatCurrency(area.pixelCount * PIXEL_PRICE)}
                      </span>
                      <button
                        onClick={() => removeArea(area.id)}
                        className="text-red-400 hover:text-red-600 transition"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div className="space-y-3">
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">Total pixels:</span>
            <span className="font-bold">{totalPixels}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">Areas selected:</span>
            <span className="font-bold">{areas.length}</span>
          </div>
          <div className="flex justify-between text-lg font-bold text-gray-800">
            <span>Total:</span>
            <span>{formatCurrency(total)}</span>
          </div>
          <button
            onClick={handleCheckout}
            disabled={areas.length === 0}
            className="w-full py-3 bg-indigo-600 text-white rounded-lg font-bold hover:bg-indigo-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Proceed to Checkout
          </button>
        </div>
      </div>
    </div>
  );
}
