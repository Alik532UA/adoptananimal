<script lang="ts">
	import { betaProgress, type Vote } from '$lib/controllers/betaProgress.svelte';
	import type { BetaCheck } from '$lib/data/beta/types';
	import { BETA_UI, pick } from '$lib/data/beta/ui';

	interface Props {
		check: BetaCheck;
		/** Drawn from the position in the list, never stored in the text (§ 2.2). */
		number: number;
		locale: string;
	}

	let { check, number, locale }: Props = $props();

	const VOTES: Vote[] = ['fail', 'weird', 'ok'];

	const mark = $derived(betaProgress.marks[check.id]);
	const stale = $derived(betaProgress.isStale(check.id));
</script>

<li class="row" data-testid="beta-check-{check.id}-item">
	<p class="row__category" data-testid="beta-check-{check.id}-category-text">
		{number}. {pick(check.category, locale)}
		{#if check.negative}
			<span class="row__boundary">{locale === 'uk' ? 'межа' : 'boundary'}</span>
		{/if}
	</p>

	<p class="row__text" data-testid="beta-check-{check.id}-text">{pick(check.text, locale)}</p>

	{#if stale}
		<p class="row__stale" data-testid="beta-check-{check.id}-stale-hint">
			{pick(BETA_UI.stale, locale)}: v{mark.version}
		</p>
	{/if}

	<div class="row__votes">
		{#each VOTES as vote (vote)}
			<button
				type="button"
				class="row__vote row__vote--{vote}"
				class:row__vote--chosen={mark?.vote === vote}
				class:row__vote--stale={mark?.vote === vote && stale}
				onclick={() => betaProgress.vote(check.id, vote)}
				aria-pressed={mark?.vote === vote}
				data-testid="beta-check-{check.id}-vote-{vote}-btn"
			>
				{pick(BETA_UI.votes[vote], locale)}
			</button>
		{/each}
	</div>
</li>

<style>
	.row {
		display: flex;
		flex-direction: column;
		gap: var(--space-sm);
		padding: var(--space-lg);
		border-radius: var(--radius-md);
		background: var(--control-surface);
	}

	.row__category {
		font-size: 0.8rem;
		font-weight: 700;
		text-transform: uppercase;
		letter-spacing: 0.04em;
		color: var(--color-primary-on-surface);
	}

	.row__boundary {
		margin-left: var(--space-xs);
		padding: 0 var(--space-xs);
		border: 1px solid var(--color-primary-on-surface);
		border-radius: var(--radius-sm);
		font-size: 0.7rem;
		letter-spacing: 0;
	}

	.row__text {
		color: var(--color-text);
		line-height: 1.5;
	}

	.row__stale {
		font-size: 0.85rem;
		font-style: italic;
		color: var(--color-text-muted);
	}

	.row__votes {
		display: flex;
		flex-wrap: wrap;
		gap: var(--space-sm);
	}

	/*
	 * State is carried by border weight and font weight as well as colour: a middle
	 * state told apart only by hue is not there at all for a reader who cannot
	 * separate hues (ACCESSIBILITY-v8 § 6, WCAG 1.4.1).
	 */
	.row__vote {
		min-height: 44px;
		padding: 0 var(--space-md);
		border: 2px solid var(--color-border);
		border-radius: var(--radius-sm);
		background: var(--color-bg-card);
		color: var(--color-text);
		cursor: pointer;
		font-size: 0.9rem;
		transition:
			border-color var(--transition-fast),
			background var(--transition-fast);
	}

	.row__vote:hover {
		border-color: var(--color-primary);
	}

	.row__vote--chosen {
		border-width: 4px;
		font-weight: 800;
		border-color: var(--color-primary);
		background: var(--color-bg-warm);
	}

	.row__vote--chosen.row__vote--fail {
		border-style: solid;
		text-decoration: underline;
		text-decoration-thickness: 2px;
	}

	.row__vote--chosen.row__vote--weird {
		border-style: dashed;
	}

	/* A mark from an older build reads as provisional rather than done. */
	.row__vote--stale {
		opacity: 0.65;
		border-style: dotted;
	}
</style>
