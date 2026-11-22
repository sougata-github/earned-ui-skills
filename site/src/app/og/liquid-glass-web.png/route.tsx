import { notFound } from "next/navigation"

import { ogImage } from "@/lib/og"
import { skillBySlug } from "@/lib/skills"

export const dynamic = "force-static"

export function GET() {
  const skill = skillBySlug("liquid-glass-web")
  if (!skill) notFound()
  return ogImage({ title: skill.title, subtitle: skill.builds, command: skill.install })
}
