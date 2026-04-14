"use client";

import { useEffect, useMemo, useState } from "react";
import {
  ChevronUp,
  ChevronDown,
  X,
  Plus,
  Search,
  Loader2,
  ImageIcon,
  CheckCircle2,
} from "lucide-react";
import { getSupabaseBrowser } from "@/lib/supabase";
import type { ProductWithCategory } from "@/types/database";

interface TopEntry {
  rank: number;
  product: ProductWithCategory;
}

export default function AdminTopProductsPage() {
  const [topList, setTopList] = useState<TopEntry[]>([]);
  const [allProducts, setAllProducts] = useState<ProductWithCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [savedOk, setSavedOk] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");

  useEffect(() => {
    async function load() {
      const supabase = getSupabaseBrowser();
      const [topRes, prodRes] = await Promise.all([
        supabase
          .from("top_products")
          .select("rank, products(*, categories(name))")
          .order("rank", { ascending: true }),
        supabase
          .from("products")
          .select("*, categories(name)")
          .eq("is_active", true)
          .order("name", { ascending: true }),
      ]);

      const top: TopEntry[] = ((topRes.data ?? []) as any[]).map((row) => ({
        rank: row.rank,
        product: row.products as ProductWithCategory,
      }));

      setTopList(top);
      setAllProducts((prodRes.data as ProductWithCategory[]) ?? []);
      setLoading(false);
    }
    load();
  }, []);

  const topIds = useMemo(() => new Set(topList.map((t) => t.product?.id)), [topList]);

  const availableProducts = useMemo(() => {
    const q = search.toLowerCase().trim();
    return allProducts.filter(
      (p) => !topIds.has(p.id) && (!q || p.name.toLowerCase().includes(q))
    );
  }, [allProducts, topIds, search]);

  function addToTop(product: ProductWithCategory) {
    if (topList.length >= 10) return;
    setTopList((prev) => [...prev, { rank: prev.length + 1, product }]);
  }

  function removeFromTop(productId: string) {
    setTopList((prev) =>
      prev
        .filter((t) => t.product.id !== productId)
        .map((t, i) => ({ ...t, rank: i + 1 }))
    );
  }

  function moveUp(index: number) {
    if (index === 0) return;
    setTopList((prev) => {
      const next = [...prev];
      [next[index - 1], next[index]] = [next[index], next[index - 1]];
      return next.map((t, i) => ({ ...t, rank: i + 1 }));
    });
  }

  function moveDown(index: number) {
    setTopList((prev) => {
      if (index >= prev.length - 1) return prev;
      const next = [...prev];
      [next[index], next[index + 1]] = [next[index + 1], next[index]];
      return next.map((t, i) => ({ ...t, rank: i + 1 }));
    });
  }

  async function handleSave() {
    setSaving(true);
    setError(null);
    try {
      const supabase = getSupabaseBrowser();

      const { error: delErr } = await supabase
        .from("top_products")
        .delete()
        .gte("rank", 1);
      if (delErr) throw delErr;

      if (topList.length > 0) {
        const rows = topList.map((t) => ({
          rank: t.rank,
          product_id: t.product.id,
        }));
        const { error: insErr } = await supabase.from("top_products").insert(rows);
        if (insErr) throw insErr;
      }

      setSavedOk(true);
      setTimeout(() => setSavedOk(false), 2500);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Ошибка сохранения");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="p-8 flex items-center gap-3 text-gray-500">
        <Loader2 className="h-5 w-5 animate-spin" />
        Загрузка...
      </div>
    );
  }

  return (
    <div className="p-6 sm:p-8">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 sm:text-3xl">
            🏆 Топ 10 за месяц
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Выберите и упорядочьте до 10 товаров. Они отобразятся на главной странице.
          </p>
        </div>
        <button
          type="button"
          onClick={handleSave}
          disabled={saving}
          className="inline-flex items-center gap-2 rounded-2xl bg-green-500 px-6 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-green-600 disabled:opacity-60 transition-colors self-start"
        >
          {saving ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : savedOk ? (
            <CheckCircle2 className="h-4 w-4" />
          ) : null}
          {savedOk ? "Сохранено!" : saving ? "Сохраняю…" : "Сохранить"}
        </button>
      </div>

      {error && (
        <div className="mb-6 rounded-2xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <div className="grid gap-8 lg:grid-cols-2">
        {/* ── Left: current top 10 ── */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <span className="text-sm font-semibold text-gray-700">Текущий топ</span>
            <span className="inline-flex items-center rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-500">
              {topList.length} / 10
            </span>
          </div>

          {topList.length === 0 ? (
            <div className="rounded-2xl border-2 border-dashed border-gray-200 p-12 text-center text-sm text-gray-400">
              Добавьте товары из списка справа →
            </div>
          ) : (
            <ul className="space-y-2">
              {topList.map((entry, index) => {
                const photo =
                  entry.product.image_url ?? (entry.product.images?.[0] ?? null);
                return (
                  <li
                    key={entry.product.id}
                    className="flex items-center gap-3 rounded-2xl border border-gray-200 bg-white px-4 py-3 shadow-sm"
                  >
                    {/* Rank badge */}
                    <span
                      className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${
                        index === 0
                          ? "bg-yellow-400 text-gray-900"
                          : index === 1
                          ? "bg-gray-300 text-gray-700"
                          : index === 2
                          ? "bg-amber-600 text-white"
                          : "bg-gray-100 text-gray-600"
                      }`}
                    >
                      {entry.rank}
                    </span>

                    {/* Photo */}
                    <div className="w-10 h-10 rounded-xl overflow-hidden bg-gray-100 shrink-0">
                      {photo ? (
                        <img
                          src={photo}
                          alt=""
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <ImageIcon className="w-4 h-4 text-gray-300" />
                        </div>
                      )}
                    </div>

                    {/* Name + category */}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-gray-900 line-clamp-1">
                        {entry.product.name}
                      </p>
                      {entry.product.categories?.name && (
                        <p className="text-xs text-gray-400">
                          {entry.product.categories.name}
                        </p>
                      )}
                    </div>

                    {/* Controls */}
                    <div className="flex items-center gap-0.5 shrink-0">
                      <button
                        type="button"
                        onClick={() => moveUp(index)}
                        disabled={index === 0}
                        aria-label="Вверх"
                        className="p-1.5 rounded-lg text-gray-400 hover:bg-gray-100 hover:text-gray-700 disabled:opacity-20 transition"
                      >
                        <ChevronUp className="h-4 w-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => moveDown(index)}
                        disabled={index === topList.length - 1}
                        aria-label="Вниз"
                        className="p-1.5 rounded-lg text-gray-400 hover:bg-gray-100 hover:text-gray-700 disabled:opacity-20 transition"
                      >
                        <ChevronDown className="h-4 w-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => removeFromTop(entry.product.id)}
                        aria-label="Удалить из топа"
                        className="p-1.5 rounded-lg text-gray-400 hover:bg-red-50 hover:text-red-500 transition"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        {/* ── Right: all products ── */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <span className="text-sm font-semibold text-gray-700">Все товары</span>
            <span className="text-xs text-gray-400">нажмите + для добавления</span>
          </div>

          {/* Search */}
          <div className="relative mb-3">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
            <input
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Поиск товара…"
              className="w-full rounded-2xl border border-gray-200 bg-white pl-10 pr-4 py-2.5 text-sm outline-none focus:border-green-500 focus:ring-2 focus:ring-green-500/20 transition"
            />
          </div>

          {/* Product list */}
          <ul className="space-y-1.5 max-h-[540px] overflow-y-auto pr-1">
            {availableProducts.length === 0 ? (
              <li className="text-sm text-gray-400 text-center py-10">
                {search ? "Ничего не найдено" : "Все товары уже в топе"}
              </li>
            ) : (
              availableProducts.map((product) => {
                const photo =
                  product.image_url ?? (product.images?.[0] ?? null);
                const canAdd = topList.length < 10;

                return (
                  <li
                    key={product.id}
                    className="flex items-center gap-3 rounded-xl border border-gray-100 bg-white px-3 py-2.5 hover:border-gray-200 transition"
                  >
                    <div className="w-9 h-9 rounded-lg overflow-hidden bg-gray-100 shrink-0">
                      {photo ? (
                        <img
                          src={photo}
                          alt=""
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <ImageIcon className="w-4 h-4 text-gray-300" />
                        </div>
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 line-clamp-1">
                        {product.name}
                      </p>
                      {product.categories?.name && (
                        <p className="text-xs text-gray-400">
                          {product.categories.name}
                        </p>
                      )}
                    </div>

                    <button
                      type="button"
                      onClick={() => addToTop(product)}
                      disabled={!canAdd}
                      aria-label="Добавить в топ"
                      title={!canAdd ? "Топ уже заполнен (10/10)" : "Добавить в топ"}
                      className="shrink-0 flex h-8 w-8 items-center justify-center rounded-xl bg-green-50 text-green-600 hover:bg-green-500 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                    >
                      <Plus className="h-4 w-4" />
                    </button>
                  </li>
                );
              })
            )}
          </ul>
        </div>
      </div>
    </div>
  );
}
