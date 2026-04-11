"use client";

import { useState } from "react";
import { X, ShoppingCart, Loader2, CheckSquare, Trash2 } from "lucide-react";
import { useBlockSelectionStore, useUIStore } from "@/lib/store";
import { BLOCK_SIZE, BLOCK_PRICE, formatCurrency } from "@/lib/utils";
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

export function Sidebar() {
  const { data: session } = authClient.useSession();
  const [isLoading, setIsLoading] = useState(false);

  const blockSelection = useBlockSelectionStore();
  const { selectedBlocks, clearSelection, getSelectedCount, getSelectedPixels, toggleBlock } =
    blockSelection;

  const openModal = useUIStore((state) => state.openModal);
  const addToast = useUIStore((state) => state.addToast);

  const count = getSelectedCount();
  if (count === 0) return null;

  const totalPixels = count * BLOCK_SIZE * BLOCK_SIZE;
  const totalCost = count * BLOCK_PRICE;
  const blockList = Array.from(selectedBlocks);

  async function handleCreateOrder() {
    if (!session) {
      openModal("login");
      addToast("Please sign in to continue", "info");
      return;
    }

    setIsLoading(true);
    try {
      const pixels = getSelectedPixels();

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
        description: `Purchase ${count} block${count > 1 ? "s" : ""} · ${totalPixels} pixels`,
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
              clearSelection();
              window.location.href = "/my-pixels?purchased=true";
            } else {
              addToast(verifyData.error || "Payment verification failed", "error");
            }
          } catch {
            addToast("Payment verification failed", "error");
          }
        },
        modal: {
          ondismiss: () => setIsLoading(false),
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch {
      addToast("An error occurred. Please try again.", "error");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <>
      {/* ── Desktop side panel (right) ──────────────────────────────────── */}
      <div className="hidden md:flex absolute top-0 right-0 bottom-0 w-80 bg-white shadow-2xl z-20 flex-col border-l border-gray-200 animate-in slide-in-from-right duration-200 pointer-events-auto">
        {/* Header */}
        <div className="px-4 py-3.5 border-b border-gray-100 flex items-center justify-between bg-gray-50 shrink-0">
          <div className="flex items-center gap-2">
            <CheckSquare className="w-4 h-4 text-blue-600" />
            <h2 className="font-bold text-gray-800 text-sm">Selected Blocks</h2>
          </div>
          <button
            onClick={clearSelection}
            className="text-gray-400 hover:text-gray-600 transition p-0.5 rounded"
            title="Clear selection"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Stats bar */}
        <div className="px-4 py-3 bg-blue-50 border-b border-blue-100 shrink-0">
          <div className="grid grid-cols-3 gap-2 text-center">
            <div>
              <div className="text-xl font-bold text-blue-700 leading-tight">{count}</div>
              <div className="text-[10px] text-blue-500 font-semibold uppercase tracking-wide">
                Blocks
              </div>
            </div>
            <div>
              <div className="text-xl font-bold text-blue-700 leading-tight">
                {totalPixels.toLocaleString()}
              </div>
              <div className="text-[10px] text-blue-500 font-semibold uppercase tracking-wide">
                Pixels
              </div>
            </div>
            <div>
              <div className="text-xl font-bold text-blue-700 leading-tight">
                {formatCurrency(totalCost)}
              </div>
              <div className="text-[10px] text-blue-500 font-semibold uppercase tracking-wide">
                Total
              </div>
            </div>
          </div>
        </div>

        {/* Block list */}
        <div className="flex-1 overflow-y-auto p-3 space-y-1 min-h-0">
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2 px-1">
            Selected ({count})
          </p>
          {blockList.map((key) => {
            const [bx, by] = key.split(",").map(Number);
            return (
              <div
                key={key}
                className="flex items-center justify-between px-3 py-2 bg-blue-50 border border-blue-100 rounded-lg group"
              >
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-sm bg-blue-400 shrink-0" />
                  <span className="text-xs font-mono text-gray-700">
                    Block ({bx}, {by})
                  </span>
                </div>
                <button
                  onClick={() => toggleBlock(bx, by)}
                  className="text-gray-300 hover:text-red-500 transition opacity-0 group-hover:opacity-100"
                  title="Remove"
                >
                  <Trash2 className="w-3 h-3" />
                </button>
              </div>
            );
          })}
        </div>

        {/* Checkout footer */}
        <div className="p-4 border-t border-gray-100 space-y-2.5 shrink-0">
          <div className="flex justify-between text-xs text-gray-500">
            <span>Price per pixel</span>
            <span className="font-semibold text-gray-700">₹1</span>
          </div>
          <div className="flex justify-between text-sm font-bold text-gray-800">
            <span>Total ({totalPixels.toLocaleString()} px)</span>
            <span>{formatCurrency(totalCost)}</span>
          </div>

          <button
            onClick={handleCreateOrder}
            disabled={isLoading}
            className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white rounded-xl font-bold flex items-center justify-center gap-2 transition-colors disabled:opacity-60 disabled:cursor-not-allowed text-sm"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Creating Order…
              </>
            ) : (
              <>
                <ShoppingCart className="w-4 h-4" />
                Create Order
              </>
            )}
          </button>

          <button
            onClick={clearSelection}
            className="w-full py-1.5 text-gray-400 hover:text-gray-600 text-xs font-medium transition-colors"
          >
            Clear Selection
          </button>
        </div>
      </div>

      {/* ── Mobile bottom sheet ─────────────────────────────────────────── */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-30 pointer-events-auto animate-in slide-in-from-bottom duration-200">
        <div className="bg-white border-t-2 border-gray-200 shadow-2xl rounded-t-2xl px-4 pt-3 pb-6">
          {/* Drag handle */}
          <div className="w-10 h-1 bg-gray-300 rounded-full mx-auto mb-3" />

          {/* Summary row */}
          <div className="flex items-center justify-between mb-3">
            <div>
              <p className="font-bold text-gray-900 text-sm">
                {count} block{count > 1 ? "s" : ""} selected
              </p>
              <p className="text-xs text-gray-500">
                {totalPixels.toLocaleString()} pixels · {formatCurrency(totalCost)}
              </p>
            </div>
            <button
              onClick={clearSelection}
              className="p-1.5 text-gray-400 hover:text-gray-600 transition rounded"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <button
            onClick={handleCreateOrder}
            disabled={isLoading}
            className="w-full py-3.5 bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white rounded-xl font-bold flex items-center justify-center gap-2 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Creating Order…
              </>
            ) : (
              <>
                <ShoppingCart className="w-4 h-4" />
                Create Order — {formatCurrency(totalCost)}
              </>
            )}
          </button>
        </div>
      </div>
    </>
  );
}
