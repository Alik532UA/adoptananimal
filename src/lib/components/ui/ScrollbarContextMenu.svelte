<script lang="ts">
	import { browser } from '$app/environment';
	import { t } from '$lib/i18n';
	import { scrollbar, type ScrollbarMode } from '$lib/services/scrollbar.svelte';
	import { SCROLLBAR_MODES } from '$lib/config';

	/** Width and height are needed so the menu does not run off the screen. */
	const WIDTH = 230;
	const ITEM_HEIGHT = 38;
	const PADDING = 12;

	/**
	 * Measured once it is on screen; the sum is only what the first frame goes on.
	 *
	 * Predicting it did not survive contact: an item is 38px of padding and a line box,
	 * and the line box is whatever the current skin's font makes it. When the default
	 * skin changed the real menu grew past the guess, and a menu opened at the bottom
	 * edge hung off the screen by the difference — which the arithmetic here had no way
	 * of knowing.
	 */
	let height = $state(SCROLLBAR_MODES.length * ITEM_HEIGHT + PADDING * 2 + 24);

	/**
	 * Opens next to the cursor, but wholly inside the window.
	 *
	 * The `browser` guard is not decoration: this site prerenders, and Svelte evaluates
	 * a derived body while rendering on the server, where `window` does not exist. The
	 * menu never being open there is no protection — the value is computed before that
	 * is checked.
	 */
	const position = $derived.by(() => {
		const { x, y } = scrollbar.menu;
		return {
			// To the left of the cursor: the bar hugs the right edge, and a menu to the
			// right of it simply would not fit.
			left: Math.max(PADDING, x - WIDTH - 4),
			top: browser ? Math.min(Math.max(PADDING, y), window.innerHeight - height - PADDING) : y
		};
	});

	/**
	 * Чекбокс доводки показується, лише поки малює НАША смуга.
	 *
	 * Умова на `active`, а не на `mode`, і різниця не косметична (HOLD-SCROLL § 1.3):
	 * на сенсорному екрані й у вікні, вужчому за 1100 px під мінімапу, `mode`
	 * лишається `custom`/`minimap`, а малює нативна смуга. Написане на `mode`
	 * показало б перемикач там, де наводити нема на що.
	 *
	 * Висоту меню правити не треба: вона міряється через `bind:offsetHeight`, тож
	 * зайвий рядок вона бачить сама.
	 */
	const showHold = $derived(scrollbar.active !== 'native');

	/** A strip this wide at the right edge catches the right button. */
	const EDGE_PX = 20;

	/**
	 * The native bar is drawn by the browser and hands the page no events: a right click
	 * over it gives the system menu, and that cannot be changed.
	 *
	 * A transparent element on top of it is worse than it sounds — it would cover the bar
	 * itself, which could then be neither dragged nor clicked. So the event is taken from
	 * the window and judged by coordinate instead. Nothing is covered, and the working
	 * strip sits twenty pixels to the LEFT of the bar.
	 */
	function onDocumentContextMenu(e: MouseEvent) {
		if (scrollbar.active !== 'native') return;
		// clientWidth, not innerWidth: the first excludes the native bar, so the strip
		// does not depend on how thick the system draws it.
		const edge = document.documentElement.clientWidth;
		if (e.clientX < edge - EDGE_PX || e.clientX > edge) return;
		e.preventDefault();
		scrollbar.openMenu(e.clientX, e.clientY);
	}

	function choose(mode: ScrollbarMode) {
		scrollbar.set(mode);
		scrollbar.closeMenu();
	}
</script>

<svelte:window oncontextmenu={onDocumentContextMenu} />

