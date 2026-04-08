"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";

interface Slide {
  id: number;
  image: string;
  title: string;
}

const slides: Slide[] = [
  { id: 1, image: "/slides/slide1.png", title: "Каталог собственной продукции" },
  { id: 2, image: "/slides/slide3.png", title: "Почему выбирают Airba Fresh" },
  { id: 3, image: "/slides/slide2.png", title: "Нам доверяют" },
  { id: 4, image: "/slides/slide5.png", title: "3 направления вкуса" },
  { id: 5, image: "/slides/slide4.png", title: "Halal сертификат" },
];

const AUTOPLAY_INTERVAL = 5000;

export default function HeroSlider() {
  const [current, setCurrent] = useState(0);
  const [direction, setDirection] = useState<1 | -1>(1);
  const [isPaused, setIsPaused] = useState(false);
  const [lightbox, setLightbox] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const goTo = useCallback(
    (index: number, dir?: 1 | -1) => {
      const next = (index + slides.length) % slides.length;
      setDirection(dir ?? (next > current ? 1 : -1));
      setCurrent(next);
    },
    [current]
  );

  const goNext = useCallback(() => goTo(current + 1, 1), [current, goTo]);
  const goPrev = useCallback(() => goTo(current - 1, -1), [current, goTo]);

  useEffect(() => {
    if (isPaused || lightbox) return;
    timerRef.current = setInterval(goNext, AUTOPLAY_INTERVAL);
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [goNext, isPaused, lightbox]);

  // Close lightbox on Escape
  useEffect(() => {
    if (!lightbox) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setLightbox(false);
      if (e.key === "ArrowLeft") goTo(current - 1, -1);
      if (e.key === "ArrowRight") goTo(current + 1, 1);
    }
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [lightbox, current, goTo]);

  const slideVariants = {
    enter: (dir: number) => ({ x: dir > 0 ? "100%" : "-100%", opacity: 0 }),
    center: { x: 0, opacity: 1, transition: { duration: 0.55, ease: [0.32, 0.72, 0, 1] } },
    exit: (dir: number) => ({ x: dir > 0 ? "-100%" : "100%", opacity: 0, transition: { duration: 0.45, ease: [0.32, 0.72, 0, 1] } }),
  };

  return (
    <>
      <section
        className="relative w-full overflow-hidden rounded-3xl"
        style={{ height: "clamp(340px, 56vw, 660px)" }}
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
        aria-label="Hero слайдер"
      >
        {/* Blurred background */}
        <AnimatePresence initial={false}>
          <motion.div
            key={`bg-${current}`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1, transition: { duration: 0.8 } }}
            exit={{ opacity: 0, transition: { duration: 0.6 } }}
            className="absolute inset-0"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={slides[current].image}
              alt=""
              aria-hidden
              className="h-full w-full object-cover scale-110"
              style={{ filter: "blur(28px) brightness(0.55) saturate(1.3)" }}
            />
            <div className="absolute inset-0 bg-gradient-to-br from-green-900/50 via-green-800/30 to-emerald-900/50" />
          </motion.div>
        </AnimatePresence>

        {/* Slide */}
        <AnimatePresence initial={false} custom={direction}>
          <motion.div
            key={current}
            custom={direction}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            className="absolute inset-0 flex items-center justify-center px-16 sm:px-20"
          >
            <button
              type="button"
              onClick={() => setLightbox(true)}
              aria-label="Открыть на весь экран"
              className="relative h-[88%] max-w-sm w-full drop-shadow-2xl focus:outline-none focus-visible:ring-4 focus-visible:ring-green-400 rounded-2xl cursor-zoom-in group"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={slides[current].image}
                alt={slides[current].title}
                className="h-full w-full object-contain rounded-2xl transition-transform duration-300 group-hover:scale-[1.02]"
                loading={current === 0 ? "eager" : "lazy"}
              />
              {/* Zoom hint */}
              <span className="absolute bottom-3 right-3 flex items-center gap-1 rounded-full bg-black/50 px-2.5 py-1 text-[11px] font-medium text-white opacity-0 group-hover:opacity-100 transition-opacity">
                <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0zm0 0l4 4" /></svg>
                Увеличить
              </span>
            </button>
          </motion.div>
        </AnimatePresence>

        {/* Prev */}
        <button
          type="button"
          onClick={goPrev}
          aria-label="Предыдущий слайд"
          className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 z-10 flex h-10 w-10 sm:h-11 sm:w-11 items-center justify-center rounded-full bg-white/15 backdrop-blur-sm border border-white/25 text-white transition-all hover:bg-green-500 hover:border-green-500 focus:outline-none focus-visible:ring-2 focus-visible:ring-green-400"
        >
          <ChevronLeft className="h-5 w-5" />
        </button>

        {/* Next */}
        <button
          type="button"
          onClick={goNext}
          aria-label="Следующий слайд"
          className="absolute right-3 sm:right-4 top-1/2 -translate-y-1/2 z-10 flex h-10 w-10 sm:h-11 sm:w-11 items-center justify-center rounded-full bg-white/15 backdrop-blur-sm border border-white/25 text-white transition-all hover:bg-green-500 hover:border-green-500 focus:outline-none focus-visible:ring-2 focus-visible:ring-green-400"
        >
          <ChevronRight className="h-5 w-5" />
        </button>

        {/* Dots */}
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-10 flex items-center gap-1.5">
          {slides.map((slide, i) => (
            <button
              key={slide.id}
              type="button"
              aria-label={`Слайд ${i + 1}`}
              aria-current={i === current ? "true" : undefined}
              onClick={() => goTo(i)}
              className="relative h-1.5 rounded-full transition-all duration-300 focus:outline-none"
              style={{ width: i === current ? "28px" : "8px" }}
            >
              <span className={`absolute inset-0 rounded-full transition-colors duration-300 ${i === current ? "bg-green-400" : "bg-white/40 hover:bg-white/70"}`} />
            </button>
          ))}
        </div>

        {/* Progress bar */}
        {!isPaused && !lightbox && (
          <motion.div
            key={`progress-${current}`}
            className="absolute bottom-0 left-0 h-0.5 bg-green-400/70 z-10"
            initial={{ width: "0%" }}
            animate={{ width: "100%" }}
            transition={{ duration: AUTOPLAY_INTERVAL / 1000, ease: "linear" }}
          />
        )}
      </section>

      {/* Lightbox */}
      <AnimatePresence>
        {lightbox && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4 sm:p-8"
            onClick={() => setLightbox(false)}
          >
            {/* Close */}
            <button
              type="button"
              onClick={() => setLightbox(false)}
              aria-label="Закрыть"
              className="absolute top-4 right-4 flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20 transition"
            >
              <X className="h-6 w-6" />
            </button>

            {/* Prev */}
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); goTo(current - 1, -1); }}
              aria-label="Предыдущее фото"
              className="absolute left-3 sm:left-6 flex h-11 w-11 items-center justify-center rounded-full bg-white/10 text-white hover:bg-green-500 transition"
            >
              <ChevronLeft className="h-6 w-6" />
            </button>

            {/* Image */}
            <motion.img
              key={current}
              src={slides[current].image}
              alt={slides[current].title}
              initial={{ scale: 0.92, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.92, opacity: 0 }}
              transition={{ duration: 0.25 }}
              className="max-h-full max-w-full object-contain rounded-2xl shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            />

            {/* Next */}
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); goTo(current + 1, 1); }}
              aria-label="Следующее фото"
              className="absolute right-3 sm:right-6 flex h-11 w-11 items-center justify-center rounded-full bg-white/10 text-white hover:bg-green-500 transition"
            >
              <ChevronRight className="h-6 w-6" />
            </button>

            {/* Counter */}
            <span className="absolute bottom-5 left-1/2 -translate-x-1/2 rounded-full bg-white/10 px-4 py-1.5 text-sm text-white font-medium">
              {current + 1} / {slides.length}
            </span>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

function ChevronLeft({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
      <path d="M15 18l-6-6 6-6" />
    </svg>
  );
}

function ChevronRight({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 18l6-6-6-6" />
    </svg>
  );
}
