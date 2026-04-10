import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export const metadata = {
  title: "Стать партнёром — Airba Fresh",
  description: "Готовые решения для вашего бизнеса. Условия сотрудничества с Airba Fresh.",
};

const benefits = [
  {
    emoji: "⚡️",
    title: "Только хиты продаж",
    text: "Мы не нагружаем ваши полки неликвидом. В ассортимент входят только позиции с высокой оборачиваемостью, которые гарантированно продаются за 1–2 дня.",
  },
  {
    emoji: "🥗",
    title: "Ассортимент 80+ позиций",
    text: "От легендарных сэндвичей Кацу и Терияки до свежих салатов, завтраков и горячих обедов.",
  },
  {
    emoji: "🏭",
    title: "Мощное производство",
    text: "Наша фабрика готова не только к бесперебойным поставкам, но и к разработке эксклюзивных позиций специально под ваш бренд или запрос.",
  },
  {
    emoji: "🚚",
    title: "Ежедневный сервис",
    text: "Доставляем свежую продукцию 7 дней в неделю без праздников и выходных.",
  },
];

const returnTable = [
  { range: "До 15 000 ₸", limit: "3% от суммы" },
  { range: "От 15 000 до 25 000 ₸", limit: "5% от суммы" },
  { range: "От 25 000 до 40 000 ₸", limit: "7% от суммы" },
  { range: "Свыше 40 000 ₸", limit: "Индивидуальные условия" },
];

const marketing = [
  {
    num: "1",
    title: "Брендирование «под ключ»",
    text: "Мы бесплатно оформим торговый уголок (шелфтокеры, наклейки, POS-материалы), чтобы выделить продукт и привлечь трафик.",
  },
  {
    num: "2",
    title: "Бонусная система",
    text: "Прогрессивная шкала вознаграждений для активных партнёров.",
  },
  {
    num: "3",
    title: "Мотивация персонала",
    text: "Специальные программы для ваших сотрудников (кассиров и администраторов), которые стимулируют продажи.",
  },
];

export default function CommercialPage() {
  return (
    <main className="min-h-screen bg-gray-50">
      {/* Hero */}
      <div className="bg-gradient-to-br from-green-700 to-emerald-600 text-white">
        <div className="mx-auto max-w-4xl px-4 py-14 sm:px-6 sm:py-20 lg:px-8">
          <Link
            href="/"
            className="mb-8 inline-flex min-h-[44px] items-center gap-2 text-sm font-medium text-green-100 transition-colors hover:text-white"
          >
            <ArrowLeft className="h-4 w-4" />
            На главную
          </Link>
          <p className="mb-3 text-sm font-semibold uppercase tracking-widest text-green-200">
            Партнёрская программа
          </p>
          <h1 className="text-3xl font-bold leading-tight sm:text-4xl lg:text-5xl">
            Станьте партнёром Airba Fresh
          </h1>
          <p className="mt-4 max-w-2xl text-lg text-green-100 leading-relaxed">
            Готовые решения для вашего бизнеса. Мы не просто поставляем еду — мы помогаем вам зарабатывать на каждом квадратном метре вашей полки.
          </p>
        </div>
      </div>

      <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8 space-y-14">

        {/* Почему выгодно */}
        <section>
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            Почему с нами выгодно работать?
          </h2>
          <div className="grid gap-4 sm:grid-cols-2">
            {benefits.map(({ emoji, title, text }) => (
              <div
                key={title}
                className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm flex gap-4"
              >
                <span className="text-2xl shrink-0 mt-0.5">{emoji}</span>
                <div>
                  <h3 className="font-bold text-gray-900 mb-1">{title}</h3>
                  <p className="text-sm text-gray-600 leading-relaxed">{text}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Логистика */}
        <section className="rounded-3xl bg-blue-50 border border-blue-100 p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Прозрачные условия логистики
          </h2>
          <p className="text-gray-600 mb-6 text-sm">
            Мы создали систему, которая позволяет выгодно работать даже небольшим точкам.
          </p>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="rounded-2xl bg-white border border-blue-100 p-5 flex items-start gap-4">
              <span className="text-3xl">🚚</span>
              <div>
                <p className="text-lg font-bold text-green-600">Бесплатно</p>
                <p className="text-sm text-gray-700 font-medium">Доставка от 20 000 ₸</p>
              </div>
            </div>
            <div className="rounded-2xl bg-white border border-blue-100 p-5 flex items-start gap-4">
              <span className="text-3xl">💸</span>
              <div>
                <p className="text-lg font-bold text-gray-900">2 000 ₸</p>
                <p className="text-sm text-gray-700 font-medium">При заказе до 20 000 ₸</p>
              </div>
            </div>
          </div>
        </section>

        {/* Система возвратов */}
        <section>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Система «Безопасный старт»
          </h2>
          <p className="text-gray-600 mb-6 text-sm leading-relaxed">
            Мы делим с вами риски. Чем выше ваш объём продаж, тем более гибкие условия по возвратам и обменам мы предоставляем.
          </p>
          <div className="overflow-x-auto rounded-3xl border border-gray-200 shadow-sm">
            <table className="w-full min-w-[400px] text-sm">
              <thead>
                <tr className="bg-green-600 text-white">
                  <th className="px-6 py-4 text-left font-semibold">Объём заказа (₸)</th>
                  <th className="px-6 py-4 text-left font-semibold">Лимит на возврат / обмен</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-100">
                {returnTable.map(({ range, limit }, i) => (
                  <tr key={range} className={i % 2 === 0 ? "bg-white" : "bg-gray-50"}>
                    <td className="px-6 py-4 font-medium text-gray-900">{range}</td>
                    <td className="px-6 py-4 text-green-700 font-semibold">{limit}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="mt-3 text-xs text-gray-500">
            * Предусмотрены гибкие условия сотрудничества в зависимости от специфики вашей локации.
          </p>
        </section>

        {/* Маркетинг */}
        <section>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Маркетинговая поддержка и бонусы
          </h2>
          <p className="text-gray-600 mb-6 text-sm">
            Мы заинтересованы в том, чтобы ваш товар уходил «с колёс», поэтому берём часть затрат на себя.
          </p>
          <div className="space-y-4">
            {marketing.map(({ num, title, text }) => (
              <div key={num} className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm flex gap-5 items-start">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-2xl bg-green-500 text-white font-bold text-base">
                  {num}
                </span>
                <div>
                  <h3 className="font-bold text-gray-900 mb-1">{title}</h3>
                  <p className="text-sm text-gray-600 leading-relaxed">{text}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* CTA */}
        <section className="rounded-3xl bg-gradient-to-r from-green-600 to-emerald-500 p-8 sm:p-10 text-white text-center">
          <p className="text-2xl font-bold mb-3">Готовы попробовать?</p>
          <p className="text-green-100 mb-7 max-w-xl mx-auto leading-relaxed">
            Закажите дегустационный сет для вашей команды сегодня, чтобы лично убедиться в качестве нашего продукта!
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <a
              href="https://wa.me/87761514972"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 rounded-2xl bg-white px-7 py-3.5 text-sm font-bold text-green-700 shadow-sm transition hover:bg-green-50"
            >
              Написать в WhatsApp
            </a>
            <Link
              href="/"
              className="inline-flex items-center justify-center gap-2 rounded-2xl border border-white/30 bg-white/10 px-7 py-3.5 text-sm font-semibold text-white transition hover:bg-white/20"
            >
              Перейти в каталог
            </Link>
          </div>
        </section>

      </div>
    </main>
  );
}
