import { CONTACT_EMAIL } from '$lib/config';

/**
 * The two organisations behind the shelter, and how to reach them.
 *
 * In its own module because the footer is no longer the only place that shows them:
 * the mobile menu carries the logos too, and the same list written twice is two lists
 * the day a third organisation joins or an account moves.
 */
export const SOCIAL_NAMES: Record<string, string> = {
	inst: 'Instagram',
	fb: 'Facebook',
	tt: 'TikTok',
	yt: 'YouTube',
	li: 'LinkedIn',
	x: 'X',
	mail: 'Email'
};

export const ORGANIZATIONS = [
	{
		id: 'notpfote',
		name: 'Notpfote',
		url: 'https://notpfote.de/',
		logo: '/images/logo/adoptananimal_logo_Notpfote.webp',
		// Intrinsic size of the file, so the browser can reserve the right box before
		// it arrives. CSS gives the logo `max-height` and `width: auto`, which means the
		// width it will occupy is decided by the image's own aspect ratio — unknowable
		// until it loads, and the footer jumped once it did. Per organisation rather
		// than one shared pair: the two files are not the same shape.
		logoWidth: 1120,
		logoHeight: 1144,
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
		logoWidth: 529,
		logoHeight: 541,
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
