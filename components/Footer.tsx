import Link from "next/link";
import { Instagram, Send, CreditCard } from "lucide-react";

const CATEGORY_LINKS = [
  { label: "Овощи", href: "#" },
  { label: "Фрукты", href: "#" },
  { label: "Молочные продукты", href: "#" },
  { label: "Мясо", href: "#" },
] as const;

const HELP_LINKS = [
  { label: "Коммерческие условия", href: "/commercial" },
  { label: "Доставка и оплата", href: "/commercial" },
  { label: "Контакты", href: "/commercial#contacts" },
] as const;

const linkClass =
  "text-sm text-gray-400 transition-colors hover:text-green-400 focus:outline-none focus-visible:text-green-400";

export default function Footer() {
  return (
    <footer className="mt-auto border-t border-gray-800 bg-gray-900 text-gray-300">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-4 lg:gap-8">
          {/* О компании */}
          <div className="space-y-4">
            <Link
              href="/"
              className="inline-block text-xl font-bold text-green-500 transition-colors hover:text-green-400"
            >
              Airba Fresh
            </Link>
            <p className="max-w-xs text-sm leading-relaxed text-gray-400">
              Доставка свежих продуктов прямо к вашему столу.
            </p>
          </div>

          {/* Категории */}
          <div>
            <h3 className="mb-4 text-sm font-semibold uppercase tracking-wide text-gray-200">
              Категории
            </h3>
            <ul className="space-y-3">
              {CATEGORY_LINKS.map(({ label, href }) => (
                <li key={label}>
                  <a href={href} className={linkClass}>
                    {label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Помощь */}
          <div>
            <h3 className="mb-4 text-sm font-semibold uppercase tracking-wide text-gray-200">
              Помощь
            </h3>
            <ul className="space-y-3">
              {HELP_LINKS.map(({ label, href }) => (
                <li key={label}>
                  <a href={href} className={linkClass}>
                    {label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Контакты */}
          <div>
            <h3 className="mb-4 text-sm font-semibold uppercase tracking-wide text-gray-200">
              Контакты
            </h3>
            <ul className="space-y-3 text-sm text-gray-400">
              <li>
                <a
                  href="tel:+77001234567"
                  className="transition-colors hover:text-green-400"
                >
                  +7 (700) 123-45-67
                </a>
              </li>
              <li>
                <a
                  href="mailto:hello@airbafresh.kz"
                  className="transition-colors hover:text-green-400"
                >
                  hello@airbafresh.kz
                </a>
              </li>
              <li className="flex items-center gap-4 pt-2">
                <a
                  href="#"
                  className="text-gray-400 transition-colors hover:text-green-400"
                  aria-label="Instagram"
                >
                  <Instagram className="h-5 w-5" aria-hidden />
                </a>
                <a
                  href="#"
                  className="text-gray-400 transition-colors hover:text-green-400"
                  aria-label="Telegram"
                >
                  <Send className="h-5 w-5" aria-hidden />
                </a>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Нижняя полоса */}
      <div className="border-t border-gray-800 bg-gray-950/50">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-3 px-4 py-4 sm:flex-row sm:px-6 lg:px-8">
          <p className="text-center text-xs text-gray-500 sm:text-left">
            © 2024–2026 Airba Fresh
          </p>
          <div
            className="flex items-center gap-4 text-xs text-gray-500"
            aria-label="Способы оплаты"
          >
            <span className="flex items-center gap-1.5 font-medium tracking-wide text-gray-400">
              <CreditCard className="h-4 w-4 shrink-0" aria-hidden />
              VISA
            </span>
            <span className="flex items-center gap-1.5 font-medium tracking-wide text-gray-400">
              <CreditCard className="h-4 w-4 shrink-0" aria-hidden />
              MasterCard
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
