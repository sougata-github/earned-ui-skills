import { useEffect, useMemo, useState, type CSSProperties, type ReactNode } from "react"

import { LOOK, Wall, lay, type Look, type Plan, type Tile } from "./wall"

// The bento lab: the wall at its real sizes, with a control for everything
// that is judged by eye. The human looks, drags, clicks a tile to step it
// through its states, and copies the values out as JSON.
//
// Use it twice. First with the tiles empty, to approve the structure: which
// tiles, how big, how they rearrange on each screen. Then one widget at a
// time, each shown here at its real size in both themes before it ships.
//
// Inline styles on the wall's own tokens (`bento.css`), no framework.

const PANEL = 272

export function WidgetLab({
  tiles,
  plans,
  title,
  look: start,
}: {
  tiles: Record<string, Tile>
  plans: readonly Plan[]
  /** The opening's words, if the wall has an opening. */
  title?: string
  /** The locked look, once there is one. */
  look?: Partial<Look>
}) {
  const [look, setLook] = useState<Look>({ ...LOOK, ...start })
  const [plan, setPlan] = useState("auto")
  const [dark, setDark] = useState(() => document.documentElement.classList.contains("dark"))
  const [empty, setEmpty] = useState(false)
  const [live, setLive] = useState(true)
  const [replay, setReplay] = useState(0)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    document.documentElement.classList.toggle("dark", dark)
  }, [dark])

  // The structure alone: every tile as a labelled box.
  const shown = useMemo(
    () =>
      empty
        ? Object.fromEntries(Object.entries(tiles).map(([id, t]) => [id, { ...t, Widget: undefined }]))
        : tiles,
    [tiles, empty]
  )
  // Every plan must end level at the current gap.
  const stages = useMemo(() => plans.map((p) => lay(p, tiles, look.gap)), [plans, tiles, look.gap])

  const set = (key: keyof Look) => (value: number) => setLook((l) => ({ ...l, [key]: value }))
  const copy = async () => {
    const json = JSON.stringify({ ...look, theme: dark ? "dark" : "light", plan }, null, 2)
    await navigator.clipboard.writeText(json)
    setCopied(true)
    window.setTimeout(() => setCopied(false), 1400)
  }

  return (
    <>
      <Wall
        tiles={shown}
        plans={plans}
        look={look}
        title={title}
        live={live && !empty}
        plan={plan === "auto" ? undefined : plan}
        inset={PANEL}
        replay={replay}
        clickToStep
      />

      <aside style={S.panel}>
        <p style={S.heading}>Bento lab</p>

        <Group label="Structure">
          <Slider label="Gap" value={look.gap} min={6} max={28} onChange={set("gap")} />
          <Slider label="Tile radius" value={look.radius} min={0} max={40} onChange={set("radius")} />
          <Slider label="Tile padding" value={look.pad} min={10} max={28} onChange={set("pad")} />
          <label style={S.row}>
            <span>Plan</span>
            <select value={plan} onChange={(e) => setPlan(e.target.value)} style={S.select}>
              <option value="auto">Auto (by window)</option>
              {plans.map((p) => (
                <option key={p.name} value={p.name}>
                  {p.name}
                </option>
              ))}
            </select>
          </label>
        </Group>

        <Group label="Plans">
          {stages.map((s) => (
            <div key={s.name} style={S.row}>
              <span>
                {s.name}, {s.width} × {s.height}
              </span>
              <span style={{ ...S.mono, color: s.ragged ? "var(--rose-ink)" : "var(--green-ink)" }}>
                {s.ragged ? `ragged ${s.ragged}px` : "level"}
              </span>
            </div>
          ))}
        </Group>

        <Group label="Alive">
          <Slider label="Beat, ms" value={look.beat} min={240} max={1600} step={20} onChange={set("beat")} />
          <Toggle label="Conductor" on={live} onChange={setLive} />
        </Group>

        <Group label="View">
          <Toggle label="Empty tiles" on={empty} onChange={setEmpty} />
          <Toggle label="Dark theme" on={dark} onChange={setDark} />
        </Group>

        <p style={S.hint}>Click a tile to step it to its next state.</p>

        <div style={S.buttons}>
          {title !== undefined && (
            <button type="button" style={S.button} onClick={() => setReplay((n) => n + 1)}>
              Replay opening
            </button>
          )}
          <button type="button" style={{ ...S.button, ...S.primary }} onClick={copy}>
            {copied ? "Copied" : "Copy as JSON"}
          </button>
        </div>
      </aside>
    </>
  )
}

function Group({ label, children }: { label: string; children: ReactNode }) {
  return (
    <section style={S.group}>
      <p style={S.label}>{label}</p>
      {children}
    </section>
  )
}

function Slider({
  label,
  value,
  min,
  max,
  step = 1,
  onChange,
}: {
  label: string
  value: number
  min: number
  max: number
  step?: number
  onChange: (value: number) => void
}) {
  return (
    <label style={S.slider}>
      <span style={S.row}>
        <span>{label}</span>
        <span style={S.mono}>{value}</span>
      </span>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        style={S.range}
      />
    </label>
  )
}

function Toggle({ label, on, onChange }: { label: string; on: boolean; onChange: (on: boolean) => void }) {
  return (
    <label style={{ ...S.row, cursor: "pointer" }}>
      <span>{label}</span>
      <input type="checkbox" checked={on} onChange={(e) => onChange(e.target.checked)} style={S.check} />
    </label>
  )
}

const S = {
  panel: {
    position: "fixed",
    top: 0,
    right: 0,
    bottom: 0,
    width: PANEL,
    boxSizing: "border-box",
    padding: 18,
    display: "flex",
    flexDirection: "column",
    gap: 18,
    overflowY: "auto",
    background: "var(--tile)",
    color: "var(--ink)",
    borderLeft: "1px solid var(--ink-faint)",
    fontSize: 12,
    lineHeight: 1.3,
  },
  heading: { margin: 0, fontSize: 14, fontWeight: 600 },
  group: { display: "flex", flexDirection: "column", gap: 10 },
  label: { margin: 0, fontSize: 11, fontWeight: 600, color: "var(--ink-soft)" },
  row: { display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8 },
  slider: { display: "flex", flexDirection: "column", gap: 6 },
  range: { width: "100%", margin: 0, accentColor: "var(--blue)" },
  check: { margin: 0, width: 16, height: 16, accentColor: "var(--blue)" },
  mono: { fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace", fontSize: 11 },
  select: {
    font: "inherit",
    color: "inherit",
    background: "var(--tile-inner)",
    border: "1px solid var(--ink-faint)",
    borderRadius: 8,
    padding: "4px 6px",
  },
  hint: { margin: 0, color: "var(--ink-soft)" },
  buttons: { display: "flex", flexDirection: "column", gap: 8, marginTop: "auto" },
  button: {
    font: "inherit",
    fontWeight: 600,
    height: 36,
    border: 0,
    borderRadius: 999,
    cursor: "pointer",
    background: "var(--ink-faint)",
    color: "var(--ink)",
  },
  primary: { background: "var(--ink)", color: "var(--canvas)" },
} satisfies Record<string, CSSProperties>
