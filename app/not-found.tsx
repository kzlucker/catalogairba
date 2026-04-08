import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex min-h-screen items-center justify-center px-4 bg-gray-50">
      <div className="text-center max-w-md">
        <div className="mb-4 text-8xl font-bold text-gray-200 select-none">404</div>
        <h1 className="text-2xl font-bold text-gray-900 mb-3">
          Страница не найдена
        </h1>
        <p className="text-gray-500 mb-8">
          Такой страницы не существует или она была удалена.
        </p>
        <Link
          href="/"
          className="inline-flex items-center justify-center rounded-2xl bg-green-500 px-6 py-3 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-green-600"
        >
          На главную
        </Link>
      </div>
    </div>
  );
}
