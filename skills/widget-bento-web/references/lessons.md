# Lessons

Each entry is something that looked wrong on screen while building widget
walls for the web, why, and the fix that held. The last section lists
faults that were prevented from known causes and never seen.

## Contents

- What goes in a tile
- Structure
- Colour and detail
- Motion
- Rendering
- Process
- Guarded against

## What goes in a tile

**A compact idea in a wide box did not land.** A ring or a single number
centred in a wide tile left the sides empty and read as unfinished. Fix: the
shape of the tile follows the content. Wide tiles get things that spread (an
area chart, a contribution grid, a line). Small tiles get one number or one
ring.

**Forcing data into a chart looked like decoration.** Starting from "this
tile needs a chart" and finding data for it produced tiles that said
nothing. Fix: start from the claim, ask what its evidence already looks like
in the product, and draw that.

**A wall of charts read as a dashboard template.** Fix: most tiles are
product UI (a thread, a calendar, a toggle list, a player, a sheet). On the
reference wall two of twenty one tiles are charts.

**Twenty unrelated tiles read as a sticker sheet.** Fix: one story and one
cast. Every name, number and date comes from one file, and the same people
appear across the tiles.

**A day, week, month switch alone in a tile meant nothing.** Fix: a control
lives in the tile whose content it changes. Inside the signups tile the
switch changes the number and the bars.

**A tick beside the word "Sent" said it twice.** Fix: a state is said once.
The button turns to the done colour and reads "Sent".

**Small green status dots read as filler.** A dot beside a label or in the
corner of a card. Fix: remove them. The state is already in the words, the
icon or the colour.

**A lone solid badge with a bare number looked like it came from another
kit.** Fix: one pill style for every count and delta, a tint of its colour,
and a count says what it counts ("7 new").

**Random data and timing could not be reviewed.** It looked different on
every load, so feedback on one load did not apply to the next. Fix: every
size, delay, order and value is fixed.

## Structure

**Content stretched into a chosen height left uneven gaps.** Fix: draw the
content at its natural size first, then set the tile's height so the gaps
come out even and whole. Check the arithmetic for every tile.

**The segmented switch's padding looked off.** Fix: the thumb is inset by
the same amount on every side, and the sizes divide. A 128 px track with
4 px of padding gives three 40 px segments. A 126 px track gives 39.33 px
segments and the thumb never sits exactly on one.

**Squeezing the wall onto a phone made it unreadable.** One fixed
arrangement scaled down to a narrow screen. Fix: responsive by arrangement.
The same tiles in fewer columns, each arrangement made by hand, tiles never
stretched or shrunk past the widths they were checked at.

**Columns ended at different heights.** With different numbers of tiles per
column, the gaps do not cancel out. Fix: make every column's tiles and gaps
add up to the same height, and let one tile grow a pixel or two in a plan
where the sums cannot be whole.

**The wall floated between wide empty bands.** A wall composed for a 16:9
screen, scaled into a squarer window, sat in the middle with blank bands
above and below, and read as broken. Fix: an arrangement per screen shape,
one screen only where it leaves little of the window empty, otherwise fill
the width and scroll.

**Many tiles, no consistency.** Each tile had been designed on its own.
Fix: one anatomy (one title size, one meta size, one number size, one pill,
one icon family) used by every tile.

## Colour and detail

**One accent on twenty tiles was flat, and it was asked to be more
colourful.** Fix: a few colours, each with one meaning across the wall, used
as a solid fill or as a tint with a darker ink of the same hue. A colour per
tile with no meaning is noise.

**In dark mode the switch's thumb disappeared.** The raised thumb and its
track came out the same grey. Fix: dark mode is designed, not inverted. The
track is a well darker than the tile.

**The progress ring did not read as one object.** Fix: one wide groove and
one thinner fill inset in it, with round ends.

**Mixed icon sets looked assembled.** Fix: one icon family for every glyph,
including spinners and stars.

**A card of three plain chips looked cheap.** Fix: give each item its own
small card, its glyph in its own colour and a label, with the pending one
shown as a spinner in soft ink.

## Motion

**The wall was already moving on the first frame and read as abrupt.** Fix:
open from nothing. A blank canvas, then a small title, then the wall.

**Columns that scrolled in and then sped up read as two unrelated moves.**
Fix: one gesture for the entrance, on one curve, with no change of speed
half way. The tiles land the way a home screen does on unlock: enlarged and
pushed out from the centre, then one long soft settle.

**A large title leaving with a big scale and blur read as harsh.** Fix: a
smaller title, and an exit that is quieter and shorter than the entrance: a
plain fade with 1.5% of scale.

**Blur everywhere read as smeared.** Fix: blur is a mask, 2 px where two
texts cross and a trace on a fade. Rows that only move and fade get none.

**A thread that started empty and filled from the bottom looked broken.**
Fix: a list is full from the first frame and moves one slot at a time.

**A card leaving its list flashed over what was beside it.** It glided a
whole slot past the end of the list while fading, on top of the card taking
its place. Fix: it steps a few pixels, fades in about 220 ms, and sits
behind.

**Everything changing at once was noise.** Fix: one conductor, two tiles a
beat, a fixed order that never wakes two neighbours together.

**A calendar mark that jumped between two days read as a glitch.** Fix: the
mark stays on the day that matters, and the note under it changes.

## Rendering

**Gliding text shifted when the move ended.** The browser gives a moving
row its own layer, then takes it away and redraws the words on the pixel
grid, a fraction of a pixel off. Fix: `will-change: transform` on the rows
that glide, and only those. `backface-visibility: hidden` was not enough.

**A hidden duplicate of an SVG broke the visible copy.** Two copies with the
same gradient and mask ids, one hidden per breakpoint, and the hidden one
owned the ids. Fix: render once and position with CSS.

## Process

**Designing content before the structure was approved wasted work.** Fix:
show the empty bento first, tiles as labelled boxes, and build nothing into
it until the human has seen it.

**Tuning in code burns hours.** Fix: the lab. The human drags, clicks
through the states and pastes the values back.

**A fix asked for on one tile was needed on five.** Fix: after fixing the
named thing exactly, look for the same fault wherever the same part is used.

**When an effect fails twice, change the idea.** The scrolling column
entrance was tuned twice and still read as wrong. A different entrance
worked the first time.

**Say what was not checked.** Layout arithmetic can be verified without a
browser. Motion and contrast cannot. Say plainly what was not seen.

## Guarded against

Known causes, prevented before they showed. Not seen on screen.

**Nested corners.** A card with the same radius as its tile looks thicker
at the corners. The inner radius is the outer radius less the padding
between them.

**Text at another column width.** A line that only just fits at one column
width overflows at a narrower one. Check each widget at the narrowest column
it appears in, and shorten the text rather than the type.

**Soft text from a scaled stage.** The stage is scaled with CSS `zoom`, not
a transform, so text is drawn at its final size. Under zoom, move things
with explicit transforms from known positions, not with layout animation
that measures the page.

**A scrollbar during the entrance.** Tiles that start past the edge would
extend the page. The wall's container has `overflow: clip`.

**A curve that is not drawn.** A path whose shape is set only through the
CSS `d` property is not drawn where the property is unsupported. Set the `d`
attribute as well, and treat the glide between shapes as an enhancement.
