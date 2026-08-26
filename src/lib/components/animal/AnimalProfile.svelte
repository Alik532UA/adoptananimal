<script lang="ts">
	import { withBase } from '$lib/utils/withBase';
	import { t, tFormat } from '$lib/i18n';
	import { settings } from '$lib/services/settings.svelte';
	import Breadcrumbs from '$lib/components/Breadcrumbs.svelte';
	import Icon from '$lib/components/ui/Icon.svelte';
	import AnimalFavoriteButton from '$lib/components/animal/AnimalFavoriteButton.svelte';
	import AnimalActions from '$lib/components/animal/AnimalActions.svelte';
	import AnimalSpecs from '$lib/components/animal/AnimalSpecs.svelte';
	import AnimalStory from '$lib/components/animal/AnimalStory.svelte';
	import { absoluteFromRoot } from '$lib/config';
	import { ageDisplay, ageInEnglish, ageInMonths } from '$lib/data/age';
	import { clock } from '$lib/services/clock.svelte';
	import type { AnimalDetail } from '$lib/data/types';

	/**
	 * One animal's page, for either species.
	 *
	 * The cat and the dog routes were 506 lines each and differed in fourteen places —
	 * every one of them derivable from the species alone. Two copies of a page is two
	 * pages to change and one to forget, which happened often enough during this file's
	 * history to be worth ending: three of the fixes in the last week had to be applied
	 * twice, and the second application was an afterthought each time.
	 */
	interface Props {
		animal: AnimalDetail;
		kind: 'cat' | 'dog';
	}

	let { animal, kind }: Props = $props();

	let imageFailed = $state(false);

	/** Everything the species decides, decided once. */
	const listPath = $derived(`/adopt/${kind}`);
	const listLabel = $derived(kind === 'cat' ? t('breadcrumb.cats') : t('breadcrumb.dogs'));
	const heroColour = $derived(kind === 'cat' ? 'var(--cat-hero)' : 'var(--dog-hero)');

	const photo = $derived(absoluteFromRoot(animal.image));

	/**
	 * The snippet a search result shows, so it is written in the language the page is.
	 *
	 * It used to read `animal.breed.en` and `animal.description.en[0]` — English on
	 * every one of the four language versions, while `og:description` in the same
	 * head block already localised the same sentence. The JSON-LD keeps English on
	 * purpose and that is a different case: `additionalProperty` is read by machines,
	 * this is read by a person deciding whether to click.
	 */
	const metaDescription = $derived(
		tFormat('meta.animal.description', {
			name: animal.name,
			breed: animal.breed[settings.locale] || animal.breed.en,
			story: animal.description[settings.locale]?.[0] || animal.description.en[0]
		})
	);

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
			category: kind === 'cat' ? 'Cat' : 'Dog',
			additionalProperty: [
				{ '@type': 'PropertyValue', name: 'Breed', value: animal.breed.en },
				{
					'@type': 'PropertyValue',
					name: 'Age',
					// English regardless of the reader's language: this block is for machines.
					value: ageInEnglish(ageDisplay(ageInMonths(animal.bornOn, clock.now)))
				},
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

	const breadcrumbItems = $derived([{ label: listLabel, href: listPath }, { label: animal.name }]);
</script>

<svelte:head>
	<title>{animal.name} | {listLabel}</title>
	<meta name="description" content={metaDescription} />
	<meta property="og:title" content="{animal.name} - {listLabel}" />
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

<!-- The hero colour is the species' own, set here rather than by a modifier class so the
	 stylesheet does not need a rule per species. -->
<section class="detail-hero" style:background={heroColour}>
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
			<!--
				This photograph is what LCP is measured by on 200 pages: it is the largest
				thing above the fold and the reason someone opened the page. The hints on
				the tag below say so.

				`eager` was already the behaviour — the attribute was absent, and absent
				means eager — but stating it is the half that survives a later edit; the
				list cards next door carry `loading` explicitly for the same reason.
				`fetchpriority="high"` is the part that was genuinely missing: without it
				the browser discovers this image at its default priority, behind the
				stylesheet and the fonts, and the same fix applied to the first list card
				in 3453d81 stopped at the listing.

				One per page, and that is the whole value of it (PERFORMANCE-v8 § 3.1): a
				second high-priority image would mean neither is prioritised. The gate is
				`check-build.js` § 4D.
			-->
			<div class="detail__image-area">
				<div class="detail__image">
					{#if !imageFailed}
						<img
							src={withBase(animal.image)}
							alt={animal.name}
							class="detail__photo"
							style={animal.imagePosition ? `object-position: ${animal.imagePosition}` : undefined}
							onerror={() => (imageFailed = true)}
							loading="eager"
							fetchpriority="high"
							decoding="sync"
						/>
					{/if}
					<div class="detail__emoji" style={imageFailed ? '' : 'display: none;'}>
						<Icon name={kind} size="10rem" />
					</div>
				</div>

				<AnimalActions {animal} {kind} />
			</div>

			<div class="detail__info">
				<div class="detail__heading">
					<h1 class="detail__name">{animal.name}</h1>

					<!--
						Beside the name, where the decision is made. It used to sit in the column
						of buttons under the photograph, which is a list of ways OFF this page —
						apply, previous, next, back to the list. Keeping an animal is not one of
						those, and the only item there that changed something in place read as a
						fifth exit.
					-->
					<AnimalFavoriteButton slug={animal.slug} />
				</div>
				<AnimalSpecs {animal} />
				<AnimalStory {animal} />
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
		/* --cat-hero / --dog-hero, never --color-primary: the primary is chosen to work as
		   a surface under its own foreground, and white on it is 2.14:1 in dark and 3.0:1
		   in winter. The hero colours are the darkened ones, and white is safe on them. */
		color: white;
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

	/*
	 * Centred against the name, not pinned to the top of its line box.
	 *
	 * `flex-start` put the 44px button at the top of a 58px line box, so its middle
	 * landed 6px above the middle of the letters and it read as floating. It was there
	 * to stop a name that wrapped from dragging the glyph down the block — a case that
	 * cannot arise: the longest name in the data is CUCUMBER, eight characters, which
	 * fits beside the button at 2rem on the narrowest screen. Guarding against it cost a
	 * visible misalignment on every page that exists.
	 */
	.detail__heading {
		display: flex;
		align-items: center;
		gap: var(--space-sm);
	}

	.detail__name {
		font-family: var(--font-accent);
		font-size: 3rem;
		font-weight: 900;
		color: var(--color-text);
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
