import type { HandleClientError } from '@sveltejs/kit';
import { logService } from '$lib/services/logService.svelte';

/**
 * Неперехоплені помилки клієнта (ERROR-HANDLING-v8 § 2.4).
 *
 * Гачок спрацьовує лише на НЕОЧІКУВАНІ помилки: `error()` і `redirect()` через
 * нього не проходять, тож 404 сюди не потрапляє. Перевірка статусу нижче —
 * дешева перестраховка, і прибирати її не варто: без неї кожна помилкова
 * адреса крутить `errorCount` і фарбує службове табло червоним, тобто сигнал
 * «щось зламалося» починає означати «хтось помилився посиланням».
 *
 * **Тут НЕМАЄ Sentry, і це рішення, а не пропуск.** Блок ініціалізації
 * `@sentry/sveltekit` тут стояв і не працював жодного разу: пакета немає в
 * залежностях, тож імпорт писався через змінну з `@vite-ignore`, аби збірка не
 * впала на нерозв'язному модулі. У браузері голий специфікатор не резолвиться
 * в принципі, а `.catch(() => null)` ковтав це мовчки. DSN при цьому не
 * заданий ніде. OBSERVABILITY-v8 має «Пріоритет: optional» і «Скіп-якщо:
 * хобі-проєкт без активних користувачів», тож правильна відповідь — не
 * імітувати трекінг, а не мати його. Збір звітів робить `logService` і кнопка
 * копіювання на службовому таблі.
 */
export const handleError: HandleClientError = ({ error, event, status }) => {
	if (status === 404) return;

	const normalized = error instanceof Error ? error : new Error(String(error));
	logService.error(
		'app',
		`Unhandled client error at ${event?.url?.pathname ?? 'unknown route'}: ${normalized.message}`
	);

	/*
	 * Порожній рядок НАВМИСНО, а не недогляд: `+error.svelte` читає
	 * `page.error?.message || t('error.generic')`, тобто порожнє значення
	 * вмикає ПЕРЕКЛАДЕНИЙ типовий текст. Будь-який рядок звідси був би
	 * англійським у чотиримовному застосунку, а `error.message` ще й показав
	 * би відвідувачу нутрощі рантайму.
	 */
	return { message: '' };
};
