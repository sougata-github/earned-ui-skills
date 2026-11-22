import type { MetadataRoute } from "next"

import { SITE_URL } from "@/lib/site"

export const dynamic = "force-static"

// Everything is open, to search engines and to AI crawlers alike. The
// crawlers are also named, so the intent is on record. The demos are left
// crawlable and carry their own noindex.
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      { userAgent: "*", allow: "/" },
      {
        userAgent: ["GPTBot", "OAI-SearchBot", "ChatGPT-User", "ClaudeBot", "Claude-SearchBot", "PerplexityBot", "Google-Extended"],
        allow: "/",
      },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  }
}
