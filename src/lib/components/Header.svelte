<script lang="ts">
	import { localePath, withBase } from '$lib/utils/withBase';
	import { page } from '$app/state';
	import { t, type TranslationKey } from '$lib/i18n';
	import { settings, type Locale, type SiteStyle, type Theme } from '$lib/services/settings.svelte';
	import { base } from '$app/paths';
	import { splitLocale } from '$lib/i18n/locales';
	import Icon from '$lib/components/ui/Icon.svelte';
	import type { IconName } from '$lib/components/ui/icons';
	import DropdownMenu from '$lib/components/ui/DropdownMenu.svelte';
	import { clamp01, SETTLE_DISTANCE, tabShape } from '$lib/utils/tabWave';

	let mobileMenuOpen = $state(false);

	// One name rather than three booleans: opening a menu closes the others by
	// construction, instead of by remembering to reset the other two every time.
	let openMenu = $state<'theme' | 'style' | 'lang' | null>(null);

	const locales: { id: Locale; label: string; flags: string[] }[] = [
		{ id: 'en', label: 'English', flags: ['/images/flags/en.svg'] },
		{ id: 'uk', label: 'Українська', flags: ['/images/flags/uk.svg'] },
		{ id: 'de', label: 'Deutsch', flags: ['/images/flags/de.svg', '/images/flags/at.svg'] },
		{ id: 'nl', label: 'Nederlands', flags: ['/images/flags/nl.svg'] }
	];

	const styles: {
		id: SiteStyle;
		labelKey: TranslationKey;
		icon: 'sparkles' | 'minimal' | 'playful';
	}[] = [
		{ id: 'modern', labelKey: 'style.modern', icon: 'sparkles' },
		{ id: 'minimal', labelKey: 'style.minimal', icon: 'minimal' },
		{ id: 'playful', labelKey: 'style.playful', icon: 'playful' }
	];

	const themes: {
		id: Theme;
		labelKey: TranslationKey;
		icon: 'moon' | 'sun' | 'idea' | 'winter';
	}[] = [
		{ id: 'dark', labelKey: 'theme.dark', icon: 'moon' },
		{ id: 'light-green', labelKey: 'theme.light-green', icon: 'sun' },
		{ id: 'orange-purple', labelKey: 'theme.orange-purple', icon: 'idea' },
		{ id: 'winter', labelKey: 'theme.winter', icon: 'winter' }
	];

	function toggleMenu() {
		mobileMenuOpen = !mobileMenuOpen;
	}

	function closeMenu() {
		mobileMenuOpen = false;
		openMenu = null;
	}

	// Close the dropdowns on any outside click. In an $effect so the listener is
	// removed with the component instead of outliving it.
	$effect(() => {
		const close = () => (openMenu = null);
		window.addEventListener('click', close);
		return () => window.removeEventListener('click', close);
	});

	/**
	 * The same page in another language. Built from the current pathname so the
	 * reader keeps their place instead of being dropped on the home page.
	 */
	function localeHref(locale: Locale): string {
		const pathname =
			base && page.url.pathname.startsWith(base)
				? page.url.pathname.slice(base.length)
				: page.url.pathname;

		return localePath(splitLocale(pathname).path, locale);
	}

	function isLinkActive(href: string): boolean {
		const target = localePath(href);
		if (href === '/') {
			return page.url.pathname === target;
		}
		return page.url.pathname.startsWith(target);
	}

	let headerInnerElement: HTMLElement | undefined = $state();
	let indicatorX = $state(0);
	let activeWidth = $state(132);
	let indicatorVisible = $state(false);
	let isMounted = $state(false);

	/** 0 while the page is at the top, 1 once the coloured band has scrolled away. */
	let scrollProgress = $state(0);

	// Measuring is the only part that touches the DOM; the shape itself is derived,
	// so it follows both the active tab and the scroll without a second code path.
	const indicator = $derived(tabShape(activeWidth, scrollProgress));

	function measureIndicator() {
		if (!headerInnerElement) return;

		const activeEl = headerInnerElement.querySelector<HTMLElement>(
			'.header__link--active, .header__logo--active'
		);

		const activeRect = activeEl?.getBoundingClientRect();

		// Zero width means the nav is collapsed behind the burger, where there is no tab
		// to point at. Drawing one anyway produced a wave for an element nobody could see.
		if (!activeEl || !activeRect || activeRect.width === 0) {
			indicatorVisible = false;
			return;
		}

		const containerRect = headerInnerElement.getBoundingClientRect();

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

	const activeColor = $derived.by(() => {
		const path = page.url.pathname;
		if (path.includes('/adopt/cat')) return 'var(--cat-hero)';
		if (path.includes('/adopt/dog')) return 'var(--dog-hero)';
		if (path.includes('/favorites')) return 'var(--cat-hero)';
		if (path.includes('/apply')) return 'var(--cat-hero)';
		return 'var(--cat-hero)';
	});

	/**
	 * The icon travels with the item rather than being chosen in the markup.
	 *
	 * Adding a fifth destination is then one line here, and it cannot arrive without an
	 * icon — which is what happened to the four that already existed: the logo had a paw
	 * and the rest had nothing, so the row read as one button and four labels.
	 *
	 * A clipboard for the application: the plus already belongs to "order a website" in
	 * the footer, and this is a form to fill in rather than something to add.
	 */
	const navItems: { href: string; label: TranslationKey; icon: IconName }[] = [
		// { href: '/', label: 'nav.home' }, // Тимчасово закоментовано: логотип виконує роль переходу на головну
		{ href: '/adopt/cat', label: 'nav.cats', icon: 'cat' },
		{ href: '/adopt/dog', label: 'nav.dogs', icon: 'dog' },
		{ href: '/favorites', label: 'nav.favorites', icon: 'heart' }
	];

	const isHomeActive = $derived(isLinkActive('/'));
	const isApplyActive = $derived(isLinkActive('/apply'));
</script>

<header class="header" style="--header-shadow: {scrollProgress};">
	<div bind:this={headerInnerElement} class="header__inner" style="--active-tab-bg: {activeColor};">
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

		<a
			href={localePath('/')}
			class="header__logo header__logo--mobile"
			onclick={closeMenu}
			data-testid="header-logo-mobile-link"
		>
			<Icon name="paw" size="1.75rem" class="header__logo-icon" />
			<span class="header__logo-text">{t('nav.adopt')}</span>
		</a>

		<nav class="header__nav" class:header__nav--open={mobileMenuOpen}>
			<a
				href={localePath('/')}
				class="header__link header__logo header__logo--nav"
				class:header__link--active={isHomeActive}
				class:header__logo--active={isHomeActive}
				onclick={closeMenu}
				data-testid="header-logo-link"
			>
				<Icon name="paw" size="1.75rem" class="header__logo-icon" />
				<span class="header__logo-text">{t('nav.adopt')}</span>
			</a>

			{#each navItems as item (item.href)}
				{@const active = isLinkActive(item.href)}
				<a
					href={localePath(item.href)}
					class="header__link"
					class:header__link--active={active}
					onclick={closeMenu}
					data-testid="nav-{item.href.replaceAll('/', '-').replace(/^-|-$/g, '') || 'home'}-link"
				>
					<!-- Decorative: the label beside it is what names the link, and an icon
						 with a name of its own would have a screen reader say it twice. -->
					<Icon name={item.icon} size="1.05rem" class="header__link-icon" />
					<span class="header__link-label">{t(item.label)}</span>

					{#if item.href === '/favorites' && settings.favorites.length > 0}
						<span class="header__fav-count">{settings.favorites.length}</span>
					{/if}
				</a>
			{/each}

			<a
				href={localePath('/apply')}
				class="header__link header__cta"
				class:header__link--active={isApplyActive}
				class:header__cta--active={isApplyActive}
				onclick={closeMenu}
				data-testid="nav-apply-now-link"
			>
				<Icon name="application" size="1.05rem" class="header__link-icon" />
				<span class="header__link-label">{t('nav.applyNow')}</span>
			</a>

			<div class="header__controls">
				<DropdownMenu
					label={t('a11y.toggleTheme')}
					testId="theme"
					items={themes.map((theme) => ({
						id: theme.id,
						label: t(theme.labelKey),
						active: settings.theme === theme.id
					}))}
					open={openMenu === 'theme'}
					onToggle={(next) => (openMenu = next ? 'theme' : null)}
					onselect={(id) => {
						settings.setTheme(id as Theme);
						openMenu = null;
					}}
				>
					{#snippet trigger()}
						<Icon
							name={themes.find((x) => x.id === settings.theme)?.icon ?? 'moon'}
							size="1.2rem"
						/>
					{/snippet}
					{#snippet itemVisual(item)}
						<Icon name={themes.find((x) => x.id === item.id)?.icon ?? 'moon'} size="1.1rem" />
					{/snippet}
				</DropdownMenu>

				<DropdownMenu
					label={t('a11y.toggleStyle')}
					testId="style"
					items={styles.map((style) => ({
						id: style.id,
						label: t(style.labelKey),
						active: settings.style === style.id
					}))}
					open={openMenu === 'style'}
					onToggle={(next) => (openMenu = next ? 'style' : null)}
					onselect={(id) => {
						settings.setStyle(id as SiteStyle);
						openMenu = null;
					}}
				>
					{#snippet trigger()}
						<Icon
							name={styles.find((x) => x.id === settings.style)?.icon ?? 'sparkles'}
							size="1.2rem"
						/>
					{/snippet}
					{#snippet itemVisual(item)}
						<Icon name={styles.find((x) => x.id === item.id)?.icon ?? 'sparkles'} size="1.1rem" />
					{/snippet}
				</DropdownMenu>

				<DropdownMenu
					label={t('a11y.toggleLanguage')}
					testId="lang"
					items={locales.map((locale) => ({
						id: locale.id,
						label: locale.label,
						href: localeHref(locale.id),
						hreflang: locale.id,
						active: settings.locale === locale.id
					}))}
					open={openMenu === 'lang'}
					onToggle={(next) => (openMenu = next ? 'lang' : null)}
					onselect={(id) => {
						settings.setLocale(id as Locale);
						openMenu = null;
					}}
				>
					{#snippet trigger()}
						<span class="header__lang">
							{#if locales.find((l) => l.id === settings.locale)?.flags[0]}
								<img
									src={withBase(locales.find((l) => l.id === settings.locale)!.flags[0])}
									alt=""
									class="header__flag"
								/>
							{/if}
							<span class="header__lang-code">{settings.locale.toUpperCase()}</span>
						</span>
					{/snippet}
					{#snippet itemVisual(item)}
						<span class="header__flags">
							{#each locales.find((l) => l.id === item.id)?.flags ?? [] as flag (flag)}
								<img src={withBase(flag)} alt="" class="header__flag" />
							{/each}
						</span>
					{/snippet}
				</DropdownMenu>
			</div>
		</nav>

		<button
			class="header__burger"
			onclick={toggleMenu}
			aria-label={t('a11y.toggleMenu')}
			aria-expanded={mobileMenuOpen}
			data-testid="mobile-menu-burger-btn"
		>
			<span class="header__burger-line" class:open={mobileMenuOpen}></span>
			<span class="header__burger-line" class:open={mobileMenuOpen}></span>
			<span class="header__burger-line" class:open={mobileMenuOpen}></span>
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

	.header__logo {
		display: inline-flex;
		align-items: center;
		gap: var(--space-sm);
		font-family: var(--font-accent);
		font-weight: 800;
		font-size: 1.25rem;
		color: var(--color-primary);
		text-decoration: none;
		height: 48px;
		padding: 0 16px 8px 16px;
		position: relative;
		z-index: 2;
		transition: color 0.3s ease;
	}

	.header__logo--mobile {
		display: none;
	}

	.header__logo--nav {
		display: inline-flex;
	}

	.header__logo:hover {
		color: var(--color-primary-light);
	}

	.header__logo--active {
		color: #ffffff;
	}

	.header__logo--active:hover {
		color: #ffffff;
	}

	:global(.header__logo-icon) {
		font-size: 1.75rem;
		transition: transform var(--transition-spring);
	}

	.header__logo:hover :global(.header__logo-icon) {
		transform: scale(1.2) rotate(15deg);
	}

	.header__nav {
		display: flex;
		align-items: flex-end;
		justify-content: space-between;
		flex: 1;
		height: 72px;
		position: relative;
	}

	.header__link {
		font-weight: 700;
		font-size: 0.95rem;
		color: var(--color-text-muted);
		transition: color 0.3s ease;
		position: relative;
		height: 48px;
		padding: 0 16px 8px 16px;
		text-decoration: none;
		display: inline-flex;
		align-items: center;
		justify-content: center;
		/* Between the glyph and its label. */
		gap: 8px;
		line-height: 1;
		z-index: 2;
	}

	.header__link :global(.header__link-icon) {
		/* Above the wave the active tab draws behind the item, like the label. */
		position: relative;
		z-index: 2;
		flex-shrink: 0;
	}

	.header__link-label {
		position: relative;
		z-index: 2;
	}

	.header__link:hover {
		color: var(--color-primary);
	}

	.header__link--active {
		color: #ffffff;
		background: transparent;
	}

	.header__link--active:hover {
		color: #ffffff;
	}

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

	.header__fav-count {
		background: var(--color-primary);
		color: white;
		font-size: 0.7rem;
		padding: 2px 6px;
		border-radius: var(--radius-full);
		position: absolute;
		top: 6px;
		right: 4px;
		font-weight: 800;
		line-height: 1;
		box-shadow: var(--shadow-sm);
	}

	.header__cta {
		position: relative;
		padding: 0 20px 8px;
		color: var(--color-text-on-accent);
		background: transparent;
		transition: color var(--transition-fast);
	}

	.header__cta::before {
		content: '';
		position: absolute;
		top: 5px;
		bottom: 13px;
		left: 0;
		right: 0;
		background: var(--color-primary);
		border-radius: var(--radius-full);
		box-shadow: 0 4px 14px color-mix(in srgb, var(--color-primary) 25%, transparent);
		z-index: 1;
		pointer-events: none;
		transition:
			background var(--transition-fast),
			box-shadow var(--transition-fast);
	}

	.header__cta:hover {
		color: var(--color-text-on-accent);
	}

	.header__cta:hover::before {
		background: var(--color-primary-light);
		box-shadow: 0 6px 20px color-mix(in srgb, var(--color-primary) 35%, transparent);
	}

	.header__cta--active {
		background: transparent;
		color: #ffffff;
	}

	.header__cta--active::before {
		display: none;
	}

	.header__cta--active:hover {
		background: transparent;
		color: #ffffff;
	}

	.header__controls {
		display: flex;
		align-items: center;
		gap: var(--space-xs);
		flex-shrink: 0;
		align-self: center;
		margin-bottom: 4px;
	}

	.header__lang {
		display: inline-flex;
		align-items: center;
		gap: 6px;
	}

	.header__flags {
		display: inline-flex;
		align-items: center;
		gap: 4px;
		flex-shrink: 0;
	}

	.header__flag {
		width: 20px;
		height: 14px;
		object-fit: cover;
		border-radius: 2px;
		box-shadow: 0 1px 2px rgba(0, 0, 0, 0.15);
		display: block;
	}

	.header__lang-code {
		font-size: 0.85rem;
		font-weight: 800;
		font-family: var(--font-accent);
		letter-spacing: 0.04em;
		line-height: 1;
	}

	.header__burger {
		display: none;
		flex-direction: column;
		gap: 5px;
		background: none;
		border: none;
	}

	.header__burger-line {
		width: 24px;
		height: 2px;
		background: var(--color-text);
		transition: all 0.3s;
	}

	@media (max-width: 768px) {
		.header__inner {
			align-items: center;
			padding: 0 var(--space-lg);
			gap: var(--space-sm);
		}
		.header__controls {
			margin-left: auto;
		}
		.header__logo--mobile {
			display: inline-flex;
			height: auto;
			padding: 0;
			color: var(--color-primary);
		}
		.header__logo--nav {
			display: none;
		}
		.header__burger {
			display: flex;
		}
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
		.header__indicator,
		.header__wave {
			display: none;
		}
		.header__link {
			height: auto;
			padding: 12px 20px;
		}
		.header__link--active {
			height: auto;
			align-self: auto;
			border-radius: var(--radius-md);
			background: var(--active-tab-bg);
			padding: 12px 20px;
		}
		.header__cta {
			border-radius: var(--radius-md);
			padding: 12px 20px;
			background: var(--color-primary);
		}
		.header__cta::before {
			display: none;
		}
		.header__cta--active {
			background: var(--active-tab-bg);
		}
	}
</style>
