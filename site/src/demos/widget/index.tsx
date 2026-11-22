"use client"

import dynamic from "next/dynamic"

// The wall sizes itself to the window, so it is drawn in the browser only.
const Demo = dynamic(() => import("./WidgetWall").then((m) => m.WidgetDemo), { ssr: false })

export function WidgetDemoPage() {
  return <Demo />
}
