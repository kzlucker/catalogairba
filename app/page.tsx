"use client";

import { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Header from "@/components/Header";
import HeroSlider from "@/components/HeroSlider";
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
  const [loadError, setLoadError] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [selectedCategoryIds, setSelectedCategoryIds] = useState<string[]>([]);
  const [filterHit, setFilterHit] = useState(false);
  const [filterUnique, setFilterUnique] = useState(false);
  const searchQuery = useSearchStore((s) => s.searchQuery);
  const setSearchQuery = useSearchStore((s) => s.setSearchQuery);

  const hasActiveFilters = selectedCategoryIds.length > 0 || filterHit || filterUnique;

  function toggleCategory(id: string) {
    setSelectedCategoryIds((prev) =>
      prev.includes(id) ? prev.filter((c) => c !== id) : [...prev, id]
    );
  }

  function resetFilters() {
    setSelectedCategoryIds([]);
    setFilterHit(false);
    setFilterUnique(false);
  }

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
        setLoadError(true);
        setProducts([]);
        setCategories([]);
      } finally {
        setLoading(false);
      }
    }
    loadCatalog();
  }, []);

  const filteredProducts = useMemo(() => {
    let result = products;
    if (selectedCategoryIds.length > 0) {
      result = result.filter((p) => p.category_id !== null && selectedCategoryIds.includes(p.category_id));
    }
    if (filterHit) result = result.filter((p) => p.is_hit);
    if (filterUnique) result = result.filter((p) => p.is_unique);
    const q = searchQuery.trim().toLowerCase();
    if (q) result = result.filter((p) => p.name.toLowerCase().includes(q));
    return result;
  }, [products, selectedCategoryIds, filterHit, filterUnique, searchQuery]);

  const pillBase =
    "inline-flex shrink-0 items-center gap-1.5 rounded-2xl px-4 py-2 text-sm font-medium transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-green-500 focus-visible:ring-offset-2";
  const pillInactive = "bg-gray-100 text-gray-700 hover:bg-gray-200";
  const pillActive = "bg-green-500 text-white shadow-sm hover:bg-green-600";

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <HeroSlider />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10">
        <div className="flex items-center gap-3 mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
            Каталог продукции
          </h1>
          <img src="/halal.png" alt="Халал" title="Халал сертифицировано" className="shrink-0 w-16 h-16 sm:w-20 sm:h-20 object-contain" />
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
            {Array.from({ length: 8 }, (_, i) => (
              <ProductSkeleton key={i} />
            ))}
          </div>
        ) : (
          <>
            {/* Фильтры */}
            <div className="mb-6 sm:mb-8 -mx-4 px-4 sm:mx-0 sm:px-0 space-y-3">
              {/* Строка 1: категории */}
              <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide flex-nowrap">
                {categories.map((cat) => {
                  const active = selectedCategoryIds.includes(cat.id);
                  return (
                    <button
                      key={cat.id}
                      type="button"
                      aria-pressed={active}
                      onClick={() => toggleCategory(cat.id)}
                      className={`${pillBase} ${active ? pillActive : pillInactive}`}
                    >
                      {active && (
                        <svg viewBox="0 0 12 12" fill="currentColor" className="w-3 h-3 shrink-0">
                          <path d="M10 3L5 8.5 2 5.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
                        </svg>
                      )}
                      {cat.name}
                    </button>
                  );
                })}
              </div>

              {/* Строка 2: специальные фильтры + сброс */}
              <div className="flex gap-2 flex-wrap items-center">
                <button
                  type="button"
                  aria-pressed={filterHit}
                  onClick={() => setFilterHit((v) => !v)}
                  className={`${pillBase} ${filterHit ? "bg-yellow-400 text-gray-900 shadow-sm hover:bg-yellow-500" : pillInactive}`}
                >
                  🔥 Хит
                </button>
                <button
                  type="button"
                  aria-pressed={filterUnique}
                  onClick={() => setFilterUnique((v) => !v)}
                  className={`${pillBase} ${filterUnique ? "bg-purple-600 text-white shadow-sm hover:bg-purple-700" : pillInactive}`}
                >
                  ⭐ Уникальный
                </button>

                {hasActiveFilters && (
                  <button
                    type="button"
                    onClick={resetFilters}
                    className="inline-flex shrink-0 items-center gap-1 rounded-2xl px-3 py-2 text-sm font-medium text-gray-500 hover:text-gray-700 hover:bg-gray-100 transition-colors"
                  >
                    <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" className="w-3.5 h-3.5">
                      <path d="M12 4L4 12M4 4l8 8"/>
                    </svg>
                    Сбросить
                  </button>
                )}
              </div>
            </div>

            {loadError ? (
              <div className="rounded-3xl border border-red-100 bg-red-50 p-8 text-center">
                <p className="text-red-700 font-medium mb-4">Не удалось загрузить каталог. Проверьте подключение и попробуйте снова.</p>
                <button
                  type="button"
                  onClick={() => window.location.reload()}
                  className="inline-flex items-center justify-center rounded-2xl bg-red-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-red-700"
                >
                  Обновить страницу
                </button>
              </div>
            ) : products.length === 0 ? (
              <p className="text-gray-500">В каталоге пока нет товаров.</p>
            ) : filteredProducts.length === 0 ? (
              <div className="rounded-3xl border border-gray-200 bg-white p-8 text-center shadow-sm">
                <p className="text-gray-600 mb-4">Ничего не найдено по выбранным фильтрам.</p>
                <button
                  type="button"
                  onClick={() => { resetFilters(); setSearchQuery(""); }}
                  className="inline-flex items-center justify-center rounded-2xl bg-green-500 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-green-600"
                >
                  Сбросить все фильтры
                </button>
              </div>
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
