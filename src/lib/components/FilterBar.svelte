<script lang="ts">
	import { t } from '$lib/i18n';
	import type { FilterState } from '$lib/data/types';
	import Icon from '$lib/components/ui/Icon.svelte';

	interface Props {
		gender: string;
		size: string;
		status: string;
		search: string;
		showSize?: boolean;
		onchange: (filters: FilterState) => void;
	}

	let { gender, size, status, search, showSize = true, onchange }: Props = $props();

	// Writable $derived: tracks the prop, and typing overrides it until the prop
	// changes again. The previous $state + $effect.pre pair could drift from the URL.
	let localSearch = $derived(search);
	let debounceTimer: ReturnType<typeof setTimeout> | undefined;

	function update(field: string, value: string) {
		if (field === 'search') {
			localSearch = value;
			clearTimeout(debounceTimer);
			debounceTimer = setTimeout(() => {
				onchange({ gender, size, status, search: value });
			}, 300);
		} else {
			onchange({ gender, size, status, search: localSearch, [field]: value });
		}
	}
</script>

<div class="filter-bar">
	<div class="filter-bar__search">
		<input
			type="text"
			placeholder={t('filter.search')}
			aria-label={t('filter.search')}
			value={localSearch}
			oninput={(e) => update('search', e.currentTarget.value)}
			class="filter-input"
			data-testid="filter-search-input"
		/>
	</div>

	<div class="filter-bar__selects">
		<!-- Gender -->
		<div class="filter-group" role="group" aria-label={t('filter.gender')}>
			<span class="filter-label" aria-hidden="true">{t('filter.gender')}</span>
			<div class="filter-toggle-group">
				<button
					class="filter-toggle"
					class:filter-toggle--active={gender === ''}
					onclick={() => update('gender', '')}
					aria-pressed={gender === ''}
					data-testid="filter-gender-all-btn"
				>
					{t('filter.all')}
				</button>
				<button
					class="filter-toggle"
					class:filter-toggle--active={gender === 'male'}
					onclick={() => update('gender', 'male')}
					aria-pressed={gender === 'male'}
					data-testid="filter-gender-male-btn"
				>
					<Icon name="male" size="0.9rem" />
					{t('filter.gender.male')}
				</button>
				<button
					class="filter-toggle"
					class:filter-toggle--active={gender === 'female'}
					onclick={() => update('gender', 'female')}
					aria-pressed={gender === 'female'}
					data-testid="filter-gender-female-btn"
				>
					<Icon name="female" size="0.9rem" />
					{t('filter.gender.female')}
				</button>
			</div>
		</div>

		{#if showSize}
			<!-- Size -->
			<div class="filter-group" role="group" aria-label={t('filter.size')}>
				<span class="filter-label" aria-hidden="true">{t('filter.size')}</span>
				<div class="filter-toggle-group">
					<button
						class="filter-toggle"
						class:filter-toggle--active={size === ''}
						onclick={() => update('size', '')}
						aria-pressed={size === ''}
						data-testid="filter-size-all-btn"
					>
						{t('filter.all')}
					</button>
					<button
						class="filter-toggle"
						class:filter-toggle--active={size === 'small'}
						onclick={() => update('size', 'small')}
						aria-pressed={size === 'small'}
						data-testid="filter-size-small-btn"
					>
						{t('filter.size.small')}
					</button>
					<button
						class="filter-toggle"
						class:filter-toggle--active={size === 'medium'}
						onclick={() => update('size', 'medium')}
						aria-pressed={size === 'medium'}
						data-testid="filter-size-medium-btn"
					>
						{t('filter.size.medium')}
					</button>
					<button
						class="filter-toggle"
						class:filter-toggle--active={size === 'large'}
						onclick={() => update('size', 'large')}
						aria-pressed={size === 'large'}
						data-testid="filter-size-large-btn"
					>
						{t('filter.size.large')}
					</button>
				</div>
			</div>
		{/if}

		<!-- Status -->
		<div class="filter-group" role="group" aria-label={t('filter.status')}>
			<span class="filter-label" aria-hidden="true">{t('filter.status')}</span>
			<div class="filter-toggle-group">
				<button
					class="filter-toggle"
					class:filter-toggle--active={status === ''}
					onclick={() => update('status', '')}
					aria-pressed={status === ''}
					data-testid="filter-status-all-btn"
				>
					{t('filter.all')}
				</button>
				<button
					class="filter-toggle"
					class:filter-toggle--active={status === 'available'}
					onclick={() => update('status', 'available')}
					aria-pressed={status === 'available'}
					data-testid="filter-status-available-btn"
				>
					{t('filter.status.available')}
				</button>
				<button
					class="filter-toggle"
					class:filter-toggle--active={status === 'adopted'}
					onclick={() => update('status', 'adopted')}
					aria-pressed={status === 'adopted'}
					data-testid="filter-status-adopted-btn"
				>
					{t('filter.status.adopted')}
				</button>
			</div>
		</div>
	</div>
</div>

<style>
	.filter-bar {
		background: var(--color-bg-card);
		padding: var(--space-lg);
		border-radius: var(--radius-lg);
		box-shadow: var(--shadow-md);
		margin-bottom: var(--space-2xl);
		display: flex;
		flex-direction: column;
		gap: var(--space-lg);
		border: none;
	}

	.filter-bar__search {
		width: 100%;
	}

	.filter-input {
		width: 100%;
		padding: 12px 16px;
		border-radius: var(--radius-md);
		border: none;
		background: var(--color-bg-warm);
		color: var(--color-text);
		font-family: inherit;
		font-size: 1rem;
		transition: all var(--transition-fast);
		box-shadow: inset 0 2px 4px rgba(0, 0, 0, 0.05);
	}

	.filter-input:focus {
		outline: none;
		background: var(--color-bg-surface);
		box-shadow: 0 0 0 3px var(--color-primary-light);
	}

	.filter-bar__selects {
		display: flex;
		flex-wrap: wrap;
		gap: var(--space-xl);
	}

	.filter-group {
		display: flex;
		flex-direction: column;
		gap: var(--space-sm);
		flex: 1;
		min-width: 200px;
	}

	.filter-label {
		font-size: 0.85rem;
		font-weight: 700;
		color: var(--color-text);
		text-transform: uppercase;
		letter-spacing: 0.05em;
		font-family: var(--font-accent);
		opacity: 0.8;
	}

	.filter-toggle-group {
		display: flex;
		flex-wrap: wrap;
		gap: 6px;
	}

	.filter-toggle {
		display: inline-flex;
		align-items: center;
		gap: 6px;
		padding: 8px 14px;
		border-radius: var(--radius-sm);
		border: none;
		background: var(--color-bg-warm);
		color: var(--color-text);
		font-family: inherit;
		font-size: 0.9rem;
		cursor: pointer;
		transition: all var(--transition-fast);
		font-weight: 600;
		box-shadow: var(--shadow-sm);
	}

	.filter-toggle:hover {
		background: var(--color-bg-surface);
		transform: translateY(-1px);
	}

	.filter-toggle--active {
		background: var(--color-primary);
		color: var(--color-text-on-accent);
		box-shadow: 0 4px 12px color-mix(in srgb, var(--color-primary) 30%, transparent);
	}

	@media (max-width: 600px) {
		.filter-bar__selects {
			flex-direction: column;
			gap: var(--space-md);
		}

		.filter-group {
			width: 100%;
		}
	}
</style>
