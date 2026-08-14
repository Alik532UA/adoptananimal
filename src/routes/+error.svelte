<script lang="ts">
	import { page } from '$app/state';
	import { t } from '$lib/i18n';
	import Icon from '$lib/components/ui/Icon.svelte';

	const status = $derived(page.status);
	const message = $derived(page.error?.message || t('error.generic'));
</script>

<svelte:head>
	<title>{status} | {t('nav.adopt')}</title>
</svelte:head>

<section class="error-page section">
	<div class="container error-content">
		<div class="error-visual">
			{#if status === 404}
				<Icon name="cat" size="8rem" class="error-icon" />
			{:else}
				<Icon name="paw" size="8rem" class="error-icon" />
			{/if}
			<span class="error-code">{status}</span>
		</div>

		<h1 class="error-title">
			{status === 404 ? t('error.notFound.title') : t('error.server.title')}
		</h1>
		<p class="error-message">{message}</p>

		<div class="error-actions">
			<a href="/" class="btn btn--primary btn--lg">
				{t('error.backHome')}
			</a>
			<button class="btn btn--secondary btn--lg" onclick={() => window.location.reload()}>
				{t('error.retry')}
			</button>
		</div>
	</div>
</section>

<style>
	.error-page {
		min-height: 70vh;
		display: flex;
		align-items: center;
		justify-content: center;
		text-align: center;
	}

	.error-content {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: var(--space-xl);
		max-width: 600px;
	}

	.error-visual {
		position: relative;
		margin-bottom: var(--space-lg);
	}

	:global(.error-icon) {
		color: var(--color-primary);
		opacity: 0.2;
		filter: blur(2px);
	}

	.error-code {
		position: absolute;
		top: 50%;
		left: 50%;
		transform: translate(-50%, -50%);
		font-size: 5rem;
		font-weight: 900;
		font-family: var(--font-accent);
		color: var(--color-primary);
		text-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
	}

	.error-title {
		font-size: 2.5rem;
		font-weight: 900;
		color: var(--color-text);
	}

	.error-message {
		font-size: 1.2rem;
		color: var(--color-text-muted);
		line-height: 1.6;
	}

	.error-actions {
		display: flex;
		gap: var(--space-md);
		flex-wrap: wrap;
		justify-content: center;
		margin-top: var(--space-lg);
	}

	@media (max-width: 480px) {
		.error-code {
			font-size: 3.5rem;
		}
		.error-title {
			font-size: 1.8rem;
		}
	}
</style>
