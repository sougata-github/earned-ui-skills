"use client"

import dynamic from "next/dynamic"

// WebGL and measured layout: drawn in the browser only.
const Demo = dynamic(() => import("./GlassDemo").then((m) => m.GlassDemo), { ssr: false })

export function GlassDemoPage() {
  return <Demo />
}
