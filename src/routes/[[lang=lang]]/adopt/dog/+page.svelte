<script lang="ts">
	import { withBase } from '$lib/utils/withBase';
	import { page } from '$app/state';
	import { browser } from '$app/environment';
	import { goto } from '$app/navigation';
	import { animalService } from '$lib/services/animals';
	import AnimalCard from '$lib/components/animal/AnimalCard.svelte';
	import FilterBar from '$lib/components/FilterBar.svelte';
	import { t, tFormat } from '$lib/i18n';
	import type { FilterState } from '$lib/data/types';

	import { SvelteURLSearchParams } from 'svelte/reactivity';

	/**
	 * Whether the first client render is behind us.
	 *
	 * `browser` is already true during hydration, so reading the filters there made the
	 * client's first render disagree with the server's: the build prerenders every
	 * animal, and a URL like ?gender=male rendered fourteen. Svelte adopted the first
	 * fourteen cards it found, patched the reactive text onto them and left the rest —
	 * so twelve cards carried the right name, link and badges over another animal's
	 * photograph. Nothing failed; the page simply lied about who was who.
	 *
	 * The effect runs after that first render, so hydration matches and the filter is a
	 * normal update afterwards.
	 */
	// The rule wants a writable $derived here, but there is nothing to derive it from:
	// the value is "a render has happened", which only an effect can know.
	// eslint-disable-next-line svelte/prefer-writable-derived
	let hydrated = $state(false);
	$effect(() => {
		hydrated = true;
	});

	// url.searchParams throws during prerendering, so the build renders the full,
	// unfiltered list — which is also what a crawler should see.
	const urlParams = $derived(browser && hydrated ? page.url.searchParams : new URLSearchParams());

	const gender = $derived(urlParams.get('gender') || '');
	const size = $derived(urlParams.get('size') || '');
	const status = $derived(urlParams.get('status') || '');
	const search = $derived(urlParams.get('search') || '');

	const totalWaiting = $derived(animalService.dogs.filter((d) => !d.isAdopted).length);
	const totalAdopted = $derived(animalService.dogs.filter((d) => d.isAdopted).length);

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
		<h1 class="list-hero__title">{t('list.dog.title')}</h1>
		<p class="list-hero__subtitle">{t('list.dog.subtitle')}</p>
		<div class="list-hero__stats">
			<span class="stat-pill stat-pill--waiting" data-testid="list-stats-waiting-badge">
				<span class="stat-pill__num">{totalWaiting}</span>
				<span class="stat-pill__label">{t('list.stats.waiting')}</span>
			</span>
			<span class="stat-pill stat-pill--adopted" data-testid="list-stats-adopted-badge">
				<span class="stat-pill__num">{totalAdopted}</span>
				<span class="stat-pill__label">{t('list.stats.adopted')}</span>
			</span>
		</div>
	</div>
</section>

<section class="animal-list section">
	<div class="container">
		<FilterBar {gender} {size} {status} {search} onchange={handleFilterChange} />

		<div class="grid grid--4" data-testid="dogs-list">
			<!-- The first card is the LCP element on this page, measured: Lighthouse named
				 `a#card-gracie > img.animal-card__photo` and scored `lcp-lazy-loaded` at 0,
				 with LCP at 9.4 s against a 2.5 s target. `priority` is exactly what the prop
				 exists for, and this page never passed it. Only the first: eager-loading more
				 would trade the LCP win for bandwidth the visitor may not need. -->
			{#each filteredDogs as dog, i (dog.slug)}
				<AnimalCard animal={dog} priority={i === 0} />
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
		padding: var(--space-xl) 0;
		text-align: center;
	}

	.list-hero--dog {
		background: var(--dog-hero);
	}

	.list-hero__title {
		font-size: 2.5rem;
		font-weight: 900;
		margin: var(--space-xs) 0 var(--space-sm);
	}

	.list-hero__subtitle {
		font-size: 1.1rem;
		/* No opacity: white on the hero is already at the edge of 4.5:1 and any
		   transparency pushes it under. */
	}

	.list-hero__stats {
		display: flex;
		align-items: center;
		justify-content: center;
		gap: var(--space-md);
		margin-top: var(--space-md);
		flex-wrap: wrap;
	}

	.stat-pill {
		display: inline-flex;
		align-items: center;
		gap: var(--space-xs);
		padding: 6px 16px;
		border-radius: var(--radius-full);
		font-size: 0.95rem;
		font-weight: 700;
		background: rgba(255, 255, 255, 0.18);
		backdrop-filter: blur(8px);
		border: 1px solid rgba(255, 255, 255, 0.35);
		box-shadow: var(--shadow-sm);
	}

	.stat-pill__num {
		font-size: 1.15rem;
		font-weight: 900;
		font-family: var(--font-accent);
	}

	/* A dark scrim, not a white one. Lightening the hero under white text pushed the
	   pair to 3.5:1; darkening it takes the same white to 8.8:1. */
	.stat-pill--waiting {
		background: rgba(0, 0, 0, 0.22);
		color: #ffffff;
	}

	.stat-pill--adopted {
		background: rgba(0, 0, 0, 0.14);
		color: #ffffff;
	}

	.animal-list {
		/* No background of its own: the page's own image sits behind it, and a flat
		   panel over the full height of the list hid the whole thing. */
		padding-top: var(--space-lg);
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
