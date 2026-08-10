import { FIELD_LABELS, type EnquiryInput } from "./enquirySchema";

/**
 * Email provider abstraction.
 *
 * Resend is the only implementation today; swapping providers or routing to a
 * CRM means replacing `deliver` and nothing else. Called directly with fetch
 * rather than the SDK — one POST does not justify a dependency.
 */

export type SendResult =
  | { ok: true; delivery: "sent" | "logged" }
  | { ok: false; reason: string };

function renderText(enquiry: EnquiryInput): string {
  const lines: string[] = ["New bespoke enquiry", ""];

  for (const [key, label] of Object.entries(FIELD_LABELS)) {
    const value = enquiry[key as keyof EnquiryInput];
    if (typeof value === "string" && value.trim()) {
      lines.push(`${label}: ${value.trim()}`);
    }
  }
  return lines.join("\n");
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function renderHtml(enquiry: EnquiryInput): string {
  const rows = Object.entries(FIELD_LABELS)
    .map(([key, label]) => {
      const value = enquiry[key as keyof EnquiryInput];
      if (typeof value !== "string" || !value.trim()) return "";
      return (
        `<tr><th align="left" style="padding:6px 16px 6px 0;font-weight:500;` +
        `vertical-align:top;white-space:nowrap;">${escapeHtml(label)}</th>` +
        `<td style="padding:6px 0;">${escapeHtml(value.trim()).replace(/\n/g, "<br>")}</td></tr>`
      );
    })
    .join("");

  return (
    `<div style="font-family:system-ui,sans-serif;font-size:14px;color:#1c1c1c;">` +
    `<h1 style="font-size:18px;font-weight:500;">New bespoke enquiry</h1>` +
    `<table cellpadding="0" cellspacing="0">${rows}</table></div>`
  );
}

export async function sendEnquiry(enquiry: EnquiryInput): Promise<SendResult> {
  const apiKey = process.env.RESEND_API_KEY;
  const to = process.env.ENQUIRY_TO_EMAIL;
  const from = process.env.ENQUIRY_FROM_EMAIL;

  // Unconfigured in development: log and report `logged`, so the UI can say
  // plainly that mail is not set up rather than implying it was sent.
  if (!apiKey || !to || !from) {
    if (process.env.NODE_ENV === "production") {
      return {
        ok: false,
        reason:
          "Email is not configured. Set RESEND_API_KEY, ENQUIRY_TO_EMAIL and " +
          "ENQUIRY_FROM_EMAIL in the Vercel project.",
      };
    }
    console.info("[enquiry] email unconfigured — logging instead:\n" +
      renderText(enquiry));
    return { ok: true, delivery: "logged" };
  }

  try {
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from,
        to: [to],
        // So a reply in the inbox goes to the bride, not to the studio.
        reply_to: enquiry.email,
        subject: `Bespoke enquiry — ${enquiry.firstName} ${enquiry.lastName}`,
        text: renderText(enquiry),
        html: renderHtml(enquiry),
      }),
    });

    if (!response.ok) {
      return {
        ok: false,
        reason: `Resend responded ${response.status}: ${await response.text()}`,
      };
    }
    return { ok: true, delivery: "sent" };
  } catch (error) {
    return { ok: false, reason: String(error) };
  }
}
