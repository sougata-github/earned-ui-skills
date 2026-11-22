// A skill's live demo, in a frame on its page. The demo is its own page, so
// inside the frame it fits the frame the way it fits any window.
//
// The frame's shape is set per demo. The glass bento needs height on a
// phone, where it stacks. The wall is one screen at 16:9 from md up, and
// below that it is a moving preview of its first tiles: touches pass
// through to the page, and the link opens the whole wall.
const FRAME: Record<string, { box: string; frame: string }> = {
  "liquid-glass-web": {
    box: "h-[41rem] lg:h-auto lg:aspect-[16/10]",
    frame: "",
  },
  "widget-bento-web": {
    box: "aspect-[4/5] md:aspect-video",
    frame: "pointer-events-none md:pointer-events-auto",
  },
}

export function DemoFrame({ slug, href, title }: { slug: string; href: string; title: string }) {
  const shape = FRAME[slug] ?? { box: "aspect-video", frame: "" }
  return (
    <figure className="flex flex-col gap-3">
      <div className={`relative overflow-hidden rounded-[28px] bg-tile ${shape.box}`}>
        <iframe
          src={`${href}?embed`}
          title={title}
          loading="lazy"
          className={`absolute inset-0 size-full border-0 ${shape.frame}`}
        />
      </div>
      <figcaption className="flex items-center justify-between gap-4 px-1 text-[13px] text-ink-soft">
        <span>Live, running the skill&apos;s own code.</span>
        <a href={href} className="font-medium text-ink underline underline-offset-3">
          Open it full screen
        </a>
      </figcaption>
    </figure>
  )
}
