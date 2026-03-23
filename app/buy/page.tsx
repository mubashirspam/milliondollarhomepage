// app/buy/page.tsx

"use client";

import { useEffect } from "react";
import { PixelCanvas } from "@/components/Canvas/PixelCanvas";
import { Header } from "@/components/UI/Header";
import { Sidebar } from "@/components/UI/Sidebar";
import { ZoomControls } from "@/components/Canvas/ZoomControls";
import { Minimap } from "@/components/Canvas/Minimap";
import { LoginModal } from "@/components/Modals/LoginModal";
import { CartModal } from "@/components/Modals/CartModal";
import { PaymentModal } from "@/components/Modals/PaymentModal";
import { EditPixelModal } from "@/components/Modals/EditPixelModal";
import { DevInfoModal } from "@/components/Modals/DevInfoModal";
import { ToastContainer } from "@/components/UI/Toast";
import { SelectionHint } from "@/components/UI/SelectionHint";
import { usePixelStore } from "@/lib/store";

export default function BuyPixels() {
  const setPixels = usePixelStore((state) => state.setPixels);

  useEffect(() => {
    async function fetchPixels() {
      try {
        const response = await fetch("/api/pixels");
        if (response.ok) {
          const data = await response.json();
          setPixels(data.pixels);
        }
      } catch (error) {
        console.error("Failed to fetch pixels:", error);
      }
    }

    // Fetch initial pixels
    fetchPixels();

    // Set up SSE or polling for real-time updates
    const interval = setInterval(fetchPixels, 30000); // Poll every 30s

    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <main className="relative w-screen h-screen overflow-hidden bg-gray-100">
      {/* Canvas Layer */}
      <div className="absolute inset-0 z-0">
        <PixelCanvas />
      </div>

      {/* UI Overlay Layer */}
      <div className="absolute inset-0 z-10 flex flex-col pointer-events-none">
        {/* Header */}
        <div className="pointer-events-auto">
          <Header />
        </div>

        {/* Selection Hint */}
        <SelectionHint />

        {/* Main Content Area */}
        <div className="flex-1 flex relative">
          {/* Sidebar */}
          <Sidebar />

          {/* Zoom Controls */}
          <div className="absolute bottom-6 right-6 pointer-events-auto">
            <ZoomControls />
          </div>

          {/* Minimap */}
          <div className="absolute bottom-6 left-6 pointer-events-auto hidden md:block">
            <Minimap />
          </div>
        </div>
      </div>

      {/* Modals */}
      <LoginModal />
      <CartModal />
      <PaymentModal />
      <EditPixelModal />
      <DevInfoModal />

      {/* Toast Notifications */}
      <ToastContainer />
    </main>
  );
}
