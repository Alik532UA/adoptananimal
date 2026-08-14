import { animalService } from '$lib/services/animals';
import type { PageLoad } from './$types';

export const load: PageLoad = () => {
	// Shuffle on the server/load to ensure stable hydration and no flickering
	const animals = [...animalService.cats, ...animalService.dogs].sort(() => Math.random() - 0.5);

	return {
		animals
	};
};
