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
const LOG_KEY = 'logs';

class LogService {
	logs = $state<LogEntry[]>([]);
	errorCount = $state(0);

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
			data
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
				console.log(
					`%c[${entry.timestamp}] [${level.toUpperCase()}] [${category.toUpperCase()}] ${this.maskPII(message)}`,
					styles[level],
					data || ''
				);
			}
		}

		this.persist();
	}

	// Persisted only in dev: in production the buffer lives for the session, which is
	// what a report describes anyway, and sessionStorage would carry noise across reloads.
	private persist() {
		if (browser && dev) {
			storage.session.set(LOG_KEY, JSON.stringify(this.logs));
		}
	}

	/**
	 * Masks sensitive data like emails in the log message.
	 */
	private maskPII(message: string): string {
		return message.replace(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g, (email) => {
			const [local, domain] = email.split('@');
			return `${local[0]}***@${domain}`;
		});
	}

	getReport(): string {
		const header = [
			'--- LOG REPORT ---',
			// ISO, not toLocaleString(): a report is read by a developer, not by the
			// user's locale, and an unqualified toLocaleString() differs per machine.
			`DATE: ${new Date().toISOString()}`,
			`VERSION: v${__APP_VERSION__}`,
			`URL: ${browser ? window.location.href : 'N/A'}`,
			`UA: ${browser ? navigator.userAgent : 'N/A'}`,
			'---'
		].join('\n');

		const body = this.logs
			.map(
				(l) =>
					`[${l.timestamp}] [${l.level.toUpperCase()}] [${l.category.toUpperCase()}] ${this.maskPII(l.message)}`
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
