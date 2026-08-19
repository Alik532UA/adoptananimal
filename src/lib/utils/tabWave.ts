/**
 * Shape of the active-tab background in the header.
 *
 * At the top of the page the tab flares out into wide skirts that meet the baseline
 * flat, so it reads as part of the coloured band underneath it. Once the page scrolls
 * that band is gone and something else — usually white — sits under the header, and
 * the same flare looks like a shape someone cut off with scissors.
 *
 * So the shape closes as you scroll: the skirts pull in until the sides lean inward, and
 * then the feet lift off the baseline — an ordinary tab standing on a narrow base, owing
 * nothing to what is behind it.
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
const OPEN = { flare: 76, lift: 0 };
const CLOSED = { flare: -24, lift: 9 };

/**
 * The plateau is the label, and it does NOT change.
 *
 * It used to narrow as the tab closed, and that moved the two top corners — a movement
 * nobody asked for and which the reference drawings do not have: there the plateau is
 * 777→1173 in all three stages. Only the feet travel.
 *
 * Equal to the label rather than narrower than it because the closed shape leans inward:
 * the plateau is then the widest part of it, and anything less would leave the text
 * standing outside its own background.
 */
const PLATEAU_INSET = 0;

/**
 * Where the corner rounding starts, as a share of the whole travel.
 *
 * The two movements are deliberately NOT simultaneous. The skirts pulling in is
 * horizontal; the lift is vertical. Run together, the feet slide inwards and rise at the
 * same time, and the eye reads one muddled diagonal drift instead of two decisions.
 *
 * So the feet travel first and lift only at the end: for the first five sixths of the
 * scroll the shape stays flat on the baseline and only narrows, and the feet rise over
 * what is left — by which point they have covered about four fifths of
 * their way inwards and the lift reads as the movement finishing rather than as part
 * of it.
 */
const LIFT_START = 0.85;

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
	/** Which corner it is, in the words the source uses. */
	name: string;
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
	const tLift = ease(clamp01((p - LIFT_START) / (1 - LIFT_START)));

	const flare = lerp(OPEN.flare, CLOSED.flare, t);

	const plateau = Math.max(12, labelWidth - PLATEAU_INSET);
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

	// How far the feet stand off the baseline at the end. Never past halfway up, which
	// only a nonsense value could ask for.
	const lift = Math.min(lerp(OPEN.lift, CLOSED.lift, tLift), h / 2);

	/** Where the skirts land. */
	const foot = h - lift;

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

	/**
	 * The four corners of the outline, in path order — the same numbers the path is built
	 * from, named.
	 *
	 * Four, because that is how many corners the shape has: two feet and the two ends of
	 * the plateau. The control points that bend the skirts between them are not on the
	 * outline and are not listed; an overlay that drew those too put a dozen dots on a
	 * 132px tab, which is not something anyone can point at.
	 */
	const points: TabPoint[] = [
		{ n: 1, x: left, y: foot, name: 'left foot' },
		{ n: 2, x: x1, y: 0, name: 'plateau start' },
		{ n: 3, x: x2, y: 0, name: 'plateau end' },
		{ n: 4, x: right, y: foot, name: 'right foot' }
	];

	const n = (value: number) => value.toFixed(1);

	const path =
		`M ${n(left)} ${n(foot)} ` +
		`C ${n(c1)} ${n(foot)} ${n(c2)} 0 ${n(x1)} 0 ` +
		`L ${n(x2)} 0 ` +
		`C ${n(c3)} 0 ${n(c4)} ${n(foot)} ${n(right)} ${n(foot)} ` +
		`L ${n(left)} ${n(foot)} Z`;

	return { path, totalWidth, points };
}
