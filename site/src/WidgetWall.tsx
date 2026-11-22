import { memo, useEffect, useRef, useState, type ComponentType } from "react"

import * as W from "./widgets"
import type { WidgetProps } from "./widgets"

// The widget-bento-web lab's opening, as one sequence:
//
//   1. Blank: nothing but the canvas.
//   2. Title: "Launch Day" comes quietly into focus at the centre, holds,
//      then fades.
//   3. Land: the wall arrives the way a home screen does on unlock. Every
//      tile starts enlarged and pushed out from the centre, past the edges
//      of the screen, and flies in to its place, the centre first and the
//      corners a moment later. One gesture, a long soft settle.
//   4. Live: the wall rests and a conductor wakes two widgets every beat, in
//      a fixed order.
//
// Responsive by arrangement, never by squeezing. Every tile is designed at a
// fixed height and for a narrow range of widths, so a different screen gets
// the same tiles in a different number of columns (five, four, three, two,
// one), each plan laid out by hand so its columns end level. A plan is a
// fixed stage zoomed to the window. Where a plan matches the window's shape
// it fits one screen. Where none does, the wall fills the width and scrolls,
// so it never floats between wide empty bands. Nothing is random: sizes,
// delays and the order are fixed.
//
// Keys: Space plays the opening again, D switches the theme.

const GAP = 14

type TileId =
  | "calendar"
  | "signups"
  | "search"
  | "oncall"
  | "seats"
  | "deploy"
  | "pipeline"
  | "regions"
  | "upload"
  | "invoice"
  | "voice"
  | "chat"
  | "countdown"
  | "flags"
  | "platforms"
  | "reviews"
  | "latency"
  | "revenue"
  | "notifications"
  | "rollout"
  | "inbox"

type Tile = {
  Widget: ComponentType<WidgetProps>
  h: number
  dark?: boolean
  /** Padding inside the tile. A tile that is one nested card uses less. */
  pad?: string
}

const TILES: Record<TileId, Tile> = {
  calendar: { Widget: W.Calendar, h: 318 },
  signups: { Widget: W.Signups, h: 222 },
  search: { Widget: W.Search, h: 76, pad: "p-4" },
  oncall: { Widget: W.OnCall, h: 104, pad: "p-4" },
  seats: { Widget: W.Seats, h: 104, pad: "p-4" },
  deploy: { Widget: W.Deploy, h: 96 },
  pipeline: { Widget: W.Pipeline, h: 218 },
  regions: { Widget: W.Regions, h: 236, dark: true, pad: "p-5" },
  upload: { Widget: W.Upload, h: 170 },
  invoice: { Widget: W.Invoice, h: 274, pad: "p-3" },
  voice: { Widget: W.Voice, h: 150, dark: true },
  chat: { Widget: W.Chat, h: 310 },
  countdown: { Widget: W.Countdown, h: 168, dark: true },
  flags: { Widget: W.Flags, h: 152, pad: "p-3" },
  platforms: { Widget: W.Platforms, h: 122 },
  reviews: { Widget: W.Reviews, h: 130 },
  latency: { Widget: W.Latency, h: 134 },
  revenue: { Widget: W.Revenue, h: 214 },
  notifications: { Widget: W.Notifications, h: 256 },
  rollout: { Widget: W.Rollout, h: 108 },
  inbox: { Widget: W.Inbox, h: 142 },
}

/** One tile, or two sharing a row. */
type Cell = TileId | readonly [TileId, TileId]
const PAIR = ["oncall", "seats"] as const

type Mode = "wide" | "four" | "three" | "two" | "one"
type Plan = {
  pad: number
  /** Column widths. Each is one the widgets were checked at. */
  widths: readonly number[]
  columns: readonly (readonly Cell[])[]
  /** Extra height for a tile in this plan, so the columns end level. */
  grow?: Partial<Record<TileId, number>>
  /** The title's size, px. On one screen it scales with the stage. */
  title: number
}

