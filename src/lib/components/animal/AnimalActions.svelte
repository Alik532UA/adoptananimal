<script lang="ts">
	import { localePath, withBase } from '$lib/utils/withBase';
	import { t, tFormat } from '$lib/i18n';
	import Icon from '$lib/components/ui/Icon.svelte';
	import { animalService } from '$lib/services/animals';
	import type { AnimalSummary } from '$lib/data/types';

	/**
	 * Every way off an animal's page, in one place under the photograph.
	 *
	 * They used to be spread over two: two buttons beside the photograph and two more
	 * below a story long enough that whoever finished it could no longer see the first
	 * pair — so the answer was two of everything rather than one of each somewhere both
	 * could reach.
	 */
	interface Props {
		animal: AnimalSummary;
		kind: 'cat' | 'dog';
	}

	let { animal, kind }: Props = $props();

	const listPath = $derived(`/adopt/${kind}`);
	const browseAll = $derived(kind === 'cat' ? t('featured.browseCats') : t('featured.browseDogs'));

	/**
	 * The animals either side of this one, wrapping round at both ends.
	 *
	 * Only the ones still looking: offering someone who already has a home is a dead end
	 * dressed up as a suggestion. From the page of an animal who has been adopted — who
	 * is therefore not in this list at all — the two ends of it are the answer rather
	 * than nothing, because that page is exactly where someone needs a way on.
	 *
	 * Wrapping rather than stopping: a control that is there on twenty pages and missing
	 * on the twenty-first reads as a fault, not as the end of something.
	 */
	const siblings = $derived.by(() => {
		const waiting = animalService[kind === 'cat' ? 'cats' : 'dogs'].filter((a) => !a.isAdopted);
		if (waiting.length === 0) return null;

		const here = waiting.findIndex((a) => a.slug === animal.slug);
		if (here === -1) return { previous: waiting[waiting.length - 1], next: waiting[0] };
		if (waiting.length < 2) return null;

		return {
			previous: waiting[(here - 1 + waiting.length) % waiting.length],
			next: waiting[(here + 1) % waiting.length]
		};
	});
</script>

{#snippet sibling(target: AnimalSummary, back: boolean)}
	<a
		class="detail__sibling"
		class:detail__sibling--back={back}
		href={localePath(`${listPath}/${target.slug}`)}
		aria-label="{t(back ? 'detail.prevAnimal' : 'detail.nextAnimal')}: {target.name}"
		data-testid={back ? 'prev-animal-link' : 'next-animal-link'}
	>
		<Icon name={back ? 'arrow-left' : 'arrow-right'} size="1.2rem" />
		<img
			class="detail__sibling-thumb"
			src={withBase(target.image)}
			alt=""
			loading="lazy"
			decoding="async"
			width="48"
			height="48"
			style={target.imagePosition ? `object-position: ${target.imagePosition}` : undefined}
		/>
		<span class="detail__sibling-name">{target.name}</span>
	</a>
{/snippet}

<div class="detail__aside-actions">
	{#if !animal.isAdopted}
		<a
			href={localePath(`/apply?animal=${animal.name}`)}
			class="btn btn--primary btn--lg detail__apply-btn"
			data-testid="apply-top-link"
		>
			<!-- The name is inside the string, not appended to it: German and Dutch
				 want it in front, and a button that says who it is about is worth
				 more than one that could be about anyone. -->
			{tFormat('detail.applyAdoption', { name: animal.name })}
		</a>
	{/if}

	{#if siblings}
		<!-- No wording: the arrows say which way, and the face says who. The
			 direction is in each link's accessible name instead, so a screen
			 reader is told what the arrow shows. -->
		<div class="detail__siblings">
			{@render sibling(siblings.previous, true)}
			{@render sibling(siblings.next, false)}
		</div>
	{/if}

	<!--
		Last, and without an arrow.

		The same words the home page and the favourites page already use for this
		destination — a third phrase for one place is how a site starts feeling
		like several. No arrow, because the two links above it have just spent
		two arrows on "sideways"; a third pointing left would be the same symbol
		meaning "up a level", which is a different thing.
	-->
	<a href={localePath(listPath)} class="btn btn--secondary" data-testid="back-to-{kind}s-link"
		>{browseAll}</a
	>
</div>

<style>
	.detail__aside-actions {
		display: flex;
		flex-direction: column;
		gap: var(--space-sm);
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
	.detail__sibling {
		display: flex;
		align-items: center;
		justify-content: center;
		gap: var(--space-md);
		min-height: 64px;
		padding: var(--space-sm) var(--space-lg);
		border-radius: var(--radius-lg);
		font-size: 1rem;
	}

	/* The ones that are not the main action share a surface, so the accent stands alone. */
	.detail__aside-actions .btn--secondary,
	.detail__sibling {
		background: var(--color-bg-card);
		color: var(--color-text);
		box-shadow: var(--shadow-sm);
		transition:
			transform var(--transition-spring),
			box-shadow var(--transition-normal);
	}

	.detail__aside-actions .btn--secondary:hover,
	.detail__sibling:hover,
	.detail__sibling:focus-visible {
		transform: translateY(-2px);
		box-shadow: var(--shadow-lg);
		background: var(--color-bg-card-hover);
		color: var(--color-text);
	}

	/* Two of them on the row the single one used to have, so the pair takes no more room
	   than it did. */
	.detail__siblings {
		display: flex;
		gap: var(--space-sm);
	}

	.detail__sibling {
		flex: 1;
		min-width: 0;
		/* Written for the backward one — arrow, face, name — and reversed for the forward
		   one, so the arrows sit on the outside and the two mirror each other. */
		flex-direction: row-reverse;
		padding: var(--space-sm);
	}

	.detail__sibling--back {
		flex-direction: row;
	}

	.detail__sibling-thumb {
		width: 48px;
		height: 48px;
		border-radius: 50%;
		object-fit: cover;
		flex-shrink: 0;
	}

	.detail__sibling-name {
		font-family: var(--font-accent);
		font-weight: 900;
		font-size: 1rem;
		/* A long name shortens rather than pushing the face out of its own button.
		   min-width: 0 because a flex child will not shrink below its content otherwise,
		   and the ellipsis would never come. */
		min-width: 0;
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}

	.detail__apply-btn {
		width: 100%;
		text-align: center;
		/* 32px clear of what follows. The three below it are ways to look at other
		   animals; this one is the reason the page exists, and standing eight pixels off
		   them it read as the first of four rather than as its own thing.
		   Written against the row gap so the total stays 32 if that gap ever changes. */
		margin-bottom: calc(var(--space-xl) - var(--space-sm));
	}
</style>
