import { error } from '@sveltejs/kit';
import { animalService } from '$lib/services/animals';
import { absoluteFromRoot } from '$lib/config';
import { PREFIXED_LOCALES } from '$lib/i18n/locales';
import type { EntryGenerator, PageLoad } from './$types';

/**
 * Every cat in every language. Relying on the crawler instead would miss any
 * animal that no rendered page happens to link to, and every language that is not
 * reachable from a page already visited.
 */
export const entries: EntryGenerator = () =>
	animalService.cats.flatMap(({ slug }) => [
		{ slug, lang: undefined },
		...PREFIXED_LOCALES.map((lang) => ({ slug, lang }))
	]);

export const load: PageLoad = async ({ params }) => {
	const animal = await animalService.getBySlug('cat', params.slug);

	if (!animal) {
		throw error(404, 'Cat not found');
	}

	/*
	 * The link preview belongs to the animal, and it is declared HERE rather than in
	 * the page's own `<svelte:head>` because `<svelte:head>` appends: a tag written
	 * there landed BESIDE the layout's default, not instead of it, and the Open Graph
	 * reader takes the first — so every shared animal link previewed the shelter logo.
	 * The layout owns the tag and reads this.
	 */
	return { animal, ogImage: absoluteFromRoot(animal.image), ogImageAlt: animal.name };
};
