import { browser } from '$app/environment';
import { storage } from '$lib/services/storage';
import { logService } from '$lib/services/logService.svelte';

export type Theme = 'dark' | 'light-green' | 'orange-purple' | 'winter';
export type Locale = 'uk' | 'en' | 'de' | 'nl';
export type SiteStyle = 'modern' | 'minimal' | 'playful';

/**
 * Service for managing application settings like theme, locale, and favorites.
 * Uses Svelte 5 runes for reactivity and persists data to localStorage.
 */
class Settings {
	theme = $state<Theme>('dark');
	locale = $state<Locale>('en');
	style = $state<SiteStyle>('modern');
	favorites = $state<string[]>([]);

	private themes: Theme[] = ['dark', 'light-green', 'orange-purple', 'winter'];
	private locales: Locale[] = ['en', 'uk', 'de', 'nl'];
	private styles: SiteStyle[] = ['modern', 'minimal', 'playful'];

	constructor() {
		if (browser) {
			logService.info('storage', 'Initializing settings via Storage Facade');

			// Theme
			const savedTheme = storage.get('theme') as Theme | null;
			if (savedTheme && this.themes.includes(savedTheme)) {
				this.theme = savedTheme;
			} else {
				this.theme = 'dark';
			}

			// Locale
			const savedLocale = storage.get('locale') as Locale | null;
			if (savedLocale && this.locales.includes(savedLocale)) {
				this.locale = savedLocale;
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

			$effect(() => {
				if (browser) {
					storage.set('locale', this.locale);
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
					storage.setJSON('favorites', this.favorites);
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

	setLocale(locale: Locale) {
		this.locale = locale;
	}

	toggleLocale() {
		const currentIndex = this.locales.indexOf(this.locale);
		const nextIndex = (currentIndex + 1) % this.locales.length;
		this.locale = this.locales[nextIndex];
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
		this.locale = 'en';
		this.style = 'modern';
		this.favorites = [];
	}

	isFavorite(slug: string) {
		return this.favorites.includes(slug);
	}
}

export const settings = new Settings();
