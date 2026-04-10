"use client";

import Link from "next/link";
import { Search, Handshake } from "lucide-react";
import { useSearchStore } from "@/store/useSearchStore";

export default function Header() {
  const { searchQuery, setSearchQuery } = useSearchStore();

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-sm border-b border-gray-100 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Основная строка: 3 колонки — лево | центр (лого) | право */}
        <div className="grid grid-cols-3 items-center h-16">

          {/* Лево: поиск на десктопе / иконка условий на мобиле */}
          <div className="flex items-center">
            {/* Иконка "Условия" — только на мобиле */}
            <Link
              href="/commercial"
              className="flex sm:hidden min-h-[44px] min-w-[44px] items-center justify-center rounded-2xl text-gray-600 hover:bg-gray-100 transition-colors"
              aria-label="Условия сотрудничества"
            >
              <Handshake className="h-5 w-5" aria-hidden />
            </Link>
            {/* Поиск — только на десктопе */}
            <div className="hidden sm:block w-full max-w-xs lg:max-w-sm">
              <label htmlFor="header-search" className="sr-only">Поиск по каталогу</label>
              <div className="relative">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" aria-hidden />
                <input
                  id="header-search"
                  type="search"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Поиск..."
                  className="w-full rounded-2xl border border-gray-200 bg-gray-50/80 py-2.5 pl-10 pr-4 text-base text-gray-900 placeholder:text-gray-400 outline-none transition-colors focus:border-green-500 focus:bg-white focus:ring-2 focus:ring-green-500/20"
                  aria-label="Поиск по каталогу"
                />
              </div>
            </div>
          </div>

          {/* Центр: логотип */}
          <div className="flex justify-center">
            <Link href="/" className="shrink-0">
              <img
                src="/logo.png"
                alt="Airba Fresh"
                className="h-10 w-auto sm:h-12 object-contain"
              />
            </Link>
          </div>

          {/* Право: кнопка "Условия" на десктопе */}
          <div className="flex items-center justify-end">
            <Link
              href="/commercial"
              className="hidden sm:inline-flex min-h-[44px] items-center gap-2 rounded-2xl border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-600 shadow-sm transition-colors hover:border-green-200 hover:bg-green-50 hover:text-green-700 whitespace-nowrap"
              aria-label="Условия сотрудничества"
            >
              <Handshake className="h-4 w-4 shrink-0" aria-hidden />
              Условия сотрудничества
            </Link>
          </div>
        </div>

        {/* Строка поиска под логотипом на мобильных */}
        <div className="pb-3 sm:hidden">
          <label htmlFor="header-search-mobile" className="sr-only">Поиск по каталогу</label>
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" aria-hidden />
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
