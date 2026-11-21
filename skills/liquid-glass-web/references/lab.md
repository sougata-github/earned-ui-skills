# The tuning lab

The lab is where the look is found. Build it before any component, hand it
to the human, and lock what they choose.

## What the lab holds

- **The real image**, full bleed. Several, if the glass will sit on several,
  with a switch between them.
- **Representative glass**: the actual component shapes (a panel with real
  text, a pill, a round button), not a lone rectangle.
- **A slider per property** of `GlassMaterial`, its current value printed
  beside it in a mono face.
- **The theme toggle**, so both themes are judged.
- **Replay materialize**, to judge the entrance.
- **Copy as JSON**, the material plus which image and variant it was tuned
  on.

`assets/GlassLab.tsx` has all of this in one React file with inline
styles. Point it at the project's images and drop in the real component
content.

## Keep it unlisted

Put the lab at a route like `/lab/glass`: `noindex`, out of the sitemap and
navigation, disallowed in `robots.txt`. It can stay for later tuning.

## A tuning session

Give the human this order. Each step changes what the next one looks like.

1. **Shape.** Corner radius and size on the real content. Concentric with
   what sits inside.
2. **Edge band and thickness.** How wide the lip is and how strongly it
   bends. Start thin and strong, it reads crisper.
3. **Refraction.** Lower than expected, around 1.2.
4. **Dispersion.** Barely there.
5. **Frost.** Enough that text on the glass reads, no more.
6. **Light.** Angle first (one for the page), then specular, then the rim,
   kept low.
7. **Shadow.** Just enough to lift the glass off the image.
8. **Tint and dim.** Only if ink contrast still fails on bright areas.

Then switch every image and both themes, and adjust. The values are final
when they hold everywhere.

## Locking values

The human presses Copy as JSON and pastes it into the conversation. The
agent waits for it, checks every key is present and in range, and writes it
as a named preset in one file, the single source of truth:

```ts
// Tuned by eye in /lab/glass on 2026-11-21, judged on the ocean, clouds and
// hills images in both themes. Change through the lab, not here.
export const GLASS = {
  regular: { bezel: 14, thickness: 46, ior: 1.2, /* ...every key */ },
  clear: { /* ...a second paste, if tuned */ },
} satisfies Record<string, GlassMaterial>
```

Then the lab's defaults point at the preset, so the next session starts from
the chosen look. Later changes go through the lab again and come back as
JSON, never straight into code.

## Recording the lab

A lab with a scripted cursor that drags the sliders makes a good demo:
evaluate the whole script as a pure function of time, write the DOM, then
measure and render in the same frame, and loop. Hide the real cursor while
it plays.
