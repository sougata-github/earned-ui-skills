---
name: liquid-glass-web
description: Build Apple style Liquid Glass components for the web with real refraction in WebGL2, never a backdrop blur passed off as glass. Use when asked for liquid glass, refractive or frosted glass panels, glass buttons, pills, docks, widgets, cards or toolbars over an image, video or canvas, iOS 26 or macOS Tahoe style UI in the browser, or when existing glass looks flat, fake or blurry. Covers the workflow that gets the look right (references first, a tuning lab with live controls, tuning by eye), the optics, Apple's rules for where glass belongs, a dependency free reference renderer to adapt, and the mistakes that cost the most time.
---

# Liquid Glass for the web

This skill is a workflow, not a library. It carries what it took to get
Liquid Glass to look right in a browser: the order to work in, the optics,
Apple's rules, a small reference renderer to adapt to the project, and the
mistakes worth not repeating.

## The one rule

**Glass bends light. A blur scatters it.** `backdrop-filter: blur()` with a
border and a white tint is the old frosted material. It is never Liquid
Glass. Apple defines the new material by lensing: the edge of the glass
refracts what is behind it, and light catches the rim. If the result has no
refraction at the edge, it is not done.

## The lab is the method

The fastest way to the look the human wants is not better guesses in code.
It is a lab: one page with the real background, the real component and a
live control for every property of the glass, where the human drags until it
looks right and copies the values out. Glass is judged by eye, and no
description of "a bit thicker, less rim, softer light" survives the round
trip through code and reloads. A lab turns hours of back and forth into one
sitting.

So the agent never tunes the material blind. It builds the lab, hands it
over, and builds components only on values the human chose.

## Workflow

Copy this checklist into the response and work through it in order:

```
Liquid glass progress:
- [ ] 1. Know what sits behind the glass, and get two references
- [ ] 2. Pick the architecture
- [ ] 3. Build the tuning lab before any component
- [ ] 4. The human tunes by eye, values come back as JSON
- [ ] 5. Build the components on the tuned material
- [ ] 6. Verify against the checklist at the end
```

### 1. What is behind the glass, and two references

Glass has no look of its own. It is the image behind it, bent. Ask:

- **What does the glass sit on?** An image, a video, a canvas, or live page
  content. This decides the architecture.
- **Two references.** One for the scene (the image or art the glass will sit
  on), one for the target look (a screenshot of Apple's UI or a design the
  human likes). Judge every step against both. Without them, tuning drifts.

If the human has no background yet, use a rich, detailed image for the lab
(clouds, water, foliage). Refraction is invisible over a flat colour.

### 2. Pick the architecture

| Glass sits on | Approach |
| --- | --- |
| An image, video or canvas the page owns | **WebGL, the default.** One canvas draws the image and the glass together (`assets/glass.ts`). Exact optics in every browser |
| Live, arbitrary page content | Harder. See `references/approaches.md`: SVG displacement filters (Chromium only for backdrops), or snapshotting content into a texture |

Content always stays real HTML laid over the glass: selectable, accessible,
crisp. The canvas draws only the image and the material.

### 3. Build the lab first

Before any component, build one page (`references/lab.md`):

- the real image, full bleed
- one or more glass shapes holding representative content
- a slider for every material property, with its value shown
- a switch between backgrounds, and the theme toggle
- a **Copy as JSON** button

`assets/GlassLab.tsx` is a working starting point. The lab is where the
look is found. Guessing values in code and reloading is how hours go. Keep
the lab after launch: every later change to the material goes through it.

### 4. The human tunes by eye

Hand the lab over with an order to tune in (`references/lab.md`): shape,
then edge band and thickness, then refraction, dispersion, frost, light,
shadow. Judge on every background and in both themes. The human pastes the
JSON back and it becomes the preset. Do not "improve" tuned values later
without asking.

### 5. Build the components

Wire the renderer (React shown, the class is framework free):

```tsx
const canvas = canvasRef.current!
const stage = new GlassStage(canvas)
stage.setMaterial(TUNED)            // the JSON from the lab
await stage.setImage("/art/plate.avif", "/art/plate.webp")

const frame = () => {
  // Measure after this frame's DOM writes, then draw: the glass and the
  // HTML on it never drift apart by a frame.
  stage.setShapes(measureShapes(canvas, [panelEl, buttonEl]))
  stage.render()
}
new ResizeObserver(() => { stage.resize(); frame() }).observe(canvas)
```

- Shapes come from the DOM: each glass element is a transparent box whose
  rect and `border-radius` become a shape (`measureShapes`). CSS stays the
  source of truth for layout.
- Render on demand: on resize, scroll, image load and while something
  animates. A still page draws nothing.
- Arrive by materializing: animate `setMaterialize` from 0 to 1 on a
  critically damped curve (`materializeCurve`), never by fading opacity.
- Content on glass uses fills and vibrant, high contrast ink, never another
  glass layer (`references/apple-rules.md`).

### 6. Verify

