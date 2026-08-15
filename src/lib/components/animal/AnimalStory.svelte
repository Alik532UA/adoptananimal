<script lang="ts">
	import { t } from '$lib/i18n';
	import { settings } from '$lib/services/settings.svelte';
	import type { AnimalDetail } from '$lib/data/types';

	/** The animal's own account of itself — the longest reading on the site. */
	let { animal }: { animal: AnimalDetail } = $props();
</script>

<div class="detail__story">
	<h2 class="detail__story-title">{t('detail.myStory')}</h2>
	{#each animal.description[settings.locale] || animal.description.en as paragraph, index (index)}
		<p class="detail__story-text">{paragraph}</p>
	{/each}
</div>

<style>
	.detail__story {
		display: flex;
		flex-direction: column;
		gap: var(--space-md);
		/* A surface of its own. This is the longest stretch of reading on the site and it
		   sat directly on the page's photograph — legible in the sense that the contrast
		   maths passed, and hard work in the sense that every line had a different thing
		   behind it. */
		padding: var(--space-xl);
		border-radius: var(--radius-lg);
		background: var(--color-bg-card);
		box-shadow: var(--shadow-sm);
	}

	.detail__story-title {
		font-family: var(--font-accent);
		font-size: 1.5rem;
		font-weight: 700;
		color: var(--color-primary-dark);
	}

	.detail__story-text {
		color: var(--color-text-muted);
		line-height: 1.8;
		font-size: 1rem;
	}

	/*
	 * A doorway to the next animal, rather than only a way back to the list.
	 *
	 * Its own row under the buttons: it is a different kind of thing from "apply" and
	 * "back", and lined up beside them it read as a third button of equal weight.
</style>
