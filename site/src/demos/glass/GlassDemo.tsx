"use client"

import { useEffect, useRef } from "react"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  Airplane01Icon,
  ArrowUp02Icon,
  BluetoothIcon,
  Mic01Icon,
  Moon02Icon,
  NextIcon,
  PauseIcon,
  PlayIcon,
  PreviousIcon,
  SunCloud01Icon,
  Sun03Icon,
  VolumeHighIcon,
  Wifi01Icon,
} from "@hugeicons/core-free-icons"

import { GlassStage, materializeCurve, measureShapes, type GlassMaterial } from "@/skill/glass/glass"

// The liquid-glass-web demo. Six glass widgets as a bento on an image, a
// material panel beside them, and a scripted cursor that tunes the glass,
// then uses the widgets: play, volume and brightness by hand, typing a
// message and sending it, switching Wi-Fi and airplane mode, pausing, and
// ending on the look that read best (no edge band, no rim). The album cover
// is a glass inset: glass on glass. It runs the skill's own renderer.
//
// It fills its window, at any size. On a wide window the material panel sits
// beside the bento and the cursor drags its sliders. On a narrower one the
// panel is left out and the material tunes itself. On a phone the bento
// stacks into two columns.
//
// The script plays on its own and loops. The button at the bottom left stops
// it, and the sliders then work by hand. Space does the same.

const cn = (...classes: (string | false | null | undefined)[]) => classes.filter(Boolean).join(" ")

type ParamKey =
  | "lightAngle"
  | "thickness"
  | "bezel"
  | "ior"
  | "dispersion"
  | "frost"
  | "rim"
  | "specular"
  | "shadow"

const PARAMS: {
  key: ParamKey
  label: string
  min: number
  max: number
  step: number
  digits: number
}[] = [
  {
    key: "lightAngle",
    label: "Light angle",
    min: 0,
    max: 360,
    step: 1,
    digits: 0,
  },
  {
    key: "thickness",
    label: "Thickness",
    min: 0,
    max: 100,
    step: 1,
    digits: 0,
  },
  { key: "bezel", label: "Edge band", min: 0, max: 40, step: 1, digits: 0 },
  { key: "ior", label: "Refraction", min: 1, max: 2, step: 0.01, digits: 2 },
  {
    key: "dispersion",
    label: "Dispersion",
    min: 0,
    max: 0.15,
    step: 0.001,
    digits: 3,
  },
  { key: "frost", label: "Frost", min: 0, max: 24, step: 0.5, digits: 1 },
  { key: "rim", label: "Rim light", min: 0, max: 1.5, step: 0.01, digits: 2 },
  {
    key: "specular",
    label: "Specular",
    min: 0,
    max: 1.5,
    step: 0.01,
    digits: 2,
  },
  { key: "shadow", label: "Shadow", min: 0, max: 0.6, step: 0.01, digits: 2 },
]

const START: GlassMaterial = {
  bezel: 16,
  thickness: 42,
  ior: 1.22,
  dispersion: 0.012,
  magnify: 1,
  frost: 6,
  tint: 0,
  tintColor: [1, 1, 1],
  dim: 0.08,
  rim: 0.3,
  specular: 0.6,
  shadow: 0.18,
  lightAngle: 135,
  blend: 0,
}

// The site's own plate: clouds in a deep blue sky, made for this demo.
const IMAGE = { src: "/glass/clouds-3072.avif", fallback: "/glass/clouds-3072.webp" }

const WIDGETS = [
  "player",
  "weather",
  "timer",
  "controls",
  "levels",
  "composer",
] as const
type WidgetId = (typeof WIDGETS)[number]

const TRACK = { start: 72, length: 187 }
const MESSAGE = "Plan a quiet morning for deep work"

// ---------------------------------------------------------------- script

type Level = "volume" | "brightness"
type Point = { x: number; y: number }
type Target =
  | { kind: "thumb"; param: ParamKey }
  | { kind: "el"; name: string }
  | { kind: "level"; name: Level }
  | { kind: "away" }
type Action = "play" | "pause" | "focus" | "send" | "wifi" | "airplane"

type Step =
  | { at: number; dur: number; kind: "move"; to: Target }
  | { at: number; dur: number; kind: "drag"; param: ParamKey; to: number }
  | { at: number; dur: number; kind: "level"; name: Level; to: number }
  | { at: number; dur: number; kind: "click"; act: Action }
  | { at: number; dur: number; kind: "type"; text: string }

