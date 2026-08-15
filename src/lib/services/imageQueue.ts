import type { Attachment } from 'svelte/attachments';

/**
 * How many photos may be downloading at once.
 *
 * The featured carousel holds seventy-four cards, and left to itself the browser starts
 * about ten of them in the same moment. On a fast line that is invisible. On a slow one
 * every download crawls at a tenth of the speed, none of them finishes for a long time,
 * and then they all land within a second of each other — cards that were empty for
 * fifteen seconds and then filled in at once.
 *
 * Three at a time moves the same total bytes over the same total time. What changes is
 * when each individual photo *finishes*: roughly three times sooner, so the cards fill
 * in steadily and the wait reads as progress rather than as a stall.
 *
 * This is a workaround, and worth naming as one: the photos are 1280px wide inside a
 * 300px card, so each is around fifteen times the bytes it needs. Serve them at the size
 * they are shown and the queue stops mattering. Until then it is what makes the wait
 * legible.
 */
const MAX_CONCURRENT = 3;

/**
 * How far outside the viewport a photo starts downloading.
 *
 * Twenty seconds of warning at the carousel's drift speed, which is what a queue three
 * deep needs to stay ahead of the cards arriving. Larger would only lengthen the queue,
 * not the bandwidth.
 */
const LOOKAHEAD = '600px';

let active = 0;
const waiting: Array<() => void> = [];

/**
 * Runs `start` as soon as a slot is free, and returns the function that gives the slot
 * back. Release must be called exactly once per claim — on success, on failure, and on
 * a card that leaves the page before its turn ever comes. A leaked slot is permanent:
 * three of them and nothing else ever loads.
 */
function claimSlot(start: () => void): () => void {
	let released = false;

	const run = () => start();

	if (active < MAX_CONCURRENT) {
		active++;
		run();
	} else {
		waiting.push(run);
	}

	return () => {
		if (released) return;
		released = true;

		const queued = waiting.indexOf(run);
		if (queued !== -1) {
			// It never got a slot, so there is none to hand on.
			waiting.splice(queued, 1);
			return;
		}

		// Hand the slot straight to the next in line rather than releasing and
		// re-counting, so a burst of arrivals cannot slip past the limit between the two.
		const next = waiting.shift();
		if (next) next();
		else active--;
	};
}

/**
 * Loads a photo when it is near the viewport and a download slot is free, then reveals it.
 *
 * `reveal` runs once the picture is decoded and ready to paint, not merely when its bytes
 * arrived — the fade in CSS is meant to start from a whole photograph. It is the only way
 * the photo becomes visible: the stylesheet leaves it at zero opacity wherever a script
 * is running (see `[data-js]` in AnimalCard).
 *
 * `source` is passed in rather than read off the element, because by the time anything
 * else looks the attribute has been taken away.
 */
export function queuedPhoto(
	source: string,
	priority: boolean,
	reveal: () => void
): Attachment<HTMLImageElement> {
	return (img) => {
		// Already there — from the cache, or the browser simply finished before Svelte
		// attached anything. The load event is long gone and nothing would ever reveal it.
		if (img.complete && img.naturalWidth > 0) {
			reveal();
			return;
		}

		let release: (() => void) | undefined;
		const giveBackSlot = () => {
			release?.();
			release = undefined;
		};

		const onLoad = () => {
			// The slot is a share of the network, so it goes back the moment the bytes are
			// in. Decoding is the processor's problem and holds nothing else up.
			giveBackSlot();
			img.decode().then(reveal, reveal);
		};

		img.addEventListener('load', onLoad);
		img.addEventListener('error', giveBackSlot);

		const stopListening = () => {
			img.removeEventListener('load', onLoad);
			img.removeEventListener('error', giveBackSlot);
		};

		// One photo is left to the browser: the priority one is the LCP element, and it
		// waits behind nothing.
		if (priority) {
			return stopListening;
		}

		/*
		 * Everything else is taken back, including downloads already under way.
		 *
		 * Leaving those alone was the first attempt, on the reasoning that aborting throws
		 * away bytes already paid for. Measured on a 600 kbps line it put sixteen photos in
		 * flight at once — the browser starts them while parsing the HTML, long before this
		 * runs, and a cap that exempts them is not a cap. What it costs is small: at the
		 * moment of hydration the bundle has had most of the bandwidth and each photo holds
		 * a few kilobytes.
		 *
		 * Removing the attribute rather than blanking it, because `src=""` is a broken
		 * image and fires an error; an absent src is simply no image yet.
		 *
		 * What the served HTML said is kept in `data-src` and never cleared. It is the only
		 * record of which photograph this element was given, and `tests/ui.spec.ts` reads it
		 * to catch a card wearing another animal's face — the SSR value, deliberately, and
		 * not the URL passed in here, which comes from the component and would agree with
		 * itself even when hydration had paired the two up wrongly.
		 */
		img.dataset.src = img.getAttribute('src') ?? source;
		img.removeAttribute('src');

		const observer = new IntersectionObserver(
			(entries, self) => {
				if (!entries.some((entry) => entry.isIntersecting)) return;
				self.disconnect();

				release = claimSlot(() => {
					// Eager, because from here this decides when the photo loads. Left lazy,
					// the browser could hold the request back and the slot with it.
					img.loading = 'eager';
					img.src = source;
				});
			},
			{ rootMargin: LOOKAHEAD }
		);
		observer.observe(img);

		return () => {
			stopListening();
			observer.disconnect();
			giveBackSlot();
		};
	};
}