```
- [ ] Refraction visible at the edge on the real image, in both themes
- [ ] No backdrop-filter blur anywhere standing in for glass
- [ ] Resizing the window never shows an empty frame or a stretched one
- [ ] Glass and its HTML stay aligned while anything moves or scrolls
- [ ] Text on glass reads on the brightest and the darkest part of the image
- [ ] Reduced transparency: more frost and tint, less refraction
- [ ] No WebGL2: the image with a solid surface, never a blur
- [ ] Pixel ratio capped at 2, nothing renders while the page is still
- [ ] Pauses when off screen or in a hidden tab
```

## The material

`GlassMaterial` in `assets/glass.ts`. Starting values are in `MATERIALS`.

| Property | What it does | Range |
| --- | --- | --- |
| `bezel` | Width of the curved edge band (CSS px). Thin is a crisp lip, wide is a thick lens | 4 to 40 |
| `thickness` | Slab height. How far rays travel: the strength of the bend | 10 to 90 |
| `ior` | Refractive index. 1 bends nothing, glass is about 1.5. Subtle looks best | 1.1 to 1.5 |
| `dispersion` | Colour fringe at the edge. A trace is real, a rainbow is a demo | 0 to 0.03 |
| `magnify` | Scale of the view through the flat middle | 0.9 to 1.1 |
| `frost` | Blur inside the glass. Regular glass carries text, clear glass does not | 0 to 12 |
| `tint`, `tintColor` | Colour mixed into the glass | 0 to 0.3 |
| `dim` | Darkens the view through the glass, for light ink on bright images | 0 to 0.35 |
| `rim` | Fresnel brightening along the edge. Keep it low | 0.05 to 0.4 |
| `specular` | Light catching the lit side of the edge | 0.3 to 0.9 |
| `shadow` | Soft contact shadow under the shape | 0 to 0.3 |
| `lightAngle` | Where the light comes from, degrees. 135 is upper left | fixed per page |
| `blend` | Shapes closer than this melt into one surface | 0, or 20 to 48 |

The optics behind each one, and how to extend the shader (glyph shaped
glass, glass on glass, per shape light): `references/optics.md`.

## Apple's rules, short

Full notes and sources: `references/apple-rules.md`.

- Glass is the functional layer floating over content (controls, bars,
  widgets on art), not the content itself. Use it sparingly.
- Never glass on glass. Things on glass are fills, ink and vibrancy.
- Regular (frosted) for text heavy panels, clear only over rich media with
  bold content and a dimming layer.
- Bigger glass reads thicker: deeper shadow, stronger lensing.
- Light defines the silhouette. The rim catches light, the body stays quiet.
- Materialize by ramping the optics, never fade opacity.
- Respect reduced transparency and increased contrast.

## Lessons that cost the most time

Each one is a real failure and its fix. Details: `references/lessons.md`.

1. A blur is not glass. Every blur based attempt read as cheap.
2. Light that follows the pointer reads as a gimmick. Fix the light, upper
   left, the same on every shape.
3. Bare panel borders flashed on load before the first WebGL frame. Keep the
   canvas and the content hidden until the first real frame, then
   materialize.
4. A resize clears the canvas. Render inside the ResizeObserver callback,
   not a frame later, or one empty frame shows.
5. Measuring before this frame's DOM writes leaves the glass one frame
   behind its HTML while anything moves. Write, then measure, then render.
6. Automatic mip selection blurs the refracted edge. Sample the image at an
   explicit level matched to its scale.
7. A strong rim looks like a cheap outline. The tuned rim was 0.1 on a 0 to
   1.5 scale.
8. Ink follows the image, not the page theme: white ink over dark art, dark
   ink only where the image is bright enough to win clearly.
9. Glass on glass is wrong, with one exception that works: small insets that
   refract the panel as drawn (fields and a button on a glass form).
10. Content that animates must lay out its final size up front, so the glass
    never re-renders mid animation.

## Related skills and sources

- Emil Kowalski's `apple-design` skill, for springs, gestures and motion
  around the glass: `npx skills add emilkowalski/skills --skill apple-design`.
  Its materials section approximates glass with a backdrop blur. For glass,
  this skill takes precedence.
- Emil Kowalski's `review-animations`, for any motion added around glass.
- Apple: [Liquid Glass overview](https://developer.apple.com/documentation/technologyoverviews/liquid-glass),
  [Adopting Liquid Glass](https://developer.apple.com/documentation/technologyoverviews/adopting-liquid-glass),
  [HIG Materials](https://developer.apple.com/design/human-interface-guidelines/materials),
  [WWDC25 Meet Liquid Glass](https://developer.apple.com/videos/play/wwdc2025/219).

## Files

- `assets/glass.ts`: the renderer. WebGL2, no dependencies, up to 8 shapes,
  smooth union, explicit mip sampling, materialize.
- `assets/GlassLab.tsx`: the tuning lab, React, inline styles.
- `references/lab.md`: building and running a tuning session.
- `references/optics.md`: the physics, term by term, and extensions.
- `references/apple-rules.md`: Apple's guidance, distilled, with sources.
- `references/lessons.md`: every pitfall with its cause and fix.
- `references/approaches.md`: glass over live DOM, and why WebGL is the
  default.
