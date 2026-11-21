<script lang="ts">
	import { browser } from '$app/environment';
	import { page } from '$app/state';
	import { debugMode } from '$lib/services/debugMode.svelte';
	import { logService } from '$lib/services/logService.svelte';
	import { copyText } from '$lib/utils/copyText';
	import { t } from '$lib/i18n';
	import { isTypingTarget } from '$lib/services/keyboard';
	import { Check, Copy } from 'lucide-svelte';
	import ServiceBadgeMenu from './ServiceBadgeMenu.svelte';

	let copied = $state(false);
	let fallback = $state('');
	let menuOpen = $state(false);
	let modalOpen = $state(false);
	let hidden = $state(false);

	const appVersion = logService.appVersion;

	const urlDebug = $derived(browser && page.url.searchParams.get('debug') === '1');
	const isVisible = $derived(urlDebug || debugMode.enabled);

	async function copyReport() {
		const report = logService.getReport();

		if (await copyText(report)) {
			fallback = '';
			copied = true;
			setTimeout(() => (copied = false), 1500);
			return;
		}

		fallback = report;
	}

	function toggleMenu(e: MouseEvent) {
		e.stopPropagation();
		menuOpen = !menuOpen;
	}

	function handleContextMenu(e: MouseEvent) {
		e.preventDefault();
		e.stopPropagation();
		menuOpen = true;
	}

	function handleWindowClick(e: MouseEvent) {
		if (!menuOpen) return;
		const target = e.target as HTMLElement | null;
		if (target?.closest('.log-fab-wrap')) return;
		menuOpen = false;
	}

	function handleWindowKeydown(e: KeyboardEvent) {
		if (isTypingTarget(e)) return;
		if (e.key === 'Escape' && menuOpen) {
			menuOpen = false;
		}
	}

	async function handleCopyReport() {
		menuOpen = false;
		await copyReport();
	}

	function handleViewErrors() {
		menuOpen = false;
		modalOpen = true;
	}

	function handleClearLogs() {
		menuOpen = false;
		logService.clear();
	}

	function handleHideBadge() {
		menuOpen = false;
		hidden = true;
	}
</script>

<svelte:window onclick={handleWindowClick} onkeydown={handleWindowKeydown} />

{#if fallback}
	<textarea
		class="log-fallback"
		readonly
		value={fallback}
		aria-label={t('a11y.copyDebugReport')}
		data-testid="debug-log-fallback-input"
	></textarea>
{/if}

{#if isVisible && !hidden}
	<div class="log-fab-wrap">
		{#if menuOpen}
			<ServiceBadgeMenu
				errorCount={logService.errorCount}
				onclick={handleCopyReport}
				onview={handleViewErrors}
				onclear={handleClearLogs}
				onhide={handleHideBadge}
			/>
		{/if}

		<button
			type="button"
			class="log-fab control-shape"
			class:log-fab--has-errors={logService.errorCount > 0}
			class:log-fab--copied={copied}
			onclick={toggleMenu}
			oncontextmenu={handleContextMenu}
			title="Меню табла — {appVersion} ({logService.errorCount} помилок)"
			aria-label={`${t('a11y.copyDebugReport')} — ${appVersion}`}
			aria-haspopup="menu"
			aria-expanded={menuOpen}
			data-testid="debug-log-copy-btn"
		>
			<div class="log-fab__icon">
				{#if copied}
					<Check size={14} class="log-fab__hint" />
				{:else if logService.errorCount > 0}
					<span class="log-fab__count"
						>{logService.errorCount > 99 ? '99+' : logService.errorCount}</span
					>
				{:else}
					<Copy size={12} class="log-fab__hint" />
				{/if}
				<span class="log-fab__version" data-testid="app-version-value">{appVersion}</span>
			</div>
		</button>
	</div>
{/if}

{#if modalOpen}
	{#await import('./ErrorLogModal.svelte') then { default: ErrorLogModal }}
		<ErrorLogModal isOpen={modalOpen} onclose={() => (modalOpen = false)} />
	{/await}
{/if}

<style>
	.log-fab-wrap {
		position: fixed;
		bottom: 16px;
		left: 16px;
		z-index: 9999;
	}

	.log-fab {
		min-height: 32px;
		padding: 0 8px;
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

	.log-fab--has-errors {
		background: #c92a2a;
		color: white;
		border-color: #7f1d1d;
	}

	.log-fab__version {
		font-size: 10px;
		font-family: monospace;
		line-height: 1;
		white-space: nowrap;
	}

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
		background: #237a35 !important;
		color: white;
		border-color: #1b5e20;
	}

	.log-fab__icon {
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 4px;
	}

	.log-fab__count {
		background: #7f1d1d;
		color: white;
		font-size: 10px;
		font-weight: 800;
		line-height: 1;
		padding: 2px 5px;
		border-radius: 8px;
	}

	@media (prefers-reduced-motion: reduce) {
		.log-fab {
			transition: none;
		}
	}

	@media (hover: none) {
		.log-fab-wrap {
			bottom: 12px;
			left: 12px;
		}

		.log-fab {
			min-height: 44px;
			padding: 0 12px;
		}

		.log-fab__version {
			font-size: 12px;
		}
	}
</style>
