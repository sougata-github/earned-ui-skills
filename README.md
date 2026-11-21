# earned-ui-skills

<img src="demo-assets/liquid-glass-cover.png" alt="Six liquid glass widgets on a sky of clouds, with a material panel beside them for tuning the glass" width="100%">

<sub>Liquid glass built with the <code>liquid-glass-web</code> skill: real WebGL2 refraction, tuned live in a lab.</sub>

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

## Install

With [skills](https://github.com/vercel-labs/skills), for Claude Code, Codex,
Cursor and the other agents it supports:

```bash
npx skills add sougata-github/earned-ui-skills
```

Just one skill:

```bash
npx skills add sougata-github/earned-ui-skills --skill liquid-glass-web
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

The images in `demo-assets/` are not. They show artwork that belongs to its
owner, all rights reserved: do not copy, reuse or redistribute them.
