/**
 * About, custom and contact page content, migrated from the Liquid sections
 * of the same names. Verbatim, as with `site.ts`.
 */

export const about = {
  eyebrow: "A letter",
  title: "It's an honour to play a small part in",
  titleItalic: "your big moment",
  letter: [
    "Hello — I'm Jesse, the heart and hands behind Love Story Atelier.",
    "With a background in fashion and design, I discovered a deep passion for " +
      "the bridal world. After years of refining my craft, I decided to focus " +
      "fully on creating meaningful, heirloom-quality pieces for modern brides.",
    "At Love Story Atelier, my goal is to make every bride feel truly special " +
      "— creating one-of-a-kind pieces that you'll treasure long after the day " +
      "is done. I look forward to creating something beautiful for you.",
  ],
  signature: "Jesse",
  signatureRole: "founder · Love Story Atelier",
  portrait: "ls-mirror",
  portraitCaption: "Jesse · founder",
  values: {
    eyebrow: "What we believe",
    title: "Three things,",
    titleItalic: "quietly held",
    items: [
      {
        label: "Made by hand",
        title: "European tulle · finished in Brisbane",
        body:
          "Every veil is cut, draped, hemmed, and embroidered in the studio. " +
          "Luxurious European tulle, hand-finished edges, archival care wrap.",
      },
      {
        label: "Made for you",
        title: "Drafted around your gown",
        body:
          "Length, silhouette, and edge are chosen together — designed to " +
          "complement your dress and tell your individual story.",
      },
      {
        label: "Made to keep",
        title: "Heirloom-quality pieces",
        body:
          "Couture craftsmanship and dedication to handcrafted excellence — " +
          "pieces you'll treasure long after the day is done.",
      },
    ],
  },
} as const;

export const custom = {
  eyebrow: "The bespoke service",
  title: "A veil that exists",
  titleItalic: "only for you",
  intro:
    "Every veil can be made in any length, edge, or with custom embroidery. " +
    "Email a photo of your gown to begin — length, fabric, edge, and any " +
    "embroidery are all chosen with you.",
  hero: "ls-embroidery",
  embroidery: {
    eyebrow: "Custom embroidery",
    title: "Names, dates and vows,",
    titleItalic: "stitched by hand",
    body:
      "Meaningful details are what turn a veil into an heirloom — a monogram " +
      "at the hem, a wedding date in the lining, or a line of your vows " +
      "traced along the edge in fine thread.",
    images: ["ls-embroidery", "ls-lace-closeup", "ls-golden-lace"],
  },
} as const;

export const contact = {
  eyebrow: "Get in touch",
  title: "Let's begin",
  titleItalic: "your day",
  channels: [
    {
      label: "Email",
      value: "info@lovestoryatelier.com",
      note: "Most replies within 48 hours",
      href: "mailto:info@lovestoryatelier.com",
    },
    {
      label: "Studio",
      value: "Brisbane, Queensland · by appointment",
      note: "Address shared on booking",
    },
    {
      label: "Instagram",
      value: "@lovestoryatelier",
      note: "Behind-the-scenes from the studio",
      href: "https://www.instagram.com/lovestoryatelier/",
    },
  ],
  image: "img-7030",
  faq: {
    eyebrow: "Questions, briefly answered",
    title: "Everything worth knowing",
    titleItalic: "before you write",
    items: [
      {
        q: "How long does it take to make a custom veil?",
        a:
          "All designs are made-to-order. Once approved your piece is " +
          "dispatched within 72 hours of completion — most brides receive " +
          "their veils within four to six weeks of enquiring.",
      },
      {
        q: "Do you ship internationally?",
        a:
          "We do. Express worldwide shipping is complimentary on orders over " +
          "$300 AUD. Buyers may be responsible for customs or import taxes.",
      },
      {
        q: "Can I customise a veil from the collection?",
        a:
          "Absolutely — every veil can be made in any length, edge, or with " +
          "custom embroidery. Email a photo of your gown to " +
          "info@lovestoryatelier.com to begin.",
      },
      {
        q: "Can I visit the Brisbane studio?",
        a:
          "Studio visits are by appointment only. We'll share the address " +
          "when we confirm your visit.",
      },
    ],
  },
} as const;
