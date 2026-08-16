/**
 * A handful of hearts leaving the button that was pressed and arriving at the
 * favourites link in the header.
 *
 * WHY IT EXISTS. Saving an animal changes two things a long way apart: the heart under
 * the pointer fills, and a counter in the header goes up. On a tall page the second one
 * is off-screen, so the visitor is told the thing worked in a place they are not
 * looking. The particles are the sentence joining the two — they say *where it went*,
 * which is the part a state change on its own cannot.
 *
 * WHY PLAIN DOM AND NOT A COMPONENT. Nothing here is state: it starts on a click, runs
 * for six hundred milliseconds and removes itself. A component would need mounting
 * somewhere that outlives the page it was triggered from, and the favourites button
 * exists on both a card in a list and an animal's own page. A function both can call is
 * the smaller thing.
 *
 * Everything it makes is `position: fixed` inside one `pointer-events: none` layer, so
 * it cannot move the page, cannot be clicked and cannot be tabbed into. It is
 * decoration, and `aria-hidden` says so.
 */

/** Enough to read as a handful; more looks like confetti and costs frames. */
const PARTICLE_COUNT = 7;

const DURATION_MS = 620;
/** Each one leaves slightly after the last, so the group reads as a stream. */
const STAGGER_MS = 45;

/**
 * The link the hearts fly to. Its locator is generated in HeaderNavLinks.svelte from
 * the route, so it is `nav-favorites-link` for `/favorites`.
 */
const TARGET = '[data-testid="nav-favorites-link"]';

/** Centre of an element, in viewport coordinates. */
function centreOf(element: Element): { x: number; y: number } {
	const box = element.getBoundingClientRect();
	return { x: box.left + box.width / 2, y: box.top + box.height / 2 };
}

/**
 * The favourites link that is actually on screen.
 *
 * There are two in the document — the bar and the mobile menu — and only one of them is
 * laid out at any width. `getClientRects()` is empty for the other, and flying to a box
 * at 0,0 would send every heart to the top-left corner of the window.
 */
function visibleTarget(): Element | null {
	return (
		[...document.querySelectorAll(TARGET)].find((el) => el.getClientRects().length > 0) ?? null
	);
}

export function flyToFavorites(origin: Element): void {
	if (typeof window === 'undefined') return;

	// The whole point of this is movement, so under reduced motion there is nothing to
	// degrade to: it simply does not run. The heart still fills and the counter still
	// changes, which is the information; this was only ever the flourish on top.
	if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

	const target = visibleTarget();
	if (!target) return;

	const from = centreOf(origin);
	const to = centreOf(target);

	const layer = document.createElement('div');
	layer.className = 'fly-to-favorites';
	layer.setAttribute('aria-hidden', 'true');
	layer.dataset.testid = 'favorite-flight-container';
	document.body.append(layer);

	const animations: Animation[] = [];

	for (let i = 0; i < PARTICLE_COUNT; i++) {
		const particle = document.createElement('span');
		particle.className = 'fly-to-favorites__heart';
		particle.textContent = '♥';
		layer.append(particle);

		/*
		 * A bow rather than a straight line, and each one bows differently.
		 *
		 * Seven hearts on the same path are one heart drawn seven times. The midpoint is
		 * pushed sideways by a spread that alternates left and right and grows with the
		 * index, and lifted above the straight line — so they leave together, fan out,
		 * and come back together at the counter.
		 */
		const spread = (i % 2 === 0 ? 1 : -1) * (12 + i * 14);
		const midX = (from.x + to.x) / 2 + spread;
		const midY = Math.min(from.y, to.y) - 40 - i * 8;

		const animation = particle.animate(
			[
				{ transform: `translate3d(${from.x}px, ${from.y}px, 0) scale(0.4)`, opacity: 0 },
				{
					transform: `translate3d(${from.x}px, ${from.y}px, 0) scale(1.15)`,
					opacity: 1,
					offset: 0.15
				},
				{ transform: `translate3d(${midX}px, ${midY}px, 0) scale(1)`, opacity: 1, offset: 0.6 },
				{ transform: `translate3d(${to.x}px, ${to.y}px, 0) scale(0.3)`, opacity: 0 }
			],
			{
				duration: DURATION_MS,
				delay: i * STAGGER_MS,
				// Out fast, in slow: it should look thrown rather than dragged.
				easing: 'cubic-bezier(0.22, 0.61, 0.36, 1)',
				fill: 'forwards'
			}
		);

		animations.push(animation);
	}

	// A small answering pulse on the counter, timed to when the first heart lands.
	const arrival = target.animate(
		[{ transform: 'scale(1)' }, { transform: 'scale(1.18)' }, { transform: 'scale(1)' }],
		{ duration: 300, delay: DURATION_MS * 0.75, easing: 'ease-out' }
	);
	animations.push(arrival);

	/*
	 * Removed when the last one finishes, and `catch` is not optional: an animation is
	 * rejected if it is cancelled, which happens whenever the element goes away first —
	 * a navigation mid-flight, for instance. Without it that is an unhandled rejection
	 * in the console of anyone who clicks and immediately leaves.
	 */
	Promise.allSettled(animations.map((a) => a.finished)).finally(() => layer.remove());
}
