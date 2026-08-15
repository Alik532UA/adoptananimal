<script lang="ts">
	import { withBase } from '$lib/utils/withBase';
	import Icon from '$lib/components/ui/Icon.svelte';
	import { t } from '$lib/i18n';
	import { handleEmailClick } from '$lib/utils/emailAction';
	import { SIDE_PROJECTS } from '$lib/config';
	import { ORGANIZATIONS, SOCIAL_NAMES } from '$lib/data/organizations';

	let activeOrg = $state<string | null>(null);

	// Proper nouns, so no i18n: these are the accessible names of the icon links,
	// which previously read out as "inst", "fb", "li".

	function toggleOrg(id: string, e: MouseEvent) {
		if (window.innerWidth <= 768) {
			if (activeOrg !== id) {
				e.preventDefault();
				activeOrg = id;
			}
		}
	}

	/*
	 * Collapse the mobile fly-out on a click outside it.
	 *
	 * The target has to be checked. Without that, the very click that opened the panel
	 * bubbled up to this listener a moment later and closed it again — the fly-out
	 * appeared and vanished within one frame, which looks exactly like a tap that did
	 * nothing at all. It also took the social links with it: pressing one closed the
	 * panel before the press could land.
	 */
	$effect(() => {
		const close = (event: MouseEvent) => {
			const target = event.target;
			if (target instanceof Element && target.closest('.footer__org-wrapper')) return;
			activeOrg = null;
		};
		window.addEventListener('click', close);
		return () => window.removeEventListener('click', close);
	});
</script>

