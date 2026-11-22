import type { Metadata } from "next"

import { GlassDemoPage } from "@/demos/glass"

// The liquid-glass-web demo on its own: six glass widgets, a material panel
// and a scripted cursor, full window. The skill's page frames it. Not
// indexed, since the skill's page is the one to find.
export const metadata: Metadata = {
  title: "liquid-glass-web, live demo",
  robots: { index: false, follow: true },
}

export default function Page() {
  return <GlassDemoPage />
}
