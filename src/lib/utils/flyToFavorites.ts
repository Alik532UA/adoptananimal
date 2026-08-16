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

/**
 * How long one heart takes to cross, and it has been slowed twice.
 *
 * 620ms was quicker than the eye follows: the counter changed and something had
 * happened, but not visibly a journey from here to there, which is the only thing this
 * is for. 950 was better and still hurried. At 1400 the trip is something you watch
 * rather than something you notice afterwards.
 *
 * Everything else here is expressed as a fraction of it — the colour turn, the pulse at
 * the far end — so changing this number moves them together and none of them has to be
 * re-tuned.
 */
const DURATION_MS = 1400;

/** Each one leaves slightly after the last, so the group reads as a stream. */
const STAGGER_MS = 70;

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

	/*
	 * The hearts leave red and arrive in the theme's colour.
	 *
	 * Red is what a heart is at the moment you press it — it is the colour the filled
	 * glyph on the card turns, so the particles start as pieces of the thing you just
	 * clicked. By the time they reach the counter they are the site's accent, which is
	 * what the counter is. The journey says both: this came from there, and it belongs
	 * here now.
	 *
	 * Resolved to concrete values first. `var(--…)` inside WAAPI keyframes is not
	 * dependable — custom properties are not animatable there in every engine, and a
	 * keyframe the browser cannot parse is dropped in silence, leaving the base colour
	 * and no hint that anything was meant to happen.
	 */
	const palette = getComputedStyle(document.documentElement);
	const startColour = palette.getPropertyValue('--color-error').trim() || 'crimson';
	const endColour = palette.getPropertyValue('--color-primary').trim() || 'currentColor';

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
		 *
		 * The numbers are half what they were. The last heart used to swing 96px wide and
		 * 88px above the line, which is not a flourish on a journey, it is a loop: the
		 * outer ones read as going somewhere else entirely and only turned back at the
		 * end. Enough curve to be a curve.
		 */
		const spread = (i % 2 === 0 ? 1 : -1) * (8 + i * 7);
		const midX = (from.x + to.x) / 2 + spread;
		const midY = Math.min(from.y, to.y) - 20 - i * 4;

		const animation = particle.animate(
			[
				{
					transform: `translate3d(${from.x}px, ${from.y}px, 0) scale(0.4)`,
					opacity: 0,
					color: startColour
				},
				{
					transform: `translate3d(${from.x}px, ${from.y}px, 0) scale(1.15)`,
					opacity: 1,
					color: startColour,
					offset: 0.15
				},
				/*
				 * The turn happens EARLY — done by about a quarter of the way across.
				 *
				 * Offsets are not wall-clock here: the easing below is front-loaded, so
				 * the effect is already ~64% through at a quarter of the duration. That
				 * cuts both ways and has caught me twice. A ramp on 0.15–0.6 finished so
				 * soon it read as no ramp at all; moved to 0.5–0.95 it finished around
				 * two thirds of the way, which read as changing at the end. Ending it at
				 * 0.5 puts the last of the red at roughly 240ms of 950 — a quarter, in
				 * the time the eye actually measures.
				 *
				 * A keyframe may carry only some properties; transform interpolates across
				 * this one as though it were not here.
				 */
				{ color: endColour, offset: 0.5 },
				{
					transform: `translate3d(${midX}px, ${midY}px, 0) scale(1)`,
					opacity: 1,
					offset: 0.6
				},
				{
					transform: `translate3d(${to.x}px, ${to.y}px, 0) scale(0.3)`,
					opacity: 0
				}
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
