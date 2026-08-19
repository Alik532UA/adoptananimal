import { describe, expect, it } from 'vitest';
import { clamp01, TAB_HEIGHT, tabShape } from './tabWave';

/** Every coordinate pair in a path, so the geometry can be reasoned about. */
const points = (path: string): Array<[number, number]> => {
	const numbers = path.match(/-?\d+(?:\.\d+)?/g)?.map(Number) ?? [];
	const out: Array<[number, number]> = [];
	for (let i = 0; i + 1 < numbers.length; i += 2) out.push([numbers[i], numbers[i + 1]]);
	return out;
};

/**
 * Width of the bottom edge — the distance between the two feet.
 *
 * This, not `totalWidth`, is what moves once the tab can lean inward: the box stops at
 * the label width (it has to cover the text) while the feet keep coming in. The two
 * checks below used to measure the box and passed for the wrong reason.
 */
const baseWidth = (labelWidth: number, progress: number): number => {
	const { path, totalWidth } = tabShape(labelWidth, progress);
	const left = Number(path.match(/^M ([\d.]+)/)![1]);
	return totalWidth - 2 * left;
};

describe('clamp01', () => {
	it('holds the ends', () => {
		expect(clamp01(-3)).toBe(0);
		expect(clamp01(0.4)).toBe(0.4);
		expect(clamp01(9)).toBe(1);
	});
});

describe('tabShape', () => {
	it('is a closed path at every stage', () => {
		for (const progress of [0, 0.25, 0.5, 0.75, 1]) {
			const { path } = tabShape(132, progress);
			expect(path.startsWith('M ')).toBe(true);
			expect(path.trimEnd().endsWith('Z')).toBe(true);
			expect(path).not.toMatch(/NaN|undefined|Infinity/);
		}
	});

	it('opens flat against the baseline at the top of the page', () => {
		// The skirts have to reach y = 48 exactly, or the tab stops short of the band
		// it is supposed to merge into.
		const { path } = tabShape(132, 0);
		expect(points(path).some(([, y]) => y === TAB_HEIGHT)).toBe(true);
		expect(path).not.toContain('Q');
	});

	it('lifts its feet off the baseline once the page has scrolled', () => {
		// This is the whole point: scrolled, it must look like a finished tab standing on
		// a narrow base rather than a shape cut off where the colour behind it ended.
		const feet = tabShape(132, 1).points.filter((point) => point.name.endsWith('foot'));
		expect(feet).toHaveLength(2);
		for (const foot of feet) expect(foot.y).toBeLessThan(TAB_HEIGHT);
		expect(feet[0].y, 'the two feet must sit level with each other').toBe(feet[1].y);
	});

	it('has four corners and no more', () => {
		// The dev overlay draws one dot per point, and a dozen dots on a 132px tab is not
		// something anyone can point at.
		for (const progress of [0, 0.5, 1]) {
			expect(tabShape(132, progress).points.map((point) => point.n)).toEqual([1, 2, 3, 4]);
		}
	});

	it('pulls the skirts in as it closes', () => {
		const bases = [0, 0.25, 0.5, 0.75, 1].map((p) => baseWidth(132, p));

		for (let i = 1; i < bases.length; i++) {
			expect(bases[i], `the base grew between step ${i - 1} and ${i}`).toBeLessThan(bases[i - 1]);
		}
		// Closed, the base is the plateau: each foot ends directly under the corner above
		// it, so the sides finish vertical rather than still splayed.
		expect(bases.at(-1)).toBeLessThan(bases[0] * 0.5);

		const closed = tabShape(132, 1).points;
		expect(closed[0].x, 'point 1 must sit under point 2').toBeCloseTo(closed[1].x, 1);
		expect(closed[3].x, 'point 4 must sit under point 3').toBeCloseTo(closed[2].x, 1);

		// And the box never grows, or the tab would be seen to widen while it closes.
		const boxes = [0, 0.25, 0.5, 0.75, 1].map((p) => tabShape(132, p).totalWidth);
		for (let i = 1; i < boxes.length; i++) {
			expect(boxes[i], `box grew between step ${i - 1} and ${i}`).toBeLessThanOrEqual(boxes[i - 1]);
		}
	});

	it('never lets the tab get narrower than the label it sits behind', () => {
		for (const width of [60, 132, 240]) {
			const closed = tabShape(width, 1);
			expect(closed.totalWidth, `label ${width}px`).toBeGreaterThanOrEqual(width);
		}
	});

	it('keeps every point inside the box it declares', () => {
		for (const progress of [0, 0.5, 1]) {
			const shape = tabShape(132, progress);
			for (const [x, y] of points(shape.path)) {
				expect(x).toBeGreaterThanOrEqual(0);
				expect(x).toBeLessThanOrEqual(shape.totalWidth + 0.05);
				expect(y).toBeGreaterThanOrEqual(0);
				expect(y).toBeLessThanOrEqual(TAB_HEIGHT + 0.05);
			}
		}
	});

	it('moves smoothly rather than jumping', () => {
		// A shape that changes in steps reads as a glitch while the page is moving.
		//
		// A share of the whole journey rather than a fixed number of pixels: the bound has
		// to mean «no visible step» for any travel, and the previous 12px was tied to how
		// far the shape happened to move at the time it was written. A twentieth of the
		// scroll may not carry more than a tenth of the movement.
		const travel = baseWidth(132, 0) - baseWidth(132, 1);
		let previous = baseWidth(132, 0);
		for (let p = 0.05; p <= 1.0001; p += 0.05) {
			const current = baseWidth(132, p);
			expect(Math.abs(current - previous), `jump at progress ${p.toFixed(2)}`).toBeLessThan(
				travel * 0.1
			);
			previous = current;
		}
	});

	it('treats out-of-range progress as the nearest end', () => {
		expect(tabShape(132, -5).path).toBe(tabShape(132, 0).path);
		expect(tabShape(132, 5).path).toBe(tabShape(132, 1).path);
	});

	it('still draws a tab for a very narrow label', () => {
		const { path, totalWidth } = tabShape(10, 1);
		expect(totalWidth).toBeGreaterThan(0);
		expect(path).not.toMatch(/NaN/);
	});
});
