<script lang="ts">
	import { withBase } from '$lib/utils/withBase';
	import Icon from '$lib/components/ui/Icon.svelte';
	import { t } from '$lib/i18n';
	import { handleEmailClick } from '$lib/utils/emailAction';
	import { CONTACT_EMAIL, SIDE_PROJECTS } from '$lib/config';

	let activeOrg = $state<string | null>(null);

	// Proper nouns, so no i18n: these are the accessible names of the icon links,
	// which previously read out as "inst", "fb", "li".
	const SOCIAL_NAMES: Record<string, string> = {
		inst: 'Instagram',
		fb: 'Facebook',
		tt: 'TikTok',
		yt: 'YouTube',
		li: 'LinkedIn',
		x: 'X',
		mail: 'Email'
	};

	const organizations = [
		{
			id: 'notpfote',
			name: 'Notpfote',
			url: 'https://notpfote.de/',
			logo: '/images/logo/adoptananimal_logo_Notpfote.webp',
			socials: [
				{
					id: 'inst',
					url: 'https://www.instagram.com/notpfote/',
					icon: '/images/social_media/instagram-se-512-50.png'
				},
				{
					id: 'fb',
					url: 'https://facebook.com/notpfote',
					icon: '/images/social_media/facebook-se-512-50.png'
				},
				{
					id: 'tt',
					url: 'https://tiktok.com/@notpfote',
					icon: '/images/social_media/TikTok-se-512-50.png'
				},
				{
					id: 'yt',
					url: 'https://www.youtube.com/@notpfote',
					icon: '/images/social_media/YouTube-se-512px-50q.png'
				},
				{
					id: 'li',
					url: 'https://www.linkedin.com/company/notpfoten/',
					icon: '/images/social_media/linkedin-se-320px-q50.png'
				},
				{
					id: 'mail',
					url: `mailto:${CONTACT_EMAIL.notpfote}`,
					icon: '/images/social_media/Gmail_Logo_512px-50q.png'
				}
			]
		},
		{
			id: 'vetcrew',
			name: 'Vet Crew',
			url: 'https://sites.google.com/view/vetcrew',
			logo: '/images/logo/adoptananimal_logo_VetCrew.webp',
			socials: [
				{
					id: 'inst',
					url: 'https://www.instagram.com/vet.crew/',
					icon: '/images/social_media/instagram-se-512-50.png'
				},
				{
					id: 'fb',
					url: 'https://www.facebook.com/vet.crew/',
					icon: '/images/social_media/facebook-se-512-50.png'
				},
				{
					id: 'tt',
					url: 'https://www.tiktok.com/@vet.crew',
					icon: '/images/social_media/TikTok-se-512-50.png'
				},
				{
					id: 'x',
					url: 'https://x.com/crew_vet',
					icon: '/images/social_media/Twitter-SE-512-50q.png'
				},
				{
					id: 'mail',
					url: `mailto:${CONTACT_EMAIL.vetcrew}`,
					icon: '/images/social_media/Gmail_Logo_512px-50q.png'
				}
			]
		}
	];

	function toggleOrg(id: string, e: MouseEvent) {
		if (window.innerWidth <= 768) {
			if (activeOrg !== id) {
				e.preventDefault();
				activeOrg = id;
			}
		}
	}

	// Collapse the mobile flyout on an outside click. Previously this was an onclick
	// on <footer> itself, which made a landmark element interactive.
	$effect(() => {
		const close = () => (activeOrg = null);
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
				{#each organizations as org (org.id)}
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
		/* To the left of the glyph, as a tooltip that does not cover the thing it names. */
		right: calc(100% + var(--space-sm));
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

	/* Narrow screens have no room to the left of the icons, so the label goes to the
	   right rather than off the edge of the window. */
	@media (max-width: 700px) {
		.footer__aside {
			left: var(--space-sm);
		}

		.footer__aside-label {
			right: auto;
			left: calc(100% + var(--space-sm));
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
			flex-direction: column;
			gap: 60px;
			padding: var(--space-xl) 0;
		}

		.footer__social-flyout {
			left: 50%;
			top: 50%;
			transform: translate(-50%, -50%);
			padding-left: 0;
			width: 0;
			height: 0;
		}

		.footer__org-wrapper--active .footer__social-icon-link {
			position: absolute;
			left: 50%;
			top: 50%;
			margin-left: -20px;
			margin-top: -20px;
			/* Circular Fan logic */
			--r: 80px;
			--a: calc(var(--index) * (360deg / 6) - 90deg);
			transform: translate(calc(cos(var(--a)) * var(--r)), calc(sin(var(--a)) * var(--r))) scale(1);
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
