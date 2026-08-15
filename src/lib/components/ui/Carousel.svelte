<script lang="ts">
	import { onMount, tick } from 'svelte';
	import type { Snippet } from 'svelte';
	import Icon from './Icon.svelte';
	import { t } from '$lib/i18n';

	interface Props {
		children: Snippet;
		speed?: number; // pixels per frame
		pauseOnHover?: boolean;
		testId?: string;
	}

	let { children, speed = 40, pauseOnHover = true, testId = 'ui-carousel' }: Props = $props();

	let viewport: HTMLElement;
	let content: HTMLElement;
	let isInteracting = $state(false);
	let isDragging = false;
	let isMoved = false;
	let startX: number;
	let startScrollLeft: number;
	let autoScrollActive = $state(true);
	// The clone exists only to make the scroll seamless, so it is not worth doubling
	// the prerendered HTML for. It appears once the component is running in a browser.
	let mounted = $state(false);
	let animationFrame: number;
	let resumeTimeout: ReturnType<typeof setTimeout>;
	let lastTime: number = 0;
	let virtualScrollLeft: number = 0;
	let currentSpeed: number = 0;
	/**
	 * Which way it drifts on its own: 1 right, -1 left.
	 *
	 * Set from the last thing the visitor did. Someone scrolling back to a card they
	 * passed does not want the carousel pulling the other way the moment they let go.
	 */
	let direction = $state(1);

	const finalTestId = $derived(testId.endsWith('-container') ? testId : `${testId}-container`);

	function step(timestamp: number) {
		if (!lastTime) {
			lastTime = timestamp;
			animationFrame = requestAnimationFrame(step);
			return;
		}

		// Cap deltaTime to avoid jumps after tab backgrounding
		const deltaTime = Math.min(timestamp - lastTime, 64) / 1000;
		lastTime = timestamp;

		const targetSpeed = autoScrollActive && !isInteracting ? speed * direction : 0;

		// Modern exponential smoothing (lerp) for speed transitions
		// This provides a much more natural and "premium" feel than linear acceleration
		const lambda = 8.0; // Smoothing factor
		currentSpeed += (targetSpeed - currentSpeed) * (1 - Math.exp(-lambda * deltaTime));

		if (viewport) {
			if (!isInteracting && Math.abs(currentSpeed) > 0.1) {
				virtualScrollLeft += currentSpeed * deltaTime;

				// Optimized infinite jump: keep virtualScrollLeft within [0.5 * half, 1.5 * half]
				if (content) {
					const halfWidth = content.offsetWidth / 2;
					if (halfWidth > 0) {
						while (virtualScrollLeft > halfWidth * 1.5) virtualScrollLeft -= halfWidth;
						while (virtualScrollLeft < halfWidth * 0.5) virtualScrollLeft += halfWidth;
					}
				}

				viewport.scrollLeft = virtualScrollLeft;
			} else {
				/*
				 * Anything that is not us moving it: a drag, the wheel, the native scroll
				 * a trackpad produces, or simply standing still.
				 *
				 * This used to sync only `if (isInteracting)`, and interaction ends three
				 * seconds after the last event. Scroll the carousel by hand, wait, then take
				 * the pointer away, and the drift resumed from a position recorded before
				 * the scroll — the carousel jumped back to where it had been. There is one
				 * source of truth for where the track is, and it is the element.
				 */
				virtualScrollLeft = viewport.scrollLeft;
			}
		}
		animationFrame = requestAnimationFrame(step);
	}

	function handleInfiniteJump() {
		if (!viewport || !content) return;
		const halfWidth = content.offsetWidth / 2;
		if (halfWidth <= 0) return;

		// Seamlessly wrap around if the user scrolls past the buffer zones
		if (viewport.scrollLeft > halfWidth * 1.5) {
			viewport.scrollLeft -= halfWidth;
			virtualScrollLeft = viewport.scrollLeft;
		} else if (viewport.scrollLeft < halfWidth * 0.5) {
			viewport.scrollLeft += halfWidth;
			virtualScrollLeft = viewport.scrollLeft;
		}
	}

	function handleScroll() {
		// Not gated on isInteracting any more: a trackpad's two-finger swipe scrolls the
		// element natively and fires nothing else, so the wrap never happened and the
		// track ran off its own end.
		if (!autoScrollActive || isInteracting) {
			handleInfiniteJump();
		}
	}

	function handleWheel(e: WheelEvent) {
		if (!viewport) return;

		/*
		 * Which axis the wheel meant.
		 *
		 * Shift+wheel is the standard way to scroll sideways, and browsers disagree on
		 * how to report it: some swap the axes and send deltaX, some leave it in deltaY
		 * and set shiftKey. Reading whichever is non-zero covers both without asking
		 * which browser this is. Before, shift+wheel fell through to the native scroll,
		 * which moved the track without telling this component — so the drift resumed
		 * from its own stale idea of the position and undid it.
		 */
		const sideways = e.shiftKey ? e.deltaX || e.deltaY : e.deltaX;
		const delta = sideways || e.deltaY;
		if (!delta) return;

		e.preventDefault();
		viewport.scrollLeft += delta;
		// The drift picks up where the visitor left off, in the direction they went.
		direction = Math.sign(delta);
		startInteraction();
		stopInteraction();
	}

	function handleMouseDown(e: MouseEvent) {
		if (!viewport) return;
		isDragging = true;
		// Cleared here as well as on release, so a value left behind by a gesture that
		// never ended cannot outlive the next press.
		isMoved = false;
		startX = e.pageX - viewport.offsetLeft;
		startScrollLeft = viewport.scrollLeft;
		startInteraction();
		viewport.style.cursor = 'grabbing';
	}

	function handleMouseMove(e: MouseEvent) {
		if (!isDragging || !viewport) return;
		e.preventDefault();
		const x = e.pageX - viewport.offsetLeft;
		const walk = (x - startX) * 1.5;
		if (Math.abs(x - startX) > 5) {
			isMoved = true;
			// Dragging content leftwards means moving forwards through it.
			direction = walk < 0 ? 1 : -1;
		}
		viewport.scrollLeft = startScrollLeft - walk;
	}

	function handleMouseUp() {
		if (!isDragging) return;
		isDragging = false;
		if (viewport) viewport.style.cursor = 'grab';
		stopInteraction();
		setTimeout(() => {
			isMoved = false;
		}, 50);
	}

	function startInteraction() {
		isInteracting = true;
		clearTimeout(resumeTimeout);
	}

	function stopInteraction() {
		resumeTimeout = setTimeout(() => {
			isInteracting = false;
		}, 3000); // Resume auto-scroll after 3 seconds of inactivity
	}

	function scrollBy(towards: number) {
		if (!viewport) return;
		startInteraction();
		direction = towards;
		const scrollAmount = viewport.clientWidth * 0.8 * towards;
		viewport.scrollBy({ left: scrollAmount, behavior: 'smooth' });
		stopInteraction();
	}

	function handleKeyDown(e: KeyboardEvent) {
		if (e.key === 'ArrowLeft') scrollBy(-1);
		if (e.key === 'ArrowRight') scrollBy(1);
	}

	/**
	 * Takes every interactive descendant out of the tab order. Used on the cloned
	 * half of the track, which is aria-hidden and must therefore hold nothing tabbable.
	 */
	function untabbable(node: HTMLElement) {
		const apply = () => {
			for (const el of node.querySelectorAll<HTMLElement>(
				'a, button, input, select, textarea, [tabindex]'
			)) {
				el.tabIndex = -1;
			}
		};

		apply();
		const observer = new MutationObserver(apply);
		observer.observe(node, { childList: true, subtree: true });

		return () => observer.disconnect();
	}

	function handleClickCapture(e: MouseEvent) {
		if (isMoved) {
			e.preventDefault();
			e.stopPropagation();
		}
	}

	onMount(() => {
		mounted = true;

		const init = async () => {
			await tick();
			if (viewport && content) {
				const halfWidth = content.offsetWidth / 2;
				// Start from the middle of the second half to allow immediate back-scroll
				viewport.scrollLeft = halfWidth;
				virtualScrollLeft = halfWidth;
			}
		};
		init();

		animationFrame = requestAnimationFrame(step);
		return () => {
			cancelAnimationFrame(animationFrame);
			clearTimeout(resumeTimeout);
		};
	});
