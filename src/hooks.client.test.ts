import { beforeEach, describe, expect, it, vi } from 'vitest';

/**
 * ERROR-HANDLING-v8 § 2.4 — гачок неперехоплених помилок клієнта.
 *
 * **Чому цей файл замінив `sentry-canon.test.ts`.** Той читав
 * `src/hooks.client.ts` як РЯДОК і перевіряв, що в ньому трапляються підрядки
 * `beforeSend`, `ignoreErrors`, `authorization`. Такий тест зелений над
 * будь-яким мертвим кодом — він і був зелений над блоком Sentry, який не міг
 * виконатися в принципі (пакета немає в залежностях). Перевірка наявності
 * тексту закриває пункт канону, нічого не перевіривши.
 *
 * Тут перевіряється ПОВЕДІНКА, і насамперед та її частина, яку вже одного разу
 * зняли мовчки: `if (status === 404) return`. Без нього кожна помилкова адреса
 * крутить `errorCount` і фарбує службове табло червоним — тобто сигнал «щось
 * зламалося» починає означати «хтось помилився посиланням», і помітити це можна
 * лише за скаргою.
 *
 * Зворотний експеримент: прибрати рядок із гачка — падає перша перевірка.
 */

const logError = vi.fn();
vi.mock('$lib/services/logService.svelte', () => ({
	logService: { error: (...args: unknown[]) => logError(...args) }
}));

const event = { url: new URL('https://example.com/adoptananimal/uk/') } as never;

describe('handleError клієнта', () => {
	beforeEach(() => {
		logError.mockClear();
	});

	const call = async (status: number, error: unknown) => {
		const { handleError } = await import('./hooks.client');
		return handleError({ error, event, status, message: String(status) });
	};

	it('404 НЕ потрапляє ні в журнал, ні в лічильник помилок', async () => {
		const result = await call(404, new Error('Not Found'));

		expect(logError, 'помилкова адреса — не збій застосунку').not.toHaveBeenCalled();
		expect(result, 'повернення значення намалювало б сторінку помилки як збій').toBeUndefined();
	});

	it('справжня помилка потрапляє в журнал разом зі шляхом', async () => {
		await call(500, new Error('boom'));

		expect(logError).toHaveBeenCalledTimes(1);
		const [category, line] = logError.mock.calls[0] as [string, string];
		expect(category).toBe('app');
		expect(line).toContain('/adoptananimal/uk/');
		expect(line).toContain('boom');
	});

	it('відвідувачу віддається порожній рядок — щоб сторінка показала СВІЙ переклад', async () => {
		const result = await call(500, new Error('Cannot read properties of undefined'));

		// Порожньо НАВМИСНО: `+error.svelte` підставляє локалізований типовий
		// текст саме на порожнє значення. Будь-який рядок звідси був би
		// неперекладеним, а `error.message` ще й показав би нутрощі рантайму.
		expect(result?.message).toBe('');
	});

	it('не-Error теж переживає нормалізацію, а не падає всередині гачка', async () => {
		await expect(call(500, 'рядок замість Error')).resolves.toBeTruthy();
		expect(logError.mock.calls[0]?.[1]).toContain('рядок замість Error');
	});
});
