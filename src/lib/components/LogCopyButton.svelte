<script lang="ts">
	import { dev } from '$app/environment';
	import { logService } from '$lib/services/logService.svelte';
	import { t } from '$lib/i18n';
	import { ClipboardCheck, AlertCircle } from 'lucide-svelte';

	let copied = $state(false);

	const isVisible = $derived(dev && logService.errorCount > 0);

	function copyReport() {
		const report = logService.getReport();
		navigator.clipboard.writeText(report).then(() => {
			copied = true;
			setTimeout(() => (copied = false), 2000);
		});
	}
</script>

{#if isVisible}
	<button
		class="log-fab"
		class:log-fab--copied={copied}
		onclick={copyReport}
		title="Copy debug report ({logService.errorCount} errors)"
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
		border-radius: 50%;
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
			width: 40px;
			height: 40px;
			bottom: 12px;
			left: 12px;
		}
	}
</style>