</script>

<!--
	The release is heard on the window, not on the track.

	Press a card and drag, and the browser starts its own drag of the link or the image
	inside it — at which point mousemove and mouseup stop arriving here entirely. The
	track was told the gesture had begun and never told it had ended: isDragging stayed
	true, and isMoved with it, and isMoved is what the click handler below uses to swallow
	the click that ends a drag. So every click inside the carousel was cancelled from then
	on, for as long as the page was open. On the home page the carousel is most of the
	first screen, so the whole page looked frozen.

	Two fixes, because either alone leaves a hole: the window ends the gesture wherever the
	button is released, and dragstart is refused so the browser's own drag never takes the
	events away in the first place.
-->
<svelte:window onmouseup={handleMouseUp} onblur={handleMouseUp} />

<!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
<!-- Pointer and focus handlers pause auto-scroll (WCAG 2.2.2 Pause, Stop, Hide).
	 Arrow keys are handled here because keydown bubbles up from the nav buttons,
	 which are the keyboard entry point into the carousel. -->
<div
	class="carousel-root"
	role="region"
	aria-roledescription="carousel"
	aria-label={t('carousel.label')}
	data-testid={finalTestId}
	onmouseenter={() => pauseOnHover && (autoScrollActive = false)}
	onmouseleave={() => (autoScrollActive = true)}
	onfocusin={() => (autoScrollActive = false)}
	onfocusout={() => (autoScrollActive = true)}
	onkeydown={handleKeyDown}
	onclickcapture={handleClickCapture}
