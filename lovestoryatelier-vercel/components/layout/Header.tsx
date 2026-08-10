"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";

import { announcement, nav } from "@/content/site";

import styles from "./Header.module.css";

export function Header() {
  const pathname = usePathname();
  const [announceIndex, setAnnounceIndex] = useState(0);
  const [open, setOpen] = useState(false);
  const [condensed, setCondensed] = useState(false);
  const panel = useRef<HTMLDivElement>(null);
  const toggle = useRef<HTMLButtonElement>(null);

  // Announcement rotation, carried from the source theme.
  useEffect(() => {
    const query = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (query.matches || announcement.length < 2) return;
    const id = setInterval(
      () => setAnnounceIndex((i) => (i + 1) % announcement.length),
      5200,
    );
    return () => clearInterval(id);
  }, []);

  // Condense the bar once past the fold. Passive listener, rAF-throttled —
  // no layout reads on every scroll event.
  useEffect(() => {
    let ticking = false;
    const onScroll = () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        setCondensed(window.scrollY > 24);
        ticking = false;
      });
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Close on route change so the panel never survives navigation. Adjusted
  // during render rather than in an effect: an effect here would commit the
  // open panel first and then close it, causing a cascading render. This also
  // covers back/forward navigation, which an onClick handler would miss.
  const [lastPath, setLastPath] = useState(pathname);
  if (pathname !== lastPath) {
    setLastPath(pathname);
    setOpen(false);
  }

  // Mobile panel: lock scroll, trap focus, close on Escape.
  useEffect(() => {
    if (!open) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
        toggle.current?.focus();
        return;
      }
      if (event.key !== "Tab" || !panel.current) return;

      const focusables = panel.current.querySelectorAll<HTMLElement>(
        'a[href], button:not([disabled])',
      );
      const first = focusables[0];
      const last = focusables[focusables.length - 1];
      if (!first || !last) return;

      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener("keydown", onKeyDown);
    panel.current?.querySelector<HTMLElement>("a[href]")?.focus();

    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  return (
    <header className={styles.header} data-condensed={condensed}>
      <div className={styles.announce} aria-live="polite">
        {announcement[announceIndex]}
      </div>

      <div className={styles.bar}>
        <Link href="/" className={styles.wordmark}>
          Love Story <em>Atelier</em>
        </Link>

        <nav className={styles.nav} aria-label="Primary">
          {nav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={styles.navLink}
              aria-current={pathname === item.href ? "page" : undefined}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <Link href="/contact#enquiry" className={styles.enquire}>
          Enquire
        </Link>

        <button
          ref={toggle}
          type="button"
          className={styles.burger}
          aria-expanded={open}
          aria-controls="mobile-nav"
          onClick={() => setOpen((o) => !o)}
        >
          <span className={styles.burgerBox} aria-hidden="true">
            <span className={styles.burgerLine} data-open={open} />
            <span className={styles.burgerLine} data-open={open} />
          </span>
          {open ? "Close" : "Menu"}
        </button>
      </div>

      <div
        ref={panel}
        id="mobile-nav"
        className={styles.panel}
        data-open={open}
        // Hidden from AT and tab order when closed, rather than merely
        // off-screen — a common failure in themes like the source.
        {...(open ? {} : { inert: "" as never })}
      >
        <nav aria-label="Mobile">
          {nav.map((item) => (
            <Link key={item.href} href={item.href} className={styles.panelLink}>
              {item.label}
            </Link>
          ))}
          <Link href="/contact#enquiry" className={styles.panelLink}>
            Enquire
          </Link>
        </nav>
      </div>
    </header>
  );
}
