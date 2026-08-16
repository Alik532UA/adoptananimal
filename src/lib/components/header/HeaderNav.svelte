<script lang="ts">
	import { page } from '$app/state';
	import HeaderControls from '$lib/components/header/HeaderControls.svelte';
	import HeaderMenuFooter from '$lib/components/header/HeaderMenuFooter.svelte';
	import HeaderNavLinks from '$lib/components/header/HeaderNavLinks.svelte';
	import HeaderTabWave from '$lib/components/header/HeaderTabWave.svelte';

	/**
	 * One element in two shapes: a row of tabs across the bar, and the panel the burger
	 * unfolds on a phone. Everything below is about which of the two it is; what goes
	 * inside comes from the four components it composes.
	 */
	interface Props {
		/** Whether the burger has unfolded this into the full-screen panel. */
		open: boolean;
		/** 0 while the page is at the top, 1 once the coloured band has scrolled away. */
		scrollProgress: number;
		/** Called on every link, so following one folds the panel away. */
		onNavigate: () => void;
	}

	let { open, scrollProgress, onNavigate }: Props = $props();

	/** What the wave measures the active item against. */
	let navElement: HTMLElement | undefined = $state();

	const activeColor = $derived.by(() => {
		const path = page.url.pathname;
		if (path.includes('/adopt/cat')) return 'var(--cat-hero)';
		if (path.includes('/adopt/dog')) return 'var(--dog-hero)';
		if (path.includes('/favorites')) return 'var(--cat-hero)';
		if (path.includes('/apply')) return 'var(--cat-hero)';
		return 'var(--cat-hero)';
	});
</script>

<nav
	bind:this={navElement}
	class="header__nav"
	class:header__nav--open={open}
	style="--active-tab-bg: {activeColor};"
>
	<HeaderTabWave container={navElement} {scrollProgress} />

	<HeaderNavLinks {onNavigate} />

	<HeaderControls />

	<HeaderMenuFooter {onNavigate} />
</nav>

<style>
	.header__nav {
		display: flex;
		align-items: flex-end;
		justify-content: space-between;
		flex: 1;
		height: 72px;
		position: relative;
	}

	@media (max-width: 768px) {
		.header__nav {
			display: none;
		}

		/*
		 * The height is stated rather than left to `bottom: 0`.
		 *
		 * .header carries a backdrop-filter, and that makes it the containing block for
		 * everything fixed inside it. So `top: 72px; bottom: 0` was resolved against a box
		 * 72px tall: the panel came out 64px — its own padding and nothing else — while the
		 * five items overflowed onto the page with no background behind them. The menu
		 * looked transparent, and the rule that paints it was right all along.
		 */
		.header__nav--open {
			display: flex;
			position: fixed;
			top: 72px;
			left: 0;
			right: 0;
			height: calc(100dvh - 72px);
			overflow-y: auto;
			background: var(--color-bg-card);
			flex-direction: column;
			/* The row layout spreads its items across the bar; a column of five with the
			   same rule spreads them down a whole screen. They start at the top. */
			justify-content: flex-start;
			padding: var(--space-xl);
			align-items: stretch;
			gap: var(--space-sm);
		}

		/*
		 * While the accounts panel is open, the rest of the menu steps back.
		 *
		 * The panel opens over a screen full of links and controls, and everything
		 * competed with it for attention. Dimming rather than blurring: a backdrop would
		 * have to be a fixed element, and .header carries a backdrop-filter, which makes
		 * it the containing block for anything fixed inside — the overlay would cover the
		 * header and nothing else.
		 *
		 * :global around every class it reaches for, since all three belong to child
		 * components and Svelte would otherwise prune the rule as unused.
		 */
		.header__nav:has(:global(.org-logos--revealing)) :global(.header__link),
		.header__nav:has(:global(.org-logos--revealing)) :global(.header__controls),
		.header__nav:has(:global(.org-logos--revealing)) :global(.header__nav-projects) {
			opacity: 0.5;
			transition: opacity var(--transition-normal);
		}
	}
</style>
