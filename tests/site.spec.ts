import { expect, test } from "@playwright/test";

const ROUTES = [
  "/",
  "/collection",
  "/collection/cathedral-golden-hour",
  "/custom",
  "/about",
  "/contact",
];

test.describe("routes", () => {
  for (const route of ROUTES) {
    test(`${route} renders with exactly one h1 and no console errors`, async ({
      page,
    }) => {
      const errors: string[] = [];
      page.on("pageerror", (error) => errors.push(String(error)));
      page.on("response", (response) => {
        if (response.status() >= 400) {
          errors.push(`HTTP ${response.status()} ${response.url()}`);
        }
      });

      const response = await page.goto(route);
      expect(response?.status()).toBe(200);

      // Exactly one h1 per page — the source theme had sections that each
      // emitted their own, which breaks the document outline.
      await expect(page.locator("h1")).toHaveCount(1);
      expect(errors).toEqual([]);
    });
  }
});

test("no Shopify routes or Liquid remain anywhere", async ({ page }) => {
  for (const route of ROUTES) {
    await page.goto(route);
    const html = await page.content();
    expect(html).not.toContain("/collections/");
    expect(html).not.toContain("/pages/");
    expect(html).not.toContain("myshopify");
    expect(html).not.toMatch(/\{\{|\{%/);
  }
});

test("collection filters narrow the grid and announce the count", async ({
  page,
}) => {
  await page.goto("/collection");
  const cards = page.locator("ul li a[href^='/collection/']");
  const total = await cards.count();
  expect(total).toBe(12);

  await page.getByRole("button", { name: "Mantilla", exact: true }).click();
  await expect(cards).toHaveCount(3);
  await expect(page.getByText(/The collection · 3 pieces/)).toBeVisible();
});

test("silhouette guide is operable by keyboard", async ({ page }) => {
  await page.goto("/collection");
  const tablist = page.getByRole("tablist", { name: "Veil lengths" });
  const first = tablist.getByRole("tab").first();

  await first.focus();
  await expect(first).toHaveAttribute("aria-selected", "true");

  await page.keyboard.press("ArrowRight");
  await expect(tablist.getByRole("tab").nth(1)).toHaveAttribute(
    "aria-selected",
    "true",
  );

  await page.keyboard.press("End");
  await expect(tablist.getByRole("tab").last()).toHaveAttribute(
    "aria-selected",
    "true",
  );
});

test("enquiry form reports validation errors and never fakes success", async ({
  page,
}) => {
  await page.goto("/contact#enquiry");
  await page.getByRole("button", { name: "Send enquiry" }).click();

  // Scoped to the form: Next injects its own route announcer with
  // role="alert", so an unscoped lookup matches two elements.
  const alert = page.locator("form").getByRole("alert");
  await expect(alert).toBeVisible();
  await expect(alert).toContainText("Please tell us your first name");

  // The success panel must not appear on a failed submission.
  await expect(page.getByText("Thank you")).toHaveCount(0);
});

test("veil page carries truthful Product structured data", async ({ page }) => {
  await page.goto("/collection/cathedral-golden-hour");
  const raw = await page
    .locator('script[type="application/ld+json"]')
    .nth(1)
    .textContent();
  const data = JSON.parse(raw ?? "{}");

  expect(data["@type"]).toBe("Product");
  expect(data.name).toBe("Cathedral Veil · Golden Hour");
  // No price exists in the source, so no offers block may be emitted.
  expect(data.offers).toBeUndefined();
});

test("skip link is reachable and focusable", async ({ page }) => {
  await page.goto("/");
  await page.keyboard.press("Tab");
  await expect(page.getByRole("link", { name: "Skip to content" })).toBeFocused();
});
