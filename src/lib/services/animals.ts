import { cats, dogs, getAnimalBySlug as getRawAnimalBySlug } from '$lib/data/animals';
import type { AnimalSummary, AnimalDetail, FilterState } from '$lib/data/types';
import { breedTerms, normaliseGender, normaliseSize } from '$lib/data/filters';
import { settings } from '$lib/services/settings.svelte';

/**
 * Service for managing animal data, filtering, and special selections.
 */
class AnimalService {
	/**
	 * Returns combined summary of all animals.
	 */
	get allSummaries(): AnimalSummary[] {
		return [...cats, ...dogs];
	}

	/**
	 * Returns all cat summaries.
	 */
	get cats(): AnimalSummary[] {
		return cats;
	}

	/**
	 * Returns all dog summaries.
	 */
	get dogs(): AnimalSummary[] {
		return dogs;
	}

	/**
	 * Fetches detailed animal data by its type and slug.
	 */
	async getBySlug(type: 'cat' | 'dog', slug: string): Promise<AnimalDetail | undefined> {
		return await getRawAnimalBySlug(type, slug);
	}

	/**
	 * Filters animals based on the provided filter state.
	 */
	getFiltered(type: 'cat' | 'dog' | 'all', filters: FilterState): AnimalSummary[] {
		const list = type === 'all' ? this.allSummaries : type === 'cat' ? cats : dogs;
		const query = filters.search.trim().toLowerCase();

		return list.filter((animal) => {
			// Compared as a value, not as a substring: 'female' contains 'male', so the
			// male filter used to match every animal on the site.
			const matchesGender = !filters.gender || normaliseGender(animal.gender.en) === filters.gender;

			// Bucketed, because the data says 'tiny' and 'up to 4 kg' as well as the three
			// words the buttons offer.
			const matchesSize = !filters.size || normaliseSize(animal.size.en) === filters.size;

			const matchesStatus =
				!filters.status || (filters.status === 'available' ? !animal.isAdopted : animal.isAdopted);

			// Breeds in every language, so searching works in the one being read.
			const matchesSearch =
				!query ||
				animal.name.toLowerCase().includes(query) ||
				breedTerms(animal).some((term) => term.includes(query));

			const matchesFavs = !filters.onlyFavorites || settings.isFavorite(animal.slug);

			return matchesGender && matchesSize && matchesStatus && matchesSearch && matchesFavs;
		});
	}

	/**
	 * Returns a limited selection of featured (not adopted) animals.
	 */
	getFeatured(type: 'cat' | 'dog', limit = 3): AnimalSummary[] {
		return (type === 'cat' ? cats : dogs).filter((a) => !a.isAdopted).slice(0, limit);
	}

	/**
	 * Resets service state (not strictly needed for this read-only service but follows v6 standard).
	 */
	reset() {
		// Nothing to reset for now as allAnimals is static
	}

	/**
	 * Returns summaries of all animals marked as favorite.
	 */
	getFavorites(): AnimalSummary[] {
		return this.allSummaries.filter((a) => settings.isFavorite(a.slug));
	}
}

export const animalService = new AnimalService();
