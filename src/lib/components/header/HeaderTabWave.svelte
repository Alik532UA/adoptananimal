<script lang="ts">
	import { dev } from '$app/environment';
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

			{#if dev}
				<!--
					dev only, and it exists so the shape can be talked about precisely: «point 4
					should rise later» instead of «the bottom moves wrong».

					Four dots, which is how many corners the shape has: two feet and the two ends
					of the plateau. The control points that bend the skirts between them are not
					on the outline, and drawing those too put a dozen dots on a 132px tab —
					nothing anyone could point at.

					The numbers come from `tabShape` itself rather than from parsing the path back
					apart: an overlay that re-derives the geometry can disagree with the shape it
					is drawn over, and then it illustrates something that is not there.
				-->
				<g class="wave-debug" data-testid="debug-wave-points-container">
					{#each indicator.points as point (point.n)}
						<g class="wave-debug__point">
							<!--
								Native SVG tooltip: no JS, and it survives the shape animating. On the
								group, so either circle triggers it.
							-->
							<title
								>{point.n} · {point.name} · x {point.x.toFixed(1)} y {point.y.toFixed(1)} · progress {scrollProgress.toFixed(
									2
								)}</title
							>
							<circle class="wave-debug__dot" cx={point.x} cy={point.y} r="3.5" />
							<!--
								The part the pointer actually meets, and the only thing here that takes
								the pointer at all. Wider than the dot because 3.5px is not a target,
								and invisible because the dot is what should be seen.
							-->
							<circle class="wave-debug__hit" cx={point.x} cy={point.y} r="10" />
						</g>
					{/each}
				</g>
			{/if}
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

	/*
	 * dev overlay. Hollow so the outline it marks stays visible through it; the number,
	 * the name, the coordinates and the current progress arrive on hover.
	 *
	 * Nothing is drawn beside the dot. Numerals sat next to each one in the first version
	 * and the ones on the plateau (y = 0) fell outside the viewBox and were clipped.
	 */
	.wave-debug__dot {
		/* Drawn only. The hit circle beside it is what the pointer meets. */
		pointer-events: none;
		fill: none;
		stroke: #ff00e0;
		stroke-width: 1.5;
	}

	/*
	 * `pointer-events` is re-enabled here and nowhere else in the overlay.
	 *
	 * The wave sits behind the label, so anything here that takes the pointer takes a
	 * click meant for the link. Ten pixels is a target a person can find; four dots on a
	 * tab this size cannot overlap at that radius.
	 */
	.wave-debug__hit {
		pointer-events: auto;
		fill: transparent;
		cursor: crosshair;
	}

	.wave-debug__point:hover .wave-debug__dot {
		stroke-width: 3;
	}

	@media (max-width: 768px) {
		/* Behind the burger there is no row of tabs, so there is nothing to point at. */
		.header__indicator,
		.header__wave {
			display: none;
		}
	}
</style>
