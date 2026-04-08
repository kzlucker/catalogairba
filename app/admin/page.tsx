"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ImageIcon, Pencil, Trash2, Plus, AlertCircle } from "lucide-react";
import { getSupabaseBrowser } from "@/lib/supabase";
import type { ProductWithCategory } from "@/types/database";

export default function AdminProductsPage() {
  const [products, setProducts] = useState<ProductWithCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  async function fetchAll() {
    setLoadError(false);
    try {
      const supabase = getSupabaseBrowser();
      const { data, error } = await supabase
        .from("products")
        .select("*, categories(name)")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setProducts((data as ProductWithCategory[]) ?? []);
    } catch (err) {
      if (process.env.NODE_ENV === "development") {
        console.error("[admin] Ошибка загрузки товаров:", err);
      }
      setLoadError(true);
      setProducts([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchAll();
  }, []);

  async function handleDelete(id: string, name: string) {
    if (!confirm(`Удалить товар «${name}»? Это действие нельзя отменить.`)) return;
    setDeletingId(id);
    try {
      const supabase = getSupabaseBrowser();
      const { error } = await supabase.from("products").delete().eq("id", id);
      if (error) throw error;
      setProducts((prev) => prev.filter((p) => p.id !== id));
    } catch (err) {
      alert("Не удалось удалить товар. Попробуйте ещё раз.");
      if (process.env.NODE_ENV === "development") {
        console.error("[admin] Ошибка удаления:", err);
      }
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <div className="p-6 sm:p-8">
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl font-bold text-gray-900 sm:text-3xl">
          Управление товарами
        </h1>
        <Link
          href="/admin/add"
          className="inline-flex items-center justify-center gap-2 self-start rounded-2xl bg-green-500 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-green-600 sm:self-auto"
        >
          <Plus className="h-5 w-5" aria-hidden />
          Добавить товар
        </Link>
      </div>

      {loading ? (
        <p className="text-gray-500">Загрузка списка...</p>
      ) : loadError ? (
        <div className="rounded-2xl border border-red-100 bg-red-50 p-6 flex items-start gap-3">
          <AlertCircle className="h-5 w-5 text-red-500 shrink-0 mt-0.5" />
          <div>
            <p className="font-medium text-red-800">Не удалось загрузить список товаров</p>
            <button
              type="button"
              onClick={() => { setLoading(true); fetchAll(); }}
              className="mt-2 text-sm text-red-600 hover:underline"
            >
              Попробовать снова
            </button>
          </div>
        </div>
      ) : products.length === 0 ? (
        <p className="text-gray-500">Товаров пока нет.</p>
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-gray-200 bg-white shadow-sm">
          <table className="w-full min-w-[720px] border-collapse text-left text-sm">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50/80">
                <th className="whitespace-nowrap px-4 py-3 font-semibold text-gray-700">Фото</th>
                <th className="whitespace-nowrap px-4 py-3 font-semibold text-gray-700">Название</th>
                <th className="whitespace-nowrap px-4 py-3 font-semibold text-gray-700">Категория</th>
                <th className="whitespace-nowrap px-4 py-3 font-semibold text-gray-700">Вес / объём</th>
                <th className="whitespace-nowrap px-4 py-3 font-semibold text-gray-700">Статус</th>
                <th className="whitespace-nowrap px-4 py-3 text-right font-semibold text-gray-700">Действия</th>
              </tr>
            </thead>
            <tbody>
              {products.map((product) => (
                <tr
                  key={product.id}
                  className="border-b border-gray-100 last:border-0 hover:bg-gray-50/60"
                >
                  <td className="px-4 py-3 align-middle">
                    <div className="h-10 w-10 overflow-hidden rounded-xl bg-gray-100">
                      {product.image_url ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={product.image_url}
                          alt=""
                          className="h-full w-full object-cover"
                          width={40}
                          height={40}
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center">
                          <ImageIcon className="h-5 w-5 text-gray-300" aria-hidden />
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="max-w-[200px] px-4 py-3 align-middle text-gray-900">
                    <span className="line-clamp-2 font-medium">{product.name}</span>
                    {product.is_hit && (
                      <span className="mt-0.5 inline-flex items-center gap-0.5 text-xs font-semibold text-amber-600">
                        🔥 ХИТ
                      </span>
                    )}
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 align-middle text-gray-600">
                    {product.categories?.name ?? "—"}
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 align-middle text-gray-600">
                    {product.weight_info ?? "—"}
                  </td>
                  <td className="px-4 py-3 align-middle">
                    {product.is_active ? (
                      <span className="inline-flex rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-800">
                        Активен
                      </span>
                    ) : (
                      <span className="inline-flex rounded-full bg-gray-200 px-2.5 py-0.5 text-xs font-medium text-gray-700">
                        Скрыт
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3 align-middle text-right">
                    <div className="inline-flex items-center justify-end gap-1">
                      <Link
                        href={`/admin/edit/${product.id}`}
                        className="rounded-xl p-2 text-gray-500 transition-colors hover:bg-gray-100 hover:text-green-600"
                        aria-label="Редактировать"
                      >
                        <Pencil className="h-4 w-4" />
                      </Link>
                      <button
                        type="button"
                        onClick={() => handleDelete(product.id, product.name)}
                        disabled={deletingId === product.id}
                        className="rounded-xl p-2 text-gray-500 transition-colors hover:bg-gray-100 hover:text-red-600 disabled:opacity-40"
                        aria-label="Удалить"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
