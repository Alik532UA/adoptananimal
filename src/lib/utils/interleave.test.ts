import { describe, expect, it } from 'vitest';
import { interleaveByType, longestRun, shuffle, type Kinded } from './interleave';
import { cats, dogs } from '$lib/data/animals';

/** Deterministic pseudo-random, so a failure can be reproduced from its seed. */
const seeded = (seed: number) => () => {
	seed = (seed * 1103515245 + 12345) % 2147483648;
	return seed / 2147483648;
};

const make = (pattern: string): Kinded[] =>
	[...pattern].map((c) => ({ type: c === 'c' ? 'cat' : 'dog' }) as Kinded);

describe('shuffle', () => {
	it('keeps every element exactly once', () => {
		const input = [1, 2, 3, 4, 5, 6, 7, 8];
		expect([...shuffle(input, seeded(1))].sort((a, b) => a - b)).toEqual(input);
	});

	it('does not touch the input', () => {
		const input = [1, 2, 3];
		shuffle(input, seeded(2));
		expect(input).toEqual([1, 2, 3]);
	});
});

describe('interleaveByType', () => {
	it('returns every animal exactly once', () => {
		const input = [...cats, ...dogs];
		const out = interleaveByType(input, seeded(7));

		expect(out).toHaveLength(input.length);
		expect(new Set(out.map((a) => a.slug)).size).toBe(input.length);
	});

	it('never puts three of the same type in a row, over many seeds', () => {
		const input = [...cats, ...dogs];
		const runs: number[] = [];

		for (let seed = 1; seed <= 200; seed++) {
			runs.push(longestRun(interleaveByType(input, seeded(seed))));
		}

		expect(Math.max(...runs)).toBeLessThanOrEqual(2);
	});

	it('produces a different order on different seeds', () => {
		const input = [...cats, ...dogs];
		const a = interleaveByType(input, seeded(1))
			.map((x) => x.slug)
			.join();
		const b = interleaveByType(input, seeded(2))
			.map((x) => x.slug)
			.join();

		expect(a).not.toBe(b);
	});

	it('mixes the types instead of listing one after the other', () => {
		// The bug this replaces: cats first, dogs second, so the visible window of the
		// carousel was always the same handful of cats.
		const out = interleaveByType([...cats, ...dogs], seeded(3));
		const firstDog = out.findIndex((a) => a.type === 'dog');

		expect(firstDog).toBeLessThan(4);
	});

	it('holds the limit across lopsided splits', () => {
		// Every split here is arrangeable: n separators leave n+1 gaps of at most two,
		// so the majority must not exceed 2 * (minority + 1).
		for (const [c, d] of [
			[10, 10],
			[28, 22],
			[20, 10],
			[30, 15],
			[4, 1],
			[2, 1],
			[1, 1]
		]) {
			const input = make('c'.repeat(c) + 'd'.repeat(d));
			for (let seed = 1; seed <= 30; seed++) {
				const out = interleaveByType(input, seeded(seed));
				expect(out).toHaveLength(c + d);
				expect(longestRun(out), `${c} cats / ${d} dogs, seed ${seed}`).toBeLessThanOrEqual(2);
			}
		}
	});

	it('returns everything when the limit cannot be met', () => {
		// 5 cats and one dog is already impossible: one separator leaves two gaps, which
		// hold four cats. The function returns all of them rather than dropping animals
		// to satisfy a rule that cannot be satisfied.
		for (const [c, d] of [
			[5, 1],
			[9, 1],
			[3, 0]
		]) {
			const out = interleaveByType(make('c'.repeat(c) + 'd'.repeat(d)), seeded(1));

			expect(out).toHaveLength(c + d);
			expect(longestRun(out)).toBeGreaterThan(2);
		}
	});

	it('handles the empty and single-type cases', () => {
		expect(interleaveByType([], seeded(1))).toEqual([]);
		expect(interleaveByType(make('ccc'), seeded(1))).toHaveLength(3);
	});
});
