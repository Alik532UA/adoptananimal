<script lang="ts">
	import { withBase, localePath } from '$lib/utils/withBase';
	import { page } from '$app/state';
	import { base } from '$app/paths';
	import { t, type TranslationKey } from '$lib/i18n';
	import { splitLocale } from '$lib/i18n/locales';
	import { settings, type Locale, type SiteStyle, type Theme } from '$lib/services/settings.svelte';
	import Icon from '$lib/components/ui/Icon.svelte';
	import DropdownMenu from '$lib/components/ui/DropdownMenu.svelte';

	/**
	 * The box a flag occupies, stated on the element as well as in CSS.
	 *
	 * The same two numbers as `.header__flag` below, and they have to be: the attributes
	 * reserve the space before any stylesheet arrives, the CSS keeps it once one has.
	 * Without them the row reflows on first paint — small, but it is the header, so it
	 * happens on every page. The flags are SVGs of differing natural size, hence a fixed
	 * pair rather than the file's own dimensions: `object-fit: cover` crops to this box.
	 */
	const FLAG_WIDTH = 20;
	const FLAG_HEIGHT = 14;

	/**
	 * Theme, style and language — the three things the header lets a visitor change.
	 *
	 * Together in one component because they are one row and one behaviour: only one of
	 * the three may be open at a time, and that rule needs a single piece of state to
	 * live in.
	 */
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
		/*
		 * Minimal is deliberately absent from this list, not deleted.
		 *
		 * Its stylesheet, its tokens and its handling everywhere else are intact, and
		 * setting the stored value by hand still applies it — it is simply not offered.
		 * Removing the code would make bringing it back a rewrite instead of a line.
		 */
		{ id: 'playful', labelKey: 'style.playful', icon: 'playful' },
		{ id: 'modern', labelKey: 'style.modern', icon: 'sparkles' }
	];

	const themes: {
		id: Theme;
		labelKey: TranslationKey;
		icon: 'moon' | 'sun' | 'idea' | 'winter';
	}[] = [
		// The one the site opens in leads the list; the rest are alternatives to it.
		{ id: 'light-green', labelKey: 'theme.light-green', icon: 'sun' },
		{ id: 'dark', labelKey: 'theme.dark', icon: 'moon' },
		{ id: 'orange-purple', labelKey: 'theme.orange-purple', icon: 'idea' },
		{ id: 'winter', labelKey: 'theme.winter', icon: 'winter' }
	];

	/*
	 * Close on any outside click. In an $effect so the listener leaves with the component
	 * instead of outliving it.
	 *
	 * This is also why the header no longer resets these when its mobile menu closes:
	 * whatever closed that menu was itself a click, so it reaches this listener too.
	 */
	$effect(() => {
		const close = () => (openMenu = null);
		window.addEventListener('click', close);
		return () => window.removeEventListener('click', close);
	});

	/**
	 * The same page in another language. Built from the current pathname so the reader
	 * keeps their place instead of being dropped on the home page.
	 */
	function localeHref(locale: Locale): string {
		const pathname =
			base && page.url.pathname.startsWith(base)
				? page.url.pathname.slice(base.length)
				: page.url.pathname;

		return localePath(splitLocale(pathname).path, locale);
	}
</script>

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
			<Icon name={themes.find((x) => x.id === settings.theme)?.icon ?? 'moon'} size="1.2rem" />
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
			<Icon name={styles.find((x) => x.id === settings.style)?.icon ?? 'sparkles'} size="1.2rem" />
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
						width={FLAG_WIDTH}
						height={FLAG_HEIGHT}
					/>
				{/if}
				<span class="header__lang-code">{settings.locale.toUpperCase()}</span>
			</span>
		{/snippet}
		{#snippet itemVisual(item)}
			<span class="header__flags">
				{#each locales.find((l) => l.id === item.id)?.flags ?? [] as flag (flag)}
					<img
						src={withBase(flag)}
						alt=""
						class="header__flag"
						width={FLAG_WIDTH}
						height={FLAG_HEIGHT}
					/>
				{/each}
			</span>
		{/snippet}
	</DropdownMenu>
</div>

<style>
	/*
	 * The three triggers take the same surface as every other control on the site.
	 *
	 * DropdownMenu gives them --glass-bg, which is translucent: over the header's
	 * blurred bar that reads as a button, and over the mobile panel's flat card colour
	 * it lands on almost the same value and they look like three bare glyphs. One rule
	 * for both places rather than a panel-only override, so there is nothing for the
	 * bundler to break a tie over (SVELTE-UI § 3.6).
	 *
	 * `.header__controls :global(.dropdown__trigger)` is (0,3,0) once Svelte adds its
	 * scoping class, against (0,2,0) for the component's own rule — it wins outright,
	 * not by being later.
	 */
	.header__controls :global(.dropdown__trigger) {
		background: var(--control-surface);
		border-color: transparent;
		-webkit-backdrop-filter: none;
		backdrop-filter: none;
	}

	.header__controls :global(.dropdown__trigger:hover) {
		background: var(--control-surface-hover);
	}

	/*
	 * And the panel that opens from them, for the same reason and in the same place.
	 *
	 * DropdownMenu paints itself --color-bg-card, which IS the header's colour on a wide
	 * screen: the menu opened over the bar and read as part of it rather than as a thing
	 * on top. In the mobile panel it had the same problem against the same value, and
	 * carried a fix of its own in HeaderNav — two rules for one intent, which is how the
	 * two places drift apart. There is exactly one dropdown in this project, and it lives
	 * here, so the rule lives here too.
	 *
	 * --control-surface-hover is the card colour stepped toward the text by a fixed
	 * amount, so the separation is identical in all four themes and can only ever be the
	 * same hue.
	 */
	.header__controls :global(.dropdown__menu) {
		background: var(--control-surface-hover);
		border: 1px solid var(--color-border);
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
</style>
