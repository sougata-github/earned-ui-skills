import { memo, useEffect, useRef, useState, type ComponentType } from "react"

import * as W from "./widgets"
import type { WidgetProps } from "./widgets"

// The widget-bento-web lab's opening, as one sequence:
//
//   1. Blank: nothing but the canvas.
//   2. Title: "Launch Day" comes quietly into focus at the centre, holds,
//      then recedes.
//   3. Land: the wall arrives the way a home screen does on unlock. Every
//      tile starts enlarged and pushed out from the centre, past the edges
//      of the screen, and flies in to its place, the centre first and the
//      corners a moment later. One gesture, a long soft settle.
//   4. Live: the wall rests as one composed screen and a conductor wakes two
//      widgets every beat, in a fixed order, never two neighbours.
//
// The wall is a fixed 1440 x 810 stage, zoomed to fit the window, so the
// composed screen is exact at any size. There is one set of tiles, laid out
// once: the entrance is a transform on each, so nothing reflows. Nothing is
// random: sizes, delays and the order are fixed.
//
// Keys: Space plays the opening again, D switches the theme.

const STAGE_W = 1440
const STAGE_H = 810
const PAD = 24
const GAP = 14 // every column's tiles and gaps add up to 762, the stage less its padding

type Tile = {
  id: string
  Widget: ComponentType<WidgetProps>
  h: number
  dark?: boolean
  /** Padding inside the tile. A tile that is one nested card uses less. */
  pad?: string
}
type Row = Tile | { pair: [Tile, Tile]; h: number }
type Column = { w: number; rows: Row[] }

const COLUMNS: Column[] = [
  {
    w: 300,
    rows: [
      { id: "calendar", Widget: W.Calendar, h: 318 },
      { id: "signups", Widget: W.Signups, h: 222 },
      { id: "search", Widget: W.Search, h: 76, pad: "p-4" },
      {
        h: 104,
        pair: [
          { id: "oncall", Widget: W.OnCall, h: 104, pad: "p-4" },
          { id: "seats", Widget: W.Seats, h: 104, pad: "p-4" },
        ],
      },
    ],
  },
  {
    w: 236,
    rows: [
      { id: "deploy", Widget: W.Deploy, h: 96 },
      { id: "pipeline", Widget: W.Pipeline, h: 218 },
      { id: "regions", Widget: W.Regions, h: 236, dark: true, pad: "p-5" },
      { id: "upload", Widget: W.Upload, h: 170 },
    ],
  },
  {
    w: 292,
    rows: [
      { id: "invoice", Widget: W.Invoice, h: 274, pad: "p-3" },
      { id: "voice", Widget: W.Voice, h: 150, dark: true },
      { id: "chat", Widget: W.Chat, h: 310 },
    ],
  },
  {
    w: 236,
    rows: [
      { id: "countdown", Widget: W.Countdown, h: 168, dark: true },
      { id: "flags", Widget: W.Flags, h: 152, pad: "p-3" },
      { id: "platforms", Widget: W.Platforms, h: 122 },
      { id: "reviews", Widget: W.Reviews, h: 130 },
      { id: "latency", Widget: W.Latency, h: 134 },
    ],
  },
  {
    w: 272,
    rows: [
      { id: "revenue", Widget: W.Revenue, h: 214 },
      { id: "notifications", Widget: W.Notifications, h: 256 },
      { id: "rollout", Widget: W.Rollout, h: 108 },
      { id: "inbox", Widget: W.Inbox, h: 142 },
    ],
  },
]

const tilesOf = (row: Row): Tile[] => ("pair" in row ? row.pair : [row])

// Where each tile's centre rests, from the layout itself (stage pixels), so
// the entrance never has to measure the page.
const CENTRES = (() => {
  const out: Record<string, readonly [number, number]> = {}
  let x = PAD
  for (const column of COLUMNS) {
    let y = PAD
    for (const row of column.rows) {
      const tiles = tilesOf(row)
      const w = (column.w - GAP * (tiles.length - 1)) / tiles.length
      tiles.forEach((tile, i) => {
        out[tile.id] = [x + i * (w + GAP) + w / 2, y + row.h / 2]
      })
      y += row.h + GAP
    }
    x += column.w + GAP
  }
  return out
})()
const FAR = Math.max(
  ...Object.values(CENTRES).map(([x, y]) => Math.hypot(x - STAGE_W / 2, y - STAGE_H / 2))
)

