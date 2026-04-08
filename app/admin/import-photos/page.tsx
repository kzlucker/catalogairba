"use client";

import { useEffect, useRef, useState } from "react";
import { Upload, CheckCircle, XCircle, AlertCircle, Loader2 } from "lucide-react";
import { getSupabaseBrowser } from "@/lib/supabase";

interface Product {
  id: string;
  name: string;
  barcode: string | null;
  image_url: string | null;
  images: string[];
}

type MatchStatus = "matched" | "not_found" | "full"; // full = уже 6 фото
type UploadStatus = "pending" | "uploading" | "done" | "error";

interface FileItem {
  file: File;
  preview: string;
  /** Штрихкод извлечённый из имени файла (всё до первого _ или до расширения) */
  barcode: string;
  product: Product | null;
  matchStatus: MatchStatus;
  uploadStatus: UploadStatus;
  errorMsg?: string;
}

function extractBarcode(filename: string): string {
  // Убираем расширение
  const noExt = filename.replace(/\.[^.]+$/, "").trim();
  // Берём часть до первого "_" или "-" (для многофото: barcode_1, barcode_2 …)
  return noExt.split(/[_-]/)[0].trim();
}

function fileExtension(name: string) {
  const part = name.split(".").pop();
  if (!part || part.length > 8) return "jpg";
  return part.toLowerCase().replace(/[^a-z0-9]/g, "") || "jpg";
}

const MAX_PHOTOS = 6;

