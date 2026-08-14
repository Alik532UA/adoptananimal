<script lang="ts">
	import '../app.css';
	import { t } from '$lib/i18n';
	import { absoluteFromRoot, absoluteLocale, DEFAULT_OG_IMAGE } from '$lib/config';
	import { HTML_LANG, LOCALES, DEFAULT_LOCALE } from '$lib/i18n/locales';
	import { untrack } from 'svelte';
	import { settings } from '$lib/services/settings.svelte';
	import { onNavigate } from '$app/navigation';
	import { browser } from '$app/environment';
	import { logService } from '$lib/services/logService.svelte';
	import { scrollbar } from '$lib/services/scrollbar.svelte';
	import { webVitals } from '$lib/controllers/webVitals.svelte';
	import Header from '$lib/components/Header.svelte';
	import Footer from '$lib/components/Footer.svelte';
	import LogCopyButton from '$lib/components/LogCopyButton.svelte';
	import Toast from '$lib/components/ui/Toast.svelte';
	import PageScrollbar from '$lib/components/ui/PageScrollbar.svelte';
	import Minimap from '$lib/components/ui/Minimap.svelte';
	import ScrollbarContextMenu from '$lib/components/ui/ScrollbarContextMenu.svelte';
	import Icon from '$lib/components/ui/Icon.svelte';

	let { data, children } = $props();
	let showBackToTop = $state(false);

	// The locale-free path of the current page, e.g. /adopt/cat for both /adopt/cat
	// and /uk/adopt/cat. Resolved in the load so it is available before anything renders.
	const route = $derived(data);

	/**
	 * The parallax background's own geometry.
	 *
	 * PARALLAX_DIVISOR is how much slower it goes than the page. The height follows from
	 * it: over a page that scrolls `maxScroll`, the image travels a third of that, so it
	 * has to be a viewport tall plus that third or it runs out at the bottom.
	 */
	const PARALLAX_DIVISOR = 3;
	let bgHeight = $state(0);
	let bgShift = $state(0);

	$effect(() => {
		if (!browser) return;

		let queued = false;
		const apply = () => {
			const viewport = window.innerHeight;
			const maxScroll = Math.max(document.documentElement.scrollHeight - viewport, 0);
			bgHeight = viewport + maxScroll / PARALLAX_DIVISOR;
			bgShift = window.scrollY / PARALLAX_DIVISOR;
		};

		// One read per frame. Without this the handler runs on every scroll event, and
		// reading scrollHeight in it forces a layout each time.
		const onScroll = () => {
			if (queued) return;
			queued = true;
			requestAnimationFrame(() => {
				apply();
				queued = false;
			});
		};

		apply();
		window.addEventListener('scroll', onScroll, { passive: true });
		// The page's height changes for more reasons than a resize: images arrive, a
		// filter empties the list, the carousel appears once it has been shuffled.
		const observer = new ResizeObserver(onScroll);
		observer.observe(document.documentElement);

		return () => {
			window.removeEventListener('scroll', onScroll);
			observer.disconnect();
		};
	});

	/**
	 * The class that hides the native scrollbar has exactly one owner: this effect
	 * (SCROLLBAR-v8 § 2.3).
	 *
	 * Left to the drawing components, switching modes races — the incoming one adds the
	 * class, then the outgoing one's cleanup runs and takes it back off, and the page
	 * shows both a custom bar and the system one.
	 */
	$effect(() => {
		if (!browser) return;
		document.documentElement.classList.toggle('has-custom-scrollbar', scrollbar.hidesNative);
	});

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

<div class="site-bg" style="--bg-height: {bgHeight}px; --bg-shift: {bgShift}px;"></div>

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

<PageScrollbar />
<Minimap />

<!-- At the root, not inside the bars: the minimap has overflow: hidden and would clip
	 it, and the menu is shared by all four modes — after a switch the component that
	 opened it disappears and would take the menu with it. -->
<ScrollbarContextMenu />

<Toast />

<LogCopyButton />

<style>
	.app-shell {
		display: flex;
		flex-direction: column;
		min-height: 100vh;
		min-height: 100dvh;
	}

	/*
	 * The page's image, moving at a third of the page's speed.
	 *
	 * Held still it read as a photograph behind glass; moving with the content it would
	 * not be a background at all. A third is enough for the content to look like it
	 * travels over something rather than on top of it.
	 *
	 * Height and offset both come from the script, because neither is expressible here:
	 * how far it has to travel is a third of how far the page scrolls, and that is a
	 * property of the page. Sized exactly rather than guessed at generously, so the
	 * image never runs out from under the last screenful.
	 */
	.site-bg {
		position: fixed;
		top: 0;
		left: 0;
		right: 0;
		height: var(--bg-height);
		z-index: -1;
		/*
		 * Two layers in one element: the tint first, the photograph under it.
		 *
		 * Not a second element and not a filter. A separate overlay would need its own
		 * stacking, its own parallax transform and its own reduced-motion rule, all
		 * duplicated to stay in step with this one; a filter would tint the whole thing
		 * rather than lay a colour over it, and there is no filter that means "50% of
		 * this exact colour". A gradient between two identical stops is a solid fill,
		 * and background-image takes as many layers as it is given.
		 */
		background-image: linear-gradient(var(--bg-tint), var(--bg-tint)), var(--bg-image);
		background-size: cover;
		background-position: center;
		filter: blur(5px);
		transform: translate3d(0, calc(var(--bg-shift) * -1), 0) scale(1.03);
		transition: background-image var(--transition-slow);
		will-change: transform;
	}

	/* Parallax is one of the effects that makes motion sickness worse, and it is
	   decoration — the image stays, it simply stops travelling. */
	@media (prefers-reduced-motion: reduce) {
		.site-bg {
			height: 100vh;
			transform: scale(1.03);
		}
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

	/*
	 * The hero colour the header's active tab flows into, on whatever section a page
	 * opens with.
	 *
	 * Here rather than on each page: the header draws its tab on every route, so a page
	 * that forgets this is a page where the tab looks broken, and that is not something
	 * a new page should have to know. Every page that already opens with a hero declares
	 * the same colour on it, so this changes nothing there — it fills in for the pages
	 * that open with something else.
	 *
	 * The whole section, not a band of fixed height. A band ends in the middle of
	 * whatever it lands on, and a colour that stops halfway down a row of cards reads as
	 * a rendering fault. Ending at the section boundary reads as a decision.
	 */
	.main > :global(:first-child) {
		background-color: var(--cat-hero);
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
