# Promo videos

`glow-weekend.html` is the Glow Weekend sale video, built as an animated HTML scene (GSAP).
`render.mjs` captures it frame by frame in headless Chrome and encodes MP4s with ffmpeg into
`public/media/video/`:

| File | Size | Use |
| --- | --- | --- |
| `glow-weekend.mp4` | 1080×1920 | Instagram Reels & Stories, TikTok, Facebook Stories |
| `glow-weekend-4x5.mp4` | 1080×1350 | Instagram/Facebook feed, and the home page |
| `glow-weekend.jpg` | 1080×1350 | Poster frame |

```bash
cd _video
npm install
npm run render          # both sizes (~3–5 min)
node render.mjs 4x5     # just one
node stills.mjs out     # quick QA stills at key moments
```

To change the offer, edit the text in `glow-weekend.html` (percent, dates, code) and
`src/data/sale.ts` so the site matches. Open the HTML through any local server to preview it live.
The video is silent on purpose: add a sound in Instagram/TikTok when posting.
