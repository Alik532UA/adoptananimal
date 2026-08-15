<script lang="ts">
	import { localePath, withBase } from '$lib/utils/withBase';
	import type { Animal } from '$lib/data/animals';
	import { t } from '$lib/i18n';
	import { settings } from '$lib/services/settings.svelte';
	import Icon from '$lib/components/ui/Icon.svelte';

	interface Props {
		animal: Animal;
		/** Set on the first card above the fold: it is the LCP element and must not lazy-load. */
		priority?: boolean;
	}

	let { animal, priority = false }: Props = $props();

	let imageFailed = $state(false);
	let typeUrl = $derived(animal.type === 'cat' ? 'cat' : 'dog');
</script>

<a
	href={localePath(`/adopt/${typeUrl}/${animal.slug}`)}
	class="animal-card"
	class:animal-card--adopted={animal.isAdopted}
	id="card-{animal.slug}"
	data-testid="animal-card-{animal.slug}-card"
>
	<div
		class="animal-card__image {animal.type === 'cat'
			? 'animal-card__image--cat'
			: 'animal-card__image--dog'}"
	>
		{#if animal.isAdopted}
			<div class="animal-card__adopted-badge">
				{t('filter.status.adopted')}
			</div>
		{/if}
		{#if !imageFailed}
			<img
				src={withBase(animal.image)}
				alt="{t('a11y.animalPhoto')} {animal.name}"
				class="animal-card__photo"
				style={animal.imagePosition ? `object-position: ${animal.imagePosition}` : undefined}
				onerror={() => (imageFailed = true)}
				loading={priority ? 'eager' : 'lazy'}
				fetchpriority={priority ? 'high' : 'auto'}
				decoding={priority ? 'sync' : 'async'}
				width="400"
				height="400"
			/>
		{/if}
		<div class="animal-card__emoji" style={imageFailed ? '' : 'display: none;'} aria-hidden="true">
			<Icon name={animal.type} size="5rem" />
		</div>
		<div class="animal-card__overlay" aria-hidden="true">
			<span class="animal-card__view"
				>{t('detail.viewProfile')} <Icon name="arrow-right" size="1.1rem" /></span
			>
		</div>
		<button
			class="animal-card__fav"
			class:animal-card__fav--active={settings.isFavorite(animal.slug)}
			onclick={(e) => {
				e.preventDefault();
				e.stopPropagation();
				settings.toggleFavorite(animal.slug);
			}}
			aria-label="{t('a11y.toggleFavorite')} {animal.name}"
			data-testid="animal-card-{animal.slug}-favorite-btn"
		>
			<Icon
				name={settings.isFavorite(animal.slug) ? 'heart-filled' : 'heart'}
				size="1.25rem"
				class={settings.isFavorite(animal.slug) ? 'text-danger' : ''}
			/>
		</button>
	</div>
	<div class="animal-card__body">
		<div class="animal-card__header">
			<h3 class="animal-card__name">{animal.name}</h3>
			<!--
			<Badge variant={animal.type === 'cat' ? 'cat' : 'dog'}>
				{t(animal.type === 'cat' ? 'detail.cat' : 'detail.dog')}
			</Badge>
			-->
		</div>
		<div class="animal-card__details">
			<span class="animal-card__detail" title={animal.gender[settings.locale]}>
				<Icon
					name={animal.gender.en.toLowerCase() === 'male' ? 'male' : 'female'}
					size="0.9rem"
					class="animal-card__detail-icon"
				/>
				<span
					class="animal-card__detail-text"
					class:text-xs={animal.gender[settings.locale].length > 12}
				>
					{animal.gender[settings.locale]}
				</span>
			</span>
			<span class="animal-card__detail" title={animal.breed[settings.locale]}>
				<Icon name="breed" size="0.9rem" class="animal-card__detail-icon" />
				<span
					class="animal-card__detail-text"
					class:text-xs={animal.breed[settings.locale].length > 12}
				>
					{animal.breed[settings.locale]}
				</span>
			</span>
			<span class="animal-card__detail" title={animal.age[settings.locale]}>
				<Icon name="age" size="0.9rem" class="animal-card__detail-icon" />
				<span
					class="animal-card__detail-text"
					class:text-xs={animal.age[settings.locale].length > 12}
				>
					{animal.age[settings.locale]}
				</span>
			</span>
			<span class="animal-card__detail" title={animal.color[settings.locale]}>
				<Icon name="color" size="0.9rem" class="animal-card__detail-icon" />
				<span
					class="animal-card__detail-text"
					class:text-xs={animal.color[settings.locale].length > 12}
				>
					{animal.color[settings.locale]}
				</span>
			</span>
		</div>
	</div>
</a>

<style>
	.animal-card {
		display: flex;
		flex-direction: column;
		background: var(--color-bg-card);
		opacity: 1;
		-webkit-backdrop-filter: blur(var(--glass-blur));
		backdrop-filter: blur(var(--glass-blur));
		border-radius: var(--radius-lg);
		overflow: hidden;
		box-shadow: var(--shadow-md);
		transition: all var(--transition-spring);
		text-decoration: none;
		color: inherit;
		position: relative;
		height: 100%;
	}

	/* No outline, on any state: the shadow already separates the card from the page, and
	   an edge on top of it was one line too many. The hover reads through the lift and
	   the deeper shadow instead. */
	.animal-card:hover {
		transform: translateY(-8px) scale(1.02);
		box-shadow: var(--shadow-xl);
	}

	/* Owner's call: the photo stays in colour and the whole card sits at 50%.
	   Greyscale read as mourning for animals that found a home, which is the opposite
	   of the message. The cost is that the text fades with the card — see
	   PROJECT-CONTEXT.md § 4.11 — and it is why the carousel now shows only a few of
	   them. Hover brings the card back to full strength for reading. */
	.animal-card--adopted {
		opacity: 0.5;
		background: var(--color-bg-card);
		box-shadow: var(--shadow-sm);
	}

	.animal-card--adopted:hover,
	.animal-card--adopted:focus-within {
		opacity: 1;
		transform: translateY(-8px) scale(1.02);
		box-shadow: var(--shadow-md);
	}

	.animal-card__image {
		position: relative;
		aspect-ratio: 4 / 3;
		background: var(--color-bg-surface);
		display: flex;
		align-items: center;
		justify-content: center;
		overflow: hidden;
	}

	.animal-card__image--cat {
		background: linear-gradient(45deg, var(--cat-card-bg), var(--color-bg-surface));
	}

	.animal-card__image--dog {
		background: linear-gradient(45deg, var(--dog-card-bg), var(--color-bg-surface));
	}

	.animal-card__adopted-badge {
		position: absolute;
		top: 50%;
		left: 50%;
		transform: translate(-50%, -50%) rotate(-7deg);
		transition: transform var(--transition-spring);
		background: var(--color-success);
		/* Its own token: --color-text-on-accent is measured against --color-primary and
		   does not carry over to the success green. */
		color: var(--color-text-on-success);
		padding: 8px 20px;
		border-radius: var(--radius-md);
		font-size: 1.1rem;
		font-weight: 900;
		font-family: var(--font-accent);
		text-transform: uppercase;
		z-index: 10;
		box-shadow: 0 6px 20px rgba(0, 0, 0, 0.25);
		letter-spacing: 0.05em;
		pointer-events: none;
		white-space: nowrap;
		border: 2px solid rgba(255, 255, 255, 0.6);
	}

	.animal-card__emoji {
		font-size: 5rem;
		transition: transform var(--transition-spring);
		filter: drop-shadow(0 4px 8px rgba(0, 0, 0, 0.2));
	}

	.animal-card:hover .animal-card__emoji {
		transform: scale(1.2) rotate(-10deg);
	}

	.animal-card__overlay {
		position: absolute;
		inset: 0;
		background: linear-gradient(
			to top,
			color-mix(in srgb, var(--color-primary) 90%, transparent),
			transparent
		);
		opacity: 0;
		display: flex;
		align-items: flex-end;
		justify-content: center;
		padding-bottom: var(--space-xl);
		transition: opacity var(--transition-normal);
	}

	.animal-card:hover .animal-card__overlay {
		opacity: 1;
	}

	.animal-card__view {
		color: white;
		font-weight: 800;
		font-size: 1rem;
		font-family: var(--font-accent);
		padding: 10px 20px;
		background: var(--glass-bg);
		border-radius: var(--radius-full);
		-webkit-backdrop-filter: blur(var(--glass-blur));
		backdrop-filter: blur(var(--glass-blur));
		transform: translateY(20px);
		transition: transform var(--transition-spring);
		box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
		border: none;
	}

	.animal-card:hover .animal-card__view {
		transform: translateY(0);
	}

	/*
	 * The badge lifts out of the way of the label that arrives under it.
	 *
	 * "View profile" rises from the bottom of the card on hover and, on a card this
	 * short, lands on the corner of "ADOPTED". Moving the badge up rather than the label
	 * down keeps the label where it is on every other card, and the badge goes back the
	 * moment the pointer leaves — it is a reaction to the hover, not a second layout.
	 */
	.animal-card:hover .animal-card__adopted-badge {
		transform: translate(-50%, calc(-50% - 26px)) rotate(-7deg);
	}

	@media (prefers-reduced-motion: reduce) {
		.animal-card__adopted-badge {
			transition: none;
		}
	}

	.animal-card__fav {
		position: absolute;
		top: 12px;
		right: 12px;
		width: 44px;
		height: 44px;
		border-radius: 50%;
		background: var(--glass-bg);
		-webkit-backdrop-filter: blur(var(--glass-blur));
		backdrop-filter: blur(var(--glass-blur));
		color: white;
		display: flex;
		align-items: center;
		justify-content: center;
		font-size: 1.5rem;
		box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
		border: none;
		cursor: pointer;
		z-index: 20;
		transition: all var(--transition-spring);
	}

	.animal-card__fav:hover {
		transform: scale(1.2);
		background: white;
		color: var(--color-error);
	}

	.animal-card__fav--active {
		background: white;
		color: var(--color-error);
	}

	.animal-card__body {
		padding: var(--space-xl);
		display: flex;
		flex-direction: column;
		gap: var(--space-md);
		background: transparent;
		flex-grow: 1;
	}

	.animal-card__header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		gap: var(--space-md);
	}

	.animal-card__name {
		font-family: var(--font-accent);
		font-size: 1.5rem;
		font-weight: 800;
		color: var(--color-text);
		letter-spacing: -0.02em;
	}

	.animal-card__details {
		display: flex;
		flex-wrap: wrap;
		gap: 8px;
		margin-top: auto;
		max-height: 80px; /* Limit to roughly two rows of tags */
		overflow: hidden;
	}

	.animal-card__detail {
		display: inline-flex;
		align-items: center;
		gap: 6px;
		font-size: 0.85rem;
		font-weight: 600;
		color: var(--color-text-muted);
		background: var(--color-bg-surface);
		padding: 6px 10px;
		border-radius: var(--radius-md);
		border: none;
		transition: all var(--transition-fast);
		min-height: 34px;
		flex-grow: 1; /* Allow to grow but keep content-based width base */
		flex-basis: auto;
		max-width: 100%;
		box-shadow: var(--shadow-sm);
	}

	.animal-card__detail-text {
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
	}

	.animal-card__detail-text.text-xs {
		font-size: 0.75rem;
	}

	.animal-card:hover .animal-card__detail {
		background: var(--color-bg-warm);
		color: var(--color-text);
	}

	.animal-card__photo {
		width: 100%;
		height: 100%;
		object-fit: cover;
		transition: transform 0.8s cubic-bezier(0.2, 1, 0.3, 1);
	}

	.animal-card:hover .animal-card__photo {
		transform: scale(1.1);
	}
</style>
