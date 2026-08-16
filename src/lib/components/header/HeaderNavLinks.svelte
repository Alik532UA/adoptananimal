<script lang="ts">
	import { localePath } from '$lib/utils/withBase';
	import { page } from '$app/state';
	import { t, type TranslationKey } from '$lib/i18n';
	import { settings } from '$lib/services/settings.svelte';
	import Icon from '$lib/components/ui/Icon.svelte';
	import type { IconName } from '$lib/components/ui/icons';

	/**
	 * Every anchor in the header bar: the wordmark, the destinations, the call to action.
	 *
	 * They travel together because they are styled together — the wordmark and the call
	 * to action are both `.header__link` with a few declarations of their own on top, and
	 * separating any of them from that rule would leave it depending on a stylesheet in
	 * another file.
	 */
	interface Props {
		/** Called on every link, so following one folds the mobile panel away. */
		onNavigate: () => void;
	}

	let { onNavigate }: Props = $props();

	function isLinkActive(href: string): boolean {
		const target = localePath(href);
		if (href === '/') {
			return page.url.pathname === target;
		}
		return page.url.pathname.startsWith(target);
	}

	/**
	 * The icon travels with the item rather than being chosen in the markup.
	 *
	 * Adding a fifth destination is then one line here, and it cannot arrive without an
	 * icon — which is what happened to the four that already existed: the logo had a paw
	 * and the rest had nothing, so the row read as one button and four labels.
	 *
	 * A clipboard for the application: the plus already belongs to "order a website" in
	 * the footer, and this is a form to fill in rather than something to add.
	 */
	const navItems: { href: string; label: TranslationKey; icon: IconName }[] = [
		// { href: '/', label: 'nav.home' }, // Тимчасово закоментовано: логотип виконує роль переходу на головну
		{ href: '/adopt/cat', label: 'nav.cats', icon: 'cat' },
		{ href: '/adopt/dog', label: 'nav.dogs', icon: 'dog' },
		{ href: '/favorites', label: 'nav.favorites', icon: 'heart' }
	];

	const isHomeActive = $derived(isLinkActive('/'));
	const isApplyActive = $derived(isLinkActive('/apply'));
</script>

<!-- `header__logo--active` carries no rule of its own: it is how HeaderTabWave finds
	 what to point at when the wordmark is the current item. -->
<a
	href={localePath('/')}
	class="header__link header__logo header__logo--nav"
	class:header__link--active={isHomeActive}
	class:header__logo--active={isHomeActive}
	aria-current={isHomeActive ? 'page' : undefined}
	onclick={onNavigate}
	data-testid="header-logo-link"
>
	<Icon name="paw" size="1.75rem" class="header__logo-icon" />
	<span class="header__logo-text">{t('nav.adopt')}</span>
</a>

