"use client";

import { createBrowserClient } from "@supabase/ssr";
import type { SupabaseClient } from "@supabase/supabase-js";

let client: SupabaseClient | null = null;

/** Singleton для браузера; вызывайте из useEffect или обработчиков (не на верхнем уровне модуля при SSR). */
export function getSupabaseBrowser(): SupabaseClient {
  if (typeof window === "undefined") {
    throw new Error(
      "Supabase: клиент браузера недоступен на сервере. Используйте внутри useEffect или по событию."
    );
  }
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) {
    throw new Error(
      "Не заданы NEXT_PUBLIC_SUPABASE_URL или NEXT_PUBLIC_SUPABASE_ANON_KEY."
    );
  }
  if (!client) {
    client = createBrowserClient(url, key);
  }
  return client;
}
