<script lang="ts">
	import { localePath, withBase } from '$lib/utils/withBase';
	import { page } from '$app/state';
	import { t, type TranslationKey } from '$lib/i18n';
	import { settings, type Locale, type SiteStyle, type Theme } from '$lib/services/settings.svelte';
	import { base } from '$app/paths';
	import { splitLocale } from '$lib/i18n/locales';
	import Icon from '$lib/components/ui/Icon.svelte';
	import DropdownMenu from '$lib/components/ui/DropdownMenu.svelte';

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

	const navItems: { href: string; label: TranslationKey }[] = [
		{ href: '/', label: 'nav.home' },
		{ href: '/adopt/cat', label: 'nav.cats' },
		{ href: '/adopt/dog', label: 'nav.dogs' },
		{ href: '/favorites', label: 'nav.favorites' }
	];
</script>

<header class="header">
	<div class="header__inner container">
		<a
			href={localePath('/')}
			class="header__logo"
			onclick={closeMenu}
			data-testid="header-logo-link"
		>
			<Icon name="paw" size="1.75rem" class="header__logo-icon" />
			<span class="header__logo-text">{t('nav.adopt')}</span>
		</a>

		<nav class="header__nav" class:header__nav--open={mobileMenuOpen}>
			{#each navItems as item (item.href)}
				<a
					href={localePath(item.href)}
					class="header__link"
					class:header__link--active={page.url.pathname === localePath(item.href)}
					onclick={closeMenu}
					data-testid="nav-{item.href.replaceAll('/', '-').replace(/^-|-$/g, '') || 'home'}-link"
				>
					{t(item.label)}
					{#if item.href === '/favorites' && settings.favorites.length > 0}
						<span class="header__fav-count">{settings.favorites.length}</span>
					{/if}
				</a>
			{/each}
			<a
				href={localePath('/apply')}
				class="btn btn--primary btn--sm header__cta"
				onclick={closeMenu}
				data-testid="nav-apply-now-link"
			>
				{t('nav.applyNow')}
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
							<span class="header__flags">
								{#each locales.find((l) => l.id === settings.locale)?.flags ?? [] as flag (flag)}
									<img src={withBase(flag)} alt="" class="header__flag" />
								{/each}
							</span>
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
		backdrop-filter: blur(16px);
		-webkit-backdrop-filter: blur(16px);
		border-bottom: none;
		transition: all var(--transition-normal);
	}

	.header__inner {
		display: flex;
		align-items: center;
		justify-content: space-between;
		height: 72px;
	}

	.header__logo {
		display: flex;
		align-items: center;
		gap: var(--space-sm);
		font-family: var(--font-accent);
		font-weight: 800;
		font-size: 1.25rem;
		color: var(--color-primary);
		text-decoration: none;
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
		align-items: center;
		gap: var(--space-lg);
	}

	.header__link {
		font-weight: 600;
		font-size: 0.95rem;
		color: var(--color-text-muted);
		transition: color var(--transition-fast);
		position: relative;
	}

	.header__link--active {
		color: var(--color-primary);
	}

	.header__fav-count {
		background: var(--color-primary);
		color: white;
		font-size: 0.7rem;
		padding: 2px 6px;
		border-radius: var(--radius-full);
		position: absolute;
		top: -4px;
		right: -12px;
		font-weight: 800;
		line-height: 1;
		box-shadow: var(--shadow-sm);
	}

	.header__controls {
		display: flex;
		align-items: center;
		gap: var(--space-xs);
		margin-left: var(--space-md);
		padding-left: var(--space-md);
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
		.header__burger {
			display: flex;
		}
		.header__nav {
			display: none;
		}
		.header__nav--open {
			display: flex;
			position: fixed;
			top: 72px;
			left: 0;
			right: 0;
			bottom: 0;
			background: var(--color-bg-card);
			flex-direction: column;
			padding: var(--space-xl);
		}
	}
</style>
