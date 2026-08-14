<script lang="ts">
	import type { HTMLButtonAttributes, HTMLAnchorAttributes } from 'svelte/elements';
	import type { Snippet } from 'svelte';

	interface Props {
		variant?: 'primary' | 'secondary' | 'accent' | 'danger' | 'ghost' | 'white' | 'outline-white';
		size?: 'sm' | 'md' | 'lg';
		href?: string;
		children: Snippet;
		class?: string;
		[key: string]: unknown;
	}

	let {
		variant = 'primary',
		size = 'md',
		href,
		children,
		class: className = '',
		...restProps
	}: Props = $props();

	const baseClass = 'btn';
	const classes = $derived(`${baseClass} btn--${variant} btn--${size} ${className}`);

	const testId = $derived((restProps['data-testid'] as string) || (href ? 'ui-link' : 'ui-btn'));
	const finalTestId = $derived(
		href
			? testId.endsWith('-link')
				? testId
				: `${testId}-link`
			: testId.endsWith('-btn')
				? testId
				: `${testId}-btn`
	);
</script>

{#if href}
	<a {href} class={classes} {...restProps as HTMLAnchorAttributes} data-testid={finalTestId}>
		{@render children()}
	</a>
{:else}
	<button class={classes} {...restProps as HTMLButtonAttributes} data-testid={finalTestId}>
		{@render children()}
	</button>
{/if}
