"use client";

import { useState, useEffect } from "react";
import { usePixelStore, useUIStore } from "@/lib/store";
import { X } from "lucide-react";
import { isValidUrl } from "@/lib/utils";
import { useRouter } from "next/navigation";

export function EditPixelModal() {
  const activeModal = useUIStore((state) => state.activeModal);
  const closeModal = useUIStore((state) => state.closeModal);
  const selectedPixel = usePixelStore((state) => state.selectedPixel);
  const getPixel = usePixelStore((state) => state.getPixelByCoord);
  const updatePixel = usePixelStore((state) => state.updatePixel);
  const addToast = useUIStore((state) => state.addToast);
  const router = useRouter();

  const [color, setColor] = useState("#000000");
  const [url, setUrl] = useState("");
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const pixel = selectedPixel
    ? getPixel(selectedPixel.x, selectedPixel.y)
    : null;

  useEffect(() => {
    if (pixel) {
      setColor(pixel.color);
      setUrl(pixel.url || "");
      setMessage(pixel.message || "");
    }
  }, [selectedPixel, pixel]);

  if (activeModal !== "edit-pixel" || !pixel) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (url && !isValidUrl(url)) {
      addToast("Please enter a valid URL", "error");
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch(`/api/pixels/${pixel.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ color, url, message }),
      });

      if (response.ok) {
        const updatedPixel = await response.json();
        updatePixel(updatedPixel);
        addToast("Pixel updated successfully", "success");
        closeModal();
        router.refresh();
      } else {
        throw new Error("Failed to update pixel");
      }
    } catch {
      addToast("Failed to update pixel", "error");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md p-6 m-4">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-800">Edit Pixel</h2>
          <button
            onClick={closeModal}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Color
            </label>
            <div className="flex gap-3">
              <input
                type="color"
                value={color}
                onChange={(e) => setColor(e.target.value)}
                className="h-10 w-20 rounded cursor-pointer"
              />
              <input
                type="text"
                value={color}
                onChange={(e) => setColor(e.target.value)}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              URL (Optional)
            </label>
            <input
              type="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://example.com"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Message (Optional)
            </label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Say something..."
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 resize-none"
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 bg-indigo-600 text-white rounded-lg font-bold hover:bg-indigo-700 transition disabled:opacity-50"
          >
            {isLoading ? "Saving..." : "Save Changes"}
          </button>
        </form>
      </div>
    </div>
  );
}
