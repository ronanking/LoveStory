import { z } from "zod";

/**
 * The bespoke enquiry, migrated from `sections/enquiry-form.liquid`.
 *
 * The source posted 24 `contact[...]` fields to Shopify's contact endpoint
 * with no validation beyond `required`. The field set is preserved; the
 * grouping and the validation are new.
 *
 * Only the fields genuinely needed to reply are required — a bride should not
 * be blocked from enquiring because she has not chosen an edge finish yet.
 */

const optionalText = z.string().trim().max(300).optional().or(z.literal(""));

export const enquirySchema = z.object({
  // — you —
  firstName: z.string().trim().min(1, "Please tell us your first name").max(80),
  lastName: z.string().trim().min(1, "Please tell us your last name").max(80),
  email: z.string().trim().email("Please check this email address").max(200),
  phone: optionalText,
  country: optionalText,
  socialHandle: optionalText,

  // — the wedding —
  weddingDate: optionalText,
  weddingVenue: optionalText,
  eventType: optionalText,

  // — the gown —
  gownDesigner: optionalText,
  gownStyleName: optionalText,

  // — the veil —
  veilLength: optionalText,
  customVeilLength: optionalText,
  blusher: optionalText,
  embellishments: optionalText,
  accessories: optionalText,

  // — embroidery —
  customEmbroidery: optionalText,
  embroideryType: optionalText,
  embroideryDetail: z.string().trim().max(1000).optional().or(z.literal("")),
  embroiderySize: optionalText,

  // — anything else —
  budget: optionalText,
  whyCustom: z.string().trim().max(2000).optional().or(z.literal("")),
  inspirationLinks: z.string().trim().max(1000).optional().or(z.literal("")),
  message: z
    .string()
    .trim()
    .min(1, "Please tell us a little about what you're imagining")
    .max(4000),

  // Pre-filled when the enquiry starts from a veil page.
  veilSlug: optionalText,

  // Honeypot: a real bride never sees this field, so anything in it is a bot.
  // Named innocuously — bots avoid fields literally called "honeypot".
  //
  // Deliberately NOT validated as empty here. Rejecting it in the schema
  // returns a 400 naming `website` in fieldErrors, which tells a bot exactly
  // which field is the trap. Parsing accepts any value and the route decides,
  // answering 200 with nothing sent so the bot sees success and moves on.
  website: z.string().max(2000).optional().or(z.literal("")),
});

export type EnquiryInput = z.infer<typeof enquirySchema>;

export const FIELD_LABELS: Record<string, string> = {
  firstName: "First name",
  lastName: "Last name",
  email: "Email",
  phone: "Phone",
  country: "Country",
  socialHandle: "Social media handle",
  weddingDate: "Wedding date",
  weddingVenue: "Wedding venue",
  eventType: "Event type",
  gownDesigner: "Gown designer",
  gownStyleName: "Gown style name",
  veilLength: "Veil length",
  customVeilLength: "Custom veil length",
  blusher: "Blusher",
  embellishments: "Embellishments interested in",
  accessories: "Accessories interested in",
  customEmbroidery: "Custom embroidery",
  embroideryType: "Embroidery type",
  embroideryDetail: "Embroidery detail",
  embroiderySize: "Embroidery size",
  budget: "Budget",
  whyCustom: "Why custom",
  inspirationLinks: "Inspiration links",
  message: "Message",
  veilSlug: "Veil of interest",
};
