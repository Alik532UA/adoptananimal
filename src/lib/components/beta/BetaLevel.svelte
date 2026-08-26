<script lang="ts">
	import BetaCheckRow from '$lib/components/beta/BetaCheckRow.svelte';
	import type { BetaCheck, Coverage } from '$lib/data/beta/types';
	import { BETA_UI, pick } from '$lib/data/beta/ui';

	interface Props {
		coverage: Coverage;
		checks: readonly BetaCheck[];
		/** Where this level's numbering starts, so the tab numbers run 1..n unbroken. */
		offset: number;
		locale: string;
	}

	let { coverage, checks, offset, locale }: Props = $props();
</script>

{#if checks.length > 0}
	<section class="level level--{coverage}" data-testid="beta-level-{coverage}-section">
		<!-- h2, not h3: on /beta-test-checklists the page h1 is directly above and the tab
			 strip between them is buttons, not headings — so h3 skipped a level. Caught by the
			 `heading-order` run beside the axe sweep, which exists because that rule is tagged
			 `best-practice` and the WCAG tag set never ran it. Size comes from the class. -->
		<h2 class="level__title">
			{pick(BETA_UI.levels[coverage], locale)}
			<span class="level__count">{checks.length}</span>
		</h2>

		{#if coverage === 'covered'}
			<!-- § 3: this level is the control group. A failure here is a report about the
				 test, not about the site — and that is worse news than an ordinary bug,
				 because it devalues every green run until someone looks at it. -->
			<p class="level__note">
				{locale === 'uk'
					? 'Якщо тут щось не працює — це помилка тесту, і вона важливіша за звичайний баг.'
					: 'If something here does not work, that is a defect in the test — more important than an ordinary bug.'}
			</p>
		{/if}

		<ul class="level__list">
			{#each checks as check, index (check.id)}
				<BetaCheckRow {check} number={offset + index + 1} {locale} />
			{/each}
		</ul>
	</section>
{/if}

<style>
	.level {
		display: flex;
		flex-direction: column;
		gap: var(--space-md);
	}

	.level__title {
		display: flex;
		align-items: center;
		gap: var(--space-sm);
		font-family: var(--font-accent);
		font-size: 1.1rem;
		color: var(--color-text);
	}

	/*
	 * The three levels are told apart by the weight of the bar beside them, not by
	 * colour alone: the order is the point — a person spends themselves first where no
	 * machine exists — and that order has to survive greyscale.
	 */
	.level__title::before {
		content: '';
		width: 6px;
		align-self: stretch;
		border-radius: var(--radius-full);
		background: var(--color-primary);
	}

	.level--testable .level__title::before {
		opacity: 0.6;
	}

	.level--covered .level__title::before {
		opacity: 0.3;
	}

	.level__count {
		padding: 0 var(--space-sm);
		border-radius: var(--radius-full);
		background: var(--control-surface);
		font-size: 0.85rem;
		font-weight: 700;
	}

	.level__note {
		color: var(--color-text-muted);
		font-size: 0.9rem;
	}

	.level__list {
		display: flex;
		flex-direction: column;
		gap: var(--space-md);
		list-style: none;
		padding: 0;
	}
</style>
