<script lang="ts">
	import { localePath } from '$lib/utils/withBase';
	import { t } from '$lib/i18n';
	import Icon from '$lib/components/ui/Icon.svelte';
	import HeaderNav from '$lib/components/header/HeaderNav.svelte';
	import { clamp01, SETTLE_DISTANCE } from '$lib/utils/tabWave';

	/**
	 * The bar itself: what it looks like, how far the page has moved under it, and
	 * whether the burger has the nav unfolded. What is inside it belongs to HeaderNav.
	 */
	let mobileMenuOpen = $state(false);

	// One name rather than three booleans: opening a menu closes the others by
	// construction, instead of by remembering to reset the other two every time.
	function toggleMenu() {
		mobileMenuOpen = !mobileMenuOpen;
	}

	function closeMenu() {
		mobileMenuOpen = false;
	}

	/**
	 * 0 while the page is at the top, 1 once the coloured band has scrolled away.
	 *
	 * Read here rather than in the nav because the bar's own shadow is the other thing
	 * that fades in along it — one listener, one number, two things drawn from it.
	 */
	let scrollProgress = $state(0);

	// One read per frame: the shape is recomputed on every scroll event otherwise, and
	// this one runs while the user is dragging the page.
	$effect(() => {
		let queued = false;

		const onScroll = () => {
			if (queued) return;
			queued = true;
			requestAnimationFrame(() => {
				scrollProgress = clamp01(window.scrollY / SETTLE_DISTANCE);
				queued = false;
			});
		};

		onScroll();
		window.addEventListener('scroll', onScroll, { passive: true });
		return () => window.removeEventListener('scroll', onScroll);
	});
</script>

<header class="header" style="--header-shadow: {scrollProgress};">
	<div class="header__inner">
		<!-- The bar's own wordmark, shown only once the nav has gone behind the burger.
			 The nav carries a second one, which is a nav item and styled as one. -->
		<a
			href={localePath('/')}
			class="header__logo header__logo--mobile"
			onclick={closeMenu}
			data-testid="header-logo-mobile-link"
		>
			<Icon name="paw" size="1.75rem" class="header__logo-icon" />
			<span class="header__logo-text">{t('nav.adopt')}</span>
		</a>

		<HeaderNav open={mobileMenuOpen} {scrollProgress} onNavigate={closeMenu} />

		<button
			class="header__burger"
			onclick={toggleMenu}
			aria-label={t('a11y.toggleMenu')}
			aria-expanded={mobileMenuOpen}
			data-testid="mobile-menu-burger-btn"
		>
			<Icon name="menu" size="1.5rem" />
		</button>
	</div>
</header>

{#if mobileMenuOpen}
	<div class="header__overlay" onclick={closeMenu} role="presentation"></div>
{/if}

<style>
	.header {
		position: fixed;
		top: 0;
		left: 0;
		right: 0;
		z-index: 1000;
		background: var(--header-bg);
		-webkit-backdrop-filter: blur(16px);
		backdrop-filter: blur(16px);
		border-bottom: none;
		transition: all var(--transition-normal);

		/* The default the inline style above overrides on every frame. Declared rather
		   than written as a var() fallback: a fallback would keep working the day the
		   inline style stops being set, and the shadow would simply never appear. */
		--header-shadow: 0;
	}

	/*
	 * The shadow fades in as the page moves, on the same 0..1 the tab shape uses.
	 *
	 * At the top there is none, deliberately: the active tab and the band below it are
	 * one colour and one shape there, and a shadow drawn across the join is a line
	 * through the middle of it. By the time there is anything to cast a shadow onto,
	 * the tab has closed into a rounded shape that owes nothing to what is behind it.
	 *
	 * On a pseudo-element rather than the header, so the strength is an opacity — a
	 * box-shadow cannot be interpolated from a bare number without color-mix on a
	 * calc() percentage, which is a lot of machinery for a fade.
	 */
	.header::after {
		content: '';
		position: absolute;
		inset: 0;
		pointer-events: none;
		box-shadow: var(--shadow-lg);
		opacity: var(--header-shadow);
	}

	/* Where the backdrop cannot be blurred the bar has to carry itself, otherwise the
	   page scrolls through it. Worth having even in Chromium: the minifier drops the
	   unprefixed property, so the blur is not guaranteed to survive the build. */
	@supports not ((backdrop-filter: blur(1px)) or (-webkit-backdrop-filter: blur(1px))) {
		.header {
			background: var(--color-bg-card);
		}
	}

	.header__inner {
		display: flex;
		align-items: flex-end;
		justify-content: space-between;
		height: 72px;
		position: relative;
		width: 100%;
		padding: 0 var(--space-xl);
		gap: var(--space-xl);
	}

	/*
	 * Self-contained, on the modifier rather than on `.header__logo`.
	 *
	 * The other wordmark is a nav item and takes nearly everything from `.header__link`,
	 * which lives with it in HeaderNavLinks. This one is not a nav item and has no such
	 * rule behind it, so what it looks like is stated here in full.
	 */
	.header__logo--mobile {
		display: none;
		align-items: center;
		gap: var(--space-sm);
		font-family: var(--font-accent);
		font-weight: 800;
		font-size: 1.25rem;
		color: var(--color-primary);
		text-decoration: none;
		position: relative;
		z-index: 2;
		transition: color 0.3s ease;
	}

	.header__logo--mobile:hover {
		color: var(--color-primary-light);
	}

	/* :global because the class is handed to an Icon, and because both wordmarks wear
	   it — this bar's and the nav's. */
	:global(.header__logo-icon) {
		font-size: 1.75rem;
		transition: transform var(--transition-spring);
	}

	.header__logo--mobile:hover :global(.header__logo-icon) {
		transform: scale(1.2) rotate(15deg);
	}

	/*
	 * One glyph, not three drawn bars.
	 *
	 * The bars carried an `open` class that no rule ever acted on, so the promise of
	 * folding into a cross was in the markup and nowhere else — and three spans with
	 * a five-pixel gap sit at whatever weight the gap happens to give them, next to
	 * a row of icons drawn at a stroke width of two.
	 *
	 * 44px square: the button is the only way into the menu on a phone, and it is
	 * pressed with a fingertip.
	 */
	.header__burger {
		display: none;
		align-items: center;
		justify-content: center;
		width: 44px;
		height: 44px;
		background: none;
		border: none;
		color: var(--color-text);
		cursor: pointer;
	}

	@media (max-width: 768px) {
		.header__inner {
			align-items: center;
			padding: 0 var(--space-lg);
			gap: var(--space-sm);
		}
		.header__logo--mobile {
			display: inline-flex;
		}
		.header__burger {
			display: flex;
		}
	}
</style>
