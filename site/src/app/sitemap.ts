import type { MetadataRoute } from "next"

import { abs } from "@/lib/site"
import { SKILLS } from "@/lib/skills"

export const dynamic = "force-static"

// The pages worth finding: home and each skill. The demos (noindex) and the
// Markdown twins are left out.
export default function sitemap(): MetadataRoute.Sitemap {
  const latest = SKILLS.map((skill) => skill.updatedAt).sort().at(-1)
  return [
    { url: abs("/"), lastModified: latest, changeFrequency: "weekly", priority: 1 },
    ...SKILLS.map((skill) => ({
      url: abs(skill.href),
      lastModified: skill.updatedAt,
      changeFrequency: "weekly" as const,
      priority: 0.9,
    })),
  ]
}
