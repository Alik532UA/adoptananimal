<script lang="ts">
	import { localePath, withBase } from '$lib/utils/withBase';
	import AnimalCard from '$lib/components/animal/AnimalCard.svelte';
	import Icon from '$lib/components/ui/Icon.svelte';
	import Button from '$lib/components/ui/Button.svelte';
	import Carousel from '$lib/components/ui/Carousel.svelte';
	import { t } from '$lib/i18n';
	import { interleaveByType, limitAdopted } from '$lib/utils/interleave';

	let { data } = $props();

	/**
	 * The order the build produced, reshuffled once this is running in a browser.
	 *
	 * It cannot be shuffled in `load`: that runs at build time on a prerendered site,
	 * so a random order would be frozen into the HTML and every visitor would see the
	 * same "random" one — which is exactly what was happening. Shuffling after mount
	 * gives each visit its own order while the prerendered HTML stays stable for
	 * crawlers and for hydration.
	 */
	// A writable $derived: it holds the build order until the effect below replaces it,
	// and falls back to the build order again if the page data ever changes. The effect
	// depends on data.animals, not on this, so the assignment does not re-trigger it.
	let animals = $derived(data.animals);

	/**
	 * Whether the order on screen is the shuffled one.
	 *
	 * The build order is real markup and it is painted as soon as the HTML arrives —
	 * long before the bundle has downloaded and hydrated. So the same few animals led
	 * the carousel for as long as that took, and then everything moved at once. The
	 * cards stay in the HTML for crawlers and for the no-script case; what waits is
	 * showing them, and only when a script is there to do the shuffling.
	 */
	let shuffled = $state(false);

	$effect(() => {
		animals = interleaveByType(limitAdopted(data.animals));
		shuffled = true;
	});
</script>

<svelte:head>
	<title>{t('app.title.full')}</title>
</svelte:head>

