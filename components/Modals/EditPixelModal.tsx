"use client";

import { useState, useEffect, useRef } from "react";
import { usePixelStore, useUIStore } from "@/lib/store";
import { X, Upload, Link, Loader2 } from "lucide-react";
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
  const [image, setImage] = useState("");
  const [uploading, setUploading] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const pixel = selectedPixel
    ? getPixel(selectedPixel.x, selectedPixel.y)
    : null;

  useEffect(() => {
    if (pixel) {
      setColor(pixel.color);
      setUrl(pixel.url || "");
      setMessage(pixel.message || "");
      setImage(pixel.image || "");
    }
  }, [selectedPixel, pixel]);

  if (activeModal !== "edit-pixel" || !pixel) return null;

  async function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      addToast("Image must be under 5MB", "error");
      return;
    }

    setUploading(true);
    try {
      const res = await fetch(`/api/upload?filename=${encodeURIComponent(file.name)}`, {
        method: "POST",
        body: file,
      });
      const data = await res.json();
      if (data.url) {
        setImage(data.url);
        addToast("Image uploaded!", "success");
      } else {
        addToast(data.error || "Upload failed", "error");
      }
    } catch {
      addToast("Upload failed", "error");
    } finally {
      setUploading(false);
    }
  }

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
        body: JSON.stringify({ color, url, message, image }),
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
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md p-6 m-4 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-800">Edit Pixel</h2>
            <p className="text-xs text-gray-500 font-mono mt-0.5">
              ({pixel.x}, {pixel.y})
            </p>
          </div>
          <button
            onClick={closeModal}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Color */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Color
            </label>
            <div className="flex gap-3">
              <input
                type="color"
                value={color}
                onChange={(e) => setColor(e.target.value)}
                className="h-10 w-20 rounded cursor-pointer border border-gray-300"
              />
              <input
                type="text"
                value={color}
                onChange={(e) => setColor(e.target.value)}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm font-mono"
              />
            </div>
          </div>

          {/* Redirect URL */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-1">
              <Link className="w-3.5 h-3.5" /> Redirect URL (click on pixel goes here)
            </label>
            <input
              type="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://yourwebsite.com"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm"
            />
          </div>

          {/* Message */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Message / Title
            </label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Your brand or message shown on hover..."
              rows={2}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 resize-none text-sm"
            />
          </div>

          {/* Image */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-1">
              <Upload className="w-3.5 h-3.5" /> Image
            </label>

            {/* Preview */}
            {image && (
              <div className="mb-2 relative inline-block">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={image}
                  alt="Pixel image"
                  className="h-16 w-16 object-cover rounded border border-gray-200"
                />
                <button
                  type="button"
                  onClick={() => setImage("")}
                  className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs"
                >
                  ×
                </button>
              </div>
            )}

            {/* Upload button */}
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
                className="flex-1 py-2 border-2 border-dashed border-gray-300 rounded-lg text-sm text-gray-500 hover:border-indigo-400 hover:text-indigo-600 transition flex items-center justify-center gap-2"
              >
                {uploading ? (
                  <><Loader2 className="w-4 h-4 animate-spin" /> Uploading...</>
                ) : (
                  <><Upload className="w-4 h-4" /> Upload image</>
                )}
              </button>
            </div>
            <input
              type="hidden"
              ref={fileInputRef as React.RefObject<HTMLInputElement>}
            />
            <input
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              className="hidden"
              ref={fileInputRef}
            />

            {/* Or paste URL */}
            <input
              type="url"
              value={image}
              onChange={(e) => setImage(e.target.value)}
              placeholder="Or paste image URL directly"
              className="w-full mt-2 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm"
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
