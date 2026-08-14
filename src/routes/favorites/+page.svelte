<script lang="ts">
	import { t } from '$lib/i18n';
	import { settings } from '$lib/services/settings.svelte';
	import { allAnimals } from '$lib/data/animals';
	import type { Animal } from '$lib/data/animals';
	import AnimalCard from '$lib/components/animal/AnimalCard.svelte';
	import Button from '$lib/components/ui/Button.svelte';
	import Icon from '$lib/components/ui/Icon.svelte';
	import { resolve } from '$lib/utils/resolve';

	let favoriteAnimals = $derived(
		(allAnimals as Animal[]).filter((a) => settings.favorites.includes(a.slug))
	);
</script>

<svelte:head>
	<title>{t('nav.favorites')} | AdoptAnAnimal</title>
</svelte:head>

<section class="favs-hero">
	<div class="container">
		<h1 class="favs-hero__title">{t('favs.title')}</h1>
		<p class="favs-hero__subtitle">
			{t('favs.subtitle')}
		</p>
	</div>
</section>

<section class="animal-list section">
	<div class="container">
		{#if favoriteAnimals.length > 0}
			<div class="grid grid--4">
				{#each favoriteAnimals as animal (animal.slug)}
					<AnimalCard {animal} />
				{/each}
			</div>
		{:else}
			<div class="no-favorites" data-testid="no-favorites-message">
				<div class="no-results">
					<Icon name="heart" size="4rem" class="mb-lg" />
					<h2>{t('favs.empty')}</h2>
					<div class="mt-lg">
						<Button href={resolve('/adopt/dog')} variant="primary" data-testid="explore-dogs-link">
							{t('featured.browseDogs')}
						</Button>
						<Button
							href={resolve('/adopt/cat')}
							variant="secondary"
							data-testid="explore-cats-link"
						>
							{t('featured.browseCats')}
						</Button>
					</div>
				</div>
			</div>
		{/if}
	</div>
</section>

<style>
	.favs-hero {
		background: var(--color-primary);
		color: white;
		padding: var(--space-3xl) 0;
		text-align: center;
	}

	.favs-hero__title {
		font-size: 3rem;
		margin-bottom: var(--space-sm);
	}

	.favs-hero__subtitle {
		font-size: 1.25rem;
		opacity: 0.9;
	}

	.animal-list {
		background: var(--color-bg-warm);
		min-height: 40vh;
	}

	.no-favorites {
		text-align: center;
		padding: var(--space-4xl) var(--space-xl);
		background: var(--color-bg-card);
		border-radius: var(--radius-lg);
		border: none;
		box-shadow: var(--shadow-sm);
		max-width: 600px;
		margin: 0 auto;
	}

	.no-results h2 {
		margin-bottom: var(--space-md);
	}

	:global(.mb-lg) {
		margin-bottom: var(--space-lg);
	}

	:global(.mt-lg) {
		margin-top: var(--space-lg);
	}
</style>
