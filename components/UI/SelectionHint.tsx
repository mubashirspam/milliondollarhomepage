// components/UI/SelectionHint.tsx

"use client";

import { useState, useEffect } from "react";
import { X, MousePointer2 } from "lucide-react";

export function SelectionHint() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const dismissed = localStorage.getItem("blockHintDismissed");
    if (!dismissed) setVisible(true);
  }, []);

  const handleDismiss = () => {
    setVisible(false);
    localStorage.setItem("blockHintDismissed", "true");
  };

  if (!visible) return null;

  return (
    <div className="absolute top-20 left-1/2 -translate-x-1/2 z-20 pointer-events-auto">
      <div className="bg-gray-900/90 backdrop-blur-sm text-white px-5 py-3 rounded-xl shadow-xl flex items-center gap-3 border border-white/10">
        <MousePointer2 className="w-4 h-4 text-blue-400 shrink-0" />
        <p className="text-sm">
          <span className="font-bold text-blue-300">Click</span> a block to select it ·{" "}
          <span className="font-bold text-blue-300">Drag</span> to pan ·{" "}
          <span className="font-bold text-blue-300">Scroll</span> to zoom
        </p>
        <button
          onClick={handleDismiss}
          className="text-white/50 hover:text-white transition ml-1"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
