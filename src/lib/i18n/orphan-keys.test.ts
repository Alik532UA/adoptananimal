// @vitest-environment node
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { en } from './translations/en';

/**
 * Ключ словника, який не рендерить жоден рядок робочого коду (I18N-v8 § 7.2).
 *
 * Наявні гейти питають, чи всі чотири мови мають той самий набір ключів і чи
 * немає порожніх значень. Обидва мовчать про протилежне: ключ, що є в усіх
 * чотирьох, непорожній — і якого ніхто не показує. Заміряно 2026-08-28: таких
 * 67 із 216, тобто 31% словника, або 268 перекладених рядків у чотирьох файлах,
 * які супроводжують задарма.
 *
 * Ціна не в кілобайтах, а в тому, що словник читають як опис сайту. У ньому
 * стоїть `footer.tagline`, `footer.rights`, `hero.subtitle`, `cta.home.*` —
 * ціла головна сторінка попереднього дизайну. Перекладач бачить рядок і
 * перекладає його чотирма мовами; рев'ювер бачить у diff «підвал» і шукає
 * підвал, якого немає.
 *
 * ЧОМУ ЦЕ ПЕРЕЛІК, А НЕ ВИДАЛЕННЯ. Сироту не можна прибрати механічно:
 * `style.minimal` лежить у цьому переліку й прибирати його НЕ МОЖНА —
 * `menuOptions.ts` носить докблок «Minimal is deliberately absent from this
 * list, not deleted», тобто скін навмисно припаркований. Відрізнити
 * припаркований ключ від залишку старого макета — рішення автора, а не скрипта,
 * тож гейт фіксує стан і не дає йому рости. Сам перелік і є той список, за яким
 * це рішення ухвалюють.
 *
 * Порівняння на РІВНІСТЬ, як у мапі боргу ESLint (CODE-QUALITY-v8 § 6.4.3):
 * нова сирота валить прогін, поки її не внесуть сюди свідомо, а сирота, яку
 * нарешті почали показувати або прибрали, змушує прибрати рядок тим самим
 * комітом. «Не більше» пропускало б застарівання й лишало перелік брехливим.
 *
 * Тестові файли до корпусу НЕ входять, і це навмисно. `list.cat.count.*` і
 * `list.dog.count.*` згадані лише в `plural.test.ts` — тобто на сайті їх не
 * показує ніхто, а тест доводить правильність форм рядка, якого не видно.
 * Якби тести рахувалися посиланням, ці вісім ключів виглядали б живими.
 *
 * Зворотний експеримент (§ 1.1) описаний у коміті: додати ключ, не вживши
 * його, — прогін червоний; вжити ключ зі списку, не прибравши рядок, —
 * теж червоний.
 */
const ORPHANS: readonly string[] = [
	'style.minimal',
	'hero.badge',
	'hero.title.1',
	'hero.title.2',
	'hero.subtitle',
	'hero.cta.find',
	'hero.cta.apply',
	'hero.stat.cats',
	'hero.stat.dogs',
	'hero.stat.saved',
	'hero.stat.countries',
	'featured.title',
	'featured.subtitle',
	'featured.cats',
	'featured.dogs',
	'featured.viewAllCats',
	'featured.viewAllDogs',
	'featured.seeAll',
	'featured.cats.title',
	'featured.dogs.title',
	'cta.home.title',
	'cta.home.text',
	'cta.home.cta.primary',
	'cta.home.cta.secondary',
	'footer.tagline',
	'footer.orgs',
	'footer.nav.title',
	'footer.contact.title',
	'footer.countries.text',
	'footer.countries.list',
	'footer.rights',
	'breadcrumb.adopt',
	'adopt.title',
	'adopt.subtitle',
	'adopt.cat.title',
	'adopt.cat.count',
	'adopt.cat.browse',
	'adopt.dog.title',
	'adopt.dog.count',
	'adopt.dog.browse',
	'list.viewAll',
	'detail.applyBtn',
	'detail.backCats',
	'detail.backDogs',
	'apply.contact.hint',
	'apply.countries.title',
	'apply.countries.text',
	'apply.countries.note',
	'apply.note.title',
	'apply.note.text',
	'card.gender',
	'card.size',
	'card.age',
	'error.validation',
	'error.storage',
	'app.title.adopt',
	'about.thanks.note',
	'about.thanks.note.short',
	'about.thanks.note.very.short',
	'list.cat.count.one',
	'list.cat.count.few',
	'list.cat.count.many',
	'list.cat.count.other',
	'list.dog.count.one',
	'list.dog.count.few',
	'list.dog.count.many',
	'list.dog.count.other'
];

/** Сам словник посиланням не рахується — інакше кожен ключ «уживаний». */
const DICTIONARY_DIR = join('lib', 'i18n', 'translations');

function sourceFiles(dir: string, out: string[] = []): string[] {
	for (const entry of readdirSync(dir)) {
		const full = join(dir, entry);
		if (statSync(full).isDirectory()) {
			if (!full.includes(DICTIONARY_DIR)) sourceFiles(full, out);
		} else if (/\.(ts|svelte)$/.test(entry) && !/\.(test|spec)\.ts$/.test(entry)) {
			out.push(full);
		}
	}
	return out;
}

const files = sourceFiles('src');
const corpus = files.map((file) => readFileSync(file, 'utf8')).join('\n');

/**
 * Основи ключів, які код збирає на льоту: `tPlural(\`age.${unit}\`)` дістає
 * `age.one`, `age.few` і решту, жодна з яких у джерелах не написана дослівно.
 * Без цього вони читалися б як сироти, і перелік вище довелося б засмітити
 * ключами, які насправді показують на кожній картці.
 */
const dynamicBases = [
	...new Set([...corpus.matchAll(/`([a-zA-Z][\w.-]*)\.\$\{/g)].map((m) => m[1]))
];

const orphans = Object.keys(en).filter(
	(key) => !corpus.includes(key) && !dynamicBases.some((base) => key.startsWith(`${base}.`))
);

describe('ключі словника, яких не показує ніхто', () => {
	it('перевірка жива: джерела прочитано', () => {
		// Порожній корпус зробив би сиротою кожен ключ — і перелік нижче зійшовся б
		// лише випадково, а сам гейт міряв би порожнечу.
		expect(files.length, 'сканер не знайшов джерел — шукає не там').toBeGreaterThan(50);
		expect(corpus.length, 'джерела порожні').toBeGreaterThan(10_000);
	});

	it('перевірка жива: більшість ключів усе-таки вживані', () => {
		expect(
			orphans.length,
			'сиротою виглядає майже весь словник — зламався пошук, а не проєкт'
		).toBeLessThan(Object.keys(en).length / 2);
	});

	it('перевірка жива: динамічні основи ключів знайдено', () => {
		// `age` збирається шаблонним рядком. Якщо регулярка перестане його бачити,
		// чотири живі ключі тихо переїдуть у сироти.
		expect(dynamicBases, 'основи динамічних ключів зникли з пошуку').toContain('age');
	});

	it('перелік сиріт дослівно збігається з фактом', () => {
		expect(
			orphans,
			'ключ ЗʼЯВИВСЯ у списку — його ніхто не показує, тож або вжий, або внеси свідомо; ' +
				'ключ ЗНИК — його почали показувати або прибрали, тож прибери рядок тим самим комітом'
		).toEqual(ORPHANS);
	});
});
