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

/**
 * `flare` is the SIGNED horizontal distance from the end of the top plateau to the foot
 * of the skirt. Positive flares outward — the shape is widest at the baseline, which is
 * what makes it read as part of the band. Negative leans inward, so the feet sit inside
 * the plateau and the tab stands on a narrow base.
 *
 * It used to be an unsigned `slope`, which could only ever flare out: the closed tab
 * was therefore always at least as wide at the bottom as at the top, and the feet could
 * not come in past the label edge no matter how small the number.
 */
const OPEN = { flare: 100, radius: 0, inset: 48 };
const CLOSED = { flare: -24, radius: 14, inset: 4 };

/**
 * Where the corner rounding starts, as a share of the whole travel.
 *
 * The two movements are deliberately NOT simultaneous. The skirts pulling in is
 * horizontal; the rounding lifts the outer bottom points off the baseline, because the
 * arc starts `radius` above it. Run together, the feet slide inwards and rise at the
 * same time, and the eye reads one muddled diagonal drift instead of two decisions.
 *
 * So the feet travel first and lift only at the end: for the first five sixths of the
 * scroll the shape stays flat on the baseline and only narrows, and the corners round
 * off over what is left — by which point the feet have covered about four fifths of
 * their way inwards and the lift reads as the movement finishing rather than as part
 * of it.
 */
const ROUND_START = 0.85;

const lerp = (from: number, to: number, t: number) => from + (to - from) * t;

/** Smoothstep, so the shape eases into both ends instead of tracking the scroll linearly. */
const ease = (t: number) => t * t * (3 - 2 * t);

export const clamp01 = (value: number) => Math.min(1, Math.max(0, value));

/**
 * One point of the outline, for the dev overlay (`HeaderTabWave.svelte`).
 *
 * Returned from the same computation that writes the path rather than parsed back out
 * of it: an overlay that re-derives the geometry can disagree with the shape, and then
 * it is showing something that is not there. The cost is a dozen small objects per
 * frame, and `dev` is the only place that reads them.
 */
export interface TabPoint {
	/** 1-based, in the order the path visits them — this is the number to quote. */
	n: number;
	x: number;
	y: number;
	/** `anchor` lies on the outline; `control` only bends the curve into the next anchor. */
	kind: 'anchor' | 'control';
	/** Which of them it is, in the words the source uses. */
	name: string;
	/** The anchor this control belongs to, so the overlay can draw the tether. */
	of?: number;
}

export interface TabShape {
	path: string;
	totalWidth: number;
	/** Every point of the outline, in path order. */
	points: TabPoint[];
}

/**
 * @param labelWidth width of the active nav item
 * @param progress   0 at the top of the page, 1 once it has scrolled past SETTLE_DISTANCE
 */
export function tabShape(labelWidth: number, progress: number): TabShape {
	const p = clamp01(progress);
	const t = ease(p);

	/** The late half of the movement: still 0 until ROUND_START, then eased to 1. */
	const tRound = ease(clamp01((p - ROUND_START) / (1 - ROUND_START)));

	const flare = lerp(OPEN.flare, CLOSED.flare, t);
	const inset = lerp(OPEN.inset, CLOSED.inset, t);

	const plateau = Math.max(12, labelWidth - inset);
	const base = Math.max(12, plateau + 2 * flare);

	/**
	 * The box holds whichever part is widest, and never less than the label it stands
	 * behind: once the feet lean inward the bottom stops being the widest part, and a box
	 * measured from it would crop the text.
	 */
	const totalWidth = Math.max(labelWidth, plateau, base);

	// Both parts centred in the box, so the shape stays symmetrical whichever is wider.
	const plateauX = (totalWidth - plateau) / 2;
	const footX = (totalWidth - base) / 2;

	const h = TAB_HEIGHT;

	// Never more than half the bottom edge: two arcs of the full radius on a narrow base
	// would meet past each other and the edge would run backwards.
	const radius = Math.min(lerp(OPEN.radius, CLOSED.radius, tRound), base / 2, h / 2);

	// Where the skirts land. With a radius they stop short of the baseline and the
	// corner arc carries them the rest of the way.
	const foot = h - radius;

	const x1 = plateauX;
	const x2 = plateauX + plateau;
	const left = footX;
	const right = totalWidth - footX;

	// Control points keep the same proportions as the original curve — measured along the
	// flare, so a negative one mirrors them without any extra case.
	const c1 = left + flare * 0.5625;
	const c2 = left + flare * 0.625;
	const c3 = x2 + flare * 0.375;
	const c4 = x2 + flare * 0.4375;

	const n = (value: number) => value.toFixed(1);

	const bottom =
		radius > 0.05
			? `Q ${n(right)} ${n(h)} ${n(right - radius)} ${n(h)} L ${n(left + radius)} ${n(h)} Q ${n(left)} ${n(h)} ${n(left)} ${n(foot)}`
			: `L ${n(left)} ${n(h)}`;

	/**
	 * The same numbers the path is built from, named. `of` ties a control to the anchor it
	 * bends toward, which is the part that is impossible to guess by looking.
	 */
	const points: TabPoint[] = [
		{ n: 1, x: left, y: foot, kind: 'anchor', name: 'left foot' },
		{ n: 2, x: c1, y: foot, kind: 'control', name: 'left skirt, lower', of: 4 },
		{ n: 3, x: c2, y: 0, kind: 'control', name: 'left skirt, upper', of: 4 },
		{ n: 4, x: x1, y: 0, kind: 'anchor', name: 'plateau start' },
		{ n: 5, x: x2, y: 0, kind: 'anchor', name: 'plateau end' },
		{ n: 6, x: c3, y: 0, kind: 'control', name: 'right skirt, upper', of: 8 },
		{ n: 7, x: c4, y: foot, kind: 'control', name: 'right skirt, lower', of: 8 },
		{ n: 8, x: right, y: foot, kind: 'anchor', name: 'right foot' }
	];

	// The rounded corners exist only once there is a radius; flat, points 1 and 8 already
	// sit on the baseline and the bottom edge is the straight line between them.
	if (radius > 0.05) {
		points.push(
			{ n: 9, x: right, y: h, kind: 'control', name: 'right corner', of: 10 },
			{ n: 10, x: right - radius, y: h, kind: 'anchor', name: 'bottom right' },
			{ n: 11, x: left + radius, y: h, kind: 'anchor', name: 'bottom left' },
			{ n: 12, x: left, y: h, kind: 'control', name: 'left corner', of: 1 }
		);
	}

	const path =
		`M ${n(left)} ${n(foot)} ` +
		`C ${n(c1)} ${n(foot)} ${n(c2)} 0 ${n(x1)} 0 ` +
		`L ${n(x2)} 0 ` +
		`C ${n(c3)} 0 ${n(c4)} ${n(foot)} ${n(right)} ${n(foot)} ` +
		`${bottom} Z`;

	return { path, totalWidth, points };
}
