"use client"

// A tuning lab for liquid glass (see references/lab.md). One React file,
// inline styles, no dependencies beside React and ./glass. Point `images`
// at the project's real backgrounds and put the real component content in
// the shapes. The human tunes by eye and copies the values as JSON.

import { useEffect, useRef, useState } from "react"

import {
  GlassStage,
  MATERIALS,
  measureShapes,
  materializeCurve,
  type GlassMaterial,
} from "./glass"

type Slider = { key: keyof GlassMaterial; label: string; min: number; max: number; step: number }

const SLIDERS: Slider[] = [
  { key: "bezel", label: "Edge band", min: 2, max: 40, step: 1 },
  { key: "thickness", label: "Thickness", min: 0, max: 100, step: 1 },
  { key: "ior", label: "Refraction", min: 1, max: 2, step: 0.01 },
  { key: "dispersion", label: "Dispersion", min: 0, max: 0.15, step: 0.001 },
  { key: "magnify", label: "Magnify", min: 0.85, max: 1.2, step: 0.01 },
  { key: "frost", label: "Frost", min: 0, max: 24, step: 0.5 },
  { key: "tint", label: "Tint", min: 0, max: 0.6, step: 0.01 },
  { key: "dim", label: "Dim", min: 0, max: 0.5, step: 0.01 },
  { key: "rim", label: "Rim light", min: 0, max: 1.5, step: 0.01 },
  { key: "specular", label: "Specular", min: 0, max: 1.5, step: 0.01 },
  { key: "shadow", label: "Shadow", min: 0, max: 0.6, step: 0.01 },
  { key: "lightAngle", label: "Light angle", min: 0, max: 360, step: 1 },
  { key: "blend", label: "Blend", min: 0, max: 48, step: 1 },
]

export type LabImage = { label: string; src: string; fallbackSrc?: string }

export function GlassLab({ images }: { images: LabImage[] }) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const panelRef = useRef<HTMLDivElement>(null)
  const pillRef = useRef<HTMLDivElement>(null)
  const buttonRef = useRef<HTMLDivElement>(null)
  const stageRef = useRef<GlassStage | null>(null)
  const startRef = useRef<number | null>(null)
  const [material, setMaterial] = useState<GlassMaterial>(MATERIALS.regular)
  const [imageIndex, setImageIndex] = useState(0)
  const [replay, setReplay] = useState(0)

  // One stage for the page's life. Everything after this only feeds it.
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas || !GlassStage.supported()) return
    const stage = new GlassStage(canvas)
    stageRef.current = stage
    let raf = 0
    const frame = (now: number) => {
      raf = requestAnimationFrame(frame)
      if (startRef.current !== null) {
        stage.setMaterialize(materializeCurve(now - startRef.current))
      }
      stage.setShapes(
        measureShapes(canvas, [panelRef.current, pillRef.current, buttonRef.current])
      )
      stage.render()
    }
    const resize = new ResizeObserver(() => {
      stage.resize()
      stage.render()
    })
    resize.observe(canvas)
    raf = requestAnimationFrame(frame)
    return () => {
      cancelAnimationFrame(raf)
      resize.disconnect()
      stage.dispose()
      stageRef.current = null
    }
  }, [])

  useEffect(() => {
    stageRef.current?.setMaterial(material)
  }, [material])

  useEffect(() => {
    const stage = stageRef.current
    const image = images[imageIndex]
    if (!stage || !image) return
    stage.setMaterialize(0)
    stage.setImage(image.src, image.fallbackSrc).then(() => {
      startRef.current = performance.now()
    })
  }, [images, imageIndex])

  useEffect(() => {
    if (replay === 0 || !stageRef.current) return
    stageRef.current.setMaterialize(0)
    startRef.current = performance.now()
  }, [replay])

  const ink = "#fff"
  const glassBox = { position: "relative" as const, color: ink }

  return (
    <div style={{ position: "fixed", inset: 0, overflow: "hidden", background: "#111", fontFamily: "system-ui, sans-serif" }}>
      <canvas ref={canvasRef} style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }} />

      {/* The glass shapes: transparent boxes the canvas draws glass under. */}
      <div style={{ position: "absolute", left: "8vw", top: "50%", transform: "translateY(-50%)", display: "grid", gap: 20, width: 380 }}>
        <div ref={panelRef} style={{ ...glassBox, borderRadius: 32, padding: 24 }}>
          <p style={{ margin: 0, fontSize: 13, opacity: 0.75 }}>Now playing</p>
          <p style={{ margin: "6px 0 0", fontSize: 22, fontWeight: 600 }}>Representative content</p>
          <p style={{ margin: "6px 0 0", fontSize: 15, opacity: 0.8 }}>
            Put the real component here. Tune on the real text.
          </p>
        </div>
        <div style={{ display: "flex", gap: 16, alignItems: "center" }}>
          <div ref={pillRef} style={{ ...glassBox, flex: 1, height: 56, borderRadius: 999, display: "grid", placeItems: "center", fontWeight: 600 }}>
            A glass pill
          </div>
          <div ref={buttonRef} style={{ ...glassBox, width: 56, height: 56, borderRadius: 999 }} />
        </div>
      </div>

      {/* Controls: solid, not glass. */}
      <aside style={{ position: "absolute", right: 24, top: 24, bottom: 24, width: 300, overflowY: "auto", padding: 20, borderRadius: 20, background: "rgba(10,10,12,0.88)", color: "#fff", fontSize: 12 }}>
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 16 }}>
          {images.map((image, i) => (
            <button key={image.src} type="button" onClick={() => setImageIndex(i)} style={chip(i === imageIndex)}>
              {image.label}
            </button>
          ))}
        </div>
        <div style={{ display: "flex", gap: 6, marginBottom: 16 }}>
          <button type="button" onClick={() => setMaterial(MATERIALS.regular)} style={chip(false)}>Regular</button>
          <button type="button" onClick={() => setMaterial(MATERIALS.clear)} style={chip(false)}>Clear</button>
          <button type="button" onClick={() => setReplay((n) => n + 1)} style={chip(false)}>Replay</button>
        </div>
        {SLIDERS.map((s) => (
          <label key={s.key} style={{ display: "block", marginBottom: 12 }}>
            <span style={{ display: "flex", justifyContent: "space-between", opacity: 0.8 }}>
              <span>{s.label}</span>
              <code>{String(material[s.key])}</code>
            </span>
            <input
              type="range"
              min={s.min}
              max={s.max}
              step={s.step}
              value={material[s.key] as number}
              onChange={(e) => setMaterial((m) => ({ ...m, [s.key]: Number(e.target.value) }))}
              style={{ width: "100%" }}
            />
          </label>
        ))}
        <button
          type="button"
          style={{ ...chip(true), width: "100%", padding: "10px 12px" }}
          onClick={() =>
            navigator.clipboard.writeText(
              JSON.stringify({ image: images[imageIndex]?.label, ...material }, null, 2)
            )
          }
        >
          Copy as JSON
        </button>
      </aside>
    </div>
  )
}

function chip(active: boolean) {
  return {
    border: 0,
    borderRadius: 8,
    padding: "6px 10px",
    font: "inherit",
    cursor: "pointer",
    color: active ? "#111" : "#fff",
    background: active ? "#fff" : "rgba(255,255,255,0.1)",
  }
}
