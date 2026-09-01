import type { Attachment } from 'svelte/attachments';

/**
 * Noticing that a photograph cannot be shown, without writing `onerror` in the markup.
 *
 * SECURITY-v8 § 6.3.2. An `onerror={…}` prop on an element that can fail before
 * hydration makes Svelte 5 emit a real HTML attribute into the prerendered page:
 *
 * ```html
 * <img src="…" width="400" height="400" onerror="this.__e=event">
 * ```
 *
 * That hook exists so an error fired before the component mounted is not lost — the
 * client replays it. Under this project's policy it never runs. Measured against
 * `build/` on 2026-09-02, Chrome, with the site's own `<meta http-equiv>` policy:
 *
 * ```text
 * Executing inline event handler violates the following Content Security Policy
 * directive 'script-src 'self' …'. … Note that hashes do not apply to event handlers,
 * style attributes and javascript: navigations unless the 'unsafe-hashes' keyword is
 * present. The action has been blocked.
 * ```
 *
 * `hashes do not apply to event handlers` is the whole sentence: § 6.3 covers our
 * inline `<script>` with a hash, and no hash can ever cover this. The build carried
 * 600 of these attributes across 229 pages, fifty of them on the home page.
 *
 * What it cost is not the console line. A photo that 404s or times out **before**
 * hydration lost its error event, so `imageFailed` stayed false and the card showed
 * the browser's broken-image glyph instead of the fallback drawn for exactly that
 * case. After hydration Svelte attaches a normal listener and the fallback worked —
 * which is why nothing about this was visible on a fast local machine.
 *
 * A listener added from an attachment is `addEventListener`, not an attribute, so it
 * emits nothing into the HTML and needs no permission from the policy. The
 * pre-hydration window it gives up is covered by asking the element directly, below.
 */

/**
 * True when the browser is done with this image and has no picture to show.
 *
 * `complete` alone is not that question: it is also true for an element with no `src`
 * at all, and `imageQueue` deliberately takes `src` away while a photo waits its turn.
 * Reading that as a failure would put the fallback glyph on every queued card.
 */
export function photoIsBroken(img: HTMLImageElement): boolean {
	if (!img.getAttribute('src')) return false;
	return img.complete && img.naturalWidth === 0;
}

/**
 * Reports a photograph the browser cannot display, now or later.
 *
 * Two halves, because the event and the state answer different questions. The
 * listener catches a failure that happens from here on; the check catches one that
 * already happened — between the HTML arriving and this attachment running, which is
 * the window the blocked `onerror` attribute was meant to cover.
 */
export function photoFallback(onFailed: () => void): Attachment<HTMLImageElement> {
	return (img) => {
		if (photoIsBroken(img)) {
			onFailed();
			return;
		}

		const onError = () => {
			if (photoIsBroken(img)) onFailed();
		};

		img.addEventListener('error', onError);
		return () => img.removeEventListener('error', onError);
	};
}
