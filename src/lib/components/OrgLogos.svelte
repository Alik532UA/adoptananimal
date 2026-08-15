<script lang="ts">
	import { withBase } from '$lib/utils/withBase';
	import { t } from '$lib/i18n';
	import { handleEmailClick } from '$lib/utils/emailAction';
	import { ORGANIZATIONS, SOCIAL_NAMES } from '$lib/data/organizations';

	/**
	 * The two organisations, each hiding its accounts behind its logo.
	 *
	 * A component rather than markup in the footer, because the mobile menu shows the
	 * same thing and the interaction is not trivial: a tap toggles, a hover reveals, a
	 * click outside closes, and the panel carries its own way through to the site. Two
	 * copies of that would be two behaviours within a week.
	 */
	interface Props {
		/**
		 * Prefix for the locators, so two instances on one page do not collide.
		 * `footer-org-…` in the footer, `nav-org-…` in the menu.
		 */
		scope: string;
	}

	let { scope }: Props = $props();

	let activeOrg = $state<string | null>(null);

	/** True where a pointer can hover, which is the only place hovering can reveal anything. */
	const CAN_HOVER = '(hover: hover) and (pointer: fine)';

	function toggleOrg(id: string, e: MouseEvent) {
		/*
		 * Keyed on whether hovering exists, not on how wide the window is.
		 *
		 * Those are different questions and only one of them decides this. Width decides
		 * where the panel opens; hover decides who opens it. Narrow a desktop window and
		 * the panel moves above the logo, but the pointer is still a pointer, so hovering
		 * reveals and a click should go to the site — as it always did there.
		 *
		 * (It also sidesteps what the width test got wrong before: innerWidth counts the
		 * classic scrollbar and a media query does not, so there was a band about fifteen
		 * pixels wide where the two disagreed about which mode was in force.)
		 */
		if (window.matchMedia(CAN_HOVER).matches) return;
		// Never follows the link on a phone: the logo is the way in and out of the panel,
		// and a second tap that navigated left no way to close it. Going to the site is
		// its own button inside the panel.
		e.preventDefault();
		activeOrg = activeOrg === id ? null : id;
	}

	/*
	 * Collapse on a click outside.
	 *
	 * The target has to be checked. Without that, the very click that opened the panel
	 * bubbled up here a moment later and closed it again — within one frame, which looks
	 * exactly like a tap that did nothing. It also took the accounts with it: pressing
	 * one closed the panel before the press could land.
	 */
	$effect(() => {
		const close = (event: MouseEvent) => {
			const target = event.target;
			if (target instanceof Element && target.closest('.org-logos__item')) return;
			activeOrg = null;
		};
		window.addEventListener('click', close);
		return () => window.removeEventListener('click', close);
	});
</script>

