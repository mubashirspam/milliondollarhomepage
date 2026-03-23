"use client";

import { X, Github, Twitter } from "lucide-react";
import { useUIStore } from "@/lib/store";

export function DevInfoModal() {
  const activeModal = useUIStore((state) => state.activeModal);
  const closeModal = useUIStore((state) => state.closeModal);

  if (activeModal !== "dev-info") return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md p-6 m-4">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-800">About</h2>
          <button
            onClick={closeModal}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="prose prose-sm text-gray-600 mb-6">
          <p>
            The Million Pixel Homepage is a modern reimplementation of the
            classic concept, built with the latest web technologies.
          </p>
          <p>
            Buy pixels, set your color and URL, and become a part of internet
            history.
          </p>

          <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <h3 className="text-sm font-bold text-blue-900 mb-2">
              How to Select Pixels:
            </h3>
            <ul className="text-xs text-blue-800 space-y-1 list-disc pl-4">
              <li>
                <strong>Single Pixel:</strong> Click on any pixel to add it to
                cart
              </li>
              <li>
                <strong>Area Selection:</strong> Hold{" "}
                <kbd className="px-1 py-0.5 bg-white border border-blue-300 rounded text-blue-900 font-mono text-[10px]">
                  Shift
                </kbd>{" "}
                + Drag to select multiple pixels
              </li>
              <li>
                <strong>Pan Canvas:</strong> Drag without Shift to move around
              </li>
              <li>
                <strong>Zoom:</strong> Use mouse wheel to zoom in/out
              </li>
            </ul>
          </div>
        </div>

        <div className="space-y-3">
          <a
            href="https://github.com"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-3 w-full py-3 bg-gray-900 text-white rounded-lg font-bold hover:bg-black transition"
          >
            <Github className="w-5 h-5" />
            View Source
          </a>
          <a
            href="https://twitter.com"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-3 w-full py-3 bg-blue-500 text-white rounded-lg font-bold hover:bg-blue-600 transition"
          >
            <Twitter className="w-5 h-5" />
            Follow Developer
          </a>
        </div>

        <div className="mt-6 text-center text-xs text-gray-400">
          Built with Next.js 14, Prisma, Stripe & Tailwind
        </div>
      </div>
    </div>
  );
}
