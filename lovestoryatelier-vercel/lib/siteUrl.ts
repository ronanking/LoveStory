/**
 * Canonical base URL.
 *
 * Falls back to Vercel's per-deployment URL so preview builds still emit
 * coherent absolute URLs, then to localhost for development. Set
 * NEXT_PUBLIC_SITE_URL in production — it is also what switches indexing on.
 */
export function siteUrl(): string {
  const explicit = process.env.NEXT_PUBLIC_SITE_URL;
  if (explicit) return explicit.replace(/\/$/, "");

  const vercel = process.env.NEXT_PUBLIC_VERCEL_URL ?? process.env.VERCEL_URL;
  if (vercel) return `https://${vercel}`;

  return "http://localhost:3000";
}
