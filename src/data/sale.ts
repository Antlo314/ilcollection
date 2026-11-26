// The current promotion. Everything sale-related on the site (announcement bar countdown,
// home-page feature, shop banner) reads from here, and shows itself only inside the window:
// before `start` it counts down to the opening, during the sale it counts down to `end`,
// and after `end` it disappears on its own. Set `enabled: false` to switch it off early.
//
// The discount itself is applied at checkout on the Wix store — create a coupon there with
// the same `code` and `percent`, valid for the same dates.
export const sale = {
  enabled: true,
  name: 'The Glow Weekend',
  percent: 25,
  code: 'GLOW25',
  /** Eastern Time, so the sale opens and closes at midnight for the business. */
  start: '2026-11-27T00:00:00-05:00',
  end: '2026-11-30T23:59:59-05:00',
  dates: 'Fri, Nov 27 – Mon, Nov 30',
  datesShort: 'Fri – Mon',
  /** How long before `start` the "coming soon" countdown appears. */
  teaseDays: 7,
  video: { src: '/media/video/glow-weekend.mp4', poster: '/media/video/glow-weekend.jpg', square: '/media/video/glow-weekend-4x5.mp4' },
};

export type Sale = typeof sale;
