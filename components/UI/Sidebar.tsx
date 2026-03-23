"use client";

import { usePixelStore, useUIStore } from "@/lib/store";
import { X, ExternalLink } from "lucide-react";
import { useSession } from "next-auth/react";

export function Sidebar() {
  const { data: session } = useSession();
  const open = useUIStore((state) => state.sidebarOpen);
  const toggleSidebar = useUIStore((state) => state.toggleSidebar);
  const selectedPixel = usePixelStore((state) => state.selectedPixel);
  const getPixel = usePixelStore((state) => state.getPixelByCoord);
  const openModal = useUIStore((state) => state.openModal);

  if (!open || !selectedPixel) return null;

  const pixel = getPixel(selectedPixel.x, selectedPixel.y);
  const isOwner = session?.user?.id && pixel?.ownerId === session.user.id;
  const isSold = !!pixel;

  return (
    <div className="absolute top-0 right-0 bottom-0 w-80 bg-white shadow-2xl z-20 flex flex-col border-l border-gray-200 animate-in slide-in-from-right duration-300">
      <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
        <h2 className="font-bold text-gray-800">Pixel Details</h2>
        <button
          onClick={() => toggleSidebar(false)}
          className="text-gray-400 hover:text-gray-600"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      <div className="p-6 flex-1 overflow-y-auto">
        <div className="flex items-center justify-center mb-8">
          <div
            className="w-24 h-24 border-4 border-white shadow-lg rounded-lg"
            style={{ backgroundColor: pixel?.color || "#ffffff" }}
          />
        </div>

        <div className="space-y-6">
          <div>
            <label className="text-xs uppercase font-bold text-gray-400 tracking-wider">
              Coordinates
            </label>
            <p className="text-lg font-mono font-bold text-gray-800">
              ({selectedPixel.x}, {selectedPixel.y})
            </p>
          </div>

          <div>
            <label className="text-xs uppercase font-bold text-gray-400 tracking-wider">
              Status
            </label>
            <div className="flex items-center gap-2 mt-1">
              <div
                className={`w-2 h-2 rounded-full ${
                  isSold ? "bg-red-500" : "bg-green-500"
                }`}
              />
              <p className="font-medium text-gray-700">
                {isSold ? "Sold" : "Available"}
              </p>
            </div>
          </div>

          {isSold ? (
            <>
              {pixel?.url && (
                <div>
                  <label className="text-xs uppercase font-bold text-gray-400 tracking-wider">
                    Link
                  </label>
                  <a
                    href={pixel.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-indigo-600 hover:text-indigo-800 hover:underline mt-1 break-all"
                  >
                    {pixel.url}
                    <ExternalLink className="w-3 h-3 flex-shrink-0" />
                  </a>
                </div>
              )}

              {pixel?.message && (
                <div>
                  <label className="text-xs uppercase font-bold text-gray-400 tracking-wider">
                    Message
                  </label>
                  <p className="text-gray-700 mt-1 italic">
                    &quot;{pixel.message}&quot;
                  </p>
                </div>
              )}

              {isOwner && (
                <button
                  onClick={() => openModal("edit-pixel")}
                  className="w-full py-2 px-4 bg-gray-100 text-gray-700 rounded-lg font-bold hover:bg-gray-200 transition mt-4"
                >
                  Edit Pixel
                </button>
              )}
            </>
          ) : (
            <div className="pt-4 border-t border-gray-100">
              <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-4 text-center">
                <p className="text-sm text-indigo-700 font-medium mb-2">
                  Available for purchase
                </p>
                <p className="text-xs text-gray-600">
                  Hold{" "}
                  <kbd className="px-1.5 py-0.5 bg-white border border-gray-300 rounded text-xs font-mono">
                    Shift
                  </kbd>{" "}
                  and drag to select pixels
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
