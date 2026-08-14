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
	const params = $derived(browser ? page.url.searchParams : new URLSearchParams());

	const gender = $derived(params.get('gender') || '');
	const status = $derived(params.get('status') || '');
	const search = $derived(params.get('search') || '');

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

		goto(withBase(`?${params.toString()}`), {
			replaceState: true,
			keepFocus: true,
			noScroll: true
		});
	}
</script>

<svelte:head>
	<title>{t('app.title.cat')}</title>
	<meta
		name="description"
		content={tFormat('list.cat.description', { count: animalService.cats.length })}
	/>
</svelte:head>

<section class="list-hero list-hero--cat">
	<div class="container">
		<Breadcrumbs items={[{ label: t('breadcrumb.cats') }]} />
		<h1 class="list-hero__title">{t('list.cat.title')}</h1>
		<p class="list-hero__subtitle">{tPlural('list.cat.count', animalService.cats.length)}</p>
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
		/* No opacity: white on the hero is already at the edge of 4.5:1 and any
		   transparency pushes it under. */
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
