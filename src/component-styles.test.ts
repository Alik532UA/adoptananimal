// @vitest-environment node
import { describe, expect, it } from 'vitest';
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';

/**
 * Жоден компонент не спирається на приватні стилі іншого (SVELTE-UI-v8 § 3.5).
 *
 * Клас дефекту, який не видно ніде. Розмітку виносять у новий компонент, а
 * правило лишається у файлі, з якого її винесли. Скоуп Svelte через цю межу не
 * дістає: правило компілюється в `.foo.svelte-АБВ`, а елемент отримує хеш свого
 * файлу — і селектор не збігається ніколи.
 *
 * Про це не скаже ніхто. Компілятор мовчить, `svelte-check` мовчить, і навіть
 * `Unused CSS selector` мовчить — у своєму файлі той селектор якраз використаний.
 * У `build/` теж усе на місці: клас у розмітці є, правило в CSS є. Побачити можна
 * лише очима на сторінці, і саме так це знайшлося минулого разу — дві картки
 * панелі заявки стояли без тла, розмиття, заокруглення й тіні.
 *
 * Перевірка навмисно **вузька**. Правило «кожен клас має мати оголошення» дало б
 * десятки спрацювань на семантичних іменах без стилів, і такий список одразу
 * став би винятком, який ніхто не читає. Тут сигнал однозначний: правило
 * **існує**, але в чужому файлі, куди скоуп не дістає.
 *
 * Межа названа прямо, бо перший зворотний експеримент її й показав. Прибрати
 * `.glass-card` з `app.css` **недостатньо**: тоді правила немає ніде, `elsewhere`
 * порожній, і перевірка мовчить — цілком за задумом. Ловиться саме розходження
 * «клас тут, правило там», а не «класу ніхто не стилізує»: друге дає ті самі
 * десятки хибних спрацювань на семантичних іменах.
 *
 * Зворотний експеримент (AI-AGENT-PITFALLS-v8 § 1.1), відтворений правильно:
 * прибрати `.glass-card` з `app.css` **і** повернути його у `<style>` файлу
 * `ApplyForm.svelte` — тобто відтворити стан до попереднього коміту. Перевірка
 * називає `ApplySidebar.svelte` і головну сторінку, і в обох випадках вказує на
 * файл, де правило лишилося.
 */

const walk = (dir: string, out: string[] = []): string[] => {
	for (const entry of readdirSync(dir)) {
		const full = join(dir, entry);
		if (statSync(full).isDirectory()) walk(full, out);
		else out.push(full.replace(/\\/g, '/'));
	}
	return out;
};

const all = walk('src');
const components = all.filter((f) => f.endsWith('.svelte'));

/** Усі глобальні таблиці: `app.css`, база, скіни й теми — туди скоуп не потрібен. */
const globalCss = all
	.filter((f) => f.endsWith('.css'))
	.map((f) => readFileSync(f, 'utf8'))
	.join('\n');

/** Класи, які компонент стилізує сам. */
const styledClasses = (source: string): Set<string> => {
	const style = source.match(/<style[^>]*>([\s\S]*)<\/style>/)?.[1] ?? '';
	return new Set([...style.matchAll(/\.([a-zA-Z][\w-]*)/g)].map((m) => m[1]));
};

/**
 * Класи в розмітці. Лише статичний `class="…"` без інтерполяції: динамічні
 * `class:foo={…}` і `class={…}` не бувають перенесені разом із розміткою так,
 * щоб про них забули, а от рядковий літерал — саме той випадок.
 *
 * Коментарі відрізаються: старий клас, залишений у коментарі поруч із поясненням,
 * дав би знахідку про елемент, якого в DOM немає.
 */
const usedClasses = (source: string): Set<string> =>
	new Set(
		[...source.replace(/<!--[\s\S]*?-->/g, '').matchAll(/class="([^"{]*)"/g)]
			.flatMap((m) => m[1].split(/\s+/))
			.filter(Boolean)
	);

const owned = new Map(components.map((f) => [f, styledClasses(readFileSync(f, 'utf8'))]));

describe('§ 3.5 — правило живе там, куди дістає скоуп', () => {
	it('перевірка жива: компоненти зі стилями знайдено', () => {
		const withStyles = components.filter((f) => owned.get(f)!.size > 0);
		expect(withStyles.length, 'сканер шукає не там').toBeGreaterThan(10);
	});

	it('жоден компонент не покладається на приватні стилі іншого', () => {
		const problems: string[] = [];

		for (const file of components) {
			for (const cls of usedClasses(readFileSync(file, 'utf8'))) {
				if (owned.get(file)!.has(cls)) continue; // стилізує сам
				if (globalCss.includes(`.${cls}`)) continue; // або глобальні стилі

				// Правило існує — але в іншому компоненті, куди скоуп не дістає.
				const elsewhere = components.filter(
					(other) => other !== file && owned.get(other)!.has(cls)
				);
				if (elsewhere.length > 0) {
					problems.push(`${file}: .${cls} — правило лежить у ${elsewhere.join(', ')}`);
				}
			}
		}

		expect(problems, problems.join('\n')).toEqual([]);
	});
});
