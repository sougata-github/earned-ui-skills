import { memo, useEffect, useRef, useState, type ComponentType } from "react"

import * as W from "./widgets"
import type { WidgetProps } from "./widgets"

// The widget-bento-web lab's opening, as one sequence:
//
//   1. Blank: nothing but the off white canvas.
//   2. Title: "Launch Day" resolves out of a blur at the centre, holds, then
//      passes toward the viewer and is gone.
//   3. Roll: the wall arrives. Each column rolls in from off screen, a full
//      set of tiles passing by, in alternating directions, one gesture on a
//      critically damped spring: it starts from rest, runs, and settles with
//      no overshoot.
//   4. Live: the wall rests as one composed screen and a conductor wakes two
//      widgets every beat, in a fixed order, never two neighbours.
//
// The wall is a fixed 1440 x 810 stage, zoomed to fit the window, so the
// composed screen is exact at any size. Nothing is random: sizes, delays
// and the order are fixed.
//
// Keys: Space plays the opening again, D switches the theme.

const STAGE_W = 1440
const STAGE_H = 810
const PAD = 24
const GAP = 14
const SET = STAGE_H - 2 * PAD // 762: every column's tiles and gaps add up to this

type Tile = {
  id: string
  Widget: ComponentType<WidgetProps>
  h: number
  dark?: boolean
  /** Padding inside the tile. A tile that is one nested card uses less. */
  pad?: string
  /** No grey tile around it: the widget is its own surface. */
  bare?: boolean
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
      { id: "reviews", Widget: W.Reviews, h: 140 },
      { id: "latency", Widget: W.Latency, h: 124 },
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
const TITLE_IN = 500
const TITLE_OUT = 2700
const ROLL_AT = 3050
const STAGGER = 0.09 // s between columns
const OMEGA = 2.7 // the roll's spring rate, 1/s. Lower is more graceful
const ROLL_FOR = 3.1 // s until a column counts as settled
const BEAT = 520 // ms between two wakes

type Phase = "blank" | "title" | "out" | "wall" | "live"

const TileView = memo(function TileView({ tile, step }: { tile: Tile; step: number }) {
  return (
    <section
      className={`min-w-0 flex-1 rounded-[28px] ${tile.pad ?? "p-[18px]"} ${tile.dark ? "bg-tile-dark text-on-dark" : "bg-tile"}`}
      style={{ height: tile.h }}
    >
      <tile.Widget step={step} />
    </section>
  )
})

function TileSet({ column, steps }: { column: Column; steps?: Record<string, number> }) {
  return (
    <>
      {column.rows.map((row, r) => (
        <div key={r} className="flex shrink-0" style={{ gap: GAP, height: row.h }}>
          {tilesOf(row).map((tile) => (
            <TileView key={tile.id} tile={tile} step={steps?.[tile.id] ?? 0} />
          ))}
        </div>
      ))}
    </>
  )
}

export function WidgetWall() {
  const stage = useRef<HTMLDivElement>(null)
  const strips = useRef<(HTMLDivElement | null)[]>([])
  const extras = useRef<(HTMLDivElement | null)[]>([])
  const [phase, setPhase] = useState<Phase>("blank")
  const [steps, setSteps] = useState<Record<string, number>>({})

  useEffect(() => {
    const el = stage.current
    if (!el) return
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches
    const up = (i: number) => i % 2 === 0
    // A strip holds two sets of the column's tiles. One moving up rests on
    // its second set, one moving down on its first.
    const rest = COLUMNS.map((_, i) => (up(i) ? -(SET + GAP) : 0))
    let zoom = 1
    let raf = 0
    let beat = 0
    const timers: number[] = []

    const fit = () => {
      zoom = Math.min(window.innerWidth / STAGE_W, window.innerHeight / STAGE_H)
      el.style.zoom = String(zoom)
    }
    const place = (ys: number[]) => {
      strips.current.forEach((strip, i) => {
        if (strip) strip.style.transform = `translate3d(0, ${ys[i]}px, 0)`
      })
    }
    const showExtras = (opacity: number[] | null) => {
      extras.current.forEach((extra, i) => {
        if (!extra) return
        extra.style.visibility = opacity ? "visible" : "hidden"
        extra.style.opacity = opacity ? String(opacity[i]) : "0"
      })
    }
    const stop = () => {
      cancelAnimationFrame(raf)
      window.clearInterval(beat)
      timers.splice(0).forEach((t) => window.clearTimeout(t))
    }
    const live = () => {
      place(rest)
      showExtras(null)
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

    const play = () => {
      stop()
      setSteps({})
      if (reduced) {
        live()
        return
      }
      setPhase("blank")
      // Where the screen's edges are, in the stage's own pixels: the strips
      // start just past them, whatever the window's shape.
      const bar = Math.max(0, (window.innerHeight / zoom - STAGE_H) / 2)
      const from = COLUMNS.map((_, i) =>
        up(i) ? STAGE_H - PAD + bar + 12 : -(2 * SET + GAP) - PAD - bar - 12
      )
      place(from)
      showExtras(COLUMNS.map(() => 1))

      timers.push(window.setTimeout(() => setPhase("title"), TITLE_IN))
      timers.push(window.setTimeout(() => setPhase("out"), TITLE_OUT))
      timers.push(
        window.setTimeout(() => {
          setPhase("wall")
          let start = 0
          const frame = (now: number) => {
            if (!start) start = now
            const t = (now - start) / 1000
            const ys: number[] = []
            const fade: number[] = []
            COLUMNS.forEach((_, i) => {
              // Critically damped, from rest: no abrupt start, no overshoot.
              const tau = Math.max(0, t - i * STAGGER)
              const left = (from[i] - rest[i]) * (1 + OMEGA * tau) * Math.exp(-OMEGA * tau)
              ys.push(rest[i] + left)
              // The set that rolled by fades out over the last stretch, so
              // the wall rests as one clean screen.
              fade.push(Math.min(1, Math.abs(left) / 180))
            })
            place(ys)
            showExtras(fade)
            if (t > ROLL_FOR + (COLUMNS.length - 1) * STAGGER) live()
            else raf = requestAnimationFrame(frame)
          }
          raf = requestAnimationFrame(frame)
        }, ROLL_AT)
      )
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
        <div className="absolute inset-0 flex" style={{ gap: GAP, padding: PAD }}>
          {COLUMNS.map((column, i) => {
            const main = (
              <div key="main" className="flex flex-col" style={{ gap: GAP }}>
                <TileSet column={column} steps={steps} />
              </div>
            )
            const extra = (
              <div
                key="extra"
                aria-hidden
                ref={(node) => {
                  extras.current[i] = node
                }}
                className="invisible flex flex-col"
                style={{ gap: GAP }}
              >
                <TileSet column={column} />
              </div>
            )
            return (
              <div key={i} className="relative shrink-0" style={{ width: column.w }}>
                <div
                  ref={(node) => {
                    strips.current[i] = node
                  }}
                  className="absolute inset-x-0 top-0 flex flex-col will-change-transform"
                  style={{ gap: GAP, transform: "translate3d(0, 200vh, 0)" }}
                >
                  {i % 2 === 0 ? [extra, main] : [main, extra]}
                </div>
              </div>
            )
          })}
        </div>

        <h1 className="title pointer-events-none absolute inset-0 grid place-items-center text-[132px] leading-none font-semibold tracking-[-0.05em]">
          <span>
            <span className="title-word">Launch</span> <span className="title-word">Day</span>
          </span>
        </h1>
      </div>
    </main>
  )
}