const thumb = (param: ParamKey): Target => ({ kind: "thumb", param })
const el = (name: string): Target => ({ kind: "el", name })
const CLICK = 0.14

// Key times for typing: a steady hand, a little slower after a space, with
// a fixed jitter so every pass types the same way.
function keyTimes(text: string) {
  const times: number[] = []
  let t = 0
  for (let i = 0; i < text.length; i++) {
    const jitter = (((Math.sin(i * 12.9898) * 43758.5453) % 1) + 1) % 1
    t += 0.045 + jitter * 0.035 + (text[i - 1] === " " ? 0.05 : 0)
    times.push(t)
  }
  return times
}
const KEYS = keyTimes(MESSAGE)

// Seconds.
const SCRIPT: Step[] = [
  // Tune the glass.
  { at: 1.2, dur: 0.9, kind: "move", to: thumb("lightAngle") },
  { at: 2.2, dur: 1.3, kind: "drag", param: "lightAngle", to: 35 },
  { at: 3.5, dur: 1.6, kind: "drag", param: "lightAngle", to: 250 },
  { at: 5.1, dur: 0.8, kind: "drag", param: "lightAngle", to: 135 },
  { at: 6.1, dur: 0.5, kind: "move", to: thumb("thickness") },
  { at: 6.7, dur: 0.9, kind: "drag", param: "thickness", to: 96 },
  { at: 7.6, dur: 0.9, kind: "drag", param: "thickness", to: 10 },
  { at: 8.5, dur: 0.6, kind: "drag", param: "thickness", to: 42 },
  { at: 9.3, dur: 0.5, kind: "move", to: thumb("dispersion") },
  { at: 9.9, dur: 0.9, kind: "drag", param: "dispersion", to: 0.13 },
  { at: 10.9, dur: 0.6, kind: "drag", param: "dispersion", to: 0.012 },
  { at: 11.7, dur: 0.5, kind: "move", to: thumb("frost") },
  { at: 12.3, dur: 0.7, kind: "drag", param: "frost", to: 0 },
  { at: 13.1, dur: 0.8, kind: "drag", param: "frost", to: 18 },
  { at: 14.0, dur: 0.5, kind: "drag", param: "frost", to: 6 },
  // Use the widgets.
  { at: 14.7, dur: 0.8, kind: "move", to: el("play") },
  { at: 15.6, dur: CLICK, kind: "click", act: "play" },
  { at: 16.1, dur: 0.7, kind: "move", to: { kind: "level", name: "volume" } },
  { at: 16.9, dur: 0.7, kind: "level", name: "volume", to: 0.88 },
  { at: 17.6, dur: 0.5, kind: "level", name: "volume", to: 0.6 },
  {
    at: 18.3,
    dur: 0.5,
    kind: "move",
    to: { kind: "level", name: "brightness" },
  },
  { at: 18.9, dur: 0.8, kind: "level", name: "brightness", to: 0.18 },
  { at: 20.0, dur: 0.7, kind: "level", name: "brightness", to: 0.7 },
  { at: 20.9, dur: 0.8, kind: "move", to: el("input") },
  { at: 21.8, dur: CLICK, kind: "click", act: "focus" },
  { at: 22.1, dur: KEYS[KEYS.length - 1], kind: "type", text: MESSAGE },
  { at: 24.4, dur: 0.6, kind: "move", to: el("send") },
  { at: 25.1, dur: CLICK, kind: "click", act: "send" },
  { at: 25.6, dur: 0.7, kind: "move", to: el("wifi") },
  { at: 26.4, dur: CLICK, kind: "click", act: "wifi" },
  { at: 26.8, dur: 0.4, kind: "move", to: el("airplane") },
  { at: 27.3, dur: CLICK, kind: "click", act: "airplane" },
  { at: 28.0, dur: CLICK, kind: "click", act: "airplane" },
  { at: 28.4, dur: 0.4, kind: "move", to: el("wifi") },
  { at: 28.9, dur: CLICK, kind: "click", act: "wifi" },
  { at: 29.4, dur: 0.8, kind: "move", to: el("play") },
  { at: 30.3, dur: CLICK, kind: "click", act: "pause" },
  // End on the look that read best.
  { at: 30.9, dur: 0.8, kind: "move", to: thumb("bezel") },
  { at: 31.8, dur: 0.8, kind: "drag", param: "bezel", to: 0 },
  { at: 32.8, dur: 0.6, kind: "move", to: thumb("rim") },
  { at: 33.5, dur: 0.7, kind: "drag", param: "rim", to: 0 },
  { at: 34.6, dur: 1.1, kind: "move", to: { kind: "away" } },
]
const LOOP = 37
const MATERIALIZE = 1.1

