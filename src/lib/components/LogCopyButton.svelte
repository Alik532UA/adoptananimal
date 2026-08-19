<script lang="ts">
	import { browser } from '$app/environment';
	import { page } from '$app/state';
	import { debugMode } from '$lib/services/debugMode.svelte';
	import { logService } from '$lib/services/logService.svelte';
	import { copyText } from '$lib/utils/copyText';
	import { t } from '$lib/i18n';
	import { ClipboardCheck, AlertCircle, Copy } from 'lucide-svelte';

	/**
	 * The service badge: version number, error count and report copying — ONE element.
	 *
	 * **Shape changes, position does not.** At rest it is a pill carrying the version;
	 * with errors it is a red circle carrying their count; after copying, a tick.
	 *
	 * **Visibility (DEBUGGING-v8 § 2.1, with a deviation).** In dev the badge is ALWAYS
	 * visible rather than only when errors exist, as the canon prescribes: it now carries
	 * the version number, and hiding that makes no sense — dev is exactly where it is
	 * wanted. Before this the version was nowhere on screen, so a screenshot of a bug
	 * never said which build produced it.
	 *
	 * **In production it used to be unreachable.** `dev && errorCount > 0` meant the log
	 * buffer was collected on visitors' devices and could never be retrieved — the
	 * feature existed on paper. Now there are two ways in, deliberately different in
	 * nature: `?debug=1` (works by touch, survives being sent as a link) and a run of `V`
	 * presses (for whoever is already at a keyboard, persists between sessions).
	 *
	 * **The run itself lives in the header controls, not here** — in production this
	 * component is not rendered until the gesture has fired, so a listener inside it
	 * could never see the gesture that reveals it.
	 */
	let copied = $state(false);
	/** The report itself, shown only when the clipboard refused it. */
	let fallback = $state('');

	const appVersion = logService.appVersion;

	/*
	 * `browser &&` is required, not defensive: during prerender, touching
	 * `page.url.searchParams` throws and fails the build outright. Every page here is
	 * prerendered, so this is the normal path rather than an edge case.
	 */
	const urlDebug = $derived(browser && page.url.searchParams.get('debug') === '1');
	/*
	 * `?debug=1` applies ON TOP of the stored state: a link carrying it has to reveal the
	 * badge even for somebody who previously hid it with a run of presses. Otherwise the
	 * only route available by touch could be locked out permanently.
	 */
	const isVisible = $derived(urlDebug || debugMode.enabled);

	/**
	 * DEBUGGING-v8 § 2.3 and BETA-CHECKLIST-v8 § 6.2: the copy needs a way out.
	 *
	 * `writeText` refuses for reasons that are not defects — the tab is not focused, the
	 * permission was denied, the page is not on https. Before this the promise was left
	 * unhandled: the button stayed red, the report existed NOWHERE, and the only trace
	 * was an unhandled rejection landing in the very log nobody could now read.
	 */
	async function copyReport() {
		const report = logService.getReport();

		if (await copyText(report)) {
			fallback = '';
			copied = true;
			setTimeout(() => (copied = false), 2000);
			return;
		}

		fallback = report;
	}
</script>

