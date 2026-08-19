<script lang="ts">
	import { page } from '$app/state';
	import BetaLevel from '$lib/components/beta/BetaLevel.svelte';
	import { betaProgress } from '$lib/controllers/betaProgress.svelte';
	import { BETA_TABS } from '$lib/data/beta/tabs';
	import type { Coverage } from '$lib/data/beta/types';
	import { BETA_UI, pick } from '$lib/data/beta/ui';
	import { copyText } from '$lib/utils/copyText';

	/** Ukrainian for a Ukrainian reader, English for everyone else — see ui.ts. */
	const locale = $derived(page.data.locale as string);

	let activeTab = $state(BETA_TABS[0].id);
	let copied = $state(false);
	let fallback = $state('');

	const tab = $derived(BETA_TABS.find((t) => t.id === activeTab) ?? BETA_TABS[0]);

	/**
	 * Shown in this order, and it is not cosmetic (§ 3): a person spends themselves
	 * first where no machine exists, the middle level is the test backlog with names,
	 * and the last stays in the list as a control group. Order of declaration is kept
	 * inside a level — it is thematic, and sorting would scatter the sections.
	 */
	const LEVELS: Coverage[] = ['manual', 'testable', 'covered'];

	const byLevel = $derived(
		LEVELS.map((coverage) => ({
			coverage,
			checks: tab.checks.filter((check) => check.coverage === coverage)
		}))
	);

	/** Numbering runs 1..n across the whole tab, not per level. */
	const offsetOf = (index: number) =>
		byLevel.slice(0, index).reduce((sum, level) => sum + level.checks.length, 0);

	async function copyReport() {
		const report = betaProgress.report();

		if (await copyText(report)) {
			fallback = '';
			copied = true;
			setTimeout(() => (copied = false), 3000);
			return;
		}

		// § 6.2: a refused clipboard must not swallow the tester's whole session.
		fallback = report;
	}
</script>

<svelte:head>
	<title>{pick(BETA_UI.title, locale)}</title>
</svelte:head>

<section class="beta section">
	<div class="container beta__inner">
		<h1 class="beta__title">{pick(BETA_UI.title, locale)}</h1>
		<p class="beta__intro">{pick(BETA_UI.intro, locale)}</p>
		<p class="beta__hidden">{pick(BETA_UI.hidden, locale)}</p>

		<p class="beta__progress">
			{pick(BETA_UI.progress, locale)}:
			<strong data-testid="beta-progress-value"
				>{betaProgress.markedOnThisVersion} / {betaProgress.total}</strong
			>
			<span class="beta__version">v{__APP_VERSION__}</span>
		</p>

		<nav class="beta__tabs" aria-label={pick(BETA_UI.title, locale)}>
			{#each BETA_TABS as item (item.id)}
				<button
					type="button"
					class="beta__tab"
					class:beta__tab--active={item.id === activeTab}
					aria-current={item.id === activeTab ? 'true' : undefined}
					onclick={() => (activeTab = item.id)}
					data-testid="beta-tab-{item.id}-btn"
				>
					{pick(item.title, locale)}
				</button>
			{/each}
		</nav>

		<div class="beta__levels">
			{#each byLevel as level, index (level.coverage)}
				<BetaLevel
					coverage={level.coverage}
					checks={level.checks}
					offset={offsetOf(index)}
					{locale}
				/>
			{/each}
		</div>

		<div class="beta__actions">
			<button
				type="button"
				class="btn btn--primary"
				onclick={copyReport}
				data-testid="beta-report-btn"
			>
				{pick(BETA_UI.copy, locale)}
			</button>
			<button
				type="button"
				class="btn btn--secondary"
				onclick={() => betaProgress.clear()}
				data-testid="beta-clear-btn"
			>
				{pick(BETA_UI.clear, locale)}
			</button>
		</div>

		{#if copied}
			<p class="beta__hint" role="status" data-testid="beta-report-copied-hint">
				{pick(BETA_UI.copied, locale)}
			</p>
		{/if}

		{#if fallback}
			<p class="beta__hint" role="status" data-testid="beta-report-failed-hint">
				{pick(BETA_UI.copyFailed, locale)}
			</p>
			<textarea
				class="beta__fallback"
				readonly
				value={fallback}
				aria-label={pick(BETA_UI.copy, locale)}
				data-testid="beta-report-input"
			></textarea>
		{/if}
	</div>
</section>

<style>
	.beta__inner {
		display: flex;
		flex-direction: column;
		gap: var(--space-lg);
		max-width: 60rem;
	}

	.beta__title {
		font-family: var(--font-accent);
		font-size: clamp(1.6rem, 4vw, 2.4rem);
		color: var(--color-primary-on-surface);
	}

	.beta__intro,
	.beta__hidden {
		color: var(--color-text);
		line-height: 1.6;
	}

	.beta__hidden {
		color: var(--color-text-muted);
		font-size: 0.9rem;
	}

	.beta__progress {
		color: var(--color-text);
	}

	.beta__version {
		color: var(--color-text-muted);
		font-size: 0.85rem;
	}

	.beta__tabs {
		display: flex;
		flex-wrap: wrap;
		gap: var(--space-sm);
	}

	/*
	 * The active tab carries a thicker border as well as a fill: on two of the four
	 * themes the active fill and the resting surface are the same lightness, so hue
	 * alone would tell a reader nothing in greyscale (the same measurement that put a
	 * white bar in the mobile menu — PROJECT-CONTEXT § 4.19).
	 */
	.beta__tab {
		min-height: 44px;
		padding: 0 var(--space-md);
		border: 2px solid var(--color-border);
		border-radius: var(--radius-md);
		background: var(--control-surface);
		color: var(--color-text);
		cursor: pointer;
		font-weight: 600;
	}

	.beta__tab:hover {
		background: var(--control-surface-hover);
	}

	.beta__tab--active {
		border-width: 4px;
		border-color: var(--color-primary);
		font-weight: 800;
	}

	.beta__levels {
		display: flex;
		flex-direction: column;
		gap: var(--space-2xl);
	}

	.beta__actions {
		display: flex;
		flex-wrap: wrap;
		gap: var(--space-md);
	}

	.beta__hint {
		color: var(--color-primary-on-surface);
		font-weight: 600;
	}

	.beta__fallback {
		width: 100%;
		height: min(50dvh, 25rem);
		padding: var(--space-sm);
		font-family: monospace;
		font-size: 0.8rem;
		background: var(--color-bg-card);
		color: var(--color-text);
		border: 2px solid var(--color-primary);
		border-radius: var(--radius-md);
		resize: vertical;
	}
</style>
