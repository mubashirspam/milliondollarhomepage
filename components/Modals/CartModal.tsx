// components/Modals/CartModal.tsx

"use client";

import { useState } from "react";
import { X, Trash2 } from "lucide-react";
import { useCartStore, useUIStore } from "@/lib/store";
import { formatCurrency, PIXEL_PRICE } from "@/lib/utils";
import { authClient } from "@/lib/auth-client";

declare global {
  interface Window {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    Razorpay: new (options: Record<string, any>) => { open: () => void };
  }
}

function loadRazorpayScript(): Promise<boolean> {
  return new Promise((resolve) => {
    if (document.getElementById("razorpay-script")) {
      resolve(true);
      return;
    }
    const script = document.createElement("script");
    script.id = "razorpay-script";
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
}

export function CartModal() {
  const { data: session } = authClient.useSession();
  const [isLoading, setIsLoading] = useState(false);

  const activeModal = useUIStore((state) => state.activeModal);
  const closeModal = useUIStore((state) => state.closeModal);
  const openModal = useUIStore((state) => state.openModal);
  const addToast = useUIStore((state) => state.addToast);

  const areas = useCartStore((state) => state.areas);
  const removeArea = useCartStore((state) => state.removeArea);
  const clearCart = useCartStore((state) => state.clearCart);
  const getTotalPixels = useCartStore((state) => state.getTotalPixels);
  const getPixelsInAreas = useCartStore((state) => state.getPixelsInAreas);

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

    setIsLoading(true);

    try {
      // Build pixel list from areas
      const pixelSet = getPixelsInAreas();
      const pixels = Array.from(pixelSet).map((key) => {
        const [x, y] = key.split(",").map(Number);
        return { x, y };
      });

      // Create Razorpay order
      const res = await fetch("/api/razorpay/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pixels }),
      });

      const orderData = await res.json();
      if (!orderData.success) {
        addToast(orderData.error || "Failed to create order", "error");
        setIsLoading(false);
        return;
      }

      // Load Razorpay script
      const loaded = await loadRazorpayScript();
      if (!loaded) {
        addToast("Failed to load payment gateway", "error");
        setIsLoading(false);
        return;
      }

      const options = {
        key: orderData.keyId,
        amount: orderData.amount,
        currency: orderData.currency,
        name: "Million Pixel Homepage",
        description: `Purchase ${pixels.length} pixel${pixels.length > 1 ? "s" : ""} on milliondollarhomepage.in`,
        order_id: orderData.orderId,
        prefill: {
          name: session.user.name || "",
          email: session.user.email || "",
        },
        theme: { color: "#4F46E5" },
        handler: async (response: {
          razorpay_order_id: string;
          razorpay_payment_id: string;
          razorpay_signature: string;
        }) => {
          try {
            const verifyRes = await fetch("/api/razorpay/verify", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(response),
            });
            const verifyData = await verifyRes.json();
            if (verifyData.success) {
              addToast(verifyData.message || "Purchase successful!", "success");
              clearCart();
              closeModal();
              window.location.href = "/my-pixels?purchased=true";
            } else {
              addToast(verifyData.error || "Payment verification failed", "error");
            }
          } catch {
            addToast("Payment verification failed", "error");
          }
        },
        modal: {
          ondismiss: () => {
            setIsLoading(false);
          },
        },
      };

      closeModal();
      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (error) {
      console.error("Checkout error:", error);
      addToast("An error occurred during checkout", "error");
    } finally {
      setIsLoading(false);
    }
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
          <div className="flex justify-between text-sm text-gray-500">
            <span>Price per pixel:</span>
            <span className="font-bold text-gray-700">₹1</span>
          </div>
          <div className="flex justify-between text-lg font-bold text-gray-800">
            <span>Total:</span>
            <span>{formatCurrency(total)}</span>
          </div>
          <button
            onClick={handleCheckout}
            disabled={areas.length === 0 || isLoading}
            className="w-full py-3 bg-indigo-600 text-white rounded-lg font-bold hover:bg-indigo-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? "Creating Order..." : "Proceed to Checkout"}
          </button>
        </div>
      </div>
    </div>
  );
}
