"use client";

import { useState } from "react";
import { ImageIcon } from "lucide-react";
import type { ProductWithCategory } from "@/types/database";

export type ProductCardProps = {
  product: ProductWithCategory;
  onClick?: () => void;
};

export default function ProductCard({ product, onClick }: ProductCardProps) {
  const { name, calories, proteins, fats, carbs, weight_info, image_url } =
    product;
  const [imageError, setImageError] = useState(false);

  const showImage = image_url && !imageError;

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
        {showImage ? (
          <img
            src={image_url}
            alt=""
            className="h-full w-full object-cover"
            onError={() => setImageError(true)}
          />
        ) : (
          <ImageIcon
            className="w-12 h-12 text-gray-300 group-hover:text-gray-400 transition-colors shrink-0"
            aria-hidden
          />
        )}
      </div>

      <div className="p-4 sm:p-5">
        <h2 className="text-lg font-bold text-gray-900 mb-2 line-clamp-2">
          {name}
        </h2>
        {weight_info && (
          <p className="text-sm text-gray-500 mb-3">{weight_info}</p>
        )}

        <div className="flex flex-wrap gap-2">
          <span
            className="inline-flex items-center px-2.5 py-1 rounded-xl text-xs font-medium bg-amber-50 text-amber-700"
            title="Калории"
          >
            {calories} ккал
          </span>
          <span
            className="inline-flex items-center px-2.5 py-1 rounded-xl text-xs font-medium bg-blue-50 text-blue-700"
            title="Белки"
          >
            Б {proteins} г
          </span>
          <span
            className="inline-flex items-center px-2.5 py-1 rounded-xl text-xs font-medium bg-orange-50 text-orange-700"
            title="Жиры"
          >
            Ж {fats} г
          </span>
          <span
            className="inline-flex items-center px-2.5 py-1 rounded-xl text-xs font-medium bg-green-50 text-green-700"
            title="Углеводы"
          >
            У {carbs} г
          </span>
        </div>
      </div>
    </article>
  );
}
