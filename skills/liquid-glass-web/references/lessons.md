# Lessons

Each entry is a failure seen while building production Liquid Glass on the
web, its cause, and the fix that held.

## Contents

- Look
- Loading and resizing
- Layout and measuring
- Rendering
- Content and ink
- Process

## Look

**A blur is not glass.** Blur plus a border plus a white tint read as cheap
every time it was tried. Fix: refraction at the edge, frost only as a
secondary property of regular glass.

**Light that follows the pointer reads as a gimmick.** It was tried and
removed. Fix: one fixed light (upper left, 135 degrees) for every shape on
the page.

**The rim is the first thing to overdo.** A lit outline makes glass look like
a sticker. The tuned value was 0.1 of a 0 to 1.5 range. Specular carries the
light, the rim only hints at it.

**Rainbow dispersion is a demo, not a material.** A trace (0.005 to 0.015)
reads as real glass. More reads as a filter.

**Square glass reads as acrylic.** The squircle profile and continuous
corners are what make it liquid. Grid cells can stay square, the glass
panel sitting in them is rounded. The box never rounds to match the panel,
and the panel never squares to match the box.

**Glass over a flat colour is invisible.** Refraction needs detail behind
it. Judge glass only over the real image.

**Inflated, domed glass reads as chrome.** A milky, bubbly version of glass
type was tried and dropped. Keep the body clear and the light on the edge.

## Loading and resizing

**Bare borders flashed before the first WebGL frame.** Fix: keep the canvas
invisible until its first real frame, fade the image in, and only then
materialize the glass and resolve the content on it (a 6 px blur and a
0.985 scale to sharp, about 700 ms, starting 150 ms after the glass).

**A resize showed one empty frame.** Changing a canvas's size clears it.
Fix: resize and render synchronously inside the ResizeObserver callback,
with the shapes measured before the size changes.

**An image that fails to decode left no art.** AVIF is not everywhere. Fix:
load a WebP fallback under the same key, and make sure a stale-load guard
does not discard it.

**Without WebGL2 there must still be a page.** Fix: the image and a solid
surface for the panel, with the ink switched to the page's own. Never a
blur standing in for glass.

## Layout and measuring

**Percentage heights clipped the panel on phones.** Fix: panels take their
content's height, the box around them is at least the panel plus padding.

**The glass lagged its content by a frame while moving.** Measuring before
the frame's DOM writes reads last frame's positions. Fix: in one
requestAnimationFrame callback, write transforms, then measure, then
render.

**Glass jumped when an entrance animation ended.** Measuring an element in
the middle of its entrance (scaled, translated) placed the glass where the
element was, not where it would rest. Fix: measure the resting position
(undo the entrance transform), or keep measured elements free of entrance
transforms.

**Content that animates resized the panel mid animation.** Fix: lay out the
finished state up front and reveal it in place (characters, lines,
heights), so the glass never re-renders for it.

**A hidden duplicate of an SVG broke gradients in the visible copy.** Two
copies of an SVG with the same ids (one hidden per breakpoint) let the
hidden one own the ids. Fix: render once and position with CSS.

## Rendering

**The refracted edge came out blurry.** Automatic mip selection reads the
big jumps refraction makes between neighbouring pixels as minification.
Fix: `textureLod` at an explicit level matched to the image's scale.

**Large images shimmered when drawn small.** Fix: mipmaps, and that same
explicit level.

**Full page canvases are expensive at 3x.** Fix: cap the pixel ratio at 2,
render on demand (resize, scroll, load, active animation), pause off screen
and in hidden tabs.

**`backdrop-filter` layers blurred nothing.** For blur based chrome near the
glass (a scrolled header, a scroll edge), an ancestor with opacity below 1
becomes the backdrop root, so the layers blur only what is inside it. Fix:
animate the blur radius, never the container's opacity.

## Content and ink

**Dark text on glass in light mode looked wrong over darker art.** Ink must
follow the image under the glass, not the page theme. Fix: sample the image
under the panel, score both inks with APCA, keep white unless dark wins by
a clear margin, with hysteresis. Use two fixed ink tokens, identical in both
themes.

**Red error outlines clashed with the art.** On glass, invalid fields got a
stronger outline in the same ink, with the error line and its icon carrying
the meaning.

**Glass on glass, done right.** A glass form whose fields and button are
glass insets refracting the panel (its frost, tint and light) read
naturally. Separate glass pills stacked on a glass panel did not.

## Process

**Tuning in code burns hours.** Every round of "change a value, reload,
look" cost minutes. A lab with sliders and Copy as JSON let the human find
the look in one sitting. Build it first.

**Judge on every background, in both themes.** A material tuned on one
image was wrong on the next. Tune across all the images the glass will sit
on.

**When an effect fails twice, change the idea.** A third round of tuning on
the wrong approach rarely saves it.

**Say what was not checked.** Shaders compile only at runtime. Validate GLSL
with `glslangValidator` before shipping, and say plainly when something was
not seen in a browser.
