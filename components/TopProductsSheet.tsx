"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { getSupabaseBrowser } from "@/lib/supabase";
import type { Product, ProductWithCategory } from "@/types/database";
import ProductModal from "./ProductModal";
import { ImageIcon } from "lucide-react";

interface Props {
  open: boolean;
  onClose: () => void;
}

const MEDAL: Record<number, { emoji: string; bg: string; text: string; border: string }> = {
  1: { emoji: "🥇", bg: "bg-yellow-50", text: "text-yellow-700", border: "border-yellow-300" },
  2: { emoji: "🥈", bg: "bg-gray-50",   text: "text-gray-600",   border: "border-gray-300"   },
  3: { emoji: "🥉", bg: "bg-amber-50",  text: "text-amber-700",  border: "border-amber-300"  },
};

function PodiumCard({
  product,
  rank,
  onClick,
  height,
}: {
  product: ProductWithCategory;
  rank: 1 | 2 | 3;
  onClick: () => void;
  height: string;
}) {
  const m = MEDAL[rank];
  const photo = product.image_url ?? (product.images?.[0] ?? null);

  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex flex-col items-center gap-1 flex-1 min-w-0 focus:outline-none group`}
    >
      {/* Photo bubble */}
      <div className="relative w-16 h-16 sm:w-20 sm:h-20 rounded-full overflow-hidden border-2 border-white shadow-md bg-gray-100 shrink-0 group-hover:scale-105 transition-transform">
        {photo ? (
          <img src={photo} alt={product.name} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <ImageIcon className="w-7 h-7 text-gray-300" />
          </div>
        )}
        <span className="absolute -bottom-0.5 left-1/2 -translate-x-1/2 text-lg leading-none">{m.emoji}</span>
      </div>

      {/* Name */}
      <p className="text-[11px] sm:text-xs font-semibold text-gray-800 text-center line-clamp-2 w-full px-1 mt-1">
        {product.name}
      </p>

      {/* Podium block */}
      <div
        className={`w-full rounded-t-xl ${height} flex items-center justify-center ${m.bg} border border-b-0 ${m.border} mt-1`}
      >
        <span className={`text-lg font-black ${m.text}`}>{rank}</span>
      </div>
    </button>
  );
}

function ListRow({
  product,
  rank,
  onClick,
}: {
  product: ProductWithCategory;
  rank: number;
  onClick: () => void;
}) {
  const photo = product.image_url ?? (product.images?.[0] ?? null);

  return (
    <motion.button
      type="button"
      onClick={onClick}
      initial={{ opacity: 0, x: -12 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.22, delay: (rank - 4) * 0.04 }}
      className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 active:bg-gray-100 transition-colors rounded-2xl text-left focus:outline-none"
    >
      {/* Rank number */}
      <span className="w-7 shrink-0 text-center text-sm font-bold text-gray-400">{rank}</span>

      {/* Photo */}
      <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-xl overflow-hidden bg-gray-100 shrink-0">
        {photo ? (
          <img src={photo} alt={product.name} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <ImageIcon className="w-5 h-5 text-gray-300" />
          </div>
        )}
      </div>

      {/* Name + category */}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-gray-900 line-clamp-1">{product.name}</p>
        {product.categories?.name && (
          <p className="text-xs text-gray-400 mt-0.5">{product.categories.name}</p>
        )}
      </div>

      {/* Arrow */}
      <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4 text-gray-300 shrink-0">
        <path d="M6 4l4 4-4 4" />
      </svg>
    </motion.button>
  );
}

export default function TopProductsSheet({ open, onClose }: Props) {
  const [products, setProducts] = useState<ProductWithCategory[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  useEffect(() => {
    if (!open) return;
    setLoading(true);

    async function load() {
      try {
        const supabase = getSupabaseBrowser();

        // Fetch from curated top_products table first
        const { data: topData } = await supabase
          .from("top_products")
          .select("rank, products(*, categories(name))")
          .order("rank", { ascending: true })
          .limit(10);

        const curated: ProductWithCategory[] = ((topData ?? []) as any[])
          .map((row) => row.products as ProductWithCategory)
          .filter(Boolean);

        if (curated.length > 0) {
          setProducts(curated);
          return;
        }

        // Fallback: is_hit products, then recent
        const { data: hits } = await supabase
          .from("products")
          .select("*, categories(name)")
          .eq("is_active", true)
          .eq("is_hit", true)
          .limit(10);

        let result: ProductWithCategory[] = (hits as ProductWithCategory[]) ?? [];

        if (result.length < 10) {
          const { data: rest } = await supabase
            .from("products")
            .select("*, categories(name)")
            .eq("is_active", true)
            .eq("is_hit", false)
            .order("created_at", { ascending: false })
            .limit(10 - result.length);

          result = [...result, ...((rest as ProductWithCategory[]) ?? [])];
        }

        setProducts(result);
      } finally {
        setLoading(false);
      }
    }

    load();
  }, [open]);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  const top3 = products.slice(0, 3);
  const rest = products.slice(3);

  return (
    <>
      <AnimatePresence>
        {open && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm"
              onClick={onClose}
            />

            {/* Sheet */}
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 32, stiffness: 320 }}
              className="fixed bottom-0 left-0 right-0 z-50 flex flex-col bg-white rounded-t-3xl shadow-2xl"
              style={{ maxHeight: "88vh" }}
            >
              {/* Handle */}
              <div className="flex justify-center pt-3 pb-1 shrink-0">
                <div className="w-10 h-1.5 rounded-full bg-gray-200" />
              </div>

              {/* Header */}
              <div className="flex items-center justify-between px-5 py-3 shrink-0">
                <div className="flex items-center gap-2">
                  <span className="text-2xl">🏆</span>
                  <div>
                    <h2 className="text-xl font-bold text-gray-900 leading-tight">Топ 10 за месяц</h2>
                    <p className="text-xs text-gray-400">Самые популярные позиции</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={onClose}
                  className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-colors shrink-0"
                  aria-label="Закрыть"
                >
                  <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="w-4 h-4">
                    <path d="M12 4L4 12M4 4l8 8" />
                  </svg>
                </button>
              </div>

              {/* Scrollable content */}
              <div className="overflow-y-auto flex-1" style={{ paddingBottom: "calc(2rem + env(safe-area-inset-bottom, 0px))" }}>
                {loading ? (
                  <div className="px-5 space-y-3 mt-2">
                    {Array.from({ length: 7 }, (_, i) => (
                      <div key={i} className="h-14 rounded-2xl bg-gray-100 animate-pulse" />
                    ))}
                  </div>
                ) : products.length === 0 ? (
                  <p className="text-center text-gray-400 py-16">Нет данных</p>
                ) : (
                  <>
                    {/* ── Podium (top 3) ── */}
                    {top3.length > 0 && (
                      <div className="px-5 pt-2 pb-4">
                        <div className="flex items-end justify-center gap-2">
                          {/* 2nd */}
                          {top3[1] && (
                            <PodiumCard
                              product={top3[1]}
                              rank={2}
                              onClick={() => setSelectedProduct(top3[1])}
                              height="h-16"
                            />
                          )}
                          {/* 1st — tallest */}
                          {top3[0] && (
                            <PodiumCard
                              product={top3[0]}
                              rank={1}
                              onClick={() => setSelectedProduct(top3[0])}
                              height="h-24"
                            />
                          )}
                          {/* 3rd */}
                          {top3[2] && (
                            <PodiumCard
                              product={top3[2]}
                              rank={3}
                              onClick={() => setSelectedProduct(top3[2])}
                              height="h-12"
                            />
                          )}
                        </div>
                      </div>
                    )}

                    {/* Divider */}
                    {rest.length > 0 && (
                      <div className="mx-5 border-t border-gray-100 mb-1" />
                    )}

                    {/* ── List (4-10) ── */}
                    <div className="px-1">
                      {rest.map((product, i) => (
                        <ListRow
                          key={product.id}
                          product={product}
                          rank={i + 4}
                          onClick={() => setSelectedProduct(product)}
                        />
                      ))}
                    </div>
                  </>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {selectedProduct && (
        <ProductModal
          product={selectedProduct}
          onClose={() => setSelectedProduct(null)}
        />
      )}
    </>
  );
}
