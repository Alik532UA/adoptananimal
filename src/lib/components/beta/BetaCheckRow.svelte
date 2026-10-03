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

	const VOTES: Vote[] = ['ok', 'fail', 'unclear', 'skip'];

	const mark = $derived(betaProgress.marks[check.id]);
	const stale = $derived(betaProgress.isStale(check.id));

	/**
	 * Локатор бере `id` пункта в kebab-case (§ 5.6, `BETA-LOCATOR-PER-CHECK`).
	 *
	 * Доти `check.id` підставлявся ЯК Є, і `animal_1` давав
	 * `beta-check-animal_1-item` — назву, яку TESTID-AND-NAMING § 1.2 забороняє.
	 * Обидва правила стояли в каноні, і не падало жодне: за форму `id` і за
	 * форму локатора відповідали різні перевірки, а перехід одного в друге не
	 * дивився ніхто. Заміна `_` → `-` однозначна в обидва боки, тож локатор
	 * лишається ПОХІДНИМ від `id`, а не другим іменем.
	 */
	const tid = $derived(check.id.replace(/_/g, '-'));
</script>

<li
	class="row"
	class:vote-fail={mark?.vote === 'fail'}
	class:vote-unclear={mark?.vote === 'unclear'}
	class:vote-ok={mark?.vote === 'ok'}
	class:vote-skip={mark?.vote === 'skip'}
	data-testid="beta-check-{tid}-item"
>
	<p class="row__category" data-testid="beta-check-{tid}-category-text">
		{number}. {pick(check.category, locale)}
		{#if check.negative}
			<span class="row__boundary">{locale === 'uk' ? 'межа' : 'boundary'}</span>
		{/if}
	</p>

	<p class="row__text" data-testid="beta-check-{tid}-text">{pick(check.text, locale)}</p>

	{#if stale}
		<p class="row__stale" data-testid="beta-check-{tid}-stale-hint">
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
				data-testid="beta-vote-{tid}-{vote}-btn"
			>
				{pick(BETA_UI.votes[vote], locale)}
			</button>
		{/each}
	</div>
</li>

<style>
	.row {
		--vote-fail: light-dark(#dc2626, #ef4444);
		--vote-unclear: light-dark(#b45309, #fbbf24);
		--vote-ok: light-dark(#15803d, #22c55e);
		--vote-skip: light-dark(#0284c7, #38bdf8);

		display: flex;
		flex-direction: column;
		gap: var(--space-sm);
		padding: var(--space-lg);
		border-radius: var(--radius-md);
		border: 1px solid var(--color-border);
		background: var(--control-surface);
		transition: border 0.15s ease;
	}

	.row.vote-fail {
		border: 2px solid var(--vote-fail);
	}
	.row.vote-unclear {
		border: 2px solid var(--vote-unclear);
	}
	.row.vote-ok {
		border: 2px solid var(--vote-ok);
	}
	.row.vote-skip {
		border: 2px solid var(--vote-skip);
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

	.row__vote {
		min-height: 44px;
		padding: 0 var(--space-md);
		border: 1px solid var(--color-border);
		border-radius: var(--radius-sm);
		background: var(--color-bg-card);
		color: var(--color-text);
		cursor: pointer;
		font-size: 0.9rem;
		transition:
			border-color var(--transition-fast),
			background var(--transition-fast),
			color var(--transition-fast);
	}

	.row__vote--ok {
		background: color-mix(in srgb, var(--color-bg-card), var(--vote-ok) 8%);
		border-color: color-mix(in srgb, var(--color-border), var(--vote-ok) 35%);
	}
	.row__vote--ok:hover {
		background: color-mix(in srgb, var(--color-bg-card), var(--vote-ok) 14%);
		border-color: var(--vote-ok);
	}

	.row__vote--fail {
		background: color-mix(in srgb, var(--color-bg-card), var(--vote-fail) 8%);
		border-color: color-mix(in srgb, var(--color-border), var(--vote-fail) 35%);
	}
	.row__vote--fail:hover {
		background: color-mix(in srgb, var(--color-bg-card), var(--vote-fail) 14%);
		border-color: var(--vote-fail);
	}

	.row__vote--unclear {
		background: color-mix(in srgb, var(--color-bg-card), var(--vote-unclear) 8%);
		border-color: color-mix(in srgb, var(--color-border), var(--vote-unclear) 35%);
	}
	.row__vote--unclear:hover {
		background: color-mix(in srgb, var(--color-bg-card), var(--vote-unclear) 14%);
		border-color: var(--vote-unclear);
	}

	.row__vote--skip {
		background: color-mix(in srgb, var(--color-bg-card), var(--vote-skip) 8%);
		border-color: color-mix(in srgb, var(--color-border), var(--vote-skip) 35%);
	}
	.row__vote--skip:hover {
		background: color-mix(in srgb, var(--color-bg-card), var(--vote-skip) 14%);
		border-color: var(--vote-skip);
	}

	.row__vote--chosen {
		border-width: 4px;
		font-weight: 800;
	}

	.row__vote--chosen.row__vote--ok {
		border-color: var(--vote-ok);
		color: var(--vote-ok);
		background: color-mix(in srgb, var(--color-bg-card), var(--vote-ok) 18%);
	}
	.row__vote--chosen.row__vote--fail {
		border-color: var(--vote-fail);
		color: var(--vote-fail);
		background: color-mix(in srgb, var(--color-bg-card), var(--vote-fail) 18%);
	}
	.row__vote--chosen.row__vote--unclear {
		border-color: var(--vote-unclear);
		color: var(--vote-unclear);
		background: color-mix(in srgb, var(--color-bg-card), var(--vote-unclear) 18%);
	}
	.row__vote--chosen.row__vote--skip {
		border-color: var(--vote-skip);
		color: var(--vote-skip);
		background: color-mix(in srgb, var(--color-bg-card), var(--vote-skip) 18%);
	}

	/* A mark from an older build reads as provisional rather than done. */
	.row__vote--stale {
		opacity: 0.65;
		border-style: dotted;
	}
</style>
