import Link from "next/link";
import { Instagram, CreditCard } from "lucide-react";

const CATEGORY_LINKS = [
  { label: "Готовая еда", href: "/?category=Готовая%20еда" },
  { label: "Напитки", href: "/?category=Напитки" },
  { label: "Салаты", href: "/?category=Салаты" },
  { label: "Выпечка", href: "/?category=Выпечка" },
  { label: "Десерты", href: "/?category=Десерты" },
  { label: "Сендвичи", href: "/?category=Сендвичи" },
] as const;

const HELP_LINKS = [
  { label: "Коммерческие условия", href: "/commercial" },
  { label: "Доставка и оплата", href: "/commercial" },
  { label: "Контакты", href: "/commercial#contacts" },
] as const;

const linkClass =
  "inline-block py-1.5 text-sm text-gray-400 transition-colors hover:text-green-400 focus:outline-none focus-visible:text-green-400";

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
                  href="tel:+87761514972"
                  className="transition-colors hover:text-green-400"
                >
                  8 (776) 151-49-72
                </a>
              </li>
              <li>
                <a
                  href="mailto:amir.k@airbafresh.kz"
                  className="transition-colors hover:text-green-400"
                >
                  amir.k@airbafresh.kz
                </a>
              </li>
              <li className="flex items-center gap-3 pt-2">
                <a
                  href="https://www.instagram.com/airbafresh/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gray-800 text-gray-400 transition-colors hover:bg-gray-700 hover:text-green-400"
                  aria-label="Instagram"
                >
                  <Instagram className="h-5 w-5" aria-hidden />
                </a>
                <a
                  href="https://wa.me/87761514972"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gray-800 text-gray-400 transition-colors hover:bg-gray-700 hover:text-green-400"
                  aria-label="WhatsApp"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5 shrink-0"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                    aria-hidden
                  >
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                  </svg>
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