// Five arrangements of the same 21 tiles. In each, every column's tiles and
// gaps add up to the same height, and the three dark tiles are spread out.
const PLANS: Record<Mode, Plan> = {
  // 1440 x 810, one screen.
  wide: {
    pad: 24,
    title: 64,
    widths: [300, 236, 292, 236, 272],
    columns: [
      ["calendar", "signups", "search", PAIR],
      ["deploy", "pipeline", "regions", "upload"],
      ["invoice", "voice", "chat"],
      ["countdown", "flags", "platforms", "reviews", "latency"],
      ["revenue", "notifications", "rollout", "inbox"],
    ],
  },
  // 1250 x 1004: windows squarer than a screen, tablets on their side.
  four: {
    pad: 24,
    title: 60,
    widths: [290, 290, 290, 290],
    columns: [
      ["calendar", PAIR, "pipeline", "flags", "rollout"],
      ["invoice", "voice", "search", "platforms", "reviews", "latency"],
      ["countdown", "signups", "chat", "revenue"],
      ["deploy", "notifications", "upload", "regions", "inbox"],
    ],
  },
  // 946 x 1328: tablets upright, phones on their side.
  three: {
    pad: 24,
    title: 52,
    widths: [290, 290, 290],
    grow: { voice: 2 },
    columns: [
      ["calendar", "search", PAIR, "regions", "revenue", "flags", "deploy"],
      ["countdown", "pipeline", "notifications", "latency", "upload", "rollout", "inbox"],
      ["invoice", "voice", "chat", "signups", "platforms", "reviews"],
    ],
  },
  // 590 wide: large phones and small tablets.
  two: {
    pad: 16,
    title: 44,
    widths: [272, 272],
    columns: [
      ["calendar", "voice", "signups", "invoice", "deploy", "chat", "search", PAIR, "rollout", "inbox"],
      ["countdown", "revenue", "pipeline", "notifications", "platforms", "regions", "flags", "upload", "reviews", "latency"],
    ],
  },
  // 334 wide: phones.
  one: {
    pad: 16,
    title: 36,
    widths: [302],
    columns: [
      [
        "calendar",
        "countdown",
        "signups",
        "deploy",
        "pipeline",
        "invoice",
        "voice",
        "chat",
        "search",
        PAIR,
        "revenue",
        "notifications",
        "regions",
        "platforms",
        "flags",
        "upload",
        "rollout",
        "reviews",
        "latency",
        "inbox",
      ],
    ],
  },
}

const idsOf = (cell: Cell): readonly TileId[] => (typeof cell === "string" ? [cell] : cell)
const heightOf = (plan: Plan, id: TileId) => TILES[id].h + (plan.grow?.[id] ?? 0)

// Where each tile rests in a plan, from the plan itself (stage pixels), so
// the entrance never has to measure the page.
type Box = { x: number; y: number; w: number; h: number }
function lay(plan: Plan) {
  const boxes = {} as Record<TileId, Box>
  let x = plan.pad
  let height = 0
  plan.columns.forEach((column, i) => {
    let y = plan.pad
    for (const cell of column) {
      const ids = idsOf(cell)
      const w = (plan.widths[i] - GAP * (ids.length - 1)) / ids.length
      const h = heightOf(plan, ids[0])
      ids.forEach((id, k) => {
        boxes[id] = { x: x + k * (w + GAP), y, w, h }
      })
      y += h + GAP
    }
    height = Math.max(height, y - GAP + plan.pad)
    x += plan.widths[i] + GAP
  })
  return { ...plan, boxes, width: x - GAP + plan.pad, height }
}
const STAGES: Record<Mode, ReturnType<typeof lay>> = {
  wide: lay(PLANS.wide),
  four: lay(PLANS.four),
  three: lay(PLANS.three),
  two: lay(PLANS.two),
  one: lay(PLANS.one),
}

// Which plan, and how far to zoom it.
//
//   1. One screen: the plan whose shape is closest to the window's, when it
//      fits at a readable size and leaves little of the window empty.
//   2. Otherwise scroll: the plan with the most columns that stays readable
//      at the window's width and is taller than the window.
//   3. Failing both (a very wide window): the closest one screen fit.
type Fit = { mode: Mode; zoom: number; single: boolean }
const MODES: readonly Mode[] = ["wide", "four", "three", "two", "one"]
const SMALLEST = 0.72 // one screen is never zoomed below this
const READABLE = 0.78 // nor a scrolling plan below this
const LARGEST = 1.3 // nor a scrolling plan above this
const EMPTY = 0.15 // the share of the window one screen may leave empty

