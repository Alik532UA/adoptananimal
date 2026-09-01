<script lang="ts">
	import { localePath } from '$lib/utils/withBase';
	import { t } from '$lib/i18n';
	import { settings } from '$lib/services/settings.svelte';
	import { allAnimals } from '$lib/data/animals';
	import AnimalCard from '$lib/components/animal/AnimalCard.svelte';
	import Button from '$lib/components/ui/Button.svelte';
	import Icon from '$lib/components/ui/Icon.svelte';
	import { flip } from 'svelte/animate';
	import { MediaQuery } from 'svelte/reactivity';

	let favoriteAnimals = $derived(allAnimals.filter((a) => settings.favorites.includes(a.slug)));

	const reducedMotion = new MediaQuery('(prefers-reduced-motion: reduce)');

	/** Long enough to follow, short enough that removing three in a row is not a wait. */
	const LEAVE_MS = 260;
	const SETTLE_MS = 340;

	const leaveDuration = $derived(reducedMotion.current ? 0 : LEAVE_MS);
	const settleDuration = $derived(reducedMotion.current ? 0 : SETTLE_MS);

	/**
	 * The card being un-favourited: fades and shrinks, and — the part that matters —
	 * leaves the grid's flow on the first frame.
	 *
	 * Without that it keeps its cell for the whole transition, so nothing else can move
	 * until it is gone: the remaining cards wait, then jump. Pinning it at the position
	 * it already occupies takes it out of the layout immediately, which is what lets
	 * `animate:flip` below carry the others to their new places while this one is still
	 * on screen. The two overlap, and that overlap is the whole effect.
	 *
	 * Measured from `offsetParent`, which is the grid — it is given `position: relative`
	 * in the styles below precisely so that this is true.
	 */
	function leave(node: HTMLElement, { duration }: { duration: number }) {
		const { offsetLeft, offsetTop, offsetWidth, offsetHeight } = node;
		return {
			duration,
			css: (t: number) => `
				position: absolute;
				left: ${offsetLeft}px;
				top: ${offsetTop}px;
				width: ${offsetWidth}px;
				height: ${offsetHeight}px;
				margin: 0;
				pointer-events: none;
				opacity: ${t};
				transform: scale(${0.92 + 0.08 * t});
			`
		};
	}
</script>

<svelte:head>
	<title>{t('nav.favorites')} | AdoptAnAnimal</title>
	<meta name="description" content={t('meta.favorites.description')} />
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
			<div class="grid grid--4 favs-grid">
				{#each favoriteAnimals as animal (animal.slug)}
					<!-- The wrapper exists so there is an ELEMENT to animate: `animate:` and
						 `out:` attach to elements, not to components. It is the grid item now,
						 hence the stretch below — the card measures itself against it. -->
					<div
						class="favs-grid__cell"
						out:leave={{ duration: leaveDuration }}
						animate:flip={{ duration: settleDuration }}
					>
						<AnimalCard {animal} />
					</div>
				{/each}
			</div>
		{:else}
			<div class="no-favorites" data-testid="no-favorites-message">
				<div class="no-results">
					<Icon name="heart" size="4rem" class="mb-lg" />
					<h2>{t('favs.empty')}</h2>
					<div class="no-favorites__actions">
						<!-- Both the same, not one of each: cats and dogs are the same offer, and
							 a solid button beside a hollow one reads as a recommendation nobody
							 meant to make. Primary rather than the hero variant, because this
							 panel is the card colour and the hero surface is white on two of the
							 four themes — which is a white button on a white card. -->
						<Button
							href={localePath('/adopt/dog')}
							variant="primary"
							data-testid="explore-dogs-link"
						>
							{t('featured.browseDogs')}
						</Button>
						<Button
							href={localePath('/adopt/cat')}
							variant="primary"
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
		background: var(--cat-hero);
		color: white;
		padding: var(--space-xl) 0;
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

	/* `relative` is load-bearing: the leaving card pins itself with offsets measured
	   from its offsetParent, and this is what makes that the grid rather than the page. */
	.favs-grid {
		position: relative;
	}

	/* The card sets `height: 100%`, so the cell it is now inside has to stretch or every
	   row collapses to its own content and the grid stops lining up. */
	.favs-grid__cell {
		display: flex;
	}

	.favs-grid__cell > :global(.animal-card) {
		width: 100%;
	}

	.animal-list {
		/* No background of its own: the page's own image sits behind it, and a flat panel
		   the height of the list hid the whole thing. The cat and dog lists lost theirs
		   two versions ago; this one was missed because the test only knew about those
		   two pages. */
		min-height: 40vh;
		padding-top: var(--space-lg);
	}

	/* The two buttons had no gap and sat against each other; stacked on a narrow screen
	   they touched. Their own row rather than a utility margin, so the spacing is stated
	   once and survives them wrapping. */
	.no-favorites__actions {
		margin-top: var(--space-lg);
		display: flex;
		flex-wrap: wrap;
		justify-content: center;
		gap: var(--space-md);
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
</style>
