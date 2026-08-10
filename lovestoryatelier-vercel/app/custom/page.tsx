import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";

import { custom } from "@/content/pages";
import { process } from "@/content/site";
import { image } from "@/content/images";

import styles from "../shared.module.css";

export const metadata: Metadata = {
  title: "Custom veils & bespoke embroidery",
  description:
    "Every veil can be made in any length, edge, or with custom embroidery — " +
    "drafted around your gown in our Brisbane studio.",
};

export default function CustomPage() {
  return (
    <>
      <section className={styles.head}>
        <p className="eyebrow">{custom.eyebrow}</p>
        <h1 className={styles.title}>
          {custom.title} <em>{custom.titleItalic}</em>.
        </h1>
        <p className={styles.lede}>{custom.intro}</p>
      </section>

      <section className={styles.section} id="embroidery">
        <div className={styles.split}>
          <div>
            <p className="eyebrow">{custom.embroidery.eyebrow}</p>
            <h2 className={styles.title}>
              {custom.embroidery.title}{" "}
              <em>{custom.embroidery.titleItalic}</em>
            </h2>
            <p className={styles.prose}>{custom.embroidery.body}</p>
          </div>
          <div className={styles.gallery}>
            {custom.embroidery.images.map((slug) => {
              const img = image(slug);
              return (
                <figure key={slug} className={styles.tile} style={{ margin: 0 }}>
                  <Image
                    src={img.src}
                    alt={img.alt}
                    fill
                    sizes="(max-width: 760px) 45vw, 20vw"
                    placeholder="blur"
                    blurDataURL={img.blurDataURL}
                    className={styles.cover}
                  />
                </figure>
              );
            })}
          </div>
        </div>
      </section>

      <section className={styles.tinted}>
        <div className={styles.section}>
          <p className="eyebrow">{process.eyebrow}</p>
          <h2 className={styles.title}>
            {process.title} <em>{process.titleItalic}</em>
          </h2>
          <ul className={styles.cards} style={{ gridTemplateColumns: "" }}>
            {process.steps.map((step, i) => (
              <li key={step.name} className={styles.card}>
                <p className={styles.cardLabel}>0{i + 1}</p>
                <h3 className={styles.cardTitle}>{step.name}</h3>
                <p className={styles.cardBody}>{step.body}</p>
              </li>
            ))}
          </ul>
          <p className={styles.prose} style={{ marginTop: "2rem" }}>
            <Link href="/contact#enquiry">Start your enquiry →</Link>
          </p>
        </div>
      </section>
    </>
  );
}
