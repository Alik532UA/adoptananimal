<script lang="ts">
	import { dev } from '$app/environment';
	import { logService } from '$lib/services/logService.svelte';
	import { copyText } from '$lib/utils/copyText';
	import { t } from '$lib/i18n';
	import { ClipboardCheck, AlertCircle } from 'lucide-svelte';

	let copied = $state(false);
	/** The report itself, shown only when the clipboard refused it. */
	let fallback = $state('');

	const isVisible = $derived(dev && logService.errorCount > 0);

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
		class="log-fab control-shape"
		class:log-fab--copied={copied}
		onclick={copyReport}
		oncontextmenu={(e) => {
			e.preventDefault();
			logService.clear();
		}}
		title="Click to copy, right-click to clear ({logService.errorCount} errors)"
		aria-label={t('a11y.copyDebugReport')}
		data-testid="debug-log-copy-btn"
	>
		<div class="log-fab__icon">
			{#if copied}
				<ClipboardCheck size={20} />
			{:else}
				<div class="log-fab__error-badge">
					<AlertCircle size={20} />
					<span class="log-fab__count">{logService.errorCount}</span>
				</div>
			{/if}
		</div>
	</button>
{/if}

<style>
	.log-fab {
		position: fixed;
		bottom: 16px;
		left: 16px;
		width: 48px;
		height: 48px;
		background: #ef4444;
		color: white;
		border: none;
		cursor: pointer;
		display: flex;
		align-items: center;
		justify-content: center;
		box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
		z-index: 9999;
		transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
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
		transform: scale(1.1);
		background: #dc2626;
	}

	.log-fab--copied {
		background: #10b981 !important;
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

	@media (max-width: 600px) {
		.log-fab {
			/* 44px, not 40: WCAG 2.5.8 target size applies most on touch screens */
			width: 44px;
			height: 44px;
			bottom: 12px;
			left: 12px;
		}
	}
</style>
