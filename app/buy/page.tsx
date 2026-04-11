// app/buy/page.tsx

"use client";

import { useEffect } from "react";
import { PixelCanvas } from "@/components/Canvas/PixelCanvas";
import { Header } from "@/components/UI/Header";
import { Sidebar } from "@/components/UI/Sidebar";
import { ZoomControls } from "@/components/Canvas/ZoomControls";
import { Minimap } from "@/components/Canvas/Minimap";
import { LoginModal } from "@/components/Modals/LoginModal";
import { PaymentModal } from "@/components/Modals/PaymentModal";
import { EditPixelModal } from "@/components/Modals/EditPixelModal";
import { DevInfoModal } from "@/components/Modals/DevInfoModal";
import { ToastContainer } from "@/components/UI/Toast";
import { SelectionHint } from "@/components/UI/SelectionHint";
import { usePixelStore } from "@/lib/store";

export default function BuyPixels() {
  const setPixels = usePixelStore((state) => state.setPixels);
  const setReservedPixels = usePixelStore((state) => state.setReservedPixels);

  useEffect(() => {
    async function fetchPixels() {
      try {
        const response = await fetch("/api/pixels");
        if (response.ok) {
          const data = await response.json();
          setPixels(data.pixels);
          setReservedPixels(data.pendingPixels || []);
        }
      } catch (error) {
        console.error("Failed to fetch pixels:", error);
      }
    }

    fetchPixels();
    const interval = setInterval(fetchPixels, 30000);
    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <main className="relative w-screen h-screen overflow-hidden bg-slate-300">
      {/* Canvas — full screen base layer */}
      <div className="absolute inset-0 z-0">
        <PixelCanvas />
      </div>

      {/* UI overlay — pointer-events-none by default, children opt in */}
      <div className="absolute inset-0 z-10 flex flex-col pointer-events-none">
        {/* Header */}
        <div className="pointer-events-auto shrink-0">
          <Header />
        </div>

        {/* Hint */}
        <SelectionHint />

        {/* Main area */}
        <div className="flex-1 relative min-h-0">
          {/* Selection panel (Sidebar) — renders its own pointer-events-auto */}
          <Sidebar />

          {/* Zoom controls */}
          <div className="absolute bottom-6 right-6 pointer-events-auto z-10">
            <ZoomControls />
          </div>

          {/* Minimap — desktop only */}
          <div className="absolute bottom-6 left-6 pointer-events-auto hidden md:block z-10">
            <Minimap />
          </div>
        </div>
      </div>

      {/* Modals */}
      <LoginModal />
      <PaymentModal />
      <EditPixelModal />
      <DevInfoModal />

      <ToastContainer />
    </main>
  );
}
