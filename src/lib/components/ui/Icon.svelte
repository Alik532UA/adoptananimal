<script lang="ts">
	import {
		PawPrint,
		Cat,
		Dog,
		Heart,
		List,
		Mail,
		Globe,
		Lightbulb,
		Sun,
		Moon,
		Sparkles,
		Square,
		Palette,
		Home,
		Snowflake,
		Eye,
		Mars,
		Venus,
		Ruler,
		Cake,
		Tag,
		ArrowRight,
		ArrowLeft,
		ArrowUp,
		ClipboardList,
		ExternalLink,
		Gamepad2,
		Plus,
		X
	} from 'lucide-svelte';
	import type { IconName } from './icons';

	interface Props {
		name: IconName;
		size?: string | number;
		class?: string;
		strokeWidth?: number;
		testId?: string;
	}

	let { name, size = '1em', class: className = '', strokeWidth = 2, testId }: Props = $props();

	const finalTestId = $derived(
		testId ? (testId.endsWith('-icon') ? testId : `${testId}-icon`) : undefined
	);
</script>

<!-- 
	We use explicit if-branches instead of a dynamic component to prevent 
	Svelte 5 hydration issues where SVG attributes might leak between 
	different icons during reconciliation.
-->
<span data-testid={finalTestId} class="icon-wrapper">
	{#key name}
		{#if name === 'paw'}
			<PawPrint {size} class={className} {strokeWidth} />
		{:else if name === 'cat'}
			<Cat {size} class={className} {strokeWidth} />
		{:else if name === 'dog'}
			<Dog {size} class={className} {strokeWidth} />
		{:else if name === 'heart'}
			<Heart {size} class={className} {strokeWidth} />
		{:else if name === 'heart-filled'}
			<Heart {size} class={className} {strokeWidth} fill="currentColor" />
		{:else if name === 'list'}
			<List {size} class={className} {strokeWidth} />
		{:else if name === 'email'}
			<Mail {size} class={className} {strokeWidth} />
		{:else if name === 'globe'}
			<Globe {size} class={className} {strokeWidth} />
		{:else if name === 'idea'}
			<Lightbulb {size} class={className} {strokeWidth} />
		{:else if name === 'sun'}
			<Sun {size} class={className} {strokeWidth} />
		{:else if name === 'moon'}
			<Moon {size} class={className} {strokeWidth} />
		{:else if name === 'sparkles'}
			<Sparkles {size} class={className} {strokeWidth} />
		{:else if name === 'minimal'}
			<Square {size} class={className} {strokeWidth} />
		{:else if name === 'playful'}
			<Palette {size} class={className} {strokeWidth} />
		{:else if name === 'home'}
			<Home {size} class={className} {strokeWidth} />
		{:else if name === 'winter'}
			<Snowflake {size} class={className} {strokeWidth} />
		{:else if name === 'view'}
			<Eye {size} class={className} {strokeWidth} />
		{:else if name === 'male'}
			<Mars {size} class={className} {strokeWidth} />
		{:else if name === 'female'}
			<Venus {size} class={className} {strokeWidth} />
		{:else if name === 'gender'}
			<Mars {size} class={className} {strokeWidth} />
		{:else if name === 'size'}
			<Ruler {size} class={className} {strokeWidth} />
		{:else if name === 'age'}
			<Cake {size} class={className} {strokeWidth} />
		{:else if name === 'breed'}
			<Tag {size} class={className} {strokeWidth} />
		{:else if name === 'color'}
			<Palette {size} class={className} {strokeWidth} />
		{:else if name === 'arrow-right'}
			<ArrowRight {size} class={className} {strokeWidth} />
		{:else if name === 'arrow-left'}
			<ArrowLeft {size} class={className} {strokeWidth} />
		{:else if name === 'arrow-up'}
			<ArrowUp {size} class={className} {strokeWidth} />
		{:else if name === 'close'}
			<X {size} class={className} {strokeWidth} />
		{:else if name === 'external-link'}
			<ExternalLink {size} class={className} {strokeWidth} />
		{:else if name === 'gamepad'}
			<Gamepad2 {size} class={className} {strokeWidth} />
		{:else if name === 'plus'}
			<Plus {size} class={className} {strokeWidth} />
		{:else if name === 'application'}
			<ClipboardList {size} class={className} {strokeWidth} />
		{/if}
	{/key}
</span>

<style>
	.icon-wrapper {
		display: inline-flex;
		align-items: center;
		justify-content: center;
	}
</style>
