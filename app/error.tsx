"use client";

import { useEffect } from "react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex min-h-screen items-center justify-center px-4 bg-gray-50">
      <div className="text-center max-w-md">
        <div className="mb-6 text-6xl font-bold text-gray-200">!</div>
        <h2 className="text-2xl font-bold text-gray-900 mb-3">
          Что-то пошло не так
        </h2>
        <p className="text-gray-500 mb-8">
          Произошла непредвиденная ошибка. Попробуйте обновить страницу.
        </p>
        <button
          type="button"
          onClick={reset}
          className="inline-flex items-center justify-center rounded-2xl bg-green-500 px-6 py-3 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-green-600"
        >
          Попробовать снова
        </button>
      </div>
    </div>
  );
}
