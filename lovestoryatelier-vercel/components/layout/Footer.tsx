import Link from "next/link";

import { site } from "@/content/site";

import styles from "./Footer.module.css";

// Column structure carried from `sections/footer.liquid`. Links that pointed
// at Shopify routes now point at the rebuilt equivalents; entries whose pages
// do not exist in this build are deliberately omitted rather than left as
// dead links.
const COLUMNS = [
  {
    heading: "Shop",
    links: [
      { label: "All veils", href: "/collection" },
      { label: "Cathedral", href: "/collection?silhouette=Cathedral" },
      { label: "Mantilla", href: "/collection?silhouette=Mantilla" },
    ],
  },
  {
    heading: "Custom",
    links: [
      { label: "The bespoke process", href: "/custom" },
      { label: "Embroidery", href: "/custom#embroidery" },
      { label: "Studio enquiry", href: "/contact#enquiry" },
    ],
  },
  {
    heading: "Atelier",
    links: [
      { label: "About", href: "/about" },
      { label: "Contact", href: "/contact" },
      { label: "Care & FAQ", href: "/contact#faq" },
    ],
  },
] as const;

export function Footer() {
  return (
    <footer className={styles.footer}>
      <div className={styles.inner}>
        <div className={styles.brand}>
          <p className={styles.wordmark}>
            Love
            <em>story</em>
          </p>
          <p className={styles.tagline}>Atelier · {site.locality}</p>
          <a href={`mailto:${site.email}`} className={styles.email}>
            {site.email}
          </a>
        </div>

        <div className={styles.columns}>
          {COLUMNS.map((column) => (
            <nav key={column.heading} aria-label={column.heading}>
              <h2 className={styles.columnHeading}>{column.heading}</h2>
              <ul className={styles.list}>
                {column.links.map((link) => (
                  <li key={link.label}>
                    <Link href={link.href} className={styles.link}>
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          ))}
        </div>
      </div>

      <div className={styles.baseline}>
        <p>
          © {new Date().getFullYear()} {site.name}. Made by hand in{" "}
          {site.locality}, {site.country}.
        </p>
      </div>
    </footer>
  );
}
