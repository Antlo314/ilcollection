/* Small UI behaviours shared across pages: rails, drag-scroll, animated accordions. */
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/* ---------- rail arrows ---------- */
document.querySelectorAll<HTMLElement>('[data-rail]').forEach((rail) => {
  const section = rail.closest('section');
  const step = () => (rail.querySelector<HTMLElement>(':scope > *')?.offsetWidth ?? 300) + 24;
  section?.querySelector('[data-rail-prev]')?.addEventListener('click', () => rail.scrollBy({ left: -step() * 2, behavior: 'smooth' }));
  section?.querySelector('[data-rail-next]')?.addEventListener('click', () => rail.scrollBy({ left: step() * 2, behavior: 'smooth' }));
});

/* ---------- click-and-drag horizontal scrolling for mouse users ---------- */
document.querySelectorAll<HTMLElement>('[data-drag-scroll]').forEach((el) => {
  let down = false, moved = false, startX = 0, startLeft = 0;
  el.addEventListener('pointerdown', (e) => {
    if (e.pointerType !== 'mouse') return;
    down = true; moved = false; startX = e.clientX; startLeft = el.scrollLeft;
  });
  window.addEventListener('pointermove', (e) => {
    if (!down) return;
    const dx = e.clientX - startX;
    if (Math.abs(dx) > 6) { moved = true; el.classList.add('is-dragging'); }
    if (moved) el.scrollLeft = startLeft - dx;
  });
  window.addEventListener('pointerup', () => {
    if (!down) return;
    down = false;
    requestAnimationFrame(() => el.classList.remove('is-dragging'));
  });
  el.addEventListener('click', (e) => { if (moved) { e.preventDefault(); e.stopPropagation(); moved = false; } }, true);
  el.addEventListener('dragstart', (e) => e.preventDefault());
});

/* ---------- accordions: animate <details> open/close ---------- */
document.querySelectorAll<HTMLDetailsElement>('.accordion details').forEach((d) => {
  const summary = d.querySelector('summary');
  const panel = d.querySelector<HTMLElement>('.panel');
  if (!summary || !panel) return;
  summary.addEventListener('click', (e) => {
    if (reduce) return;
    e.preventDefault();
    if (d.open) {
      gsap.fromTo(panel, { height: panel.offsetHeight }, {
        height: 0, opacity: 0, duration: 0.6, ease: 'expo.inOut',
        onComplete: () => { d.open = false; gsap.set(panel, { clearProps: 'height,opacity' }); ScrollTrigger.refresh(); },
      });
    } else {
      d.open = true;
      gsap.fromTo(panel, { height: 0, opacity: 0 }, {
        height: () => (panel.firstElementChild as HTMLElement).offsetHeight, opacity: 1, duration: 0.8, ease: 'expo.out',
        onComplete: () => { gsap.set(panel, { clearProps: 'height' }); ScrollTrigger.refresh(); },
      });
    }
  });
});
