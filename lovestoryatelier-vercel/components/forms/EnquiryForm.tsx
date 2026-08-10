"use client";

import { useEffect, useRef, useState } from "react";

import { enquirySchema, type EnquiryInput } from "@/lib/enquirySchema";

import styles from "./EnquiryForm.module.css";

const DRAFT_KEY = "lsa-enquiry-draft";

type Status =
  | { kind: "idle" }
  | { kind: "sending" }
  | { kind: "sent"; delivery: "sent" | "logged" }
  | { kind: "error"; message: string };

const FIELDSETS = [
  {
    legend: "About you",
    fields: [
      { name: "firstName", label: "First name", required: true },
      { name: "lastName", label: "Last name", required: true },
      { name: "email", label: "Email", type: "email", required: true },
      { name: "phone", label: "Phone", type: "tel" },
      { name: "country", label: "Country" },
      { name: "socialHandle", label: "Instagram handle" },
    ],
  },
  {
    legend: "The wedding",
    fields: [
      { name: "weddingDate", label: "Wedding date", type: "date" },
      { name: "weddingVenue", label: "Venue" },
      { name: "eventType", label: "Event type" },
    ],
  },
  {
    legend: "Your gown",
    fields: [
      { name: "gownDesigner", label: "Gown designer" },
      { name: "gownStyleName", label: "Style name" },
    ],
  },
  {
    legend: "Your veil",
    fields: [
      { name: "veilLength", label: "Veil length" },
      { name: "customVeilLength", label: "Custom length (cm)" },
      { name: "blusher", label: "Blusher layer" },
      { name: "embellishments", label: "Embellishments" },
      { name: "accessories", label: "Accessories" },
    ],
  },
  {
    legend: "Custom embroidery",
    fields: [
      { name: "customEmbroidery", label: "Embroidery" },
      { name: "embroideryType", label: "Type" },
      { name: "embroideryDetail", label: "Wording or detail", textarea: true },
      { name: "embroiderySize", label: "Size" },
    ],
  },
  {
    legend: "Anything else",
    fields: [
      { name: "budget", label: "Budget" },
      { name: "inspirationLinks", label: "Inspiration links", textarea: true },
      { name: "whyCustom", label: "Why custom?", textarea: true },
      {
        name: "message",
        label: "Tell us what you're imagining",
        textarea: true,
        required: true,
      },
    ],
  },
] as const;

