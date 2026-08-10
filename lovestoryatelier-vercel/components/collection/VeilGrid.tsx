"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo, useState } from "react";

import { filters, type Veil } from "@/content/collection";
import { image } from "@/content/images";

import styles from "./VeilGrid.module.css";

type Props = { veils: readonly Veil[]; initialFilter?: string };

export function VeilGrid({ veils, initialFilter = "All silhouettes" }: Props) {
  const [active, setActive] = useState(initialFilter);

  const shown = useMemo(() => {
    if (active === "All silhouettes") return veils;
    return veils.filter(
      (veil) => veil.silhouette === active || veil.finish === active,
    );
  }, [veils, active]);

  const noun = shown.length === 1 ? "piece" : "pieces";

  return (
    <>
      <div className={styles.toolbar}>
        <p className="eyebrow" aria-live="polite">
          {/* Announced on change so filtering is perceivable without sight. */}
          The collection · {shown.length} {noun}
        </p>

        <div className={styles.filters} role="group" aria-label="Filter veils">
          {filters.map((filter) => (
            <button
              key={filter}
              type="button"
              className={styles.chip}
              // aria-pressed, unlike the source, actually reflects state.
              aria-pressed={active === filter}
              onClick={() => setActive(filter)}
            >
              {filter}
            </button>
          ))}
        </div>
      </div>

      <ul className={styles.grid}>
        {shown.map((veil) => {
          const img = image(veil.image);
          return (
            <li key={veil.slug} className={styles.card}>
              <Link
                href={`/collection/${veil.slug}`}
                className={styles.cardLink}
              >
                <span className={styles.frame}>
                  <Image
                    src={img.src}
                    alt={img.alt}
                    fill
                    sizes="(max-width: 640px) 90vw, (max-width: 1080px) 45vw, 30vw"
                    placeholder="blur"
                    blurDataURL={img.blurDataURL}
                    style={{ objectFit: "cover", objectPosition: veil.focal }}
                  />
                  <span className={styles.tag}>{veil.silhouette}</span>
                </span>

                <span className={styles.body}>
                  <span className={styles.name}>{veil.name}</span>
                  <span className={styles.spec}>
                    {veil.silhouette} · {veil.lengthCm} cm
                  </span>
                  <span className={styles.edge}>
                    Finished with <em>{veil.edge}</em>
                  </span>
                  {/* "Made to order" everywhere — the source carries no prices
                      and none are invented here. */}
                  <span className={styles.mto}>Made to order</span>
                </span>
              </Link>
            </li>
          );
        })}
      </ul>

      {shown.length === 0 ? (
        <p className={styles.empty}>
          No veils match that filter yet — every silhouette can still be drafted
          to your gown.
        </p>
      ) : null}
    </>
  );
}
