import Image from "next/image";
import Link from "next/link";

import { HeroSlideshow } from "@/components/sections/HeroSlideshow";
import { VeilStage } from "@/components/three/VeilStage";
import {
  atelierIntro,
  categories,
  finalCta,
  hero,
  marquee,
  process,
  testimonials,
} from "@/content/site";
import { image } from "@/content/images";

import styles from "./page.module.css";

export default function HomePage() {
  return (
    <>
      {/* ───────────────────────────────────────────────────────── hero ── */}
      <section className={styles.hero}>
        <div className={styles.heroCopy}>
          <p className="eyebrow">{hero.eyebrow}</p>

          <h1 className={styles.headline}>
            {hero.headline}
            <em className={styles.headlineItalic}>{hero.headlineItalic}</em>
          </h1>

          <p className={styles.heroBody}>{hero.body}</p>

          <div className={styles.heroCtas}>
            <Link href={hero.primaryCta.href} className={styles.btnPrimary}>
              {hero.primaryCta.label}
            </Link>
            <Link href={hero.secondaryCta.href} className={styles.btnGhost}>
              {hero.secondaryCta.label}
            </Link>
          </div>

          <dl className={styles.trust}>
            {hero.trust.map((item) => (
              <div key={item.label} className={styles.trustItem}>
                <dt className={styles.trustValue}>{item.value}</dt>
                <dd className={styles.trustLabel}>{item.label}</dd>
              </div>
            ))}
          </dl>
        </div>

        <div className={styles.heroImage}>
          <HeroSlideshow slides={hero.slides.map((slug) => image(slug))} />
          <figure className={styles.cornerCard}>
            <figcaption>
              <span className={styles.cornerTag}>{hero.cornerCard.tag}</span>
              <span className={styles.cornerTitle}>
                {hero.cornerCard.title}
              </span>
              <span className={styles.cornerSub}>{hero.cornerCard.sub}</span>
            </figcaption>
          </figure>
        </div>
      </section>

      {/* ────────────────────────────────────────────────────── marquee ── */}
      <div className={styles.marquee} aria-hidden="true">
        <div className={styles.marqueeRow}>
          {[0, 1, 2].map((rep) =>
            marquee.map((phrase, i) => (
              <span key={`${rep}-${phrase}`} className={styles.marqueeItem}>
                {i % 2 === 0 ? phrase : <em>{phrase}</em>}
                <span className={styles.marqueeStar}>✦</span>
              </span>
            )),
          )}
        </div>
      </div>
      {/* The marquee is decorative motion; its words are stated in prose
          elsewhere, so it is hidden from AT rather than read three times. */}

      {/* ────────────────────────────────────────────────────── atelier ── */}
      <section className={styles.section} id="atelier">
        <div className={styles.atelierGrid}>
          <div>
            <p className="eyebrow">{atelierIntro.eyebrow}</p>
            <h2 className={styles.sectionTitle}>
              {atelierIntro.title}{" "}
              <em className={styles.em}>{atelierIntro.titleItalic}</em>{" "}
              {atelierIntro.titleEnd}
            </h2>
            {atelierIntro.body.map((paragraph) => (
              <p key={paragraph.slice(0, 32)} className={styles.prose}>
                {paragraph}
              </p>
            ))}
            <div className={styles.atelierLinks}>
              <Link href="/about" className={styles.btnGhost}>
                Meet the atelier
              </Link>
              <Link href="/custom" className={styles.textLink}>
                The bespoke process
              </Link>
            </div>
          </div>

          <div className={styles.atelierImages}>
            {atelierIntro.images.map((item, i) => {
              const img = image(item.slug);
              return (
                <figure
                  key={item.slug}
                  className={i === 0 ? styles.figureTall : styles.figure}
                >
                  <Image
                    src={img.src}
                    alt={img.alt}
                    fill
                    sizes="(max-width: 900px) 45vw, 22vw"
                    placeholder="blur"
                    blurDataURL={img.blurDataURL}
                    className={styles.cover}
                  />
                  <figcaption className={styles.figureCaption}>
                    {item.caption}
                  </figcaption>
                </figure>
              );
            })}
            <blockquote className={styles.note}>
              <p className={styles.noteQuote}>{atelierIntro.quote}</p>
              <footer className={styles.noteSig}>
                {atelierIntro.quoteAttribution}
              </footer>
            </blockquote>
          </div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────── categories ── */}
      <section className={styles.section}>
        <div className={styles.sectionHead}>
          <div>
            <p className="eyebrow">{categories.eyebrow}</p>
            <h2 className={styles.sectionTitle}>
              {categories.title}{" "}
              <em className={styles.em}>{categories.titleItalic}</em>.
            </h2>
          </div>
          <Link href="/collection" className={styles.textLink}>
            Shop everything
          </Link>
        </div>

        <ul className={styles.categoryGrid}>
          {categories.items.map((item, i) => {
            const img = image(item.image);
            return (
              <li
                key={item.name}
                className={i === 0 ? styles.categoryTall : styles.category}
              >
                <Link href={item.href} className={styles.categoryLink}>
                  <span className={styles.categoryImage}>
                    <Image
                      src={img.src}
                      alt={img.alt}
                      fill
                      sizes="(max-width: 760px) 100vw, (max-width: 1100px) 50vw, 25vw"
                      placeholder="blur"
                      blurDataURL={img.blurDataURL}
                      className={styles.cover}
                    />
                    <span className={styles.categoryIndex}>
                      0{i + 1}
                    </span>
                  </span>
                  <span className={styles.categoryBody}>
                    <span className={styles.categoryName}>{item.name}</span>
                    <span className={styles.categoryBlurb}>{item.blurb}</span>
                    <span className={styles.categoryMeta}>{item.meta}</span>
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>
      </section>

      {/* ───────────────────────────────────────────────── testimonials ── */}
      <section className={styles.sectionTinted}>
        <div className={styles.sectionInner}>
          <div className={styles.centered}>
            <p className="eyebrow">{testimonials.eyebrow}</p>
            <h2 className={styles.sectionTitle}>
              {testimonials.title}{" "}
              <em className={styles.em}>{testimonials.titleItalic}</em>
            </h2>
          </div>

          <ul className={styles.testimonialGrid}>
            {testimonials.items.map((item) => {
              const img = image(item.image);
              return (
                <li key={item.author} className={styles.testimonial}>
                  <figure className={styles.testimonialFigure}>
                    <span className={styles.avatar}>
                      <Image
                        src={img.src}
                        alt=""
                        fill
                        sizes="96px"
                        placeholder="blur"
                        blurDataURL={img.blurDataURL}
                        className={styles.cover}
                      />
                    </span>

                    <span
                      className={styles.stars}
                      role="img"
                      aria-label={`${item.rating} out of 5 stars`}
                    >
                      {"★".repeat(item.rating)}
                    </span>

                    <blockquote className={styles.testimonialQuote}>
                      {item.quote.map((paragraph) => (
                        <p key={paragraph.slice(0, 24)}>{paragraph}</p>
                      ))}
                    </blockquote>

                    <figcaption className={styles.testimonialAuthor}>
                      {item.author}
                    </figcaption>
                  </figure>
                </li>
              );
            })}
          </ul>
        </div>
      </section>

      {/* ────────────────────────────────────────────────────── process ── */}
      <section className={styles.section} id="process">
        <div className={styles.sectionHead}>
          <div>
            <p className="eyebrow">{process.eyebrow}</p>
            <h2 className={styles.sectionTitle}>
              {process.title}{" "}
              <em className={styles.em}>{process.titleItalic}</em>
            </h2>
          </div>
        </div>

        {/* The connecting rule is the "thread" from the source's process
            section, drawn as a single border rather than per-step lines. */}
        <ol className={styles.steps}>
          {process.steps.map((step, i) => (
            <li key={step.name} className={styles.step}>
              <span className={styles.stepIndex}>0{i + 1}</span>
              <h3 className={styles.stepName}>{step.name}</h3>
              <p className={styles.stepBody}>{step.body}</p>
            </li>
          ))}
        </ol>

        <ul className={styles.assurances}>
          {process.assurances.map((item) => (
            <li key={item.name} className={styles.assurance}>
              <h3 className={styles.assuranceName}>{item.name}</h3>
              <p className={styles.assuranceBody}>{item.body}</p>
            </li>
          ))}
        </ul>
      </section>

      {/* ──────────────────────────────────────────────────── final cta ── */}
      <section className={styles.finalCta}>
        <VeilStage />
        <div className={styles.finalCtaInner}>
          <h2 className={styles.finalCtaTitle}>
            {finalCta.title}
            <em className={styles.finalCtaItalic}>{finalCta.titleItalic}</em>
          </h2>
          <div className={styles.heroCtas}>
            <Link href={finalCta.primary.href} className={styles.btnPrimary}>
              {finalCta.primary.label}
            </Link>
            <Link href={finalCta.secondary.href} className={styles.btnGhost}>
              {finalCta.secondary.label}
            </Link>
          </div>
          <p className={styles.finalCtaMeta}>{finalCta.meta}</p>
        </div>
      </section>
    </>
  );
}
