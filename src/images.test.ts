// @vitest-environment node
import { describe, expect, it } from 'vitest';
import { readdirSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { blankNonMarkup, openingTags } from '$lib/utils/svelteMarkup';

/**
 * Кожна картинка називає свій розмір (PERFORMANCE-v9 § 2, § 10.2).
 *
 * ## Що ловить
 *
 * `<img>` без `width` і `height` не має власних пропорцій, доки не приїде файл.
 * Доти браузер не знає, скільки місця під нього лишити, і все, що нижче,
 * від'їжджає тієї миті, коли картинка завантажилася, — це і є CLS. Канон просить
 * атрибути **завжди**, і саме тому, що умова «коли CSS не задає розмір» не
 * читається з розмітки: правило з винятком тут дорожче за правило без нього.
 *
 * Заміряно 2026-09-11 підрахунком тегів у `build/`: **5216 із 7172 `<img>` не
 * мали пари `width`/`height`**. У джерелах це два місця — фото на сторінці
 * тварини (`AnimalProfile`, 200 сторінок × 4 мови) і сім іконок соцмереж у
 * підвалі (`OrgLogos`, кожна сторінка). Обидва зараз тримає CSS: контейнер фото
 * має `aspect-ratio: 1`, іконка стоїть у коробці 44×44. Тобто зсуву сьогодні
 * немає — і саме тому воно й проїхало код-рев'ю. Ціною однієї правки в CSS
 * зсув повертається без жодного сліду в діфі розмітки.
 *
 * ## Чому не наївний регекс
 *
 * Еталон гейта в каноні (§ 10.2) шукає `<img[^>]*>`. У цьому проєкті такий
 * розбір дає **хибну** знахідку на `HeaderControls.svelte`:
 *
 * ```svelte
 * <img src={withBase(LOCALE_OPTIONS.find((l) => l.id === settings.locale)!.flags[0])}
 *      width={FLAG_WIDTH} height={FLAG_HEIGHT} />
 * ```
 *
 * `[^>]*` обривається на `>` у стрілці `(l) =>`, тобто бачить тег без `width` і
 * `height`, які там є. Перша редакція цього файлу назвала два прапори
 * порушенням, і це той самий клас, що й `PIT-*`: гейт, який червоніє на
 * правильному коді, знімають першим, а разом із ним і те, що він ловив.
 * Розбір із урахуванням `{…}` живе в `$lib/utils/svelteMarkup.ts`.
 *
 * ## Друга половина § 10.2 тут навмисно не повторюється
 *
 * «Рівно один `fetchpriority="high"`» уже стереже `check-build.js` § 4D, і
 * стереже правильніше: він рахує підказки на **зібраній сторінці**, а не в
 * компоненті. `AnimalCard` ставить її умовно (`priority`), тож із джерел
 * кількість на сторінці не виводиться взагалі. Другий гейт на те саме правило
 * був би слабшою копією першого.
 *
 * ## Зворотний експеримент
 *
 * Проведено: прибрав `width`/`height` із `<img>` у `OrgLogos.svelte` — гейт
 * називає файл із цим тегом; повернув — зелено.
 */

const ROOT = resolve(__dirname, '..');

function components(dir = 'src', out: string[] = []): string[] {
	for (const entry of readdirSync(resolve(ROOT, dir), { withFileTypes: true })) {
		const path = `${dir}/${entry.name}`;
		if (entry.isDirectory()) components(path, out);
		else if (entry.name.endsWith('.svelte')) out.push(path);
	}
	return out;
}

const images = components().flatMap((file) => {
	const text = blankNonMarkup(readFileSync(resolve(ROOT, file), 'utf8'));
	return openingTags(text, 'img').map((tag) => ({ file, tag }));
});

describe('розміри зображень (§ 10.2)', () => {
	it('перевірка жива: картинки знайдено', () => {
		// Розбір, що не знаходить нічого, дає нуль знахідок і читається як чистий
		// проєкт — той самий клас, що й порожній граф імпортів у structure.test.ts.
		expect(images.length, 'жодного <img> — розбір зламався').toBeGreaterThan(3);
	});

	it('кожен <img> оголошує width і height', () => {
		const bad = images
			.filter(({ tag }) => !/\bwidth[=\s]/.test(tag) || !/\bheight[=\s]/.test(tag))
			.map(({ file, tag }) => `${file} — ${tag.replace(/\s+/g, ' ').slice(0, 80)}`);

		expect(
			bad,
			`без width/height, тобто без пропорцій до завантаження:\n${bad.join('\n')}`
		).toEqual([]);
	});
});
