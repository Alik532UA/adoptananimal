<script lang="ts">
	import { withBase } from '$lib/utils/withBase';
	import { page } from '$app/state';
	import { t, type TranslationKey } from '$lib/i18n';
	import { settings, type Locale, type SiteStyle, type Theme } from '$lib/services/settings.svelte';
	import Icon from '$lib/components/ui/Icon.svelte';

	let mobileMenuOpen = $state(false);
	let langMenuOpen = $state(false);
	let styleMenuOpen = $state(false);
	let themeMenuOpen = $state(false);

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
		langMenuOpen = false;
		styleMenuOpen = false;
		themeMenuOpen = false;
	}

	function closeDropdowns() {
		langMenuOpen = false;
		styleMenuOpen = false;
		themeMenuOpen = false;
	}

	// Close the dropdowns on any outside click. In an $effect so the listener is
	// removed with the component instead of outliving it.
	$effect(() => {
		window.addEventListener('click', closeDropdowns);
		return () => window.removeEventListener('click', closeDropdowns);
	});

	/**
	 * Keyboard behaviour for an open dropdown: Escape closes it and hands focus back
	 * to the button that opened it, arrows walk the items, Home/End jump to the ends.
	 * Without this a keyboard user could open a menu and have no way out of it.
	 */
	function handleMenuKeydown(event: KeyboardEvent) {
		const menu = event.currentTarget as HTMLElement;
		const items = [...menu.querySelectorAll<HTMLElement>('[role="menuitem"]')];
		const index = items.indexOf(document.activeElement as HTMLElement);

		switch (event.key) {
			case 'Escape':
				event.stopPropagation();
				closeDropdowns();
				menu.closest('.header__dropdown')?.querySelector('button')?.focus();
				break;
			case 'ArrowDown':
				event.preventDefault();
				items[(index + 1) % items.length]?.focus();
				break;
			case 'ArrowUp':
				event.preventDefault();
				items[(index - 1 + items.length) % items.length]?.focus();
				break;
			case 'Home':
				event.preventDefault();
				items[0]?.focus();
				break;
			case 'End':
				event.preventDefault();
				items.at(-1)?.focus();
				break;
		}
	}

	/** Moves focus into a menu as it opens, so the arrow keys have somewhere to start. */
	function focusFirstItem(node: HTMLElement) {
		node.querySelector<HTMLElement>('[role="menuitem"]')?.focus();
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
		<a href={withBase('/')} class="header__logo" onclick={closeMenu} data-testid="header-logo-link">
			<Icon name="paw" size="1.75rem" class="header__logo-icon" />
			<span class="header__logo-text">{t('nav.adopt')}</span>
		</a>

		<nav class="header__nav" class:header__nav--open={mobileMenuOpen}>
			{#each navItems as item (item.href)}
				<a
					href={withBase(item.href)}
					class="header__link"
					class:header__link--active={page.url.pathname === withBase(item.href)}
					onclick={closeMenu}
					data-testid="nav-{item.href.replace('/', '') || 'home'}-link"
				>
					{t(item.label)}
					{#if item.href === '/favorites' && settings.favorites.length > 0}
						<span class="header__fav-count">{settings.favorites.length}</span>
					{/if}
				</a>
			{/each}
			<a
				href={withBase('/apply')}
				class="btn btn--primary btn--sm header__cta"
				onclick={closeMenu}
				data-testid="nav-apply-now-link"
			>
				{t('nav.applyNow')}
			</a>

			<div class="header__controls">
				<!-- Theme Toggle -->
				<div class="header__dropdown">
					<button
						class="header__control-btn"
						onclick={(e) => {
							e.stopPropagation();
							themeMenuOpen = !themeMenuOpen;
							styleMenuOpen = false;
							langMenuOpen = false;
						}}
						aria-label={t('a11y.toggleTheme')}
						aria-expanded={themeMenuOpen}
						aria-haspopup="menu"
						data-testid="theme-toggle-btn"
					>
						<Icon
							name={themes.find((t) => t.id === settings.theme)?.icon || 'moon'}
							size="1.2rem"
						/>
					</button>
					{#if themeMenuOpen}
						<div
							class="dropdown-menu"
							role="menu"
							tabindex="-1"
							onkeydown={handleMenuKeydown}
							{@attach focusFirstItem}
						>
							{#each themes as theme (theme.id)}
								<button
									class="dropdown-item"
									class:dropdown-item--active={settings.theme === theme.id}
									onclick={() => {
										settings.setTheme(theme.id);
										themeMenuOpen = false;
									}}
									role="menuitem"
									data-testid="theme-option-{theme.id}-btn"
								>
									<Icon name={theme.icon} size="1.1rem" />
									<span>{t(theme.labelKey)}</span>
								</button>
							{/each}
						</div>
					{/if}
				</div>

				<!-- Style Toggle -->
				<div class="header__dropdown">
					<button
						class="header__control-btn"
						onclick={(e) => {
							e.stopPropagation();
							styleMenuOpen = !styleMenuOpen;
							langMenuOpen = false;
							themeMenuOpen = false;
						}}
						aria-label={t('a11y.toggleStyle')}
						aria-expanded={styleMenuOpen}
						aria-haspopup="menu"
						data-testid="style-toggle-btn"
					>
						<Icon
							name={styles.find((s) => s.id === settings.style)?.icon || 'sparkles'}
							size="1.2rem"
						/>
					</button>
					{#if styleMenuOpen}
						<div
							class="dropdown-menu"
							role="menu"
							tabindex="-1"
							onkeydown={handleMenuKeydown}
							{@attach focusFirstItem}
						>
							{#each styles as style (style.id)}
								<button
									class="dropdown-item"
									class:dropdown-item--active={settings.style === style.id}
									onclick={() => {
										settings.setStyle(style.id);
										styleMenuOpen = false;
									}}
									role="menuitem"
									data-testid="style-option-{style.id}-btn"
								>
									<Icon name={style.icon} size="1.1rem" />
									<span>{t(style.labelKey)}</span>
								</button>
							{/each}
						</div>
					{/if}
				</div>

				<!-- Language Toggle -->
				<div class="header__dropdown">
					<button
						class="header__control-btn lang-btn"
						onclick={(e) => {
							e.stopPropagation();
							langMenuOpen = !langMenuOpen;
							styleMenuOpen = false;
							themeMenuOpen = false;
						}}
						aria-label={t('a11y.toggleLanguage')}
						aria-expanded={langMenuOpen}
						aria-haspopup="menu"
						data-testid="lang-toggle-btn"
					>
						<div class="lang-btn__flags">
							{#each locales.find((l) => l.id === settings.locale)?.flags || [] as flag (flag)}
								<img src={withBase(flag)} alt="" class="flag-icon" />
							{/each}
						</div>
						<span class="lang-btn__code">{settings.locale.toUpperCase()}</span>
					</button>

					{#if langMenuOpen}
						<div
							class="dropdown-menu"
							role="menu"
							tabindex="-1"
							onkeydown={handleMenuKeydown}
							{@attach focusFirstItem}
						>
							{#each locales as locale (locale.id)}
								<button
									class="dropdown-item"
									class:dropdown-item--active={settings.locale === locale.id}
									onclick={() => {
										settings.setLocale(locale.id);
										langMenuOpen = false;
									}}
									role="menuitem"
									data-testid="lang-option-{locale.id}-btn"
								>
									<div class="dropdown-item__flags">
										{#each locale.flags as flag (flag)}
											<img src={withBase(flag)} alt="" class="flag-icon" />
										{/each}
									</div>
									<span class="dropdown-label">{locale.label}</span>
								</button>
							{/each}
						</div>
					{/if}
				</div>
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

	.header__control-btn {
		width: 44px;
		height: 44px;
		border-radius: var(--radius-md);
		background: var(--glass-bg);
		backdrop-filter: blur(var(--glass-blur));
		-webkit-backdrop-filter: blur(var(--glass-blur));
		border: none;
		color: var(--color-text);
		display: flex;
		align-items: center;
		justify-content: center;
		font-size: 1.1rem;
		transition: all var(--transition-fast);
		cursor: pointer;
		box-shadow: var(--shadow-sm);
	}

	.header__control-btn:hover {
		background: var(--color-primary);
		color: white;
		transform: translateY(-1px);
	}

	.lang-btn {
		width: auto;
		min-width: 64px;
		padding: 0 10px;
		gap: 8px;
	}

	.lang-btn__flags,
	.dropdown-item__flags {
		display: flex;
		gap: 2px;
	}

	.flag-icon {
		width: 18px;
		height: 12px;
		object-fit: cover;
		border-radius: 1px;
		border: none;
	}

	.header__dropdown {
		position: relative;
	}

	.dropdown-menu {
		position: absolute;
		top: calc(100% + 8px);
		right: 0;
		background: var(--color-bg-card);
		border: none;
		border-radius: var(--radius-md);
		box-shadow: var(--shadow-lg);
		padding: 6px;
		min-width: 180px;
		display: flex;
		flex-direction: column;
		gap: 2px;
		z-index: 100;
		animation: slideDown 0.2s ease-out;
	}

	.dropdown-item {
		display: flex;
		align-items: center;
		gap: 12px;
		padding: 10px 14px;
		border-radius: var(--radius-sm);
		border: none;
		background: transparent;
		color: var(--color-text);
		font-family: inherit;
		font-size: 0.95rem;
		cursor: pointer;
		width: 100%;
		text-align: left;
	}

	.dropdown-item:hover {
		background: var(--color-bg-warm);
		color: var(--color-primary);
	}

	.dropdown-item--active {
		background: var(--color-primary);
		color: white;
	}

	@keyframes slideDown {
		from {
			opacity: 0;
			transform: translateY(-10px);
		}
		to {
			opacity: 1;
			transform: translateY(0);
		}
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
