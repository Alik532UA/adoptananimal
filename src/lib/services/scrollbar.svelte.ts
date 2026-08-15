import { browser } from '$app/environment';
import { MediaQuery } from 'svelte/reactivity';
import { storage } from '$lib/services/storage';
import { logService } from '$lib/services/logService.svelte';

/**
 * Which bar draws the page's scroll position (SCROLLBAR-v8).
 *
 * The default is the native one. § 1 of the canon asks which of three things the
 * project needs that the native bar cannot do — not take up width, sit under a
 * full-screen overlay, change thickness at runtime — and the answer here is none of
 * them (PROJECT-CONTEXT.md § 4.13). So the alternatives are something a visitor turns
 * on from the bar's own right-click menu, not something everyone gets.
 *
 * IMPORTANT: the media queries, the mode names and the default below are duplicated in
 * the first-frame script in `src/app.html`, which cannot import this module. Change one
 * and change the other — `src/lib/services/scrollbar-canon.test.ts` fails when they drift.
 */
const canHover = new MediaQuery('(hover: hover) and (pointer: fine)');
/** Below this a minimap would eat width the page needs. */
const wideEnough = new MediaQuery('(min-width: 1100px)');

/** What a visitor picked. */
export type ScrollbarMode = 'standard' | 'custom' | 'minimap' | 'minimap-full';
/** What actually draws, which can fall back to the native bar. */
export type ScrollbarControl = 'native' | 'custom' | 'minimap' | 'minimap-full';

const MODES: ScrollbarMode[] = ['standard', 'custom', 'minimap', 'minimap-full'];

class ScrollbarState {
	/**
	 * The stored choice. `custom` is what SCROLLBAR-v8 § 2.2 prescribes once the file is
	 * applied at all.
	 *
	 * Applying it here is the owner's call rather than the canon's: § 1 asks which of
	 * three things the project needs that the native bar cannot do, and the answer is
	 * none of them. That departure — and only that one — is recorded in
	 * PROJECT-CONTEXT.md § 4.13. Everything that makes the retreat safe is untouched: a
	 * touch device or a narrow window still gets the native bar, and the visitor can
	 * choose it from the bar's own menu.
	 */
	mode = $state<ScrollbarMode>('custom');

	menu = $state<{ open: boolean; x: number; y: number }>({ open: false, x: 0, y: 0 });

	/**
	 * A chosen mode can turn out to be unavailable — a minimap on a phone, anything
	 * custom on a touch screen — and then the native bar stays. That is a retreat, not
	 * a fault: an ordinary working bar beats none at all.
	 */
	readonly active = $derived.by<ScrollbarControl>(() => {
		if (!browser || !canHover.current) return 'native';
		if (this.mode === 'custom') return 'custom';
		if ((this.mode === 'minimap' || this.mode === 'minimap-full') && wideEnough.current) {
			return this.mode;
		}
		return 'native';
	});

	/**
	 * Whether the native bar is hidden. The single source of truth for the class on
	 * `<html>`; the effect in +layout.svelte is its only owner.
	 */
	readonly hidesNative = $derived(this.active !== 'native');

	constructor() {
		if (!browser) return;
		const saved = storage.get('scrollbarMode');
		if (saved !== null && (MODES as string[]).includes(saved)) {
			this.mode = saved as ScrollbarMode;
		}
	}

	set(mode: ScrollbarMode) {
		this.mode = mode;
		storage.set('scrollbarMode', mode);
		logService.info('ui', `Scrollbar mode: ${mode} (active: ${this.active})`);
	}

	openMenu = (x: number, y: number) => {
		this.menu = { open: true, x, y };
	};

	closeMenu = () => {
		this.menu = { ...this.menu, open: false };
	};
}

export const scrollbar = new ScrollbarState();
