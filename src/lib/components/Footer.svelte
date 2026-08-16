<script lang="ts">
	import Icon from '$lib/components/ui/Icon.svelte';
	import OrgLogos from '$lib/components/OrgLogos.svelte';
	import { t } from '$lib/i18n';
	import { SIDE_PROJECTS } from '$lib/config';

	/** How long the two names stay up after the footer comes into view. */
	const NAMING_MS = 3000;

	let content = $state<HTMLElement | undefined>();
	let naming = $state(false);

	/**
	 * The two side buttons say what they are, then stop.
	 *
	 * On a phone their names only appeared on a press — and a press on a link goes
	 * straight to another site, so the only way to read one was to come back and press
	 * the other. They introduce themselves on arrival instead, and fade once they have.
	 * Leaving the footer and returning starts them over, which is what someone who
	 * missed it will do.
	 *
	 * Not a WCAG 2.2.1 concern: the name is the link's accessible name and stays in the
	 * accessibility tree the whole time — opacity hides it from the eye, not from a
	 * screen reader — and nothing is lost by missing it, since scrolling back brings it
	 * again.
	 */
	$effect(() => {
		if (!content) return;

		let timer: ReturnType<typeof setTimeout> | undefined;
		const observer = new IntersectionObserver(
			([entry]) => {
				clearTimeout(timer);
				if (!entry.isIntersecting) {
					// Reset rather than leave it up, or coming back would show nothing.
					naming = false;
					return;
				}
				naming = true;
				timer = setTimeout(() => (naming = false), NAMING_MS);
			},
			{ threshold: 0.35 }
		);

		observer.observe(content);
		return () => {
			clearTimeout(timer);
			observer.disconnect();
		};
	});
</script>

