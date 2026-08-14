import { browser } from '$app/environment';

/** How long the pointer has to rest before the page starts moving. */
const DELAY_MS = 1000;
/** Floor speed, so the movement actually reaches the target. */
const MIN_SPEED = 90;
/** Peak speed, in scrolled pixels per second. */
const MAX_SPEED = 2600;
/** Seconds for the ramp to reach the peak. */
const RAMP_S = 1.6;
/** How many pixels from the target braking starts. */
const DECEL_PX = 700;
/** Closer than this counts as arrived. */
const ARRIVED_PX = 2;

/** Smooth start, smooth finish: 0 → 0, 1 → 1, zero slope at both ends. */
function smoothstep(x: number): number {
	const t = Math.min(Math.max(x, 0), 1);
	return t * t * (3 - 2 * t);
}

export interface HoldGeometry {
	/** Top of the marker right now, in pixels from the top of the strip. */
	markerTop: number;
	markerHeight: number;
	/** Pixels of strip per pixel of scroll. */
	pxPerScroll: number;
}

/**
 * Hold the pointer above or below the thumb and the page drifts there by itself after
 * a second, with nothing pressed.
 *
 * Shared by the custom bar and both minimaps, because all three are the same model: a
 * marker of some height travelling a strip of some height at a fixed ratio to the
 * scroll. Writing it three times would mean three chances to get the ramp wrong.
 */
export class HoldScroll {
	/** Whether the drift is running, so the markup can show it. */
	holding = $state(false);

	private geometry: () => HoldGeometry;
	private timer: ReturnType<typeof setTimeout> | null = null;
	private frame = 0;
	private started = 0;
	/** Where we are pulling to, in pixels from the top of the strip. */
	private targetY = 0;
	/** The zone the pointer was in at the last aim: -1, 0 or 1. */
	private zone = 0;

	constructor(geometry: () => HoldGeometry) {
		this.geometry = geometry;
	}

	/** Which zone a point falls in relative to the marker: above, on it, or below. */
	zoneOf(localY: number): -1 | 0 | 1 {
		const { markerTop, markerHeight } = this.geometry();
		if (localY < markerTop) return -1;
		if (localY > markerTop + markerHeight) return 1;
		return 0;
	}

	/**
	 * Aim at a point.
	 *
	 * The countdown restarts only when the pointer has CHANGED zone. Otherwise the
	 * faintest tremor of the mouse resets the one-second wait over and over and the
	 * movement never begins.
	 */
	aim(localY: number) {
		const zone = this.zoneOf(localY);
		this.targetY = localY;

		if (zone === 0) {
			this.stop();
			return;
		}
		if (zone === this.zone && (this.timer || this.frame)) return;

		this.stop();
		this.zone = zone;
		this.timer = setTimeout(() => {
			this.timer = null;
			this.started = 0;
			this.holding = true;
			this.frame = requestAnimationFrame(this.step);
		}, DELAY_MS);
	}

	stop = () => {
		if (this.timer) clearTimeout(this.timer);
		if (this.frame) cancelAnimationFrame(this.frame);
		this.timer = null;
		this.frame = 0;
		this.started = 0;
		this.zone = 0;
		this.holding = false;
	};

	private step = (now: number) => {
		if (!browser) return;
		this.frame = requestAnimationFrame(this.step);

		if (!this.started) {
			this.started = now;
			return;
		}

		const { markerHeight, pxPerScroll } = this.geometry();
		if (pxPerScroll <= 0) {
			this.stop();
			return;
		}

		// The pointer ends up at the CENTRE of the marker, not its top: a press centres
		// it, and a drift that aligned the top instead would visibly disagree with the
		// press by half a marker.
		const wantedMarkerTop = this.targetY - markerHeight / 2;
		const maxScroll = Math.max(document.documentElement.scrollHeight - window.innerHeight, 0);
		const targetScroll = Math.min(Math.max(wantedMarkerTop / pxPerScroll, 0), maxScroll);
		const remaining = targetScroll - window.scrollY;
		if (Math.abs(remaining) <= ARRIVED_PX) {
			this.stop();
			return;
		}

		// Ramp from elapsed time, braking from the distance left. Both through
		// smoothstep, so the start and the end are gentle and the middle is quick.
		const rampUp = smoothstep((now - this.started) / 1000 / RAMP_S);
		const slowDown = smoothstep(Math.abs(remaining) / DECEL_PX);
		const speed = MIN_SPEED + (MAX_SPEED - MIN_SPEED) * rampUp * slowDown;

		const step = Math.sign(remaining) * (speed / 60);
		// Never overshoot, or the movement judders around the target.
		const next = Math.abs(step) > Math.abs(remaining) ? targetScroll : window.scrollY + step;

		// 'instant', never 'auto': html has scroll-behavior: smooth, and 'auto' means
		// "read that" — every step would animate against the next.
		window.scrollTo({ top: Math.max(0, next), behavior: 'instant' });
	};
}
