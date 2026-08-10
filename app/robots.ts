import type { MetadataRoute } from "next";

import { siteUrl } from "@/lib/siteUrl";

export default function robots(): MetadataRoute.Robots {
  // Indexing stays off until NEXT_PUBLIC_SITE_URL is set, so preview
  // deployments are never indexed by accident.
  const configured = Boolean(process.env.NEXT_PUBLIC_SITE_URL);

  return {
    rules: configured
      ? { userAgent: "*", allow: "/" }
      : { userAgent: "*", disallow: "/" },
    sitemap: `${siteUrl()}/sitemap.xml`,
  };
}
