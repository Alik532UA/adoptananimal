<script lang="ts">
	import { localePath, withBase } from '$lib/utils/withBase';
	import type { PageData } from './$types';
	import { t } from '$lib/i18n';
	import { settings } from '$lib/services/settings.svelte';
	import Breadcrumbs from '$lib/components/Breadcrumbs.svelte';
	import Icon from '$lib/components/ui/Icon.svelte';
	import { absoluteFromRoot } from '$lib/config';
	import { animalService } from '$lib/services/animals';

	let { data }: { data: PageData } = $props();
	const animal = $derived(data.animal);
	let imageFailed = $state(false);

	const photo = $derived(absoluteFromRoot(animal.image));

	/**
	 * The next animal in the list, wrapping round at the end.
	 *
	 * Taken from the same ordered list the listing page shows, so "next" means the same
	 * thing in both places, and it wraps rather than disappearing on the last one — a
	 * button that is there on twenty pages and missing on the twenty-first reads as a
	 * fault rather than as the end of something.
	 */
	const next = $derived.by(() => {
		// Only the ones still looking. Offering someone who already has a home is a
		// dead end dressed up as a suggestion.
		const waiting = animalService.cats.filter((a) => !a.isAdopted);
		if (waiting.length === 0) return null;

		const here = waiting.findIndex((a) => a.slug === animal.slug);
		/*
		 * Not in the list means this one has been adopted. Then the first who has not
		 * is the right answer rather than no answer: a page about an animal who is no
		 * longer available is exactly where someone needs a way on to one who is.
		 */
		if (here === -1) return waiting[0];
		if (waiting.length < 2) return null;
		return waiting[(here + 1) % waiting.length];
	});

	/**
	 * Schema.org description of the animal. Rendered with {@html} because Svelte does
	 * not evaluate expressions inside a literal <script> tag (SEO § 3.2). The payload
	 * is our own data and is JSON-encoded, with "<" escaped so it cannot close the tag.
	 */
	const jsonLd = $derived(
		JSON.stringify({
			'@context': 'https://schema.org',
			'@type': 'Product',
			name: animal.name,
			image: photo,
			description: animal.description[settings.locale]?.[0] || animal.description.en[0],
			category: 'Cat',
			additionalProperty: [
				{ '@type': 'PropertyValue', name: 'Breed', value: animal.breed.en },
				{ '@type': 'PropertyValue', name: 'Age', value: animal.age.en },
				{ '@type': 'PropertyValue', name: 'Gender', value: animal.gender.en },
				{ '@type': 'PropertyValue', name: 'Size', value: animal.size.en }
			],
			offers: {
				'@type': 'Offer',
				price: '0',
				priceCurrency: 'EUR',
				availability: animal.isAdopted ? 'https://schema.org/SoldOut' : 'https://schema.org/InStock'
			}
		}).replace(/</g, '\u003c')
	);

	// Assembled here rather than inline so the closing tag never appears as a literal
	// sequence in the source. {@html} is required: Svelte does not evaluate expressions
	// inside a literal <script> tag (SEO § 3.2), and the payload is our own JSON.
	const jsonLdTag = $derived('<script type="application/ld+json">' + jsonLd + '<' + '/script>');

	const breadcrumbItems = $derived([
		{ label: t('breadcrumb.cats'), href: '/adopt/cat' },
		{ label: animal.name }
	]);
</script>

<svelte:head>
	<title>{animal.name} | {t('breadcrumb.cats')}</title>
	<meta
		name="description"
		content="Meet {animal.name}, a {animal.breed.en} cat rescued from Ukraine. {animal.description
			.en[0]}"
	/>
	<meta property="og:title" content="{animal.name} - {t('breadcrumb.cats')}" />
	<meta
		property="og:description"
		content={animal.description[settings.locale][0] || animal.description.en[0]}
	/>
	<meta property="og:type" content="website" />
	<meta property="og:image" content={photo} />
	<meta property="og:image:alt" content={animal.name} />
	<!-- eslint-disable-next-line svelte/no-at-html-tags -- payload is JSON.stringify of our own data, with "<" escaped -->
	{@html jsonLdTag}
</svelte:head>

<section class="detail-hero detail-hero--cat">
	<div class="container">
		<Breadcrumbs items={breadcrumbItems} />
	</div>
</section>

