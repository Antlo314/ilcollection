/* ==========================================================================
   Site-wide motion: smooth scroll, intro curtain, text reveals, parallax,
   pinned horizontal scroll, marquees, incandescent cursor glow.
   Everything is attribute-driven so pages only declare intent in markup.
   ========================================================================== */
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { SplitText } from 'gsap/SplitText';
import Lenis from 'lenis';

gsap.registerPlugin(ScrollTrigger, SplitText);
// Mobile address bars resize the viewport while scrolling; don't re-measure (avoids jumps).
ScrollTrigger.config({ ignoreMobileResize: true });

const root = document.documentElement;
// `?nomotion` renders every final state immediately (handy for QA screenshots).
const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches || new URLSearchParams(location.search).has('nomotion');
const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
const $$ = <T extends Element = HTMLElement>(sel: string, scope: ParentNode = document) => Array.from(scope.querySelectorAll<T & Element>(sel)) as T[];

root.classList.add('motion-ready');
gsap.defaults({ ease: 'expo.out', duration: 1.2 });

/* ---------- smooth scroll ---------- */
let lenis: Lenis | null = null;
if (!reduce) {
  lenis = new Lenis({ lerp: 0.085, wheelMultiplier: 0.95 });
  lenis.on('scroll', ScrollTrigger.update);
  gsap.ticker.add((time) => lenis?.raf(time * 1000));
  gsap.ticker.lagSmoothing(0);
}
(window as unknown as { ilcLenis: Lenis | null }).ilcLenis = lenis;
if (import.meta.env.DEV) Object.assign(window, { gsap, ScrollTrigger });

// In-page anchors glide instead of jumping.
document.addEventListener('click', (e) => {
  const a = (e.target as HTMLElement).closest<HTMLAnchorElement>('a[href^="#"]');
  if (!a || !lenis) return;
  const id = a.getAttribute('href')!;
  const target = id.length > 1 ? document.querySelector<HTMLElement>(id) : null;
  if (target) { e.preventDefault(); lenis.scrollTo(target, { offset: -90, duration: 1.4 }); }
});

/* ---------- header: solid after scroll, hides going down, returns going up ---------- */
{
  let last = 0;
  const update = (y: number) => {
    root.classList.toggle('header-solid', y > 30);
    if (!root.classList.contains('menu-open')) root.classList.toggle('header-hidden', y > 220 && y > last);
    last = y;
  };
  if (lenis) lenis.on('scroll', ({ scroll }: { scroll: number }) => update(scroll));
  else window.addEventListener('scroll', () => update(window.scrollY), { passive: true });
  update(window.scrollY);
}

/* ---------- mobile menu ---------- */
{
  const btn = document.querySelector<HTMLButtonElement>('[data-menu-toggle]');
  const menu = document.querySelector<HTMLElement>('[data-menu]');
  if (btn && menu) {
    const links = $$('.menu__link, .menu__foot', menu);
    const setOpen = (open: boolean) => {
      btn.setAttribute('aria-expanded', String(open));
      root.classList.toggle('menu-open', open);
      if (open) {
        menu.hidden = false;
        lenis?.stop();
        gsap.fromTo(menu, { clipPath: 'inset(0 0 100% 0)' }, { clipPath: 'inset(0 0 0% 0)', duration: 0.9, ease: 'expo.inOut' });
        gsap.fromTo(links, { yPercent: 60, opacity: 0 }, { yPercent: 0, opacity: 1, stagger: 0.06, delay: 0.35, duration: 1 });
      } else {
        lenis?.start();
        gsap.to(menu, { clipPath: 'inset(0 0 100% 0)', duration: 0.7, ease: 'expo.inOut', onComplete: () => { menu.hidden = true; } });
      }
    };
    btn.addEventListener('click', () => setOpen(btn.getAttribute('aria-expanded') !== 'true'));
    document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && root.classList.contains('menu-open')) setOpen(false); });
    window.matchMedia('(min-width: 961px)').addEventListener('change', (m) => { if (m.matches && root.classList.contains('menu-open')) setOpen(false); });
  }
}

/* ---------- intro curtain (first page of a visit) ---------- */
function intro(): Promise<void> {
  const pre = document.querySelector<HTMLElement>('[data-preloader]');
  if (!pre || root.classList.contains('intro-seen') || reduce) {
    if (pre) pre.style.display = 'none';
    return Promise.resolve();
  }
  try { sessionStorage.setItem('ilc-intro', '1'); } catch { /* private mode */ }
  lenis?.stop();
  return new Promise((resolve) => {
    gsap.timeline({ onComplete: () => { pre.style.display = 'none'; lenis?.start(); } })
      .to('.preloader__lily', { clipPath: 'inset(0% 0 0 0)', duration: 1.3, ease: 'expo.inOut' })
      .fromTo('.preloader__word span, .preloader__word em', { yPercent: 110, y: 0 }, { yPercent: 0, duration: 1.1, stagger: 0.1 }, '-=0.7')
      .to(pre, { clipPath: 'inset(0 0 100% 0)', duration: 1.1, ease: 'expo.inOut', onStart: () => resolve() }, '+=0.35');
  });
}

