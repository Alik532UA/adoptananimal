import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

/**
 * DEBUGGING-v8 § 4 — логер лишався єдиним сервісом проєкту без жодної перевірки.
 *
 * Це не просто «непокритий модуль». Логер — те, що працює саме тоді, коли решта
 * вже зламалася: його кличуть із `unhandledrejection`, з `svelte:boundary` і з
 * фасаду сховища. Виняток, кинутий звідси, валить не логер, а той код, який
 * намагалися залогувати, — і на екрані користувача це виглядає як зовсім інший
 * дефект, ніж стався насправді (§ 1.5).
 *
 * Перевіряється буфер і `errorCount`, а не `console` (§ 3): консоль — це вивід,
 * а предмет правил — вміст звіту.
 *
 * Мок `$app/environment` містить **обидва** поля (§ 3). Логер читає і `browser`,
 * і `dev`, і відсутнє поле не дає помилки — воно мовчки віддає `undefined` і
 * заводить перевірку в іншу гілку, ніж та, яку писали.
 *
 * Зворотний експеримент (AI-AGENT-PITFALLS-v8 § 1.1) проведено на кожній
 * перевірці окремо:
 *   - зняти `try/catch` навколо `JSON.parse` у конструкторі — падає «зіпсоване
 *     дзеркало …»;
 *   - прибрати `if (this.logs.length > MAX_LOGS)` — падає «буфер тримає …»;
 *   - інкрементувати `errorCount` на кожному записі — падає «лічильник …»;
 *   - прибрати маскування з `getReport()` — падає «пошта у звіті …»;
 *   - віддати `set` без `try/catch` у фасаді — падає «переповнена квота …»;
 *   - записати `data` без `scrub()` — падають «чутливі поля …» і «цикл …»;
 *   - прибрати гілку `Error` зі `scrub()` — падає «виняток у даних …»;
 *   - прибрати охоронця `seen` — падає «цикл …» із переповненням стека;
 *   - прибрати рядок `ONLINE:` — падає «стан мережі …»;
 *   - віддати адресу повз `maskUrl()` — падає «адреса у звіті …».
 */

/** Обидва поля змінні: різні перевірки потребують різних гілок. */
let browserValue = true;
let devValue = true;

vi.mock('$app/environment', () => ({
	get browser() {
		return browserValue;
	},
	get dev() {
		return devValue;
	}
}));

