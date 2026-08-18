<script lang="ts">
	import Icon from '$lib/components/ui/Icon.svelte';
	import { normaliseGender } from '$lib/data/filters';
	import { ageDisplay, ageInMonths } from '$lib/data/age';
	import { t, tPlural } from '$lib/i18n';
	import { clock } from '$lib/services/clock.svelte';
	import { settings } from '$lib/services/settings.svelte';
	import type { AnimalSummary } from '$lib/data/types';

	/** The five facts about an animal, as tiles. */
	let { animal }: { animal: AnimalSummary } = $props();

	/**
	 * The data says 'male (castrated)', not 'male', so this cannot be an equality
	 * check — that read every castrated male as female and drew Venus next to the
	 * word "male". `normaliseGender` is the same function the filters use, and it
	 * returns null rather than guessing, which here means no icon at all.
	 */
	const genderIcon = $derived(normaliseGender(animal.gender.en));

	/** Worked out from `bornOn` against today, not read from the file — see age.ts. */
	const age = $derived(ageDisplay(ageInMonths(animal.bornOn, clock.now)));
</script>

<div class="detail__specs">
	<div class="detail__spec">
		<span class="detail__spec-label">{t('detail.gender')}</span>
		<span class="detail__spec-value"
			>{#if genderIcon}<Icon name={genderIcon} size="1.1rem" />{/if}
			{animal.gender[settings.locale]}</span
		>
	</div>
	<div class="detail__spec">
		<span class="detail__spec-label">{t('detail.breed')}</span>
		<span class="detail__spec-value">{animal.breed[settings.locale]}</span>
	</div>
	<div class="detail__spec">
		<span class="detail__spec-label">{t('detail.age')}</span>
		<span class="detail__spec-value">{tPlural(`age.${age.unit}`, age.value)}</span>
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
		grid-template-columns: repeat(auto-fill, minmax(min(180px, 100%), 1fr));
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