/* ---------- split-text headings ---------- */
function splitHeading(el: HTMLElement, opts: { delay?: number; immediate?: boolean } = {}) {
  gsap.set(el, { visibility: 'visible' });
  if (reduce) return;
  SplitText.create(el, {
    type: 'lines',
    mask: 'lines',
    linesClass: 'split-line',
    autoSplit: true,
    onSplit(self) {
      const tween = gsap.from(self.lines, {
        yPercent: 105,
        duration: 1.5,
        stagger: 0.09,
        delay: opts.delay ?? 0,
        paused: !opts.immediate,
      });
      if (!opts.immediate) ScrollTrigger.create({ trigger: el, start: 'top 88%', once: true, onEnter: () => tween.play() });
      return tween;
    },
  });
}

/* ---------- generic reveals ---------- */
function reveals(scope: ParentNode = document) {
  const items = $$('[data-reveal]', scope).filter((el) => !el.closest('[data-hero]'));
  if (reduce) { gsap.set(items, { opacity: 1, y: 0 }); return; }
  ScrollTrigger.batch(items, {
    start: 'top 90%',
    once: true,
    onEnter: (batch) => gsap.to(batch, { opacity: 1, y: 0, duration: 1.3, stagger: 0.1 }),
  });
}

/* ---------- clip/arch image reveals ---------- */
function clipReveals() {
  $$('[data-clip]').forEach((el) => {
    const inner = el.querySelector('img, video');
    if (reduce) { gsap.set(el, { clipPath: 'none' }); return; }
    const inHero = !!el.closest('[data-hero]');
    const tl = gsap.timeline({ paused: true })
      .fromTo(el, { clipPath: 'inset(100% 0% 0% 0%)' }, { clipPath: 'inset(0% 0% 0% 0%)', duration: 1.7, ease: 'expo.inOut' });
    if (inner) tl.fromTo(inner, { scale: 1.3 }, { scale: 1, duration: 2.2, ease: 'expo.out' }, 0.15);
    if (inHero) (el as HTMLElement & { _tl?: gsap.core.Timeline })._tl = tl;
    else ScrollTrigger.create({ trigger: el, start: 'top 85%', once: true, onEnter: () => tl.play() });
  });
}

/* ---------- parallax ---------- */
function parallax() {
  if (reduce) return;
  $$('[data-parallax]').forEach((el) => {
    const speed = parseFloat(el.dataset.parallax || '0.15');
    gsap.fromTo(el, { yPercent: -speed * 50 }, {
      yPercent: speed * 50,
      ease: 'none',
      scrollTrigger: { trigger: el.closest('[data-parallax-scope]') || el.parentElement, start: 'top bottom', end: 'bottom top', scrub: true },
    });
  });
}

/* ---------- marquees: endless drift that leans into scroll velocity ---------- */
function marquees() {
  $$('[data-marquee]').forEach((m) => {
    const track = m.querySelector<HTMLElement>('[data-marquee-track]');
    if (!track || reduce) return;
    const loop = gsap.to(track, { xPercent: -50, duration: 46, ease: 'none', repeat: -1 });
    let dir = 1;
    ScrollTrigger.create({
      trigger: m, start: 'top bottom', end: 'bottom top',
      onUpdate: (self) => {
        const v = self.getVelocity();
        if (Math.abs(v) > 20) dir = v > 0 ? 1 : -1;
        const boost = gsap.utils.clamp(1, 5, 1 + Math.abs(v) / 450);
        gsap.to(loop, { timeScale: dir * boost, duration: 0.3, overwrite: true, onComplete: () => { gsap.to(loop, { timeScale: dir, duration: 1.4 }); } });
      },
    });
  });
}

/* ---------- words light up as they scroll through the viewport ---------- */
function lightUp() {
  $$('[data-lightup]').forEach((el) => {
    gsap.set(el, { visibility: 'visible' });
    if (reduce) return;
    const split = SplitText.create(el, { type: 'words', wordsClass: 'lw' });
    gsap.fromTo(split.words, { opacity: 0.14 }, {
      opacity: 1, stagger: 0.08, ease: 'none',
      scrollTrigger: { trigger: el, start: 'top 78%', end: 'bottom 45%', scrub: 0.6 },
    });
  });
}

