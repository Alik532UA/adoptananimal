// @vitest-environment node
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

/**
 * STORAGE-NAMESPACE-v8, «Автоматична перевірка» — фасад сховища є критичним
 * сервісом, і канон називає тести до нього обов'язковими.
 *
 * Чому саме цей файл, а не ще один інваріант по джерелах. За запасною адресою origin
 * спільний із сусідніми проєктами на `alik532ua.github.io`, і єдине, що стоїть між ними та
 * нашими ключами, — це префікс, який додає фасад. Порушити його дешево: досить
 * забути `PREFIX +` в одному методі. ESLint цього не бачить — він забороняє
 * звертатися до `localStorage` повз фасад, але всередині фасаду прямий доступ і
 * є реалізацією. `svelte-check` теж мовчить: типи однакові. Тобто до цього
 * файлу правило трималося на тому, що його ніхто не зачепить.
 *
 * Ціна помилки тут — не наші дані, а чужі: ключ без префікса або `clear()`, що
 * ходить за межі префікса, це втрата даних сусіднього застосунку, і побачить її
 * його користувач.
 *
 * Зворотний експеримент (AI-AGENT-PITFALLS-v8 § 1.1) проведено на кожній
 * перевірці окремо: прибрати `PREFIX +` у `set` — падає «усі ключі …»; звести
 * `clear()` до `localStorage.clear()` — падає «clear() …»; зняти `try/catch` із
 * `set` — падає «переповнена квота …»; зняти guard `browser` — падає «під час
 * prerender …».
 */

/** Спільний для обох сховищ; має збігатися з PREFIX у storage.ts. */
const PREFIX = 'adoptananimal_';

/**
 * `browser` мокається на рівні модуля, бо `$app/environment` віддає різні
 * значення залежно від середовища збірки, а тут потрібні обидві гілки. Значення
 * читається з цієї змінної при кожному зверненні — інакше один набір тестів
 * зафіксував би його назавжди.
 */
let browserValue = true;
vi.mock('$app/environment', () => ({
	get browser() {
		return browserValue;
	},
	dev: true
}));

/**
 * Мінімальний Web Storage. Саме об'єкт із `length`/`key()`, а не Map: `clear()`
 * фасаду обходить сховище індексами, і на голій Map ця гілка не виконалася б
 * зовсім.
 */
function makeStorage(overrides: Partial<Storage> = {}): Storage {
	const data = new Map<string, string>();
	return {
		get length() {
			return data.size;
		},
		key: (i: number) => [...data.keys()][i] ?? null,
		getItem: (k: string) => data.get(k) ?? null,
		setItem: (k: string, v: string) => void data.set(k, v),
		removeItem: (k: string) => void data.delete(k),
		clear: () => data.clear(),
		...overrides
	} as Storage;
}

/** Ключі, які реально лежать у моці, — щоб перевіряти форму, а не лише читання. */
const rawKeys = (mock: Storage) =>
	Array.from({ length: mock.length }, (_, i) => mock.key(i)).filter((k): k is string => k !== null);

/** Свіжий модуль на кожен тест: фасад тримає стан у замиканні. */
async function load() {
	vi.resetModules();
	return (await import('./storage')).storage;
}

beforeEach(() => {
	browserValue = true;
});

afterEach(() => {
	vi.unstubAllGlobals();
});

describe('storage — localStorage', () => {
	it('усі ключі отримують префікс проєкту', async () => {
		const mock = makeStorage();
		vi.stubGlobal('localStorage', mock);
		const storage = await load();

		storage.set('theme', 'dark');

		expect(mock.getItem('theme'), 'ключ без префікса не має існувати').toBeNull();
		expect(rawKeys(mock)).toEqual([`${PREFIX}theme`]);
		expect(storage.get('theme')).toBe('dark');
	});

	it('remove() працює за тим самим префіксом, що й set()', async () => {
		const mock = makeStorage();
		vi.stubGlobal('localStorage', mock);
		const storage = await load();

		storage.set('theme', 'dark');
		storage.remove('theme');

		expect(rawKeys(mock), 'ключ лишився — префікси set і remove розійшлися').toEqual([]);
	});

	it('clear() не чіпає ключі сусіднього застосунку', async () => {
		const mock = makeStorage();
		vi.stubGlobal('localStorage', mock);
		const storage = await load();

		// Сусід по origin. Саме заради цього рядка існує весь файл.
		mock.setItem('vetcrewgames_theme', 'light');
		storage.set('theme', 'dark');
		storage.set('lang', 'uk');

		storage.clear();

		expect(mock.getItem('vetcrewgames_theme'), 'знищено дані сусіднього застосунку').toBe('light');
		expect(storage.get('theme')).toBeNull();
		expect(storage.get('lang')).toBeNull();
	});

	it('переповнена квота не валить застосунок', async () => {
		vi.stubGlobal(
			'localStorage',
			makeStorage({
				setItem: () => {
					throw new DOMException('quota', 'QuotaExceededError');
				}
			})
		);
		const storage = await load();

		expect(() => storage.set('k', 'v')).not.toThrow();
		expect(storage.set('k', 'v'), 'невдале збереження має повертати false').toBe(false);
	});

	it('недоступне читання дорівнює відсутньому значенню', async () => {
		vi.stubGlobal(
			'localStorage',
			makeStorage({
				getItem: () => {
					throw new DOMException('denied', 'SecurityError');
				}
			})
		);
		const storage = await load();

		expect(() => storage.get('k')).not.toThrow();
		expect(storage.get('k')).toBeNull();
	});

	it('зіпсований JSON дорівнює відсутньому', async () => {
		vi.stubGlobal('localStorage', makeStorage());
		const storage = await load();

		storage.set('cfg', '{зламано');

		expect(storage.getJSON('cfg')).toBeNull();
	});

	it('setJSON не кидає на циклічній структурі', async () => {
		vi.stubGlobal('localStorage', makeStorage());
		const storage = await load();

		const cyclic: Record<string, unknown> = {};
		cyclic.self = cyclic;

		expect(() => storage.setJSON('cfg', cyclic)).not.toThrow();
		expect(storage.setJSON('cfg', cyclic)).toBe(false);
	});

	it('JSON проходить через префікс так само, як рядки', async () => {
		const mock = makeStorage();
		vi.stubGlobal('localStorage', mock);
		const storage = await load();

		storage.setJSON('favourites', ['cat_mia']);

		expect(rawKeys(mock)).toEqual([`${PREFIX}favourites`]);
		expect(storage.getJSON<string[]>('favourites')).toEqual(['cat_mia']);
	});
});

