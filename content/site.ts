/**
 * Site content, migrated from the Shopify theme.
 *
 * Every string here came from `reference/theme/sections/*.liquid`, where it
 * lived inside a Liquid `default:` filter. Business claims — dispatch time,
 * shipping terms, the founder's own words, the brides' reviews — are carried
 * VERBATIM. They are the client's commitments and other people's words; they
 * are not copy to reword.
 */

export const site = {
  name: "Love Story Atelier",
  email: "info@lovestoryatelier.com",
  locality: "Brisbane",
  region: "Queensland",
  country: "Australia",
  founder: "Jesse",
} as const;

export const announcement = [
  "Complimentary worldwide express on orders over $300 AUD",
  "Made to order in our Brisbane studio",
  "Hand-embroidered · one bride at a time",
] as const;

export const nav = [
  { label: "The collection", href: "/collection" },
  { label: "Custom", href: "/custom" },
  { label: "About", href: "/about" },
  { label: "Contact", href: "/contact" },
] as const;

export const hero = {
  eyebrow: "Bespoke bridal · Made to order in Brisbane",
  headline: "Your dream veil,",
  headlineItalic: "made to order.",
  body:
    "We believe in redefining elegance and tradition for the modern bride. " +
    "Every veil and accessory is thoughtfully designed to complement your " +
    "gown — and tell your individual story. Made by hand in our Brisbane studio.",
  primaryCta: { label: "Start your custom veil", href: "/custom" },
  secondaryCta: { label: "Explore the collection", href: "/collection" },
  // The source hero is a four-image crossfade with Ken Burns.
  slides: ["ls-hero", "ls-bride-cathedral", "ls-portrait-bw", "ls-veil-back"],
  trust: [
    { value: "72 hrs", label: "Studio dispatch" },
    { value: "European tulle", label: "Luxurious, handmade" },
    { value: "Worldwide shipping", label: "Complimentary over $300 AUD" },
  ],
  cornerCard: {
    tag: "Recent · The atelier",
    title: "Drafted to her gown · finished by hand",
    sub: "European silk tulle with Chantilly lace edge.",
  },
} as const;

export const marquee = [
  "Hand-embroidered",
  "European silk tulle",
  "Made to order",
  "Brisbane studio",
  "Worldwide express",
  "One bride at a time",
  "Couture finishing",
  "Designed around your gown",
] as const;

export const atelierIntro = {
  eyebrow: "The atelier",
  title: "Thoughtfully made",
  titleItalic: "heirloom pieces",
  titleEnd: "for the modern bride.",
  body: [
    "Hello — I'm Jesse, the heart and hands behind Love Story Atelier. With a " +
      "background in fashion and design, I discovered a deep passion for the " +
      "bridal world, and after years of refining my craft, I now focus fully " +
      "on creating meaningful, heirloom-quality pieces for modern brides.",
    "From selecting luxurious fabrics and exquisite embellishments to " +
      "incorporating meaningful details like custom embroidery — every veil " +
      "and accessory is thoughtfully designed to complement your gown and " +
      "tell your individual story.",
  ],
  quote: "It's an honour to play a small part in your big moment.",
  quoteAttribution: "Jesse · Founder",
  images: [
    { slug: "ls-studio", caption: "In the studio" },
    { slug: "img-0908", caption: "Custom embroidery" },
    { slug: "ls-veil-back", caption: "Hand-finished hem" },
  ],
} as const;

export const categories = {
  eyebrow: "The collection",
  title: "Four houses of work,",
  titleItalic: "one studio",
  items: [
    {
      name: "Custom Veils",
      blurb: "Cathedral · chapel · fingertip — drafted to your gown.",
      meta: "Made-to-order · European tulle",
      image: "ls-veil-back",
      href: "/collection",
    },
    {
      name: "Pearl Earrings",
      blurb:
        "Freshwater pearls and a quiet weight of gold — earrings to wear " +
        "long after the day.",
      meta: "Bridal · everyday",
      image: "ls-golden-lace",
      href: "/collection",
    },
    {
      name: "Bridal Accessories",
      blurb:
        "Hair pins, combs, and silk ribbons — a final considered detail for " +
        "the morning of.",
      meta: "Hair · Hands · Hem",
      image: "ls-ceremony",
      href: "/collection",
    },
    {
      name: "Embroidered Keepsakes",
      blurb:
        "Names, dates and vows, stitched by hand into something you keep.",
      meta: "Bespoke · by request",
      image: "ls-lace-closeup",
      href: "/custom",
    },
  ],
} as const;

