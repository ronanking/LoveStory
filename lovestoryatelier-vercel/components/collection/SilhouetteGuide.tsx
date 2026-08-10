"use client";

import Image from "next/image";
import { useId, useRef, useState } from "react";

import { silhouetteGuide } from "@/content/collection";
import { image } from "@/content/images";

import styles from "./SilhouetteGuide.module.css";

const { items } = silhouetteGuide;

/**
 * The veil length guide, rebuilt as a proper tablist.
 *
 * The source carousel had arrows and dots but no keyboard path and no
 * relationship between the dots and the panels. This uses the WAI-ARIA tabs
 * pattern: arrow keys move between tabs, Home/End jump to the ends, and each
 * panel is owned by its tab.
 */
export function SilhouetteGuide() {
  const [index, setIndex] = useState(0);
  const baseId = useId();
  const tabs = useRef<(HTMLButtonElement | null)[]>([]);

  const select = (next: number) => {
    const wrapped = (next + items.length) % items.length;
    setIndex(wrapped);
    tabs.current[wrapped]?.focus();
  };

  const onKeyDown = (event: React.KeyboardEvent) => {
    switch (event.key) {
      case "ArrowRight":
        event.preventDefault();
        select(index + 1);
        break;
      case "ArrowLeft":
        event.preventDefault();
        select(index - 1);
        break;
      case "Home":
        event.preventDefault();
        select(0);
        break;
      case "End":
        event.preventDefault();
        select(items.length - 1);
        break;
      default:
        break;
    }
  };

  // Touch: horizontal swipe moves between silhouettes.
  const touchX = useRef<number | null>(null);
  const onTouchStart = (event: React.TouchEvent) => {
    touchX.current = event.touches[0]?.clientX ?? null;
  };
  const onTouchEnd = (event: React.TouchEvent) => {
    const start = touchX.current;
    const end = event.changedTouches[0]?.clientX;
    touchX.current = null;
    if (start == null || end == null) return;
    const delta = end - start;
    if (Math.abs(delta) < 45) return;
    setIndex((i) => (i + (delta < 0 ? 1 : -1) + items.length) % items.length);
  };

  const current = items[index];
  if (!current) return null;
  const img = image(current.image);

  return (
    <section className={styles.guide} aria-labelledby={`${baseId}-heading`}>
      <div className={styles.inner}>
        <div className={styles.head}>
          <p className="eyebrow">{silhouetteGuide.eyebrow}</p>
          <h2 id={`${baseId}-heading`} className={styles.title}>
            {silhouetteGuide.title}{" "}
            <em>{silhouetteGuide.titleItalic}</em>
          </h2>
          <p className={styles.intro}>{silhouetteGuide.intro}</p>
        </div>

        <div
          className={styles.tablist}
          role="tablist"
          aria-label="Veil lengths"
          onKeyDown={onKeyDown}
        >
          {items.map((item, i) => (
            <button
              key={item.name}
              ref={(node) => {
                tabs.current[i] = node;
              }}
              type="button"
              role="tab"
              id={`${baseId}-tab-${i}`}
              aria-selected={i === index}
              aria-controls={`${baseId}-panel-${i}`}
              // Roving tabindex: one stop for the whole group.
              tabIndex={i === index ? 0 : -1}
              className={styles.tab}
              onClick={() => setIndex(i)}
            >
              {item.name}
            </button>
          ))}
        </div>

        <div
          className={styles.stage}
          onTouchStart={onTouchStart}
          onTouchEnd={onTouchEnd}
        >
          <div className={styles.photo}>
            <Image
              key={img.src}
              src={img.src}
              alt={img.alt}
              fill
              sizes="(max-width: 860px) 100vw, 42vw"
              placeholder="blur"
              blurDataURL={img.blurDataURL}
              className={styles.image}
            />
          </div>

          <div
            role="tabpanel"
            id={`${baseId}-panel-${index}`}
            aria-labelledby={`${baseId}-tab-${index}`}
            className={styles.panel}
            tabIndex={0}
          >
            <div
              className={styles.bar}
              role="img"
              aria-label={`${current.name} is approximately ${current.cm} centimetres`}
            >
              <span
                className={styles.barFill}
                style={{ width: `${current.barPercent}%` }}
              />
            </div>
            <h3 className={styles.name}>{current.name}</h3>
            <p className={styles.cm}>~ {current.cm} cm</p>
            <p className={styles.body}>{current.body}</p>
          </div>
        </div>
      </div>
    </section>
  );
}
