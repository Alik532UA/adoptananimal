import { browser } from '$app/environment';
import { storage } from '$lib/services/storage';
import { logService } from '$lib/services/logService.svelte';

import { DEFAULT_LOCALE, isLocale, type Locale } from '$lib/i18n/locales';

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

	/** Playful by owner's choice; see the theme note below for why that is written here. */
	style = $state<SiteStyle>('playful');
	favorites = $state<string[]>([]);

	private themes: Theme[] = ['dark', 'light-green', 'orange-purple', 'winter'];
	private styles: SiteStyle[] = ['modern', 'minimal', 'playful'];

	constructor() {
		if (browser) {
			logService.info('storage', 'Initializing settings via Storage Facade');

			/*
			 * Theme. The fallback must match the first-frame script in app.html, or the
			 * palette changes once on hydration.
			 *
			 * DELIBERATE EXCEPTION, at the owner's request rather than by a developer's
			 * preference. UI-UX-v8 says the first visit follows prefers-color-scheme, and
			 * that rule stands — it is right, and it stays in the instructions. This site
			 * opens on the green theme for everyone, because the owner wants the same first
			 * impression regardless of what a visitor's operating system happens to be set
			 * to. It costs the visitor nothing they cannot undo: the theme picker is in the
			 * header, and whatever they choose is remembered from then on.
			 *
			 * Recorded in PROJECT-CONTEXT.md § 4.16.
			 */
			const savedTheme = storage.get('theme') as Theme | null;
			this.theme = savedTheme && this.themes.includes(savedTheme) ? savedTheme : 'light-green';

			// Seeded from the attribute the server already wrote, before any effect can
			// run. Starting at the default instead meant hydration briefly stamped
			// lang="en" onto a German page before the route locale arrived — long enough
			// for a screen reader, and for a test, to read the wrong language.
			const fromDocument = document.documentElement.lang;
			if (isLocale(fromDocument)) {
				this.locale = fromDocument;
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
					// Те саме, що в скрипті першого кадру: `only light` — відмова від
					// Auto Dark Theme на Android (UI-UX-v9 `UIUX-ONLY-LIGHT`).
					// `orange-purple` темна за тлом, тож іде разом із `dark`.
					const темна = this.theme === 'dark' || this.theme === 'orange-purple';
					if (meta) meta.setAttribute('content', темна ? 'dark' : 'only light');
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
		this.previewedTheme = null;
		this.#startThemeShift();
		this.theme = theme;
	}

	/** Знімає клас плавного переходу, коли той доїхав (THEME-SWITCHER § 5). */
	#shiftTimer: ReturnType<typeof setTimeout> | null = null;

	/**
	 * Вмикає плавний перехід кольорів на час зміни теми.
	 *
	 * Тривалість із ЗАПАСОМ над 0,56 с із `styles/base.css`, а не те саме число
	 * — щоб не тримати копію тривалості у двох місцях. Знімає клас ЛИШЕ таймер:
	 * зняття в обробнику обривало б перехід на половині, бо вибір теми закриває
	 * меню, а його закриття кличе `previewTheme(null)`.
	 */
	#startThemeShift() {
		if (!browser) return;
		document.documentElement.classList.add('theme-shifting');
		if (this.#shiftTimer) clearTimeout(this.#shiftTimer);
		this.#shiftTimer = setTimeout(() => {
			document.documentElement.classList.remove('theme-shifting');
			this.#shiftTimer = null;
		}, 900);
	}

	/**
	 * Тема, яку показуємо «на пробу» під курсором, або `null`
	 * (THEME-SWITCHER § 2.1).
	 *
	 * ОКРЕМО від `theme`, і тут це критичніше, ніж деінде: `theme` слухає
	 * `$effect`, який на КОЖНУ зміну пише у сховище. Прев'ю в те саме поле
	 * означало б, що курсор, який просто перетнув меню, зберігає чужу тему
	 * назавжди — а `.active` при цьому їхала б за ним.
	 */
	previewedTheme = $state<Theme | null>(null);

	/**
	 * Показує тему «на пробу», поки курсор на її пункті; `null` — вертає обрану.
	 *
	 * Малює документ напряму, повз `$effect`: той прив'язаний до `theme`, і
	 * єдиний спосіб зачепити його — записати вибір, чого прев'ю робити не має.
	 * Мета-тег іде разом з атрибутом — інакше показана темна тема лишалася б
	 * оголошеною як світла, і Android Chrome перемальовував би її своєю Auto
	 * Dark Theme рівно на час показу.
	 */
	previewTheme(theme: Theme | null) {
		if (!browser) return;
		this.previewedTheme = theme;
		this.#startThemeShift();
		const shown = theme ?? this.theme;
		document.documentElement.setAttribute('data-theme', shown);
		const meta = document.querySelector('meta[name="color-scheme"]');
		const темна = shown === 'dark' || shown === 'orange-purple';
		if (meta) meta.setAttribute('content', темна ? 'dark' : 'only light');
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

	setStyle(style: SiteStyle) {
		this.style = style;
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

	isFavorite(slug: string) {
		return this.favorites.includes(slug);
	}
}

export const settings = new Settings();