const ease = (t: number) =>
  t < 0.5 ? 4 * t * t * t : 1 - (-2 * t + 2) ** 3 / 2
const clamp01 = (t: number) => Math.min(1, Math.max(0, t))

type Frame = {
  material: GlassMaterial
  cursor: Point
  pressed: boolean
  look: "arrow" | "text"
  playing: boolean
  position: number
  volume: number
  brightness: number
  typed: string
  focused: boolean
  wifi: boolean
  airplane: boolean
}

type Layout = {
  thumbAt: (param: ParamKey, value: number) => Point
  elAt: (name: string) => Point
  levelAt: (name: Level, value: number) => Point
  away: Point
}

// The whole script as a pure function of time: the loop restarts cleanly
// and any frame can be recorded.
function frameAt(t: number, layout: Layout): Frame {
  const f: Frame = {
    material: { ...START },
    cursor: layout.away,
    pressed: false,
    look: "arrow",
    playing: false,
    position: TRACK.start,
    volume: 0.4,
    brightness: 0.62,
    typed: "",
    focused: false,
    wifi: true,
    airplane: false,
  }
  let playFrom = 0

  const resolve = (target: Target): Point => {
    if (target.kind === "thumb")
      return layout.thumbAt(target.param, f.material[target.param])
    if (target.kind === "el") return layout.elAt(target.name)
    if (target.kind === "level")
      return layout.levelAt(target.name, f[target.name])
    return layout.away
  }

  for (const step of SCRIPT) {
    if (t < step.at) break
    const k = clamp01((t - step.at) / step.dur)

    if (step.kind === "move") {
      f.look = "arrow"
      const to = resolve(step.to)
      const e = ease(k)
      const arc =
        Math.sin(Math.PI * e) *
        Math.hypot(to.x - f.cursor.x, to.y - f.cursor.y) *
        0.08
      f.cursor = {
        x: f.cursor.x + (to.x - f.cursor.x) * e,
        y: f.cursor.y + (to.y - f.cursor.y) * e - arc,
      }
      f.pressed = false
    } else if (step.kind === "drag") {
      const from = f.material[step.param]
      f.material[step.param] = from + (step.to - from) * ease(k)
      f.cursor = layout.thumbAt(step.param, f.material[step.param])
      f.pressed = k < 1
    } else if (step.kind === "level") {
      const from = f[step.name]
      f[step.name] = from + (step.to - from) * ease(k)
      f.cursor = layout.levelAt(step.name, f[step.name])
      f.pressed = k < 1
    } else if (step.kind === "click") {
      f.pressed = k < 1
      if (step.act === "play" && !f.playing) {
        f.playing = true
        playFrom = step.at
      } else if (step.act === "pause" && f.playing) {
        f.playing = false
        f.position += step.at - playFrom
      } else if (step.act === "focus") {
        f.focused = true
        f.look = "text"
      } else if (step.act === "send") {
        f.typed = ""
        f.focused = false
      } else if (step.act === "wifi") {
        f.wifi = !f.wifi
      } else if (step.act === "airplane") {
        f.airplane = !f.airplane
      }
    } else {
      const elapsed = t - step.at
      f.typed = step.text.slice(0, KEYS.filter((key) => key <= elapsed).length)
    }
  }
  if (f.playing) f.position += t - playFrom
  return f
}

const clock = (s: number) =>
  `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, "0")}`

// ---------------------------------------------------------------- component

