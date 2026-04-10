"use client";

import { AnimatePresence, motion } from "framer-motion";
import { X, Trash2 } from "lucide-react";
import { useCart } from "@/components/CartContext";

function formatPrice(n: number) {
  return new Intl.NumberFormat("ru-KZ", {
    maximumFractionDigits: 0,
  }).format(n);
}

export default function CartDrawer() {
  const {
    items,
    isOpen,
    closeCart,
    removeLine,
    setQuantity,
    subtotal,
  } = useCart();

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            key="cart-backdrop"
            className="fixed inset-0 z-[90] bg-black/40 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={closeCart}
            aria-hidden
          />
          <motion.aside
            key="cart-panel"
            role="dialog"
            aria-modal="true"
            aria-label="Корзина"
            className="fixed top-0 right-0 z-[100] flex h-full w-full max-w-md flex-col bg-white shadow-2xl"
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 30, stiffness: 320 }}
          >
            <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4">
              <h2 className="text-lg font-bold text-gray-900">Корзина</h2>
              <button
                type="button"
                onClick={closeCart}
                className="flex h-11 w-11 items-center justify-center rounded-2xl text-gray-500 hover:bg-gray-100 hover:text-gray-800"
                aria-label="Закрыть корзину"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto px-5 py-4">
              {items.length === 0 ? (
                <p className="text-center text-gray-500">Корзина пуста</p>
              ) : (
                <ul className="space-y-4">
                  {items.map(({ product, quantity }) => (
                    <li
                      key={product.id}
                      className="flex gap-3 rounded-2xl border border-gray-100 p-3"
                    >
                      <div className="h-16 w-16 shrink-0 overflow-hidden rounded-xl bg-gray-100">
                        {product.image_url ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={product.image_url}
                            alt=""
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center text-xs text-gray-400">
                            фото
                          </div>
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="font-medium text-gray-900 line-clamp-2">
                          {product.name}
                        </p>
                        <div className="mt-2 flex items-center gap-1">
                          <button
                            type="button"
                            className="flex h-11 w-11 items-center justify-center rounded-xl border border-gray-200 text-lg hover:bg-gray-50 active:bg-gray-100"
                            onClick={() =>
                              setQuantity(product.id, quantity - 1)
                            }
                            aria-label="Меньше"
                          >
                            −
                          </button>
                          <span className="w-8 text-center text-sm font-medium">
                            {quantity}
                          </span>
                          <button
                            type="button"
                            className="flex h-11 w-11 items-center justify-center rounded-xl border border-gray-200 text-lg hover:bg-gray-50 active:bg-gray-100"
                            onClick={() =>
                              setQuantity(product.id, quantity + 1)
                            }
                            aria-label="Больше"
                          >
                            +
                          </button>
                          <button
                            type="button"
                            onClick={() => removeLine(product.id)}
                            className="ml-auto flex h-11 w-11 items-center justify-center rounded-xl text-gray-400 hover:bg-red-50 hover:text-red-600 active:bg-red-100"
                            aria-label="Удалить"
                          >
                            <Trash2 className="h-5 w-5" />
                          </button>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {items.length > 0 && (
              <div className="border-t border-gray-100 px-5 py-4">
                <div className="flex items-center justify-between text-base font-bold text-gray-900">
                  <span>Итого</span>
                </div>
                <p className="mt-2 text-xs text-gray-500">
                  Оформление заказа — в разработке
                </p>
              </div>
            )}
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}
