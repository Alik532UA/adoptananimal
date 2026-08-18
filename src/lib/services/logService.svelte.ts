import { browser, dev } from '$app/environment';
import { setStorageReporter, storage } from '$lib/services/storage';

export type LogCategory = 'app' | 'ui' | 'storage' | 'i18n' | 'network' | 'performance';
export type LogLevel = 'info' | 'warn' | 'error';

export interface LogEntry {
	timestamp: string;
	level: LogLevel;
	category: LogCategory;
	message: string;
	data?: unknown;
}

const MAX_LOGS = 1000;

/**
 * Скільки записів їде в дзеркало (DEBUGGING-v8 § 1.5: «обрізаний буфер, а не всі
 * 1000 з довільними даними»).
 *
 * Дзеркало переписується на **кожен** запис, тож повний буфер означав би
 * `JSON.stringify` тисячі об'єктів тисячу разів за сесію — квадратична робота
 * заради даних, яких у звіті все одно не буде: звіт беруть із памʼяті, а
 * дзеркало існує лише щоб пережити перезавантаження сторінки.
 */
const MIRRORED_LOGS = 200;

const LOG_KEY = 'logs';

/**
 * Поля, вміст яких не потрапляє в буфер у відкритому вигляді (DEBUGGING-v8 § 1.4).
 *
 * Список канону — `email`, `password`, `token`, `phone`, `authorization`, `cookie`
 * — плюс написання тих самих речей, під якими вони приходять із чужих API
 * (`accessToken`, `apiKey`, `secret`). Зіставлення точне, а не входженням: інакше
 * під редакцію потрапило б і `tokenCount`, тобто число, заради якого запис і
 * робили.
 */
const REDACTED_KEY =
	/^(password|passwd|token|access_?token|id_?token|refresh_?token|api_?key|secret|authorization|auth|cookie|e_?mail|phone|tel)$/i;

const REDACTED = '«приховано»';

/** Те саме для параметрів адреси, де межі слова немає: `?id_token=…`, `?api-key=…`. */
const REDACTED_PARAM = /(password|token|secret|api[-_]?key|auth|cookie|email|phone|session)/i;

/** Пошта в довільному тексті: адреса лишає перший символ і домен, решта зникає. */
function maskEmails(text: string): string {
	return text.replace(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g, (email) => {
		const [local, domain] = email.split('@');
		return `${local[0]}***@${domain}`;
	});
}

/**
 * Адреса у звіті без значень чутливих параметрів (§ 1.4). Решта query лишається:
 * саме фільтри й `?debug=1` пояснюють, що людина бачила на екрані.
 */
function maskUrl(href: string): string {
	try {
		const url = new URL(href);
		for (const key of [...url.searchParams.keys()]) {
			if (REDACTED_PARAM.test(key)) url.searchParams.set(key, REDACTED);
		}
		return maskEmails(url.toString());
	} catch {
		// Не адреса — краще віддати як є, ніж загубити рядок звіту.
		return maskEmails(href);
	}
}

/**
 * Прибирає чутливі значення перед записом — у самому логері, а не на місцях
 * виклику: досить одного забутого місця, щоб правило перестало діяти (§ 1.4).
 *
 * `Error` розкладається руками: `Object.entries(new Error('x'))` віддає порожній
 * масив, тож звичайний обхід стер би саме той текст, заради якого виняток і
 * логували.
 */
function scrub(value: unknown, seen = new WeakSet<object>()): unknown {
	if (typeof value === 'string') return maskEmails(value);
	if (value instanceof Error) {
		return { name: value.name, message: maskEmails(value.message), stack: value.stack };
	}
	if (Array.isArray(value)) return value.map((item) => scrub(item, seen));
	if (value && typeof value === 'object') {
		// Цикл у даних не має валити логер: він і так кличеться там, де вже зле.
		if (seen.has(value)) return '«цикл»';
		seen.add(value);
		return Object.fromEntries(
			Object.entries(value).map(([key, item]) => [
				key,
				REDACTED_KEY.test(key) ? REDACTED : scrub(item, seen)
			])
		);
	}
	return value;
}

class LogService {
	logs = $state<LogEntry[]>([]);
	errorCount = $state(0);

	/** Дзеркало вимикається до кінця сесії, щойно сховище відмовило (§ 1.5). */
	private mirroring = true;