<section class="detail section">
	<div class="container">
		{#if animal.isAdopted}
			<div class="adoption-status-banner">
				{t('detail.alreadyAdopted')}
			</div>
		{/if}
		<div class="detail__layout">
			<div class="detail__image-area">
				<div class="detail__image">
					{#if !imageFailed}
						<img
							src={withBase(animal.image)}
							alt={animal.name}
							class="detail__photo"
							style={animal.imagePosition ? `object-position: ${animal.imagePosition}` : undefined}
							onerror={() => (imageFailed = true)}
						/>
					{/if}
					<div class="detail__emoji" style={imageFailed ? '' : 'display: none;'}>
						<Icon name="cat" size="10rem" />
					</div>
				</div>
				<!--
					Every way off this page, in one place under the photograph.
					They used to be spread over two: two buttons here and two more below a
					story long enough that nobody who had read it could still see these.
				-->
				<div class="detail__aside-actions">
					{#if !animal.isAdopted}
						<a
							href={localePath(`/apply?animal=${animal.name}`)}
							class="btn btn--primary btn--lg detail__apply-btn"
							data-testid="apply-top-link"
						>
							{t('detail.applyAdoption')}
						</a>
					{/if}

					<!-- The same words the home page and the favourites page already use for
						 this destination. A third phrase for one place is how a site starts
						 feeling like several. -->
					<a
						href={localePath('/adopt/cat')}
						class="btn btn--secondary"
						data-testid="back-to-cats-link"
						><Icon name="arrow-left" size="1.1rem" /> {t('featured.browseCats')}</a
					>

					{#if next}
						<!-- The face is the point: a name alone says nothing about who is next,
							 and the thumbnail is the reason to press it. -->
						<a
							class="detail__next"
							href={localePath(`/adopt/cat/${next.slug}`)}
							data-testid="next-animal-link"
						>
							<img
								class="detail__next-thumb"
								src={withBase(next.image)}
								alt=""
								loading="lazy"
								decoding="async"
								width="64"
								height="64"
								style={next.imagePosition ? `object-position: ${next.imagePosition}` : undefined}
							/>
							<span class="detail__next-text">
								<span class="detail__next-label">{t('detail.nextAnimal')}</span>
								<span class="detail__next-name">{next.name}</span>
							</span>
							<Icon name="arrow-right" size="1.2rem" />
						</a>
					{/if}
				</div>
			</div>

			<div class="detail__info">
				<h1 class="detail__name">{animal.name}</h1>
				<!-- <span class="badge badge--cat">{t('detail.cat')}</span> -->

				<div class="detail__specs">
					<div class="detail__spec">
						<span class="detail__spec-label">{t('detail.gender')}</span>
						<span class="detail__spec-value"
							><Icon
								name={animal.gender.en.toLowerCase() === 'male' ? 'male' : 'female'}
								size="1.1rem"
							/>
							{animal.gender[settings.locale]}</span
						>
					</div>
					<div class="detail__spec">
						<span class="detail__spec-label">{t('detail.breed')}</span>
						<span class="detail__spec-value">{animal.breed[settings.locale]}</span>
					</div>
					<div class="detail__spec">
						<span class="detail__spec-label">{t('detail.age')}</span>
						<span class="detail__spec-value">{animal.age[settings.locale]}</span>
					</div>
					<div class="detail__spec">
						<span class="detail__spec-label">{t('detail.size')}</span>
						<span class="detail__spec-value">{animal.size[settings.locale]}</span>
					</div>
					<div class="detail__spec">
						<span class="detail__spec-label">{t('detail.color')}</span>
						<span class="detail__spec-value">{animal.color[settings.locale]}</span>
					</div>
				</div>

				<div class="detail__story">
					<h2 class="detail__story-title">{t('detail.myStory')}</h2>
					{#each animal.description[settings.locale] || animal.description.en as paragraph, index (index)}
						<p class="detail__story-text">{paragraph}</p>
					{/each}
				</div>
			</div>
		</div>
	</div>
</section>

<style>
	.adoption-status-banner {
		background: var(--color-success);
		color: white;
		padding: var(--space-md);
		border-radius: var(--radius-md);
		margin-bottom: var(--space-xl);
		text-align: center;
		font-weight: 700;
	}

	.detail-hero {
		padding: var(--space-xl) 0;
		color: white;
	}

	.detail-hero--cat {
		/* --cat-hero, not --color-primary: the primary is picked to work as a surface
		   under its own foreground, and white on it is 2.14:1 in dark and 3.0:1 in
		   winter. The hero colour is the darkened one, and white is safe on it. */
		background: var(--cat-hero);
	}

	.detail__layout {
		display: grid;
		grid-template-columns: 400px 1fr;
		gap: var(--space-3xl);
		align-items: start;
	}

	.detail__image-area {
		display: flex;
		flex-direction: column;
		gap: var(--space-lg);
		position: sticky;
		top: 96px;
	}

	.detail__image {
		position: relative;
		background: var(--color-bg-card);
		border-radius: var(--radius-lg);
		aspect-ratio: 1;
		display: flex;
		align-items: center;
		justify-content: center;
		box-shadow: var(--shadow-lg);
		border: none;
		overflow: hidden;
	}

	.detail__photo {
		width: 100%;
		height: 100%;
		object-fit: cover;
	}

	.detail__emoji {
		color: var(--color-primary);
		filter: drop-shadow(0 8px 16px rgba(0, 0, 0, 0.1));
		transition: transform var(--transition-spring);
	}

	.detail__emoji:hover {
		transform: scale(1.1) rotate(5deg);
	}

	.detail__info {
		display: flex;
		flex-direction: column;
		gap: var(--space-xl);
	}

	.detail__name {
		font-family: var(--font-accent);
		font-size: 3rem;
		font-weight: 900;
		color: var(--color-text);
	}

	.detail__specs {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
		gap: var(--space-md);
	}

	.detail__spec {
		background: var(--color-bg-warm);
		border-radius: var(--radius-md);
		padding: var(--space-md);
		display: flex;
		flex-direction: column;
		gap: 4px;
		border: none;
		box-shadow: var(--shadow-sm);
	}

	.detail__spec-label {
		font-size: 0.8rem;
		font-weight: 700;
		text-transform: uppercase;
		letter-spacing: 0.05em;
		color: var(--color-text-light);
	}

	.detail__spec-value {
		font-size: 1rem;
		font-weight: 600;
		color: var(--color-text);
	}

	.detail__story {
		display: flex;
		flex-direction: column;
		gap: var(--space-md);
		/* A surface of its own. This is the longest stretch of reading on the site and it
		   sat directly on the page's photograph — legible in the sense that the contrast
		   maths passed, and hard work in the sense that every line had a different thing
		   behind it. */
		padding: var(--space-xl);
		border-radius: var(--radius-lg);
		background: var(--color-bg-card);
		box-shadow: var(--shadow-sm);
	}

	.detail__story-title {
		font-family: var(--font-accent);
		font-size: 1.5rem;
		font-weight: 700;
		color: var(--color-primary-dark);
	}

	.detail__story-text {
		color: var(--color-text-muted);
		line-height: 1.8;
		font-size: 1rem;
	}

	/*
	 * A doorway to the next animal, rather than only a way back to the list.
	 *
	 * Its own row under the buttons: it is a different kind of thing from "apply" and
	 * "back", and lined up beside them it read as a third button of equal weight.
	 */
	.detail__aside-actions {
		display: flex;
		flex-direction: column;
		gap: var(--space-sm);
		margin-top: var(--space-lg);
	}

	/*
	 * The three read as one set.
	 *
	 * They arrived from three different places — a large button, a default-sized one and
	 * a pill of my own — so they had three heights, three corner radii and three kinds of
	 * background. Only the first is a different colour, and that is the one difference
	 * that means something: it is the thing the page is for.
	 */
	.detail__aside-actions .btn,
	.detail__next {
		display: flex;
		align-items: center;
		gap: var(--space-md);
		min-height: 64px;
		padding: var(--space-sm) var(--space-lg);
		border-radius: var(--radius-lg);
		font-size: 1rem;
	}

	/* The two that are not the main action share a surface, so the accent stands alone. */
	.detail__aside-actions .btn--secondary,
	.detail__next {
		justify-content: center;
		background: var(--color-bg-card);
		color: var(--color-text);
		box-shadow: var(--shadow-sm);
		transition:
			transform var(--transition-spring),
			box-shadow var(--transition-normal);
	}

	.detail__aside-actions .btn--secondary:hover,
	.detail__next:hover,
	.detail__next:focus-visible {
		transform: translateY(-2px);
		box-shadow: var(--shadow-lg);
		background: var(--color-bg-card-hover);
		color: var(--color-text);
	}

	/* Centred like the other two. Left-aligned it was the only one of the three whose
	   contents started somewhere else, and the photograph made that the first thing you
	   noticed about the set. */

	.detail__next-thumb {
		width: 48px;
		height: 48px;
		border-radius: 50%;
		object-fit: cover;
		flex-shrink: 0;
	}

	.detail__next-text {
		display: flex;
		flex-direction: column;
		text-align: left;
	}

	.detail__next-label {
		font-size: 0.8rem;
		color: var(--color-text-muted);
	}

	.detail__next-name {
		font-family: var(--font-accent);
		font-weight: 900;
		font-size: 1.1rem;
	}

	.detail__apply-btn {
		width: 100%;
		text-align: center;
	}

	@media (max-width: 768px) {
		.detail__layout {
			grid-template-columns: 1fr;
		}

		.detail__image-area {
			position: static;
		}

		.detail__name {
			font-size: 2rem;
		}
	}
</style>
