import { cats, dogs, getAnimalBySlug as getRawAnimalBySlug } from '$lib/data/animals';
import type { AnimalSummary, AnimalDetail, FilterState } from '$lib/data/types';
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

		return list.filter((animal) => {
			const matchesGender =
				!filters.gender || animal.gender.en.toLowerCase().includes(filters.gender.toLowerCase());
			const matchesSize =
				!filters.size || animal.size.en.toLowerCase().includes(filters.size.toLowerCase());
			const matchesStatus =
				!filters.status || (filters.status === 'available' ? !animal.isAdopted : animal.isAdopted);
			const matchesSearch =
				!filters.search ||
				animal.name.toLowerCase().includes(filters.search.toLowerCase()) ||
				animal.breed.en.toLowerCase().includes(filters.search.toLowerCase()) ||
				animal.breed.uk.toLowerCase().includes(filters.search.toLowerCase());
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