/**
 * Rebuilt from `ls-reviews.png` — the source theme shipped these as a flat
 * image, so the words were invisible to search engines, screen readers and
 * translation. Transcribed verbatim, including the brides' own spelling of
 * "Jess".
 */
export const testimonials = {
  eyebrow: "What our brides say",
  title: "Loved by",
  titleItalic: "real brides",
  items: [
    {
      quote: [
        "Jess, what can I say! My custom veil that you created for me is " +
          "nothing short of perfect.",
        "Your attention to detail surpassed my expectations. Any request that " +
          "I made was never a problem. Your craftsmanship sets you apart from " +
          "others.",
        "I cannot recommend Love Story Atelier more highly to other " +
          "brides-to-be out there. So looking forward to wearing your " +
          "beautiful design.",
      ],
      author: "Sophie S.",
      rating: 5,
      image: "ls-cathedral",
    },
    {
      quote: [
        "Jess from Love Story Atelier created my wedding earrings, " +
          "bridesmaid's earrings and my veil and they were to die for!",
        "They were great quality, timeless and everyone commented on how " +
          "beautiful they are. Handmade, stunning designs and I've worn them " +
          "many times since!",
        "The perfect earrings for your wedding or bridal events!",
      ],
      author: "Emily M.",
      rating: 5,
      image: "h-a-bm-48",
    },
    {
      quote: [
        "Jess created the most stunning and original veil from my poor " +
          "explanation. She used my dress images as reference and created a " +
          "piece of artwork that I cannot wait to wear with my dress on my " +
          "special day.",
        "She kept me updated with the whole process, sending me progress " +
          "pictures and videos, and sent it in a speedy manner.",
        "Thank you thank you thank you!",
      ],
      author: "Alanna J.",
      rating: 5,
      image: "img-7029",
    },
  ],
} as const;

export const process = {
  eyebrow: "The bespoke process",
  title: "From first email",
  titleItalic: "to your wedding day",
  steps: [
    {
      name: "Enquire",
      body:
        "Email a photo of your gown and tell us what you're imagining. We " +
        "reply within 48 hours with a written sketch and quote.",
    },
    {
      name: "Design",
      body:
        "We refine the sketch together — length, silhouette, edge detail, " +
        "embroidery — until it feels exactly right.",
    },
    {
      name: "Make",
      body:
        "Once approved, your veil is cut, draped, hemmed, and embroidered " +
        "entirely by hand in the Brisbane studio.",
    },
    {
      name: "Deliver",
      body:
        "We wrap and dispatch within 72 hours of completion. Express " +
        "worldwide shipping. Most brides receive their veil within two weeks " +
        "of approval.",
    },
  ],
  assurances: [
    {
      name: "No deposit until approved",
      body:
        "You won't pay anything until you've seen and approved your sketch " +
        "and quote.",
    },
    {
      name: "Express worldwide shipping",
      body:
        "Most brides receive their veil within two weeks of production " +
        "sign-off. Complimentary on orders over $300 AUD.",
    },
    {
      name: "Heirloom care wrap",
      body:
        "Every veil is packed in an archival tissue and keepsake box, ready " +
        "to store or pass on.",
    },
  ],
} as const;

export const finalCta = {
  title: "Begin your custom veil",
  titleItalic: "you'll remember forever",
  meta: "Brisbane · Made to order · Worldwide express",
  primary: { label: "Start your enquiry", href: "/contact#enquiry" },
  secondary: { label: "Meet the atelier", href: "/about" },
  image: "ls-cathedral",
} as const;
