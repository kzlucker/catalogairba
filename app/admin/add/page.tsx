"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { getSupabaseBrowser } from "@/lib/supabase";
import type { Category } from "@/types/database";

function fileExtension(name: string): string {
  const part = name.split(".").pop();
  if (!part || part.length > 8) return "jpg";
  return part.toLowerCase().replace(/[^a-z0-9]/g, "") || "jpg";
}

export default function AdminAddProductPage() {
  const router = useRouter();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loadingCategories, setLoadingCategories] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [weightInfo, setWeightInfo] = useState("");
  const [barcode, setBarcode] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [composition, setComposition] = useState("");
  const [calories, setCalories] = useState("");
  const [proteins, setProteins] = useState("");
  const [fats, setFats] = useState("");
  const [carbs, setCarbs] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);

  useEffect(() => {
    async function loadCategories() {
      try {
        const supabase = getSupabaseBrowser();
        const { data, error: qError } = await supabase
          .from("categories")
          .select("*")
          .order("name", { ascending: true });
        if (qError) throw qError;
        setCategories((data as Category[]) ?? []);
      } catch (e) {
        if (process.env.NODE_ENV === "development") {
          console.error("[admin/add] categories:", e);
        }
        setCategories([]);
      } finally {
        setLoadingCategories(false);
      }
    }
    loadCategories();
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!imageFile) {
      setError("Выберите файл изображения.");
      return;
    }

    setSubmitting(true);
    try {
      const supabase = getSupabaseBrowser();
      const ext = fileExtension(imageFile.name);
      const objectPath = `${Date.now()}-${Math.random().toString(36).slice(2, 10)}.${ext}`;

      const { error: uploadError } = await supabase.storage
        .from("products")
        .upload(objectPath, imageFile, {
          cacheControl: "3600",
          upsert: false,
          contentType: imageFile.type || `image/${ext}`,
        });

      if (uploadError) throw uploadError;

      const { data } = supabase.storage
        .from("products")
        .getPublicUrl(objectPath);
      const publicUrl = data.publicUrl;

      const payload = {
        name: name.trim(),
        price: Number.parseFloat(price.replace(",", ".")) || 0,
        weight_info: weightInfo.trim() || null,
        barcode: barcode.trim() || null,
        composition: composition.trim() || null,
        calories: Number.parseFloat(calories.replace(",", ".")) || 0,
        proteins: Number.parseFloat(proteins.replace(",", ".")) || 0,
        fats: Number.parseFloat(fats.replace(",", ".")) || 0,
        carbs: Number.parseFloat(carbs.replace(",", ".")) || 0,
        image_url: publicUrl,
        is_active: true,
        category_id: categoryId || null,
      };

      const { error: insertError } = await supabase
        .from("products")
        .insert(payload);

      if (insertError) throw insertError;

      router.push("/admin");
      router.refresh();
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Не удалось сохранить товар.";
      setError(message);
    } finally {
      setSubmitting(false);
    }
  }

  const inputClass =
    "w-full rounded-2xl border border-gray-200 bg-white px-4 py-3 text-gray-900 shadow-sm outline-none transition-shadow focus:border-green-500 focus:ring-2 focus:ring-green-500/20";
  const labelClass = "mb-1.5 block text-sm font-medium text-gray-700";

  return (
    <div className="p-6 sm:p-8">
      <Link
        href="/admin"
        className="mb-6 inline-flex items-center gap-2 text-sm font-medium text-gray-500 transition-colors hover:text-green-600"
      >
        <ArrowLeft className="h-4 w-4" aria-hidden />
        Назад к списку
      </Link>

      <div className="mx-auto max-w-3xl">
        <h1 className="mb-2 text-2xl font-bold text-gray-900 sm:text-3xl">
          Новый товар
        </h1>
        <p className="mb-8 text-gray-500">
          Заполните поля и загрузите фото — товар появится в каталоге.
        </p>

        <form
          onSubmit={handleSubmit}
          className="space-y-8 rounded-3xl border border-gray-100 bg-white p-6 shadow-sm sm:p-8"
        >
          {error && (
            <p
              className="rounded-2xl bg-red-50 px-4 py-3 text-sm text-red-700"
              role="alert"
            >
              {error}
            </p>
          )}

          <div>
            <label htmlFor="product-name" className={labelClass}>
              Название
            </label>
            <input
              id="product-name"
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className={inputClass}
              placeholder="Например, Салат Цезарь"
            />
          </div>

          <div className="grid gap-6 sm:grid-cols-2">
            <div>
              <label htmlFor="product-price" className={labelClass}>
                Цена (₸)
              </label>
              <input
                id="product-price"
                type="number"
                required
                min={0}
                step="0.01"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                className={inputClass}
                placeholder="0"
              />
            </div>
            <div>
              <label htmlFor="product-weight" className={labelClass}>
                Вес / объём
              </label>
              <input
                id="product-weight"
                type="text"
                required
                value={weightInfo}
                onChange={(e) => setWeightInfo(e.target.value)}
                className={inputClass}
                placeholder="350 г, 400 мл…"
              />
            </div>
          </div>

          <div className="grid gap-6 sm:grid-cols-2">
            <div>
              <label htmlFor="product-barcode" className={labelClass}>
                Штрихкод
              </label>
              <input
                id="product-barcode"
                type="text"
                value={barcode}
                onChange={(e) => setBarcode(e.target.value)}
                className={inputClass}
                placeholder="4601234567890"
              />
            </div>
            <div>
              <label htmlFor="product-category" className={labelClass}>
                Категория
              </label>
              <select
                id="product-category"
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                disabled={loadingCategories}
                className={inputClass}
              >
                <option value="">— Без категории —</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label htmlFor="product-composition" className={labelClass}>
              Состав
            </label>
            <textarea
              id="product-composition"
              rows={4}
              value={composition}
              onChange={(e) => setComposition(e.target.value)}
              className={`${inputClass} resize-y min-h-[100px]`}
              placeholder="Перечислите ингредиенты…"
            />
          </div>

          <div>
            <span className={labelClass}>КБЖУ (на 100 г)</span>
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
              <div>
                <label htmlFor="kbju-cal" className="sr-only">
                  Калории
                </label>
                <input
                  id="kbju-cal"
                  type="number"
                  required
                  min={0}
                  step="0.1"
                  value={calories}
                  onChange={(e) => setCalories(e.target.value)}
                  className={inputClass}
                  placeholder="ккал"
                />
                <span className="mt-1 block text-xs text-gray-500">Ккал</span>
              </div>
              <div>
                <label htmlFor="kbju-prot" className="sr-only">
                  Белки
                </label>
                <input
                  id="kbju-prot"
                  type="number"
                  required
                  min={0}
                  step="0.1"
                  value={proteins}
                  onChange={(e) => setProteins(e.target.value)}
                  className={inputClass}
                  placeholder="г"
                />
                <span className="mt-1 block text-xs text-gray-500">Белки, г</span>
              </div>
              <div>
                <label htmlFor="kbju-fat" className="sr-only">
                  Жиры
                </label>
                <input
                  id="kbju-fat"
                  type="number"
                  required
                  min={0}
                  step="0.1"
                  value={fats}
                  onChange={(e) => setFats(e.target.value)}
                  className={inputClass}
                  placeholder="г"
                />
                <span className="mt-1 block text-xs text-gray-500">Жиры, г</span>
              </div>
              <div>
                <label htmlFor="kbju-carbs" className="sr-only">
                  Углеводы
                </label>
                <input
                  id="kbju-carbs"
                  type="number"
                  required
                  min={0}
                  step="0.1"
                  value={carbs}
                  onChange={(e) => setCarbs(e.target.value)}
                  className={inputClass}
                  placeholder="г"
                />
                <span className="mt-1 block text-xs text-gray-500">
                  Углеводы, г
                </span>
              </div>
            </div>
          </div>

          <div>
            <label htmlFor="product-image" className={labelClass}>
              Фотография товара
            </label>
            <input
              id="product-image"
              type="file"
              accept="image/*"
              required
              onChange={(e) =>
                setImageFile(e.target.files?.[0] ?? null)
              }
              className="block w-full cursor-pointer rounded-2xl border border-dashed border-gray-200 bg-gray-50/80 px-4 py-6 text-sm text-gray-600 file:mr-4 file:cursor-pointer file:rounded-xl file:border-0 file:bg-green-500 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-white hover:border-green-300"
            />
          </div>

          <div className="flex flex-col-reverse gap-3 border-t border-gray-100 pt-6 sm:flex-row sm:justify-end">
            <Link
              href="/admin"
              className="inline-flex items-center justify-center rounded-2xl border border-gray-200 px-6 py-3 text-sm font-semibold text-gray-700 transition-colors hover:bg-gray-50"
            >
              Отмена
            </Link>
            <button
              type="submit"
              disabled={submitting}
              className="inline-flex items-center justify-center rounded-2xl bg-green-500 px-8 py-3 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-green-600 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {submitting ? "Сохранение…" : "Сохранить"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