{#if fallback}
	<!-- Beside the button rather than in a toast: a log report is hundreds of lines, and
		 it has to be selectable, not readable. -->
	<textarea
		class="log-fallback"
		readonly
		value={fallback}
		aria-label={t('a11y.copyDebugReport')}
		data-testid="debug-log-fallback-input"
	></textarea>
{/if}

{#if isVisible}
	<button
		type="button"
		class="log-fab control-shape"
		class:log-fab--has-errors={logService.errorCount > 0}
		class:log-fab--copied={copied}
		onclick={copyReport}
		oncontextmenu={(e) => {
			e.preventDefault();
			logService.clear();
		}}
		title="Click to copy, right-click to clear — {appVersion} ({logService.errorCount} errors)"
		aria-label={`${t('a11y.copyDebugReport')} — ${appVersion}`}
		data-testid="debug-log-copy-btn"
	>
		<div class="log-fab__icon">
			{#if copied}
				<ClipboardCheck size={20} />
			{:else if logService.errorCount > 0}
				<div class="log-fab__error-badge">
					<AlertCircle size={20} />
					<span class="log-fab__count"
						>{logService.errorCount > 99 ? '!' : logService.errorCount}</span
					>
				</div>
			{:else}
				<Copy size={12} class="log-fab__hint" />
				<span class="log-fab__version" data-testid="app-version-value">{appVersion}</span>
			{/if}
		</div>
	</button>
{/if}

<style>
	.log-fab {
		position: fixed;
		bottom: 16px;
		left: 16px;
		z-index: 9999;

		/* A pill: a version number does not fit inside a 48px circle. */
		min-height: 32px;
		padding: 0 8px;

		/*
		 * `--control-surface`, not `--color-bg-card`: this sits ON a page whose
		 * background IS the card colour in some themes, and the badge has to be findable.
		 * The edge uses `--color-border-alpha` for the same reason — `--color-border` is
		 * literally `transparent` in all four themes here, so a border on it would draw
		 * nothing.
		 */
		background: var(--control-surface);
		color: var(--color-text);
		border: 2px solid var(--color-border-alpha);
		cursor: pointer;
		display: flex;
		align-items: center;
		justify-content: center;
		box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
		transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
	}

	/*
	 * With errors it becomes a square control again: in that state what matters is that
	 * something happened, not which build it happened on. The version stays in the report
	 * this same click copies.
	 */
	.log-fab--has-errors,
	.log-fab--copied {
		width: 32px;
		min-height: 32px;
		padding: 0;
	}

	/*
	 * Darker than #ef4444 for WCAG AA rather than for taste: white text on the old colour
	 * gave 3.76:1 where 4.5 is required, and it gave that in all four themes. The error
	 * count is read precisely when something has gone wrong — the worst possible
	 * candidate for "almost legible". Literals rather than theme tokens on purpose: the
	 * "there are errors" signal must look the same in every theme.
	 */
	.log-fab--has-errors {
		background: #c92a2a;
		color: white;
		border-color: #7f1d1d;
	}

	.log-fab__version {
		font-size: 10px;
		font-family: monospace;
		line-height: 1;
		/* The number is read off a screenshot, so it must not wrap. */
		white-space: nowrap;
	}

	/*
	 * The copy icon is a hint that the pill is clickable, not an action of its own — hence
	 * smaller than the number, and faded.
	 */
	.log-fab :global(.log-fab__hint) {
		opacity: 0.6;
		flex: none;
		margin-right: 4px;
	}

	.log-fallback {
		position: fixed;
		bottom: 76px;
		left: 16px;
		width: min(38rem, calc(100vw - 32px));
		height: min(40dvh, 20rem);
		z-index: 9999;
		padding: var(--space-sm);
		font-family: monospace;
		font-size: 0.75rem;
		background: var(--color-bg-card);
		color: var(--color-text);
		border: 2px solid #ef4444;
		border-radius: var(--radius-md);
		resize: none;
	}

	.log-fab:hover {
		transform: scale(1.05);
	}

	.log-fab--copied {
		background: #2f9e44 !important;
		color: white;
		border-color: #1b5e20;
	}

	.log-fab__icon {
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.log-fab__error-badge {
		display: flex;
		align-items: center;
		justify-content: center;
		position: relative;
	}

	.log-fab__count {
		position: absolute;
		top: -8px;
		right: -8px;
		background: white;
		color: #ef4444;
		font-size: 10px;
		font-weight: 800;
		width: 18px;
		height: 18px;
		border-radius: 50%;
		display: flex;
		align-items: center;
		justify-content: center;
		box-shadow: 0 0 0 2px #ef4444;
	}

	/*
	 * Size follows the INPUT METHOD, not the window width: on a 900px desktop the control
	 * would stay mouse-sized, and on a 1024px tablet it would stay touch-hostile
	 * (ACCESSIBILITY-v8 § 8, DEBUGGING-v8 § 2.2). The old rule keyed on `max-width: 600px`,
	 * which is neither.
	 */
	@media (hover: none) {
		.log-fab {
			/* 44px, not 40: WCAG 2.5.8 target size applies most on touch screens */
			min-height: 44px;
			padding: 0 12px;
			bottom: 12px;
			left: 12px;
		}

		.log-fab--has-errors,
		.log-fab--copied {
			width: 44px;
			padding: 0;
		}

		.log-fab__version {
			font-size: 12px;
		}
	}
</style>
