<script lang="ts">
	import '../app.css';
	import { onMount } from 'svelte';
	import { browser } from '$app/environment';
	import { t, resolve } from '$lib/i18n';
	import { onNavigate } from '$app/navigation';
	import { logService } from '$lib/services/logService.svelte';
	import Header from '$lib/components/Header.svelte';
	import Footer from '$lib/components/Footer.svelte';
	import LogCopyButton from '$lib/components/LogCopyButton.svelte';
	import Icon from '$lib/components/ui/Icon.svelte';

	let { children } = $props();
	let showBackToTop = $state(false);

	if (browser) {
		window.addEventListener('scroll', () => {
			showBackToTop = window.scrollY > 400;
		});
	}

	function scrollToTop() {
		window.scrollTo({ top: 0, behavior: 'smooth' });
	}

	// View Transitions support
	onNavigate((navigation) => {
		if (!document.startViewTransition) return;

		return new Promise((resolve) => {
			document.startViewTransition(async () => {
				resolve();
				await navigation.complete;
			});
		});
	});

	onMount(() => {
		const handleRejection = (event: PromiseRejectionEvent) => {
			logService.error('app', `Unhandled Promise Rejection: ${event.reason}`);
		};

		const handleError = (event: ErrorEvent) => {
			logService.error(
				'app',
				`Global Error: ${event.message} at ${event.filename}:${event.lineno}`
			);
		};

		window.addEventListener('unhandledrejection', handleRejection);
		window.addEventListener('error', handleError);

		// Performance Monitoring (Web Vitals)
		if (browser && 'PerformanceObserver' in window) {
			try {
				// LCP (Largest Contentful Paint)
				const lcpObserver = new PerformanceObserver((entryList) => {
					const entries = entryList.getEntries();
					const lastEntry = entries[entries.length - 1] as PerformanceEntry & {
						startTime: number;
					};
					logService.perf('LCP', `${lastEntry.startTime.toFixed(0)}ms`);
				});
				lcpObserver.observe({ type: 'largest-contentful-paint', buffered: true });

				// CLS (Cumulative Layout Shift)
				let clsValue = 0;
				const clsObserver = new PerformanceObserver((entryList) => {
					for (const entry of entryList.getEntries() as (PerformanceEntry & {
						value: number;
						hadRecentInput: boolean;
					})[]) {
						if (!entry.hadRecentInput) {
							clsValue += entry.value;
						}
					}
					logService.perf('CLS', clsValue.toFixed(4));
				});
				clsObserver.observe({ type: 'layout-shift', buffered: true });

				// FID (First Input Delay)
				const fidObserver = new PerformanceObserver((entryList) => {
					for (const entry of entryList.getEntries()) {
						logService.perf('FID', `${entry.duration.toFixed(0)}ms`);
					}
				});
				fidObserver.observe({ type: 'first-input', buffered: true });
			} catch {
				logService.warn('performance', 'PerformanceObserver failed to initialize');
			}
		}

		return () => {
			window.removeEventListener('unhandledrejection', handleRejection);
			window.removeEventListener('error', handleError);
		};
	});
</script>

<svelte:head>
	<meta
		name="description"
		content="Adopt an animal from Ukraine. A joint project of Notpfote & Vet Crew giving rescued dogs and cats a second chance."
	/>
	<link rel="preconnect" href="https://fonts.googleapis.com" />
	<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin="anonymous" />
</svelte:head>

<a href={resolve('#main-content')} class="skip-link">{t('a11y.skipToContent')}</a>

<Header />

<div class="site-bg"></div>

<div class="app-shell">
	<main class="main" id="main-content">
		{@render children()}
	</main>

	<Footer />
</div>

<button
	class="back-to-top"
	class:back-to-top--visible={showBackToTop}
	onclick={scrollToTop}
	aria-label="Back to top"
>
	<Icon name="arrow-up" size="1.5rem" />
</button>

<LogCopyButton />

<style>
	.app-shell {
		display: flex;
		flex-direction: column;
		min-height: 100vh;
		min-height: 100dvh;
	}

	.site-bg {
		position: fixed;
		inset: 0;
		z-index: -1;
		background-image: var(--bg-image);
		background-size: cover;
		background-position: center;
		filter: blur(5px);
		transform: scale(1.03);
		transition: background-image var(--transition-slow);
	}

	.back-to-top {
		position: fixed;
		bottom: var(--space-xl);
		right: var(--space-xl);
		width: 50px;
		height: 50px;
		border-radius: 50%;
		background: color-mix(in srgb, var(--color-primary) 50%, transparent);
		backdrop-filter: blur(var(--glass-blur));
		-webkit-backdrop-filter: blur(var(--glass-blur));
		color: white;
		border: none;
		display: flex;
		align-items: center;
		justify-content: center;
		cursor: pointer;
		box-shadow: var(--shadow-lg);
		z-index: 100;
		transition: all var(--transition-spring);
		opacity: 0;
		visibility: hidden;
	}

	.back-to-top--visible {
		opacity: 1;
		visibility: visible;
	}

	.back-to-top:hover {
		transform: translateY(-5px) scale(1.1);
		background: color-mix(in srgb, var(--color-primary-light) 70%, transparent);
		box-shadow: var(--shadow-xl);
	}

	.main {
		flex: 1;
		padding-top: 72px;
	}

	/* View Transitions effects */
	:global(::view-transition-old(root)),
	:global(::view-transition-new(root)) {
		animation-duration: 0.3s;
	}

	:global([data-style='modern']) {
		view-transition-name: root;
	}

	:global([data-style='playful']) {
		view-transition-name: root;
	}
</style>