// The conductor's fixed order: across the columns with a column skipped
// each time, so two changes in a row are never neighbours. Each beat wakes
// one tile and the one half the list away.
const ORDER = (() => {
  const ids: string[] = []
  const depth = Math.max(...COLUMNS.map((c) => c.rows.length))
  for (let r = 0; r < depth; r++) {
    for (const c of [0, 2, 4, 1, 3]) {
      const row = COLUMNS[c].rows[r]
      if (row) for (const t of tilesOf(row)) ids.push(t.id)
    }
  }
  return ids
})()

// The timeline, ms.
const TITLE_IN = 400
const TITLE_OUT = 2400
const LAND_AT = 2650
const LAND_FOR = 1200 // one tile's flight
const RIPPLE = 150 // the farthest tile leaves this long after the centre one
const BEAT = 520 // between two wakes

// The flight: how far out a tile starts (a share of its distance from the
// centre), how enlarged, and the curve it lands on. Fast at first, then a
// long soft settle, no overshoot.
const PUSH = 0.9
const SCALE = 1.5
const LAND = "cubic-bezier(0.2, 0.9, 0.2, 1)"

type Phase = "blank" | "title" | "out" | "wall" | "live"

const TileView = memo(function TileView({ tile, step }: { tile: Tile; step: number }) {
  return (
    <section
      data-tile={tile.id}
      className={`tile min-w-0 flex-1 rounded-[28px] ${tile.pad ?? "p-[18px]"} ${tile.dark ? "bg-tile-dark text-on-dark" : "bg-tile"}`}
      style={{ height: tile.h }}
    >
      <tile.Widget step={step} />
    </section>
  )
})

export function WidgetWall() {
  const stage = useRef<HTMLDivElement>(null)
  const [phase, setPhase] = useState<Phase>("blank")
  const [steps, setSteps] = useState<Record<string, number>>({})

  useEffect(() => {
    const el = stage.current
    if (!el) return
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches
    const tiles = Array.from(el.querySelectorAll<HTMLElement>("[data-tile]"))
    let flights: Animation[] = []
    let beat = 0
    const timers: number[] = []

    const fit = () => {
      el.style.zoom = String(Math.min(window.innerWidth / STAGE_W, window.innerHeight / STAGE_H))
    }
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
      for (const tile of tiles) {
        const [cx, cy] = CENTRES[tile.dataset.tile ?? ""] ?? [STAGE_W / 2, STAGE_H / 2]
        const dx = cx - STAGE_W / 2
        const dy = cy - STAGE_H / 2
        // The centre leaves first: the wall opens outward as it lands.
        const delay = (Math.hypot(dx, dy) / FAR) * RIPPLE
        const timing = { delay, fill: "backwards" } as const
        flights.push(
          tile.animate(
            [
              { transform: `translate(${dx * PUSH}px, ${dy * PUSH}px) scale(${SCALE})` },
              { transform: "translate(0px, 0px) scale(1)" },
            ],
            { ...timing, duration: LAND_FOR, easing: LAND }
          ),
          // Seen and sharp well before it comes to rest.
          tile.animate([{ opacity: 0 }, { opacity: 1 }], {
            ...timing,
            duration: 420,
            easing: "cubic-bezier(0.33, 1, 0.68, 1)",
          }),
          tile.animate([{ filter: "blur(10px)" }, { filter: "blur(0px)" }], {
            ...timing,
            duration: 560,
            easing: "cubic-bezier(0.33, 1, 0.68, 1)",
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
    fit()
    window.addEventListener("resize", fit)
    window.addEventListener("keydown", onKey)
    // Wait for Onest, so the title never swaps face mid entrance.
    let cancelled = false
    document.fonts.ready.then(() => {
      if (!cancelled) play()
    })

    return () => {
      cancelled = true
      stop()
      window.removeEventListener("resize", fit)
      window.removeEventListener("keydown", onKey)
    }
  }, [])

  return (
    <main className="fixed inset-0 grid place-items-center overflow-hidden bg-canvas" data-phase={phase}>
      <div ref={stage} className="relative shrink-0" style={{ width: STAGE_W, height: STAGE_H }}>
        <h1 className="title pointer-events-none absolute inset-0 grid place-items-center text-[64px] leading-none font-semibold tracking-[-0.035em]">
          <span>
            <span className="title-word">Launch</span> <span className="title-word">Day</span>
          </span>
        </h1>

        <div className="absolute inset-0 flex" style={{ gap: GAP, padding: PAD }}>
          {COLUMNS.map((column, i) => (
            <div key={i} className="flex shrink-0 flex-col" style={{ width: column.w, gap: GAP }}>
              {column.rows.map((row, r) => (
                <div key={r} className="flex shrink-0" style={{ gap: GAP, height: row.h }}>
                  {tilesOf(row).map((tile) => (
                    <TileView key={tile.id} tile={tile} step={steps[tile.id] ?? 0} />
                  ))}
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
    </main>
  )
}
