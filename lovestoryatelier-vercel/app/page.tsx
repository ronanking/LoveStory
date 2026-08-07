import { VeilStage } from "@/components/three/VeilStage";

import styles from "./page.module.css";

const PALETTE = [
  { name: "Cream", token: "--cream", hex: "#f7f4ed" },
  { name: "Soft cream", token: "--soft-cream", hex: "#fcfbf8" },
  { name: "Soft champagne", token: "--soft-champagne", hex: "#e8dcc4" },
  { name: "Champagne", token: "--champagne", hex: "#c9ac82" },
  { name: "Blush", token: "--blush", hex: "#d8b6a6" },
  { name: "Sage", token: "--sage", hex: "#a3ad9b" },
  { name: "Charcoal", token: "--charcoal", hex: "#1c1c1c" },
] as const;

const READY = [
  "Blender silk-tulle veil — 52 KB Draco GLB, 208 KB poster, 536 B placeholder",
  "Reproducible generation script with build-time asset assertions",
  "Brand tokens, editorial type scale, Cormorant + Jakarta via next/font",
  "WebGL capability gating, poster fallback, offscreen render pausing",
  "Next.js 16 App Router, TypeScript strict, React Server Components",
] as const;

const AWAITING = [
  "All page copy — homepage, collection, custom, about, contact",
  "The veil catalogue: silhouettes, lengths, edges, materials",
  "Photography — every image on the site",
  "The bespoke enquiry form's exact fields and wording",
  "Testimonials, founder story, FAQ",
] as const;

export default function HomePage() {
  return (
    <main>
      <section className={styles.hero}>
        <VeilStage />

        <div className={styles.heroInner}>
          <p className={styles.eyebrowLight}>Brisbane</p>
          <h1 className={styles.wordmark}>
            Love Story
            <span className={styles.wordmarkLine}>Atelier</span>
          </h1>
          <p className={styles.heroNote}>
            The veil behind this type is a real Blender simulation — a cathedral
            panel gathered onto a comb, draped under cloth physics, exported at
            52&nbsp;KB.
          </p>
        </div>

        <div className={styles.scrollHint} aria-hidden="true">
          <span className={styles.scrollLine} />
        </div>
      </section>

      <section className={styles.section}>
        <div className={styles.sectionHead}>
          <p className="eyebrow">Foundation</p>
          <h2 className={styles.sectionTitle}>
            The design system is built.
            <em className={styles.em}> The content is not yet here.</em>
          </h2>
          <p className={styles.lede}>
            This page is deliberately not a mock homepage. Writing invented
            bridal copy or dropping in stock photography would misrepresent a
            real business, so what follows is the foundation as it actually
            stands — the palette, the type, and the 3D motif, all production
            code.
          </p>
        </div>

        <div className={styles.palette}>
          {PALETTE.map((swatch) => (
            <figure key={swatch.token} className={styles.swatch}>
              <div
                className={styles.chip}
                style={{ background: `var(${swatch.token})` }}
              />
              <figcaption>
                <span className={styles.swatchName}>{swatch.name}</span>
                <span className={styles.swatchHex}>{swatch.hex}</span>
              </figcaption>
            </figure>
          ))}
        </div>
      </section>

      <section className={styles.section}>
        <div className={styles.typeSpecimen}>
          <p className="eyebrow">Typography</p>
          <p className={styles.specimenDisplay}>Handmade in Brisbane</p>
          <p className={styles.specimenItalic}>from European tulle</p>
          <p className={styles.specimenBody}>
            Cormorant Garamond carries the display voice; Plus Jakarta Sans
            handles body and interface. Both are self-hosted by next/font, so
            there is no external request and no layout shift when they load.
          </p>
        </div>
      </section>

      <section className={styles.section}>
        <div className={styles.status}>
          <div className={styles.statusColumn}>
            <p className="eyebrow">Ready</p>
            <ul className={styles.list}>
              {READY.map((item) => (
                <li key={item} className={styles.listItem}>
                  {item}
                </li>
              ))}
            </ul>
          </div>
          <div className={styles.statusColumn}>
            <p className="eyebrow">Awaiting source material</p>
            <ul className={styles.list}>
              {AWAITING.map((item) => (
                <li key={item} className={`${styles.listItem} ${styles.pending}`}>
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      <footer className={styles.footer}>
        <p className={styles.footerNote}>
          Love Story Atelier — Vercel rebuild, in progress.
        </p>
      </footer>
    </main>
  );
}
