<script lang="ts">
	import '../app.css';
	import { t } from '$lib/i18n';
	import { absoluteFromRoot, absoluteLocale, DEFAULT_OG_IMAGE } from '$lib/config';
	import { HTML_LANG, LOCALES, DEFAULT_LOCALE } from '$lib/i18n/locales';
	import { untrack } from 'svelte';
	import { settings } from '$lib/services/settings.svelte';
	import { onNavigate } from '$app/navigation';
	import { logService } from '$lib/services/logService.svelte';
	import { webVitals } from '$lib/controllers/webVitals.svelte';
	import Header from '$lib/components/Header.svelte';
	import Footer from '$lib/components/Footer.svelte';
	import LogCopyButton from '$lib/components/LogCopyButton.svelte';
	import Toast from '$lib/components/ui/Toast.svelte';
	import Icon from '$lib/components/ui/Icon.svelte';

	let { data, children } = $props();
	let showBackToTop = $state(false);

	// The locale-free path of the current page, e.g. /adopt/cat for both /adopt/cat
	// and /uk/adopt/cat. Resolved in the load so it is available before anything renders.
	const route = $derived(data);

	// Read once, on purpose, before Header and the page render. Prerendering runs every
	// page in one process, so a singleton still holding the previous page's language
	// renders this one in it — the module-state trap from SVELTE-CORE § 5.1.
	untrack(() => settings.applyRouteLocale(data.locale));

	// Client-side navigation reuses this component, so the line above runs only once.
	$effect(() => {
		settings.applyRouteLocale(data.locale);
	});

	// One canonical per language (SEO § 2.1), built from SITE_ORIGIN — page.url.origin
	// is the placeholder host during prerender.
	const canonical = $derived(absoluteLocale(route.path, route.locale));

	// Every language of this page declares every other, itself included, plus an
	// x-default pointing at the unprefixed version. A crawler that finds one language
	// then knows the rest exist rather than treating them as duplicate content.
	const alternates = $derived(
		LOCALES.map((locale) => ({
			locale,
			hreflang: HTML_LANG[locale],
			href: absoluteLocale(route.path, locale)
		}))
	);

	// Throttled to one read per frame and removed on unmount: an unbounded scroll
	// handler runs on every wheel tick and this one outlived the component before.
	$effect(() => {
		let queued = false;

		const onScroll = () => {
			if (queued) return;
			queued = true;
			requestAnimationFrame(() => {
				showBackToTop = window.scrollY > 400;
				queued = false;
			});
		};

		window.addEventListener('scroll', onScroll, { passive: true });
		return () => window.removeEventListener('scroll', onScroll);
	});

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

	// Global error reporting. In an $effect so the listeners come and go with the layout.
	$effect(() => {
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

		return () => {
			window.removeEventListener('unhandledrejection', handleRejection);
			window.removeEventListener('error', handleError);
		};
	});

	// Three PerformanceObservers and their cleanup are logic, so they live in a
	// controller; this is just the mount point.
	$effect(() => webVitals.start());
</script>

<svelte:head>
	<meta
		name="description"
		content="Adopt an animal from Ukraine. A joint project of Notpfote & Vet Crew giving rescued dogs and cats a second chance."
	/>
	<!-- Built from SITE_ORIGIN, never from page.url.origin: during prerender the
		 latter is the placeholder host `sveltekit-prerender`. -->
	<link rel="canonical" href={canonical} />
	{#each alternates as alternate (alternate.locale)}
		<link rel="alternate" hreflang={alternate.hreflang} href={alternate.href} />
	{/each}
	<link rel="alternate" hreflang="x-default" href={absoluteLocale(route.path, DEFAULT_LOCALE)} />
	<meta property="og:url" content={canonical} />
	<meta property="og:locale" content={HTML_LANG[route.locale]} />
	<meta property="og:site_name" content={t('app.title')} />
	<meta property="og:image" content={absoluteFromRoot(DEFAULT_OG_IMAGE)} />
	<meta name="twitter:card" content="summary_large_image" />
</svelte:head>

<!-- A bare fragment on purpose: withBase() would prefix it with base and send
	 keyboard users to the home page instead of this page's content. -->
<a href="#main-content" class="skip-link">{t('a11y.skipToContent')}</a>

<Header />

<div class="site-bg"></div>

<div class="app-shell">
	<main class="main" id="main-content">
		<svelte:boundary onerror={(error) => logService.error('app', `Render error: ${error}`)}>
			{@render children()}

			<!-- The error itself is logged in onerror above; the user gets a message they
				 can act on, never a raw error string (ERROR-HANDLING § CRITICAL). -->
			{#snippet failed(_error, reset)}
				<section class="boundary section">
					<div class="container boundary__inner">
						<h1>{t('error.server.title')}</h1>
						<p>{t('error.generic')}</p>
						<button class="btn btn--primary" onclick={reset} data-testid="boundary-retry-btn">
							{t('error.retry')}
						</button>
					</div>
				</section>
			{/snippet}
		</svelte:boundary>
	</main>

	<Footer />
</div>

<button
	class="back-to-top"
	class:back-to-top--visible={showBackToTop}
	onclick={scrollToTop}
	aria-label={t('a11y.backToTop')}
>
	<Icon name="arrow-up" size="1.5rem" />
</button>

<Toast />

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
		-webkit-backdrop-filter: blur(var(--glass-blur));
		backdrop-filter: blur(var(--glass-blur));
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
		background: color-mix(in srgb, var(--color-primary-light) 70%, transparent);
		box-shadow: var(--shadow-xl);
	}

	.main {
		flex: 1;
		padding-top: 72px;
	}

	.boundary__inner {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: var(--space-lg);
		text-align: center;
		padding: var(--space-4xl) 0;
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
