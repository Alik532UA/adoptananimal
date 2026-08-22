import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

/**
 * PERFORMANCE-v8 § 6 і § 10.2 — контролер із підпискою перевіряється **на зняття**
 * підписки, а не на те, що він її поставив.
 *
 * `WebVitals` тримає три `PerformanceObserver` і віддає функцію очищення для
 * `$effect` того, хто його запустив. Обидві половини цієї угоди мовчазні: якщо
 * `stop()` перестане роз'єднувати спостерігачів, ніщо не почервоніє — сторінка
 * працюватиме, просто кожна навігація лишатиме за собою ще трьох, а метрики
 * почнуть приходити в кількох примірниках. Помітно це стане на довгій сесії, тобто
 * в користувача.
 *
 * Другий бік того самого — повторний `start()` без `stop()`. Тут він **дозволений**
 * і повертає новий cleanup; перевірка стежить лише за тим, що жоден спостерігач не
 * лишається неврахованим: інакше очищення знімає частину.
 *
 * **Друга група перевірок — про МОМЕНТ запису в журнал.** Доти кожен спостерігач
 * писав рядок на кожне спрацювання: `layout-shift` на сторінці з прокруткою дає
 * сотні, `event` — по одному на кожну взаємодію. Кільцевий буфер тримає тисячу
 * записів, тож за хвилину користування у звіті не лишалося б нічого, крім
 * телеметрії — справжні помилки витіснені. Це не гіпотеза: зворотний експеримент
 * нижче (перевірка «спостереження нічого не пишуть у журнал») падає, щойно
 * повернути `logService.info` всередину обробника.
 *
 * Зворотний експеримент (AI-AGENT-PITFALLS-v8 § 1.1) — у повідомленні коміту, що
 * додав цей файл.
 */

vi.mock('$app/environment', () => ({ browser: true, dev: false }));

const logInfo = vi.fn();
const logWarn = vi.fn();
vi.mock('$lib/services/logService.svelte', () => ({
	logService: {
		info: (...args: unknown[]) => logInfo(...args),
		warn: (...args: unknown[]) => logWarn(...args)
	}
}));

/** Мінімальний PerformanceObserver: рахує роз'єднання й віддає задані записи. */
class FakeObserver {
	static created: FakeObserver[] = [];
	disconnected = false;

	constructor(readonly callback: (list: { getEntries: () => PerformanceEntry[] }) => void) {
		FakeObserver.created.push(this);
	}

	observe() {}

	disconnect() {
		this.disconnected = true;
	}

	/** Зімітувати спрацювання спостерігача. */
	emit(entries: unknown[]) {
		this.callback({ getEntries: () => entries as PerformanceEntry[] });
	}
}

/** Слухачі подій, які контролер вішає на `document` і `window`. */
type Listeners = Record<string, Array<() => void>>;