{#if scrollbar.menu.open}
	<!-- The backdrop takes any press outside the menu and closes it. The right button
		 closes it too, or the native menu would appear over ours. -->
	<div
		class="scrollbar-menu__backdrop"
		data-testid="scrollbar-menu-backdrop"
		role="presentation"
		onpointerdown={scrollbar.closeMenu}
		oncontextmenu={(e) => {
			e.preventDefault();
			scrollbar.closeMenu();
		}}
	></div>

	<!-- Стек двох ПАНЕЛЕЙ, а не одна панель із роздільником. Перелік режимів —
		 вибір одного з чотирьох; доводка — незалежна настройка. Окремий контейнер
		 каже це саме собою, без пояснень (SCROLLBAR § 7.4). -->
	<div
		bind:offsetHeight={height}
		class="scrollbar-menu-stack"
		style="left: {position.left}px; top: {position.top}px; width: {WIDTH}px;"
		role="presentation"
		onkeydown={(e) => {
			if (e.key === 'Escape') scrollbar.closeMenu();
		}}
	>
		<div
			class="scrollbar-menu"
			role="menu"
			tabindex="-1"
			aria-label={t('scrollbar.title')}
			data-testid="scrollbar-context-menu"
		>
			<span class="scrollbar-menu__title">{t('scrollbar.title')}</span>
			{#each SCROLLBAR_MODES as mode (mode.id)}
				<!-- menuitemradio with aria-checked rather than plain menuitem: the options
				 are mutually exclusive, and a screen reader has to say which one is on. -->
				<button
					type="button"
					class="scrollbar-menu__item"
					class:active={scrollbar.mode === mode.id}
					role="menuitemradio"
					aria-checked={scrollbar.mode === mode.id}
					onclick={() => choose(mode.id)}
					data-testid="scrollbar-menu-{mode.id}-btn"
				>
					{t(mode.key)}
				</button>
			{/each}
		</div>

		{#if showHold}
			<!-- Тумблер, а не галочка: галочка з фіксованою колонкою лишала порожній
			 відступ у вимкненому стані, і підпис висів без нічого ліворуч.

			 Нативний `<input type="checkbox">` під ним, а не кнопка з
			 `aria-checked`: це справжній елемент форми — фокус, пробіл, читалка й
			 `:disabled` дістаються задарма. Панель НЕ закривається на перемиканні:
			 зворотний зв'язок про стан — сам тумблер, і панель, що зникла раніше,
			 ніж він доїхав, лишає без відповіді на «то ввімкнулося чи ні». -->
			<div class="scrollbar-menu scrollbar-menu--hold">
				<label class="scrollbar-hold" data-testid="scrollbar-hold-label">
					<span>{t('scrollbar.hold')}</span>
					<input
						type="checkbox"
						class="scrollbar-hold__input"
						checked={scrollbar.holdScroll}
						onchange={() => scrollbar.setHoldScroll(!scrollbar.holdScroll)}
						data-testid="scrollbar-hold-toggle"
					/>
					<span class="scrollbar-hold__slider"></span>
				</label>
			</div>
		{/if}
	</div>
{/if}

<style>
	/* Above the bar itself (1500), below the log button (9999). */
	.scrollbar-menu__backdrop {
		position: fixed;
		inset: 0;
		z-index: 1600;
	}

	/* Позиціонується стек; панелі всередині — звичайний потік. */
	.scrollbar-menu-stack {
		position: fixed;
		z-index: 1601;
		display: flex;
		flex-direction: column;
		gap: 8px;
	}

	.scrollbar-menu {
		display: flex;
		flex-direction: column;
		gap: 2px;
		padding: 12px 8px;
		border-radius: var(--radius-md);
		background: var(--color-bg-card);
		border: 1px solid var(--color-border);
		box-shadow: var(--shadow-lg);
	}

	.scrollbar-menu__title {
		padding: 2px 10px 8px;
		font-size: 0.68rem;
		font-weight: 700;
		text-transform: uppercase;
		letter-spacing: 0.05em;
		color: var(--color-text-muted);
	}

	.scrollbar-menu__item {
		display: flex;
		align-items: center;
		padding: 10px;
		border: none;
		border-radius: var(--radius-sm);
		background: transparent;
		color: var(--color-text);
		font-family: inherit;
		font-size: 0.85rem;
		text-align: left;
		cursor: pointer;
		transition: background var(--transition-fast);
	}

	.scrollbar-menu__item:hover {
		background: var(--color-bg-card-hover);
	}

	.scrollbar-menu__item:focus-visible {
		background: var(--color-bg-card-hover);
		outline: 2px solid var(--color-primary);
		outline-offset: -2px;
	}

	.scrollbar-menu__item.active {
		background: color-mix(in srgb, var(--color-primary), transparent 80%);
		color: var(--color-primary-on-surface);
		font-weight: 700;
	}

	/* Друга панель: один рядок, тож вертикальний падінг менший за панель переліку —
	   інакше вона виглядала б порожньою коробкою навколо тумблера. */
	.scrollbar-menu--hold {
		padding: 8px 10px;
	}

	/* Підпис ліворуч, тумблер праворуч. */
	.scrollbar-hold {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 12px;
		cursor: pointer;
		user-select: none;
		font-size: 0.85rem;
		color: var(--color-text);
	}

	/* Поле лишається в потоці подій (фокус, пробіл, читалка), але не видно. */
	.scrollbar-hold__input {
		position: absolute;
		width: 0;
		height: 0;
		opacity: 0;
	}

	/*
	 * Вимкнений стан — відтінок від тексту, а НЕ `--color-border`.
	 *
	 * У цьому проєкті `--color-border: transparent` (рамка самого меню теж
	 * прозора), тож тумблер виходив невидимий: на білій картці лишався тільки
	 * білий кружечок із тінню, і прочитати його як «вимкнено» було неможливо —
	 * він читався як порожнє місце. Заміряно в браузері: `rgba(0, 0, 0, 0)`.
	 *
	 * `color-mix` від кольору тексту, а не константа: так відтінок лишається
	 * правильним у будь-якій темі — тим самим прийомом, що й активний рядок
	 * переліку нижче.
	 */
	.scrollbar-hold__slider {
		position: relative;
		flex: 0 0 44px;
		height: 24px;
		border-radius: 24px;
		background: color-mix(in srgb, var(--color-text-muted), transparent 72%);
		transition: background var(--transition-fast);
	}

	.scrollbar-hold__slider::before {
		content: '';
		position: absolute;
		left: 3px;
		bottom: 3px;
		width: 18px;
		height: 18px;
		border-radius: 50%;
		background: #fff;
		box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
		transition: transform var(--transition-fast);
	}

	.scrollbar-hold__input:checked + .scrollbar-hold__slider {
		background: var(--color-primary);
	}

	.scrollbar-hold__input:checked + .scrollbar-hold__slider::before {
		transform: translateX(20px);
	}

	/* Обведення на тумблері, а не на полі: те 0×0 і не видно, де фокус. */
	.scrollbar-hold__input:focus-visible + .scrollbar-hold__slider {
		outline: 2px solid var(--color-primary);
		outline-offset: 2px;
	}

	@media (prefers-reduced-motion: reduce) {
		.scrollbar-hold__slider,
		.scrollbar-hold__slider::before {
			transition: none;
		}
	}
</style>
