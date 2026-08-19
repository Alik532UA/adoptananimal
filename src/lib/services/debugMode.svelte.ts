import { browser, dev } from '$app/environment';
import { storage } from '$lib/services/storage';

/**
 * Whether the service badge is shown — and what a `V` run costs to flip it.
 *
 * **Three states, not two, which is why this is not a `boolean`.** The stored
 * flag can mean 'show', 'hide' or 'nothing said', and the third state is needed
 * because the DEFAULT differs per environment: visible in dev, hidden in
 * production. A `boolean` defaulting to `false` would hide the dev badge; one
 * defaulting to `true` would show it to every visitor.
 *
 * ```
 * override === null   → whatever this environment does (dev: shown, prod: not)
 * override === true   → shown regardless
 * override === false  → hidden regardless
 * ```
 *
 * **The thresholds are asymmetric on purpose.** Revealing the badge in
 * production costs 55 presses, hiding it costs 5; in dev both cost 5. It depends
 * on what the threshold protects: in production it keeps a service control away
 * from a passing visitor, so it has to be high. Hiding harms nobody, so making it
 * expensive buys nothing — and in dev the badge is already visible, where it gets
 * hidden for a clean screenshot. Charging 55 presses for a screenshot would be a
 * punishment.
 *
 * **Hydrate in the constructor, write in the mutator.** An `$effect` here would
 * throw `effect_orphan`: this is a module-level singleton.
 */

/** Reveal in production. High, because it guards a service control from visitors. */
export const SHOW_PRESSES_PROD = 55;
/** Hide — and reveal in dev. No consequences, so no need to make it expensive. */
export const HIDE_PRESSES = 5;

class DebugMode {
	/** `null` — 'nothing said': the environment's default applies. */
	override = $state<boolean | null>(null);

	constructor() {
		// `browser &&` matters: there is no storage during prerender, and the
		// facade — which never throws — would just answer `null` there anyway.
		if (browser) {
			const stored = storage.get('debug_mode');
			this.override = stored === '1' ? true : stored === '0' ? false : null;
		}
	}

	/** Shown right now, ignoring `?debug=1`, which applies on top. */
	get enabled(): boolean {
		return this.override ?? dev;
	}

	/**
	 * How many `V` presses flip the state RIGHT NOW.
	 *
	 * Read on every press, because the answer changes once the gesture fires: with
	 * the badge visible, the next run costs 5 rather than 55.
	 */
	get pressesToToggle(): number {
		if (this.enabled) return HIDE_PRESSES;
		return dev ? HIDE_PRESSES : SHOW_PRESSES_PROD;
	}

	/** Flip it. Returns the new state so the caller can log it. */
	toggle(): boolean {
		const next = !this.enabled;
		this.override = next;
		/*
		 * Write-through, and it writes `'0'` rather than removing the key.
		 *
		 * Removing it would restore 'nothing said' — so in dev the badge would come
		 * back after a reload, right after somebody asked for it to be hidden. The
		 * three states in storage have to be the same three that exist in memory.
		 */
		storage.set('debug_mode', next ? '1' : '0');
		return next;
	}
}

export const debugMode = new DebugMode();
