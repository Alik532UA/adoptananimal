import { base } from '$app/paths';
import { PREFIX, storage } from '$lib/services/storage';

/**
 * Emergency reset: wipe THIS project's local data and reload.
 *
 * **Why it exists at all.** Preferences, the AI chat history and the beta
 * checklist all live in storage, and when they contradict a new build the page
 * opens broken — which is cured by opening DevTools, something no visitor and no
 * beta tester will do. A keyboard gesture gives the same result without them.
 *
 * **What is wiped, and why not more.** The origin is shared with the sibling
 * projects on GitHub Pages, so `localStorage.clear()` here would destroy OTHER
 * projects' data. The `storage` facade removes only keys carrying the
 * `adoptananimal_` prefix, which is exactly why the reset goes through it rather than
 * touching storage directly (STORAGE-NAMESPACE-v8 § 2).
 *
 * **There is no PWA here yet — and the reset is already scoped for one.** No
 * `vite-plugin-pwa`, no hand-written `service-worker.js`, so today the cache and
 * worker halves below do nothing. Writing them AFTER a service worker appears
 * would mean writing them in a hurry, and hurry in this exact spot has already
 * cost other people's data in a sibling project: an unfiltered
 * `getRegistrations()` walk unregisters every service worker on the whole origin,
 * because that is what the API returns. Both halves here filter — caches by the
 * project prefix, registrations by `scope` — and both filters come from the same
 * single source as everything else: `PREFIX` and `base`.
 *
 * **Never throws.** This is the emergency path: it is called when something is
 * already broken, and an exception here would mean 'even the reset is broken'.
 */

/** How many presses arm the gesture. Different numbers, different cost of a mistake. */
export const RESET_PRESSES_DEV = 5;
/**
 * 55 in production — the same number as in the sibling projects on this origin.
 *
 * Large not for difficulty but because the cost of an accidental trigger is every
 * local preference and the whole chat history. Plus the confirmation: together
 * they are two independent barriers, and neither relies on attentiveness.
 */
export const RESET_PRESSES_PROD = 55;

/**
 * The confirmation text is deliberately NOT translated.
 *
 * `confirm()` is a blocking browser dialog, and it may be needed precisely when
 * dictionary loading is what broke: `t()` would then render a key instead of a
 * sentence, so somebody would read 'reset.confirm' right before destroying their
 * data. The one place in this project where a hard-coded string beats a
 * translation.
 */
const CONFIRM_TEXT =
	'This clears all local data for this site: theme, language, favourites, beta marks. Continue?';

/**
 * @param askConfirmation ask first. Mandatory in production: without it the
 * gesture wipes everything with no question asked.
 */
export async function hardReset(askConfirmation = true): Promise<void> {
	if (typeof window === 'undefined') return;

	if (askConfirmation && !window.confirm(CONFIRM_TEXT)) return;

	/*
	 * Each half sits under its own `try`, not all of them together.
	 *
	 * A shared `try` would mean a failure in the first half cancels the second:
	 * cookies refused to clear, so the caches stayed. A reset is called when things
	 * are already broken, so it must do as much as it can.
	 *
	 * The empty `catch` blocks are not an oversight: there is nobody to tell and
	 * nowhere to tell them — this page is about to disappear.
	 */
	try {
		// Prefixed keys only — the neighbours on this origin are untouched.
		storage.clear();
		storage.session.clear();
	} catch {
		/* storage unavailable — the rest of the reset is still worth doing */
	}

	try {
		clearOwnCookies();
	} catch {
		/* cookies blocked — no reason to skip the caches */
	}

	await clearOwnCaches();
	await unregisterOwnWorkers();

	window.location.reload();
}

/**
 * Caches — only our own, by project prefix.
 *
 * `caches.keys()` returns the cache names of the entire ORIGIN, i.e. together
 * with the caches of neighbouring projects on `alik532ua.github.io`. Without the
 * filter this is 'reset everything on the domain', not 'reset this site'.
 */
async function clearOwnCaches(): Promise<void> {
	if (!('caches' in window)) return;
	try {
		const names = await caches.keys();
		await Promise.all(
			names.filter((name) => name.startsWith(PREFIX)).map((name) => caches.delete(name))
		);
	} catch {
		/* Cache API unavailable or blocked */
	}
}

/**
 * Service worker registrations — only our own, by `scope`.
 *
 * `getRegistrations()` also returns registrations for the whole ORIGIN. The scope
 * is compared as a URL rather than as a string: `scope` is always absolute
 * (`https://host/adoptananimal/`) while `base` is a path (`/adoptananimal`), so a direct `startsWith`
 * would never match.
 */
async function unregisterOwnWorkers(): Promise<void> {
	if (!('serviceWorker' in navigator)) return;
	try {
		const registrations = await navigator.serviceWorker.getRegistrations();
		const scopePrefix = new URL(`${base || ''}/`, window.location.origin).href;
		await Promise.all(
			registrations
				.filter((registration) => registration.scope.startsWith(scopePrefix))
				.map((registration) => registration.unregister())
		);
	} catch {
		/* registrations unavailable — the rest of the reset already ran */
	}
}

/**
 * Cookies — only on our own path.
 *
 * `path` has to match the one the cookie was set under, otherwise the write does
 * not delete the entry but duplicates it. `base` IS that path: `/adoptananimal` in
 * production, empty in dev.
 */
function clearOwnCookies(): void {
	const path = base || '/';
	for (const raw of document.cookie.split(';')) {
		const name = raw.split('=')[0]?.trim();
		if (!name) continue;
		document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=${path}`;
	}
}
