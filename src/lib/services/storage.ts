import { browser } from '$app/environment';

const PREFIX = 'adoptananimal_';

/**
 * Where the facade reports recoverable problems.
 *
 * Deliberately a hook rather than an import of logService: the logger reads its own
 * buffer through this facade, so importing it back here would make the two modules
 * depend on each other and leave whichever loaded second in the temporal dead zone.
 * logService installs the real reporter at its own module init.
 */
type Reporter = (message: string) => void;
let report: Reporter = () => {};

export const setStorageReporter = (fn: Reporter) => {
	report = fn;
};

/**
 * Storage facade to ensure isolation between multiple projects on the same domain (alik532ua.github.io).
 * Every key is automatically prefixed with 'adoptananimal_'.
 *
 * The facade never throws: quota limits, private-mode restrictions and blocked cookies
 * all surface as exceptions from the Web Storage API, and none of them is worth
 * taking the page down for. Reads fall back to null, writes are dropped.
 */
export const storage = {
	/**
	 * Gets a string value from localStorage.
	 */
	get(key: string): string | null {
		if (!browser) return null;
		try {
			return localStorage.getItem(PREFIX + key);
		} catch {
			return null;
		}
	},

	/**
	 * Sets a string value in localStorage. Returns false if the write was rejected.
	 */
	set(key: string, value: string): boolean {
		if (!browser) return false;
		try {
			localStorage.setItem(PREFIX + key, value);
			return true;
		} catch {
			return false;
		}
	},

	/**
	 * Removes a specific key from localStorage.
	 */
	remove(key: string): void {
		if (!browser) return;
		try {
			localStorage.removeItem(PREFIX + key);
		} catch {
			// nothing to recover: the key is either gone or unreachable
		}
	},

	/**
	 * Clears only the keys belonging to this project.
	 * DO NOT use localStorage.clear() as it affects all projects on the domain.
	 */
	clear(): void {
		if (!browser) return;
		try {
			const keysToRemove: string[] = [];
			for (let i = 0; i < localStorage.length; i++) {
				const key = localStorage.key(i);
				if (key?.startsWith(PREFIX)) {
					keysToRemove.push(key);
				}
			}
			keysToRemove.forEach((k) => localStorage.removeItem(k));
		} catch {
			// storage unreachable — there is nothing left to clear
		}
	},

	/**
	 * Gets and parses a JSON value from localStorage.
	 */
	getJSON<T>(key: string): T | null {
		const raw = this.get(key);
		if (raw === null) return null;
		try {
			return JSON.parse(raw) as T;
		} catch {
			// Corrupt stored data is recoverable — the caller falls back to a default —
			// but silence here once hid favourites disappearing with no trace at all.
			// warn, not error: it is a known-possible state, not a broken build.
			report(`Discarding unreadable value for "${key}"`);
			return null;
		}
	},

	/**
	 * Serializes and sets a JSON value in localStorage. Returns false if the write was rejected.
	 */
	setJSON(key: string, value: unknown): boolean {
		try {
			return this.set(key, JSON.stringify(value));
		} catch {
			return false;
		}
	},

	/**
	 * Session-scoped counterpart, same prefix and same no-throw contract.
	 */
	session: {
		get(key: string): string | null {
			if (!browser) return null;
			try {
				return sessionStorage.getItem(PREFIX + key);
			} catch {
				return null;
			}
		},

		set(key: string, value: string): boolean {
			if (!browser) return false;
			try {
				sessionStorage.setItem(PREFIX + key, value);
				return true;
			} catch {
				return false;
			}
		},

		remove(key: string): void {
			if (!browser) return;
			try {
				sessionStorage.removeItem(PREFIX + key);
			} catch {
				// nothing to recover
			}
		}
	}
};
