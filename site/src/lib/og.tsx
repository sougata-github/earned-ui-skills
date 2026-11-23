import { ImageResponse } from "next/og"

import { LOGO_CHEVRONS, LOGO_DARK, LOGO_LIGHT, LOGO_TILE } from "@/lib/logo"
import { OG_SIZE } from "@/lib/seo"
import { SITE_NAME } from "@/lib/site"

/** A share image, drawn at build time: the mark and the site's name, a
 *  title, a line under it and the install command. */
export function ogImage({ title, subtitle, command }: { title: string; subtitle: string; command: string }) {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: 72,
          background: "#0b0c0f",
          color: "#fafafa",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 18, fontSize: 28, fontWeight: 600 }}>
          <svg width="56" height="56" viewBox="0 0 100 100">
            <path d={LOGO_TILE} fill={LOGO_LIGHT} />
            {LOGO_CHEVRONS.map((d) => (
              <path
                key={d}
                d={d}
                fill="none"
                stroke={LOGO_DARK}
                strokeWidth="10"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            ))}
          </svg>
          {SITE_NAME}
        </div>
        <div style={{ display: "flex", flexDirection: "column" }}>
          <div style={{ display: "flex", fontSize: 72, fontWeight: 600, lineHeight: 1.04, letterSpacing: -2.5 }}>
            {title}
          </div>
          <div style={{ display: "flex", marginTop: 26, fontSize: 30, lineHeight: 1.35, color: "#a1a1aa" }}>
            {subtitle}
          </div>
        </div>
        <div
          style={{
            display: "flex",
            alignSelf: "flex-start",
            padding: "16px 26px",
            borderRadius: 999,
            background: "#1c1d22",
            fontSize: 24,
            color: "#e4e4e7",
          }}
        >
          {command}
        </div>
      </div>
    ),
    OG_SIZE
  )
}
