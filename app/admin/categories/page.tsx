"use client";

import { useEffect, useState } from "react";
import { Trash2, Plus, Loader2 } from "lucide-react";
import { getSupabaseBrowser } from "@/lib/supabase";

interface Category {
  id: string;
  name: string;
  created_at: string;
}

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [newName, setNewName] = useState("");
  const [adding, setAdding] = useState(false);
  const [addError, setAddError] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  async function fetchCategories() {
    setLoading(true);
    setLoadError(null);
    try {
      const supabase = getSupabaseBrowser();
      const { data, error } = await supabase
        .from("categories")
        .select("id, name, created_at")
        .order("name", { ascending: true });
      if (error) throw new Error(error.message);
      setCategories(data ?? []);
    } catch (err) {
      setLoadError(err instanceof Error ? err.message : "Ошибка загрузки");
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
      const { error } = await supabase
        .from("categories")
        .insert({ name: trimmed });
      if (error) throw new Error(error.message);
      setNewName("");
      await fetchCategories();
    } catch (err) {
      setAddError(err instanceof Error ? err.message : "Ошибка при добавлении");
    } finally {
      setAdding(false);
    }
  }

  async function handleDelete(id: string, name: string) {
    if (!confirm(`Удалить категорию «${name}»?\nТовары в этой категории останутся без категории.`)) return;
    setDeletingId(id);
    setDeleteError(null);
    try {
      const supabase = getSupabaseBrowser();
      const { error } = await supabase.from("categories").delete().eq("id", id);
      if (error) throw new Error(error.message);
      setCategories((prev) => prev.filter((c) => c.id !== id));
    } catch (err) {
      setDeleteError(err instanceof Error ? err.message : "Ошибка при удалении");
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <div className="p-6 sm:p-8 max-w-2xl">
      <h1 className="text-2xl font-bold text-gray-900 sm:text-3xl">Категории</h1>
      <p className="mt-1 text-sm text-gray-500">Управление категориями товаров каталога</p>

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
          {adding ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
          Добавить
        </button>
      </form>

      {addError && (
        <div className="mt-3 rounded-2xl border border-red-100 bg-red-50 px-4 py-3">
          <p className="text-sm font-semibold text-red-700">Ошибка добавления:</p>
          <p className="text-sm text-red-600 mt-0.5">{addError}</p>
          <p className="text-xs text-red-400 mt-2">
            Если ошибка связана с политикой (policy / permission), выполните в Supabase SQL Editor:
            <br />
            <code className="mt-1 block bg-red-100 rounded px-2 py-1 font-mono">
              CREATE POLICY &quot;ins_cat&quot; ON categories FOR INSERT WITH CHECK (true);
            </code>
          </p>
        </div>
      )}

      {/* List */}
      <div className="mt-6">
        {loading ? (
          <div className="flex items-center gap-2 text-sm text-gray-400 py-8 justify-center">
            <Loader2 className="h-5 w-5 animate-spin" />Загрузка...
          </div>
        ) : loadError ? (
          <div className="rounded-2xl border border-red-100 bg-red-50 p-6">
            <p className="text-sm font-semibold text-red-700 mb-1">Не удалось загрузить категории</p>
            <p className="text-sm text-red-600">{loadError}</p>
            <button onClick={fetchCategories} className="mt-3 text-sm font-medium text-red-700 underline">
              Попробовать снова
            </button>
          </div>
        ) : categories.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-gray-200 p-8 text-center text-sm text-gray-400">
            Нет категорий. Добавьте первую выше.
          </div>
        ) : (
          <ul className="divide-y divide-gray-100 rounded-2xl border border-gray-200 bg-white shadow-sm overflow-hidden">
            {categories.map((cat) => (
              <li key={cat.id} className="flex items-center justify-between px-5 py-3.5 hover:bg-gray-50 transition">
                <span className="text-sm font-medium text-gray-800">{cat.name}</span>
                <button
                  type="button"
                  onClick={() => handleDelete(cat.id, cat.name)}
                  disabled={deletingId === cat.id}
                  aria-label={`Удалить ${cat.name}`}
                  className="ml-4 flex h-8 w-8 items-center justify-center rounded-xl text-gray-400 transition hover:bg-red-50 hover:text-red-500 disabled:opacity-40"
                >
                  {deletingId === cat.id
                    ? <Loader2 className="h-4 w-4 animate-spin" />
                    : <Trash2 className="h-4 w-4" />}
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      {deleteError && (
        <div className="mt-3 rounded-2xl border border-red-100 bg-red-50 px-4 py-3">
          <p className="text-sm font-semibold text-red-700">Ошибка удаления:</p>
          <p className="text-sm text-red-600 mt-0.5">{deleteError}</p>
          <p className="text-xs text-red-400 mt-2">
            Выполните в Supabase SQL Editor:
            <br />
            <code className="mt-1 block bg-red-100 rounded px-2 py-1 font-mono">
              CREATE POLICY &quot;del_cat&quot; ON categories FOR DELETE USING (true);
            </code>
          </p>
        </div>
      )}

      <p className="mt-4 text-xs text-gray-400">Всего категорий: {categories.length}</p>
    </div>
  );
}