/* ---------- pinned horizontal scroll (desktop) ---------- */
function horizontal() {
  const mm = gsap.matchMedia();
  mm.add('(min-width: 961px) and (prefers-reduced-motion: no-preference)', () => {
    $$('[data-hscroll]').forEach((section) => {
      const track = section.querySelector<HTMLElement>('[data-hscroll-track]');
      if (!track) return;
      const distance = () => Math.max(0, track.scrollWidth - window.innerWidth);
      const tween = gsap.to(track, {
        x: () => -distance(),
        ease: 'none',
        scrollTrigger: {
          trigger: section,
          start: 'top top',
          end: () => `+=${distance()}`,
          pin: true,
          scrub: 0.8,
          invalidateOnRefresh: true,
          anticipatePin: 1,
        },
      });
      const bar = section.querySelector<HTMLElement>('[data-hscroll-progress]');
      if (bar) gsap.fromTo(bar, { scaleX: 0 }, { scaleX: 1, ease: 'none', scrollTrigger: { trigger: section, start: 'top top', end: () => `+=${distance()}`, scrub: true } });
      // Cards drift a touch inside the moving track for depth.
      $$('[data-hscroll-item] img', section).forEach((img) => {
        gsap.fromTo(img, { xPercent: 6 }, { xPercent: -6, ease: 'none', scrollTrigger: { trigger: img, containerAnimation: tween, start: 'left right', end: 'right left', scrub: true } });
      });
    });
  });
}

/* ---------- scroll-scaled media (rounded window that opens to full bleed) ---------- */
function expanders() {
  if (reduce) return;
  $$('[data-expand]').forEach((el) => {
    gsap.fromTo(el, { clipPath: 'inset(12% 9% 12% 9% round 28px)' }, {
      clipPath: 'inset(0% 0% 0% 0% round 0px)', ease: 'none',
      scrollTrigger: { trigger: el, start: 'top 85%', end: 'top 15%', scrub: true },
    });
  });
}

/* ---------- spinning badges ---------- */
function spinners() {
  if (reduce) return;
  $$('[data-spin]').forEach((el) => {
    gsap.to(el, { rotation: 360, duration: 26, repeat: -1, ease: 'none' });
    gsap.to(el, { rotation: '+=180', ease: 'none', scrollTrigger: { trigger: document.body, start: 'top top', end: 'bottom bottom', scrub: 1 } });
  });
}

/* ---------- magnetic buttons ---------- */
function magnetic() {
  if (!finePointer || reduce) return;
  $$('[data-magnetic]').forEach((el) => {
    const xTo = gsap.quickTo(el, 'x', { duration: 0.6, ease: 'power3.out' });
    const yTo = gsap.quickTo(el, 'y', { duration: 0.6, ease: 'power3.out' });
    el.addEventListener('pointermove', (e) => {
      const r = el.getBoundingClientRect();
      xTo((e.clientX - r.left - r.width / 2) * 0.22);
      yTo((e.clientY - r.top - r.height / 2) * 0.3);
    });
    el.addEventListener('pointerleave', () => { xTo(0); yTo(0); });
  });
}

/* ---------- incandescent cursor glow ---------- */
function glow() {
  const g = document.querySelector<HTMLElement>('[data-glow]');
  if (!g || !finePointer || reduce) return;
  const xTo = gsap.quickTo(g, 'x', { duration: 0.9, ease: 'power3.out' });
  const yTo = gsap.quickTo(g, 'y', { duration: 0.9, ease: 'power3.out' });
  window.addEventListener('pointermove', (e) => { xTo(e.clientX); yTo(e.clientY); g.classList.add('is-on'); }, { passive: true });
  document.addEventListener('pointerleave', () => g.classList.remove('is-on'));
}

/* ---------- footer wordmark ---------- */
function footerWord() {
  const word = document.querySelector<HTMLElement>('[data-footer-word]');
  if (!word || reduce) return;
  const split = SplitText.create(word, { type: 'chars' });
  gsap.from(split.chars, {
    yPercent: 60, opacity: 0, stagger: 0.04, duration: 1.6,
    scrollTrigger: { trigger: word, start: 'top 98%', once: true },
  });
}

/* ---------- hero entrance (after the curtain lifts) ---------- */
function hero() {
  const scope = document.querySelector<HTMLElement>('[data-hero]');
  if (!scope) return;
  $$('[data-split]', scope).forEach((el, i) => splitHeading(el, { immediate: true, delay: 0.1 + i * 0.12 }));
  $$('[data-clip]', scope).forEach((el) => {
    const tl = (el as HTMLElement & { _tl?: gsap.core.Timeline })._tl;
    if (tl) gsap.delayedCall(0.15, () => { tl.play(); });
  });
  const items = $$('[data-reveal]', scope);
  if (reduce) gsap.set(items, { opacity: 1, y: 0 });
  else gsap.to(items, { opacity: 1, y: 0, duration: 1.4, stagger: 0.1, delay: 0.55 });
}

/* ---------- boot ---------- */
async function boot() {
  clipReveals();
  await document.fonts.ready;
  $$('[data-split]').filter((el) => !el.closest('[data-hero]')).forEach((el) => splitHeading(el));
  lightUp();
  reveals();
  parallax();
  marquees();
  horizontal();
  expanders();
  spinners();
  magnetic();
  glow();
  footerWord();
  await intro();
  hero();
  ScrollTrigger.refresh();
}
boot();

// Re-measure once late images settle.
window.addEventListener('load', () => ScrollTrigger.refresh());

export { gsap, ScrollTrigger, lenis };
