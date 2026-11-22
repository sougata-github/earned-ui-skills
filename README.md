# earned-ui-skills

<img src="demo-assets/liquid-glass-cover.png" alt="Six liquid glass widgets on a sky of clouds, with a material panel beside them for tuning the glass" width="100%">

<sub>Liquid glass built with the <code>liquid-glass-web</code> skill: real WebGL2 refraction, tuned live in a lab.</sub>

<img src="demo-assets/widget-bento-wall-dark.png" alt="A dark wall of 21 live widgets telling one launch day: a calendar, a finished release pipeline, a sent invoice, a team chat, signups, revenue, notifications and a rollout at 100%" width="100%">

<sub>The launch day wall built with the <code>widget-bento-web</code> skill: 21 tiles, one story, every widget stepping through its states.</sub>

UI skills for coding agents, earned the hard way. Each one folds a real
build into a workflow an agent can follow: the order to work in, the rules,
a small reference implementation to adapt, and the mistakes worth not
repeating.

A library gives you a fixed set of components. A skill gives your agent the
workflow to build its own.

## Skills

| Skill | What it builds | Status |
| --- | --- | --- |
| [`liquid-glass-web`](skills/liquid-glass-web/SKILL.md) | Apple style Liquid Glass on the web with real refraction (WebGL2), not a backdrop blur | Ready |
| [`widget-bento-web`](skills/widget-bento-web/SKILL.md) | A bento of live widgets where every tile proves something the page says, composed on every screen | Ready |

## Install

With [skills](https://github.com/vercel-labs/skills), for Claude Code, Codex,
Cursor and the other agents it supports:

```bash
npx skills add sougata-github/earned-ui-skills
```

Just one skill:

```bash
npx skills add sougata-github/earned-ui-skills --skill liquid-glass-web
npx skills add sougata-github/earned-ui-skills --skill widget-bento-web
```

Or copy a folder from `skills/` into your agent's skills directory.

## liquid-glass-web

Ask your agent for glass ("a liquid glass player widget over this image")
and the skill takes it through:

1. What sits behind the glass, and two references to judge against
2. The architecture (WebGL over owned media by default)
3. A tuning lab: your real background and a live control for every
   property of the glass
4. Each component shown in the lab first. You tweak and paste the values
   back as JSON, or keep the current ones. This is what gets you to the look
   you want, not better guesses in code
5. The tuned preset carried to every next component, still lab first
6. A verification checklist

Inside: a dependency free WebGL2 renderer (squircle edge profile, Snell's
law per colour channel, frost, Fresnel rim, fixed light, contact shadow,
shapes that melt together), a React tuning lab, Apple's rules distilled,
and the lessons from shipping it.

## widget-bento-web

Ask your agent for a bento ("a features section with live widgets for this
product") and the skill takes it through:

1. The page's claims, one story and one cast, so every tile belongs
2. The frame: rounded tiles on a canvas, or cells ruled by hairlines
3. A lab with the empty bento first. You approve which tiles and how big
   before any content exists
4. One widget at a time, each built at its real size and shown in the lab
   in both themes. You click through its states, then tweak and paste the
   values back as JSON, or keep the current ones
5. Alive by state: each widget steps through a few states, and one
   conductor wakes two tiles a beat in a fixed order
6. An arrangement per screen shape. Tiles are rearranged, never squeezed,
   and every column ends level
7. A verification checklist

Inside: a small React wall engine (plans, the fit to any window, the
conductor, an opening where the tiles land like a home screen on unlock), a
number that rolls and text that swaps, a lab, the forms a tile can take with
when to use each, and the lessons from building it.

Its live demo is the launch day wall on the site: 21 tiles telling one
story.

## The site

`site/` is the showcase: a list of the skills, a page for each with its live
demo, and the demos on their own. It is a Next.js static export, and it runs
on the skills' own assets, copied in before every dev, build and typecheck,
so what ships in a skill is what is seen there.

```bash
cd site && pnpm install && pnpm dev   # localhost:3201
```

- `/` lists the skills, `/skills/<name>/` is a skill's page
- `/demo/widget-bento-web/` is the wall (add `?lab` for the bento lab)
- `/demo/liquid-glass-web/` is the glass demo
- `pnpm build` writes the static site to `site/out`. Set
  `NEXT_PUBLIC_SITE_URL` to the real origin first: canonical URLs, the
  sitemap, robots.txt and llms.txt are built from it
- Content is MDX in `site/content`, built by Velite, which also writes a
  Markdown twin of every skill page and an `llms.txt`

## Credits

- Apple: [Liquid Glass](https://developer.apple.com/documentation/technologyoverviews/liquid-glass),
  [HIG Materials](https://developer.apple.com/design/human-interface-guidelines/materials),
  [WWDC25 Meet Liquid Glass](https://developer.apple.com/videos/play/wwdc2025/219)
- [Emil Kowalski's skills](https://github.com/emilkowalski/skills), the
  `apple-design` skill composes with this one for motion
- [kube.io](https://kube.io/blog/liquid-glass-css-svg/) on the physics, and
  [Liquid Glass Studio](https://github.com/iyinchao/liquid-glass-studio)

## License

The code and the skills are MIT licensed.

The images in `demo-assets/` and `site/public/posters/liquid-glass-web.webp`
are not. They show artwork that belongs to its owner, all rights reserved: do
not copy, reuse or redistribute them.