describe('storage.session', () => {
	it('усі ключі отримують той самий префікс', async () => {
		const mock = makeStorage();
		vi.stubGlobal('sessionStorage', mock);
		const storage = await load();

		storage.session.set('logs', '[]');

		expect(rawKeys(mock)).toEqual([`${PREFIX}logs`]);
		expect(storage.session.get('logs')).toBe('[]');
	});

	it('remove() працює за тим самим префіксом', async () => {
		const mock = makeStorage();
		vi.stubGlobal('sessionStorage', mock);
		const storage = await load();

		storage.session.set('logs', '[]');
		storage.session.remove('logs');

		expect(rawKeys(mock)).toEqual([]);
	});

	it('відмова сховища не валить застосунок', async () => {
		vi.stubGlobal(
			'sessionStorage',
			makeStorage({
				setItem: () => {
					throw new DOMException('quota', 'QuotaExceededError');
				}
			})
		);
		const storage = await load();

		expect(() => storage.session.set('logs', '[]')).not.toThrow();
		expect(storage.session.set('logs', '[]')).toBe(false);
	});
});

describe('storage під час prerender', () => {
	/**
	 * Перевіряється саме ФАКТ ЗВЕРНЕННЯ, а не повернене значення, і це не
	 * прискіпливість.
	 *
	 * Кожен метод фасаду вже загорнутий у `try/catch`, тож без guard `browser`
	 * повернені значення лишилися б ті самі: виняток від недоступного сховища
	 * перехопився б, і `get` віддав би `null`, а `set` — `false`. Перша редакція
	 * цього тесту звіряла саме їх — і зворотний експеримент (§ 1.1) показав, що
	 * вона проходить із прибраним guard. Тобто вона не перевіряла нічого.
	 *
	 * Заразом припущення «на сервері `localStorage` не існує, отже буде
	 * ReferenceError» теж хибне: у Node 22 такий глобальний об'єкт є, і тест
	 * ішов би зеленим ще й через це.
	 *
	 * Тому лічильник: guard існує, щоб звернення НЕ ВІДБУЛОСЯ. Це єдине, що
	 * відрізняє його наявність від відсутності, — і єдине, що тут вимірюється.
	 */
	beforeEach(() => {
		browserValue = false;
	});

	it('жоден метод не торкається Web Storage', async () => {
		const touched: string[] = [];
		const spy = (label: string) =>
			new Proxy(makeStorage(), {
				get(target, prop, receiver) {
					touched.push(`${label}.${String(prop)}`);
					return Reflect.get(target, prop, receiver);
				}
			});

		vi.stubGlobal('localStorage', spy('localStorage'));
		vi.stubGlobal('sessionStorage', spy('sessionStorage'));
		const storage = await load();

		expect(storage.get('theme')).toBeNull();
		expect(storage.set('theme', 'dark')).toBe(false);
		expect(storage.getJSON('theme')).toBeNull();
		expect(storage.setJSON('theme', { a: 1 })).toBe(false);
		expect(() => storage.remove('theme')).not.toThrow();
		expect(() => storage.clear()).not.toThrow();

		expect(storage.session.get('logs')).toBeNull();
		expect(storage.session.set('logs', '[]')).toBe(false);
		expect(() => storage.session.remove('logs')).not.toThrow();

		expect(touched, `звернення до сховища під час prerender: ${touched.join(', ')}`).toEqual([]);
	});
});
