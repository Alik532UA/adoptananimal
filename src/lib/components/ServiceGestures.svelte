<script lang="ts">
	import { dev } from '$app/environment';
	import { onDestroy } from 'svelte';
	import { debugMode } from '$lib/services/debugMode.svelte';
	import { createKeySequence } from '$lib/services/keySequence';
	import { logService } from '$lib/services/logService.svelte';
	import { hardReset, RESET_PRESSES_DEV, RESET_PRESSES_PROD } from '$lib/services/resetService';

	/**
	 * The two service gestures: a run of `V` presses reveals the badge, a run of `R`
	 * presses wipes local data (HOTKEYS-v8 § 4, DEBUGGING-v8 § 3).
	 *
	 * **Nothing is rendered.** This component exists only to own a window listener whose
	 * lifetime matches the app's, which is the one thing a plain module cannot do.
	 *
	 * **Why not inside the badge it reveals.** In production the badge is not rendered
	 * until the gesture has already fired, so a listener living there could never see the
	 * gesture that brings it on screen.
	 *
	 * **Why not inside the header controls.** It started there — the header renders on
	 * every page, so the reach is the same — but these gestures need nothing the header
	 * owns, and putting them there pushed that component past the project's file-size
	 * limit. The split follows what the code actually depends on: `T` and `L` need
	 * `openMenu` and stay in the header; `V` and `R` need nothing and live here.
	 */
	const versionSequence = createKeySequence({
		code: 'KeyV',
		threshold: () => debugMode.pressesToToggle,
		onComplete: () =>
			logService.info('ui', `Service badge ${debugMode.toggle() ? 'shown' : 'hidden'}`)
	});

	/**
	 * In production `hardReset(true)` asks for confirmation: together with the 55-press
	 * threshold that is two independent barriers before local data is destroyed, and
	 * neither relies on attentiveness.
	 */
	const resetSequence = createKeySequence({
		code: 'KeyR',
		threshold: dev ? RESET_PRESSES_DEV : RESET_PRESSES_PROD,
		onComplete: () => void hardReset(!dev)
	});

	function handleKeydown(event: KeyboardEvent) {
		// Both runs see EVERY key, including the one that just completed the other: a
		// different key resetting the counter is what makes a run a run. Their guards
		// (auto-repeat, text entry, the window between presses, modifiers) live in
		// `keySequence`.
		versionSequence.handle(event);
		resetSequence.handle(event);
	}

	onDestroy(() => {
		versionSequence.reset();
		resetSequence.reset();
	});
</script>

<svelte:window onkeydown={handleKeydown} />
