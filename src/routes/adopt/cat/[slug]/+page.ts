import { error } from '@sveltejs/kit';
import { animalService } from '$lib/services/animals';
import type { EntryGenerator, PageLoad } from './$types';

/**
 * Explicit list of pages to generate instead of relying on the crawler:
 * a cat without an inbound link would otherwise silently miss the build.
 */
export const entries: EntryGenerator = () => animalService.cats.map(({ slug }) => ({ slug }));

export const load: PageLoad = async ({ params }) => {
	const animal = await animalService.getBySlug('cat', params.slug);

	if (!animal) {
		throw error(404, 'Cat not found');
	}

	return { animal };
};
