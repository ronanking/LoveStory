"use client";

import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";

import type { SiteImage } from "@/content/images";

import styles from "./HeroSlideshow.module.css";

const INTERVAL = 6200;

/**
 * Hero crossfade with a restrained Ken Burns drift, carried over from the
 * source theme's slideshow. Differences from the original: it stops entirely
 * under reduced motion, it pauses when the tab is hidden, and the dots are
 * real buttons with labels rather than decorative spans.
 */
export function HeroSlideshow({ slides }: { slides: readonly SiteImage[] }) {
  const [index, setIndex] = useState(0);
  const [animate, setAnimate] = useState(false);
  const timer = useRef<ReturnType<typeof setInterval> | null>(null);

  const stop = useCallback(() => {
    if (timer.current) {
      clearInterval(timer.current);
      timer.current = null;
    }
  }, []);

  const start = useCallback(() => {
    stop();
    timer.current = setInterval(
      () => setIndex((i) => (i + 1) % slides.length),
      INTERVAL,
    );
  }, [slides.length, stop]);

  useEffect(() => {
    const query = window.matchMedia("(prefers-reduced-motion: reduce)");

    const sync = () => {
      if (query.matches) {
        setAnimate(false);
        setIndex(0);
        stop();
      } else {
        setAnimate(true);
        start();
      }
    };

    sync();
    query.addEventListener("change", sync);

    const onVisibility = () => {
      if (query.matches) return;
      if (document.hidden) stop();
      else start();
    };
    document.addEventListener("visibilitychange", onVisibility);

    return () => {
      stop();
      query.removeEventListener("change", sync);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, [start, stop]);

  return (
    <div className={styles.stage}>
      {slides.map((slide, i) => (
        <div
          key={slide.slug}
          className={styles.slide}
          data-active={i === index}
          data-animate={animate}
          // Only the visible slide is exposed; the rest are inert to AT.
          aria-hidden={i !== index}
        >
          <Image
            src={slide.src}
            alt={i === index ? slide.alt : ""}
            fill
            sizes="(max-width: 900px) 100vw, 50vw"
            placeholder="blur"
            blurDataURL={slide.blurDataURL}
            priority={i === 0}
            className={styles.image}
          />
        </div>
      ))}

      <div className={styles.dots}>
        {slides.map((slide, i) => (
          <button
            key={slide.slug}
            type="button"
            className={styles.dot}
            data-active={i === index}
            aria-label={`Show image ${i + 1} of ${slides.length}`}
            aria-current={i === index}
            onClick={() => {
              setIndex(i);
              if (animate) start();
            }}
          />
        ))}
      </div>
    </div>
  );
}
