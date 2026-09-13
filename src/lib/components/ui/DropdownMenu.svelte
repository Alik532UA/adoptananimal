<script lang="ts">
	import type { Snippet } from 'svelte';

	export interface DropdownItem {
		id: string;
		label: string;
		/** Present turns the item into a link — used by the language picker, where
		 *  choosing an option changes the address and must be openable in a new tab. */
		href?: string;
		hreflang?: string;
		active: boolean;
	}

	interface Props {
		/** Accessible name of the trigger. */
		label: string;
		/**
		 * The key that reaches this menu without the mouse, in ARIA notation (`"T"`) —
		 * HOTKEYS-v8 § 5. It announces a shortcut, it does not create one: the handler
		 * stays the caller's, and `keyboard.test.ts` is what keeps the two in step.
		 * A legend printed on the button would be a second glyph in a 44px control that
		 * already carries one, and a shortcuts dialog for two letters is more page than
		 * it saves — so this is the whole of discoverability here.
		 */
		keyshortcuts?: string;
		/** Feature segment of the test ids: "theme" gives theme-toggle-btn. */
		testId: string;
		items: DropdownItem[];
		open: boolean;
		/** The parent owns which menu is open, so opening one closes the others. */
		onToggle: (open: boolean) => void;
		onselect: (id: string) => void;
		/**
		 * Показ пункта «на пробу», поки на ньому курсор; `null` — відведення
		 * (THEME-SWITCHER § 3). НЕОБОВ'ЯЗКОВИЙ навмисно: це меню одне на тему,
		 * СТИЛЬ і мову, а прев'ю має отримати лише тема — меню мови, яке раптом
		 * почало міняти тему, це дефект, а не фіча (§ 7).
		 *
		 * Перевірка «це миша» живе ТУТ, а не в кожного, хто передає обробник:
		 * `pointerenter` приходить і від тапу, а `pointerleave` на дотику — ні,
		 * тож пункт застряг би показаним. Одне місце — одна гарантія.
		 */
		onPreview?: (id: string | null) => void;
		trigger: Snippet;
		itemVisual?: Snippet<[DropdownItem]>;
	}

	let {
		label,
		keyshortcuts,
		testId,
		items,
		open,
		onToggle,
		onselect,
		onPreview,
		trigger,
		itemVisual
	}: Props = $props();

	function previewOn(id: string, e: PointerEvent) {
		if (e.pointerType === 'mouse') onPreview?.(id);
	}

	function previewOff(e: PointerEvent) {
		if (e.pointerType === 'mouse') onPreview?.(null);
	}

	/*
	 * Меню закривають клавішею й кліком поза ним — `pointerleave` на пункті тоді
	 * не приходить, і показане «на пробу» лишилося б назавжди.
	 */
	$effect(() => {
		if (!open) onPreview?.(null);
	});

	$effect(() => () => onPreview?.(null));

	/**
	 * Escape closes and returns focus to the trigger, arrows walk the items, Home and
	 * End jump to the ends. This lived three times over in Header.svelte, once per
	 * menu, which is three places for it to drift.
	 */
	function handleKeydown(event: KeyboardEvent) {
		const menu = event.currentTarget as HTMLElement;
		const entries = [...menu.querySelectorAll<HTMLElement>('[role="menuitem"]')];
		const index = entries.indexOf(document.activeElement as HTMLElement);

		switch (event.key) {
			case 'Escape':
				event.stopPropagation();
				onToggle(false);
				menu.closest('.dropdown')?.querySelector('button')?.focus();
				break;
			case 'ArrowDown':
				event.preventDefault();
				entries[(index + 1) % entries.length]?.focus();
				break;
			case 'ArrowUp':
				event.preventDefault();
				entries[(index - 1 + entries.length) % entries.length]?.focus();
				break;
			case 'Home':
				event.preventDefault();
				entries[0]?.focus();
				break;
			case 'End':
				event.preventDefault();
				entries.at(-1)?.focus();
				break;
		}
	}

	/** Moves focus into the menu as it opens, so the arrow keys have somewhere to start. */
	function focusFirstItem(node: HTMLElement) {
		node.querySelector<HTMLElement>('[role="menuitem"]')?.focus();
	}

	let anchorElement: HTMLElement | undefined = $state();
	let menuElement: HTMLElement | undefined = $state();

	/**
	 * Where the menu sits, measured from the trigger's left edge. `null` until it has
	 * been measured, and the markup then centres it in CSS — so the frame before the
	 * measurement is already the right shape rather than a jump.
	 */
	let placement = $state<number | null>(null);

	/** Gap kept between the menu and the edge of the window. */
	const EDGE = 8;

	/**
	 * Centred under its trigger, then pulled back on screen.
	 *
	 * Centring alone is not enough and edge-anchoring alone was worse: `right: 0` put
	 * the theme menu's 180px under a 44px button near the left margin, and on a 375px
	 * screen it started at −6px — the first item cut off by the window with nothing to
	 * scroll, because the panel it opens in clips. Which edge runs out depends on which
	 * trigger it is and how wide the label is, so it is measured rather than guessed.
	 */
	function place() {
		if (!anchorElement || !menuElement) return;

		const anchor = anchorElement.getBoundingClientRect();
		const width = menuElement.offsetWidth;
		const centred = anchor.left + anchor.width / 2 - width / 2;

		// Both edges can run out at once on a narrow screen. The left one wins: a menu
		// that starts off screen has nothing readable at all, while one that ends off
		// screen at least reads from the beginning.
		const rightmost = Math.max(EDGE, window.innerWidth - EDGE - width);
		placement = Math.min(Math.max(centred, EDGE), rightmost) - anchor.left;
	}

	$effect(() => {
		if (!open || !menuElement) {
			placement = null;
			return;
		}

		place();

		// Two things move it: the window, which moves the trigger, and the menu's own
		// width. The second is watched on the menu rather than on the items that fill
		// it — what decides the placement is how wide it came out, and that changes with
		// the locale's labels as readily as with the length of the list.
		const observer = new ResizeObserver(place);
		observer.observe(menuElement);
		window.addEventListener('resize', place);

		return () => {
			observer.disconnect();
			window.removeEventListener('resize', place);
		};
	});