<footer class="footer" class:footer--naming={naming}>
	<div class="footer__content" bind:this={content}>
		<!-- Two links to the shelter's other sites. Icons only, and barely there until
			 someone comes down here — see .footer__aside in the styles. -->
		<div class="footer__aside">
			{#each SIDE_PROJECTS as project (project.id)}
				<a
					class="footer__aside-link control-shape"
					href={project.url}
					target="_blank"
					rel="noopener noreferrer"
					data-testid="footer-{project.id}-link"
				>
					<!-- The name is the accessible name and the visible label at once, so a
						 screen reader is not told one thing while the screen shows another. -->
					<span class="footer__aside-label">{t(project.key)}</span>
					<Icon name={project.icon} size="1.4rem" />
				</a>
			{/each}
		</div>

		<div class="container">
			<!-- The logos are the footer's own size and spacing; the component owns
				 everything else about them. -->
			<div class="footer__orgs">
				<OrgLogos scope="footer" />
			</div>
		</div>
	</div>
</footer>

<style>
	.footer {
		position: relative;
		margin-top: var(--space-xl);
	}

	.footer__orgs {
		--org-logos-size: 80px;
		--org-logos-gap: var(--space-4xl);
		min-height: 100px;
		padding: var(--space-2xl) 0;
	}

	.footer__content {
		position: relative;
		background: var(--glass-bg);
		-webkit-backdrop-filter: blur(var(--glass-blur));
		backdrop-filter: blur(var(--glass-blur));
		color: var(--color-text);
		padding: var(--space-xl) 0;
	}

	/*
	 * The opacity ladder, from "not in the way" to "you are pointing at me".
	 *
	 * These are the shelter's other projects, not what anyone came here for, so at rest
	 * they are barely a mark. Coming down to the footer brings them to half; pointing at
	 * one brings it fully up and lifts its neighbour part of the way, so the pair reads
	 * as a pair rather than one link appearing out of nowhere.
	 *
	 * :focus-within is on the same rung as :hover throughout. A keyboard user never
	 * hovers, and a control at 10% that never brightens is a control they cannot see
	 * they have reached.
	 */
	.footer__aside {
		position: absolute;
		left: var(--space-lg);
		top: 50%;
		transform: translateY(-50%);
		display: flex;
		flex-direction: column;
		gap: var(--space-sm);
		z-index: 1;
	}

	.footer__aside-link {
		position: relative;
		display: flex;
		align-items: center;
		justify-content: center;
		/* WCAG 2.5.8: faint is not the same as small. */
		width: 44px;
		height: 44px;
		color: var(--color-text);
		opacity: 0.1;
		transition:
			opacity var(--transition-normal),
			background var(--transition-fast);
	}

	.footer__content:hover .footer__aside-link,
	.footer__content:focus-within .footer__aside-link {
		opacity: 0.5;
	}

	.footer__aside:hover .footer__aside-link,
	.footer__aside:focus-within .footer__aside-link {
		opacity: 0.8;
	}

	/*
	 * Written through .footer__aside so it outweighs the 0.8 rule above.
	 *
	 * `.footer__aside-link:hover` alone loses to `.footer__aside:hover .footer__aside-link`
	 * on specificity, so pointing at one lifted the pair to 0.8 and stopped there — the
	 * neighbour brightened and the one under the cursor did not.
	 *
	 * :focus, not :focus-visible. The point is not a focus ring, it is a control at 10%
	 * that a keyboard user has to be able to see they have reached; and on a mouse click
	 * the pointer is already on it, so there is nothing extra to show.
	 */
	.footer__aside .footer__aside-link:hover,
	.footer__aside .footer__aside-link:focus {
		opacity: 1;
		background: var(--control-surface);
	}

	.footer__aside-label {
		position: absolute;
		/* To the right of the glyph: the buttons sit against the left edge of the window,
		   so there is room on that side and none on the other. */
		left: calc(100% + var(--space-sm));
		padding: 4px 10px;
		border-radius: var(--radius-sm);
		background: var(--color-bg-card);
		color: var(--color-text);
		box-shadow: var(--shadow-md);
		font-size: 0.8rem;
		font-weight: 600;
		white-space: nowrap;
		opacity: 0;
		pointer-events: none;
		transition: opacity var(--transition-fast);
	}

	.footer__aside-link:hover .footer__aside-label,
	.footer__aside-link:focus .footer__aside-label {
		opacity: 1;
	}

	@media (prefers-reduced-motion: reduce) {
		.footer__aside-link,
		.footer__aside-label {
			transition: none;
		}
	}

	@media (max-width: 700px) {
		/*
		 * One at each edge rather than stacked in the corner.
		 *
		 * Two 44px targets in a column need 96px of footer to sit beside, which is height
		 * this footer was spending on nothing else. Side by side they fit in the row the
		 * logos already occupy.
		 */
		.footer__aside {
			left: var(--space-sm);
			right: var(--space-sm);
			flex-direction: row;
			justify-content: space-between;
		}

		/*
		 * Under the button, not beside it — and pinned to the edge the button stands on.
		 *
		 * The two buttons now sit at opposite edges of the footer, so a label opening
		 * sideways from the right-hand one ran off the page. That is not merely clipped:
		 * it widened the document, and everything else — the back-to-top button included —
		 * shifted with it.
		 *
		 * Centring under the button would put half the label past the same edge, so each
		 * one is anchored to its own side instead: the left button's label starts where
		 * the button starts, the right button's ends where the button ends.
		 */
		.footer__aside-label {
			top: calc(100% + var(--space-xs));
			bottom: auto;
			left: 0;
			right: auto;
		}

		.footer__aside-link:last-child .footer__aside-label {
			left: auto;
			right: 0;
		}

		.footer__content {
			padding: var(--space-lg) 0;
		}

		.footer__orgs {
			--org-logos-size: 60px;
			--org-logos-gap: var(--space-xl);
			min-height: 0;
			padding: var(--space-md) 0;
		}
	}

	@media (max-width: 768px) {
		/*
		 * One weight, and one a finger can find.
		 *
		 * The ladder these climb — 0.1 on the page, 0.5 in the footer, 0.8 beside the one
		 * being pointed at, 1 under it — is built entirely on hover, which a phone does
		 * not have. There it collapsed to the bottom rung and left a control nobody could
		 * reveal, so on a phone they simply hold 80% and step back only while a panel is
		 * open.
		 *
		 * Written through .footer__aside so it outweighs the hover rules, which are more
		 * specific than a bare .footer__aside-link.
		 */
		.footer__aside .footer__aside-link {
			opacity: 0.8;
		}

		/* Up on arrival, then gone. Written through .footer__aside so it outweighs the
		   hover rule, which is more specific than a bare .footer__aside-label. */
		.footer--naming .footer__aside .footer__aside-label {
			opacity: 1;
		}

		/* Slower than the hover fade: this one is not answering a gesture, so it should
		   read as the label withdrawing rather than as something being switched off. */
		.footer__aside .footer__aside-label {
			transition: opacity var(--transition-slow);
		}
	}

	/*
	 * Whenever a logo is showing its accounts, the rest of the footer steps back.
	 *
	 * Two selectors for the two states: a tap sets a class on the component, a hover sets
	 * nothing at all. :global around both, since neither class is this component's and
	 * Svelte would otherwise prune the rule as unused; :has rather than reaching in for
	 * the class, because "is that component showing anything" is a question about what is
	 * on screen, not about how it is built.
	 *
	 * Last in the file on purpose: it has the same specificity as the resting weight set
	 * inside the media block above, so source order is what decides.
	 */
	.footer__content:has(:global(.org-logos--revealing)) .footer__aside .footer__aside-link,
	.footer__content:has(:global(.org-logos__item:hover)) .footer__aside .footer__aside-link {
		opacity: 0.5;
	}
</style>