<div class="org-logos" class:org-logos--revealing={activeOrg !== null}>
	{#each ORGANIZATIONS as org (org.id)}
		<!-- Reveal is CSS-only (:hover and :focus-within); activeOrg covers the tap on a
			 phone, where there is no hover to rely on. -->
		<div
			class="org-logos__item"
			class:org-logos__item--active={activeOrg === org.id}
			class:org-logos__item--left={org.id === ORGANIZATIONS[0].id}
		>
			<a
				href={org.url}
				target="_blank"
				rel="noopener noreferrer"
				class="org-logos__link"
				onclick={(e) => toggleOrg(org.id, e)}
				data-testid="{scope}-org-{org.id}-link"
			>
				<img
					src={withBase(org.logo)}
					alt={org.name}
					class="org-logos__img"
					width={org.logoWidth}
					height={org.logoHeight}
					loading="lazy"
					decoding="async"
				/>
			</a>

			<div class="org-logos__flyout">
				{#each org.socials as social (social.id)}
					<a
						href={social.url}
						target="_blank"
						rel="noopener noreferrer"
						class="org-logos__social"
						onclick={(e) =>
							social.url.startsWith('mailto:')
								? handleEmailClick(e, social.url.slice('mailto:'.length))
								: undefined}
						title="{org.name} — {SOCIAL_NAMES[social.id] ?? social.id}"
						data-testid="{scope}-org-{org.id}-{social.id}-link"
					>
						<img
							src={withBase(social.icon)}
							alt="{org.name} — {SOCIAL_NAMES[social.id] ?? social.id}"
							class="org-logos__social-img"
						/>
					</a>
				{/each}

				<!-- Last, and last in the markup too, so what a screen reader reads is the
					 order the panel is in. Phone only: with hover there is no panel to be
					 stuck in, and the logo itself is the link. -->
				<a
					href={org.url}
					target="_blank"
					rel="noopener noreferrer"
					class="org-logos__site"
					data-testid="{scope}-org-{org.id}-site-link"
				>
					{t('footer.openSite')}
				</a>
			</div>
		</div>
	{/each}
</div>

<style>
	.org-logos {
		display: flex;
		justify-content: center;
		align-items: center;
		/* The host decides how big the logos are and how far apart they sit; everything
		   else about them is the same wherever they appear. */
		gap: var(--org-logos-gap);
	}

	.org-logos__item {
		position: relative;
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.org-logos__link {
		position: relative;
		z-index: 2;
		display: block;
		transition: transform var(--transition-normal);
	}

	.org-logos__img {
		max-height: var(--org-logos-size);
		width: auto;
		/*
		 * Their own colours, always.
		 *
		 * They used to be flattened to a silhouette — black, or white in the dark theme —
		 * and only came back to life under the pointer. These are two charities' marks;
		 * showing them as a stencil until someone happens to hover is not a treatment they
		 * asked for, and on a phone there is no hover to give them back.
		 */
		transition:
			transform var(--transition-normal),
			opacity var(--transition-normal);
	}

	.org-logos__item:hover .org-logos__img,
	.org-logos__item--active .org-logos__img {
		/* Small on purpose. The logos sit side by side and a bigger jump would have one
		   reaching over its neighbour. */
		transform: scale(1.08);
	}

	/*
	 * While one is showing its accounts, the other steps back.
	 *
	 * Both ways of asking for it, because they are different states: a tap sets a class,
	 * a hover sets nothing. Dimming the other rather than shrinking the chosen one — the
	 * panel belongs to the logo it opened from, and shrinking that one read as the press
	 * pushing it away.
	 */
	.org-logos--revealing .org-logos__item:not(.org-logos__item--active) .org-logos__img {
		opacity: 0.5;
	}

	@media (hover: hover) and (pointer: fine) {
		.org-logos:has(.org-logos__item:hover) .org-logos__item:not(:hover) .org-logos__img {
			opacity: 0.5;
		}
	}

	.org-logos__flyout {
		position: absolute;
		/* Above its neighbours. In the mobile menu it opens upward over the call to
		   action, which is a positioned element with a z-index of its own and was drawing
		   straight through the panel. */
		z-index: 5;
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

	.org-logos__item--active .org-logos__flyout {
		opacity: 1;
		pointer-events: auto;
	}

	/*
	 * Hover and focus reveal it only where a pointer can hover.
	 *
	 * On a touch screen the tap focuses the link, and :focus-within then held the panel
	 * open no matter what the state said — so the second tap flipped the state, the CSS
	 * ignored it, and the panel would not close. Sticky :hover does the same thing on
	 * some browsers. Neither belongs on a device that cannot hover in the first place.
	 */
	@media (hover: hover) and (pointer: fine) {
		.org-logos__item:hover .org-logos__flyout,
		.org-logos__item:focus-within .org-logos__flyout {
			opacity: 1;
			pointer-events: auto;
		}
	}

	/* Mirrored for the first organisation, which sits on the left. */
	.org-logos__item--left .org-logos__flyout {
		left: auto;
		right: 100%;
		padding-left: 0;
		padding-right: var(--space-md);
		flex-direction: row-reverse;
	}

	.org-logos__social {
		width: 44px;
		height: 44px;
		/* No radius and nothing to clip: each of these images is already drawn as a
		   rounded square, and a circle over it cut the corners off the artwork. */
		transform: scale(0);
		transition: transform var(--transition-spring);
	}

	.org-logos__item--active .org-logos__social {
		transform: scale(1);
	}

	@media (hover: hover) and (pointer: fine) {
		.org-logos__item:hover .org-logos__social,
		.org-logos__item:focus-within .org-logos__social {
			transform: scale(1);
		}
	}

	.org-logos__social:hover {
		transform: scale(1.15) !important;
	}

	.org-logos__social-img {
		width: 100%;
		height: 100%;
		object-fit: contain;
	}

	/* Shown only inside the fly-out on a phone — see the media block below. */
	.org-logos__site {
		display: none;
	}

	@media (max-width: 768px) {
		/*
		 * Above the logo rather than beside it, and still in a row.
		 *
		 * Sideways there is no room: the two logos sit next to each other and the panel
		 * would open across its neighbour or off the edge of the screen. Both selectors,
		 * because the mirrored rule above is more specific than a bare one and would keep
		 * pulling the left-hand panel out to the side.
		 */
		.org-logos__flyout,
		.org-logos__item--left .org-logos__flyout {
			left: 50%;
			right: auto;
			top: auto;
			bottom: 100%;
			transform: translateX(-50%);
			/*
			 * A grid, not a wrapping row.
			 *
			 * As flex, the panel's width was decided by its own widest child and the
			 * accounts came out in a single column — a strip taller than the screen. Two
			 * columns are stated here instead of being left to the browser to infer.
			 *
			 * Room enough to aim at, too: a phone is pressed with a fingertip, and these
			 * used to be 40px circles eight pixels apart — three of them inside one press.
			 */
			display: grid;
			grid-template-columns: repeat(2, auto);
			justify-items: center;
			align-items: center;
			gap: var(--space-lg);
			padding: var(--space-lg);
			margin-bottom: var(--space-sm);
			/*
			 * A step away from the card colour, not the card colour itself.
			 *
			 * This panel opens over surfaces that are already --color-bg-card — the footer's
			 * own glass, the mobile menu — so painting it the same made it legible and
			 * impossible to see as a separate thing. --control-surface-hover is the card
			 * stepped toward the text by a fixed amount, so the separation is identical in
			 * all four themes and the hue cannot drift.
			 */
			background: var(--control-surface-hover);
			border: 1px solid var(--color-border);
			/* Two rows now, so a pill is the wrong shape. */
			border-radius: var(--radius-lg);
			box-shadow: var(--shadow-lg);
		}

		/* A line of its own under the accounts, spanning both columns. */
		.org-logos__site {
			display: block;
			grid-column: 1 / -1;
			width: 100%;
			padding: 10px 14px;
			border-radius: var(--radius-md);
			background: var(--color-primary);
			color: var(--color-text-on-accent);
			font-size: 0.9rem;
			font-weight: 700;
			text-align: center;
			white-space: nowrap;
		}

		.org-logos__social {
			width: 56px;
			height: 56px;
		}
	}
</style>
