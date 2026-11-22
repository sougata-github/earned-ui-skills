import { ogImage } from "@/lib/og"
import { INSTALL_ALL } from "@/lib/site"

// A share image written to a real .png path, so any static host serves it
// with the right type.
export const dynamic = "force-static"

export const GET = () =>
  ogImage({
    title: "UI skills for coding agents, earned the hard way.",
    subtitle: "Free agent skills for Claude Code, Codex and Cursor.",
    command: INSTALL_ALL,
  })
