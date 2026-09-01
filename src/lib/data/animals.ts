import type { AnimalSummary, AnimalDetail, Translations } from './types';

/**
 * The registry, typed at the glob rather than cast afterwards
 * (SVELTEKIT-DATA-v8 § 7.3, `SKD-SATISFIES`).
 *
 * An untyped `import.meta.glob` hands back `unknown`, and the two `as` casts that
 * used to stand below agreed with whatever came out of it: change `import:
 * 'summary'` to any other export and the cast is still happy, while the site loses
 * every card. Naming the type here is the same information in the one place the
 * compiler can act on it — every reader of `dogs`, `cats` and `allAnimals` is
 * checked against it from here on.
 *
 * What actually verifies the shape of a record is the record: each file declares
 * `export const summary: AnimalSummary`, so a missing or misspelled field is a type
 * error in the file that owns it. `src/lib/data/animals.test.ts` covers what a type
 * cannot — that the file is named after its slug, that the photograph exists with
 * that exact spelling, and that all four languages are filled in.
 */

// Eager load only the summaries for fast listing pages
const summaryModules = import.meta.glob<AnimalSummary>('./animals/*.ts', {
	import: 'summary',
	eager: true
});

// Lazy load for detail pages to prevent large bundle sizes (100+ animals)
const detailModules = import.meta.glob<{ summary: AnimalSummary; description: Translations }>(
	'./animals/*.ts'
);

/**
 * Canonical ordering of dogs matching the legacy source of truth (adoptananimal.in.ua).
 */
export const CANONICAL_DOG_ORDER = [
	'gracie',
	'leila',
	'jessie',
	'lola',
	'shaggy',
	'chikita',
	'black-dog',
	'comet',
	'carly',
	'benny',
	'partos',
	'tobey',
	'button',
	'tilika',
	'multik',
	'vira',
	'flora',
	't-800',
	'lucky',
	'joe',
	'thea',
	'angel'
] as const;

/**
 * Canonical ordering of cats matching the legacy source of truth (adoptananimal.in.ua).
 */
export const CANONICAL_CAT_ORDER = [
	'cucumber',
	'lynx',
	'tigress',
	'fluffy',
	'kira',
	'grey',
	'sirius',
	'trixi',
	'richard',
	'saimon',
	'molly',
	'mirabel',
	'basti',
	'patrik',
	'martin',
	'sofi',
	'starlet',
	'bill',
	'black',
	'nicole',
	'berry',
	'mia',
	'santa',
	'tyler',
	'fina',
	'demi',
	'grais',
	'cherry'
] as const;

function sortByCanonicalOrder(
	items: AnimalSummary[],
	canonicalOrder: readonly string[]
): AnimalSummary[] {
	const orderMap = new Map<string, number>(canonicalOrder.map((slug, idx) => [slug, idx]));
	return [...items].sort((a, b) => {
		const orderA = orderMap.has(a.slug) ? orderMap.get(a.slug)! : 999;
		const orderB = orderMap.has(b.slug) ? orderMap.get(b.slug)! : 999;
		return orderA - orderB;
	});
}

const rawAnimals: AnimalSummary[] = Object.values(summaryModules);

export const dogs: AnimalSummary[] = sortByCanonicalOrder(
	rawAnimals.filter((a) => a.type === 'dog'),
	CANONICAL_DOG_ORDER
);

export const cats: AnimalSummary[] = sortByCanonicalOrder(
	rawAnimals.filter((a) => a.type === 'cat'),
	CANONICAL_CAT_ORDER
);

export const allAnimals: AnimalSummary[] = [...dogs, ...cats];

export async function getAnimalBySlug(
	type: 'cat' | 'dog',
	slug: string
): Promise<AnimalDetail | undefined> {
	// Find the matching path, e.g., './animals/cat_tyler.ts'
	const expectedPath = `./animals/${type}_${slug}.ts`;

	const loader = detailModules[expectedPath];
	if (!loader) {
		return undefined;
	}

	const mod = await loader();

	return {
		...mod.summary,
		description: mod.description
	};
}

export type { AnimalSummary as Animal, AnimalDetail };
