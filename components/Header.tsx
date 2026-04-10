"use client";

import Link from "next/link";
import { Search, Handshake } from "lucide-react";
import { useSearchStore } from "@/store/useSearchStore";

export default function Header() {
  const { searchQuery, setSearchQuery } = useSearchStore();

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-sm border-b border-gray-100 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Верхняя строка: логотип + поиск (на десктопе) + корзина + вход */}
          <div className="flex flex-col gap-3 py-3 sm:flex-row sm:items-center sm:justify-between sm:gap-4 sm:py-0 sm:h-16">
            <div className="flex min-w-0 flex-1 items-center gap-6 sm:flex-initial">
              <Link href="/" className="shrink-0">
                <img
                  src="/logo.png"
                  alt="Airba Fresh"
                  className="h-10 w-auto sm:h-12 object-contain"
                />
              </Link>
              {/* Поиск в одной строке с логотипом на md+ */}
              <div className="hidden flex-1 max-w-md lg:flex lg:max-w-sm xl:max-w-md">
                <label htmlFor="header-search" className="sr-only">
                  Поиск по каталогу
                </label>
                <div className="relative w-full">
                  <Search
                    className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400"
                    aria-hidden
                  />
                  <input
                    id="header-search"
                    type="search"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Поиск товаров..."
                    className="w-full rounded-2xl border border-gray-200 bg-gray-50/80 py-2.5 pl-10 pr-4 text-base text-gray-900 placeholder:text-gray-400 outline-none transition-colors focus:border-green-500 focus:bg-white focus:ring-2 focus:ring-green-500/20"
                    aria-label="Поиск по каталогу"
                  />
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 sm:gap-3 sm:shrink-0">
              <Link
                href="/commercial"
                className="hidden sm:inline-flex items-center gap-2 rounded-2xl border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-600 shadow-sm transition-colors hover:border-green-200 hover:bg-green-50 hover:text-green-700 whitespace-nowrap"
              >
                <Handshake className="h-4 w-4 shrink-0" aria-hidden />
                Условия сотрудничества
              </Link>
            </div>
          </div>

          {/* Строка поиска под логотипом на мобильных */}
          <div className="pb-3 lg:hidden">
            <label htmlFor="header-search-mobile" className="sr-only">
              Поиск по каталогу
            </label>
            <div className="relative">
              <Search
                className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400"
                aria-hidden
              />
                  <input
                    id="header-search-mobile"
                    type="search"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Поиск товаров..."
                    className="w-full rounded-2xl border border-gray-200 bg-gray-50/80 py-2.5 pl-10 pr-4 text-base text-gray-900 placeholder:text-gray-400 outline-none transition-colors focus:border-green-500 focus:bg-white focus:ring-2 focus:ring-green-500/20"
                    aria-label="Поиск по каталогу"
                  />
            </div>
          </div>
        </div>
    </header>
  );
}
