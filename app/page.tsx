"use client";

import { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Header from "@/components/Header";
import ProductCard from "@/components/ProductCard";
import ProductModal from "@/components/ProductModal";
import ProductSkeleton from "@/components/ProductSkeleton";
import { getSupabaseBrowser } from "@/lib/supabase";
import { useSearchStore } from "@/store/useSearchStore";
import type { Product, ProductWithCategory, Category } from "@/types/database";

export default function Home() {
  const [products, setProducts] = useState<ProductWithCategory[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  /** null = «Все» */
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(
    null
  );
  const searchQuery = useSearchStore((s) => s.searchQuery);
  const setSearchQuery = useSearchStore((s) => s.setSearchQuery);

  useEffect(() => {
    async function loadCatalog() {
      try {
        const supabase = getSupabaseBrowser();
        const [productsRes, categoriesRes] = await Promise.all([
          supabase
            .from("products")
            .select("*, categories(name)")
            .eq("is_active", true),
          supabase.from("categories").select("*").order("name", { ascending: true }),
        ]);

        if (productsRes.error) throw productsRes.error;
        if (categoriesRes.error) throw categoriesRes.error;

        setProducts((productsRes.data as ProductWithCategory[]) ?? []);
        setCategories((categoriesRes.data as Category[]) ?? []);
      } catch (err) {
        if (process.env.NODE_ENV === "development") {
          console.error("[catalog] Ошибка загрузки каталога:", err);
        }
        setProducts([]);
        setCategories([]);
      } finally {
        setLoading(false);
      }
    }
    loadCatalog();
  }, []);

  const filteredByCategory = useMemo(() => {
    if (selectedCategoryId === null) return products;
    return products.filter((p) => p.category_id === selectedCategoryId);
  }, [products, selectedCategoryId]);

  const filteredProducts = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return filteredByCategory;
    return filteredByCategory.filter((p) =>
      p.name.toLowerCase().includes(q)
    );
  }, [filteredByCategory, searchQuery]);

  const pillBase =
    "inline-flex shrink-0 items-center rounded-2xl px-4 py-2 text-sm font-medium transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-green-500 focus-visible:ring-offset-2";
  const pillInactive = "bg-gray-100 text-gray-700 hover:bg-gray-200";
  const pillActive = "bg-green-500 text-white shadow-sm hover:bg-green-600";

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-6 sm:mb-8">
          Каталог продукции
        </h1>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
            {Array.from({ length: 8 }, (_, i) => (
              <ProductSkeleton key={i} />
            ))}
          </div>
        ) : (
          <>
            {/* Фильтр по категориям: горизонтальный скролл на мобильных */}
            <div className="mb-6 sm:mb-8 -mx-4 px-4 sm:mx-0 sm:px-0">
              <div
                className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide flex-nowrap"
                role="tablist"
                aria-label="Категории"
              >
                <button
                  type="button"
                  role="tab"
                  aria-selected={selectedCategoryId === null}
                  onClick={() => setSelectedCategoryId(null)}
                  className={`${pillBase} ${
                    selectedCategoryId === null ? pillActive : pillInactive
                  }`}
                >
                  Все
                </button>
                {categories.map((cat) => {
                  const active = selectedCategoryId === cat.id;
                  return (
                    <button
                      key={cat.id}
                      type="button"
                      role="tab"
                      aria-selected={active}
                      onClick={() => setSelectedCategoryId(cat.id)}
                      className={`${pillBase} ${
                        active ? pillActive : pillInactive
                      }`}
                    >
                      {cat.name}
                    </button>
                  );
                })}
              </div>
            </div>

            {products.length === 0 ? (
              <p className="text-gray-500">В каталоге пока нет товаров.</p>
            ) : filteredProducts.length === 0 && searchQuery.trim() ? (
              <div className="rounded-3xl border border-gray-200 bg-white p-8 text-center shadow-sm">
                <p className="text-gray-600">
                  Ничего не нашлось по запросу{" "}
                  <span className="font-semibold text-gray-900">
                    «{searchQuery.trim()}»
                  </span>
                </p>
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  className="mt-4 inline-flex items-center justify-center rounded-2xl bg-green-500 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-green-600"
                >
                  Сбросить поиск
                </button>
              </div>
            ) : filteredByCategory.length === 0 ? (
              <p className="text-gray-500">
                В этой категории пока нет товаров.
              </p>
            ) : (
              <motion.div
                layout
                className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6"
              >
                <AnimatePresence mode="popLayout">
                  {filteredProducts.map((product, index) => (
                    <motion.div
                      key={product.id}
                      layout
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.96 }}
                      transition={{
                        duration: 0.25,
                        delay: Math.min(index * 0.03, 0.3),
                        ease: [0.25, 0.46, 0.45, 0.94],
                      }}
                      whileHover={{ scale: 1.02 }}
                      className="origin-center"
                    >
                      <ProductCard
                        product={product}
                        onClick={() => setSelectedProduct(product)}
                      />
                    </motion.div>
                  ))}
                </AnimatePresence>
              </motion.div>
            )}
          </>
        )}
      </main>

      {selectedProduct && (
        <ProductModal
          product={selectedProduct}
          onClose={() => setSelectedProduct(null)}
        />
      )}
    </div>
  );
}
