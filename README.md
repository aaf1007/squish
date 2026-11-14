# squish — mascot studio

Design a tiny animated mascot in the browser: 14 morphing body shapes, 16 moods, 11 eye styles, mouths, cheeks,
headwear, eyewear, auras, finishes, patterns, gradients and backdrops — then export it.

- **Shuffle** (or hit `space`) for a random mascot; every change spring-morphs.
- **13 motions** (idle, float, bounce, jelly, talk, sleep…) with a speed control.
- **Export** PNG, SVG, looping animated SVG, or a 1080p video (square, 9:16 Reel, or 16:9).
- **Share** copies a link that encodes the whole mascot in the URL hash — no backend.

## Develop

```bash
npm install
npm run dev
```

## Deploy

It is a static Vite build (`npm run build` → `dist/`). On Vercel: import the repo, or run `npx vercel --prod`
from this folder — `vercel.json` already sets the framework, build command and output directory.

## How it works

- `src/mascot/shapes.ts` — every body is a star-convex outline sampled as 180 radii, so any shape can morph into any other.
- `src/mascot/model.ts` — the config, validation of shared links, expressions, presets and randomiser.
- `src/mascot/Mascot.tsx` — the SVG renderer (body, face, accessories, aura).
- `src/mascot/anim.ts` — motion as plain CSS keyframes, shared by the live preview and all exports.
- `src/mascot/export.ts` — PNG / SVG / animated SVG / video export (video is recorded frame by frame from paused SVG frames).
