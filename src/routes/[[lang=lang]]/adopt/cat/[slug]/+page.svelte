<script lang="ts">
	import AnimalProfile from '$lib/components/animal/AnimalProfile.svelte';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();
</script>

<AnimalProfile animal={data.animal} kind="cat" />
