export type ToastType = 'success' | 'error' | 'warn' | 'info';

export interface ToastAction {
	label: string;
	onAction: () => void;
}

export interface ToastMessage {
	id: number;
	type: ToastType;
	message: string;
	action?: ToastAction;
	/** Single source of truth: the same value drives setTimeout and the CSS progress bar. */
	duration: number;
	/** When set the toast is anchored next to this element instead of the corner stack. */
	anchor?: HTMLElement;
}

interface Timer {
	timerId: ReturnType<typeof setTimeout> | null;
	startedAt: number;
	elapsed: number;
	/** Reference count, not a boolean: hover and focus overlap, and leaving with the
	 *  pointer while the action button still has focus must not restart the countdown. */
	holds: number;
}

const MAX_TOASTS = 4;
const DEFAULT_DURATION = 5000;

/**
 * Central toast state. Any component calls `toast.success(...)` directly; nothing
 * keeps a local dismissal flag, which is what makes the pause behaviour survive
 * being moved between sections.
 */
class ToastState {
	messages = $state<ToastMessage[]>([]);

	#nextId = 1;
	#timers = new Map<number, Timer>();

	show(
		type: ToastType,
		message: string,
		duration = DEFAULT_DURATION,
		action?: ToastAction,
		anchor?: HTMLElement
	): number {
		const id = this.#nextId++;

		// An anchored toast replaces any previous one for the same anchor, so
		// clicking the same email twice does not stack two identical messages.
		if (anchor) {
			for (const existing of this.messages.filter((m) => m.anchor === anchor)) {
				this.dismiss(existing.id);
			}
		}

		this.messages = [...this.messages, { id, type, message, action, duration, anchor }];

		while (this.messages.length > MAX_TOASTS) {
			this.dismiss(this.messages[0].id);
		}

		this.#timers.set(id, {
			timerId: setTimeout(() => this.dismiss(id), duration),
			startedAt: Date.now(),
			elapsed: 0,
			holds: 0
		});

		return id;
	}

	success = (message: string, duration?: number, action?: ToastAction, anchor?: HTMLElement) =>
		this.show('success', message, duration, action, anchor);

	error = (message: string, duration?: number, action?: ToastAction, anchor?: HTMLElement) =>
		this.show('error', message, duration, action, anchor);

	warn = (message: string, duration?: number, action?: ToastAction, anchor?: HTMLElement) =>
		this.show('warn', message, duration, action, anchor);

	info = (message: string, duration?: number, action?: ToastAction, anchor?: HTMLElement) =>
		this.show('info', message, duration, action, anchor);

	dismiss(id: number) {
		const timer = this.#timers.get(id);
		if (timer?.timerId) clearTimeout(timer.timerId);
		this.#timers.delete(id);
		this.messages = this.messages.filter((m) => m.id !== id);
	}

	/** WCAG 2.2.1: the countdown stops while the toast is hovered or focused. */
	pause(id: number) {
		const timer = this.#timers.get(id);
		if (!timer) return;

		timer.holds += 1;
		if (timer.holds > 1) return;

		if (timer.timerId) {
			clearTimeout(timer.timerId);
			timer.timerId = null;
		}
		timer.elapsed += Date.now() - timer.startedAt;
	}

	/** Resumes from where it stopped, not from the full duration. */
	resume(id: number) {
		const timer = this.#timers.get(id);
		if (!timer) return;

		timer.holds = Math.max(0, timer.holds - 1);
		if (timer.holds > 0 || timer.timerId) return;

		const message = this.messages.find((m) => m.id === id);
		if (!message) return;

		const remaining = Math.max(0, message.duration - timer.elapsed);
		timer.startedAt = Date.now();
		timer.timerId = setTimeout(() => this.dismiss(id), remaining);
	}

	/** Milliseconds already spent, so the progress bar can start mid-way after a pause. */
	elapsedOf(id: number): number {
		const timer = this.#timers.get(id);
		if (!timer) return 0;
		return timer.holds > 0 ? timer.elapsed : timer.elapsed + (Date.now() - timer.startedAt);
	}

	clear() {
		for (const { timerId } of this.#timers.values()) {
			if (timerId) clearTimeout(timerId);
		}
		this.#timers.clear();
		this.messages = [];
	}
}

export const toast = new ToastState();
