/**
 * Guards without which a hotkey does more harm than good (HOTKEYS-v8 § 2).
 *
 * **KEY MAP FOR THIS PROJECT** — so the next agent does not re-derive it:
 *
 * | Key | State | Where / why |
 * |---|---|---|
 * | `T` | ✅ theme | `header/HeaderControls.svelte`; cycles four themes via `settings.toggleTheme()` |
 * | `L` | ✅ language menu | same file; switching language is NAVIGATION (`localePath`), so the key opens the list rather than stepping to "the next language" and reloading up to three times |
 * | `V` | ✅ service badge | `components/LogCopyButton.svelte` |
 * | `R` | ✅ emergency reset | same file; `services/resetService.ts` |
 * | `Esc` | ✅ close the open header menu | `HeaderControls` |
 * | `←` `→` | ✅ carousel | `ui/Carousel.svelte`, scoped to the focused carousel |
 * | `M` | ⏭️ SKIPPED | no sound: no `audio` element and no sound service exist; the "sounds" in the animal data are text descriptions |
 * | `B` | ⏭️ SKIPPED | no dynamic backgrounds. The header does offer a site STYLE (playful/modern), but that is not a background, and giving `B` a different meaning here than in the sibling projects is exactly what the canonical map exists to prevent |
 * | `C` | ⏭️ SKIPPED | no clock on screen. `services/clock.svelte.ts` exists but supplies today's date for age arithmetic, not a visible clock |
 * | `F` | ⏭️ SKIPPED | no fullscreen — neither a control nor a `requestFullscreen` call |
 * | `H` | ⏭️ SKIPPED | "home" is the header logo link; there are no tab-like sections to step through |
 * | `PgUp`/`PgDn`, `1`–`9` | ⏭️ SKIPPED | the page does not move in sections |
 *
 * Skipped means the feature is absent, not that the key was forgotten. When the
 * feature appears, its key comes from the canonical map (HOTKEYS-v8 § 1.1) rather
 * than being invented.
 */

/**
 * Is the visitor typing right now.
 *
 * `closest`, not a `tagName` comparison: inside a `contenteditable` the focus sits
 * on a nested node whose `tagName` is `SPAN`, so a tag check misses that case.
 */
export function isTypingTarget(target: EventTarget | null | undefined): boolean {
	const element = target as HTMLElement | null | undefined;
	if (!element || typeof element.closest !== 'function') return false;
	return (
		element.closest('input, textarea, select, [contenteditable]:not([contenteditable="false"])') !==
		null
	);
}

/**
 * A single key with no modifiers held.
 *
 * `Ctrl+T` opens a tab, `Ctrl+R` reloads, `Ctrl+V` pastes — and all three carry the
 * same `event.code` as the bare key. `Shift` is deliberately not checked: it does
 * not change `code`, and the browser rarely claims chords with it.
 */
export function isPlainKey(event: {
	ctrlKey?: boolean;
	metaKey?: boolean;
	altKey?: boolean;
}): boolean {
	return !event.ctrlKey && !event.metaKey && !event.altKey;
}

/**
 * Both guards together — what a window-level handler needs.
 *
 * `Escape` is the one exemption from the text-entry guard, and it needs to be: a
 * panel opened by a key often takes focus into its own search box, and then the
 * letter that opened it is — correctly — swallowed by the field. Nothing else can
 * close the panel from in there (HOTKEYS-v8 § 2.2).
 */
export function acceptsShortcut(event: KeyboardEvent): boolean {
	if (!isPlainKey(event)) return false;
	if (event.code === 'Escape') return true;
	return !isTypingTarget(event.target);
}
