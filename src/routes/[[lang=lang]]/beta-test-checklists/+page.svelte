<script lang="ts">
	import { onDestroy } from 'svelte';
	import { page } from '$app/state';
	import BetaLevel from '$lib/components/beta/BetaLevel.svelte';
	import { betaProgress } from '$lib/controllers/betaProgress.svelte';
	import { BETA_TABS } from '$lib/data/beta/tabs';
	import type { Coverage } from '$lib/data/beta/types';
	import { BETA_UI, pick } from '$lib/data/beta/ui';
	import PageMeta from '$lib/components/PageMeta.svelte';
	import { copyText } from '$lib/utils/copyText';
	import { localePath } from '$lib/utils/withBase';

	/** Ukrainian for a Ukrainian reader, English for everyone else — see ui.ts. */
	const siteLocale = $derived(page.data.locale as string);

	/**
	 * МОВА ЧЕКЛИСТА ПЕРЕМИКАЄТЬСЯ ТУТ (§ 8.3, `BETA-OWN-LANG-BTN`).
	 *
	 * Пункти живуть двома мовами (§ 2.4), а інтерфейс сайту має чотири. Доти
	 * чеклист просто йшов за локаллю сторінки, і з цього виходив тупик, якого не
	 * видно з даних: людина, чий сайт відкрився нідерландською, бачила чеклист
	 * англійською й НЕ МАЛА ЧИМ перемкнути його на українську — мовний перемикач
	 * сайту дає їй чотири мови інтерфейсу, а чеклист розуміє дві.
	 *
	 * `null` означає «як на сайті»: доки кнопку не натиснули, поведінка та сама,
	 * що була, і адреса сторінки не змінюється ніколи.
	 */
	let chosenLang = $state<'uk' | 'en' | null>(null);
	const locale = $derived(chosenLang ?? (siteLocale === 'uk' ? 'uk' : 'en'));

	let activeTab = $state(BETA_TABS[0].id);

	$effect(() => {
		const tabParam = page.url.searchParams.get('tab');
		if (tabParam && BETA_TABS.some((t) => t.id === tabParam) && activeTab !== tabParam) {
			activeTab = tabParam;
		}
	});

	function selectTab(id: string) {
		activeTab = id;
		if (typeof window !== 'undefined') {
			const url = new URL(window.location.href);
			url.searchParams.set('tab', id);
			window.history.replaceState(window.history.state, '', url.href);
		}
	}

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

	/**
	 * Маршрути вкладки, які МОЖНА відкрити посиланням (§ 8.4).
	 *
	 * Динамічні сегменти (`/adopt/cat/[slug]`) відкинуто: конкретної тварини тут
	 * нема з чого взяти, а посилання, яке веде в 404, гірше за його відсутність.
	 * Канон називає цей самий випадок прямо: підставляти «перший, що трапиться»
	 * не можна — саме так сусідній проєкт отримав посилання, яке працювало лише
	 * тому, що не-кореневий маршрут у ньому був один.
	 */
	const screens = $derived(tab.routes.filter((route) => !route.includes('[')));

	/**
	 * Адреса → дискримінатор локатора: `/adopt/cat` → `adopt-cat`, корінь →
	 * `root`. Косих рисок у локаторах немає (TESTID-AND-NAMING § 1.2), а
	 * значення однозначно виходить із самої адреси, тож другим іменем, яке треба
	 * тримати узгодженим, це не стає.
	 */
	const screenTid = (route: string) => route.replace(/^\/|\/$/g, '').replace(/\//g, '-') || 'root';

	/**
	 * The timer that clears the «copied» label (§ 7.5).
	 *
	 * Kept in a handle for two reasons, and neither is theoretical. A second click
	 * within three seconds is ordinary behaviour when the reaction went unnoticed: the
	 * first timer stays alive and puts out the label the SECOND click had just lit.
	 * And leaving the checklist right after copying is the normal path — a tester
	 * copies and walks off to paste — so an unowned timer fires into a destroyed page.
	 */
	let copiedTimer: ReturnType<typeof setTimeout> | undefined;

	onDestroy(() => clearTimeout(copiedTimer));

	async function copyReport() {
		const report = betaProgress.report();

		if (await copyText(report)) {
			fallback = '';
			copied = true;
			clearTimeout(copiedTimer);
			copiedTimer = setTimeout(() => (copied = false), 3000);
			return;
		}

		// § 6.2: a refused clipboard must not swallow the tester's whole session.
		fallback = report;
	}
</script>

<PageMeta title={pick(BETA_UI.title, locale)} description={pick(BETA_UI.description, locale)} />

<!--
	Two sections, not one, and the reason is in the root layout: `.main > :first-child`
	is painted `--cat-hero` so the header tab has somewhere to land (PROJECT-CONTEXT
	§ 4.14). A single section made the whole page the hero surface, and every line of
	body text was then measured against it — axe found ten contrast failures in
	light-green alone, down to 1.18:1. The hero carries white on the accent, the body
	carries the page colours on the page ground.
-->
<section class="beta-hero">
	<div class="container">
		<h1 class="beta-hero__title">{pick(BETA_UI.title, locale)}</h1>
		<p class="beta-hero__intro">{pick(BETA_UI.intro, locale)}</p>
		<p class="beta-hero__hidden">{pick(BETA_UI.hidden, locale)}</p>
	</div>
</section>

<section class="beta section">
	<div class="container beta__inner">
		<p class="beta__progress">
			{pick(BETA_UI.progress, locale)}:
			<strong data-testid="beta-progress-value"
				>{betaProgress.markedOnThisVersion} / {betaProgress.total}</strong
			>

			<!--
				Версія була видима й доти — не було ЛОКАТОРА (§ 8.5.1,
				`BETA-VERSION-VISIBLE`). Це не формальність: підказка «позначено на
				іншій версії» на пункті має сенс лише поряд із числом поточної
				збірки, а перевірити, що число нікуди не поділося, без імені
				неможливо — рядок «v1.2.3» на сторінці нічим не відрізнити від
				будь-якого іншого числа.
			-->
			<span class="beta__version" data-testid="beta-version-text">v{__APP_VERSION__}</span>

			<!--
				ВИХІД ЗІ СТОРІНКИ (§ 8.4). Тестувальник приходить за прямим
				посиланням: сторінка навмисно поза меню (§ 4), тож ні пункта меню,
				ні історії вкладки в нього немає.
			-->
			<a class="beta__link" href={localePath('/')} data-testid="beta-home-link">
				{pick(BETA_UI.back, locale)}
			</a>

			<button
				type="button"
				class="beta__link beta__link--btn"
				onclick={() => (chosenLang = locale === 'uk' ? 'en' : 'uk')}
				data-testid="beta-lang-btn"
			>
				{pick(BETA_UI.langSwitch, locale)}
			</button>
		</p>

		<!--
			КУДИ ЙТИ ПО ЦЮ ВКЛАДКУ (§ 8.4, `BETA-SCREEN-LINKS`).

			Перелік маршрутів вкладки лежав у даних невикористаним: його читав лише
			інваріант § 5.1. Показаний той САМИЙ перелік, тож розійтися з дійсністю
			непоміченим він не може — на відміну від окремого списку «корисних
			посилань», який поповнити забувають.

			Маршрути з параметром (`/adopt/cat/[slug]`) пропускаються: підставити в
			них конкретну тварину звідси нема з чого, а посилання, яке веде в 404,
			гірше за його відсутність.
		-->
		{#if screens.length > 0}
			<div class="beta__screens" data-sveltekit-preload-data="off">
				<span class="beta__screens-label">{pick(BETA_UI.screens, locale)}</span>
				<div class="beta__screens-list">
					{#each screens as route (route)}
						<a
							class="beta__screen"
							href={localePath(route)}
							data-testid="beta-screen-{screenTid(route)}-link"
						>
							{route}
						</a>
					{/each}
				</div>
			</div>
		{/if}

		<nav class="beta__tabs" aria-label={pick(BETA_UI.title, locale)}>
			{#each BETA_TABS as item (item.id)}
				{@const tabProgress = betaProgress.progressOf(item.checks)}
				<button
					type="button"
					class="beta__tab"
					class:beta__tab--active={item.id === activeTab}
					aria-current={item.id === activeTab ? 'true' : undefined}
					onclick={() => selectTab(item.id)}
					data-testid="beta-tab-{item.id}-btn"
				>
					{pick(item.title, locale)}
					<span
						class="beta__tab-count"
						aria-label={pick(BETA_UI.tabProgress, locale)}
						data-testid="beta-tab-{item.id}-progress-text"
					>
						{tabProgress.done}/{tabProgress.total}
					</span>
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
			<!--
				Two steps, not one (§ 6.3). This is the only irreversible action on the page
				and it sits next to the button testers reach for every time; the cost is
				asymmetric — an hour of work against one extra click.
			-->
			<button
				type="button"
				class="btn btn--secondary"
				class:btn--armed={betaProgress.clearArmed}
				onclick={() => betaProgress.requestClear()}
				data-testid="beta-clear-btn"
			>
				{pick(betaProgress.clearArmed ? BETA_UI.clearConfirm : BETA_UI.clear, locale)}
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

	/* White on the accent, the same pairing every other hero on the site uses. */
	.beta-hero {
		background: var(--cat-hero);
		color: white;
		padding: var(--space-xl) 0;
	}

	.beta-hero__title {
		font-family: var(--font-accent);
		font-size: clamp(1.6rem, 4vw, 2.4rem);
		margin-bottom: var(--space-sm);
	}

	.beta-hero__intro {
		max-width: 60rem;
		line-height: 1.6;
	}

	/*
	 * No opacity, and that was measured rather than assumed. White faded to 0.85 on the
	 * winter hero (#1f66cc) blends to #dde8f7 and scores 4.42:1 — under the 4.5 this
	 * size needs, and axe said so. The neighbouring hero subtitle fades to 0.9 and
	 * passes because it is 1.25rem, i.e. large text at the 3:1 threshold. This line is
	 * smaller, so it gets the difference from size alone; solid white is 5.48:1 there.
	 */
	.beta-hero__hidden {
		margin-top: var(--space-sm);
		font-size: 0.9rem;
	}

	.beta__progress,
	.beta__screens {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		gap: var(--space-sm);
		color: var(--color-text);
	}

	.beta__screens-list {
		display: flex;
		flex-wrap: wrap;
		gap: var(--space-xs);
	}

	.beta__screen {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		min-height: 44px;
		min-width: 44px;
		padding: 0.25rem var(--space-sm);
		border-radius: var(--radius-sm);
		border: 1px solid var(--color-border);
		background: var(--control-surface);
		color: var(--color-text);
		text-decoration: none;
		font-family: monospace;
		font-size: 0.85rem;
		transition:
			background 0.15s ease,
			border-color 0.15s ease;
	}

	.beta__screen:hover {
		background: var(--control-surface-hover);
		border-color: var(--color-primary);
	}

	.beta__version {
		color: var(--color-text-muted);
		font-size: 0.85rem;
	}

	/*
	 * 44 px на дотик (ACCESSIBILITY): для тексту в рядку її дає саме
	 * `min-height` разом із `inline-flex`, а не `padding`.
	 */
	.beta__link {
		display: inline-flex;
		align-items: center;
		min-height: 44px;
		color: var(--color-link);
	}

	.beta__link--btn {
		border: 0;
		padding: 0;
		background: none;
		font: inherit;
		text-decoration: underline;
		cursor: pointer;
	}

	.beta__tabs {
		display: flex;
		flex-wrap: wrap;
		gap: var(--space-sm);
	}

	/* Tabular figures: the counters must not jitter as the tab strip updates. */
	.beta__tab-count {
		margin-inline-start: var(--space-xs);
		font-size: 0.85rem;
		font-weight: 400;
		font-variant-numeric: tabular-nums;
	}

	/*
	 * The armed erase button (§ 6.3). Not colour alone: the border thickens, the label
	 * turns bold and the text itself changes into a question — three independent signs,
	 * so the change is visible to a reader who cannot tell the colours apart.
	 */
	.btn--armed {
		border-width: 4px;
		font-weight: 800;
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
