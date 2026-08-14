import { browser } from '$app/environment';
import { logService } from '$lib/services/logService.svelte';

/**
 * Core Web Vitals collection.
 *
 * Lives here rather than in +layout.svelte because three PerformanceObserver
 * subscriptions with their own cleanup are logic, not markup, and a component that
 * carries them is a component nobody wants to touch.
 *
 * INP replaces FID, which Google retired as a Core Web Vital in March 2024: FID
 * only measured the delay before the first handler ran, so a page could score well
 * while every interaction after the first one stuttered.
 */
export class WebVitals {
	#observers: PerformanceObserver[] = [];
	#cls = 0;

	/** Starts collecting. Returns a cleanup function for the caller's $effect. */
	start(): () => void {
		if (!browser || !('PerformanceObserver' in window)) {
			return () => {};
		}

		this.#observe('largest-contentful-paint', (entries) => {
			const last = entries.at(-1);
			if (last) logService.perf('LCP', `${last.startTime.toFixed(0)}ms`);
		});

		this.#observe('layout-shift', (entries) => {
			for (const entry of entries as (PerformanceEntry & {
				value: number;
				hadRecentInput: boolean;
			})[]) {
				if (!entry.hadRecentInput) this.#cls += entry.value;
			}
			logService.perf('CLS', this.#cls.toFixed(4));
		});

		this.#observe('event', (entries) => {
			// Report the worst interaction seen so far, which is what INP reflects.
			const worst = Math.max(...entries.map((e) => e.duration));
			if (worst > 0) logService.perf('INP', `${worst.toFixed(0)}ms`);
		});

		return () => this.stop();
	}

	stop() {
		for (const observer of this.#observers) observer.disconnect();
		this.#observers = [];
	}

	#observe(type: string, handler: (entries: PerformanceEntry[]) => void) {
		try {
			const observer = new PerformanceObserver((list) => handler(list.getEntries()));
			// durationThreshold is part of the Event Timing spec and applies to 'event'
			// only; lib.dom.d.ts does not carry it yet, hence the cast.
			observer.observe({
				type,
				buffered: true,
				durationThreshold: 40
			} as PerformanceObserverInit);
			this.#observers.push(observer);
		} catch {
			// An unsupported entry type is expected on older browsers, not a failure:
			// warn, per the logging levels in DEBUGGING § 1.3.
			logService.warn('performance', `PerformanceObserver does not support "${type}"`);
		}
	}
}

export const webVitals = new WebVitals();