function measure(): Fit {
  const w = document.documentElement.clientWidth
  const h = window.innerHeight

  let best: (Fit & { empty: number }) | null = null
  for (const mode of MODES) {
    const { width, height } = STAGES[mode]
    const zoom = Math.min(w / width, h / height)
    if (zoom < SMALLEST) continue
    const empty = 1 - (width * height * zoom * zoom) / (w * h)
    if (!best || empty < best.empty) best = { mode, zoom, single: true, empty }
  }
  if (best && best.empty <= EMPTY) return best

  for (const mode of MODES) {
    const { width, height } = STAGES[mode]
    if (w / width < READABLE) continue
    const zoom = Math.min(w / width, LARGEST)
    if (width * zoom >= 0.9 * w && height * zoom >= h) return { mode, zoom, single: false }
  }
  if (best) return best
  return { mode: "one", zoom: Math.min(w / STAGES.one.width, LARGEST), single: false }
}

// The conductor's fixed order, from the wide plan: across the columns with a
// column skipped each time, so there two changes in a row are never
// neighbours. Each beat wakes one tile and the one half the list away.
const ORDER = (() => {
  const ids: TileId[] = []
  const { columns } = PLANS.wide
  const depth = Math.max(...columns.map((c) => c.length))
  for (let r = 0; r < depth; r++) {
    for (const c of [0, 2, 4, 1, 3]) {
      const cell = columns[c][r]
      if (cell) ids.push(...idsOf(cell))
    }
  }
  return ids
})()

// The timeline, ms.
const TITLE_IN = 400
const TITLE_OUT = 2400
const LAND_AT = 2750 // the title is nearly gone before the first tile shows
const LAND_FOR = 1200 // one tile's flight
const RIPPLE = 150 // the farthest tile leaves this long after the centre one
const BEAT = 520 // between two wakes

// The flight: how far out a tile starts (a share of its distance from the
// centre of the screen), how enlarged, and the curve it lands on. Fast at
// first, then a long soft settle, no overshoot.
const PUSH = 0.9
const SCALE = 1.5
const LAND = "cubic-bezier(0.2, 0.9, 0.2, 1)"
const SOFT = "cubic-bezier(0.33, 1, 0.68, 1)"

type Phase = "blank" | "title" | "out" | "wall" | "live"

const TileView = memo(function TileView({ id, h, step }: { id: TileId; h: number; step: number }) {
  const tile = TILES[id]
  return (
    <section
      data-tile={id}
      className={`tile min-w-0 flex-1 rounded-[28px] ${tile.pad ?? "p-[18px]"} ${tile.dark ? "bg-tile-dark text-on-dark" : "bg-tile"}`}
      style={{ height: h }}
    >
      <tile.Widget step={step} />
    </section>
  )
})

