"use client";

import { useState } from "react";
import { ImageIcon, Barcode, X, ShoppingBag } from "lucide-react";
import type { Product } from "@/types/database";
import { useCart } from "@/components/CartContext";

function formatPrice(n: number) {
  return new Intl.NumberFormat("ru-KZ", {
    maximumFractionDigits: 0,
  }).format(n);
}

type ProductModalProps = {
  product: Product | null;
  onClose: () => void;
};

export default function ProductModal({ product, onClose }: ProductModalProps) {
  const [imageError, setImageError] = useState(false);
  const { addItem } = useCart();

  if (!product) return null;

  const { name, barcode, composition, calories, proteins, fats, carbs, weight_info, image_url, price } =
    product;
  const showImage = image_url && !imageError;

  return (
    <>
      {/* Оверлей */}
      <div
        className="fixed inset-0 bg-black/40 z-40 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden
      />

      {/* Модальное окно */}
      <div
        className="fixed inset-4 sm:inset-6 lg:inset-8 z-50 flex items-center justify-center p-2 sm:p-4"
        role="dialog"
        aria-modal="true"
        aria-labelledby="product-modal-title"
      >
        <div
          className="relative bg-white rounded-3xl shadow-xl max-h-[90vh] w-full max-w-4xl overflow-hidden flex flex-col"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Кнопка закрытия */}
          <button
            type="button"
            onClick={onClose}
            className="absolute top-4 right-4 z-10 p-2 rounded-2xl text-gray-500 hover:text-gray-700 hover:bg-gray-100 transition-colors"
            aria-label="Закрыть"
          >
            <X className="w-6 h-6" />
          </button>

          <div className="overflow-y-auto flex-1 p-6 sm:p-8 pt-12 sm:pt-14">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-10">
              {/* Левая колонка: фото + штрихкод */}
              <div className="flex flex-col gap-6">
                <div className="relative aspect-square max-w-md mx-auto w-full bg-gray-100 rounded-2xl flex items-center justify-center overflow-hidden">
                  {showImage ? (
                    <img
                      src={image_url}
                      alt=""
                      className="h-full w-full object-cover"
                      onError={() => setImageError(true)}
                    />
                  ) : (
                    <ImageIcon
                      className="w-20 h-20 text-gray-300 shrink-0"
                      aria-hidden
                    />
                  )}
                </div>
                {weight_info && (
                  <p className="text-sm text-gray-600 text-center">
                    {weight_info}
                  </p>
                )}
                <div className="flex flex-col items-center gap-2 p-4 bg-gray-50 rounded-2xl">
                  <Barcode className="w-10 h-10 text-gray-400" aria-hidden />
                  <span className="text-sm font-mono text-gray-600">
                    {barcode ?? "—"}
                  </span>
                </div>
              </div>

              {/* Правая колонка: название, состав, КБЖУ */}
              <div className="flex flex-col gap-6">
                <h2
                  id="product-modal-title"
                  className="text-2xl sm:text-3xl font-bold text-gray-900 pr-10"
                >
                  {name}
                </h2>

                <p className="text-2xl font-bold text-green-600">
                  {formatPrice(Number(price))} ₸
                </p>

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
                    <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-2">
                      Состав
                    </h3>
                    <p className="text-gray-700 leading-relaxed">
                      {composition}
                    </p>
                  </div>
                )}

                <div>
                  <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">
                    Пищевая ценность на 100 г
                  </h3>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <div className="p-4 rounded-2xl bg-amber-50 border border-amber-100">
                      <div className="text-2xl font-bold text-amber-700">
                        {calories}
                      </div>
                      <div className="text-xs font-medium text-amber-600">
                        ккал
                      </div>
                    </div>
                    <div className="p-4 rounded-2xl bg-blue-50 border border-blue-100">
                      <div className="text-2xl font-bold text-blue-700">
                        {proteins}
                      </div>
                      <div className="text-xs font-medium text-blue-600">
                        белки, г
                      </div>
                    </div>
                    <div className="p-4 rounded-2xl bg-orange-50 border border-orange-100">
                      <div className="text-2xl font-bold text-orange-700">
                        {fats}
                      </div>
                      <div className="text-xs font-medium text-orange-600">
                        жиры, г
                      </div>
                    </div>
                    <div className="p-4 rounded-2xl bg-green-50 border border-green-100">
                      <div className="text-2xl font-bold text-green-700">
                        {carbs}
                      </div>
                      <div className="text-xs font-medium text-green-600">
                        углеводы, г
                      </div>
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
