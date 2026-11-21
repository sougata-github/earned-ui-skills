# Approaches compared

Why WebGL is the default, and what to do when the glass must sit on live
page content.

| Approach | How | Browsers | Verdict |
| --- | --- | --- | --- |
| `backdrop-filter: blur()` and a border | Frosted blur | All | Not glass. Scatters, does not bend. Fine for nav chrome, never as the glass itself |
| SVG filter inside `backdrop-filter: url()` | Displacement map from a height profile, Snell's law, a specular layer | Chromium only for backdrops | The best physics write-up ([kube.io](https://kube.io/blog/liquid-glass-css-svg/)). Use when Chromium only is acceptable |
| SVG displacement on the element's own content | `feDisplacementMap` on what the element contains, three taps for colour fringe | All | Real refraction of the element's own pixels. No supersampling, Safari caps source size, and WebKit does not pass GPU composited layers (video, canvas) through SVG filters |
| Snapshot to texture | Render page content into a texture, lens it in WebGL | All | Fragile with theme switches, scrolling and animated content |
| **WebGL over owned media (this skill)** | One canvas draws the image and the glass | All with WebGL2 | Exact optics everywhere. Requires the background to be an image, video or canvas the page controls |

## When the background is live content

1. Prefer moving the content into the glass's world: an image, a video
   frame, or a canvas the page draws. Most hero sections, stages and
   widget boards already are.
2. If it must be live DOM and Chromium only is acceptable, use an SVG
   displacement map in `backdrop-filter` with the same squircle profile and
   the same light rules from this skill.
3. Otherwise refract the element's own content with an SVG displacement
   filter, and accept its limits in Safari.

Whichever approach, the rest of this skill holds: references first, a lab,
tuning by eye, Apple's rules, and the lessons.

## Further reading

- [Liquid Glass Studio](https://github.com/iyinchao/liquid-glass-studio): a
  WebGL2 studio app with SDF shapes, refraction, dispersion and glare. A
  technique reference.
- [Aave: building glass for the web](https://aave.com/design/building-glass-for-the-web):
  the displacement map approach.
