// Renders glow-weekend.html to MP4 frame-by-frame (deterministic, no dropped frames).
//   cd _video && npm install && npm run render
// Needs Chrome (or set CHROME_PATH) and ffmpeg on PATH.
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import puppeteer from 'puppeteer-core';

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, '..');
const out = path.join(root, 'public/media/video');
const FPS = 30;
const formats = [
  { file: 'glow-weekend.mp4', width: 1080, height: 1920 }, // Reels, TikTok, Stories
  { file: 'glow-weekend-4x5.mp4', width: 1080, height: 1350, poster: 'glow-weekend.jpg', posterAt: 16.2 }, // feed + website
];
const only = process.argv[2];

const types = { '.html': 'text/html', '.js': 'text/javascript', '.mjs': 'text/javascript', '.png': 'image/png', '.webp': 'image/webp', '.woff2': 'font/woff2', '.jpg': 'image/jpeg' };
const server = http.createServer((req, res) => {
  const p = path.join(root, decodeURIComponent(new URL(req.url, 'http://x').pathname));
  if (!p.startsWith(root) || !fs.existsSync(p) || fs.statSync(p).isDirectory()) { res.writeHead(404).end(); return; }
  res.writeHead(200, { 'Content-Type': types[path.extname(p)] || 'application/octet-stream' });
  fs.createReadStream(p).pipe(res);
}).listen(0);
const port = server.address().port;

const chrome = process.env.CHROME_PATH || ['C:/Program Files/Google/Chrome/Application/chrome.exe', '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', '/usr/bin/google-chrome'].find((p) => fs.existsSync(p));
const browser = await puppeteer.launch({ executablePath: chrome, headless: true, args: ['--hide-scrollbars', '--force-color-profile=srgb'] });

for (const f of formats.filter((f) => !only || f.file.includes(only))) {
  const page = await browser.newPage();
  await page.setViewport({ width: f.width, height: f.height, deviceScaleFactor: 1 });
  await page.goto(`http://localhost:${port}/_video/glow-weekend.html`, { waitUntil: 'networkidle0' });
  await page.evaluate(() => window.ready);
  const duration = await page.evaluate(() => window.DURATION);
  const frames = Math.round(duration * FPS);

  const ff = spawn('ffmpeg', ['-y', '-v', 'error', '-f', 'image2pipe', '-framerate', String(FPS), '-i', '-',
    '-c:v', 'libx264', '-preset', 'slow', '-crf', '18', '-pix_fmt', 'yuv420p', '-profile:v', 'high', '-movflags', '+faststart',
    path.join(out, f.file)], { stdio: ['pipe', 'inherit', 'inherit'] });

  for (let i = 0; i < frames; i++) {
    const t = i / FPS;
    await page.evaluate((t) => window.seek(t), t);
    const shot = await page.screenshot({ type: 'jpeg', quality: 95 });
    if (!ff.stdin.write(shot)) await new Promise((r) => ff.stdin.once('drain', r));
    if (f.poster && Math.abs(t - f.posterAt) < 0.5 / FPS) fs.writeFileSync(path.join(out, f.poster), await page.screenshot({ type: 'jpeg', quality: 88 }));
    if (i % 60 === 0) process.stdout.write(`${f.file} ${Math.round((i / frames) * 100)}%\n`);
  }
  ff.stdin.end();
  await new Promise((r) => ff.on('close', r));
  console.log(`✓ ${f.file} (${duration.toFixed(1)}s, ${frames} frames)`);
  await page.close();
}

await browser.close();
server.close();
