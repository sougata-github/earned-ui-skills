# The optics, term by term

How `assets/glass.ts` draws glass, so it can be tuned with intent and
extended without guessing.

## Contents

1. Coordinates
2. Shape: signed distance fields
3. The edge band and the squircle profile
4. Refraction: Snell's law
5. Dispersion
6. Frost
7. Light: rim, specular, counter highlight, hairline
8. Contact shadow
9. Melting shapes: smooth union
10. Sampling the image
11. Materialize
12. Glass on glass: insets
13. Extensions

## 1. Coordinates

The shader works in device pixels with a top-left origin, the same space as
`getBoundingClientRect` times the pixel ratio. Measured DOM rects go in
without flipping. `gl_FragCoord` has a bottom-left origin, so the shader
flips once: `p = vec2(x, height - y)`.

## 2. Shape: signed distance fields

Each shape is a rounded box. `sdRoundBox(p, halfSize, radius)` returns the
distance from `p` to the edge: negative inside, positive outside, zero on
the edge. Everything else reads from that one number:

- the mask (inside or out), anti-aliased over 1.5 px with `smoothstep`
- the edge band (how far in from the rim)
- the surface normal (the gradient of the distance, by finite differences)
- the shadow (the field shifted down)

Corner radius is clamped to half the shorter side, so a large radius makes
a pill or a circle. Any shape with a distance function works the same way
(see Extensions).

## 3. The edge band and the squircle profile

Liquid Glass is a slab with a flat top and a rounded lip. `bezel` is the
width of that lip. Across it, `x` runs from 0 at the rim to 1 where the
flat top begins, and the height follows a squircle profile:

```
height(x) = (1 - (1 - x)^4)^(1/4)
```

Flat in the middle, a soft shoulder, steep at the rim. This continuous
curvature is what reads as liquid. A circular bevel reads as cut acrylic.

## 4. Refraction: Snell's law

The surface normal comes from the profile's slope and the edge direction:

```
slope  = height'(x) * thickness / bezel
normal = normalize(vec3(edgeDirection * slope, 1))
ray    = refract(vec3(0, 0, -1), normal, 1 / ior)
offset = ray.xy * depth / -ray.z
```

A ray looking straight down bends at the surface and lands somewhere else
on the image below. On the flat top the normal points straight up, so
nothing bends and the middle shows the image as is. All the lensing lives
in the edge band, which is what Apple's glass does.

- `thickness` scales both the slope and the depth: the main dial for
  strength.
- `ior` near 1.2 is plenty. Real glass (1.5) at a large thickness
  turns the edge into a mirror of the far side, which reads as a bug.

## 5. Dispersion

Each colour channel refracts with a slightly different index: red at
`ior - dispersion`, green at `ior`, blue at `ior + dispersion`. Three
samples at three offsets give a faint fringe at the rim. The flat middle
needs one sample, because there the offsets meet.

## 6. Frost

Regular glass frosts what it shows. A 16 tap golden angle spiral averages
the image around each sample, read from a coarser mip level as the radius
grows, so it stays smooth and cheap. Frost ramps in with the material, so a
frosted rectangle never shows before the glass.

## 7. Light

Light defines the silhouette, and stays on the edge:

- **Rim:** `(1 - x)^3`, a Fresnel-like brightening toward the rim. Keep it
  low. A strong rim reads as an outline.
- **Specular:** strongest where the edge faces the light
  (`dot(normal, light)`), concentrated at the very rim.
- **Counter highlight:** a weaker light on the opposite edge, as light
  passes through the slab and catches the far side.
- **Hairline:** a 1.5 px line exactly on the edge, brighter on the lit
  side.

`lightAngle` sets one direction for every shape on the page. Fixed light is
calmer and more believable than light that follows the pointer.

## 8. Contact shadow

The shape's field shifted down by a fraction of its softness, then
`exp(-distance / softness)`, outside the shape only. Softness grows with
the bezel and the thickness, so bigger, thicker glass casts a deeper
shadow, as Apple describes.

## 9. Melting shapes: smooth union

`blend` replaces `min(a, b)` with a polynomial smooth minimum:

```
h = max(k - |a - b|, 0) / k
d = min(a, b) - h * h * k / 4
```

Shapes closer than `k` grow a liquid neck between them and refract as one
surface, the way Apple's glass merges in a container. The view through the
flat middle magnifies about a centre blended across the neck, so it never
jumps from one shape to the next.

## 10. Sampling the image

The image covers the canvas (like `object-fit: cover`) about a focus
point. It is sampled with `textureLod` at the level that matches its scale
(`log2(1 / scale)`), for two reasons:

- A large image drawn small shimmers without mipmaps.
- Refraction sends neighbouring pixels to far apart places in the image.
  Automatic mip selection reads that as minification and picks a blurry
  level, which smears exactly the edge that should be sharp.

Changing the image cross-fades: `setImage` keeps the old texture and blends
the new one in over `fadeMs` (600 by default, eased in and out), sampling
both at their own scale. The glass refracts the blend, so the scene changes
under it instead of cutting. The first image fades in over the background
colour.

## 11. Materialize

`uMaterialize` (0 to 1) scales refraction, dispersion, frost, tint, light
and shadow together. At 0 the shape is invisible, the bare image. Animating
it from 0 to 1 on a critically damped curve is how glass arrives: the optics
form, nothing fades.

## 12. Glass on glass: insets

Apple's rule is never glass on glass. The one exception that reads right is
a small piece of glass sitting on a panel and bending it: a field and a send
button on a glass form, a round album cover on a glass player.

Opt in: use it only when the human asks for glass on glass. With no insets
the shader skips this path entirely, so it costs nothing when unused.

The renderer draws these as insets. Mark the element `data-glass-inset`
(or pass `inset: true` in a shape). Up to `MAX_INSETS` per canvas.

- An inset refracts **the panel as drawn**, frost, tint and light included,
  not the bare image. The shader evaluates the whole panel at the bent
  sample point (`panelAt`), once per colour channel at the edge.
- It adds no frost, dim or tint of its own: the panel under it has them.
- It casts its own soft shadow on the panel.
- Its material is separate (`setInsetMaterial`): an edge band near half its
  size gives a full dome, a marble. `magnify` above 1 makes it a lens.
  `light` scales its rim and specular, about 0.45 of the panels', because
  small glass glares easily.
- Insets never overlap each other, so each pixel takes the nearest one.

Cost: inside an inset the panel is evaluated three times per pixel. Keep
insets small.

## 13. Extensions

These were built on the same shader in production. Each is a contained
change:

- **Glyph shaped glass** (huge glass type, a "404"): render the text to a
  canvas in its own font, turn it into a signed distance field (a 16 bit
  field, convex corners rounded), upload it as a texture and use it as the
  shape's distance. Scale the edge band and the field's smoothing with the
  type size, or the gaps between glyphs close up at small sizes.
- **Per shape light:** pass a light strength per shape when small controls
  need less rim than a large panel.
- **Ink tone from the image:** read the image's luminance under each panel
  (adjusted for dim and tint), score white and dark ink with APCA, and pick
  white unless dark wins by a clear margin (about 40 Lc). Add hysteresis so
  it never flickers. WCAG 2 ratios underrate saturated mid tones.
- **A second image for portrait screens,** so a wide image is never cropped
  to a sliver on a phone held upright.
