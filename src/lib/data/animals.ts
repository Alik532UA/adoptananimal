import type { AnimalSummary, AnimalDetail, Translations } from './types';

// Eager load only the summaries for fast listing pages
const summaryModules = import.meta.glob('./animals/*.ts', { import: 'summary', eager: true });

// Lazy load for detail pages to prevent large bundle sizes (100+ animals)
const detailModules = import.meta.glob('./animals/*.ts');

export const allAnimals: AnimalSummary[] = Object.values(summaryModules) as AnimalSummary[];
export const cats: AnimalSummary[] = allAnimals.filter((a) => a.type === 'cat');
export const dogs: AnimalSummary[] = allAnimals.filter((a) => a.type === 'dog');

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
