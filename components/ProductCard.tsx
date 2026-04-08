"use client";

import { useState } from "react";
import { ImageIcon } from "lucide-react";
import type { ProductWithCategory } from "@/types/database";

export type ProductCardProps = {
  product: ProductWithCategory;
  onClick?: () => void;
};

function ChevronLeft() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" className="h-3.5 w-3.5">
      <path d="M15 18l-6-6 6-6" />
    </svg>
  );
}
function ChevronRight() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" className="h-3.5 w-3.5">
      <path d="M9 18l6-6-6-6" />
    </svg>
  );
}

export default function ProductCard({ product, onClick }: ProductCardProps) {
  const { name, calories, proteins, fats, carbs, weight_info, image_url, images, is_hit, is_unique } = product;

  // Build full photo list
  const allPhotos: string[] = [];
  if (image_url) allPhotos.push(image_url);
  if (Array.isArray(images)) images.forEach((u) => { if (u) allPhotos.push(u); });

  const [photoIndex, setPhotoIndex] = useState(0);
  const hasMultiple = allPhotos.length > 1;
  const activePhoto = allPhotos[photoIndex] ?? null;

  function prevPhoto(e: React.MouseEvent) {
    e.stopPropagation();
    setPhotoIndex((i) => (i - 1 + allPhotos.length) % allPhotos.length);
  }
  function nextPhoto(e: React.MouseEvent) {
    e.stopPropagation();
    setPhotoIndex((i) => (i + 1) % allPhotos.length);
  }

  return (
    <article
      role={onClick ? "button" : undefined}
      tabIndex={onClick ? 0 : undefined}
      onClick={onClick}
      onKeyDown={
        onClick
          ? (e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                onClick();
              }
            }
          : undefined
      }
      className="group bg-white rounded-3xl shadow-sm hover:shadow-md transition-shadow duration-200 overflow-hidden border border-gray-100 cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-green-500 focus-visible:ring-offset-2"
    >
      <div className="relative aspect-[4/3] bg-gray-100 flex items-center justify-center overflow-hidden">

        {/* Blurred background */}
        {activePhoto && (
          <img
            src={activePhoto}
            alt=""
            aria-hidden
            className="absolute inset-0 h-full w-full object-cover scale-110 opacity-30"
            style={{ filter: "blur(16px)" }}
          />
        )}

        {/* Badges */}
        {is_hit && (
          <span className="absolute top-3 left-3 z-10 inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-bold text-gray-900 shadow-md" style={{ backgroundColor: "#FFFF00" }}>
            🔥 ХИТ
          </span>
        )}
        {is_unique && (
          <span className={`absolute top-3 z-10 inline-flex items-center gap-1 rounded-full bg-purple-600 px-3 py-1 text-xs font-bold text-white shadow-md ${is_hit ? "right-3" : "right-3"}`}>
            ⭐ Уникальный
          </span>
        )}

        {/* Main photo */}
        {activePhoto ? (
          <img
            key={activePhoto}
            src={activePhoto}
            alt=""
            className="relative z-10 h-[88%] w-[88%] object-contain drop-shadow-sm transition-opacity duration-200"
            loading="lazy"
          />
        ) : (
          <ImageIcon className="w-12 h-12 text-gray-300 group-hover:text-gray-400 transition-colors shrink-0" aria-hidden />
        )}

        {/* Prev / Next arrows — visible on hover when multiple photos */}
        {hasMultiple && (
          <>
            <button
              type="button"
              onClick={prevPhoto}
              aria-label="Предыдущее фото"
              className="absolute left-2 top-1/2 -translate-y-1/2 z-20 flex h-7 w-7 items-center justify-center rounded-full bg-white/80 shadow text-gray-700 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-white hover:scale-110"
            >
              <ChevronLeft />
            </button>
            <button
              type="button"
              onClick={nextPhoto}
              aria-label="Следующее фото"
              className="absolute right-2 top-1/2 -translate-y-1/2 z-20 flex h-7 w-7 items-center justify-center rounded-full bg-white/80 shadow text-gray-700 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-white hover:scale-110"
            >
              <ChevronRight />
            </button>

            {/* Dots */}
            <div className="absolute bottom-2 left-1/2 -translate-x-1/2 z-20 flex items-center gap-1">
              {allPhotos.map((_, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={(e) => { e.stopPropagation(); setPhotoIndex(i); }}
                  aria-label={`Фото ${i + 1}`}
                  className={`h-1.5 rounded-full transition-all duration-200 ${i === photoIndex ? "w-4 bg-green-500" : "w-1.5 bg-white/60 hover:bg-white"}`}
                />
              ))}
            </div>
          </>
        )}
      </div>

      <div className="p-4 sm:p-5">
        <h3 className="text-base font-bold text-gray-900 mb-1 line-clamp-2">{name}</h3>
        {weight_info && (
          <p className="text-sm text-gray-500 mb-3">{weight_info}</p>
        )}
        <div className="flex flex-wrap gap-2">
          <span className="inline-flex items-center px-2.5 py-1 rounded-xl text-xs font-medium bg-amber-50 text-amber-700" title="Калории">
            {calories} ккал
          </span>
          <span className="inline-flex items-center px-2.5 py-1 rounded-xl text-xs font-medium bg-blue-50 text-blue-700" title="Белки">
            Б {proteins} г
          </span>
          <span className="inline-flex items-center px-2.5 py-1 rounded-xl text-xs font-medium bg-orange-50 text-orange-700" title="Жиры">
            Ж {fats} г
          </span>
          <span className="inline-flex items-center px-2.5 py-1 rounded-xl text-xs font-medium bg-green-50 text-green-700" title="Углеводы">
            У {carbs} г
          </span>
        </div>
      </div>
    </article>
  );
}