<!-- Featured Carousel (Moved to the very beginning) -->
<section class="featured section">
	<div class="featured__carousel" class:featured__carousel--shuffled={shuffled}>
		<Carousel speed={30} testId="featured-carousel">
			{#each animals as animal, i (animal.slug)}
				<div class="carousel-item">
					<AnimalCard {animal} priority={i === 0} />
				</div>
			{/each}
		</Carousel>
	</div>

	<div class="container">
		<div class="featured__footer">
			<Button
				href={localePath('/adopt/cat')}
				variant="secondary"
				size="lg"
				data-testid="featured-see-all-cats-link"
				>{t('featured.browseCats')} <Icon name="cat" size="1.2rem" /></Button
			>
			<Button
				href={localePath('/adopt/dog')}
				variant="secondary"
				size="lg"
				data-testid="featured-see-all-dogs-link"
				>{t('featured.browseDogs')} <Icon name="dog" size="1.2rem" /></Button
			>
		</div>
	</div>
</section>

<!-- About Section -->
<section class="about section" id="about">
	<div class="container container--narrow">
		<div class="about__card glass-card">
			<h2 class="section__title">{t('about.title')}</h2>
			<p class="section__subtitle">{t('about.subtitle')}</p>

			<div class="about__content">
				<div class="about__text-item">
					<div class="about__text-icon"><Icon name="heart" size="1.2rem" /></div>
					<p>{t('about.p1')}</p>
				</div>
				<div class="about__text-item">
					<div class="about__text-icon"><Icon name="globe" size="1.2rem" /></div>
					<p>{t('about.p2')}</p>
				</div>
				<div class="about__text-item">
					<div class="about__text-icon"><Icon name="paw" size="1.2rem" /></div>
					<p>{t('about.p3')}</p>
				</div>
				<div class="about__text-item">
					<div class="about__text-icon"><Icon name="idea" size="1.2rem" /></div>
					<p>{t('about.p4')}</p>
				</div>
			</div>
		</div>

		<div class="about__note glass-card">
			<div class="about__note-visual">
				<div class="about__flags">
					<div class="about__flag-wrapper">
						<img src={withBase('/images/flags/uk.svg')} alt={t('country.ua')} class="about__flag" />
					</div>
					<div class="about__flag-wrapper">
						<img src={withBase('/images/flags/de.svg')} alt={t('country.de')} class="about__flag" />
					</div>
					<div class="about__flag-wrapper">
						<img src={withBase('/images/flags/at.svg')} alt={t('country.at')} class="about__flag" />
					</div>
					<div class="about__flag-wrapper">
						<img src={withBase('/images/flags/nl.svg')} alt={t('country.nl')} class="about__flag" />
					</div>
				</div>
			</div>
			<div class="about__note-content">
				<h4 class="about__note-title">
					<Icon name="globe" size="1.2rem" />
					{t('about.note.title')}
				</h4>
				<p class="about__countries-main">{t('about.countries.text')}</p>
				<p class="about__note-text">{t('about.countries.expanding')}</p>
				<div class="about__thanks-wrapper">
					<span class="about__thanks-heart"
						><Icon name="heart-filled" size="1rem" class="text-danger" /></span
					>
					<p class="about__thanks"><strong>{t('about.thanks')}</strong></p>
				</div>
			</div>
		</div>
	</div>
</section>

<style>
	/* About Section - Premium Redesign */
	.about {
		position: relative;
		padding: var(--space-4xl) 0;
		overflow: hidden;
	}

	.about__card {
		position: relative;
		z-index: 1;
		/* The title below sizes itself against this card, not against the viewport. */
		container-type: inline-size;
		padding: var(--space-3xl);
		animation: fade-in-up 0.8s ease-out;
		margin-bottom: var(--space-xl);
	}

	@keyframes fade-in-up {
		from {
			opacity: 0;
			transform: translateY(30px);
		}
		to {
			opacity: 1;
			transform: translateY(0);
		}
	}

	.glass-card {
		background: var(--glass-bg);
		-webkit-backdrop-filter: blur(var(--glass-blur));
		backdrop-filter: blur(var(--glass-blur));
		border: none;
		border-radius: var(--radius-lg);
		box-shadow: var(--shadow-xl);
	}

	:global([data-style='modern']) .about__card {
		border-radius: 32px;
	}

	:global([data-style='playful']) .about__card {
		border-radius: 48px;
		border-width: 0;
	}

	/*
	 * ONE LINE. Do not add wrapping here, and do not remove `white-space: nowrap`.
	 *
	 * It has been changed back more than once, so here is why it keeps looking broken
	 * and what actually fixes it. The four translations are four different lengths —
	 * German is the longest at 34 characters — and the title used to be sized in `vw`.
	 * At some viewport widths the longest one came out fractionally wider than the
	 * card: once a `width: fit-content` box overflows its container, `margin: auto`
	 * resolves to zero and the whole thing slams against the right edge. That is what
	 * "not centred" was. Wrapping fixed the centring and broke the one-line rule.
	 *
	 * The size is in `cqi` now — a share of *this card's* width, not the viewport's —
	 * so the longest translation always fits on one line whatever the layout does
	 * around it, and `margin: auto` keeps working. `tests/ui.spec.ts` fails if the
	 * title ever wraps or drifts off centre, in any of the four languages.
	 */
	.about .section__title {
		margin-top: 0;
		white-space: nowrap;
		max-width: 100%;
		display: block;
		width: fit-content;
		margin-left: auto;
		margin-right: auto;
		transition: all var(--transition-normal);
		cursor: default;
		position: relative;
		font-size: clamp(0.8rem, 5.2cqi, 2.5rem);
	}

	.about .section__title:hover {
		color: var(--color-primary);
	}

	.about .section__title::after {
		content: '';
		position: absolute;
		bottom: -4px;
		left: 50%;
		width: 0;
		height: 3px;
		background: var(--gradient-accent);
		border-radius: var(--radius-full);
		transition: all var(--transition-normal);
		transform: translateX(-50%);
	}

	.about .section__title:hover::after {
		width: 60%;
	}

	.about__content {
		display: grid;
		gap: var(--space-lg);
	}

	.about__text-item {
		display: flex;
		gap: var(--space-md);
		align-items: flex-start;
	}

	.about__text-icon {
		margin-top: 4px;
		color: var(--color-primary);
		flex-shrink: 0;
	}

	.about__text-item p {
		font-size: 1.1rem;
		line-height: 1.6;
		color: var(--color-text);
		margin: 0;
	}

	.about__note {
		display: flex;
		gap: var(--space-xl);
		padding: var(--space-xl);
		align-items: center;
		background: var(--glass-bg);
		-webkit-backdrop-filter: blur(var(--glass-blur));
		backdrop-filter: blur(var(--glass-blur));
		animation: fade-in-up 0.8s ease-out 0.2s backwards;
	}

	.about__note-visual {
		flex-shrink: 0;
	}

	.about__flags {
		display: grid;
		grid-template-columns: repeat(2, 1fr);
		gap: 8px;
		width: 110px;
	}

	.about__flag-wrapper {
		overflow: hidden;
		border-radius: 4px;
		box-shadow: var(--shadow-sm);
		transition: transform var(--transition-fast);
	}

	.about__flag-wrapper:hover {
		transform: scale(1.1) rotate(5deg);
	}

	.about__flag {
		width: 100%;
		display: block;
	}

	.about__note-content {
		display: flex;
		flex-direction: column;
		gap: var(--space-sm);
	}

	.about__note-title {
		display: flex;
		align-items: center;
		gap: var(--space-xs);
		color: var(--color-primary-on-surface);
		font-size: 1.1rem;
		margin: 0;
	}

	.about__countries-main {
		font-weight: 800;
		font-size: 1.2rem;
		color: var(--color-text);
		margin: 0;
	}

	.about__note-text {
		color: var(--color-text-muted);
		font-size: 0.95rem;
		margin: 0;
	}

	.about__thanks-wrapper {
		display: flex;
		align-items: center;
		gap: var(--space-xs);
		margin-top: var(--space-xs);
	}

	.about__thanks {
		color: var(--color-primary-on-surface);
		margin: 0;
	}

	.carousel-item {
		width: 300px;
		flex-shrink: 0;
	}

	/*
	 * Hidden until shuffled, and only where a script exists to shuffle it.
	 * :global([data-js]) is set by the inline script in app.html before the first
	 * paint; without JS the attribute never appears, the rule never applies, and the
	 * carousel shows the build order rather than nothing at all.
	 *
	 * visibility, not display: the cards keep their space, so nothing below them moves
	 * when they appear.
	 */
	:global([data-js]) .featured__carousel {
		visibility: hidden;
		opacity: 0;
	}

	:global([data-js]) .featured__carousel--shuffled {
		visibility: visible;
		opacity: 1;
		transition: opacity var(--transition-normal);
	}

	@media (prefers-reduced-motion: reduce) {
		:global([data-js]) .featured__carousel--shuffled {
			transition: none;
		}
	}

	.featured__footer {
		text-align: center;
		margin-top: var(--space-2xl);
		display: flex;
		justify-content: center;
		gap: var(--space-lg);
		flex-wrap: wrap;
	}

	@media (max-width: 768px) {
		.featured__footer {
			flex-direction: column;
			align-items: stretch;
		}
		.about__note {
			flex-direction: column;
			text-align: center;
		}
		.about__card {
			padding: var(--space-xl);
		}
		.carousel-item {
			width: 260px;
		}
	}

	@media (max-width: 400px) {
		.about__card {
			/* 64px of padding on a 272px card is a third of it, and the one-line title
			   above has to fit in what is left. */
			padding: var(--space-lg);
		}
	}
</style>
