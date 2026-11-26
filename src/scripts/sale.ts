/*
 * Sale state + countdowns. Base.astro's inline head script sets the starting class
 * (`sale-soon` / `sale-live` + `sale-on`) before first paint; this keeps it current
 * and ticks every [data-countdown] once a second.
 *
 *   [data-countdown]            -> "2d 04h 12m 09s" (or data-format="short" -> "2d 04h")
 *   [data-sale-phase]           -> "Opens in" / "Ends in"
 *   [data-copy="CODE"]          -> copies CODE to the clipboard, confirms in place
 *   .sale-only / .no-sale-only  -> shown only while the sale is (or isn't) teased/live
 *   .sale-live-only             -> shown only once the sale has opened
 */
const root = document.documentElement;
const start = Date.parse(root.dataset.saleStart || '');
const end = Date.parse(root.dataset.saleEnd || '');
const tease = Number(root.dataset.saleTease || 0) * 864e5;

type Phase = 'off' | 'soon' | 'live';
const phaseAt = (now: number): Phase => {
  if (!start || !end || now > end) return 'off';
  if (now >= start) return 'live';
  return now >= start - tease ? 'soon' : 'off';
};

const pad = (n: number) => String(n).padStart(2, '0');
const format = (ms: number, short: boolean) => {
  const t = Math.max(0, Math.floor(ms / 1000));
  const d = Math.floor(t / 86400), h = Math.floor((t % 86400) / 3600), m = Math.floor((t % 3600) / 60), s = t % 60;
  if (short) return d ? `${d}d ${pad(h)}h` : `${pad(h)}h ${pad(m)}m`;
  return `${d ? `${d}d ` : ''}${pad(h)}h ${pad(m)}m ${pad(s)}s`;
};

const clocks = Array.from(document.querySelectorAll<HTMLElement>('[data-countdown]'));
const labels = Array.from(document.querySelectorAll<HTMLElement>('[data-sale-phase]'));
let last: Phase | null = null;

function tick() {
  const now = Date.now();
  const phase = phaseAt(now);
  if (phase !== last) {
    root.classList.toggle('sale-on', phase !== 'off');
    root.classList.toggle('sale-soon', phase === 'soon');
    root.classList.toggle('sale-live', phase === 'live');
    labels.forEach((el) => (el.textContent = phase === 'live' ? 'Ends in' : 'Opens in'));
    last = phase;
  }
  if (phase === 'off') return;
  const target = phase === 'live' ? end : start;
  clocks.forEach((el) => (el.textContent = format(target - now, el.dataset.format === 'short')));
}

if (start && end) {
  tick();
  setInterval(tick, 1000);
}

/* copy-to-clipboard buttons (sale code) */
document.querySelectorAll<HTMLButtonElement>('[data-copy]').forEach((btn) => {
  const original = btn.innerHTML;
  btn.addEventListener('click', async () => {
    const text = btn.dataset.copy || '';
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      const ta = Object.assign(document.createElement('textarea'), { value: text });
      document.body.append(ta);
      ta.select();
      document.execCommand('copy');
      ta.remove();
    }
    btn.textContent = 'Copied ✓';
    btn.classList.add('is-copied');
    setTimeout(() => { btn.innerHTML = original; btn.classList.remove('is-copied'); }, 1800);
  });
});