</script>

<div bind:this={anchorElement} class="dropdown">
	<button
		class="dropdown__trigger control-shape"
		onclick={(event) => {
			// Without this the document-level close handler fires straight after and
			// the menu shuts in the same tick it opened.
			event.stopPropagation();
			onToggle(!open);
		}}
		aria-label={label}
		aria-expanded={open}
		aria-haspopup="menu"
		aria-keyshortcuts={keyshortcuts}
		data-testid="{testId}-toggle-btn"
	>
		{@render trigger()}
	</button>

	{#if open}
		<div
			bind:this={menuElement}
			class="dropdown__menu"
			style={placement === null ? 'left: 50%; translate: -50% 0;' : `left: ${placement}px;`}
			role="menu"
			tabindex="-1"
			onkeydown={handleKeydown}
			data-testid="{testId}-menu"
			{@attach focusFirstItem}
		>
			{#each items as item (item.id)}
				{#if item.href}
					<!--
						data-sveltekit-noscroll: a menu item changes a setting, and the address
						it navigates to is an implementation detail of how that setting is
						stored. Choosing a language halfway down the page used to answer by
						throwing the reader back to the top of it.
					-->
					<a
						class="dropdown__item"
						class:dropdown__item--active={item.active}
						href={item.href}
						hreflang={item.hreflang}
						onclick={() => onselect(item.id)}
						role="menuitem"
						data-sveltekit-noscroll
						data-testid="{testId}-option-{item.id}-link"
					>
						{@render itemVisual?.(item)}
						<span class="dropdown__label">{item.label}</span>
					</a>
				{:else}
					<button
						class="dropdown__item"
						class:dropdown__item--active={item.active}
						onclick={() => onselect(item.id)}
						onpointerenter={(e) => previewOn(item.id, e)}
						onpointerleave={previewOff}
						role="menuitem"
						data-menu-key={item.id}
						data-testid="{testId}-option-{item.id}-btn"
					>
						{@render itemVisual?.(item)}
						<span class="dropdown__label">{item.label}</span>
					</button>
				{/if}
			{/each}
		</div>
	{/if}
</div>

<style>
	.dropdown {
		position: relative;
	}

	.dropdown__trigger {
		min-width: 44px;
		height: 44px;
		padding: 0 10px;
		background: var(--glass-bg);
		-webkit-backdrop-filter: blur(var(--glass-blur));
		backdrop-filter: blur(var(--glass-blur));
		border: 1px solid var(--glass-border);
		color: var(--color-text);
		display: inline-flex;
		align-items: center;
		justify-content: center;
		gap: 6px;
		font-size: 1.1rem;
		cursor: pointer;
		transition: all var(--transition-fast);
	}

	.dropdown__trigger:hover {
		background: var(--color-bg-warm);
		color: var(--color-primary);
		box-shadow: var(--shadow-sm);
	}

	.dropdown__menu {
		position: absolute;
		top: calc(100% + 8px);
		/* Sideways placement comes from the inline style above, which is measured. The
		   `translate` there rather than `transform` on purpose: the opening animation
		   owns `transform`, and a keyframe would wipe a centring written into it. */
		background: var(--color-bg-card);
		border: none;
		border-radius: var(--radius-md);
		box-shadow: var(--shadow-lg);
		padding: 6px;
		/*
		 * Меню РОСТЕ під найдовший підпис замість ламати його на два рядки
		 * (прохання автора: «не переносити на наступний рядок назву теми, а за
		 * потреби робити ширше контейнер»). Назви тем образні — «Магічний захід»,
		 * «Magischer Sonnenuntergang», — і в 180 px не вміщалися.
		 *
		 * `width: max-content` тут ОБОВ'ЯЗКОВИЙ, і це не зайвий рядок. Сам лише
		 * `min-width` не допомагає: підпис нижче має `min-width: 0` і
		 * `overflow: hidden` (задля трикрапки), а такий flex-елемент віддає
		 * нульовий внесок у бажану ширину — контейнеру нема від чого рости.
		 * Заміряно на сусідньому проєкті з тим самим меню: з німецьким підписом
		 * воно лишалося рівно 180 px, а текст обрізався. `max-content` рахує
		 * ширину за вмістом ДО стиснення.
		 *
		 * Розміщення це витримує: `place()` МІРЯЄ `offsetWidth` і притискає меню
		 * до краю вікна, а `ResizeObserver` на самому меню переміряє, коли ширина
		 * змінилася від іншої мови.
		 *
		 * `max-width` — запобіжник: на вузькому екрані вікно фізично менше за
		 * німецький підпис, і без стелі меню вилізло б за край. Аж тоді
		 * спрацьовує трикрапка нижче.
		 */
		width: max-content;
		min-width: 180px;
		max-width: calc(100vw - 16px);
		display: flex;
		flex-direction: column;
		gap: 2px;
		z-index: 100;
		animation: slide-down 0.2s ease-out;
	}

	.dropdown__item {
		display: flex;
		align-items: center;
		gap: 12px;
		padding: 10px 14px;
		border-radius: var(--radius-sm);
		border: none;
		background: transparent;
		color: var(--color-text);
		font-family: inherit;
		font-size: 0.95rem;
		text-decoration: none;
		cursor: pointer;
		width: 100%;
		text-align: left;
	}

	/*
	 * Підпис не переноситься: меню розширюється під нього (див. `min-width` вище).
	 *
	 * Трикрапка — не звичайний стан, а останній рубіж: вона з'явиться лише коли
	 * підпис довший за все вікно. `min-width: 0` обов'язковий — без нього
	 * flex-елемент не має права стиснутися нижче за свій вміст, і `overflow`
	 * ніколи не спрацює.
	 */
	.dropdown__label {
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
		min-width: 0;
	}

	.dropdown__item:hover {
		background: var(--color-bg-warm);
		color: var(--color-primary);
	}

	.dropdown__item--active {
		background: var(--color-primary);
		/* The token, not a literal white: on the dark theme's #93bf4c white measures
		   2.14:1. axe never caught it because a closed menu has nothing to measure. */
		color: var(--color-text-on-accent);
	}

	@keyframes slide-down {
		from {
			opacity: 0;
			transform: translateY(-10px);
		}
		to {
			opacity: 1;
			transform: translateY(0);
		}
	}

	@media (prefers-reduced-motion: reduce) {
		.dropdown__menu {
			animation: none;
		}
	}
</style>
