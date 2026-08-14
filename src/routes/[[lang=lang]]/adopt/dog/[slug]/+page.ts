import { error } from '@sveltejs/kit';
import { animalService } from '$lib/services/animals';
import { PREFIXED_LOCALES } from '$lib/i18n/locales';
import type { EntryGenerator, PageLoad } from './$types';

/**
 * Every dog in every language. Relying on the crawler instead would miss any
 * animal that no rendered page happens to link to, and every language that is not
 * reachable from a page already visited.
 */
export const entries: EntryGenerator = () =>
	animalService.dogs.flatMap(({ slug }) => [
		{ slug, lang: undefined },
		...PREFIXED_LOCALES.map((lang) => ({ slug, lang }))
	]);

export const load: PageLoad = async ({ params }) => {
	const animal = await animalService.getBySlug('dog', params.slug);

	if (!animal) {
		throw error(404, 'Dog not found');
	}

	return { animal };
};
