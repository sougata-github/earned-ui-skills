import type { NextConfig } from "next"
import { PHASE_PRODUCTION_BUILD } from "next/constants"

// A static export: `next build` writes the whole site to out/. The export is
// on for the build only, because `next dev` answers 500 for a slug it has
// not listed when it is on.
export default function config(phase: string): NextConfig {
  if (phase === PHASE_PRODUCTION_BUILD && !process.env.NEXT_PUBLIC_SITE_URL) {
    console.warn(
      "\nNEXT_PUBLIC_SITE_URL is not set. Canonical URLs, the sitemap, robots.txt and llms.txt will use a placeholder domain. Set it to the real origin before deploying.\n"
    )
  }
  return {
    output: phase === PHASE_PRODUCTION_BUILD ? "export" : undefined,
    trailingSlash: true,
    images: { unoptimized: true },
  }
}
