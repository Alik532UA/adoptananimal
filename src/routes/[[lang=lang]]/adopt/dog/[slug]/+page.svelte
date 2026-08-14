<script lang="ts">
	import { localePath, withBase } from '$lib/utils/withBase';
	import type { PageData } from './$types';
	import { t } from '$lib/i18n';
	import { settings } from '$lib/services/settings.svelte';
	import Breadcrumbs from '$lib/components/Breadcrumbs.svelte';
	import Icon from '$lib/components/ui/Icon.svelte';
	import { absoluteFromRoot } from '$lib/config';

	let { data }: { data: PageData } = $props();
	const animal = $derived(data.animal);
	let imageFailed = $state(false);

	const photo = $derived(absoluteFromRoot(animal.image));

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
			category: 'Dog',
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
		{ label: t('breadcrumb.dogs'), href: '/adopt/dog' },
		{ label: animal.name }
	]);
</script>

<svelte:head>
	<title>{animal.name} | {t('breadcrumb.dogs')}</title>
	<meta
		name="description"
		content="Meet {animal.name}, a {animal.breed.en} dog rescued from Ukraine. {animal.description
			.en[0]}"
	/>
	<meta property="og:title" content="{animal.name} - {t('breadcrumb.dogs')}" />
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

<section class="detail-hero detail-hero--dog">
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
							class:animal-card__photo--adopted={animal.isAdopted}
							onerror={() => (imageFailed = true)}
						/>
					{/if}
					<div class="detail__emoji" style={imageFailed ? '' : 'display: none;'}>
						<Icon name="dog" size="10rem" />
					</div>
				</div>
				{#if !animal.isAdopted}
					<a
						href={localePath(`/apply?animal=${animal.name}`)}
						class="btn btn--accent btn--lg detail__apply-btn"
						data-testid="apply-top-link"
					>
						{t('detail.applyAdoption')}
					</a>
				{/if}
			</div>

			<div class="detail__info">
				<h1 class="detail__name">{animal.name}</h1>
				<!-- <span class="badge badge--dog">{t('detail.dog')}</span> -->

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

				<div class="detail__actions">
					{#if !animal.isAdopted}
						<a
							href={localePath(`/apply?animal=${animal.name}`)}
							class="btn btn--primary btn--lg"
							data-testid="apply-bottom-link">{t('detail.applyBtn')}</a
						>
					{/if}
					<a
						href={localePath('/adopt/dog')}
						class="btn btn--secondary"
						data-testid="back-to-dogs-link"
						><Icon name="arrow-left" size="1.1rem" /> {t('detail.backDogs')}</a
					>
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

	.animal-card__photo--adopted {
		filter: grayscale(1);
	}

	.detail-hero {
		padding: var(--space-xl) 0;
		color: white;
	}

	.detail-hero--dog {
		background: var(--color-primary);
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

	.detail__actions {
		display: flex;
		gap: var(--space-md);
		flex-wrap: wrap;
		padding-top: var(--space-lg);
		border-top: none;
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
