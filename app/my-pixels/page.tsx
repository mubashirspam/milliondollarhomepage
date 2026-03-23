// app/my-pixels/page.tsx

"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { authClient } from "@/lib/auth-client";
import { usePixelStore, useUIStore } from "@/lib/store";
import { EditPixelModal } from "@/components/Modals/EditPixelModal";
import { ToastContainer } from "@/components/UI/Toast";
import { ExternalLink, Pencil, Home, ShoppingBag } from "lucide-react";
import { Pixel } from "@/types";

function MyPixelsContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const purchased = searchParams.get("purchased");

  const { data: session, isPending } = authClient.useSession();
  const addToast = useUIStore((state) => state.addToast);
  const selectPixel = usePixelStore((state) => state.selectPixel);
  const setPixels = usePixelStore((state) => state.setPixels);
  const openModal = useUIStore((state) => state.openModal);

  const [pixels, setLocalPixels] = useState<Pixel[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isPending && !session) {
      router.push("/buy");
    }
  }, [session, isPending, router]);

  useEffect(() => {
    if (purchased) {
      addToast("🎉 Purchase successful! Your pixels are ready.", "success");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!session) return;

    async function fetchMyPixels() {
      try {
        const res = await fetch("/api/my-pixels");
        const data = await res.json();
        if (data.success) {
          setLocalPixels(data.pixels);
          setPixels(data.pixels);
        }
      } catch {
        addToast("Failed to load pixels", "error");
      } finally {
        setLoading(false);
      }
    }

    fetchMyPixels();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session]);

  function handleEdit(pixel: Pixel) {
    selectPixel(pixel.x, pixel.y);
    openModal("edit-pixel");
  }

  if (isPending || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-pulse text-gray-400">Loading your pixels...</div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 shadow-sm sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-purple-600 rounded text-white flex items-center justify-center font-bold text-xs">
              1M
            </div>
            <div>
              <h1 className="font-bold text-gray-800">My Pixels</h1>
              <p className="text-xs text-gray-500">
                {pixels.length} pixel{pixels.length !== 1 ? "s" : ""} owned
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => router.push("/buy")}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 text-white rounded-lg text-sm font-semibold hover:bg-indigo-700 transition"
            >
              <ShoppingBag className="w-4 h-4" />
              Buy More
            </button>
            <button
              onClick={() => router.push("/")}
              className="p-2 text-gray-400 hover:text-gray-600 transition"
              title="Home"
            >
              <Home className="w-5 h-5" />
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-4 py-8">
        {purchased && (
          <div className="mb-6 bg-green-50 border border-green-200 rounded-xl p-4 text-center">
            <p className="text-green-800 font-semibold text-lg">
              🎉 Purchase successful!
            </p>
            <p className="text-green-700 text-sm mt-1">
              Your pixels are now live on milliondollarhomepage.in. Customize them below.
            </p>
          </div>
        )}

        {pixels.length === 0 ? (
          <div className="text-center py-20">
            <div className="text-6xl mb-4">🖼️</div>
            <h2 className="text-xl font-bold text-gray-700 mb-2">No pixels yet</h2>
            <p className="text-gray-500 mb-6">
              Buy your first pixels and own a piece of internet history!
            </p>
            <button
              onClick={() => router.push("/buy")}
              className="px-6 py-3 bg-indigo-600 text-white rounded-lg font-bold hover:bg-indigo-700 transition"
            >
              Buy Pixels — ₹1 each
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {pixels.map((pixel) => (
              <div
                key={pixel.id}
                className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden hover:shadow-md transition"
              >
                {/* Color/Image preview */}
                <div
                  className="h-24 w-full relative"
                  style={{ backgroundColor: pixel.color }}
                >
                  {pixel.image && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={pixel.image}
                      alt="Pixel image"
                      className="absolute inset-0 w-full h-full object-cover"
                    />
                  )}
                  <div className="absolute top-2 left-2 bg-black/50 text-white text-xs font-mono px-2 py-0.5 rounded">
                    ({pixel.x}, {pixel.y})
                  </div>
                </div>

                <div className="p-4">
                  {pixel.message && (
                    <p className="text-sm font-semibold text-gray-700 mb-1 truncate">
                      {pixel.message}
                    </p>
                  )}

                  {pixel.url ? (
                    <a
                      href={pixel.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1 text-xs text-indigo-600 hover:underline truncate mb-3"
                    >
                      <ExternalLink className="w-3 h-3 flex-shrink-0" />
                      {pixel.url}
                    </a>
                  ) : (
                    <p className="text-xs text-gray-400 mb-3">No URL set</p>
                  )}

                  <button
                    onClick={() => handleEdit(pixel)}
                    className="w-full flex items-center justify-center gap-2 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm font-semibold hover:bg-indigo-50 hover:text-indigo-700 transition"
                  >
                    <Pencil className="w-4 h-4" />
                    Edit Pixel
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <EditPixelModal />
      <ToastContainer />
    </main>
  );
}

export default function MyPixelsPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-pulse text-gray-400">Loading...</div>
      </div>
    }>
      <MyPixelsContent />
    </Suspense>
  );
}