export function GlassDemo() {
  const rootRef = useRef<HTMLDivElement>(null)
  const sceneRef = useRef<HTMLDivElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const coverRef = useRef<HTMLDivElement>(null)
  const cursorRef = useRef<HTMLDivElement>(null)
  const widgets = useRef<Partial<Record<WidgetId, HTMLDivElement | null>>>({})
  const inputs = useRef<Partial<Record<ParamKey, HTMLInputElement | null>>>({})
  const labels = useRef<Partial<Record<ParamKey, HTMLSpanElement | null>>>({})
  const material = useRef<GlassMaterial>({ ...START })

  useEffect(() => {
    const canvas = canvasRef.current
    const root = rootRef.current
    const scene = sceneRef.current
    if (!canvas || !root || !scene) return
    if (!GlassStage.supported()) {
      root.dataset.fallback = "true"
      return
    }

    const stage = new GlassStage(canvas)
    stage.setMaterialize(0)
    let loaded = false
    stage.setImage(IMAGE.src, IMAGE.fallback).then(() => {
      loaded = true
    })

    const q = <T extends Element>(name: string) =>
      root.querySelector<T>(`[data-target="${name}"]`)
    const centre = (node: Element | null): Point => {
      if (!node) return { x: 0, y: 0 }
      const r = node.getBoundingClientRect()
      return { x: r.left + r.width / 2, y: r.top + r.height / 2 }
    }
    const layout = (): Layout => ({
      away: { x: window.innerWidth * 1.05, y: window.innerHeight * 1.08 },
      elAt: (name) => centre(q(name)),
      thumbAt: (param, value) => {
        const input = inputs.current[param]
        const spec = PARAMS.find((p) => p.key === param)!
        const away = { x: window.innerWidth * 1.05, y: window.innerHeight * 1.08 }
        // No panel on this window: the cursor waits off stage.
        if (!input || input.offsetParent === null) return away
        const r = input.getBoundingClientRect()
        const f = (value - spec.min) / (spec.max - spec.min)
        return { x: r.left + 7 + f * (r.width - 14), y: r.top + r.height / 2 }
      },
      levelAt: (name, value) => {
        const node = q(name)
        if (!node) return { x: 0, y: 0 }
        const r = node.getBoundingClientRect()
        return { x: r.left + r.width / 2, y: r.bottom - value * r.height + 6 }
      },
    })

    // Writes one frame of widget state into the DOM.
    const apply = (f: Frame) => {
      root.dataset.playingTrack = String(f.playing)
      const progress = q<HTMLElement>("progress")
      if (progress)
        progress.style.transform = `scaleX(${f.position / TRACK.length})`
      const elapsed = q<HTMLElement>("elapsed")
      if (elapsed) elapsed.textContent = clock(f.position)
      for (const name of ["volume", "brightness"] as const) {
        const fill = q<HTMLElement>(`${name}-fill`)
        if (fill) fill.style.transform = `scaleY(${f[name]})`
      }
      scene.style.filter = `brightness(${(0.4 + (0.6 * f.brightness) / 0.62).toFixed(3)})`
      const typed = q<HTMLElement>("typed")
      if (typed) typed.textContent = f.typed
      root.dataset.empty = String(f.typed.length === 0)
      root.dataset.focused = String(f.focused)
      q<HTMLElement>("wifi")?.setAttribute("data-on", String(f.wifi))
      q<HTMLElement>("airplane")?.setAttribute("data-on", String(f.airplane))
    }

    const syncPanel = (m: GlassMaterial) => {
      for (const p of PARAMS) {
        const input = inputs.current[p.key]
        if (input && document.activeElement !== input)
          input.value = String(m[p.key])
        const label = labels.current[p.key]
        if (label) label.textContent = m[p.key].toFixed(p.digits)
      }
    }

    // Nothing is drawn while the demo is off screen.
    let seen = true
    const watcher = new IntersectionObserver(([entry]) => {
      seen = entry.isIntersecting
    })
    watcher.observe(root)

    let playFrom: number | null = null
    let firstPass = true
    let materializeFrom: number | null = null
    let raf = 0

    const tick = (now: number) => {
      raf = requestAnimationFrame(tick)
      if (!seen) return
      const cursor = cursorRef.current

      if (playFrom !== null) {
        let t = (now - playFrom) / 1000
        if (t >= LOOP) {
          playFrom = now
          firstPass = false
          t = 0
        }
        const f = frameAt(t, layout())
        material.current = f.material
        syncPanel(f.material)
        apply(f)
        if (cursor) {
          cursor.dataset.look = f.look
          cursor.style.transform = `translate(${f.cursor.x}px, ${f.cursor.y}px) scale(${f.pressed ? 0.86 : 1})`
        }
        stage.setMaterialize(firstPass ? clamp01(t / MATERIALIZE) ** 0.8 : 1)
      } else {
        if (materializeFrom !== null) {
          stage.setMaterialize(materializeCurve(now - materializeFrom))
        }
      }

      // Measure after every DOM write of this frame, so the glass and the
      // HTML on it never drift apart by a frame.
      stage.setShapes(
        measureShapes(
          canvas,
          // The panels, then the cover: a glass inset on the player.
          [
            ...WIDGETS.map((id) => widgets.current[id] ?? null),
            coverRef.current,
          ]
        )
      )
      stage.setMaterial(material.current)
      if (loaded && materializeFrom === null && playFrom === null)
        materializeFrom = now
      stage.render()
    }

    const resize = new ResizeObserver(() => {
      stage.resize()
      stage.render()
    })
    resize.observe(canvas)

    const start = () => {
      playFrom = performance.now()
      firstPass = true
      root.dataset.playing = "true"
    }
    const stop = () => {
      playFrom = null
      root.dataset.playing = "false"
      material.current = { ...START }
      syncPanel(START)
      apply(frameAt(0, layout()))
      stage.setMaterialize(1)
    }
    const toggle = () => {
      if (playFrom === null) start()
      else stop()
    }
    const onKey = (e: KeyboardEvent) => {
      if (e.code === "Space") {
        e.preventDefault()
        toggle()
      }
    }
    // The button, by delegation: this effect owns the state.
    const onClick = (e: MouseEvent) => {
      if ((e.target as HTMLElement).closest("[data-action=toggle]")) toggle()
    }
    window.addEventListener("keydown", onKey)
    root.addEventListener("click", onClick)
    // The script plays on its own, unless motion is unwelcome.
    if (!window.matchMedia("(prefers-reduced-motion: reduce)").matches) start()

    raf = requestAnimationFrame(tick)
    return () => {
      cancelAnimationFrame(raf)
      resize.disconnect()
      watcher.disconnect()
      window.removeEventListener("keydown", onKey)
      root.removeEventListener("click", onClick)
      stage.dispose()
    }
  }, [])

  return (
    <div
      ref={rootRef}
      data-playing="false"
      data-playing-track="false"
      data-empty="true"
      data-focused="false"
      className="group/demo fixed inset-0 overflow-hidden bg-on-art-inverse font-sans text-on-art select-none"
    >
      <style>
        {
          "@keyframes demo-caret { 0%, 49% { opacity: 1 } 50%, 100% { opacity: 0 } }"
        }
      </style>
      {/* Everything the brightness capsule dims. The cursor stays outside. */}
      <div
        ref={sceneRef}
        className="absolute inset-0 bg-cover bg-center group-data-[fallback=true]/demo:bg-[url(/glass/clouds-3072.webp)]"
      >
        <canvas
          ref={canvasRef}
          aria-hidden
          className="absolute inset-0 size-full"
        />

        <div className="relative grid size-full items-center gap-8 px-4 py-4 sm:px-6 min-[1040px]:grid-cols-[minmax(0,1fr)_19rem] min-[1040px]:px-[4vw]">
          {/* The bento: six glass widgets. Content on glass uses fills and
              light ink, never glass on glass. */}
          {/* On a phone the six sit in two columns (the rows below dissolve
              into this grid). From sm up they are the original three rows. */}
          <div className="mx-auto grid w-full max-w-[26rem] grid-cols-2 gap-3 sm:flex sm:max-w-[52rem] sm:flex-col sm:gap-4">
            <div className="contents sm:flex sm:gap-4">
              <Widget
                ref={(node) => {
                  widgets.current.player = node
                }}
                className="col-span-2 h-[12.5rem] rounded-[30px] p-5 sm:h-[13.5rem] sm:flex-[2] sm:rounded-[34px] sm:p-6"
              >
                <Player coverRef={coverRef} />
              </Widget>
              <Widget
                ref={(node) => {
                  widgets.current.weather = node
                }}
                className="h-[10.25rem] rounded-[30px] p-4 sm:h-[13.5rem] sm:flex-1 sm:rounded-[34px] sm:p-6"
              >
                <Weather />
              </Widget>
            </div>
            <div className="contents sm:flex sm:gap-4">
              <Widget
                ref={(node) => {
                  widgets.current.timer = node
                }}
                className="h-[10.25rem] rounded-[30px] p-4 sm:h-[12.5rem] sm:flex-1 sm:rounded-[34px] sm:p-5"
              >
                <Timer />
              </Widget>
              <Widget
                ref={(node) => {
                  widgets.current.controls = node
                }}
                className="h-[10.25rem] rounded-[30px] p-3 sm:size-[12.5rem] sm:shrink-0 sm:rounded-[34px] sm:p-4"
              >
                <Controls />
              </Widget>
              <Widget
                ref={(node) => {
                  widgets.current.levels = node
                }}
                className="h-[10.25rem] rounded-[30px] p-4 sm:h-[12.5rem] sm:flex-1 sm:rounded-[34px] sm:p-5"
              >
                <Levels />
              </Widget>
            </div>
            <Widget
              ref={(node) => {
                widgets.current.composer = node
              }}
              className="col-span-2 h-14 rounded-full pr-1.5 pl-5 sm:h-16 sm:pr-2 sm:pl-6"
            >
              <Composer />
            </Widget>
          </div>

          {/* The material panel. Solid, not glass: it is a tool, not part
              of the scene. */}
          <aside className="hidden flex-col gap-4 rounded-[22px] bg-on-art-inverse/85 p-5 ring-1 ring-on-art/10 min-[1040px]:flex">
            <div className="flex items-baseline justify-between">
              <p className="text-[15px] font-semibold">Material</p>
              <p className="font-mono text-[11px] text-on-art/50">WebGL2</p>
            </div>
            {PARAMS.map((p) => (
              <label key={p.key} className="flex flex-col gap-1.5">
                <span className="flex items-baseline justify-between text-[12px]">
                  <span className="text-on-art/70">{p.label}</span>
                  <span
                    ref={(node) => {
                      labels.current[p.key] = node
                    }}
                    className="font-mono text-on-art tabular-nums"
                  >
                    {START[p.key].toFixed(p.digits)}
                  </span>
                </span>
                <input
                  ref={(node) => {
                    inputs.current[p.key] = node
                  }}
                  type="range"
                  min={p.min}
                  max={p.max}
                  step={p.step}
                  defaultValue={START[p.key]}
                  onChange={(e) => {
                    material.current = {
                      ...material.current,
                      [p.key]: Number(e.target.value),
                    }
                    const label = labels.current[p.key]
                    if (label)
                      label.textContent = Number(e.target.value).toFixed(
                        p.digits
                      )
                  }}
                  className="h-4 w-full cursor-pointer appearance-none bg-transparent [&::-moz-range-thumb]:size-3.5 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:border-0 [&::-moz-range-thumb]:bg-on-art [&::-moz-range-track]:h-[3px] [&::-moz-range-track]:rounded-full [&::-moz-range-track]:bg-on-art/20 [&::-webkit-slider-runnable-track]:h-[3px] [&::-webkit-slider-runnable-track]:rounded-full [&::-webkit-slider-runnable-track]:bg-on-art/20 [&::-webkit-slider-thumb]:-mt-[5.5px] [&::-webkit-slider-thumb]:size-3.5 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-on-art"
                />
              </label>
            ))}
          </aside>
        </div>
      </div>

      {/* Stop or play the script. Solid, like the panel: a tool, not part
          of the scene. */}
      <button
        type="button"
        data-action="toggle"
        className="absolute bottom-3 left-3 h-9 cursor-pointer rounded-full bg-on-art-inverse/85 px-4 text-[12px] font-medium ring-1 ring-on-art/10 transition-colors duration-150 group-data-[fallback=true]/demo:hidden hover:bg-on-art-inverse sm:bottom-4 sm:left-4"
      >
        <span className="group-data-[playing=true]/demo:hidden">Play the script</span>
        <span className="hidden group-data-[playing=true]/demo:inline">Stop and try it</span>
      </button>

      {/* The scripted cursor, its hotspot at its own top left: an arrow,
          or an I-beam while it types. */}
      <div
        ref={cursorRef}
        aria-hidden
        data-look="arrow"
        className="group/cursor pointer-events-none absolute top-0 left-0 z-10 hidden origin-top-left transition-[scale] group-data-[playing=true]/demo:block"
      >
        <svg
          width="24"
          height="30"
          viewBox="0 0 24 30"
          className="drop-shadow-[0_2px_3px_rgb(0_0_0/0.35)] group-data-[look=text]/cursor:hidden"
        >
          <path
            d="M2 2 L2 24 L8 18.5 L12 27.5 L15.6 26 L11.7 17.2 L19.5 17.2 Z"
            className="fill-on-art-inverse stroke-on-art"
            strokeWidth="1.6"
            strokeLinejoin="round"
          />
        </svg>
        <svg
          width="14"
          height="26"
          viewBox="0 0 14 26"
          className="hidden -translate-x-[7px] -translate-y-[13px] drop-shadow-[0_1px_2px_rgb(0_0_0/0.4)] group-data-[look=text]/cursor:block"
        >
          <path
            d="M3 2 H6 Q7 2 7 4 V22 Q7 24 6 24 H3 M11 2 H8 Q7 2 7 4 M11 24 H8 Q7 24 7 22"
            fill="none"
            className="stroke-on-art"
            strokeWidth="1.8"
            strokeLinecap="round"
          />
        </svg>
      </div>
    </div>
  )
}

