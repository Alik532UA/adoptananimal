import type { AnimalSummary, AnimalDetail, Translations } from './types';

// Eager load only the summaries for fast listing pages
const summaryModules = import.meta.glob('./animals/*.ts', { import: 'summary', eager: true });

// Lazy load for detail pages to prevent large bundle sizes (100+ animals)
const detailModules = import.meta.glob('./animals/*.ts');

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

const rawAnimals: AnimalSummary[] = Object.values(summaryModules) as AnimalSummary[];

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

	const mod = (await loader()) as { summary: AnimalSummary; description: Translations };

	return {
		...mod.summary,
		description: mod.description
	};
}

export type { AnimalSummary as Animal, AnimalDetail };
