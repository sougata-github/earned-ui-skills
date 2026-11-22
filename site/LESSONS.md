# Widget wall lessons

A running list, kept as the lab is built and reviewed. It becomes the
lessons of the `widget-bento-web` skill. Each one is something that looked
wrong on screen, and what fixed it.

## What goes in a tile

- **Fit the visual to the box.** A compact presentation in a wide box does
  not land. A wide box wants something wide (an area chart, a contribution
  map, a line), a small square wants one number or one ring.
- **Show the data, do not decorate the box.** Start from what the tile says
  and pick the form that says it. Never start from a chart and look for data.
- **Not everything is a chart.** A wall of charts reads as a dashboard
  template. Mix forms: a calendar, a message thread, a toggle list, a
  player, a counter.
- **Phone widget precision.** One idea per tile, drawn exactly: a ring is
  one groove with one fill inset in it, a switch is a 32px track with the
  thumb inset 4px on every side.
- **One story, one cast.** Every name, number and date comes from one
  place, so twenty tiles read as one product and not a sticker sheet.
- **A control lives with what it controls.** A lone day, week, month switch
  in its own tile means nothing. Inside the signups tile it changes the
  number.
- **A state is said once.** The button turns green and says Sent. A tick
  next to the word says it twice.
- **Nothing is random.** Sizes, delays, order and data are fixed. Random
  looks different on every load and cannot be reviewed.

## Layout

- **Design each tile at its real size.** Heights are fixed, content and
  gaps land on whole pixels, and a nested card's radius is the tile's radius
  less the padding between them.
- **Responsive by arrangement, never by squeezing.** A smaller screen gets
  the same tiles in fewer columns, each arrangement laid out by hand so its
  columns end level. A tile is never stretched or shrunk past the widths it
  was checked at.
- **One anatomy.** One title size, one meta size, one number size, one pill
  height, one icon family. Consistency is what makes many tiles read as one
  wall.
- **Colour has a meaning.** One accent on twenty tiles is flat, a different
  colour per tile is noise. A few colours, each tied to one meaning (live,
  people, the launch, files, praise, needs attention), plus a few dark tiles.
- **Dark mode is designed, not inverted.** A raised thumb needs a track
  darker than the tile, or it disappears.

## Motion

- **Open from nothing.** A blank canvas, then a small title, then the wall.
  A wall that is already moving on the first frame reads as abrupt.
- **One gesture for the entrance.** The tiles land the way a home screen
  does on unlock: enlarged and pushed out from the centre, then one long
  soft settle. No change of speed half way, no second act.
- **Exits are quieter than entrances.** The title leaves on a plain short
  fade. A big scale or blur on the way out reads as harsh.
- **Blur is a mask, never an effect.** 2px where two texts cross during a
  swap, a trace on a fade. Anything above that reads as smeared. Rows that
  only move and fade need none.
- **A full window from the first frame.** A message list starts full and
  scrolls. It never starts empty and fills from the bottom.
- **Moving text keeps its own layer.** A row of text that glides gets a
  layer as the move starts and loses it as the move ends, and the words
  shift by a fraction of a pixel each time. Give those rows a permanent
  layer (`backface-visibility: hidden`). Do it for those rows only, never
  for everything.
- **Scale the stage with zoom, not a transform.** Text stays sharp. Under
  zoom, move things with explicit transforms from known positions, not with
  measured layout animation.
- **Render an SVG once.** A hidden duplicate with the same ids takes over
  the gradients and masks of the visible copy.