function Widget({
  ref,
  className,
  children,
}: {
  ref: (node: HTMLDivElement | null) => void
  className?: string
  children: React.ReactNode
}) {
  // Transparent: the canvas draws the glass where this box is. Without
  // WebGL2 it is a solid surface, never a blur standing in for glass.
  return (
    <div
      ref={ref}
      className={cn("relative group-data-[fallback=true]/demo:bg-on-art-inverse/80", className)}
    >
      {children}
    </div>
  )
}

// ---------------------------------------------------------------- widgets

function Player({
  coverRef,
}: {
  coverRef: React.RefObject<HTMLDivElement | null>
}) {
  return (
    <div className="flex h-full flex-col justify-between">
      <div className="flex items-center gap-4">
        {/* The cover is glass on glass: a round lens sitting on the
            player, bending the player's frosted glass and the image under
            it. Transparent here, the canvas draws it. */}
        <div
          ref={coverRef}
          aria-hidden
          data-glass-inset
          className="size-14 shrink-0 rounded-full sm:size-[4.5rem]"
        />
        <div className="min-w-0">
          <p className="text-[19px] leading-tight font-semibold tracking-[-0.01em]">
            Midnight Tide
          </p>
          <p className="mt-1 text-[14px] text-on-art/70">Lumen Coast</p>
        </div>
      </div>
      <div className="flex flex-col gap-2">
        <div className="h-1.5 overflow-hidden rounded-full bg-on-art/20">
          <div
            data-target="progress"
            className="h-full w-full origin-left rounded-full bg-on-art"
            style={{ transform: `scaleX(${TRACK.start / TRACK.length})` }}
          />
        </div>
        <div className="flex justify-between font-mono text-[11px] text-on-art/65 tabular-nums">
          <span data-target="elapsed">{clock(TRACK.start)}</span>
          <span>{clock(TRACK.length)}</span>
        </div>
      </div>
      <div className="flex items-center justify-center gap-10">
        <HugeiconsIcon icon={PreviousIcon} strokeWidth={2} className="size-6" />
        <span
          data-target="play"
          className="relative grid size-11 place-items-center rounded-full bg-on-art text-on-art-inverse sm:size-12"
        >
          {/* Play and pause trade places with a short scale and fade. */}
          <HugeiconsIcon
            icon={PlayIcon}
            strokeWidth={2}
            className="absolute size-5 transition-[opacity,scale] duration-200 ease-out group-data-[playing-track=true]/demo:scale-50 group-data-[playing-track=true]/demo:opacity-0"
          />
          <HugeiconsIcon
            icon={PauseIcon}
            strokeWidth={2}
            className="absolute size-5 scale-50 opacity-0 transition-[opacity,scale] duration-200 ease-out group-data-[playing-track=true]/demo:scale-100 group-data-[playing-track=true]/demo:opacity-100"
          />
        </span>
        <HugeiconsIcon icon={NextIcon} strokeWidth={2} className="size-6" />
      </div>
    </div>
  )
}

