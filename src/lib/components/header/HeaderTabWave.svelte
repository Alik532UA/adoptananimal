<script lang="ts">
	import { page } from '$app/state';
	import { tabShape } from '$lib/utils/tabWave';

	/**
	 * The coloured shape that sits behind whichever nav item is current.
	 *
	 * Its own component because none of this is navigation: the nav decides what is
	 * active, and everything here is about drawing a shape at a measured position and
	 * flattening it as the page moves. Splitting it also puts the one piece that reads
	 * the DOM in a file of its own.
	 */
	interface Props {
		/**
		 * What the active item is measured against — the nav this is rendered inside.
		 * Undefined until the nav is in the DOM, which is why every read of it is guarded.
		 */
		container: HTMLElement | undefined;
		/** 0 while the page is at the top, 1 once the coloured band has scrolled away. */
		scrollProgress: number;
	}

	let { container, scrollProgress }: Props = $props();

	let indicatorX = $state(0);
	let activeWidth = $state(132);
	let indicatorVisible = $state(false);
	let isMounted = $state(false);

	// Measuring is the only part that touches the DOM; the shape itself is derived,
	// so it follows both the active tab and the scroll without a second code path.
	const indicator = $derived(tabShape(activeWidth, scrollProgress));

	function measureIndicator() {
		if (!container) return;

		const activeEl = container.querySelector<HTMLElement>(
			'.header__link--active, .header__logo--active'
		);

		const activeRect = activeEl?.getBoundingClientRect();

		// Zero width means the nav is collapsed behind the burger, where there is no tab
		// to point at. Drawing one anyway produced a wave for an element nobody could see.
		if (!activeEl || !activeRect || activeRect.width === 0) {
			indicatorVisible = false;
			return;
		}

		const containerRect = container.getBoundingClientRect();

		activeWidth = activeRect.width;
		indicatorX = activeRect.left - containerRect.left + activeRect.width / 2;
		indicatorVisible = true;
	}

	$effect(() => {
		const _ = page.url.pathname;
		measureIndicator();
		if (!isMounted && indicatorVisible) {
			requestAnimationFrame(() => {
				isMounted = true;
			});
		}
	});

	$effect(() => {
		window.addEventListener('resize', measureIndicator);
		return () => window.removeEventListener('resize', measureIndicator);
	});

	/*
	 * Measured again on any change to the bar, not only on a change of address.
	 *
	 * Which item is active is derived from the pathname *and* the locale — HeaderNavLinks
	 * compares the URL against `localePath(href)`, and that reads the locale. On a language
	 * change the two arrive a beat apart: for one render the new `/uk/adopt/cat` is matched
	 * against the old locale's `/adopt/cat`, nothing is active, and the wave correctly hides
	 * itself. Then the locale catches up, the active item comes back — and the wave does
	 * not, because the only thing it was watching had already finished changing. It stayed
	 * hidden for as long as the page was open, which left the current tab as pale text on
	 * pale ground.
	 *
	 * Watching the bar itself needs no list of the reasons its contents can move: the
	 * favourites count appearing beside its label widens that tab too, and a webfont
	 * arriving late rewidths all of them.
	 */
	$effect(() => {
		if (!container) return;

		const observer = new MutationObserver((records) => {
			// The wave is drawn inside the bar, so its own output is a change to the bar.
			// Ignoring those keeps the callback from feeding itself.
			const ownDoing = records.every((record) =>
				(record.target as Element).parentElement?.closest?.('.header__indicator')
			);
			if (!ownDoing) measureIndicator();
		});

		observer.observe(container, {
			subtree: true,
			childList: true,
			characterData: true,
			attributes: true,
			attributeFilter: ['class']
		});

		return () => observer.disconnect();
	});
</script>

{#if indicatorVisible}
	<div
		class="header__indicator"
		class:header__indicator--animated={isMounted}
		style="transform: translate3d({indicatorX}px, 0, 0);"
		aria-hidden="true"
	>
		<svg
			class="header__wave"
			viewBox="0 0 {indicator.totalWidth} 48"
			style="width: {indicator.totalWidth}px; left: -{indicator.totalWidth / 2}px;"
		>
			<path d={indicator.path} fill="var(--active-tab-bg)" />
		</svg>
	</div>
{/if}

<style>
	.header__indicator {
		position: absolute;
		bottom: 0;
		left: 0;
		height: 48px;
		width: 0;
		pointer-events: none;
		z-index: 1;
		will-change: transform;
	}

	.header__indicator--animated {
		transition: transform 0.4s cubic-bezier(0.25, 1, 0.5, 1);
	}

	@media (prefers-reduced-motion: reduce) {
		.header__indicator--animated,
		.header__wave,
		.header__wave path {
			transition: none;
		}
	}

	.header__wave {
		position: absolute;
		bottom: 0;
		height: 48px;
		pointer-events: none;
		transition:
			width 0.4s cubic-bezier(0.25, 1, 0.5, 1),
			left 0.4s cubic-bezier(0.25, 1, 0.5, 1);
	}

	.header__wave path {
		transition: d 0.4s cubic-bezier(0.25, 1, 0.5, 1);
	}

	@media (max-width: 768px) {
		/* Behind the burger there is no row of tabs, so there is nothing to point at. */
		.header__indicator,
		.header__wave {
			display: none;
		}
	}
</style>
