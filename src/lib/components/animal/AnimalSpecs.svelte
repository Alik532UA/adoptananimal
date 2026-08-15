<script lang="ts">
	import Icon from '$lib/components/ui/Icon.svelte';
	import { t } from '$lib/i18n';
	import { settings } from '$lib/services/settings.svelte';
	import type { AnimalSummary } from '$lib/data/types';

	/** The five facts about an animal, as tiles. */
	let { animal }: { animal: AnimalSummary } = $props();
</script>

<div class="detail__specs">
	<div class="detail__spec">
		<span class="detail__spec-label">{t('detail.gender')}</span>
		<span class="detail__spec-value"
			><Icon name={animal.gender.en.toLowerCase() === 'male' ? 'male' : 'female'} size="1.1rem" />
			{animal.gender[settings.locale]}</span
		>
	</div>
	<div class="detail__spec">
		<span class="detail__spec-label">{t('detail.breed')}</span>
		<span class="detail__spec-value">{animal.breed[settings.locale]}</span>
	</div>
	<div class="detail__spec">
		<span class="detail__spec-label">{t('detail.age')}</span>
		<span class="detail__spec-value">{animal.age[settings.locale]}</span>
	</div>
	<div class="detail__spec">
		<span class="detail__spec-label">{t('detail.size')}</span>
		<span class="detail__spec-value">{animal.size[settings.locale]}</span>
	</div>
	<div class="detail__spec">
		<span class="detail__spec-label">{t('detail.color')}</span>
		<span class="detail__spec-value">{animal.color[settings.locale]}</span>
	</div>
</div>

<style>
	.detail__specs {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
		gap: var(--space-md);
	}

	.detail__spec {
		background: var(--color-bg-warm);
		border-radius: var(--radius-md);
		padding: var(--space-md);
		display: flex;
		flex-direction: column;
		gap: 4px;
		border: none;
		box-shadow: var(--shadow-sm);
	}

	.detail__spec-label {
		font-size: 0.8rem;
		font-weight: 700;
		text-transform: uppercase;
		letter-spacing: 0.05em;
		color: var(--color-text-light);
	}

	.detail__spec-value {
		font-size: 1rem;
		font-weight: 600;
		color: var(--color-text);
	}
</style>