function Weather() {
  return (
    <div className="flex h-full flex-col justify-between">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-[15px] font-semibold">Lisbon</p>
          <p className="mt-0.5 text-[12px] text-on-art/65">Now</p>
        </div>
        <HugeiconsIcon
          icon={SunCloud01Icon}
          strokeWidth={1.75}
          className="size-8"
        />
      </div>
      <p className="text-[44px] leading-none font-semibold tracking-[-0.04em] sm:text-[56px]">
        21°
      </p>
      <div className="text-[13px] leading-snug">
        <p>Mostly clear</p>
        <p className="text-on-art/65">H 24° L 16°</p>
      </div>
    </div>
  )
}

function Timer() {
  const r = 46
  const c = 2 * Math.PI * r
  return (
    <div className="flex h-full items-center justify-center">
      <div className="relative size-[7.75rem] sm:size-[8.5rem]">
        <svg viewBox="0 0 110 110" className="size-full -rotate-90">
          <circle
            cx="55"
            cy="55"
            r={r}
            fill="none"
            strokeWidth="7"
            className="stroke-on-art/20"
          />
          <circle
            cx="55"
            cy="55"
            r={r}
            fill="none"
            strokeWidth="7"
            strokeLinecap="round"
            strokeDasharray={c}
            strokeDashoffset={c * 0.36}
            className="stroke-on-art"
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <p className="font-mono text-[22px] font-medium tabular-nums">
            18:24
          </p>
          <p className="text-[11px] text-on-art/65">Deep work</p>
        </div>
      </div>
    </div>
  )
}

