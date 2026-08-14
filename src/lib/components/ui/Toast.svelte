<script lang="ts">
	import { MediaQuery } from 'svelte/reactivity';
	import { toast, type ToastMessage } from '$lib/controllers/toast.svelte';
	import { t } from '$lib/i18n';
	import Icon from '$lib/components/ui/Icon.svelte';

	// Presentational only: it renders toast.messages and calls back into the
	// controller. All timing lives there.

	const reducedMotion = new MediaQuery('(prefers-reduced-motion: reduce)');

	const global = $derived(toast.messages.filter((m) => !m.anchor));
	const anchored = $derived(toast.messages.filter((m) => m.anchor));

	/** Places an anchored toast next to its trigger, flipping above when there is no room below. */
	function place(node: HTMLElement, message: ToastMessage) {
		const position = () => {
			const anchor = message.anchor;
			if (!anchor) return;

			const rect = anchor.getBoundingClientRect();
			const height = node.offsetHeight;
			const gap = 8;
			const below = rect.bottom + gap + height <= window.innerHeight;

			node.style.top = below ? `${rect.bottom + gap}px` : `${rect.top - gap - height}px`;
			node.style.left = `${Math.min(
				Math.max(gap, rect.left + rect.width / 2 - node.offsetWidth / 2),
				window.innerWidth - node.offsetWidth - gap
			)}px`;
		};

		position();
		window.addEventListener('scroll', position, { passive: true });
		window.addEventListener('resize', position);

		return () => {
			window.removeEventListener('scroll', position);
			window.removeEventListener('resize', position);
		};
	}

	const iconFor = (type: ToastMessage['type']) =>
		type === 'success' ? 'heart-filled' : type === 'error' ? 'paw' : 'idea';
</script>

