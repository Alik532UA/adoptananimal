import { browser } from '$app/environment';
import { storage } from '$lib/services/storage';
import { logService } from '$lib/services/logService.svelte';

import { DEFAULT_LOCALE, isLocale, LOCALES, type Locale } from '$lib/i18n/locales';

export type Theme = 'dark' | 'light-green' | 'orange-purple' | 'winter';
export type SiteStyle = 'modern' | 'minimal' | 'playful';
export type { Locale };

/**
 * Service for managing application settings like theme, locale, and favorites.
 * Uses Svelte 5 runes for reactivity and persists data to localStorage.
 */
class Settings {
	theme = $state<Theme>('dark');

	/** Language of the page being rendered. Owned by the URL, not by this class. */
	locale = $state<Locale>(DEFAULT_LOCALE);

	/** The language the visitor last chose, used to offer their language on arrival. */
	preferredLocale = $state<Locale | null>(null);

	style = $state<SiteStyle>('modern');
	favorites = $state<string[]>([]);

	private themes: Theme[] = ['dark', 'light-green', 'orange-purple', 'winter'];
	private styles: SiteStyle[] = ['modern', 'minimal', 'playful'];

	constructor() {
		if (browser) {
			logService.info('storage', 'Initializing settings via Storage Facade');

			// Theme. The fallback must match the first-frame script in app.html,
			// otherwise the palette changes once on hydration.
			const savedTheme = storage.get('theme') as Theme | null;
			if (savedTheme && this.themes.includes(savedTheme)) {
				this.theme = savedTheme;
			} else {
				this.theme = window.matchMedia('(prefers-color-scheme: dark)').matches
					? 'dark'
					: 'light-green';
			}

			// Only the preference is restored. The current language comes from the
			// route, so that a shared link always opens in the language it names.
			const savedLocale = storage.get('locale');
			if (savedLocale && isLocale(savedLocale)) {
				this.preferredLocale = savedLocale;
			}

			// Style
			const savedStyle = storage.get('style') as SiteStyle | null;
			if (savedStyle && this.styles.includes(savedStyle)) {
				this.style = savedStyle;
			}

			// Favorites
			const savedFavs = storage.getJSON<string[]>('favorites');
			if (savedFavs) {
				this.favorites = savedFavs;
				logService.info('storage', `Loaded ${this.favorites.length} favorites`);
			}
		}

		$effect.root(() => {
			$effect(() => {
				if (browser) {
					storage.set('theme', this.theme);
					document.documentElement.setAttribute('data-theme', this.theme);
					const meta = document.querySelector('meta[name="color-scheme"]');
					if (meta) meta.setAttribute('content', this.theme === 'dark' ? 'dark' : 'light dark');
				}
			});

			// The attribute is written by hooks.server.ts during prerender; this keeps
			// it correct after a client-side navigation between languages.
			$effect(() => {
				if (browser) {
					document.documentElement.setAttribute('lang', this.locale);
				}
			});

			$effect(() => {
				if (browser) {
					storage.set('style', this.style);
					document.documentElement.setAttribute('data-style', this.style);
				}
			});

			$effect(() => {
				if (browser) {
					// $state.snapshot: a proxy crossing into JSON.stringify is the § 1.6 anti-pattern.
					storage.setJSON('favorites', $state.snapshot(this.favorites));
				}
			});
		});
	}

	toggleTheme() {
		const currentIndex = this.themes.indexOf(this.theme);
		const nextIndex = (currentIndex + 1) % this.themes.length;
		this.theme = this.themes[nextIndex];
	}

	setTheme(theme: Theme) {
		this.theme = theme;
	}

	/** Records an explicit choice by the visitor. Navigation is the caller's job. */
	setLocale(locale: Locale) {
		this.locale = locale;
		this.preferredLocale = locale;
		storage.set('locale', locale);
	}

	/** Applies the language of the current route without touching the stored preference. */
	applyRouteLocale(locale: Locale) {
		if (this.locale !== locale) this.locale = locale;
	}

	toggleLocale() {
		const currentIndex = LOCALES.indexOf(this.locale);
		this.setLocale(LOCALES[(currentIndex + 1) % LOCALES.length]);
	}

	setStyle(style: SiteStyle) {
		this.style = style;
	}

	nextStyle() {
		const currentIndex = this.styles.indexOf(this.style);
		const nextIndex = (currentIndex + 1) % this.styles.length;
		this.style = this.styles[nextIndex];
	}

	toggleFavorite(slug: string) {
		if (this.favorites.includes(slug)) {
			this.favorites = this.favorites.filter((f) => f !== slug);
			logService.info('storage', `Removed from favorites: ${slug}`);
		} else {
			this.favorites = [...this.favorites, slug];
			logService.info('storage', `Added to favorites: ${slug}`);
		}
	}

	/**
	 * Resets all settings to their initial values.
	 */
	reset() {
		this.theme = 'dark';
		this.locale = DEFAULT_LOCALE;
		this.preferredLocale = null;
		this.style = 'modern';
		this.favorites = [];
	}

	isFavorite(slug: string) {
		return this.favorites.includes(slug);
	}
}

export const settings = new Settings();
