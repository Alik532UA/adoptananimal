import { animalService } from '$lib/services/animals';
import { langEntries } from '$lib/i18n/entries';
import type { EntryGenerator, PageLoad } from './$types';

export const entries: EntryGenerator = langEntries;

export const load: PageLoad = () => {
	// Deliberately not shuffled: this load runs once at build time, so a random order
	// would be frozen into the HTML and then differ again on client-side navigation.
	// Not-yet-adopted animals come first; the rest keeps the data order.
	const animals = [...animalService.cats, ...animalService.dogs].sort(
		(a, b) => Number(a.isAdopted) - Number(b.isAdopted)
	);

	return { animals };
};