describe('збір Core Web Vitals', () => {
	let docListeners: Listeners;
	let winListeners: Listeners;
	/**
	 * Стаб `document` — окремим об'єктом із ЗВИЧАЙНИМ полем `visibilityState`.
	 * Гетер тут не годиться: об'єкт збирався спредом, а спред обчислює гетер
	 * один раз і копіює результат — стан застигав на `visible`, і перевірка
	 * ховання проходила б повз `#report()`, нічого про це не сказавши.
	 */
	let docStub: Record<string, unknown>;

	const listenerHost = (store: Listeners, extra: Record<string, unknown> = {}) => ({
		...extra,
		addEventListener: (type: string, fn: () => void) => {
			(store[type] ??= []).push(fn);
		},
		removeEventListener: (type: string, fn: () => void) => {
			store[type] = (store[type] ?? []).filter((f) => f !== fn);
		}
	});

	beforeEach(() => {
		FakeObserver.created = [];
		logInfo.mockClear();
		logWarn.mockClear();
		docListeners = {};
		winListeners = {};

		docStub = listenerHost(docListeners, { visibilityState: 'visible' });
		vi.stubGlobal('window', listenerHost(winListeners, { PerformanceObserver: FakeObserver }));
		vi.stubGlobal('document', docStub);
		vi.stubGlobal('PerformanceObserver', FakeObserver);
	});

	afterEach(() => {
		vi.unstubAllGlobals();
		vi.restoreAllMocks();
	});

	const fresh = async () => {
		vi.resetModules();
		const { WebVitals } = await import('./webVitals.svelte');
		return new WebVitals();
	};

	/** Сховати сторінку так, як це робить браузер при згортанні вкладки. */
	const hide = () => {
		docStub.visibilityState = 'hidden';
		for (const fn of docListeners['visibilitychange'] ?? []) fn();
	};

	it('перевірка жива: підписки справді ставляться', async () => {
		const vitals = await fresh();
		vitals.start();

		expect(FakeObserver.created.length, 'LCP, CLS та INP — три спостерігачі').toBe(3);
	});

	it('очищення роз’єднує всіх спостерігачів (§ 6)', async () => {
		const vitals = await fresh();
		const cleanup = vitals.start();

		cleanup();

		expect(FakeObserver.created.every((o) => o.disconnected)).toBe(true);
	});

	it('очищення знімає і слухачів сторінки, а не лише спостерігачів', async () => {
		const vitals = await fresh();
		const cleanup = vitals.start();

		cleanup();

		expect(
			[...(docListeners['visibilitychange'] ?? []), ...(winListeners['pagehide'] ?? [])],
			'слухач, що пережив демонтаж, тримає посилання на мертвий контролер'
		).toEqual([]);
	});

	it('повторний старт не лишає попередніх поза очищенням', async () => {
		const vitals = await fresh();
		vitals.start();
		const secondCleanup = vitals.start();

		secondCleanup();

		expect(FakeObserver.created).toHaveLength(6);
		expect(
			FakeObserver.created.filter((o) => !o.disconnected),
			'спостерігач, якого не рахує stop(), житиме до перезавантаження сторінки'
		).toEqual([]);
	});

	it('спостереження НІЧОГО не пишуть у журнал, поки сторінка жива', async () => {
		const vitals = await fresh();
		vitals.start();
		const [, cls] = FakeObserver.created;

		// Сотня зсувів верстки — рівно те, що дає звичайна прокрутка.
		for (let i = 0; i < 100; i += 1) {
			cls.emit([{ value: 0.001, hadRecentInput: false }]);
		}

		expect(
			logInfo,
			'кожне спрацювання в журналі витісняє справжні помилки з кільцевого буфера'
		).not.toHaveBeenCalled();
	});

	it('приховування сторінки дає РІВНО ОДИН рядок із підсумковими значеннями', async () => {
		const vitals = await fresh();
		vitals.start();
		const [lcp, cls, inp] = FakeObserver.created;

		lcp.emit([{ startTime: 1200 }]);
		cls.emit([{ value: 0.02, hadRecentInput: false }]);
		cls.emit([{ value: 0.03, hadRecentInput: false }]);
		// Зсув одразу після дії користувача у CLS не рахується.
		cls.emit([{ value: 5, hadRecentInput: true }]);
		inp.emit([{ duration: 48 }]);
		inp.emit([{ duration: 210 }]);
		inp.emit([{ duration: 60 }]);

		hide();

		expect(logInfo).toHaveBeenCalledTimes(1);
		const [, line] = logInfo.mock.calls[0] as [string, string];
		expect(line, 'LCP — останнє значення').toContain('LCP: 1200ms');
		expect(line, 'CLS — СУМА зсувів без тих, що після дії').toContain('CLS: 0.0500');
		expect(line, 'INP — НАЙГІРША затримка, а не остання').toContain('INP: 210ms');
	});

	it('повторне приховування без нових вимірювань мовчить', async () => {
		const vitals = await fresh();
		vitals.start();
		FakeObserver.created[0].emit([{ startTime: 900 }]);

		hide();
		docStub.visibilityState = 'visible';
		hide();

		expect(
			logInfo,
			'той самий підсумок двічі — це той самий шум, лише рідший'
		).toHaveBeenCalledTimes(1);
	});

	it('без PerformanceObserver у браузері повертає робочий cleanup', async () => {
		vi.stubGlobal('window', listenerHost(winListeners));
		const vitals = await fresh();

		expect(() => vitals.start()()).not.toThrow();
		expect(FakeObserver.created).toHaveLength(0);
	});
});
