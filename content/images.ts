/**
 * Image lookup: joins the generated manifest (dimensions, blur placeholders)
 * with hand-written alt text.
 *
 * Alt text lives here rather than in the generator because it is editorial,
 * not mechanical — it describes what is in the frame for someone who cannot
 * see it. Most of these are carried from the source theme's `alt` attributes;
 * the rest were written by looking at the photograph.
 */
import { GENERATED_IMAGES, type GeneratedImage } from "./images.generated";

export type SiteImage = GeneratedImage & { alt: string };

const ALT: Record<string, string> = {
  // — theme assets, alt carried from the Liquid where it existed —
  "ls-hero": "A bride in her Love Story Atelier veil",
  "ls-bride-cathedral": "A bride beneath a cathedral-length veil",
  "ls-bride-blusher": "A bride wearing a blusher veil with a lace edge",
  "ls-cathedral": "A bride holding her bouquet under a cathedral veil",
  "ls-ceremony": "A bride at the altar in a cathedral veil",
  "ls-church-veil": "A mantilla veil draped in church light",
  "ls-cobblestone": "A bride on cobblestones in a chapel-length veil",
  "ls-couple": "A couple on their wedding day",
  "ls-embroidery": "Hand embroidery on silk tulle",
  "ls-golden-lace": "Chantilly lace catching golden light",
  "ls-lace-closeup": "A close view of a Chantilly lace border",
  "ls-mantilla-couple": "A couple beneath a mantilla veil",
  "ls-mirror": "A bride adjusting her veil at the mirror",
  "ls-portrait-bw": "A black and white portrait of a bride in a chapel veil",
  "ls-studio": "The Brisbane studio",
  "ls-veil-back": "A cathedral veil seen from behind",
  "ls-veil-bw": "An editorial black and white study of silk tulle",
  "ls-walking": "A bride walking, her chapel veil trailing behind her",

  // — photography library —
  "28f5060c-884c-4271-9c9b-d8fc9f06706e":
    "A couple embracing beneath a lace-edged veil, in black and white",
  "8007a6c2-081a-4943-9f77-4432c0a125b1":
    "A couple beneath a mantilla veil in warm afternoon light",
  "91ba5be9-af7d-4ff7-bc5b-20b251fd06a8":
    "A bride in a full-length veil beside a tall window, in black and white",
  "9a2500e5-c44d-404d-b0e0-980007fd4a93":
    "A couple at golden hour, the veil lit from behind",
  "a13b0d35-973d-4600-8ab8-7c83c1ffc826":
    "A bride from behind, her veil falling the length of her gown",
  "cb45229f-fe11-41a2-937d-79091429ee2d": "A couple laughing together",
  "h-a-bm-48": "A couple in a cloistered walkway",
  "h-a-bm-56": "A couple in a garden lined with cypress trees",
  "img-0896":
    "A veil caught mid-air, photographed in black and white",
  "img-0908": "Hands at work on a veil in the studio",
  "img-1122": "A bride outdoors, her veil lifting in the breeze",
  "img-1123": "A bride backlit by the sun, veil translucent",
  "img-1127": "A close study of silk tulle against skin",
  "img-4310": "A couple standing together in soft daylight",
  "img-4311": "A couple walking away, the veil trailing behind",
  "img-6078": "A couple at sunset, the veil lifted by the wind",
  "img-7027": "A bride in her gown among white florals",
  "img-7028": "A couple at the altar surrounded by white flowers",
  "img-7029": "A couple sharing a kiss beneath the veil",
  "img-7030":
    "A lace veil resting on a bride's shoulder, in black and white",
};

/**
 * Optional CDN base for photography.
 *
 * Empty by default, so images are served from `public/` exactly as before.
 * Set NEXT_PUBLIC_IMAGE_BASE to serve them from elsewhere — used for preview
 * deploys that cannot carry the binaries, and the seam a real image CDN would
 * plug into later.
 */
const IMAGE_BASE = (process.env.NEXT_PUBLIC_IMAGE_BASE ?? "").replace(/\/$/, "");

const BY_SLUG = new Map<string, SiteImage>(
  GENERATED_IMAGES.map((image) => [
    image.slug,
    { ...image, src: `${IMAGE_BASE}${image.src}`, alt: ALT[image.slug] ?? "" },
  ]),
);

/**
 * Throws rather than returning a placeholder: a missing image is a build-time
 * mistake, and silently shipping a broken slot is worse than failing loudly.
 */
export function image(slug: string): SiteImage {
  const found = BY_SLUG.get(slug);
  if (!found) {
    throw new Error(
      `Unknown image "${slug}". Run \`npm run images\` after adding it to reference/.`,
    );
  }
  return found;
}

export const allImages = GENERATED_IMAGES;