export function EnquiryForm({ veilSlug = "" }: { veilSlug?: string }) {
  const [status, setStatus] = useState<Status>({ kind: "idle" });
  const [errors, setErrors] = useState<Record<string, string[]>>({});
  const form = useRef<HTMLFormElement>(null);
  const summary = useRef<HTMLDivElement>(null);

  // Restore a draft so a long form is never lost to a refresh.
  useEffect(() => {
    const raw = window.localStorage.getItem(DRAFT_KEY);
    if (!raw || !form.current) return;
    try {
      const draft = JSON.parse(raw) as Record<string, string>;
      for (const [key, value] of Object.entries(draft)) {
        const field = form.current.elements.namedItem(key);
        if (field instanceof HTMLInputElement ||
            field instanceof HTMLTextAreaElement) {
          field.value = value;
        }
      }
    } catch {
      window.localStorage.removeItem(DRAFT_KEY);
    }
  }, []);

  const saveDraft = () => {
    if (!form.current) return;
    const data = Object.fromEntries(new FormData(form.current)) as Record<
      string,
      string
    >;
    delete data.website;
    window.localStorage.setItem(DRAFT_KEY, JSON.stringify(data));
  };

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus({ kind: "sending" });
    setErrors({});

    const data = Object.fromEntries(
      new FormData(event.currentTarget),
    ) as unknown as EnquiryInput;

    // Validate with the same schema the server uses.
    const parsed = enquirySchema.safeParse(data);
    if (!parsed.success) {
      const fieldErrors = parsed.error.flatten().fieldErrors as Record<
        string,
        string[]
      >;
      setErrors(fieldErrors);
      setStatus({ kind: "idle" });
      // Move focus to the summary so the errors are announced, not just shown.
      requestAnimationFrame(() => summary.current?.focus());
      return;
    }

    try {
      const response = await fetch("/api/enquiry", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(parsed.data),
      });
      const body = (await response.json()) as {
        ok: boolean;
        error?: string;
        fieldErrors?: Record<string, string[]>;
        delivery?: "sent" | "logged";
      };

      if (!response.ok || !body.ok) {
        if (body.fieldErrors) setErrors(body.fieldErrors);
        setStatus({
          kind: "error",
          message: body.error ?? "Something went wrong. Please try again.",
        });
        requestAnimationFrame(() => summary.current?.focus());
        return;
      }

      window.localStorage.removeItem(DRAFT_KEY);
      setStatus({ kind: "sent", delivery: body.delivery ?? "sent" });
    } catch {
      setStatus({
        kind: "error",
        message:
          "We couldn't reach the studio just now. Please email " +
          "info@lovestoryatelier.com directly.",
      });
      requestAnimationFrame(() => summary.current?.focus());
    }
  }

  if (status.kind === "sent") {
    return (
      <div className={styles.success} role="status">
        <h2 className={styles.successTitle}>
          Thank you &mdash; it&rsquo;s on its way.
        </h2>
        <p>
          We reply to most enquiries within 48 hours, usually with a written
          sketch and quote.
        </p>
        {status.delivery === "logged" ? (
          <p className={styles.devNote}>
            Development note: email is not configured, so this enquiry was
            logged to the server console rather than delivered.
          </p>
        ) : null}
      </div>
    );
  }

  const errorEntries = Object.entries(errors).filter(([, v]) => v?.length);

  return (
    <form
      ref={form}
      className={styles.form}
      onSubmit={onSubmit}
      onChange={saveDraft}
      noValidate
    >
      <input type="hidden" name="veilSlug" defaultValue={veilSlug} />

      {/* Honeypot — off-screen, not `display:none`, so bots still fill it. */}
      <div className={styles.honeypot} aria-hidden="true">
        <label htmlFor="website">Website</label>
        <input id="website" name="website" tabIndex={-1} autoComplete="off" />
      </div>

      {(errorEntries.length > 0 || status.kind === "error") && (
        <div
          ref={summary}
          className={styles.summary}
          role="alert"
          tabIndex={-1}
        >
          {status.kind === "error" ? (
            <p>{status.message}</p>
          ) : (
            <>
              <p>Please check the following:</p>
              <ul>
                {errorEntries.map(([field, messages]) => (
                  <li key={field}>
                    <a href={`#${field}`}>{messages[0]}</a>
                  </li>
                ))}
              </ul>
            </>
          )}
        </div>
      )}

      {FIELDSETS.map((group) => (
        <fieldset key={group.legend} className={styles.fieldset}>
          <legend className={styles.legend}>{group.legend}</legend>
          <div className={styles.grid}>
            {group.fields.map((field) => {
              const fieldErrors = errors[field.name];
              const describedBy = fieldErrors?.length
                ? `${field.name}-error`
                : undefined;
              const required = "required" in field && field.required;

              return (
                <p
                  key={field.name}
                  className={
                    "textarea" in field ? styles.fieldWide : styles.field
                  }
                >
                  <label htmlFor={field.name} className={styles.label}>
                    {field.label}
                    {required ? (
                      <span className={styles.required} aria-hidden="true">
                        {" "}
                        *
                      </span>
                    ) : null}
                  </label>

                  {"textarea" in field ? (
                    <textarea
                      id={field.name}
                      name={field.name}
                      rows={4}
                      required={required}
                      aria-invalid={fieldErrors?.length ? true : undefined}
                      aria-describedby={describedBy}
                      className={styles.input}
                    />
                  ) : (
                    <input
                      id={field.name}
                      name={field.name}
                      type={"type" in field ? field.type : "text"}
                      required={required}
                      aria-invalid={fieldErrors?.length ? true : undefined}
                      aria-describedby={describedBy}
                      className={styles.input}
                    />
                  )}

                  {fieldErrors?.length ? (
                    <span id={`${field.name}-error`} className={styles.error}>
                      {fieldErrors[0]}
                    </span>
                  ) : null}
                </p>
              );
            })}
          </div>
        </fieldset>
      ))}

      <p className={styles.actions}>
        <button
          type="submit"
          className={styles.submit}
          disabled={status.kind === "sending"}
        >
          {status.kind === "sending" ? "Sending…" : "Send enquiry"}
        </button>
        <span className={styles.hint}>
          Fields marked * are required. Your draft saves as you type.
        </span>
      </p>
    </form>
  );
}
