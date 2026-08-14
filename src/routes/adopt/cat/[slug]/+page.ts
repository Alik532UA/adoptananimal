import { error } from '@sveltejs/kit';
import { animalService } from '$lib/services/animals';
import type { PageLoad } from './$types';

export const load: PageLoad = async ({ params }) => {
	const animal = await animalService.getBySlug('cat', params.slug);

	if (!animal) {
		throw error(404, 'Cat not found');
	}

	return { animal };
};
