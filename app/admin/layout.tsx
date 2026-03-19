"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Package, FolderTree } from "lucide-react";
import { isAdminLoginPath } from "@/lib/admin-paths";

const nav = [
  { href: "/admin", label: "Товары", icon: Package },
  { href: "/admin/categories", label: "Категории", icon: FolderTree },
] as const;

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  if (isAdminLoginPath(pathname)) {
    return <>{children}</>;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <aside className="fixed inset-y-0 left-0 z-30 flex w-64 flex-col border-r border-gray-200 bg-white shadow-sm">
        <div className="border-b border-gray-100 px-6 py-5">
          <Link
            href="/admin"
            className="text-xl font-bold text-green-600 transition-colors hover:text-green-700"
          >
            Airba Admin
          </Link>
          <p className="mt-1 text-xs text-gray-500">Панель управления</p>
        </div>
        <nav className="flex flex-1 flex-col gap-1 p-4" aria-label="Админ-меню">
          {nav.map(({ href, label, icon: Icon }) => {
            const active =
              href === "/admin"
                ? pathname === "/admin" ||
                  pathname === "/admin/" ||
                  pathname.startsWith("/admin/add")
                : pathname === href || pathname.startsWith(`${href}/`);
            return (
              <Link
                key={href}
                href={href}
                className={`flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium transition-colors ${
                  active
                    ? "bg-green-500 text-white shadow-sm"
                    : "text-gray-700 hover:bg-gray-100"
                }`}
              >
                <Icon className="h-5 w-5 shrink-0" aria-hidden />
                {label}
              </Link>
            );
          })}
        </nav>
        <div className="border-t border-gray-100 p-4">
          <Link
            href="/"
            className="text-sm text-gray-500 transition-colors hover:text-green-600"
          >
            ← В каталог
          </Link>
        </div>
      </aside>

      <div className="pl-64">
        <div className="min-h-screen">{children}</div>
      </div>
    </div>
  );
}
