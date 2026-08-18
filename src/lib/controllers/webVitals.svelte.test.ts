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
 * Зворотний експеримент (AI-AGENT-PITFALLS-v8 § 1.1) — у повідомленні коміту, що
 * додав цей файл.
 */

vi.mock('$app/environment', () => ({ browser: true, dev: false }));

/** Мінімальний PerformanceObserver: рахує роз'єднання й нічого не спостерігає. */
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
}

describe('збір Core Web Vitals', () => {
	beforeEach(() => {
		FakeObserver.created = [];
		vi.stubGlobal('window', { PerformanceObserver: FakeObserver });
		vi.stubGlobal('PerformanceObserver', FakeObserver);
		vi.spyOn(console, 'log').mockImplementation(() => {});
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

	it('без PerformanceObserver у браузері повертає робочий cleanup', async () => {
		vi.stubGlobal('window', {});
		const vitals = await fresh();

		expect(() => vitals.start()()).not.toThrow();
		expect(FakeObserver.created).toHaveLength(0);
	});
});
