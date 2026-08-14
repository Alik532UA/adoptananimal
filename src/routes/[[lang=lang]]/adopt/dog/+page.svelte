<script lang="ts">
	import { withBase } from '$lib/utils/withBase';
	import { page } from '$app/state';
	import { browser } from '$app/environment';
	import { goto } from '$app/navigation';
	import { animalService } from '$lib/services/animals';
	import AnimalCard from '$lib/components/animal/AnimalCard.svelte';
	import FilterBar from '$lib/components/FilterBar.svelte';
	import { t, tFormat, tPlural } from '$lib/i18n';
	import type { FilterState } from '$lib/data/types';
	import Breadcrumbs from '$lib/components/Breadcrumbs.svelte';

	import { SvelteURLSearchParams } from 'svelte/reactivity';

	// url.searchParams throws during prerendering, so the build renders the full,
	// unfiltered list — which is also what a crawler should see. Filters apply on hydration.
	const urlParams = $derived(browser ? page.url.searchParams : new URLSearchParams());

	const gender = $derived(urlParams.get('gender') || '');
	const size = $derived(urlParams.get('size') || '');
	const status = $derived(urlParams.get('status') || '');
	const search = $derived(urlParams.get('search') || '');

	const filteredDogs = $derived(animalService.getFiltered('dog', { gender, size, status, search }));

	function handleFilterChange(filters: FilterState) {
		const params = new SvelteURLSearchParams(page.url.searchParams);

		if (filters.gender) params.set('gender', filters.gender);
		else params.delete('gender');

		if (filters.size) params.set('size', filters.size);
		else params.delete('size');

		if (filters.status) params.set('status', filters.status);
		else params.delete('status');

		if (filters.search) params.set('search', filters.search);
		else params.delete('search');

		goto(withBase(`?${params.toString()}`), {
			replaceState: true,
			keepFocus: true,
			noScroll: true
		});
	}
</script>

<svelte:head>
	<title>{t('app.title.dog')}</title>
	<meta
		name="description"
		content={tFormat('list.dog.description', { count: animalService.dogs.length })}
	/>
</svelte:head>

<section class="list-hero list-hero--dog">
	<div class="container">
		<Breadcrumbs items={[{ label: t('breadcrumb.dogs') }]} />
		<h1 class="list-hero__title">{t('list.dog.title')}</h1>
		<p class="list-hero__subtitle">{tPlural('list.dog.count', animalService.dogs.length)}</p>
	</div>
</section>

<section class="animal-list section">
	<div class="container">
		<FilterBar {gender} {size} {status} {search} onchange={handleFilterChange} />

		<div class="grid grid--4" data-testid="dogs-list">
			{#each filteredDogs as dog (dog.slug)}
				<AnimalCard animal={dog} />
			{/each}
		</div>

		{#if filteredDogs.length === 0}
			<div class="no-results">
				<p>{t('filter.noResults')}</p>
			</div>
		{/if}
	</div>
</section>

<style>
	.list-hero {
		background: var(--dog-hero);
		color: white;
		padding: var(--space-2xl) 0 var(--space-3xl);
		text-align: center;
	}

	.list-hero--dog {
		background: var(--dog-hero);
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
