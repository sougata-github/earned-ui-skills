# Apple's rules for Liquid Glass

Distilled from Apple's documentation and WWDC25, translated for the web.

Sources:

- [Liquid Glass overview](https://developer.apple.com/documentation/technologyoverviews/liquid-glass)
- [Adopting Liquid Glass](https://developer.apple.com/documentation/technologyoverviews/adopting-liquid-glass)
- [HIG: Materials](https://developer.apple.com/design/human-interface-guidelines/materials)
- [WWDC25: Meet Liquid Glass](https://developer.apple.com/videos/play/wwdc2025/219)
- [WWDC25: Get to know the new design system](https://developer.apple.com/videos/play/wwdc2025/356)

## What the material is

- **Lensing, not scattering.** Earlier materials scattered light. Liquid
  Glass bends, shapes and concentrates it in real time. Lensing is how the
  material defines itself. A blur alone is the old material.
- **Light defines the silhouette.** Highlights sit on the edge and move with
  interaction. On the web, keep the light fixed unless motion is the point.
- **Bigger reads thicker.** Larger glass casts deeper, richer shadows, lenses
  more strongly and scatters light more softly.
- **Adaptive.** Shadows strengthen over text and busy content and fade over
  plain light backgrounds. Small elements can flip their ink between light
  and dark with what is behind them. Large ones adapt but do not flip.

## Variants

- **Regular:** frosts and adjusts what is behind. For anything with text.
- **Clear:** more transparent, no adaptive behaviour. Only over rich media,
  with bold, bright content on top and a dimming layer (Apple uses about 35%
  on bright backgrounds, localized for small elements).
- Never mix the two in one group.

## Where glass belongs

- Glass is the **functional layer**: navigation, toolbars, controls, and
  small surfaces floating over content. Not the content layer itself (not
  list rows, not article cards on a plain page).
- **Use it sparingly.** One glass group per view reads as premium. Glass on
  every surface reads as a theme.
- **Never glass on glass.** Elements on glass use fills, transparency and
  vibrancy so they read as part of the material. The one exception that
  works on the web: small insets that refract the panel they sit on
  (`references/optics.md`, extensions).
- **Ink:** vibrant, higher contrast colour on glass, never flat grey.
  Slightly heavier weight helps.
- **Continuous corners.** Concentric radii between the glass and what sits
  inside it (inner radius = outer radius minus padding).

## Motion

- **Materialize, don't fade.** Glass appears and disappears by modulating
  its lensing, not its opacity.
- **Fluid.** Gel-like flex that follows the interaction. Elements can lift
  slightly into the glass while pressed (a small scale up), then settle.
- **Merging.** Glass shapes close to each other merge into one surface and
  separate again as they move apart.
- Springs with no overshoot unless a gesture with velocity drives them.
  Emil Kowalski's `apple-design` skill covers the motion side in depth.

## Accessibility

- **Reduced transparency:** more frost and tint, less refraction, or a solid
  surface.
- **Increased contrast:** a visible edge and stronger ink.
- **Reduced motion:** no materialize ramp, glass simply present.