>
	<button
		class="nav-btn nav-btn--prev"
		onclick={() => scrollBy(-1)}
		aria-label={t('carousel.prev')}
		data-testid={`${testId}-prev-btn`}
	>
		<Icon name="arrow-left" size="1.5rem" />
	</button>

	<!-- svelte-ignore a11y_no_static_element_interactions -->
	<!-- Drag-to-scroll on a natively scrollable element: the pointer handlers add an
		 affordance, they are not the only way to reach the content (arrows, wheel,
		 native scrolling and the nav buttons all work). -->
	<div
		class="carousel-viewport"
		style="will-change: scroll-position"
		bind:this={viewport}
		onscroll={handleScroll}
		onwheel={handleWheel}
		ontouchstart={startInteraction}
		ontouchend={stopInteraction}
		onmousedown={handleMouseDown}
		onmousemove={handleMouseMove}
		onmouseup={handleMouseUp}
		ondragstart={(e) => e.preventDefault()}
	>
		<div class="carousel-track" bind:this={content}>
			<div class="carousel-content">
				{@render children()}
			</div>
			<!-- Duplicate for infinite scroll. It is hidden from assistive tech, so its
				 links must leave the tab order too — aria-hidden wrapped around tabbable
				 elements is a WCAG 4.1.2 failure. Pointer users can still click them. -->
			{#if mounted}
				<div class="carousel-content" aria-hidden="true" {@attach untabbable}>
					{@render children()}
				</div>
			{/if}
		</div>
	</div>

	<button
		class="nav-btn nav-btn--next"
		onclick={() => scrollBy(1)}
		aria-label={t('carousel.next')}
		data-testid={`${testId}-next-btn`}
	>
		<Icon name="arrow-right" size="1.5rem" />
	</button>
</div>

<style>
	.carousel-root {
		position: relative;
		width: 100%;
		display: flex;
		align-items: center;
	}

	.carousel-viewport {
		overflow-x: auto;
		width: 100%;
		scrollbar-width: none;
		-ms-overflow-style: none;
		cursor: grab;
		/* Priority to horizontal scroll for touch */
		touch-action: pan-x;
		scroll-behavior: auto; /* Managed by JS for auto, smooth for buttons */
	}

	.carousel-viewport::-webkit-scrollbar {
		display: none;
	}

	.carousel-track {
		display: flex;
		width: max-content;
	}

	.carousel-content {
		display: flex;
		gap: var(--space-lg);
		padding: var(--space-md) var(--space-lg);
	}

	.nav-btn {
		position: absolute;
		top: 50%;
		transform: translateY(-50%);
		z-index: 10;
		background: var(--color-bg-card);
		color: var(--color-primary);
		border: none;
		width: 44px;
		height: 44px;
		border-radius: 50%;
		display: flex;
		align-items: center;
		justify-content: center;
		cursor: pointer;
		opacity: 0;
		transition: all var(--transition-normal);
		box-shadow: var(--shadow-md);
	}

	.carousel-root:hover .nav-btn {
		opacity: 1;
	}

	.nav-btn--prev {
		left: 10px;
	}
	.nav-btn--next {
		right: 10px;
	}

	.nav-btn:hover {
		background: var(--color-primary);
		color: white;
		transform: translateY(-50%) scale(1.1);
		box-shadow: var(--shadow-lg);
	}

	@media (max-width: 768px) {
		.nav-btn {
			display: none;
		}
		.carousel-content {
			gap: var(--space-md);
			padding: var(--space-md) 0;
		}
	}

	:global([data-style='playful']) .nav-btn {
		box-shadow: var(--shadow-md);
	}
	:global([data-style='playful']) .nav-btn:active {
		transform: translateY(-50%) scale(0.95);
		box-shadow: var(--shadow-sm);
	}
</style>