<footer class="footer">
	<div class="footer__content">
		<!-- Two links to the shelter's other sites. Icons only, and barely there until
			 someone comes down here — see .footer__aside in the styles. -->
		<div class="footer__aside">
			{#each SIDE_PROJECTS as project (project.id)}
				<a
					class="footer__aside-link"
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
			<div class="footer__logos">
				{#each ORGANIZATIONS as org (org.id)}
					<!-- Reveal is CSS-only (:hover and :focus-within); activeOrg covers the
						 mobile tap-to-reveal, where there is no hover to rely on. -->
					<div
						class="footer__org-wrapper"
						class:footer__org-wrapper--active={activeOrg === org.id}
						class:footer__org-wrapper--left={org.id === 'notpfote'}
					>
						<a
							href={org.url}
							target="_blank"
							rel="noopener noreferrer"
							class="footer__org-link"
							onclick={(e) => toggleOrg(org.id, e)}
							data-testid={`footer-org-${org.id}-link`}
						>
							<img src={withBase(org.logo)} alt={org.name} class="footer__logo-img" />
						</a>

						<div class="footer__social-flyout">
							{#each org.socials as social, i (social.id)}
								<a
									href={social.url}
									target="_blank"
									rel="noopener noreferrer"
									class="footer__social-icon-link"
									style="--index: {i}"
									onclick={(e) =>
										social.url.startsWith('mailto:')
											? handleEmailClick(e, social.url.slice('mailto:'.length))
											: undefined}
									title="{org.name} — {SOCIAL_NAMES[social.id] ?? social.id}"
									data-testid="footer-org-{org.id}-{social.id}-link"
								>
									<img
										src={withBase(social.icon)}
										alt="{org.name} — {SOCIAL_NAMES[social.id] ?? social.id}"
										class="footer__social-icon"
									/>
								</a>
							{/each}
						</div>
					</div>
				{/each}
			</div>
		</div>
	</div>
</footer>

<style>
	.footer {
		position: relative;
		margin-top: var(--space-xl);
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
		border-radius: 50%;
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

		.footer__logos {
			padding: var(--space-md) 0;
		}
	}

	.footer__logos {
		display: flex;
		justify-content: center;
		align-items: center;
		gap: var(--space-4xl);
		min-height: 100px;
	}

	.footer__org-wrapper {
		position: relative;
		display: flex;
		align-items: center;
	}

	.footer__org-link {
		position: relative;
		z-index: 2;
		display: block;
		transition: transform var(--transition-normal);
	}

	.footer__logo-img {
		max-height: 80px;
		width: auto;
		filter: brightness(0);
		opacity: 0.8;
		transition: all var(--transition-normal);
	}

	:global([data-theme='dark']) .footer__logo-img {
		filter: brightness(0) invert(1);
	}

	.footer__org-wrapper:hover .footer__logo-img,
	.footer__org-wrapper--active .footer__logo-img {
		opacity: 1;
		filter: none !important;
	}

	.footer__social-flyout {
		position: absolute;
		left: 100%;
		top: 50%;
		transform: translateY(-50%);
		display: flex;
		gap: var(--space-sm);
		padding-left: var(--space-md);
		opacity: 0;
		pointer-events: none;
		transition: all var(--transition-normal);
	}

	.footer__org-wrapper:hover .footer__social-flyout,
	.footer__org-wrapper:focus-within .footer__social-flyout,
	.footer__org-wrapper--active .footer__social-flyout {
		opacity: 1;
		pointer-events: auto;
	}

	/* Mirrored Direction for Notpfote (Left) */
	.footer__org-wrapper--left .footer__social-flyout {
		left: auto;
		right: 100%;
		padding-left: 0;
		padding-right: var(--space-md);
		flex-direction: row-reverse;
	}

	.footer__org-wrapper--left .footer__social-icon-link {
		transform: scale(0) translateX(20px);
	}

	.footer__org-wrapper--left:hover .footer__social-icon-link,
	.footer__org-wrapper--left:focus-within .footer__social-icon-link,
	.footer__org-wrapper--left.footer__org-wrapper--active .footer__social-icon-link {
		transform: scale(1) translateX(0);
	}

	.footer__social-icon-link {
		display: block;
		width: 32px;
		height: 32px;
		transition: all var(--transition-spring);
		transform: scale(0) translateX(-20px);
		transition-delay: calc(var(--index) * 0.05s);
	}

	.footer__org-wrapper:hover .footer__social-icon-link,
	.footer__org-wrapper:focus-within .footer__social-icon-link,
	.footer__org-wrapper--active .footer__social-icon-link {
		transform: scale(1) translateX(0);
	}

	.footer__social-icon-link:hover {
		transform: scale(1.15) !important;
	}

	.footer__social-icon {
		width: 100%;
		height: 100%;
		object-fit: contain;
	}

	@media (max-width: 1024px) {
		.footer__logos {
			gap: var(--space-2xl);
		}
	}

	@media (max-width: 768px) {
		.footer__logos {
			/* Side by side, as on every other width. Stacked, the two organisations read as
			   a list of one thing after another rather than as the pair they are. */
			gap: var(--space-xl);
			padding: var(--space-xl) 0;
		}

		/*
		 * Above the logo rather than beside it, and still in a row.
		 *
		 * Sideways there is no room: the two logos sit next to each other and the fly-out
		 * would open across its neighbour or off the edge of the screen.
		 */
		.footer__social-flyout,
		.footer__org-wrapper--left .footer__social-flyout {
			/* Both selectors, because the mirrored rule for the left-hand organisation is
			   more specific than this one and would otherwise keep pulling its fly-out out
			   to the side — where the row ran off the left edge of the screen. */
			left: 50%;
			right: auto;
			top: auto;
			bottom: 100%;
			transform: translateX(-50%);
			flex-direction: row;
			padding: 0 0 var(--space-sm);
			/*
			 * A row, not the circle these used to fan out into. The fan put icons above,
			 * beside and below the logo at a fixed 80px radius, which on a phone reached
			 * across the other organisation and past the edge of the screen.
			 */
			gap: var(--space-sm);
			background: var(--color-bg-card);
			border-radius: var(--radius-full);
			padding: var(--space-sm);
			margin-bottom: var(--space-sm);
			box-shadow: var(--shadow-lg);
		}

		.footer__org-wrapper--left .footer__social-icon-link,
		.footer__social-icon-link {
			transform: scale(0);
		}

		.footer__org-wrapper--active .footer__social-icon-link,
		.footer__org-wrapper--left.footer__org-wrapper--active .footer__social-icon-link {
			transform: scale(1);
		}

		.footer__logo-img {
			max-height: 60px;
		}

		.footer__org-wrapper--active .footer__logo-img {
			transform: scale(0.7);
		}

		.footer__social-icon-link {
			width: 40px;
			height: 40px;
		}
	}
</style>
