<script lang="ts">
	import type { Snippet } from 'svelte';

	interface Props {
		variant?: 'cat' | 'dog' | 'success' | 'warning' | 'info' | 'default';
		children: Snippet;
		class?: string;
		testId?: string;
	}

	let {
		variant = 'default',
		children,
		class: className = '',
		testId = 'ui-badge'
	}: Props = $props();

	const classes = $derived(`badge badge--${variant} ${className}`);
</script>

<span class={classes} data-testid={testId.endsWith('-badge') ? testId : `${testId}-badge`}>
	{@render children()}
</span>
