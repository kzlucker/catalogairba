"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Plus, X, ImageIcon } from "lucide-react";
import { getSupabaseBrowser } from "@/lib/supabase";
import type { Category } from "@/types/database";

function fileExtension(name: string): string {
  const part = name.split(".").pop();
  if (!part || part.length > 8) return "jpg";
  return part.toLowerCase().replace(/[^a-z0-9]/g, "") || "jpg";
}

interface PreviewFile {
  file: File;
  preview: string;
}

export default function AdminAddProductPage() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [categories, setCategories] = useState<Category[]>([]);
  const [loadingCategories, setLoadingCategories] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [addingCategory, setAddingCategory] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [savingCategory, setSavingCategory] = useState(false);

  async function handleAddCategory() {
    const trimmed = newCategoryName.trim();
    if (!trimmed) return;
    setSavingCategory(true);
    try {
      const supabase = getSupabaseBrowser();
      const maxOrder = categories.length > 0 ? Math.max(...categories.map((c) => c.sort_order ?? 0)) : 0;
      const { data, error: err } = await supabase
        .from("categories")
        .insert({ name: trimmed, sort_order: maxOrder + 1 })
        .select()
        .single();
      if (err) throw err;
      setCategories((prev) => [...prev, data as Category]);
      setCategoryId((data as Category).id);
      setNewCategoryName("");
      setAddingCategory(false);
    } catch (e) {
      alert(e instanceof Error ? e.message : "Ошибка при добавлении категории");
    } finally {
      setSavingCategory(false);
    }
  }

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
  const [isHit, setIsHit] = useState(false);
  const [isUnique, setIsUnique] = useState(false);
  const [imageFiles, setImageFiles] = useState<PreviewFile[]>([]);

  useEffect(() => {
    async function loadCategories() {
      try {
        const supabase = getSupabaseBrowser();
        const { data, error: qError } = await supabase
          .from("categories")
          .select("*")
          .order("sort_order", { ascending: true })
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

  // Cleanup object URLs on unmount
  useEffect(() => {
    return () => {
      imageFiles.forEach((f) => URL.revokeObjectURL(f.preview));
    };
  }, [imageFiles]);

  function handleFilesAdded(files: FileList | null) {
    if (!files) return;
    const MAX = 6;
    const remaining = MAX - imageFiles.length;
    if (remaining <= 0) return;
    const added: PreviewFile[] = [];
    for (let i = 0; i < Math.min(files.length, remaining); i++) {
      const file = files[i];
      if (!file.type.startsWith("image/")) continue;
      added.push({ file, preview: URL.createObjectURL(file) });
    }
    setImageFiles((prev) => [...prev, ...added]);
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  function removeImage(index: number) {
    setImageFiles((prev) => {
      URL.revokeObjectURL(prev[index].preview);
      return prev.filter((_, i) => i !== index);
    });
  }

  async function uploadFile(file: File, supabase: ReturnType<typeof getSupabaseBrowser>): Promise<string> {
    const ext = fileExtension(file.name);
    const objectPath = `${Date.now()}-${Math.random().toString(36).slice(2, 10)}.${ext}`;
    const { error: uploadError } = await supabase.storage
      .from("products")
      .upload(objectPath, file, {
        cacheControl: "3600",
        upsert: false,
        contentType: file.type || `image/${ext}`,
      });
    if (uploadError) throw uploadError;
    const { data } = supabase.storage.from("products").getPublicUrl(objectPath);
    return data.publicUrl;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (imageFiles.length === 0) {
      setError("Загрузите хотя бы одно фото.");
      return;
    }

    setSubmitting(true);
    try {
      const supabase = getSupabaseBrowser();

      // Upload all images in parallel
      const urls = await Promise.all(imageFiles.map((f) => uploadFile(f.file, supabase)));
      const [primaryUrl, ...extraUrls] = urls;

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
        image_url: primaryUrl,
        images: extraUrls,
        is_active: true,
        is_hit: isHit,
        is_unique: isUnique,
        category_id: categoryId || null,
      };

      const { error: insertError } = await supabase.from("products").insert(payload);
      if (insertError) throw insertError;

      router.push("/admin");
      router.refresh();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Не удалось сохранить товар.";
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
        <h1 className="mb-2 text-2xl font-bold text-gray-900 sm:text-3xl">Новый товар</h1>
        <p className="mb-8 text-gray-500">Заполните поля и загрузите фото — товар появится в каталоге.</p>

        <form onSubmit={handleSubmit} className="space-y-8 rounded-3xl border border-gray-100 bg-white p-6 shadow-sm sm:p-8">
          {error && (
            <p className="rounded-2xl bg-red-50 px-4 py-3 text-sm text-red-700" role="alert">{error}</p>
          )}

          <div>
            <label htmlFor="product-name" className={labelClass}>Название</label>
            <input id="product-name" type="text" required value={name} onChange={(e) => setName(e.target.value)} className={inputClass} placeholder="Например, Салат Цезарь" />
          </div>

          <div className="grid gap-6 sm:grid-cols-2">
            <div>
              <label htmlFor="product-price" className={labelClass}>Цена (₸)</label>
              <input id="product-price" type="number" required min={0} step="0.01" value={price} onChange={(e) => setPrice(e.target.value)} className={inputClass} placeholder="0" />
            </div>
            <div>
              <label htmlFor="product-weight" className={labelClass}>Вес / объём</label>
              <input id="product-weight" type="text" required value={weightInfo} onChange={(e) => setWeightInfo(e.target.value)} className={inputClass} placeholder="350 г, 400 мл…" />
            </div>
          </div>

          <div className="grid gap-6 sm:grid-cols-2">
            <div>
              <label htmlFor="product-barcode" className={labelClass}>Штрихкод</label>
              <input id="product-barcode" type="text" value={barcode} onChange={(e) => setBarcode(e.target.value)} className={inputClass} placeholder="4601234567890" />
            </div>
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label htmlFor="product-category" className="text-sm font-medium text-gray-700">Категория</label>
                <button
                  type="button"
                  onClick={() => { setAddingCategory((v) => !v); setNewCategoryName(""); }}
                  className="inline-flex items-center gap-1 text-xs font-medium text-green-600 hover:text-green-700 transition-colors"
                >
                  <Plus className="h-3.5 w-3.5" />
                  {addingCategory ? "Отмена" : "Новая категория"}
                </button>
              </div>

              {addingCategory ? (
                <div className="flex gap-2">
                  <input
                    type="text"
                    autoFocus
                    value={newCategoryName}
                    onChange={(e) => setNewCategoryName(e.target.value)}
                    onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); handleAddCategory(); } if (e.key === "Escape") setAddingCategory(false); }}
                    placeholder="Название категории"
                    className={inputClass}
                  />
                  <button
                    type="button"
                    onClick={handleAddCategory}
                    disabled={savingCategory || !newCategoryName.trim()}
                    className="shrink-0 rounded-2xl bg-green-500 px-4 py-3 text-sm font-semibold text-white hover:bg-green-600 disabled:opacity-50 transition-colors"
                  >
                    {savingCategory ? "…" : "Добавить"}
                  </button>
                </div>
              ) : (
                <select id="product-category" value={categoryId} onChange={(e) => setCategoryId(e.target.value)} disabled={loadingCategories} className={inputClass}>
                  <option value="">— Без категории —</option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              )}
            </div>
          </div>

          <div>
            <label htmlFor="product-composition" className={labelClass}>Состав</label>
            <textarea id="product-composition" rows={4} value={composition} onChange={(e) => setComposition(e.target.value)} className={`${inputClass} resize-y min-h-[100px]`} placeholder="Перечислите ингредиенты…" />
          </div>

          <div>
            <span className={labelClass}>КБЖУ (на 100 г)</span>
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
              <div>
                <label htmlFor="kbju-cal" className="sr-only">Калории</label>
                <input id="kbju-cal" type="number" required min={0} step="0.1" value={calories} onChange={(e) => setCalories(e.target.value)} className={inputClass} placeholder="ккал" />
                <span className="mt-1 block text-xs text-gray-500">Ккал</span>
              </div>
              <div>
                <label htmlFor="kbju-prot" className="sr-only">Белки</label>
                <input id="kbju-prot" type="number" required min={0} step="0.1" value={proteins} onChange={(e) => setProteins(e.target.value)} className={inputClass} placeholder="г" />
                <span className="mt-1 block text-xs text-gray-500">Белки, г</span>
              </div>
              <div>
                <label htmlFor="kbju-fat" className="sr-only">Жиры</label>
                <input id="kbju-fat" type="number" required min={0} step="0.1" value={fats} onChange={(e) => setFats(e.target.value)} className={inputClass} placeholder="г" />
                <span className="mt-1 block text-xs text-gray-500">Жиры, г</span>
              </div>
              <div>
                <label htmlFor="kbju-carbs" className="sr-only">Углеводы</label>
                <input id="kbju-carbs" type="number" required min={0} step="0.1" value={carbs} onChange={(e) => setCarbs(e.target.value)} className={inputClass} placeholder="г" />
                <span className="mt-1 block text-xs text-gray-500">Углеводы, г</span>
              </div>
            </div>
          </div>

          {/* Multi-image upload */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className={labelClass + " mb-0"}>
                Фотографии товара
                <span className="ml-1.5 text-xs font-normal text-gray-400">({imageFiles.length}/6)</span>
              </span>
              {imageFiles.length > 0 && (
                <span className="text-xs text-gray-400">Первое фото — обложка</span>
              )}
            </div>

            <div className="grid grid-cols-3 gap-3 sm:grid-cols-4 md:grid-cols-6">
              {imageFiles.map((item, i) => (
                <div key={item.preview} className="relative aspect-square rounded-2xl overflow-hidden border-2 border-gray-200 bg-gray-100 group">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={item.preview} alt="" className="h-full w-full object-cover" />
                  {i === 0 && (
                    <span className="absolute bottom-1 left-1 right-1 rounded-lg bg-green-500/90 text-white text-[10px] font-bold text-center py-0.5">
                      Обложка
                    </span>
                  )}
                  <button
                    type="button"
                    onClick={() => removeImage(i)}
                    aria-label="Удалить фото"
                    className="absolute top-1 right-1 flex h-6 w-6 items-center justify-center rounded-full bg-black/60 text-white opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-500"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                </div>
              ))}

              {imageFiles.length < 6 && (
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="aspect-square rounded-2xl border-2 border-dashed border-gray-300 bg-gray-50 flex flex-col items-center justify-center gap-1 text-gray-400 hover:border-green-400 hover:bg-green-50 hover:text-green-500 transition-colors"
                >
                  <Plus className="h-6 w-6" />
                  <span className="text-[10px] font-medium">Добавить</span>
                </button>
              )}

              {imageFiles.length === 0 && (
                <div className="col-span-2 flex items-center gap-2 text-xs text-gray-400 pl-1">
                  <ImageIcon className="h-4 w-4 shrink-0" />
                  Нажмите «+» чтобы выбрать фото
                </div>
              )}
            </div>

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              multiple
              className="sr-only"
              onChange={(e) => handleFilesAdded(e.target.files)}
            />
          </div>

          {/* Уникальный */}
          <div className="flex items-center justify-between rounded-2xl border border-purple-200 bg-purple-50 px-5 py-4">
            <div className="flex flex-col">
              <span className="text-sm font-semibold text-purple-900">⭐ Уникальный</span>
              <span className="text-xs text-purple-700 mt-0.5">Товар будет помечен как уникальный в каталоге</span>
            </div>
            <button
              type="button"
              role="switch"
              aria-checked={isUnique}
              onClick={() => setIsUnique((v) => !v)}
              className={`relative inline-flex h-7 w-12 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus-visible:ring-2 focus-visible:ring-purple-500 focus-visible:ring-offset-2 ${isUnique ? "bg-purple-600" : "bg-gray-200"}`}
            >
              <span className="sr-only">Уникальный</span>
              <span className={`pointer-events-none inline-block h-6 w-6 transform rounded-full bg-white shadow-md ring-0 transition-transform duration-200 ease-in-out ${isUnique ? "translate-x-5" : "translate-x-0"}`} />
            </button>
          </div>

          {/* ХИТ */}
          <div className="flex items-center justify-between rounded-2xl border border-amber-200 bg-amber-50 px-5 py-4">
            <div className="flex flex-col">
              <span className="text-sm font-semibold text-amber-900">🔥 Сделать ХИТом</span>
              <span className="text-xs text-amber-700 mt-0.5">Товар будет помечен как хит продаж в каталоге</span>
            </div>
            <button
              type="button"
              role="switch"
              aria-checked={isHit}
              onClick={() => setIsHit((v) => !v)}
              className={`relative inline-flex h-7 w-12 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:ring-offset-2 ${isHit ? "bg-amber-500" : "bg-gray-200"}`}
            >
              <span className="sr-only">Сделать хитом продаж</span>
              <span className={`pointer-events-none inline-block h-6 w-6 transform rounded-full bg-white shadow-md ring-0 transition-transform duration-200 ease-in-out ${isHit ? "translate-x-5" : "translate-x-0"}`} />
            </button>
          </div>

          <div className="flex flex-col-reverse gap-3 border-t border-gray-100 pt-6 sm:flex-row sm:justify-end">
            <Link href="/admin" className="inline-flex items-center justify-center rounded-2xl border border-gray-200 px-6 py-3 text-sm font-semibold text-gray-700 transition-colors hover:bg-gray-50">
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