// A compact 2x2 like Apple's control widgets: the buttons fill the tile.
function Controls() {
  const items = [
    { icon: Airplane01Icon, target: "airplane", on: false },
    { icon: Wifi01Icon, target: "wifi", on: true },
    { icon: BluetoothIcon, target: undefined, on: true },
    { icon: Moon02Icon, target: undefined, on: false },
  ]
  return (
    <div className="grid h-full grid-cols-2 place-content-center place-items-center gap-2.5 sm:gap-3">
      {items.map(({ icon, target, on }, i) => (
        <span
          key={i}
          data-target={target}
          data-on={String(on)}
          className="grid size-[3.75rem] place-items-center rounded-full bg-on-art/15 transition-colors sm:size-[4.5rem] duration-200 ease-out data-[on=true]:bg-on-art data-[on=true]:text-on-art-inverse"
        >
          <HugeiconsIcon icon={icon} strokeWidth={2} className="size-6" />
        </span>
      ))}
    </div>
  )
}

function Levels() {
  const items = [
    { icon: Sun03Icon, target: "brightness", level: 0.62 },
    { icon: VolumeHighIcon, target: "volume", level: 0.4 },
  ]
  return (
    <div className="flex h-full justify-center gap-3 sm:gap-4">
      {items.map(({ icon, target, level }) => (
        <div
          key={target}
          data-target={target}
          className="relative h-full w-14 overflow-hidden rounded-[20px] bg-on-art/15 sm:w-16 sm:rounded-[22px]"
        >
          <div
            data-target={`${target}-fill`}
            className="absolute inset-0 origin-bottom bg-on-art"
            style={{ transform: `scaleY(${level})` }}
          />
          <HugeiconsIcon
            icon={icon}
            strokeWidth={2}
            className="absolute bottom-4 left-1/2 size-5 -translate-x-1/2 text-on-art-inverse"
          />
        </div>
      ))}
    </div>
  )
}

function Composer() {
  return (
    <div className="flex h-full items-center gap-3">
      <p
        data-target="input"
        className="relative flex h-full min-w-0 flex-1 items-center overflow-hidden text-[15px] whitespace-nowrap sm:text-[16px]"
      >
        <span className="hidden text-on-art/70 group-data-[empty=true]/demo:inline">
          Ask anything
        </span>
        <span data-target="typed" />
        {/* The caret, blinking while the field has focus. */}
        <span className="ml-px hidden h-[1.15em] w-[2px] animate-[demo-caret_1s_steps(1)_infinite] rounded-full bg-on-art group-data-[empty=true]/demo:-order-1 group-data-[focused=true]/demo:inline-block" />
      </p>
      <HugeiconsIcon
        icon={Mic01Icon}
        strokeWidth={2}
        className="size-5 text-on-art/80"
      />
      <span
        data-target="send"
        className="grid size-11 place-items-center rounded-full bg-on-art text-on-art-inverse sm:size-12"
      >
        <HugeiconsIcon
          icon={ArrowUp02Icon}
          strokeWidth={2.5}
          className="size-5"
        />
      </span>
    </div>
  )
}
