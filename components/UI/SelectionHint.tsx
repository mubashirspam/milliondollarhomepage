// components/UI/SelectionHint.tsx

"use client";

import { useState, useEffect } from "react";
import { X } from "lucide-react";

export function SelectionHint() {
  const [visible, setVisible] = useState(true);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    const isDismissed = localStorage.getItem("selectionHintDismissed");
    if (isDismissed) {
      setVisible(false);
      setDismissed(true);
    }
  }, []);

  const handleDismiss = () => {
    setVisible(false);
    setDismissed(true);
    localStorage.setItem("selectionHintDismissed", "true");
  };

  if (!visible || dismissed) return null;

  return (
    <div className="absolute top-20 left-1/2 transform -translate-x-1/2 z-20 pointer-events-auto">
      <div className="bg-indigo-600 text-white px-6 py-3 rounded-lg shadow-xl flex items-center gap-4 animate-bounce">
        <div className="flex items-center gap-2">
          <kbd className="px-2 py-1 bg-white/20 rounded text-sm font-bold">
            Shift
          </kbd>
          <span className="text-sm">+ Drag to select pixels</span>
        </div>
        <button
          onClick={handleDismiss}
          className="text-white/80 hover:text-white transition"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
