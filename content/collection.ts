/**
 * The veil catalogue, migrated from `sections/main-collection.liquid`.
 *
 * The source theme hand-wrote all twelve cards as repeated markup inside a
 * `{%- else -%}` fallback. They are data, so here they are data.
 *
 * NO PRICES. The source shows a price only when a real Shopify product carries
 * one; every card in the theme reads "Made to order". Nothing here justifies
 * inventing a number, so the type has no price field at all.
 */

export type Silhouette =
  | "Cathedral"
  | "Chapel"
  | "Fingertip"
  | "Mantilla"
  | "Two-tier";

export type Finish = "Lace" | "Plain";

export type Veil = {
  slug: string;
  name: string;
  silhouette: Silhouette;
  lengthCm: number;
  edge: string;
  finish: Finish;
  image: string;
  /** object-position, carried over from the source's per-usage crops. */
  focal: string;
};

export const veils: readonly Veil[] = [
  {
    slug: "cathedral-golden-hour",
    name: "Cathedral Veil · Golden Hour",
    silhouette: "Cathedral",
    lengthCm: 300,
    edge: "soft cut edge",
    finish: "Lace",
    image: "ls-bride-cathedral",
    focal: "50% 20%",
  },
  {
    slug: "mantilla-full-lace-trim",
    name: "Mantilla · Full Lace Trim",
    silhouette: "Mantilla",
    lengthCm: 220,
    edge: "full Chantilly lace border",
    finish: "Lace",
    image: "ls-golden-lace",
    focal: "50% 30%",
  },
  {
    slug: "two-tier-chapel-length",
    name: "Two-tier · Chapel Length",
    silhouette: "Two-tier",
    lengthCm: 180,
    edge: "delicate lace edge",
    finish: "Lace",
    image: "ls-portrait-bw",
    focal: "50% 20%",
  },
  {
    slug: "cathedral-silk-plain",
    name: "Cathedral Veil · Silk Plain",
    silhouette: "Cathedral",
    lengthCm: 280,
    edge: "plain cut edge",
    finish: "Plain",
    image: "ls-veil-back",
    focal: "50% 25%",
  },
  {
    slug: "blusher-cap-lace-trim",
    name: "Blusher Cap · Lace Trim",
    silhouette: "Fingertip",
    lengthCm: 100,
    edge: "Chantilly lace edge",
    finish: "Lace",
    image: "ls-bride-blusher",
    focal: "50% 25%",
  },
  {
    slug: "mantilla-lace-applique",
    name: "Mantilla · Lace Appliqué",
    silhouette: "Mantilla",
    lengthCm: 200,
    edge: "hand-applied lace motifs",
    finish: "Lace",
    image: "ls-mantilla-couple",
    focal: "50% 30%",
  },
  {
    slug: "mantilla-silk-tulle",
    name: "Mantilla · Silk Tulle",
    silhouette: "Mantilla",
    lengthCm: 240,
    edge: "vintage lace trim",
    finish: "Lace",
    image: "ls-church-veil",
    focal: "50% 25%",
  },
  {
    slug: "cathedral-ceremony-veil",
    name: "Cathedral · Ceremony Veil",
    silhouette: "Cathedral",
    lengthCm: 300,
    edge: "Chantilly lace edge",
    finish: "Lace",
    image: "ls-ceremony",
    focal: "50% 20%",
  },
  {
    slug: "chapel-european-tulle",
    name: "Chapel Veil · European Tulle",
    silhouette: "Chapel",
    lengthCm: 180,
    edge: "soft cut edge",
    finish: "Plain",
    image: "ls-cobblestone",
    focal: "50% 30%",
  },
  {
    slug: "fingertip-chantilly-detail",
    name: "Fingertip · Chantilly Detail",
    silhouette: "Fingertip",
    lengthCm: 110,
    edge: "Chantilly lace border",
    finish: "Lace",
    image: "ls-lace-closeup",
    focal: "50% 40%",
  },
  {
    slug: "cathedral-editorial-silk",
    name: "Cathedral · Editorial Silk",
    silhouette: "Cathedral",
    lengthCm: 320,
    edge: "raw silk cut edge",
    finish: "Plain",
    image: "ls-veil-bw",
    focal: "50% 20%",
  },
  {
    slug: "chapel-soft-tulle",
    name: "Chapel Veil · Soft Tulle",
    silhouette: "Chapel",
    lengthCm: 160,
    edge: "plain hand-rolled edge",
    finish: "Plain",
    image: "ls-walking",
    focal: "50% 30%",
  },
];

