import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";

import { EnquiryForm } from "@/components/forms/EnquiryForm";
import { relatedVeils, veilBySlug, veils } from "@/content/collection";
import { image } from "@/content/images";

import styles from "./page.module.css";

type Params = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return veils.map((veil) => ({ slug: veil.slug }));
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug } = await params;
  const veil = veilBySlug(slug);
  if (!veil) return { title: "Veil not found" };

  return {
    title: `${veil.name} — made to order`,
    description:
      `A ${veil.silhouette.toLowerCase()} veil, ${veil.lengthCm} cm, ` +
      `finished with ${veil.edge}. Made to order in Brisbane from European tulle.`,
  };
}

export default async function VeilPage({ params }: Params) {
  const { slug } = await params;
  const veil = veilBySlug(slug);
  if (!veil) notFound();

  const img = image(veil.image);
  const related = relatedVeils(veil);

  // Product structured data, limited to what is actually true: there is no
  // price, so no `offers` block is emitted rather than inventing one.
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: veil.name,
    image: img.src,
    description: `A ${veil.silhouette.toLowerCase()} veil, ${veil.lengthCm} cm, finished with ${veil.edge}.`,
    brand: { "@type": "Brand", name: "Love Story Atelier" },
    material: "European silk tulle",
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <nav className={styles.crumbs} aria-label="Breadcrumb">
        <Link href="/collection">The collection</Link>
        <span aria-hidden="true"> · </span>
        <span aria-current="page">{veil.name}</span>
      </nav>

      <article className={styles.layout}>
        <figure className={styles.figure}>
          <Image
            src={img.src}
            alt={img.alt}
            fill
            sizes="(max-width: 900px) 100vw, 48vw"
            placeholder="blur"
            blurDataURL={img.blurDataURL}
            priority
            style={{ objectFit: "cover", objectPosition: veil.focal }}
          />
        </figure>

        <div className={styles.detail}>
          <p className="eyebrow">{veil.silhouette}</p>
          <h1 className={styles.title}>{veil.name}</h1>

          <dl className={styles.specs}>
            <div><dt>Silhouette</dt><dd>{veil.silhouette}</dd></div>
            <div><dt>Length</dt><dd>{veil.lengthCm} cm</dd></div>
            <div><dt>Edge</dt><dd>{veil.edge}</dd></div>
            <div><dt>Material</dt><dd>European silk tulle</dd></div>
          </dl>

          <p className={styles.mto}>
            Made to order — cut, draped, hemmed and finished by hand in the
            Brisbane studio, and drafted to your gown. Length, edge and any
            embroidery are chosen with you.
          </p>

          <p className={styles.cta}>
            <Link href="#enquire" className={styles.primary}>
              Enquire about this veil
            </Link>
            <Link href="/custom" className={styles.ghost}>
              Customise this silhouette
            </Link>
          </p>
        </div>
      </article>

      {related.length > 0 && (
        <section className={styles.related}>
          <h2 className={styles.relatedTitle}>Related silhouettes</h2>
          <ul className={styles.relatedGrid}>
            {related.map((other) => {
              const otherImg = image(other.image);
              return (
                <li key={other.slug}>
                  <Link href={`/collection/${other.slug}`} className={styles.relatedCard}>
                    <span className={styles.relatedFrame}>
                      <Image
                        src={otherImg.src}
                        alt={otherImg.alt}
                        fill
                        sizes="(max-width: 760px) 45vw, 25vw"
                        placeholder="blur"
                        blurDataURL={otherImg.blurDataURL}
                        style={{ objectFit: "cover", objectPosition: other.focal }}
                      />
                    </span>
                    <span className={styles.relatedName}>{other.name}</span>
                    <span className={styles.relatedSpec}>
                      {other.silhouette} · {other.lengthCm} cm
                    </span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </section>
      )}

      <section className={styles.enquire} id="enquire">
        <div className={styles.enquireInner}>
          <p className="eyebrow">Enquire</p>
          <h2 className={styles.enquireTitle}>
            About the <em>{veil.name}</em>
          </h2>
          <p className={styles.enquireNote}>
            This enquiry is already tagged with the {veil.name}. Tell us about
            your gown and we&rsquo;ll reply with a sketch and quote.
          </p>
          <div style={{ marginTop: "clamp(2rem,5vh,3rem)" }}>
            {/* Pre-fills the form with the veil being viewed. */}
            <EnquiryForm veilSlug={veil.slug} />
          </div>
        </div>
      </section>
    </>
  );
}