export default function ImportPhotosPage() {
  const inputRef = useRef<HTMLInputElement>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [items, setItems] = useState<FileItem[]>([]);
  const [uploading, setUploading] = useState(false);
  const [done, setDone] = useState(false);

  useEffect(() => {
    async function load() {
      try {
        const supabase = getSupabaseBrowser();
        const { data } = await supabase
          .from("products")
          .select("id, name, barcode, image_url, images");
        setProducts(
          (data ?? []).map((p: Product) => ({
            ...p,
            images: Array.isArray(p.images) ? p.images : [],
          }))
        );
      } finally {
        setLoadingProducts(false);
      }
    }
    load();
  }, []);

  useEffect(() => {
    return () => { items.forEach((i) => URL.revokeObjectURL(i.preview)); };
  }, [items]);

  function handleFiles(files: FileList | null) {
    if (!files || files.length === 0) return;
    setDone(false);

    // Считаем сколько файлов уже ожидает загрузки на каждый продукт
    const pendingCountMap: Record<string, number> = {};
    items.forEach((it) => {
      if (it.product && it.matchStatus === "matched") {
        pendingCountMap[it.product.id] = (pendingCountMap[it.product.id] ?? 0) + 1;
      }
    });

    const newItems: FileItem[] = [];
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      if (!file.type.startsWith("image/")) continue;

      const barcode = extractBarcode(file.name);
      const product = products.find(
        (p) => p.barcode && p.barcode.trim() === barcode
      ) ?? null;

      let matchStatus: MatchStatus = "not_found";
      if (product) {
        const existingCount =
          (product.image_url ? 1 : 0) + product.images.length;
        const alreadyQueued = pendingCountMap[product.id] ?? 0;
        const newQueued = newItems.filter((x) => x.product?.id === product.id).length;
        const total = existingCount + alreadyQueued + newQueued;

        if (total >= MAX_PHOTOS) {
          matchStatus = "full";
        } else {
          matchStatus = "matched";
        }
      }

      newItems.push({ file, preview: URL.createObjectURL(file), barcode, product, matchStatus, uploadStatus: "pending" });
    }

    setItems((prev) => [...prev, ...newItems]);
    if (inputRef.current) inputRef.current.value = "";
  }

  async function handleUploadAll() {
    const toUpload = items.filter((i) => i.matchStatus === "matched" && i.uploadStatus === "pending");
    if (toUpload.length === 0) return;
    setUploading(true);
    setDone(false);

    const supabase = getSupabaseBrowser();

    // Актуальные данные по продуктам во время загрузки (чтобы накапливать URLs)
    const productCache: Record<string, { image_url: string | null; images: string[] }> = {};
    products.forEach((p) => {
      productCache[p.id] = {
        image_url: p.image_url,
        images: [...p.images],
      };
    });

    for (const item of toUpload) {
      setItems((prev) =>
        prev.map((x) => x.file === item.file ? { ...x, uploadStatus: "uploading" } : x)
      );
      try {
        const ext = fileExtension(item.file.name);
        const path = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;

        const { error: uploadErr } = await supabase.storage
          .from("products")
          .upload(path, item.file, {
            cacheControl: "3600",
            upsert: false,
            contentType: item.file.type || `image/${ext}`,
          });
        if (uploadErr) throw uploadErr;

        const { data: urlData } = supabase.storage.from("products").getPublicUrl(path);
        const newUrl = urlData.publicUrl;
        const pid = item.product!.id;
        const cached = productCache[pid];

        // Добавляем к существующим (не заменяем)
        let updatePayload: { image_url?: string; images?: string[] };
        if (!cached.image_url) {
          // Нет главного фото — ставим первым
          updatePayload = { image_url: newUrl };
          cached.image_url = newUrl;
        } else {
          // Уже есть главное — добавляем в массив
          const newImages = [...cached.images, newUrl];
          updatePayload = { images: newImages };
          cached.images = newImages;
        }

        const { error: updateErr } = await supabase
          .from("products")
          .update(updatePayload)
          .eq("id", pid);
        if (updateErr) throw updateErr;

        setItems((prev) =>
          prev.map((x) => x.file === item.file ? { ...x, uploadStatus: "done" } : x)
        );
      } catch (err) {
        const msg = err instanceof Error ? err.message : "Ошибка";
        setItems((prev) =>
          prev.map((x) => x.file === item.file ? { ...x, uploadStatus: "error", errorMsg: msg } : x)
        );
      }
    }

    setUploading(false);
    setDone(true);
  }

  function removeItem(file: File) {
    setItems((prev) => {
      const item = prev.find((x) => x.file === file);
      if (item) URL.revokeObjectURL(item.preview);
      return prev.filter((x) => x.file !== file);
    });
  }

  const matched = items.filter((i) => i.matchStatus === "matched");
  const notFound = items.filter((i) => i.matchStatus === "not_found");
  const full = items.filter((i) => i.matchStatus === "full");
  const uploaded = items.filter((i) => i.uploadStatus === "done");
  const errors = items.filter((i) => i.uploadStatus === "error");
  const pendingCount = matched.filter((i) => i.uploadStatus === "pending").length;

  const statusIcon = (item: FileItem) => {
    if (item.uploadStatus === "uploading") return <Loader2 className="h-4 w-4 animate-spin text-blue-500" />;
    if (item.uploadStatus === "done") return <CheckCircle className="h-4 w-4 text-green-500" />;
    if (item.uploadStatus === "error") return <XCircle className="h-4 w-4 text-red-500" />;
    if (item.matchStatus === "matched") return <CheckCircle className="h-4 w-4 text-gray-300" />;
    if (item.matchStatus === "full") return <AlertCircle className="h-4 w-4 text-purple-400" />;
    return <XCircle className="h-4 w-4 text-amber-400" />;
  };

  const rowBg = (item: FileItem) => {
    if (item.uploadStatus === "done") return "bg-green-50";
    if (item.uploadStatus === "error") return "bg-red-50";
    if (item.matchStatus === "full") return "bg-purple-50";
    if (item.matchStatus === "not_found") return "bg-amber-50";
    return "";
  };

  return (
    <div className="p-6 sm:p-8 max-w-4xl">
      <h1 className="text-2xl font-bold text-gray-900 sm:text-3xl">Массовая загрузка фото</h1>
      <p className="mt-1 text-sm text-gray-500">
        Файлы называйте по штрихкоду. Для нескольких фото одного товара добавьте суффикс:
        {" "}<code className="bg-gray-100 px-1 rounded">4601234_1.jpg</code>,{" "}
        <code className="bg-gray-100 px-1 rounded">4601234_2.jpg</code> и т.д.
        Новые фото <strong>добавляются</strong> к уже существующим (до {MAX_PHOTOS} штук).
      </p>

      {/* Drop zone */}
      <div
        className="mt-6 rounded-3xl border-2 border-dashed border-gray-300 bg-gray-50 p-10 text-center transition-colors hover:border-green-400 hover:bg-green-50 cursor-pointer"
        onClick={() => inputRef.current?.click()}
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => { e.preventDefault(); handleFiles(e.dataTransfer.files); }}
      >
        <Upload className="mx-auto h-10 w-10 text-gray-400 mb-3" />
        <p className="text-sm font-semibold text-gray-700">Нажмите или перетащите фото сюда</p>
        <p className="text-xs text-gray-400 mt-1">Можно выбрать сразу все файлы</p>
        <input ref={inputRef} type="file" accept="image/*" multiple className="sr-only" onChange={(e) => handleFiles(e.target.files)} />
      </div>

      {loadingProducts && (
        <div className="mt-4 flex items-center gap-2 text-sm text-gray-400">
          <Loader2 className="h-4 w-4 animate-spin" /> Загрузка товаров...
        </div>
      )}

      {/* Stats */}
      {items.length > 0 && (
        <div className="mt-6 grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="rounded-2xl bg-gray-100 p-4 text-center">
            <p className="text-2xl font-bold text-gray-800">{items.length}</p>
            <p className="text-xs text-gray-500 mt-1">Всего файлов</p>
          </div>
          <div className="rounded-2xl bg-green-50 border border-green-100 p-4 text-center">
            <p className="text-2xl font-bold text-green-700">{matched.length}</p>
            <p className="text-xs text-green-600 mt-1">Совпало с товарами</p>
          </div>
          <div className="rounded-2xl bg-amber-50 border border-amber-100 p-4 text-center">
            <p className="text-2xl font-bold text-amber-700">{notFound.length}</p>
            <p className="text-xs text-amber-600 mt-1">Штрихкод не найден</p>
          </div>
          <div className="rounded-2xl bg-blue-50 border border-blue-100 p-4 text-center">
            <p className="text-2xl font-bold text-blue-700">{uploaded.length}</p>
            <p className="text-xs text-blue-600 mt-1">Загружено</p>
          </div>
        </div>
      )}

      {/* Action */}
      {pendingCount > 0 && (
        <button
          type="button"
          onClick={handleUploadAll}
          disabled={uploading}
          className="mt-5 inline-flex items-center gap-2 rounded-2xl bg-green-500 px-7 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-green-600 disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
          {uploading ? "Загрузка..." : `Загрузить ${pendingCount} фото`}
        </button>
      )}

      {done && errors.length === 0 && (
        <div className="mt-5 rounded-2xl bg-green-50 border border-green-100 px-5 py-4 flex items-center gap-3">
          <CheckCircle className="h-5 w-5 text-green-500 shrink-0" />
          <p className="text-sm font-semibold text-green-800">Все {uploaded.length} фото успешно добавлены!</p>
        </div>
      )}

      {/* List */}
      {items.length > 0 && (
        <div className="mt-6 divide-y divide-gray-100 rounded-3xl border border-gray-200 bg-white shadow-sm overflow-hidden">
          <div className="grid grid-cols-[48px_1fr_auto_auto] gap-4 px-5 py-2 bg-gray-50 text-xs font-semibold text-gray-500 uppercase tracking-wide">
            <span />
            <span>Товар / файл</span>
            <span className="hidden sm:block">Фото сейчас</span>
            <span />
          </div>
          {items.map((item, idx) => (
            <div key={idx} className={`grid grid-cols-[48px_1fr_auto_auto] gap-4 items-center px-5 py-3 ${rowBg(item)}`}>
              {/* Thumb */}
              <div className="h-12 w-12 rounded-xl overflow-hidden bg-gray-100 shrink-0">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={item.preview} alt="" className="h-full w-full object-cover" />
              </div>

              {/* Info */}
              <div className="min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">
                  {item.matchStatus === "matched" || item.matchStatus === "full"
                    ? item.product!.name
                    : <span className="text-amber-600">Штрихкод не найден</span>}
                </p>
                <p className="text-xs text-gray-400 truncate">{item.file.name}</p>
                {item.matchStatus === "full" && (
                  <p className="text-xs text-purple-500">Уже {MAX_PHOTOS} фото — пропущено</p>
                )}
                {item.matchStatus === "matched" && item.product && (
                  <p className="text-xs text-gray-400">
                    Текущих фото: {(item.product.image_url ? 1 : 0) + item.product.images.length}
                  </p>
                )}
                {item.uploadStatus === "error" && (
                  <p className="text-xs text-red-500 mt-0.5">{item.errorMsg}</p>
                )}
              </div>

              {/* Current photos */}
              <div className="hidden sm:flex gap-1">
                {item.product?.image_url && (
                  <div className="h-10 w-10 rounded-lg overflow-hidden bg-gray-100">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={item.product.image_url} alt="" className="h-full w-full object-cover" />
                  </div>
                )}
                {item.product?.images?.slice(0, 2).map((u, i) => (
                  <div key={i} className="h-10 w-10 rounded-lg overflow-hidden bg-gray-100">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={u} alt="" className="h-full w-full object-cover" />
                  </div>
                ))}
                {((item.product?.images?.length ?? 0) > 2) && (
                  <div className="h-10 w-10 rounded-lg bg-gray-100 flex items-center justify-center text-xs text-gray-500">
                    +{(item.product?.images?.length ?? 0) - 2}
                  </div>
                )}
              </div>

              {/* Status + remove */}
              <div className="flex items-center gap-2 shrink-0">
                {statusIcon(item)}
                {item.uploadStatus === "pending" && (
                  <button
                    type="button"
                    onClick={() => removeItem(item.file)}
                    className="text-gray-300 hover:text-red-400 transition text-lg leading-none"
                    aria-label="Убрать"
                  >
                    ×
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Not found list */}
      {notFound.length > 0 && (
        <div className="mt-4 rounded-2xl bg-amber-50 border border-amber-100 px-5 py-4">
          <p className="text-sm font-semibold text-amber-800 flex items-center gap-2">
            <AlertCircle className="h-4 w-4 shrink-0" />
            {notFound.length} файл(ов) — штрихкод не найден в базе
          </p>
          <ul className="mt-2 space-y-0.5">
            {notFound.map((i, idx) => (
              <li key={idx} className="text-xs text-amber-700 font-mono">
                · {i.file.name} → штрихкод: &quot;{i.barcode}&quot;
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
