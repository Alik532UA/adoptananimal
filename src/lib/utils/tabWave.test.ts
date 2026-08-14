import { describe, expect, it } from 'vitest';
import { clamp01, TAB_HEIGHT, tabShape } from './tabWave';

/** Every coordinate pair in a path, so the geometry can be reasoned about. */
const points = (path: string): Array<[number, number]> => {
	const numbers = path.match(/-?\d+(?:\.\d+)?/g)?.map(Number) ?? [];
	const out: Array<[number, number]> = [];
	for (let i = 0; i + 1 < numbers.length; i += 2) out.push([numbers[i], numbers[i + 1]]);
	return out;
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

	it('rounds its bottom corners once the page has scrolled', () => {
		// This is the whole point: scrolled, it must look like a finished tab rather
		// than a shape cut off where the colour behind it ended.
		const { path } = tabShape(132, 1);
		expect(path).toContain('Q');
	});

	it('pulls the skirts in as it closes', () => {
		const widths = [0, 0.25, 0.5, 0.75, 1].map((p) => tabShape(132, p).totalWidth);

		for (let i = 1; i < widths.length; i++) {
			expect(widths[i], `width grew between step ${i - 1} and ${i}`).toBeLessThan(widths[i - 1]);
		}
		expect(widths.at(-1)).toBeLessThan(widths[0] * 0.7);
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
		let previous = tabShape(132, 0).totalWidth;
		for (let p = 0.05; p <= 1.0001; p += 0.05) {
			const current = tabShape(132, p).totalWidth;
			expect(Math.abs(current - previous), `jump at progress ${p.toFixed(2)}`).toBeLessThan(12);
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
