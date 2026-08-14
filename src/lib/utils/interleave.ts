/**
 * Shuffles a list while keeping runs of the same kind short.
 *
 * A plain shuffle of 28 cats and 22 dogs regularly produces five or six cats in a
 * row, and the carousel then looks like a cat carousel until you scroll past them.
 * This picks randomly but refuses a pick that would start a third consecutive
 * animal of the same kind.
 *
 * When only one kind is left the run limit cannot be honoured — 22 dogs cannot be
 * separated by 0 cats — so the tail is simply appended. With the current dataset
 * that never happens; the guard is there because a shelter's numbers change.
 */
const MAX_RUN = 2;

export interface Kinded {
	type: 'cat' | 'dog';
}

/**
 * Can `c` cats and `d` dogs still be laid out with no run longer than MAX_RUN?
 *
 * The smaller pool provides the separators: `min` items leave `min + 1` gaps, and
 * each gap holds at most MAX_RUN of the other kind.
 */
function canArrange(c: number, d: number): boolean {
	const majority = Math.max(c, d);
	const minority = Math.min(c, d);
	return majority <= MAX_RUN * (minority + 1);
}

/** Fisher–Yates, on a copy. `random` is injectable so tests can be deterministic. */
export function shuffle<T>(items: readonly T[], random: () => number = Math.random): T[] {
	const out = [...items];
	for (let i = out.length - 1; i > 0; i--) {
		const j = Math.floor(random() * (i + 1));
		[out[i], out[j]] = [out[j], out[i]];
	}
	return out;
}

export function interleaveByType<T extends Kinded>(
	animals: readonly T[],
	random: () => number = Math.random
): T[] {
	const pools: Record<'cat' | 'dog', T[]> = {
		cat: shuffle(
			animals.filter((a) => a.type === 'cat'),
			random
		),
		dog: shuffle(
			animals.filter((a) => a.type === 'dog'),
			random
		)
	};

	const out: T[] = [];
	let lastType: 'cat' | 'dog' | null = null;
	let run = 0;

	while (pools.cat.length > 0 || pools.dog.length > 0) {
		const available = (['cat', 'dog'] as const).filter((type) => pools[type].length > 0);

		// A third in a row is only allowed when nothing else is left to place.
		const unblocked = available.filter(
			(type) => !(type === lastType && run >= MAX_RUN) || available.length === 1
		);

		// Looking one move ahead is not optional. Picking freely by weight emptied the
		// dog pool while three cats were still waiting, and those three then had to go
		// out back to back — the run limit was lost at the end of the list, every time.
		const safe = unblocked.filter((type) => {
			const rest = { cat: pools.cat.length, dog: pools.dog.length };
			rest[type] -= 1;
			return canArrange(rest.cat, rest.dog);
		});

		const candidates = safe.length > 0 ? safe : unblocked.length > 0 ? unblocked : available;

		let picked: 'cat' | 'dog';
		if (candidates.length === 1) {
			picked = candidates[0];
		} else {
			// Weighted by what is left, so the order does not settle into a fixed
			// alternation once both choices are safe.
			const total = pools.cat.length + pools.dog.length;
			picked = random() < pools.cat.length / total ? 'cat' : 'dog';
		}

		out.push(pools[picked].shift() as T);
		run = picked === lastType ? run + 1 : 1;
		lastType = picked;
	}

	return out;
}

/** Longest run of one type, for tests and for reasoning about a new dataset. */
export function longestRun<T extends Kinded>(animals: readonly T[]): number {
	let best = 0;
	let run = 0;
	let last: string | null = null;

	for (const animal of animals) {
		run = animal.type === last ? run + 1 : 1;
		last = animal.type;
		if (run > best) best = run;
	}

	return best;
}
