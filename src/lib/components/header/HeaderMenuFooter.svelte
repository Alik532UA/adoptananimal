<script lang="ts">
	import { t } from '$lib/i18n';
	import Icon from '$lib/components/ui/Icon.svelte';
	import OrgLogos from '$lib/components/OrgLogos.svelte';
	import { SIDE_PROJECTS } from '$lib/config';
	import { siblingUrl } from '$lib/siblings';
	import { settings } from '$lib/services/settings.svelte';

	/**
	 * The foot of the site's footer, repeated at the foot of the open mobile menu.
	 *
	 * Not duplicated markup: the organisations and the side projects each come from the
	 * one module the footer reads. On a phone the menu covers the whole screen, and a
	 * visitor who opened it had no way to reach either without closing it and scrolling
	 * to the bottom of the page.
	 */
	let { onNavigate }: { onNavigate: () => void } = $props();
</script>

<div class="header__nav-footer">
	<!-- The same component the footer uses, so a tap here opens the same panel
		 of accounts rather than jumping straight to the site. -->
	<div class="header__nav-orgs">
		<OrgLogos scope="nav" />
	</div>

	<div class="header__nav-projects">
		<!-- Same address the footer builds, language and all: these are the same two
			 links, and a phone finding them here rather than at the bottom of the page
			 is no reason to arrive on a different site. -->
		{#each SIDE_PROJECTS as project (project.id)}
			<a
				href={siblingUrl(project.site, settings.locale)}
				target="_blank"
				rel="noopener noreferrer"
				class="header__nav-project control-shape"
				onclick={onNavigate}
				data-testid="nav-{project.id}-link"
			>
				<Icon name={project.icon} size="1.2rem" />
				<span>{t(project.key)}</span>
			</a>
		{/each}
	</div>
</div>

<style>
	/* Only ever shown inside the open mobile menu. The header decides where it sits;
	   this decides what it is. */
	.header__nav-footer {
		display: none;
	}

	@media (max-width: 768px) {
		.header__nav-footer {
			display: flex;
			flex-direction: column;
			align-items: center;
			/* Wider than the rest, so the logos sit clear of the buttons rather than just
			   above them. */
			gap: var(--space-xl);
			/* Pushed to the foot of the panel, which is otherwise empty below the links. */
			margin-top: auto;
			padding-top: var(--space-xl);
			border-top: 1px solid var(--color-border);
		}

		.header__nav-orgs {
			--org-logos-size: 68px;
			--org-logos-gap: var(--space-2xl);
		}

		/* Stacked, full width. Side by side they were two short pills adrift in a wide
		   panel; one under the other they are the same shape as the links above them. */
		.header__nav-projects {
			display: flex;
			flex-direction: column;
			align-self: stretch;
			gap: var(--space-sm);
		}

		.header__nav-project {
			display: flex;
			align-items: center;
			justify-content: center;
			gap: var(--space-sm);
			/* WCAG 2.5.8, and a comfortable tap target beside its neighbour. */
			min-height: 44px;
			padding: 0 var(--space-md);
			background: var(--control-surface);
			color: var(--color-text);
			font-size: 0.85rem;
			font-weight: 700;
		}
	}
</style>
