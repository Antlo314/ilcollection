// Quick QA: saves stills at key times. node stills.mjs <outDir> [width height]
import http from 'node:http'; import fs from 'node:fs'; import path from 'node:path'; import { fileURLToPath } from 'node:url';
import puppeteer from 'puppeteer-core';
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const [outDir, w = 1080, h = 1920] = process.argv.slice(2);
fs.mkdirSync(outDir, { recursive: true });
const types = { '.html': 'text/html', '.js': 'text/javascript', '.png': 'image/png', '.webp': 'image/webp', '.woff2': 'font/woff2' };
const server = http.createServer((req, res) => { const p = path.join(root, decodeURIComponent(new URL(req.url, 'http://x').pathname)); if (!fs.existsSync(p) || fs.statSync(p).isDirectory()) { res.writeHead(404).end(); return; } res.writeHead(200, { 'Content-Type': types[path.extname(p)] || 'application/octet-stream' }); fs.createReadStream(p).pipe(res); }).listen(0);
const browser = await puppeteer.launch({ executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe', headless: true });
const page = await browser.newPage();
page.on('console', (m) => console.log('page:', m.text())); page.on('pageerror', (e) => console.log('ERR', e.message));
await page.setViewport({ width: +w, height: +h });
await page.goto(`http://localhost:${server.address().port}/_video/glow-weekend.html`, { waitUntil: 'networkidle0' });
await page.evaluate(() => window.ready);
console.log('duration', await page.evaluate(() => window.DURATION));
for (const t of [2.6, 5.5, 9.5, 13.2, 17.5]) { await page.evaluate((t) => window.seek(t), t); await page.screenshot({ path: `${outDir}/t${t}.jpg`, type: 'jpeg', quality: 80 }); }
await browser.close(); server.close();