export const filters = [
  "All silhouettes",
  "Cathedral",
  "Chapel",
  "Fingertip",
  "Mantilla",
  "Two-tier",
  "Lace",
  "Plain",
] as const;

export const collectionIntro = {
  eyebrow: "The collection",
  note:
    "Each silhouette is a starting point — every piece is then drafted to " +
    "your gown.",
} as const;

/** The veil length guide, rebuilt from the source's carousel. */
export const silhouetteGuide = {
  eyebrow: "Veil Length Guide",
  title: "Find your",
  titleItalic: "silhouette",
  intro:
    "Each silhouette tells a different story. Click through to find the " +
    "length that suits your gown and your moment.",
  items: [
    {
      name: "Blusher",
      cm: 80,
      // Proportional bar widths, carried from the source's `--lw` values.
      barPercent: 25,
      filter: "Fingertip",
      image: "ls-bride-blusher",
      body:
        "The most intimate silhouette — falling to the elbow, it frames your " +
        "features without competing with the gown. Perfect for fitted or " +
        "structured dresses where you want the dress to be the centrepiece. " +
        "Often paired with a longer back layer for dramatic photographs, " +
        "keeping the front soft and unassuming.",
    },
    {
      name: "Fingertip",
      cm: 110,
      barPercent: 34,
      filter: "Fingertip",
      image: "ls-portrait-bw",
      body:
        "The most universally flattering length — reaching your fingertips " +
        "when arms are relaxed at your sides. It moves beautifully as you " +
        "walk and works across every gown style, from ballgown to sheath to " +
        "A-line. Long enough to feel truly bridal, effortless enough to dance " +
        "in all evening. A perennial favourite for good reason.",
    },
    {
      name: "Chapel",
      cm: 170,
      barPercent: 53,
      filter: "Chapel",
      image: "ls-cobblestone",
      body:
        "Falls just beyond the gown's train, creating a dramatic entrance " +
        "without the full cathedral commitment. It flows effortlessly down " +
        "the aisle and photographs beautifully from behind, adding length and " +
        "movement to every step. The ideal choice for semi-formal to formal " +
        "ceremonies where you want presence without grandeur.",
    },
    {
      name: "Mantilla",
      cm: 210,
      barPercent: 66,
      filter: "Mantilla",
      image: "ls-church-veil",
      body:
        "A circular veil draped over the head, framing the face — often edged " +
        "in intricate lace that becomes part of the hairstyle itself. The " +
        "most traditional of silhouettes, rooted in ceremony and deeply " +
        "romantic. It requires no back attachment, sitting naturally over the " +
        "crown and cascading to the shoulders and beyond.",
    },
    {
      name: "Cathedral",
      cm: 320,
      barPercent: 100,
      filter: "Cathedral",
      image: "ls-bride-cathedral",
      body:
        "Trails two metres and beyond behind you — the grandest statement in " +
        "bridal. Reserved for the most formal of ceremonies, it commands the " +
        "aisle and transforms the procession into a moment you will never " +
        "forget. Often crafted as a single tier for maximum drama. This is " +
        "the veil that stops the room.",
    },
  ],
} as const;

export const customiseRail = {
  eyebrow: "None of these quite right?",
  title: "Customise a veil to",
  titleItalic: "your gown",
  body:
    "Email a photo of your gown to start designing your bespoke veil — " +
    "length, fabric, edge, and any embroidery, all chosen with you.",
  cta: { label: "Start a custom veil", href: "/custom" },
} as const;

export function veilBySlug(slug: string): Veil | undefined {
  return veils.find((veil) => veil.slug === slug);
}

export function relatedVeils(veil: Veil, limit = 3): readonly Veil[] {
  const sameSilhouette = veils.filter(
    (other) => other.slug !== veil.slug && other.silhouette === veil.silhouette,
  );
  const rest = veils.filter(
    (other) => other.slug !== veil.slug && other.silhouette !== veil.silhouette,
  );
  return [...sameSilhouette, ...rest].slice(0, limit);
}