export function WidgetWall() {
  const stageEl = useRef<HTMLDivElement>(null)
  const [fit, setFit] = useState(measure)
  const fitNow = useRef(fit)
  const [phase, setPhase] = useState<Phase>("blank")
  const [steps, setSteps] = useState<Partial<Record<TileId, number>>>({})
  const stage = STAGES[fit.mode]

  useEffect(() => {
    fitNow.current = fit
  }, [fit])

  // Refit when the window changes. The observer also catches a scrollbar
  // arriving, which changes the width without a resize event.
  useEffect(() => {
    const refit = () => {
      const next = measure()
      setFit((now) => (now.mode === next.mode && now.zoom === next.zoom ? now : next)) // same fit, same object
    }
    const observer = new ResizeObserver(refit)
    observer.observe(document.documentElement)
    window.addEventListener("resize", refit)
    return () => {
      observer.disconnect()
      window.removeEventListener("resize", refit)
    }
  }, [])

  useEffect(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches
    let flights: Animation[] = []
    let beat = 0
    const timers: number[] = []

    const stop = () => {
      flights.forEach((flight) => flight.cancel())
      flights = []
      window.clearInterval(beat)
      timers.splice(0).forEach((t) => window.clearTimeout(t))
    }
    const live = () => {
      setPhase("live")
      if (reduced) return
      let n = 0
      beat = window.setInterval(() => {
        const a = ORDER[n % ORDER.length]
        const b = ORDER[(n + Math.floor(ORDER.length / 2)) % ORDER.length]
        n += 1
        setSteps((s) => ({ ...s, [a]: (s[a] ?? 0) + 1, [b]: (s[b] ?? 0) + 1 }))
      }, BEAT)
    }
    const land = () => {
      setPhase("wall")
      const { mode, zoom } = fitNow.current
      const { boxes, width, height } = STAGES[mode]
      // The part of the stage on screen, in the stage's own pixels. The
      // tiles fly in around its centre, and only the ones in it fly.
      const viewH = window.innerHeight / zoom
      const viewTop = (window.scrollY - Math.max(0, (window.innerHeight - height * zoom) / 2)) / zoom
      const cx = width / 2
      const cy = viewTop + viewH / 2
      const far = Math.hypot(width / 2, Math.min(viewH, height) / 2)
      const tiles = stageEl.current?.querySelectorAll<HTMLElement>("[data-tile]") ?? []
      for (const tile of tiles) {
        const box = boxes[tile.dataset.tile as TileId]
        if (!box || box.y + box.h < viewTop || box.y > viewTop + viewH) continue
        const dx = box.x + box.w / 2 - cx
        const dy = box.y + box.h / 2 - cy
        // The centre leaves first: the wall opens outward as it lands.
        const delay = Math.min(1, Math.hypot(dx, dy) / far) * RIPPLE
        const timing = { delay, fill: "backwards" } as const
        flights.push(
          tile.animate(
            [
              { transform: `translate(${dx * PUSH}px, ${dy * PUSH}px) scale(${SCALE})` },
              { transform: "translate(0px, 0px) scale(1)" },
            ],
            { ...timing, duration: LAND_FOR, easing: LAND }
          ),
          // Seen and sharp well before it comes to rest. The blur is a
          // trace, only there to soften the first frames of the fade.
          tile.animate([{ opacity: 0 }, { opacity: 1 }], { ...timing, duration: 420, easing: SOFT }),
          tile.animate([{ filter: "blur(3px)" }, { filter: "blur(0px)" }], {
            ...timing,
            duration: 320,
            easing: SOFT,
          })
        )
      }
    }

    const play = () => {
      stop()
      setSteps({})
      if (reduced) {
        live()
        return
      }
      setPhase("blank")
      timers.push(window.setTimeout(() => setPhase("title"), TITLE_IN))
      timers.push(window.setTimeout(() => setPhase("out"), TITLE_OUT))
      timers.push(window.setTimeout(land, LAND_AT))
      timers.push(window.setTimeout(live, LAND_AT + LAND_FOR + RIPPLE + 200))
    }

    const onKey = (e: KeyboardEvent) => {
      if (e.code === "Space") {
        e.preventDefault()
        play()
      }
      if (e.key === "d" && !e.metaKey && !e.ctrlKey) {
        document.documentElement.classList.toggle("dark")
      }
    }
    window.addEventListener("keydown", onKey)
    // Wait for Onest, so the title never swaps face mid entrance.
    let cancelled = false
    document.fonts.ready.then(() => {
      if (!cancelled) play()
    })

    return () => {
      cancelled = true
      stop()
      window.removeEventListener("keydown", onKey)
    }
  }, [])

  return (
    // Clipped, so a tile flying in from past the edge never adds a scrollbar.
    <main className="grid min-h-dvh place-items-center overflow-clip bg-canvas" data-phase={phase}>
      <h1
        className="title pointer-events-none fixed inset-0 grid place-items-center leading-none font-semibold tracking-[-0.035em]"
        style={{ fontSize: stage.title * (fit.single ? fit.zoom : 1) }}
      >
        <span>
          <span className="title-word">Launch</span> <span className="title-word">Day</span>
        </span>
      </h1>

      <div
        ref={stageEl}
        className="flex shrink-0"
        style={{ width: stage.width, height: stage.height, padding: stage.pad, gap: GAP, zoom: fit.zoom }}
      >
        {stage.columns.map((column, i) => (
          <div key={i} className="flex shrink-0 flex-col" style={{ width: stage.widths[i], gap: GAP }}>
            {column.map((cell) => {
              const ids = idsOf(cell)
              const h = heightOf(stage, ids[0])
              return (
                <div key={ids[0]} className="flex shrink-0" style={{ gap: GAP, height: h }}>
                  {ids.map((id) => (
                    <TileView key={id} id={id} h={h} step={steps[id] ?? 0} />
                  ))}
                </div>
              )
            })}
          </div>
        ))}
      </div>
    </main>
  )
}
