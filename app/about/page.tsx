import type { Metadata } from "next";
import Image from "next/image";

import { about } from "@/content/pages";
import { image } from "@/content/images";

import styles from "../shared.module.css";

export const metadata: Metadata = {
  title: "About the atelier",
  description:
    "Jesse founded Love Story Atelier in Brisbane, making heirloom-quality " +
    "bridal veils by hand from European tulle.",
};

export default function AboutPage() {
  const portrait = image(about.portrait);
  return (
    <>
      <section className={styles.head}>
        <p className="eyebrow">{about.eyebrow}</p>
        <h1 className={styles.title}>
          {about.title} <em>{about.titleItalic}</em>.
        </h1>
      </section>

      <section className={styles.section}>
        <div className={styles.split}>
          <figure className={styles.portrait} style={{ margin: 0 }}>
            <Image
              src={portrait.src}
              alt={portrait.alt}
              fill
              sizes="(max-width: 880px) 100vw, 40vw"
              placeholder="blur"
              blurDataURL={portrait.blurDataURL}
              className={styles.cover}
            />
          </figure>
          <div>
            {about.letter.map((p) => (
              <p key={p.slice(0, 24)} className={styles.prose}>{p}</p>
            ))}
            <p className={styles.sig}>{about.signature}</p>
            <p className={styles.sigRole}>{about.signatureRole}</p>
          </div>
        </div>
      </section>

      <section className={styles.tinted}>
        <div className={styles.section}>
          <p className="eyebrow">{about.values.eyebrow}</p>
          <h2 className={styles.title}>
            {about.values.title} <em>{about.values.titleItalic}</em>
          </h2>
          <ul className={styles.cards}>
            {about.values.items.map((item) => (
              <li key={item.label} className={styles.card}>
                <p className={styles.cardLabel}>{item.label}</p>
                <h3 className={styles.cardTitle}>{item.title}</h3>
                <p className={styles.cardBody}>{item.body}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>
    </>
  );
}