	private config: Record<LogCategory, boolean> = {
		app: true,
		ui: true,
		storage: true,
		i18n: true,
		network: true,
		performance: true
	};

	constructor() {
		if (browser && dev) {
			const savedLogs = storage.session.get(LOG_KEY);
			if (savedLogs) {
				try {
					this.logs = JSON.parse(savedLogs);
					this.errorCount = this.logs.filter((l) => l.level === 'error').length;
				} catch {
					this.logs = [];
				}
			}
		}
	}

	info(category: LogCategory, message: string, data?: unknown) {
		this.addEntry('info', category, message, data);
	}

	warn(category: LogCategory, message: string, data?: unknown) {
		this.addEntry('warn', category, message, data);
	}

	error(category: LogCategory, message: string, data?: unknown) {
		this.addEntry('error', category, message, data);
	}

	perf(name: string, value: number | string, data?: unknown) {
		this.addEntry('info', 'performance', `${name}: ${value}`, data);
	}

	private addEntry(level: LogLevel, category: LogCategory, message: string, data?: unknown) {
		const entry: LogEntry = {
			timestamp: new Date().toISOString(),
			level,
			category,
			message,
			// Редакція на вході, а не на виході: буфер дзеркалиться в sessionStorage
			// і копіюється у звіт, тож «приховаю під час читання» означало б, що
			// значення вже полежало на диску відкритим.
			data: data === undefined ? undefined : scrub(data)
		};

		this.logs.push(entry);
		if (this.logs.length > MAX_LOGS) {
			this.logs.shift();
		}

		if (level === 'error') {
			this.errorCount++;
		}

		if (this.config[category]) {
			const styles = {
				info: 'color: #3b82f6',
				warn: 'color: #f59e0b',
				error: 'color: #ef4444; font-weight: bold'
			};

			if (dev || level === 'error') {
				// Masked here too: the console is copied into bug reports as often as getReport().
				// `entry.data`, not the argument: the scrubbed copy is the only one allowed
				// to leave this module (DEBUGGING-v8 § 1.4).
				console.log(
					`%c[${entry.timestamp}] [${level.toUpperCase()}] [${category.toUpperCase()}] ${maskEmails(message)}`,
					styles[level],
					entry.data ?? ''
				);
			}
		}

		this.persist();
	}

	// Persisted only in dev: in production the buffer lives for the session, which is
	// what a report describes anyway, and sessionStorage would carry noise across reloads.
	private persist() {
		if (!browser || !dev || !this.mirroring) return;

		if (storage.session.set(LOG_KEY, JSON.stringify(this.logs.slice(-MIRRORED_LOGS)))) return;

		// The facade turns a full quota into `false` rather than an exception, so the
		// only way to notice is to read it. Retrying on every entry afterwards costs a
		// serialisation of the whole buffer per log line and never succeeds
		// (DEBUGGING-v8 § 1.5): losing the mirror is acceptable, the app is not.
		this.mirroring = false;
		this.warn('storage', 'Session mirror is full — logs stay in memory only');
	}

	getReport(): string {
		const header = [
			'--- LOG REPORT ---',
			// ISO, not toLocaleString(): a report is read by a developer, not by the
			// user's locale, and an unqualified toLocaleString() differs per machine.
			`DATE: ${new Date().toISOString()}`,
			`VERSION: v${__APP_VERSION__}`,
			`URL: ${browser ? maskUrl(window.location.href) : 'N/A'}`,
			`UA: ${browser ? navigator.userAgent : 'N/A'}`,
			// DEBUGGING-v8 § 2.3: половина звітів «нічого не працює» пояснюється
			// саме цим рядком, і дізнатися його заднім числом уже неможливо.
			`ONLINE: ${browser ? navigator.onLine : 'N/A'}`,
			'---'
		].join('\n');

		const body = this.logs
			.map(
				(l) =>
					`[${l.timestamp}] [${l.level.toUpperCase()}] [${l.category.toUpperCase()}] ${maskEmails(l.message)}`
			)
			.join('\n');

		return `${header}\n${body}`;
	}

	clear() {
		this.logs = [];
		this.errorCount = 0;
		storage.session.remove(LOG_KEY);
	}
}

export const logService = new LogService();

// Lets the storage facade report a discarded value without importing this module back.
setStorageReporter((message) => logService.warn('storage', message));
