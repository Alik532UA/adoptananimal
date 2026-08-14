<script lang="ts">
	import { page } from '$app/state';
	import { goto } from '$app/navigation';
	import { animalService } from '$lib/services/animals';
	import AnimalCard from '$lib/components/animal/AnimalCard.svelte';
	import FilterBar from '$lib/components/FilterBar.svelte';
	import { t } from '$lib/i18n';
	import type { FilterState } from '$lib/data/types';
	import Breadcrumbs from '$lib/components/Breadcrumbs.svelte';

	import { SvelteURLSearchParams } from 'svelte/reactivity';
	import { resolve } from '$lib/utils/resolve';

	const gender = $derived(page.url.searchParams.get('gender') || '');
	const status = $derived(page.url.searchParams.get('status') || '');
	const search = $derived(page.url.searchParams.get('search') || '');

	const filteredCats = $derived(
		animalService.getFiltered('cat', { gender, status, search, size: '' })
	);

	function handleFilterChange(filters: FilterState) {
		const params = new SvelteURLSearchParams(page.url.searchParams);

		if (filters.gender) params.set('gender', filters.gender);
		else params.delete('gender');

		if (filters.status) params.set('status', filters.status);
		else params.delete('status');

		if (filters.search) params.set('search', filters.search);
		else params.delete('search');

		goto(resolve(`?${params.toString()}`), { replaceState: true, keepFocus: true, noScroll: true });
	}
</script>

<svelte:head>
	<title>{t('app.title.cat')}</title>
	<meta
		name="description"
		content="Browse {animalService.cats
			.length} cats available for adoption, rescued from Ukrainian frontlines."
	/>
</svelte:head>

<section class="list-hero list-hero--cat">
	<div class="container">
		<Breadcrumbs items={[{ label: t('breadcrumb.cats') }]} />
		<h1 class="list-hero__title">{t('list.cat.title')}</h1>
		<p class="list-hero__subtitle">{animalService.cats.length} {t('list.cat.subtitle')}</p>
	</div>
</section>

<section class="animal-list section">
	<div class="container">
		<FilterBar {gender} {status} {search} size="" showSize={false} onchange={handleFilterChange} />

		<div class="grid grid--4" data-testid="cats-list">
			{#each filteredCats as cat (cat.slug)}
				<AnimalCard animal={cat} />
			{/each}
		</div>

		{#if filteredCats.length === 0}
			<div class="no-results">
				<p>{t('filter.noResults')}</p>
			</div>
		{/if}
	</div>
</section>

<style>
	.list-hero {
		background: var(--cat-hero);
		color: white;
		padding: var(--space-2xl) 0 var(--space-3xl);
		text-align: center;
	}

	.list-hero--cat {
		background: var(--cat-hero);
	}

	.list-hero__title {
		font-size: 2.5rem;
		font-weight: 900;
		margin: var(--space-lg) 0 var(--space-sm);
	}

	.list-hero__subtitle {
		font-size: 1.1rem;
		opacity: 0.85;
	}

	.animal-list {
		background: var(--color-bg-warm);
	}

	.no-results {
		text-align: center;
		padding: var(--space-3xl);
		color: var(--color-text-muted);
		font-size: 1.2rem;
		background: var(--color-bg-card);
		border-radius: var(--radius-lg);
		border: none;
		box-shadow: var(--shadow-sm);
	}
</style>
