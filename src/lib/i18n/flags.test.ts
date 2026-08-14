import { describe, expect, it } from 'vitest';
import { readFileSync, readdirSync } from 'node:fs';
import { resolve } from 'node:path';

/**
 * The flag files, checked for the ways a flag goes subtly wrong.
 *
 * A flag that is merely inaccurate still renders, still has the right colours, and
 * still passes every other gate — it just looks off to anyone who knows it. There is
 * no way to assert "looks like a Union Jack", but the one structural feature that was
 * missing is checkable, and it is the feature that was missing.
 */

const DIR = resolve('static/images/flags');
const read = (file: string) => readFileSync(resolve(DIR, file), 'utf8');

describe('flag artwork', () => {
	it('is there', () => {
		expect(readdirSync(DIR).filter((f) => f.endsWith('.svg')).length).toBeGreaterThan(3);
	});

	it('draws the Union Jack counterchanged rather than symmetrically', () => {
		/*
		 * The red diagonals are offset: on each arm the red follows the white on one side
		 * of the centre and leads it on the other. Drawn symmetrically the flag reads as a
		 * plus sign and an X laid on top of each other — which is what "slightly broken"
		 * looked like. A clip path is the only way to get the offset, so its absence is
		 * the defect itself rather than a proxy for it.
		 */
		const svg = read('en.svg');
		expect(svg, 'no clip path, so the diagonals are symmetric').toMatch(/<clipPath/);
		expect(svg, 'the clip path is declared but never used').toMatch(/clip-path="url\(#/);
	});

	it('keeps every flag scalable rather than fixed to one size', () => {
		// They are drawn at 1.4rem in the header and larger in the language menu.
		for (const file of readdirSync(DIR).filter((f) => f.endsWith('.svg'))) {
			expect(read(file), `${file} has no viewBox`).toMatch(/viewBox="/);
		}
	});
});
