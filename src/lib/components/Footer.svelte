<script lang="ts">
	import { withBase } from '$lib/utils/withBase';

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
					url: 'mailto:info@notpfote.de',
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
					url: 'mailto:vet.crew.cooperation@gmail.com',
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
		background: var(--glass-bg);
		backdrop-filter: blur(var(--glass-blur));
		-webkit-backdrop-filter: blur(var(--glass-blur));
		color: var(--color-text);
		padding: var(--space-xl) 0;
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
		transform: scale(1.2) translateY(-4px) !important;
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