/** Мінімальний sessionStorage; `overrides` дає гілку, де запис кидає. */
function makeSessionStorage(overrides: Partial<Storage> = {}): Storage {
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

/**
 * Свіжий екземпляр на кожну перевірку. Логер — модульний синглтон, який читає
 * дзеркало **в конструкторі**, тож стан сховища треба поставити до імпорту, а
 * не після нього.
 */
async function freshLogService({
	session = makeSessionStorage(),
	href = 'https://example.test/adopt/cat',
	online = false
}: { session?: Storage; href?: string; online?: boolean } = {}) {
	vi.stubGlobal('sessionStorage', session);
	// Заголовок звіту читає адресу, UA і стан мережі напряму з `window`/`navigator`
	// за прапорцем `browser`. Під `environment: 'node'` їх немає, тож без цих
	// заглушок `getReport()` кидає — і перевірка звітувала б про дефект логера
	// там, де його немає.
	vi.stubGlobal('window', { location: { href } });
	vi.stubGlobal('navigator', { userAgent: 'vitest', onLine: online });
	vi.resetModules();
	return (await import('./logService.svelte')).logService;
}

const QUOTA = () => {
	throw new DOMException('quota', 'QuotaExceededError');
};

describe('логер', () => {
	beforeEach(() => {
		browserValue = true;
		devValue = true;
		vi.spyOn(console, 'log').mockImplementation(() => {});
	});

	afterEach(() => {
		vi.unstubAllGlobals();
		vi.restoreAllMocks();
	});

	it('перевірка жива: запис доходить до буфера', async () => {
		const logService = await freshLogService();
		logService.info('app', 'подія');

		expect(logService.logs).toHaveLength(1);
		expect(logService.logs[0]).toMatchObject({
			level: 'info',
			category: 'app',
			message: 'подія'
		});
	});

	it('лічильник помилок рахує лише error (§ 1.2)', async () => {
		const logService = await freshLogService();

		logService.info('app', 'перебіг');
		logService.warn('network', 'офлайн');
		expect(logService.errorCount, 'warn — не помилка (§ 1.3)').toBe(0);

		logService.error('app', 'порушений інваріант');
		expect(logService.errorCount).toBe(1);
	});

	it('буфер тримає щонайбільше 1000 записів, витісняючи найстаріші (§ 1.1)', async () => {
		const logService = await freshLogService();

		for (let i = 0; i < 1005; i++) logService.info('app', `подія ${i}`);

		expect(logService.logs).toHaveLength(1000);
		expect(logService.logs[0].message, 'витіснятися має початок, а не кінець').toBe('подія 5');
		expect(logService.logs.at(-1)?.message).toBe('подія 1004');
	});

	it('переповнена квота не валить логування (§ 1.5)', async () => {
		const logService = await freshLogService({ session: makeSessionStorage({ setItem: QUOTA }) });

		expect(() => logService.info('app', 'подія')).not.toThrow();
		expect(logService.logs, 'буфер у памʼяті працює далі').toHaveLength(1);
	});

	it('зіпсоване дзеркало не валить старт (§ 1.5)', async () => {
		const session = makeSessionStorage();
		session.setItem('adoptananimal_logs', '{ це не JSON');

		const logService = await freshLogService({ session });

		expect(logService.logs).toEqual([]);
		expect(logService.errorCount).toBe(0);
	});

	it('заголовок звіту несе версію збірки (§ 2.3)', async () => {
		const logService = await freshLogService();

		expect(logService.getReport()).toContain(`VERSION: v${__APP_VERSION__}`);
	});

	it('пошта у звіті замаскована (§ 1.4)', async () => {
		const logService = await freshLogService();
		logService.warn('app', 'Лист не пішов на bohdan.melnyk@example.com');

		const report = logService.getReport();
		expect(report, 'адреса не має покидати пристрій цілою').not.toContain(
			'bohdan.melnyk@example.com'
		);
		expect(report, 'домен лишається — без нього запис нічого не пояснює').toContain(
			'b***@example.com'
		);
	});

	it('чутливі поля не доходять до буфера (§ 1.4)', async () => {
		const logService = await freshLogService();

		logService.error('network', 'Заявку відхилено', {
			email: 'olena@example.com',
			token: 'eyJhbGciOi.SECRET.value',
			user: { phone: '+380671234567', name: 'Olena' },
			tokenCount: 12
		});

		const data = logService.logs[0].data as Record<string, unknown>;
		expect(data.email, 'редакція робиться в логері, а не на місці виклику').toBe('«приховано»');
		expect(data.token).toBe('«приховано»');
		expect((data.user as Record<string, unknown>).phone).toBe('«приховано»');
		expect((data.user as Record<string, unknown>).name, 'вкладене нечутливе — лишається').toBe(
			'Olena'
		);
		expect(data.tokenCount, 'зіставлення точне: це число, а не токен').toBe(12);

		expect(JSON.stringify(logService.logs)).not.toContain('olena@example.com');
		expect(JSON.stringify(logService.logs)).not.toContain('380671234567');
	});

	it('виняток у даних лишається читомим після редакції (§ 1.4)', async () => {
		const logService = await freshLogService();

		logService.error('app', 'Збій', new TypeError('Failed to fetch'));

		// Object.entries(new Error(…)) віддає порожній масив, тож обхід «як по
		// звичайному об'єкту» стер би саме той текст, заради якого запис і робили.
		expect(logService.logs[0].data).toMatchObject({
			name: 'TypeError',
			message: 'Failed to fetch'
		});
	});

	it('цикл у даних не валить логер (§ 1.5)', async () => {
		const logService = await freshLogService();
		const loop: Record<string, unknown> = { name: 'root' };
		loop.self = loop;

		expect(() => logService.warn('app', 'циклічні дані', loop)).not.toThrow();
		expect(() => JSON.stringify(logService.logs)).not.toThrow();
	});

	it('заголовок звіту називає стан мережі (§ 2.3)', async () => {
		const logService = await freshLogService();

		expect(
			logService.getReport(),
			'половина звітів «нічого не працює» пояснюється саме цим рядком'
		).toContain('ONLINE: false');
	});

	it('адреса у звіті без значень чутливих параметрів (§ 1.4)', async () => {
		const logService = await freshLogService({
			href: 'https://example.test/favorites?debug=1&access_token=abc123'
		});

		const report = logService.getReport();
		expect(report).not.toContain('abc123');
		expect(report, 'решта query лишається — саме вона пояснює побачений екран').toContain(
			'debug=1'
		);
	});

	it('очищення скидає і буфер, і лічильник', async () => {
		const logService = await freshLogService();
		logService.error('app', 'збій');

		logService.clear();

		expect(logService.logs).toEqual([]);
		expect(logService.errorCount).toBe(0);
	});
});
