import type { Metadata } from "next"

import { WidgetDemoPage } from "@/demos/widget"

// The widget-bento-web demo on its own: the launch day wall, full window.
// The skill's page frames it. Not indexed, since the skill's page is the
// one to find.
export const metadata: Metadata = {
  title: "widget-bento-web, live demo",
  robots: { index: false, follow: true },
}

export default function Page() {
  return <WidgetDemoPage />
}
