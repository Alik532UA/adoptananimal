<script lang="ts">
	import { localePath } from '$lib/utils/withBase';
	import { t } from '$lib/i18n';

	interface Props {
		items: { label: string; href?: string }[];
	}

	let { items }: Props = $props();
</script>

<nav class="breadcrumbs" aria-label={t('a11y.breadcrumb')} data-testid="breadcrumb-nav">
	<ol class="breadcrumbs__list">
		<li class="breadcrumbs__item">
			<a href={localePath('/')} data-testid="breadcrumb-home-link">{t('breadcrumb.home')}</a>
		</li>
		{#each items as item, i (item.label)}
			<li class="breadcrumbs__item">
				<span class="breadcrumbs__separator">/</span>
				{#if item.href && i < items.length - 1}
					<a
						href={localePath(item.href)}
						data-testid={`breadcrumb-${item.label.toLowerCase()}-link`}>{item.label}</a
					>
				{:else}
					<span
						class="breadcrumbs__current"
						aria-current="page"
						data-testid={`breadcrumb-${item.label.toLowerCase()}-label`}>{item.label}</span
					>
				{/if}
			</li>
		{/each}
	</ol>
</nav>

<style>
	.breadcrumbs__list {
		display: flex;
		flex-wrap: wrap;
		list-style: none;
		padding: 0;
		margin: 0;
		font-size: 0.9rem;
		font-weight: 500;
	}

	.breadcrumbs__item {
		display: flex;
		align-items: center;
		color: var(--color-text-muted);
	}

	.breadcrumbs a {
		color: inherit;
		text-decoration: underline;
		text-underline-offset: 3px;
		transition: all var(--transition-fast);
	}

	.breadcrumbs a:hover {
		color: var(--color-primary);
	}

	.breadcrumbs__separator {
		margin: 0 var(--space-sm);
		opacity: 0.7;
	}

	.breadcrumbs__current {
		font-weight: 700;
		color: var(--color-text);
	}

	/* Style overrides */
	:global([data-style='minimal']) .breadcrumbs__item {
		color: var(--color-text-muted);
		text-transform: uppercase;
		font-family: var(--font-accent);
		font-size: 0.75rem;
	}

	:global([data-style='minimal']) .breadcrumbs__current {
		color: var(--color-text);
	}

	:global([data-style='playful']) .breadcrumbs {
		background: var(--color-overlay-light);
		padding: 4px 12px;
		border-radius: 12px;
		width: fit-content;
	}
</style>
