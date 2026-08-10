import type { Metadata } from "next";
import Link from "next/link";

import { VeilGrid } from "@/components/collection/VeilGrid";
import { SilhouetteGuide } from "@/components/collection/SilhouetteGuide";
import { collectionIntro, customiseRail, veils } from "@/content/collection";

import styles from "./page.module.css";

export const metadata: Metadata = {
  title: "The collection — wedding veils made to order",
  description:
    "Cathedral, chapel, fingertip and mantilla veils, handmade in Brisbane " +
    "from European tulle. Each silhouette is drafted to your gown.",
};

export default function CollectionPage() {
  return (
    <>
      <section className={styles.head}>
        <p className="eyebrow">{collectionIntro.eyebrow}</p>
        <h1 className={styles.title}>
          Every silhouette, <em>drafted to your gown</em>.
        </h1>
        <p className={styles.note}>{collectionIntro.note}</p>
      </section>

      <section className={styles.section}>
        <VeilGrid veils={veils} />
      </section>

      <SilhouetteGuide />

      <section className={styles.section}>
        <div className={styles.rail}>
          <div>
            <p className="eyebrow">{customiseRail.eyebrow}</p>
            <h2 className={styles.railTitle}>
              {customiseRail.title}{" "}
              <em>{customiseRail.titleItalic}</em>.
            </h2>
            <p className={styles.railBody}>{customiseRail.body}</p>
          </div>
          <Link href={customiseRail.cta.href} className={styles.railCta}>
            {customiseRail.cta.label}
          </Link>
        </div>
      </section>
    </>
  );
}
