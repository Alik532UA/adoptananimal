/**
 * Shape of the active-tab background in the header.
 *
 * At the top of the page the tab flares out into wide skirts that meet the baseline
 * flat, so it reads as part of the coloured band underneath it. Once the page scrolls
 * that band is gone and something else — usually white — sits under the header, and
 * the same flare looks like a shape someone cut off with scissors.
 *
 * So the shape closes as you scroll: the skirts pull in and the bottom corners round
 * off, until it is an ordinary rounded tab that owes nothing to what is behind it.
 */

export const TAB_HEIGHT = 48;

/** How far the page has to move for the tab to finish closing, in pixels. */
export const SETTLE_DISTANCE = 120;

const OPEN = { slope: 100, radius: 0, inset: 48 };
const CLOSED = { slope: 20, radius: 14, inset: 20 };

const lerp = (from: number, to: number, t: number) => from + (to - from) * t;

/** Smoothstep, so the shape eases into both ends instead of tracking the scroll linearly. */
const ease = (t: number) => t * t * (3 - 2 * t);

export const clamp01 = (value: number) => Math.min(1, Math.max(0, value));

export interface TabShape {
	path: string;
	totalWidth: number;
}

/**
 * @param labelWidth width of the active nav item
 * @param progress   0 at the top of the page, 1 once it has scrolled past SETTLE_DISTANCE
 */
export function tabShape(labelWidth: number, progress: number): TabShape {
	const t = ease(clamp01(progress));

	const slope = lerp(OPEN.slope, CLOSED.slope, t);
	const radius = lerp(OPEN.radius, CLOSED.radius, t);
	const inset = lerp(OPEN.inset, CLOSED.inset, t);

	const plateau = Math.max(12, labelWidth - inset);
	const totalWidth = 2 * slope + plateau;

	const h = TAB_HEIGHT;
	// Where the skirts land. With a radius they stop short of the baseline and the
	// corner arc carries them the rest of the way.
	const foot = h - radius;

	const x1 = slope;
	const x2 = slope + plateau;
	const right = totalWidth;

	// Control points keep the same proportions as the original curve, so the open
	// shape is unchanged and only the closing is new.
	const c1 = slope * 0.5625;
	const c2 = slope * 0.625;
	const c3 = x2 + slope * 0.375;
	const c4 = x2 + slope * 0.4375;

	const n = (value: number) => value.toFixed(1);

	const bottom =
		radius > 0.05
			? `Q ${n(right)} ${n(h)} ${n(right - radius)} ${n(h)} L ${n(radius)} ${n(h)} Q 0 ${n(h)} 0 ${n(foot)}`
			: `L 0 ${n(h)}`;

	const path =
		`M 0 ${n(foot)} ` +
		`C ${n(c1)} ${n(foot)} ${n(c2)} 0 ${n(x1)} 0 ` +
		`L ${n(x2)} 0 ` +
		`C ${n(c3)} 0 ${n(c4)} ${n(foot)} ${n(right)} ${n(foot)} ` +
		`${bottom} Z`;

	return { path, totalWidth };
}
