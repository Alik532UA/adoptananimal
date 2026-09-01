// @vitest-environment node
import { describe, expect, it } from 'vitest';
import { queuedPhoto } from './imageQueue';
import { photoIsBroken } from '$lib/utils/imageFallback';

/**
 * The two questions the queue answers before it queues anything, and the one rule
 * both of them turn on.
 *
 * `imageQueue.ts` is mostly an `IntersectionObserver`, which has nothing to observe
 * outside a browser — that is why it sat at 0% and why PROJECT-CONTEXT § 4.25 says
 * so. The paths below are the exception: they run before any observer exists, they
 * decide what the visitor sees when a photograph is already settled by the time the
 * component mounts, and they are the paths that took over from the `onerror`
 * attribute the site's CSP blocks (`$lib/utils/imageFallback`).
 *
 * The rule they share is easy to get backwards. `img.complete` is true for an
 * element that has no `src` at all, and the queue deliberately takes `src` away from
 * every photo waiting its turn. Read `complete && !naturalWidth` as failure without
 * asking about `src`, and the fallback glyph lands on every queued card on the page
 * — which is most of them, on a slow line, for as long as the queue is working
 * correctly.
 *
 * Reverse experiment (AI-AGENT-PITFALLS-v8 § 1.1): dropping the `src` guard from
 * `photoIsBroken` fails "a photo still waiting its turn is not a broken photo";
 * dropping the early `photoIsBroken` branch from `queuedPhoto` fails "a photo that
 * failed before the attachment ran".
 */

/** The four properties these paths read, and nothing else. */
function fakeImage(props: { src: string | null; complete: boolean; naturalWidth: number }) {
	return {
		complete: props.complete,
		naturalWidth: props.naturalWidth,
		getAttribute: (name: string) => (name === 'src' ? props.src : null),
		addEventListener: () => {},
		removeEventListener: () => {},
		dataset: {} as Record<string, string>,
		removeAttribute: () => {}
	} as unknown as HTMLImageElement;
}

/** What the attachment did, without a DOM to do it in. */
function attach(img: HTMLImageElement, priority = false) {
	const calls: string[] = [];
	const cleanup = queuedPhoto('/images/animals/cat_basti.jpg', priority, {
		reveal: () => calls.push('reveal'),
		failed: () => calls.push('failed')
	})(img);
	return { calls, cleanup };
}

describe('photoIsBroken', () => {
	it('is true only for an element that was given a source and could not show it', () => {
		expect(photoIsBroken(fakeImage({ src: '/a.jpg', complete: true, naturalWidth: 0 }))).toBe(true);
	});

	it('a photo still waiting its turn is not a broken photo', () => {
		// The queue removes `src`; an element with no source is "complete" with nothing
		// loaded, which is the same pair of values a real failure produces.
		expect(photoIsBroken(fakeImage({ src: null, complete: true, naturalWidth: 0 }))).toBe(false);
	});

	it('a photo that arrived is not broken, and neither is one still loading', () => {
		expect(photoIsBroken(fakeImage({ src: '/a.jpg', complete: true, naturalWidth: 400 }))).toBe(
			false
		);
		expect(photoIsBroken(fakeImage({ src: '/a.jpg', complete: false, naturalWidth: 0 }))).toBe(
			false
		);
	});
});

describe('queuedPhoto, before anything is observed', () => {
	it('reveals a photo the browser already finished', () => {
		const { calls } = attach(fakeImage({ src: '/a.jpg', complete: true, naturalWidth: 400 }));
		expect(calls).toEqual(['reveal']);
	});

	it('reports a photo that failed before the attachment ran', () => {
		// The window the blocked `onerror="this.__e=event"` attribute used to cover:
		// the served HTML asked for a picture, the browser gave up on it, and the
		// component mounted afterwards with no event left to hear.
		const { calls } = attach(fakeImage({ src: '/a.jpg', complete: true, naturalWidth: 0 }));
		expect(calls).toEqual(['failed']);
	});

	it('says nothing yet about a photo that is still on its way', () => {
		const { calls } = attach(fakeImage({ src: '/a.jpg', complete: false, naturalWidth: 0 }), true);
		expect(calls).toEqual([]);
	});
});
