"use client";

import { useEffect, useRef, useState } from "react";
import { ImageIcon, Barcode, X, ShoppingBag, ChevronLeft, ChevronRight } from "lucide-react";
import type { Product } from "@/types/database";
import { useCart } from "@/components/CartContext";

function formatPrice(n: number) {
  return new Intl.NumberFormat("ru-KZ", { maximumFractionDigits: 0 }).format(n);
}

type ProductModalProps = {
  product: Product | null;
  onClose: () => void;
};

export default function ProductModal({ product, onClose }: ProductModalProps) {
  const { addItem } = useCart();
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const dialogRef = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const [imgError, setImgError] = useState(false);

  // Build full images list
  const allImages: string[] = [];
  if (product?.image_url) allImages.push(product.image_url);
  if (product?.images && Array.isArray(product.images)) {
    product.images.forEach((u) => { if (u) allImages.push(u); });
  }

  const hasMultiple = allImages.length > 1;
  const activeImage = allImages[activeIndex] ?? null;

  // Reset active index when product changes
  useEffect(() => {
    setActiveIndex(0);
    setImgError(false);
  }, [product?.id]);

  useEffect(() => {
    closeButtonRef.current?.focus();
    document.body.style.overflow = "hidden";

    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") { onClose(); return; }
      if (e.key === "ArrowLeft" && hasMultiple) setActiveIndex((i) => (i - 1 + allImages.length) % allImages.length);
      if (e.key === "ArrowRight" && hasMultiple) setActiveIndex((i) => (i + 1) % allImages.length);
      if (e.key === "Tab") {
        const focusable = dialogRef.current?.querySelectorAll<HTMLElement>(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        if (!focusable || focusable.length === 0) return;
        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
        else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
      }
    }

    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.body.style.overflow = "";
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [onClose, hasMultiple, allImages.length]);

  if (!product) return null;

  const { name, barcode, composition, calories, proteins, fats, carbs, weight_info, price } = product;

  return (
    <>
      {/* Overlay */}
      <div className="fixed inset-0 bg-black/40 z-40 backdrop-blur-sm" onClick={onClose} aria-hidden />

      {/* Dialog */}
      <div
        ref={dialogRef}
        className="fixed inset-4 sm:inset-6 lg:inset-8 z-50 flex items-center justify-center p-2 sm:p-4"
        role="dialog"
        aria-modal="true"
        aria-labelledby="product-modal-title"
      >
        <div
          className="relative bg-white rounded-3xl shadow-xl max-h-[90vh] w-full max-w-4xl overflow-hidden flex flex-col"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Close */}
          <button
            ref={closeButtonRef}
            type="button"
            onClick={onClose}
            className="absolute top-4 right-4 z-10 p-2 rounded-2xl text-gray-500 hover:text-gray-700 hover:bg-gray-100 transition-colors"
            aria-label="Закрыть"
          >
            <X className="w-6 h-6" />
          </button>

          <div className="overflow-y-auto flex-1 p-6 sm:p-8 pt-12 sm:pt-14">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-10">

              {/* Left column: photo gallery + barcode */}
              <div className="flex flex-col gap-4">
                {/* Main image */}
                <div className="relative aspect-square max-w-md mx-auto w-full bg-gray-100 rounded-2xl flex items-center justify-center overflow-hidden">
                  {activeImage && !imgError ? (
                    /* eslint-disable-next-line @next/next/no-img-element */
                    <img
                      key={activeImage}
                      src={activeImage}
                      alt=""
                      className="h-full w-full object-cover"
                      onError={() => setImgError(true)}
                    />
                  ) : (
                    <ImageIcon className="w-20 h-20 text-gray-300 shrink-0" aria-hidden />
                  )}

                  {/* Prev/Next arrows */}
                  {hasMultiple && (
                    <>
                      <button
                        type="button"
                        onClick={() => { setImgError(false); setActiveIndex((i) => (i - 1 + allImages.length) % allImages.length); }}
                        aria-label="Предыдущее фото"
                        className="absolute left-2 top-1/2 -translate-y-1/2 flex h-9 w-9 items-center justify-center rounded-full bg-white/90 shadow-md text-gray-700 hover:bg-white transition"
                      >
                        <ChevronLeft className="h-5 w-5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => { setImgError(false); setActiveIndex((i) => (i + 1) % allImages.length); }}
                        aria-label="Следующее фото"
                        className="absolute right-2 top-1/2 -translate-y-1/2 flex h-9 w-9 items-center justify-center rounded-full bg-white/90 shadow-md text-gray-700 hover:bg-white transition"
                      >
                        <ChevronRight className="h-5 w-5" />
                      </button>

                      {/* Counter */}
                      <span className="absolute bottom-2 right-3 rounded-full bg-black/50 px-2 py-0.5 text-xs text-white font-medium">
                        {activeIndex + 1} / {allImages.length}
                      </span>
                    </>
                  )}
                </div>

                {/* Thumbnails strip */}
                {hasMultiple && (
                  <div className="flex gap-2 overflow-x-auto pb-1">
                    {allImages.map((url, i) => (
                      <button
                        key={url + i}
                        type="button"
                        onClick={() => { setImgError(false); setActiveIndex(i); }}
                        aria-label={`Фото ${i + 1}`}
                        className={`shrink-0 h-14 w-14 rounded-xl overflow-hidden border-2 transition-all ${
                          i === activeIndex ? "border-green-500 shadow-md" : "border-gray-200 opacity-60 hover:opacity-100"
                        }`}
                      >
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={url} alt="" className="h-full w-full object-cover" />
                      </button>
                    ))}
                  </div>
                )}

                {weight_info && (
                  <p className="text-sm text-gray-600 text-center">{weight_info}</p>
                )}

                <div className="flex flex-col items-center gap-2 p-4 bg-gray-50 rounded-2xl">
                  <Barcode className="w-10 h-10 text-gray-400" aria-hidden />
                  <span className="text-sm font-mono text-gray-600">{barcode ?? "—"}</span>
                </div>
              </div>

              {/* Right column */}
              <div className="flex flex-col gap-6">
                <h2 id="product-modal-title" className="text-2xl sm:text-3xl font-bold text-gray-900 pr-10">
                  {name}
                </h2>

                <button
                  type="button"
                  onClick={() => addItem(product)}
                  className="inline-flex w-full sm:w-auto items-center justify-center gap-2 rounded-2xl bg-green-500 px-6 py-3 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-green-600"
                >
                  <ShoppingBag className="h-5 w-5" aria-hidden />
                  В корзину
                </button>

                {composition && (
                  <div>
                    <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-2">Состав</h3>
                    <p className="text-gray-700 leading-relaxed">{composition}</p>
                  </div>
                )}

                <div>
                  <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">
                    Пищевая ценность на 100 г
                  </h3>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <div className="p-4 rounded-2xl bg-amber-50 border border-amber-100">
                      <div className="text-2xl font-bold text-amber-700">{calories}</div>
                      <div className="text-xs font-medium text-amber-600">ккал</div>
                    </div>
                    <div className="p-4 rounded-2xl bg-blue-50 border border-blue-100">
                      <div className="text-2xl font-bold text-blue-700">{proteins}</div>
                      <div className="text-xs font-medium text-blue-600">белки, г</div>
                    </div>
                    <div className="p-4 rounded-2xl bg-orange-50 border border-orange-100">
                      <div className="text-2xl font-bold text-orange-700">{fats}</div>
                      <div className="text-xs font-medium text-orange-600">жиры, г</div>
                    </div>
                    <div className="p-4 rounded-2xl bg-green-50 border border-green-100">
                      <div className="text-2xl font-bold text-green-700">{carbs}</div>
                      <div className="text-xs font-medium text-green-600">углеводы, г</div>
                    </div>
                  </div>
                </div>
              </div>

            </div>
          </div>
        </div>
      </div>
    </>
  );
}