{#each navItems as item (item.href)}
	{@const active = isLinkActive(item.href)}
	<a
		href={localePath(item.href)}
		class="header__link"
		class:header__link--active={active}
		aria-current={active ? 'page' : undefined}
		onclick={onNavigate}
		data-testid="nav-{item.href.replaceAll('/', '-').replace(/^-|-$/g, '') || 'home'}-link"
	>
		<!-- Decorative: the label beside it is what names the link, and an icon
			 with a name of its own would have a screen reader say it twice. -->
		<Icon name={item.icon} size="1.05rem" class="header__link-icon" />
		<span class="header__link-label">{t(item.label)}</span>

		{#if item.href === '/favorites' && settings.favorites.length > 0}
			<span class="header__fav-count">{settings.favorites.length}</span>
		{/if}
	</a>
{/each}

<a
	href={localePath('/apply')}
	class="header__link header__cta"
	class:header__link--active={isApplyActive}
	class:header__cta--active={isApplyActive}
	aria-current={isApplyActive ? 'page' : undefined}
	onclick={onNavigate}
	data-testid="nav-apply-now-link"
>
	<Icon name="application" size="1.05rem" class="header__link-icon" />
	<span class="header__link-label">{t('nav.applyNow')}</span>
</a>

<style>
	.header__logo {
		display: inline-flex;
		align-items: center;
		gap: var(--space-sm);
		font-family: var(--font-accent);
		font-weight: 800;
		font-size: 1.25rem;
		color: var(--color-primary);
		text-decoration: none;
		height: 48px;
		padding: 0 16px 8px 16px;
		position: relative;
		z-index: 2;
		transition: color 0.3s ease;
	}

	.header__logo--nav {
		display: inline-flex;
	}

	.header__logo:hover {
		color: var(--color-primary-light);
	}

	.header__logo--active {
		color: #ffffff;
	}

	.header__logo--active:hover {
		color: #ffffff;
	}

	.header__logo:hover :global(.header__logo-icon) {
		transform: scale(1.2) rotate(15deg);
	}

	.header__link {
		font-weight: 700;
		font-size: 0.95rem;
		color: var(--color-text-muted);
		transition: color 0.3s ease;
		position: relative;
		height: 48px;
		padding: 0 16px 8px 16px;
		text-decoration: none;
		display: inline-flex;
		align-items: center;
		justify-content: center;
		/* Between the glyph and its label. */
		gap: 8px;
		line-height: 1;
		z-index: 2;
	}

	.header__link :global(.header__link-icon) {
		/* Above the wave the active tab draws behind the item, like the label. */
		position: relative;
		z-index: 2;
		flex-shrink: 0;
	}

	.header__link-label {
		position: relative;
		z-index: 2;
	}

	.header__link:hover {
		color: var(--color-primary);
	}

	.header__link--active {
		color: #ffffff;
		background: transparent;
	}

	.header__link--active:hover {
		color: #ffffff;
	}

	.header__fav-count {
		background: var(--color-primary);
		color: white;
		font-size: 0.7rem;
		padding: 2px 6px;
		border-radius: var(--radius-full);
		position: absolute;
		top: 6px;
		right: 4px;
		font-weight: 800;
		line-height: 1;
		box-shadow: var(--shadow-sm);
	}

	.header__cta {
		position: relative;
		padding: 0 20px 8px;
		color: var(--color-text-on-accent);
		background: transparent;
		transition: color var(--transition-fast);
	}

	.header__cta::before {
		content: '';
		position: absolute;
		top: 5px;
		bottom: 13px;
		left: 0;
		right: 0;
		background: var(--color-primary);
		border-radius: var(--radius-full);
		box-shadow: 0 4px 14px color-mix(in srgb, var(--color-primary) 25%, transparent);
		z-index: 1;
		pointer-events: none;
		transition:
			background var(--transition-fast),
			box-shadow var(--transition-fast);
	}

	.header__cta:hover {
		color: var(--color-text-on-accent);
	}

	.header__cta:hover::before {
		background: var(--color-primary-light);
		box-shadow: 0 6px 20px color-mix(in srgb, var(--color-primary) 35%, transparent);
	}

	.header__cta--active {
		background: transparent;
		color: #ffffff;
	}

	.header__cta--active::before {
		display: none;
	}

	.header__cta--active:hover {
		background: transparent;
		color: #ffffff;
	}

	/*
	 * THE OPEN MENU NEEDS THREE LOOKS, NOT TWO: a link, the current page, the call to
	 * action. It had two — the current tab and the call to action were both filled with
	 * --color-primary, one green rectangle meaning two different things, while every
	 * other row had no edge at all.
	 *
	 * Each colour below was measured, and the measurements are why parts of it look
	 * roundabout: the four ratios, and what each ruled out, are in PROJECT-CONTEXT.md
	 * § 4.19.
	 */
	@media (max-width: 768px) {
		/* The bar keeps a wordmark of its own out here; this one goes with the nav. */
		.header__logo--nav {
			display: none;
		}

		.header__link {
			height: auto;
			padding: 12px 20px;
			border-radius: var(--radius-md);
			background: var(--control-surface);
			/* Not the bar's muted colour: that is 4.42:1 here in the dark theme. */
			color: var(--color-text);
		}

		/* `color` repeated on purpose: the white declared for this class further up ties
		   on specificity with `.header__link`, which now sets one and comes later. */
		.header__link--active {
			height: auto;
			align-self: auto;
			border-radius: var(--radius-md);
			background: var(--active-tab-bg);
			color: #ffffff;
			padding: 12px 20px;
		}

		/* The marker that survives greyscale — in two themes the current fill and a plain
		   row are the same lightness. An element, not an inset shadow: the pill's radius
		   clips a shadow into a crescent that reads as a rendering fault. */
		.header__link--active::after {
			content: '';
			position: absolute;
			left: 10px;
			top: 50%;
			width: 4px;
			height: 18px;
			border-radius: var(--radius-full);
			background: rgb(255 255 255 / 0.9);
			transform: translateY(-50%);
			z-index: 2;
		}

		.header__cta {
			border-radius: var(--radius-md);
			padding: 12px 20px;
			background: transparent;
			/* The accent draws the edge but not the words: 3:1 is the bar for a boundary,
			   4.5 for a 15px label, and it clears the first only. */
			border: 2px solid var(--color-primary);
			color: var(--color-text);
		}

		.header__cta::before {
			display: none;
		}

		/* On its own page it is the current tab, so it takes that fill and drops the
		   outline rather than tracing a second edge around a solid shape. */
		.header__cta--active {
			background: var(--active-tab-bg);
			border-color: transparent;
			color: #ffffff;
		}
	}
</style>