{#snippet toastCard(message: ToastMessage)}
	<!-- role=alert interrupts for errors; everything else is announced politely. -->
	<div
		class="toast toast--{message.type}"
		role={message.type === 'error' ? 'alert' : 'status'}
		onmouseenter={() => toast.pause(message.id)}
		onmouseleave={() => toast.resume(message.id)}
		onfocusin={() => toast.pause(message.id)}
		onfocusout={() => toast.resume(message.id)}
		data-testid="toast-{message.type}-toast"
	>
		<span class="toast__icon" aria-hidden="true">
			<Icon name={iconFor(message.type)} size="1.25rem" />
		</span>

		<span class="toast__message">{message.message}</span>

		{#if message.action}
			<button
				class="toast__action"
				onclick={() => {
					message.action?.onAction();
					toast.dismiss(message.id);
				}}
				data-testid="toast-action-btn"
			>
				{message.action.label}
			</button>
		{/if}

		<button
			class="toast__close"
			onclick={() => toast.dismiss(message.id)}
			aria-label={t('a11y.dismissNotification')}
			data-testid="toast-close-btn"
		>
			<Icon name="close" size="1rem" />
		</button>

		<!-- The bar is driven by the same duration value as the timer, and pauses with
			 it through the same :hover / :focus-within rule. -->
		{#if !reducedMotion.current}
			<span
				class="toast__progress"
				aria-hidden="true"
				style="animation-duration: {message.duration}ms; animation-delay: -{toast.elapsedOf(
					message.id
				)}ms"
			></span>
		{/if}
	</div>
{/snippet}

{#if global.length > 0}
	<div class="toast-stack" data-testid="toast-list">
		{#each global as message (message.id)}
			{@render toastCard(message)}
		{/each}
	</div>
{/if}

{#each anchored as message (message.id)}
	<div class="toast-anchored" {@attach (node) => place(node, message)}>
		{@render toastCard(message)}
	</div>
{/each}

<style>
	.toast-stack {
		position: fixed;
		bottom: var(--space-xl);
		left: 50%;
		transform: translateX(-50%);
		z-index: 200;
		display: flex;
		flex-direction: column;
		gap: var(--space-sm);
		width: min(420px, calc(100vw - 2 * var(--space-md)));
	}

	/*
	 * Sized to what it holds, not to a fixed 360px.
	 *
	 * At a fixed width the same toast came out two lines for info@notpfote.de and three
	 * for vet.crew.cooperation@gmail.com, and the action lost whatever the address took
	 * — "Open mail client" clipped mid-word. An address is one unbreakable token, so the
	 * width the toast needs is a property of the address, and the only thing worth
	 * fixing is the point past which it stops growing.
	 */
	.toast-anchored {
		position: fixed;
		z-index: 200;
		width: max-content;
		max-width: min(520px, calc(100vw - 2 * var(--space-md)));
	}

	.toast {
		position: relative;
		display: flex;
		align-items: center;
		/* Wraps rather than squeezing: on a narrow screen the action drops to its own row
		   whole, instead of being compressed into the message and cut off. */
		flex-wrap: wrap;
		gap: var(--space-sm);
		padding: var(--space-md) var(--space-lg);
		border-radius: var(--radius-md);
		background: var(--color-bg-card);
		color: var(--color-text);
		box-shadow: var(--shadow-lg);
		overflow: hidden;
		border-left: 4px solid var(--color-primary);
	}

	.toast--success {
		border-left-color: var(--color-success);
	}
	.toast--error {
		border-left-color: var(--color-error);
	}
	.toast--warn {
		border-left-color: var(--color-secondary);
	}

	.toast__icon {
		display: flex;
		flex-shrink: 0;
		color: var(--color-primary);
	}

	.toast__message {
		flex: 1;
		min-width: 0;
		font-size: 0.95rem;
		line-height: 1.4;
		/* The message carries its own line break — see emailAction.ts. */
		white-space: pre-line;
		/* An email address has nowhere to break, so at a narrow width it would otherwise
		   push out of the toast rather than wrap inside it. */
		overflow-wrap: anywhere;
	}

	.toast__action {
		flex-shrink: 0;
		/* Right-aligned when it wraps onto its own row. */
		margin-left: auto;
		/* The label is a single instruction and reads as one. Left to wrap it broke after
		   the first word and the second was cut off by the toast's edge. */
		white-space: nowrap;
		background: none;
		border: none;
		padding: 6px 10px;
		border-radius: var(--radius-sm);
		font: inherit;
		font-weight: 700;
		color: var(--color-primary);
		cursor: pointer;
		transition: background var(--transition-fast);
	}

	.toast__action:hover {
		background: color-mix(in srgb, var(--color-primary) 12%, transparent);
	}

	.toast__close {
		flex-shrink: 0;
		display: flex;
		align-items: center;
		justify-content: center;
		/* WCAG 2.5.8 target size */
		min-width: 44px;
		min-height: 44px;
		margin: -10px -10px -10px 0;
		background: none;
		border: none;
		color: var(--color-text-muted);
		cursor: pointer;
		/*
		 * No transition here on purpose (UI-ELEMENTS-v8 § 1.4).
		 *
		 * The quarter turn lives in one global rule keyed on the close-button locator, and
		 * a scoped `transition: color` outranks it — which left the button jumping to its
		 * rotated position with no movement to see. A cross looks the same after 90°, so
		 * with the movement gone the rule appeared not to work at all.
		 */
	}

	.toast__close:hover {
		color: var(--color-text);
	}

	.toast__progress {
		position: absolute;
		left: 0;
		bottom: 0;
		height: 3px;
		width: 100%;
		transform-origin: left;
		background: var(--color-primary);
		opacity: 0.5;
		animation-name: toast-countdown;
		animation-timing-function: linear;
		animation-fill-mode: forwards;
	}

	/* One rule pauses the visual timer for both hover and keyboard focus, matching
	   the reference count in the controller. */
	.toast:hover .toast__progress,
	.toast:focus-within .toast__progress {
		animation-play-state: paused;
	}

	@keyframes toast-countdown {
		from {
			transform: scaleX(1);
		}
		to {
			transform: scaleX(0);
		}
	}
</style>
