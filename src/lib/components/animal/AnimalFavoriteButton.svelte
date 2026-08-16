<script lang="ts">
	import { t } from '$lib/i18n';
	import { settings } from '$lib/services/settings.svelte';
	import { flyToFavorites } from '$lib/utils/flyToFavorites';
	import Icon from '$lib/components/ui/Icon.svelte';

	/**
	 * Keeping an animal, as a glyph beside its name.
	 *
	 * Its own component rather than markup inside AnimalProfile, and the split is real
	 * rather than mechanical: everything here — the round target, the label that waits
	 * for a hover, the reduced-motion rule — is about this one control, and it shares no
	 * class with the page around it. Nothing is left behind in the parent's style block,
	 * where the scope could not reach it (SVELTE-UI § 3.5) — the trap that makes most
	 * extractions a bad idea.
	 *
	 * (Written without the literal tag on purpose: a `<`style`>` inside a comment in here
	 * ends the script element as far as the parser is concerned, and the whole file then
	 * fails to compile with "`<`script`>` was left open" pointing at the last line.)
	 *
	 * Icon only, following the two side buttons in the footer: the label is a real span,
	 * so it is the accessible name and the visible text at once and a screen reader is
	 * never told one thing while the screen shows another.
	 */
	interface Props {
		slug: string;
	}

	let { slug }: Props = $props();

	const saved = $derived(settings.isFavorite(slug));

	/**
	 * Which side the label opens on, decided by measuring rather than by a breakpoint.
	 *
	 * Neither side works everywhere, and that is not a guess — it is what the two of them
	 * measure at, with the longest name in the data:
	 *
	 *   right  runs past the window at 320–400px, and again at 900px, where the
	 *          two-column layout starts the text column at x=766
	 *   left   fits at every width, and covers the animal's name while it is up
	 *
	 * So the rule is the one FLUID-SIZING § 5 gives for anything anchored to a trigger:
	 * prefer the side that reads first, then pull it back into the window when that side
	 * has no room. Right when there is space for it, left when there is not — and the
	 * name is only covered on the narrow screens where nothing else would fit.
	 *
	 * Measured on hover and focus rather than once, because the answer changes with the
	 * window and this is the moment it is needed.
	 */
	let flipped = $state(false);
	let button = $state<HTMLButtonElement | undefined>();
	let label = $state<HTMLElement | undefined>();

	function chooseSide() {
		if (!button || !label) return;
		const box = button.getBoundingClientRect();
		// offsetWidth, not the rect: the rect is affected by the scale on :hover.
		const needed = label.offsetWidth + 8;
		flipped = box.right + needed > window.innerWidth;
	}
</script>

<button
	type="button"
	class="detail__fav control-shape"
	class:detail__fav--saved={saved}
	class:detail__fav--flipped={flipped}
	bind:this={button}
	onpointerenter={chooseSide}
	onfocus={chooseSide}
	aria-pressed={saved}
	onclick={(event) => {
		const adding = !saved;
		settings.toggleFavorite(slug);
		// Only on the way in: sending hearts to a counter something has just left would
		// say the opposite of what happened.
		if (adding) flyToFavorites(event.currentTarget);
	}}
	data-testid="detail-favorite-btn"
>
	<span class="detail__fav-label" bind:this={label}
		>{t(saved ? 'detail.inFavorites' : 'detail.addFavorite')}</span
	>
	<Icon name={saved ? 'heart-filled' : 'heart'} size="1.4rem" class={saved ? 'text-danger' : ''} />
</button>

<style>
	.detail__fav {
		position: relative;
		flex-shrink: 0;
		display: inline-flex;
		align-items: center;
		justify-content: center;
		/* WCAG 2.5.8: the target stays 44 even though the glyph is 1.4rem. */
		width: 44px;
		height: 44px;
		border: none;
		background: var(--control-surface);
		color: var(--color-text);
		cursor: pointer;
		transition:
			background var(--transition-fast),
			transform var(--transition-fast);
	}

	.detail__fav:hover,
	.detail__fav:focus-visible {
		background: var(--control-surface-hover);
		transform: scale(1.08);
	}

	.detail__fav-label {
		position: absolute;
		/* Beside the glyph, not beneath it — underneath put the label over the first row
		   of specifications, where it read as a label for those. Right by default; the
		   script above flips it when the window has no room on that side. */
		left: calc(100% + var(--space-sm));
		top: 50%;
		translate: 0 -50%;
		padding: 4px 10px;
		border-radius: var(--radius-sm);
		background: var(--color-bg-card);
		color: var(--color-text);
		box-shadow: var(--shadow-md);
		font-size: 0.8rem;
		font-weight: 600;
		white-space: nowrap;
		opacity: 0;
		pointer-events: none;
		transition: opacity var(--transition-fast);
		z-index: 3;
	}

	.detail__fav--flipped .detail__fav-label {
		left: auto;
		right: calc(100% + var(--space-sm));
	}

	.detail__fav:hover .detail__fav-label,
	.detail__fav:focus-visible .detail__fav-label {
		opacity: 1;
	}

	@media (prefers-reduced-motion: reduce) {
		.detail__fav,
		.detail__fav-label {
			transition: none;
		}

		.detail__fav:hover,
		.detail__fav:focus-visible {
			transform: none;
		}
	}
</style>
