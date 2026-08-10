import { NextResponse } from "next/server";

import { sendEnquiry } from "@/lib/email";
import { enquirySchema } from "@/lib/enquirySchema";

export const runtime = "nodejs";

/**
 * In-memory rate limit. Adequate for a single-studio enquiry form; it resets
 * on cold start and is per-instance, which is a real limitation and is
 * documented in the README rather than papered over. Move to Upstash or Vercel
 * KV if volume ever justifies it.
 */
const WINDOW_MS = 10 * 60 * 1000;
const MAX_PER_WINDOW = 5;
const hits = new Map<string, number[]>();

function rateLimited(key: string): boolean {
  const now = Date.now();
  const recent = (hits.get(key) ?? []).filter((t) => now - t < WINDOW_MS);
  recent.push(now);
  hits.set(key, recent);

  // Opportunistic cleanup so the map cannot grow without bound.
  if (hits.size > 5000) {
    for (const [k, v] of hits) {
      if (v.every((t) => now - t >= WINDOW_MS)) hits.delete(k);
    }
  }
  return recent.length > MAX_PER_WINDOW;
}

export async function POST(request: Request) {
  const ip =
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";

  if (rateLimited(ip)) {
    return NextResponse.json(
      { ok: false, error: "Too many enquiries — please try again shortly." },
      { status: 429 },
    );
  }

  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json(
      { ok: false, error: "Malformed request." },
      { status: 400 },
    );
  }

  const parsed = enquirySchema.safeParse(payload);
  if (!parsed.success) {
    return NextResponse.json(
      {
        ok: false,
        error: "Please check the highlighted fields.",
        fieldErrors: parsed.error.flatten().fieldErrors,
      },
      { status: 400 },
    );
  }

  // Honeypot. Return 200 so bots see success and do not retry, but send
  // nothing — a real submission never reaches here with this filled.
  if (parsed.data.website) {
    return NextResponse.json({ ok: true });
  }

  const result = await sendEnquiry(parsed.data);

  if (!result.ok) {
    // Never report success for a message that was not delivered.
    return NextResponse.json(
      {
        ok: false,
        error:
          "We couldn't send that just now. Please email " +
          "info@lovestoryatelier.com directly and we'll reply straight away.",
      },
      { status: 502 },
    );
  }

  return NextResponse.json({ ok: true, delivery: result.delivery });
}
