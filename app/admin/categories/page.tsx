"use client";

import { useEffect, useState } from "react";
import { Trash2, Plus, Loader2, ChevronUp, ChevronDown } from "lucide-react";
import { getSupabaseBrowser } from "@/lib/supabase";

interface Category {
  id: string;
  name: string;
  sort_order: number;
  created_at: string;
}

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const [newName, setNewName] = useState("");
  const [adding, setAdding] = useState(false);
  const [addError, setAddError] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [movingId, setMovingId] = useState<string | null>(null);

  async function fetchCategories() {
    setLoading(true);
    setLoadError(false);
    try {
      const supabase = getSupabaseBrowser();
      const { data, error } = await supabase
        .from("categories")
        .select("*")
        .order("sort_order", { ascending: true })
        .order("name", { ascending: true });
      if (error) throw error;
      setCategories(data ?? []);
    } catch {
      setLoadError(true);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchCategories();
  }, []);

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = newName.trim();
    if (!trimmed) return;
    setAdding(true);
    setAddError(null);
    try {
      const supabase = getSupabaseBrowser();
      const maxOrder = categories.length > 0
        ? Math.max(...categories.map((c) => c.sort_order ?? 0))
        : 0;
      const { error } = await supabase
        .from("categories")
        .insert({ name: trimmed, sort_order: maxOrder + 1 });
      if (error) throw error;
      setNewName("");
      await fetchCategories();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Ошибка при добавлении";
      setAddError(msg);
    } finally {
      setAdding(false);
    }
  }

  async function handleDelete(id: string, name: string) {
    if (!confirm(`Удалить категорию «${name}»?\nТовары в этой категории станут без категории.`)) return;
    setDeletingId(id);
    setDeleteError(null);
    try {
      const supabase = getSupabaseBrowser();
      const { error } = await supabase.from("categories").delete().eq("id", id);
      if (error) throw new Error(error.message);
      setCategories((prev) => prev.filter((c) => c.id !== id));
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Не удалось удалить";
      setDeleteError(msg);
    } finally {
      setDeletingId(null);
    }
  }

  async function handleMove(index: number, direction: "up" | "down") {
    const newCats = [...categories];
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= newCats.length) return;

    const current = newCats[index];
    const target = newCats[targetIndex];
    setMovingId(current.id);

    // Swap sort_order values
    const tempOrder = current.sort_order;
    newCats[index] = { ...current, sort_order: target.sort_order };
    newCats[targetIndex] = { ...target, sort_order: tempOrder };

    // Re-sort locally
    newCats.sort((a, b) => a.sort_order - b.sort_order);
    setCategories(newCats);

    try {
      const supabase = getSupabaseBrowser();
      await Promise.all([
        supabase.from("categories").update({ sort_order: target.sort_order }).eq("id", current.id),
        supabase.from("categories").update({ sort_order: tempOrder }).eq("id", target.id),
      ]);
    } catch {
      // Revert on error
      await fetchCategories();
    } finally {
      setMovingId(null);
    }
  }

  return (
    <div className="p-6 sm:p-8 max-w-2xl">
      <h1 className="text-2xl font-bold text-gray-900 sm:text-3xl">
        Категории
      </h1>
      <p className="mt-1 text-sm text-gray-500">
        Управление категориями товаров каталога
      </p>

      {/* Add form */}
      <form onSubmit={handleAdd} className="mt-6 flex gap-3">
        <input
          type="text"
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          placeholder="Название новой категории"
          maxLength={80}
          className="flex-1 rounded-2xl border border-gray-200 bg-white px-4 py-2.5 text-sm text-gray-900 placeholder-gray-400 shadow-sm outline-none focus:border-green-500 focus:ring-2 focus:ring-green-100 transition"
        />
        <button
          type="submit"
          disabled={adding || !newName.trim()}
          className="inline-flex items-center gap-2 rounded-2xl bg-green-500 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {adding ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Plus className="h-4 w-4" />
          )}
          Добавить
        </button>
      </form>

      {addError && (
        <p className="mt-2 text-sm text-red-600">{addError}</p>
      )}

      {/* List */}
      <div className="mt-6">
        {loading ? (
          <div className="flex items-center gap-2 text-sm text-gray-400 py-8 justify-center">
            <Loader2 className="h-5 w-5 animate-spin" />
            Загрузка...
          </div>
        ) : loadError ? (
          <div className="rounded-2xl border border-red-100 bg-red-50 p-6 text-center">
            <p className="text-sm text-red-600 mb-3">Не удалось загрузить категории</p>
            <button
              onClick={fetchCategories}
              className="text-sm font-medium text-red-700 underline hover:no-underline"
            >
              Попробовать снова
            </button>
          </div>
        ) : categories.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-gray-200 p-8 text-center text-sm text-gray-400">
            Нет категорий. Добавьте первую выше.
          </div>
        ) : (
          <ul className="divide-y divide-gray-100 rounded-2xl border border-gray-200 bg-white shadow-sm overflow-hidden">
            {categories.map((cat, index) => (
              <li
                key={cat.id}
                className="flex items-center gap-2 px-4 py-3 hover:bg-gray-50 transition"
              >
                {/* Move buttons */}
                <div className="flex flex-col gap-0.5 shrink-0">
                  <button
                    type="button"
                    onClick={() => handleMove(index, "up")}
                    disabled={index === 0 || movingId === cat.id}
                    aria-label="Переместить вверх"
                    className="flex h-6 w-6 items-center justify-center rounded-lg text-gray-400 transition hover:bg-gray-200 hover:text-gray-700 disabled:opacity-25 disabled:cursor-not-allowed"
                  >
                    <ChevronUp className="h-3.5 w-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleMove(index, "down")}
                    disabled={index === categories.length - 1 || movingId === cat.id}
                    aria-label="Переместить вниз"
                    className="flex h-6 w-6 items-center justify-center rounded-lg text-gray-400 transition hover:bg-gray-200 hover:text-gray-700 disabled:opacity-25 disabled:cursor-not-allowed"
                  >
                    <ChevronDown className="h-3.5 w-3.5" />
                  </button>
                </div>

                {/* Name */}
                <span className="flex-1 text-sm font-medium text-gray-800">
                  {cat.name}
                </span>

                {/* Loader while moving */}
                {movingId === cat.id && (
                  <Loader2 className="h-4 w-4 animate-spin text-green-500 shrink-0" />
                )}

                {/* Delete */}
                <button
                  type="button"
                  onClick={() => handleDelete(cat.id, cat.name)}
                  disabled={deletingId === cat.id}
                  aria-label={`Удалить ${cat.name}`}
                  className="flex h-8 w-8 items-center justify-center rounded-xl text-gray-400 transition hover:bg-red-50 hover:text-red-500 disabled:opacity-40 shrink-0"
                >
                  {deletingId === cat.id ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Trash2 className="h-4 w-4" />
                  )}
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      {deleteError && (
        <div className="mt-3 rounded-2xl border border-red-100 bg-red-50 px-4 py-3">
          <p className="text-sm text-red-700">
            <span className="font-semibold">Ошибка удаления:</span> {deleteError}
          </p>
          <p className="mt-1 text-xs text-red-500">
            Возможно, нужно разрешить удаление в Supabase → Table Editor → categories → RLS Policies
          </p>
        </div>
      )}

      <p className="mt-4 text-xs text-gray-400">
        Всего категорий: {categories.length}
      </p>
    </div>
  );
}
