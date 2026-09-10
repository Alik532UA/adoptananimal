<script lang="ts">
	/**
	 * Кожен тег `<head>`, який належить СТОРІНЦІ, в одному місці (SEO-v9 § 4.2, § 4.4).
	 *
	 * ## Навіщо компонент, а не сім однакових блоків `<svelte:head>`
	 *
	 * Макет уже володіє тим, що обчислюється з адреси: `canonical`, `hreflang`,
	 * `og:url`, `og:image`, `robots`. Решта — заголовок, опис, `og:title`,
	 * `og:description`, `og:type` — залежить від того, ЩО на сторінці, тож пише її
	 * сторінка. § 4.4 забороняє писати той самий тег у двох місцях, і це правило
	 * тут виконувалося; чого воно не ловить — сторінку, яка не написала тег ЖОДНОГО
	 * разу.
	 *
	 * Саме так і сталося. Кожна з дев'яти сторінок мала власний блок `<svelte:head>`
	 * із `<title>` і `description`, а повний набір Open Graph — лише
	 * `AnimalProfile`. Заміряно 2026-09-11 у `build/`: **20 індексованих сторінок із
	 * 220** (головна, `adopt/cat`, `adopt/dog`, `apply`, `favorites` × 4 мови) не
	 * мали ні `og:title`, ні `og:description`, ні `og:type` — тобто рівно ті
	 * сторінки, посилання на які ділять найчастіше. У джерелах кожен із дев'яти
	 * блоків виглядав правильно: дефект був у тому, чого в ньому немає, а
	 * відсутність рядка непомітна в код-рев'ю за побудовою.
	 *
	 * Спільний компонент прибирає клас, а не випадок: набір тегів тепер один на всі
	 * сторінки, і нова сторінка отримує його з першого рядка. Гейт над `build/`
	 * (`scripts/check-geo.js`) валить будь-яку індексовану сторінку без повного
	 * набору — на випадок, якщо хтось напише блок `<svelte:head>` вручну повз цей
	 * компонент.
	 *
	 * ## Чого тут навмисно немає
	 *
	 * `og:locale:alternate` (§ 4.2) — його довелося б писати тричі на сторінку, а
	 * гейт § 4.4 забороняє будь-який `<meta>` двічі. Виняток у гейті коштував би
	 * дорожче за тег, який читає лише Facebook; рішення записане в
	 * PROJECT-CONTEXT.md § 4.41.
	 */
	interface Props {
		/** Вміст `<title>`. Шаблон «Сторінка — Сайт» складає сторінка. */
		title: string;
		/** `<meta name="description">`. Порожній рядок кращий за скопійований (§ 4.1). */
		description: string;
		/** `og:title`, якщо він має відрізнятися від заголовка вкладки. */
		ogTitle?: string;
		/** `og:description`, якщо він має відрізнятися від опису. */
		ogDescription?: string;
		/**
		 * Готовий тег `<script type="application/ld+json">` рядком.
		 *
		 * Рядком, а не об'єктом, бо Svelte не обчислює вирази всередині літерального
		 * `<script>` (§ 3.2) — його доводиться складати й віддавати через `{@html}`,
		 * і складання лишається у виклику, де видно, з яких даних воно зроблене.
		 */
		jsonLd?: string;
	}

	let { title, description, ogTitle, ogDescription, jsonLd }: Props = $props();
</script>

<svelte:head>
	<title>{title}</title>
	<meta name="description" content={description} />
	<meta property="og:title" content={ogTitle ?? title} />
	<meta property="og:description" content={ogDescription ?? description} />
	<meta property="og:type" content="website" />
	{#if jsonLd}
		<!-- eslint-disable-next-line svelte/no-at-html-tags -- складено викликом із власних даних проєкту, з екранованим "<" -->
		{@html jsonLd}
	{/if}
</svelte:head>
