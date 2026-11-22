import type { NextConfig } from "next"
import { PHASE_PRODUCTION_BUILD } from "next/constants"

// A static export: `next build` writes the whole site to out/. The export is
// on for the build only, because `next dev` answers 500 for a slug it has
// not listed when it is on.
export default function config(phase: string): NextConfig {
  return {
    output: phase === PHASE_PRODUCTION_BUILD ? "export" : undefined,
    trailingSlash: true,
    images: { unoptimized: true },
  }
}
