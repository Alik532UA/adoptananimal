import { browser } from '$app/environment';

const PREFIX = 'adoptananimal_';

/**
 * Storage facade to ensure isolation between multiple projects on the same domain (alik532ua.github.io).
 * Every key is automatically prefixed with 'adoptananimal_'.
 */
export const storage = {
	/**
	 * Gets a string value from localStorage.
	 */
	get(key: string): string | null {
		if (!browser) return null;
		return localStorage.getItem(PREFIX + key);
	},

	/**
	 * Sets a string value in localStorage.
	 */
	set(key: string, value: string): void {
		if (!browser) return;
		localStorage.setItem(PREFIX + key, value);
	},

	/**
	 * Removes a specific key from localStorage.
	 */
	remove(key: string): void {
		if (!browser) return;
		localStorage.removeItem(PREFIX + key);
	},

	/**
	 * Clears only the keys belonging to this project.
	 * DO NOT use localStorage.clear() as it affects all projects on the domain.
	 */
	clear(): void {
		if (!browser) return;
		const keysToRemove: string[] = [];
		for (let i = 0; i < localStorage.length; i++) {
			const key = localStorage.key(i);
			if (key?.startsWith(PREFIX)) {
				keysToRemove.push(key);
			}
		}
		keysToRemove.forEach((k) => localStorage.removeItem(k));
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
			return null;
		}
	},

	/**
	 * Serializes and sets a JSON value in localStorage.
	 */
	setJSON(key: string, value: unknown): void {
		this.set(key, JSON.stringify(value));
	}
};
