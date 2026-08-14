<script lang="ts">
	import { onMount, tick } from 'svelte';
	import type { Snippet } from 'svelte';
	import Icon from './Icon.svelte';

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
	let animationFrame: number;
	let resumeTimeout: ReturnType<typeof setTimeout>;
	let lastTime: number = 0;
	let virtualScrollLeft: number = 0;
	let currentSpeed: number = 0;

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

		const targetSpeed = autoScrollActive && !isInteracting ? speed : 0;

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
			} else if (isInteracting) {
				// While interacting, keep the virtual position in sync with manual scrolling
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
		if (isInteracting) {
			handleInfiniteJump();
		}
	}

	function handleWheel(e: WheelEvent) {
		if (!viewport) return;
		// If vertical scroll is stronger, convert it to horizontal
		if (Math.abs(e.deltaY) > Math.abs(e.deltaX)) {
			e.preventDefault();
			viewport.scrollLeft += e.deltaY;
			startInteraction();
			stopInteraction();
		}
	}

	function handleMouseDown(e: MouseEvent) {
		if (!viewport) return;
		isDragging = true;
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
		}
		viewport.scrollLeft = startScrollLeft - walk;
	}

	function handleMouseUp() {
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

	function scrollBy(direction: number) {
		if (!viewport) return;
		startInteraction();
		const scrollAmount = viewport.clientWidth * 0.8 * direction;
		viewport.scrollBy({ left: scrollAmount, behavior: 'smooth' });
		stopInteraction();
	}

	function handleKeyDown(e: KeyboardEvent) {
		if (e.key === 'ArrowLeft') scrollBy(-1);
		if (e.key === 'ArrowRight') scrollBy(1);
	}

	function handleClickCapture(e: MouseEvent) {
		if (isMoved) {
			e.preventDefault();
			e.stopPropagation();
		}
	}

	onMount(() => {
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

<div
	class="carousel-root"
	role="region"
	aria-roledescription="carousel"
	aria-label="Animals gallery"
	data-testid={finalTestId}
	onmouseenter={() => pauseOnHover && (autoScrollActive = false)}
	onmouseleave={() => (autoScrollActive = true)}
	onkeydown={handleKeyDown}
	onclickcapture={handleClickCapture}
>
	<button
		class="nav-btn nav-btn--prev"
		onclick={() => scrollBy(-1)}
		aria-label="Previous"
		data-testid={`${testId}-prev-btn`}
	>
		<Icon name="arrow-left" size="1.5rem" />
	</button>

	<div
		class="carousel-viewport"
		role="group"
		aria-roledescription="slide"
		style="will-change: scroll-position"
		bind:this={viewport}
		onscroll={handleScroll}
		onwheel={handleWheel}
		ontouchstart={startInteraction}
		ontouchend={stopInteraction}
		onmousedown={handleMouseDown}
		onmousemove={handleMouseMove}
		onmouseup={handleMouseUp}
		onmouseleave={handleMouseUp}
	>
		<div class="carousel-track" bind:this={content}>
			<div class="carousel-content">
				{@render children()}
			</div>
			<!-- Duplicate for infinite scroll -->
			<div class="carousel-content" aria-hidden="true">
				{@render children()}
			</div>
		</div>
	</div>

	<button
		class="nav-btn nav-btn--next"
		onclick={() => scrollBy(1)}
		aria-label="Next"
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
