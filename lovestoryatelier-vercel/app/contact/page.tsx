import type { Metadata } from "next";
import Image from "next/image";

import { EnquiryForm } from "@/components/forms/EnquiryForm";
import { contact } from "@/content/pages";
import { image } from "@/content/images";

import styles from "../shared.module.css";

export const metadata: Metadata = {
  title: "Contact & bespoke enquiry",
  description:
    "Email info@lovestoryatelier.com or send a bespoke enquiry. Brisbane " +
    "studio visits by appointment. Most replies within 48 hours.",
};

export default function ContactPage() {
  const img = image(contact.image);
  return (
    <>
      <section className={styles.head}>
        <p className="eyebrow">{contact.eyebrow}</p>
        <h1 className={styles.title}>
          {contact.title} <em>{contact.titleItalic}</em>.
        </h1>
      </section>

      <section className={styles.section}>
        <div className={styles.split}>
          <figure className={styles.portrait} style={{ margin: 0 }}>
            <Image
              src={img.src}
              alt={img.alt}
              fill
              sizes="(max-width: 880px) 100vw, 40vw"
              placeholder="blur"
              blurDataURL={img.blurDataURL}
              className={styles.cover}
            />
          </figure>
          <ul className={styles.cards} style={{ gridTemplateColumns: "1fr", marginTop: 0 }}>
            {contact.channels.map((channel) => (
              <li key={channel.label} className={styles.card}>
                <p className={styles.cardLabel}>{channel.label}</p>
                <h2 className={styles.cardTitle}>
                  {"href" in channel && channel.href ? (
                    <a href={channel.href}>{channel.value}</a>
                  ) : (
                    channel.value
                  )}
                </h2>
                <p className={styles.cardBody}>{channel.note}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className={styles.tinted} id="enquiry">
        <div className={styles.section}>
          <p className="eyebrow">The bespoke enquiry</p>
          <h2 className={styles.title}>
            Tell us about <em>your day</em>
          </h2>
          <p className={styles.lede}>
            The more you share, the more precise the sketch and quote we send
            back. Only your name, email and a short message are required.
          </p>
          <div style={{ marginTop: "clamp(2rem,5vh,3rem)" }}>
            <EnquiryForm />
          </div>
        </div>
      </section>

      <section className={styles.section} id="faq">
        <p className="eyebrow">{contact.faq.eyebrow}</p>
        <h2 className={styles.title}>
          {contact.faq.title} <em>{contact.faq.titleItalic}</em>
        </h2>
        <div style={{ marginTop: "clamp(1.5rem,4vh,2.5rem)", maxWidth: "60rem" }}>
          {contact.faq.items.map((item) => (
            <details key={item.q} className="faq-item">
              <summary>{item.q}</summary>
              <p>{item.a}</p>
            </details>
          ))}
        </div>
      </section>
    </>
  );
}
