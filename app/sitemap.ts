import type { MetadataRoute } from "next";

import { veils } from "@/content/collection";
import { siteUrl } from "@/lib/siteUrl";

export default function sitemap(): MetadataRoute.Sitemap {
  const routes = ["", "/collection", "/custom", "/about", "/contact"];
  const now = new Date();

  return [
    ...routes.map((route) => ({
      url: `${siteUrl()}${route}`,
      lastModified: now,
      priority: route === "" ? 1 : 0.8,
    })),
    ...veils.map((veil) => ({
      url: `${siteUrl()}/collection/${veil.slug}`,
      lastModified: now,
      priority: 0.6,
    })),
  ];
}
